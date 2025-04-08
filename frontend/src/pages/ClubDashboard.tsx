import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { useEffect, useState } from "react";
import { ClubData } from "../types/responses/ClubData";
import { Member } from "../types/Member";
import { ClubType } from "../types/ClubType";
import { AuditLog } from "../types/AuditLog";
import { Ticket } from "../types/responses/TicketData";
import { PromoCode } from "../types/responses/PromoCode";
import { Transaction } from "../types/responses/Transaction";
import { isAuthenticated } from "../utils/auth";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmDialog from "../components/ConfirmDialog";

const ClubDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "memberlist"
  );
  const [data, setData] = useState<
    Omit<ClubData, "ismember" | "hasPending" | "Tickets">
  >({
    Club: {
      id: 0,
      name: "",
      email: "",
      description: "",
      shortdescription: "",
      image: "",
      headerimage: "",
      popularity: 0,
      university: "",
      clubtype: ClubType.SOCIETY,
      ratio: 0,
    },
    MemberList: [],
    AuditLog: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const studentCount =
    data.MemberList.filter((member: Member) => member.studentnumber).length ||
    0;
  const associateCount =
    data.MemberList.filter((member: Member) => !member.studentnumber).length ||
    0;
  const totalMembers = studentCount + associateCount;

  const moneyIn = transactions
    .filter((transaction: Transaction) => transaction.transactiontype)
    .reduce((sum, transaction) => sum + +transaction.amount, 0);

  const moneyOut = transactions
    .filter((transaction: Transaction) => !transaction.transactiontype)
    .reduce((sum, transaction) => sum + +transaction.amount, 0);

  const links = [
    { label: "Home", href: "/" },
    { label: "Browse Clubs", href: "/clubs" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
  ];

  const cta = (
    <>
      {isAuthenticated() ? (
        <a
          href="/dashboard"
          className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
        >
          Dashboard
        </a>
      ) : (
        <a
          href="/login"
          className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
        >
          Login
        </a>
      )}
      <a
        href="/clubs"
        className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 w-full md:w-auto"
      >
        Join a Club
      </a>
    </>
  );

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch club data");
        }
        const data = await response.json();
        setTickets(data.Tickets);
        delete data.Tickets;
        setCodes(data.Promo);
        delete data.Promo;
        setTransactions(data.Transactions);
        delete data.Transactions;
        setData(data);
      } catch (err) {
        console.error("Failed to fetch club data:", err); // eslint-disable-line no-console
        setError("An error occurred while fetching club details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to download the CSV.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/payments/${id}/transactions/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `club_${id}_transactions.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err); // eslint-disable-line no-console
      setNotification({ type: "error", message: "Failed to export CSV" });
    }
  };

  const filteredLogs = data.AuditLog.filter((log: AuditLog) => {
    const searchLower = auditSearch.toLowerCase();

    return (
      log.id.toString().includes(searchLower) ||
      (log.member && log.member.toLowerCase().includes(searchLower)) ||
      (log.user && log.user.toLowerCase().includes(searchLower)) ||
      (log.actiontype && log.actiontype.toLowerCase().includes(searchLower)) ||
      (log.created_at &&
        new Date(log.created_at)
          .toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .toLowerCase()
          .includes(searchLower))
    );
  });

  const filteredTransactions = transactions.filter(
    (transaction: Transaction) => {
      const searchLower = transactionSearch.toLowerCase();
      const transType = transaction.transactiontype ? "IN" : "OUT";

      return (
        transaction.id.toString().includes(searchLower) ||
        (transaction.memberid &&
          transaction.memberid
            .toString()
            .toLowerCase()
            .includes(searchLower)) ||
        (transaction.amount &&
          transaction.amount.toString().toLowerCase().includes(searchLower)) ||
        (transType && transType.toLowerCase().includes(searchLower)) ||
        (transaction.promocode &&
          transaction.promocode.toString().includes(searchLower)) ||
        (transaction.status &&
          transaction.status.toLowerCase().includes(searchLower)) ||
        (transaction.ticketid &&
          transaction.ticketid
            .toString()
            .toLowerCase()
            .includes(searchLower)) ||
        (transaction.type &&
          transaction.type.toLowerCase().includes(searchLower)) ||
        (transaction.type &&
          transaction.type.toLowerCase().includes(searchLower)) ||
        (transaction.time &&
          new Date(transaction.time)
            .toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            .toLowerCase()
            .includes(searchLower)) ||
        (transaction.updated_at &&
          new Date(transaction.updated_at)
            .toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            .toLowerCase()
            .includes(searchLower))
      );
    }
  );

  const calculateTotal = (value: number, bookingfee: boolean) => {
    if (bookingfee) {
      const price = +value;
      const total = price + price * 0.1;
      return total.toFixed(2);
    } else {
      const price = +value;
      const total = price - price * 0.1;
      return total.toFixed(2);
    }
  };

  const handleCodeChange = (
    codeId: number,
    field: keyof PromoCode,
    value: unknown
  ) => {
    setCodes((prevCode) =>
      prevCode.map((code) =>
        code.id === codeId ? { ...code, [field]: value } : code
      )
    );
  };

  const saveCodeChange = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const code = codes.find((code) => code.id === id);

    if (!code) {
      setNotification({
        type: "error",
        message: "Something went wrong, please try again!",
      });
      return;
    }

    if (code.discount < 0.05) {
      setNotification({
        type: "error",
        message:
          "The minimum discount allowed is 5%, please fix this and try again!",
      });
      return;
    }

    if (code.expirydate) {
      const dateChange = new Date(code.expirydate);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      dateChange.setHours(0, 0, 0, 0);

      if (today > dateChange) {
        setNotification({
          type: "error",
          message: "You cannot set the code date to be in the past!",
        });
        return;
      }
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/tickets/code/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      }
    );

    if (response.ok) {
      setNotification({
        type: "success",
        message: "Promo Code Successfully Updated",
      });
      navigate(0);
    }
    setNotification({
      type: "error",
      message:
        "There was an error updating teh promo code, please try again later!",
    });
    navigate(0);
  };

  const deleteCode = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/tickets/code/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      }
    );

    if (response.ok) {
      setNotification({
        type: "success",
        message: "Promo Code Successfully Deleted",
      });
      navigate(0);
    } else {
      setNotification({
        type: "error",
        message:
          "There was an error deleting the promo code, please try again later",
      });
      navigate(0);
    }
  };

  const addPromoCode = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/tickets/code/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clubId: id }),
      }
    );

    if (response.ok) {
      setNotification({
        type: "success",
        message: "Successfully added promo code",
      });
      navigate(0);
    } else {
      setNotification({
        type: "error",
        message:
          "There was an error adding the promo code, please try again later!",
      });
      navigate(0);
    }
  };

  const handleTicketChange = (
    ticketId: number,
    field: keyof Ticket,
    value: unknown
  ) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  const saveTicketChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    let badElement = false;
    for (const ticket of tickets) {
      if (ticket.price < 2) {
        setNotification({
          type: "error",
          message:
            "The minimum ticket pric eis £2, please fix this and try again!",
        });
        badElement = true;
        break;
      }
      const dateChange = new Date(ticket.date);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      dateChange.setHours(0, 0, 0, 0);

      if (today >= dateChange) {
        setNotification({
          type: "error",
          message: "You cannot set the ticket date to be in the past or today!",
        });
        badElement = true;
        break;
      }
    }

    if (badElement) {
      return;
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/tickets/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tickets }),
      }
    );

    if (response.ok) {
      setNotification({
        type: "success",
        message: "Ticket's updated successfully!",
      });
      navigate("?tab=membership");
    } else {
      setNotification({
        type: "error",
        message:
          "There was an error updating the memberships, please try again later!",
      });
      navigate("?tab=membership");
    }
  };

  const expireMember = async (memberId: number) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({
          type: "error",
          message: "You must be logged in to do this action",
        });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/expire`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ memberId }),
        }
      );

      if (response.ok) {
        setNotification({ type: "success", message: "Membership Expired" });
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        setNotification({
          type: "error",
          message: "Failed to expire membership",
        });
      }
    } catch (err) {
      console.error("Error Expiring Member: ", err); // eslint-disable-line no-console
    }
  };

  const activateMember = async (memberId: number) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({
          type: "error",
          message: "You must be logged in to do this action",
        });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ memberId }),
        }
      );

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Member activated successfully!",
        });
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        setNotification({
          type: "error",
          message: "Failed to activate member",
        });
      }
    } catch (err) {
      console.error("Error activating member: ", err); // eslint-disable-line no-console
    }
  };

  const checkAllBoxes = (checked: boolean) => {
    const filteredMembers = data.MemberList.filter((member: Member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (checked === false) {
      setSelectedMemberIds([]);
    } else {
      const filteredMemberIds = filteredMembers.map(
        (member) => member.memberid
      );
      filteredMemberIds.forEach((id) => {
        if (!selectedMemberIds.includes(id)) {
          setSelectedMemberIds((prev) => [...prev, id]);
        }
      });
    }
  };

  const handleKick = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({
          type: "error",
          message: "You must be logged in to do this action",
        });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/kick`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        setNotification({
          type: "error",
          message: "Member removed successfully",
        });
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        setNotification({
          type: "error",
          message: "Failed to remove the member",
        });
      }
    } catch (err) {
      console.error("Error removing member:", err); // eslint-disable-line no-console
      setNotification({
        type: "error",
        message: "An error occured while trying to remove the member",
      });
    }
  };

  const handleBulkActivate = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({
          type: "error",
          message: "You must be logged in to do this action",
        });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/activate/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ members: selectedMemberIds }),
        }
      );

      if (response.ok) {
        const { amount } = await response.json();
        setNotification({
          type: "success",
          message: `Successfully activated ${amount} members`,
        });
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        setNotification({
          type: "error",
          message: "Internal Server Error, please try again!",
        });
      }
    } catch (err) {
      console.error("Error activating members: ", err); // eslint-disable-line no-console
      setNotification({
        type: "error",
        message: "An error occured whilst trying to activate members",
      });
    }
  };

  const handleBulkExpire = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({
          type: "error",
          message: "You must be logged in to do this action",
        });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/expire/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ members: selectedMemberIds }),
        }
      );

      if (response.ok) {
        const { amount } = await response.json();
        setNotification({
          type: "success",
          message: `Successfully expired ${amount} members`,
        });
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        setNotification({
          type: "error",
          message: "Internal Server Error, please try again",
        });
      }
    } catch (err) {
      console.error("Error expiring members: ", err); // eslint-disable-line no-console
      setNotification({
        type: "error",
        message: "An error occured whilst trying to expire members",
      });
    }
  };

  const handleBulkRemove = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({
          type: "error",
          message: "You must be logged in to do this action",
        });
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/remove/bulk`
      );

      if (response.ok) {
        const { amount } = await response.json();
        setNotification({
          type: "success",
          message: `Successfully removed ${amount} members`,
        });
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        setNotification({
          type: "error",
          message: "Internal Server Error, please try again",
        });
      }
    } catch (err) {
      console.error("Error removing members: ", err); // eslint-disable-line no-console
      setNotification({
        type: "error",
        message: "An error occured whilst trying to remove members",
      });
    }
  };

  return (
    <div>
      <Navbar cta={cta} links={links} />
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {confirmDialog?.open && (
        <ConfirmDialog
          open={confirmDialog.open}
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      <div className="bg-blue-50 w-full">
        <TitleSection
          title={data?.Club.name || "Club Details"}
          subtitle={data?.Club.shortdescription || "Manage your club"}
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
            <p className="ml-4 text-blue-500">Loading club details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md max-w-lg">
            <h3 className="font-bold text-lg">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="overflow-x-auto border-b mb-6">
            <nav className="flex space-x-6 whitespace-nowrap px-4 sm:px-0">
              {[
                { key: "memberlist", label: "Member List" },
                { key: "clubdetails", label: "Club Details" },
                { key: "auditlog", label: "Audit Log" },
                { key: "membership", label: "Membership" },
                { key: "promo", label: "Promo Codes" },
                { key: "transactions", label: "Transactions" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`pb-2 text-sm sm:text-base border-b-2 ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600 font-medium"
                      : "border-transparent text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => {
                    navigate(`?tab=${tab.key}`);
                    setActiveTab(tab.key);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            {activeTab === "memberlist" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Member List</h2>
                <div className="overflow-x-auto">
                  <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-md mb-6 min-w-[300px]">
                    <div
                      className="absolute h-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${(studentCount / totalMembers) * 100}%`,
                      }}
                    >
                      {Math.round((studentCount / totalMembers) * 100)}%
                    </div>

                    <div
                      className="absolute h-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        left: `${(studentCount / totalMembers) * 100}%`,
                        width: `${(associateCount / totalMembers) * 100}%`,
                      }}
                    >
                      {Math.round((associateCount / totalMembers) * 100)}%
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Search members by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        disabled={!(selectedMemberIds.length > 0)}
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            message: `Are you sure you want to activate ${selectedMemberIds.length} members`,
                            onConfirm: () => handleBulkActivate,
                          })
                        }
                        className={`w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                          !(selectedMemberIds.length > 0)
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        Activate
                      </button>
                      <button
                        disabled={!(selectedMemberIds.length > 0)}
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            message: `Are you sure you want to expire ${selectedMemberIds.length} members`,
                            onConfirm: () => handleBulkExpire,
                          })
                        }
                        className={`w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ${
                          !(selectedMemberIds.length > 0)
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        Expire
                      </button>
                      <button
                        disabled={!(selectedMemberIds.length > 0)}
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            message: `Are you sure you want to remove ${selectedMemberIds.length} members`,
                            onConfirm: () => handleBulkRemove,
                          })
                        }
                        className={`w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${
                          !(selectedMemberIds.length > 0)
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {data.MemberList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm bg-white border border-gray-200 shadow-md rounded-lg">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                id="master-checkbox"
                                className={`w-5 h-5 border-2 rounded bg-gray-200 border-gray-300`}
                                onChange={(e) =>
                                  checkAllBoxes(e.target.checked)
                                }
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Member Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Active
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.MemberList.filter((member: Member) =>
                            member.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          ).map((member: Member, index: number) => (
                            <tr
                              key={member.memberid}
                              className={`${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              } border-b border-gray-200`}
                            >
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <input
                                  id="user-checkbox"
                                  type="checkbox"
                                  checked={selectedMemberIds.includes(
                                    member.memberid
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMemberIds((prev) => [
                                        ...prev,
                                        member.memberid,
                                      ]);
                                    } else {
                                      setSelectedMemberIds((prev) =>
                                        prev.filter(
                                          (id) => id !== member.memberid
                                        )
                                      );
                                    }
                                  }}
                                  className={`w-5 h-5 border-2 rounded bg-gray-200 border-gray-300`}
                                />
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {member.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {member.membertype || "Member"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(member.created_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.studentnumber
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {member.studentnumber
                                    ? "Student"
                                    : "Associate"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <input
                                  type="checkbox"
                                  checked={member.status === "Active"}
                                  className={`w-5 h-5 border-2 rounded ${
                                    member.status
                                      ? "bg-blue-500 border-blue-500"
                                      : "bg-gray-200 border-gray-300"
                                  } cursor-not-allowed`}
                                />
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {(member.status === "Pending" ||
                                  member.status === "Expired") && (
                                  <button
                                    onClick={() =>
                                      setConfirmDialog({
                                        open: true,
                                        message:
                                          "Are you sure you want to activate this member?",
                                        onConfirm: () =>
                                          activateMember(member.memberid),
                                      })
                                    }
                                    className="px-4 py-2 mr-4 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Activate
                                  </button>
                                )}
                                {member.status === "Active" && (
                                  <button
                                    onClick={() =>
                                      setConfirmDialog({
                                        open: true,
                                        message:
                                          "Are you sure you want expire this member?",
                                        onConfirm: () =>
                                          expireMember(member.memberid),
                                      })
                                    }
                                    className="px-4 py-2 mr-4 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                  >
                                    Expire
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setConfirmDialog({
                                      open: true,
                                      message:
                                        "Are you sure you want to remove this member?",
                                      onConfirm: () =>
                                        handleKick(member.memberid),
                                    })
                                  }
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No members found.</p>
                  )}
                </div>
              </div>
            )}
            {activeTab === "clubdetails" && (
              <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Edit Club Details
                </h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const token = localStorage.getItem("token");
                      if (!token)
                        throw new Error(
                          "You must be logged in to update club details."
                        );

                      let imageUrl = data.Club.image;
                      let headerImageUrl = data.Club.headerimage;

                      const headerFileInput = document.getElementById(
                        "headerImageFile"
                      ) as HTMLInputElement;
                      const imageFileInput = document.getElementById(
                        "imageFile"
                      ) as HTMLInputElement;

                      const formData = new FormData();
                      formData.append("clubId", id || "");

                      if (headerFileInput?.files?.[0]) {
                        formData.append(
                          "headerImage",
                          headerFileInput.files[0]
                        );
                      }
                      if (imageFileInput?.files?.[0]) {
                        formData.append("image", imageFileInput.files[0]);
                      }

                      const uploadResponse = await fetch(
                        `${process.env.REACT_APP_API_URL}/clubs/upload`,
                        {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                          body: formData,
                        }
                      );

                      if (uploadResponse.ok) {
                        const result = await uploadResponse.json();
                        imageUrl = result.imageUrl;
                        headerImageUrl = result.headerImageUrl;
                      } else {
                        throw new Error("Failed to upload the image.");
                      }

                      const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/clubs/${id}/edit`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            name: data.Club.name,
                            description: data.Club.description,
                            shortdescription: data.Club.shortdescription,
                            email: data.Club.email,
                            headerimage:
                              headerImageUrl || data.Club.headerimage,
                            image: imageUrl || data.Club.image,
                          }),
                        }
                      );

                      if (response.ok) {
                        setNotification({
                          type: "success",
                          message: "Club details updated successfully",
                        });
                      } else {
                        const result = await response.json();
                        throw new Error(
                          result.message || "Failed to update club details."
                        );
                      }
                    } catch (error: unknown) {
                      console.error("Error updating club details:", error); // eslint-disable-line no-console
                      setNotification({
                        type: "error",
                        message: "Error updating club details",
                      });
                    }
                  }}
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={data.Club.description || ""}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Club: { ...data.Club, description: e.target.value },
                          })
                        }
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={data.Club.shortdescription || ""}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Club: {
                              ...data.Club,
                              shortdescription: e.target.value,
                            },
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Image
                      </label>
                      <input
                        type="file"
                        id="headerImageFile"
                        accept="image/*"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {data.Club.headerimage && (
                        <img
                          src={data.Club.headerimage}
                          alt="Header Preview"
                          className="mt-4 w-full h-40 object-cover rounded-md shadow-sm"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {data.Club.image && (
                        <img
                          src={data.Club.image}
                          alt="Club Preview"
                          className="mt-4 w-full h-40 object-cover rounded-md shadow-sm"
                        />
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => navigate(`/club/${id}`)}
                        type="button"
                        className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-blue-600 border border-blue-500 rounded-md hover:bg-blue-50 transition"
                      >
                        View Club Page &raquo;
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            {activeTab === "auditlog" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Audit Log</h2>
                <input
                  type="text"
                  placeholder="Search audit log..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />

                {filteredLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[600px] w-full bg-white border border-gray-200 shadow-md rounded-lg">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Target
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Committee
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Action
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log, index) => (
                          <tr
                            key={index}
                            className={`$${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } border-b border-gray-200`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {log.member || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {log.user || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {log.actiontype || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {new Date(log.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No logs found.</p>
                )}
              </div>
            )}

            {activeTab === "membership" && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Membership
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                        <th className="px-4 py-3 text-left">Ticket ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Ticket Flag</th>
                        <th className="px-4 py-3 text-left">Price</th>
                        <th className="px-4 py-3 text-left">Expiry</th>
                        <th className="px-4 py-3 text-center">Allow Cash</th>
                        <th className="px-4 py-3 text-center">Booking Fee</th>
                        <th className="px-4 py-3 text-center">
                          Final Date of Purchase
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets
                        .filter((ticket: Ticket) =>
                          ticket.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((ticket: Ticket, index: number) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } border-b`}
                          >
                            <td className="px-4 py-3 text-gray-800">
                              {ticket.id}
                            </td>
                            <td className="px-4 py-3 text-gray-800">
                              {ticket.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-800">
                              {ticket.ticketflag || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-800">
                              <input
                                type="text"
                                className="w-24 px-2 py-1 border border-gray-300 rounded-md mb-1"
                                defaultValue={ticket.price?.toString() || ""}
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                              <div className="text-xs text-gray-500">
                                {ticket.bookingfee
                                  ? `Total = £${calculateTotal(
                                      ticket.price,
                                      true
                                    )}`
                                  : `You get = £${calculateTotal(
                                      ticket.price,
                                      false
                                    )}`}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                defaultValue={ticket.ticketexpiry}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.id,
                                    "ticketexpiry",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="Academic">Academic Year</option>
                                <option value="Yearly">Yearly</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5"
                                checked={ticket.cashenabled}
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.id,
                                    "cashenabled",
                                    e.target.checked
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5"
                                checked={ticket.bookingfee}
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.id,
                                    "bookingfee",
                                    e.target.checked
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="date"
                                className="px-2 py-1 border border-gray-300 rounded-md"
                                value={ticket.date}
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.id,
                                    "date",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-start">
                  <button
                    onClick={saveTicketChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            {activeTab === "promo" && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Promo Codes
                  </h2>
                  <button
                    onClick={addPromoCode}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Add Promo Code
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[950px] w-full bg-white border border-gray-200 shadow-md rounded-lg text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Code</th>
                        <th className="px-4 py-3 text-left">Discount</th>
                        <th className="px-4 py-3 text-left">Max Uses</th>
                        <th className="px-4 py-3 text-left">Expiry</th>
                        <th className="px-4 py-3 text-left">Related Ticket</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes
                        .filter((code: PromoCode) =>
                          code.code
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((code: PromoCode, index: number) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } border-b`}
                          >
                            <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                              {code.id}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                                defaultValue={code.code || ""}
                                placeholder="Enter code"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                                  defaultValue={
                                    (code.discount * 100).toString() || ""
                                  }
                                  onChange={(e) =>
                                    handleCodeChange(
                                      code.id,
                                      "discount",
                                      e.target.value
                                    )
                                  }
                                />
                                <span className="text-gray-600">%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                                defaultValue={code.maxuse.toString() || ""}
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="date"
                                className="w-40 px-2 py-1 border border-gray-300 rounded-md"
                                value={code.expirydate}
                                onChange={(e) =>
                                  handleCodeChange(
                                    code.id,
                                    "expirydate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <select
                                defaultValue={code.ticketid}
                                className="w-48 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
                                onChange={(e) =>
                                  handleCodeChange(
                                    code.id,
                                    "ticketid",
                                    e.target.value
                                  )
                                }
                              >
                                {tickets.map(
                                  (ticket: Ticket, index: number) => (
                                    <option key={index} value={+ticket.id}>
                                      {ticket.name}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => saveCodeChange(code.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmDialog({
                                      open: true,
                                      message:
                                        "Are you sure you want to delete this code?",
                                      onConfirm: () => deleteCode(code.id),
                                    })
                                  }
                                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === "transactions" && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Transactions
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => exportCSV()}
                      className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Export to CSV
                    </button>
                    <button
                      onClick={() => navigate(`/transactions/${id}/new`)}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      + Add Transaction
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-green-500">
                    <h3 className="text-lg font-bold text-gray-700">
                      Money In
                    </h3>
                    <p className="text-3xl font-semibold text-green-600">
                      +£{moneyIn.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-gray-700">
                      Money Out
                    </h3>
                    <p className="text-3xl font-semibold text-red-600">
                      -£{moneyOut.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-gray-700">
                      Estimated Balance
                    </h3>
                    <p
                      className={`text-3xl font-semibold ${
                        moneyIn - moneyOut >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      £{(moneyIn - moneyOut).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full bg-white border border-gray-200 shadow-md rounded-lg text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                          <th className="px-4 py-3 text-left">ID</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Member ID</th>
                          <th className="px-4 py-3 text-left">Ticket ID</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Method</th>
                          <th className="px-4 py-3 text-left">Promo Code</th>
                          <th className="px-4 py-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(
                          (transaction: Transaction, index: number) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              } border-b`}
                            >
                              <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                                {transaction.id || "Member"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {transaction.transactiontype ? "IN" : "OUT"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {transaction.memberid || "Member"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {transaction.ticketid || "Committee"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                £{transaction.amount || "0.00"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {transaction.status || "pending"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {transaction.type}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {transaction.promocode || "N/a"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {new Date(transaction.time).toLocaleDateString(
                                  "en-GB",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No transactions found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDashboard;
