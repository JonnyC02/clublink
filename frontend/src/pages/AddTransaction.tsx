import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ticket } from "../types/responses/TicketData";
import { PromoCode } from "../types/responses/PromoCode";
import { Member } from "../types/Member";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const AddTransaction = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("IN");
  const [method, setMethod] = useState("Cash");
  const [tickets, setTickets] = useState<Ticket[]>();
  const [selectedTicket, setSelectedTicket] = useState<string>();
  const [promo, setPromo] = useState<PromoCode[]>();
  const [selectedPromo, setSelectedPromo] = useState<string>();
  const [members, setMembers] = useState<Member[]>();
  const [selectedMember, setSelectedMember] = useState<string>();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const { MemberList, Tickets, Promo } = await response.json();
        setMembers(MemberList);
        setTickets(Tickets);
        setPromo(Promo);
      } catch (err) {
        console.error("Error fetching data: ", err); // eslint-disable-line no-console
        setErrorMessage(
          "Failed to load transaction data. Please try again later."
        );
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");
    if (!token) return;

    const newTransaction = {
      id,
      amount: parseFloat(amount),
      transactiontype: type === "IN",
      method,
      ticket: selectedTicket,
      promo: selectedPromo,
      member: selectedMember,
    };

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/payments/transaction/new`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      }
    );

    if (response.ok) {
      setSuccessMessage("Transaction added successfully!");
      setTimeout(
        () => navigate(`/club/${id}/committee?tab=transactions`),
        1200
      );
    } else {
      setErrorMessage("Error adding transaction. Please try again.");
    }
  };

  const ticketOptions = tickets?.map((ticket) => ({
    value: `${ticket.id}`,
    label: `${ticket.id} - ${ticket.name}`,
  }));

  const promoOptions = promo?.map((code) => ({
    value: `${code.id}`,
    label: `${code.id} - ${code.code}`,
  }));

  const memberOptions = members?.map((member) => ({
    value: `${member.memberid}`,
    label: `${member.memberid} - ${member.name}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:underline"
        >
          <FontAwesomeIcon icon={faArrowLeft as IconProp} className="mr-2" />
          Go Back
        </button>

        <div className="flex items-center mb-6">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-3 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Add New Transaction
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="IN">Money In</option>
                <option value="OUT">Money Out</option>
              </select>
            </div>

            <div className="w-1/2">
              <label className="block font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Ticket
            </label>
            <Select
              options={ticketOptions}
              value={ticketOptions?.find(
                (option) => option.value === selectedTicket
              )}
              onChange={(option) => setSelectedTicket(option?.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select a Ticket"
              isSearchable
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Promo Code
            </label>
            <Select
              options={promoOptions}
              value={promoOptions?.find(
                (option) => option.value === selectedPromo
              )}
              onChange={(option) => setSelectedPromo(option?.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select a Promo Code"
              isSearchable
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Member
            </label>
            <Select
              options={memberOptions}
              value={memberOptions?.find(
                (option) => option.value === selectedMember
              )}
              onChange={(option) => setSelectedMember(option?.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select a Member"
              isSearchable
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
          >
            Submit Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
