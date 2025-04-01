import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ticket } from "../types/responses/TicketData";
import { PromoCode } from "../types/responses/PromoCode";
import { Member } from "../types/Member";
import Select from "react-select";

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
        setErrorMessage("Failed to load transaction data.");
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
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>

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

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Amount:</label>
        <input
          type="number"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block mb-2">Type:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="IN">Money In</option>
          <option value="OUT">Money Out</option>
        </select>

        <label className="block mb-2">Method:</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
        </select>

        <label className="block mb-2">Select Ticket:</label>
        <Select
          options={ticketOptions}
          value={ticketOptions?.find(
            (option) => option.value === selectedTicket
          )}
          onChange={(option) => setSelectedTicket(option?.value)}
          className="mb-4"
          placeholder="-- Select a Ticket --"
          isSearchable
        />

        <label className="block mb-2">Select Promo Code:</label>
        <Select
          options={promoOptions}
          value={promoOptions?.find((option) => option.value === selectedPromo)}
          onChange={(option) => setSelectedPromo(option?.value)}
          className="mb-4"
          placeholder="-- Select a Promo Code --"
          isSearchable
        />

        <label className="block mb-2">Select Member:</label>
        <Select
          options={memberOptions}
          value={memberOptions?.find(
            (option) => option.value === selectedMember
          )}
          onChange={(option) => setSelectedMember(option?.value)}
          className="mb-4"
          placeholder="-- Select a Member --"
          isSearchable
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Submit Transaction
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
