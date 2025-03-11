import { useNavigate, useParams } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { isAuthenticated } from "../utils/auth";
import { Ticket } from "../types/responses/TicketData";

const Checkout = () => {
  const { id } = useParams();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState<number>();
  const [discountAmt, setDiscountAmt] = useState<number>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ticket, setTicket] = useState<Ticket>();
  const ticketPrice = Number(ticket?.price) || 0;
  const [total, setTotal] = useState<number>();

  const paymentFee = Number((ticketPrice * 0.1).toFixed(2));
  const [payInCash, setPayInCash] = useState(false);
  const totalPrice = Number((ticketPrice + paymentFee).toFixed(2));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/tickets/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch ticket data");

        const data: Ticket = await response.json();
        setTicket(data);
      } catch (err) {
        setError("Failed to fetch ticket data");
        console.error(err); // eslint-disable-line no-console
      }
    };

    fetchTicketData();
  }, [id]);

  const navDash = () => {
    navigate("/dashboard");
  };

  const validatePromo = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/tickets/code/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: promo, ticketId: id }),
      }
    );

    if (response.ok) {
      const { discount } = await response.json();
      const newAmt = totalPrice * discount;
      if (discount) {
        setTotal(newAmt);
        setDiscountAmt(totalPrice - newAmt);
        setDiscount(discount);
      }
    } else {
      const { message } = await response.json();
      setError(message);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate(`/login?redirect=/payment/${id}`);
        return;
      }

      if (payInCash) {
        try {
          setSuccess(true);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Error processing cash payment."
          );
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!stripe || !elements) {
        setError("Stripe.js has not loaded. Please try again.");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");
      const paymentResp = await fetch(
        `${process.env.REACT_APP_API_URL}/payments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({
            amount: ticketPrice,
            desc: ticket?.name,
            id: ticket?.id,
            promo,
          }),
        }
      );
      const { clientSecret, message } = await paymentResp.json();
      if (!paymentResp.ok) {
        if (message === "Token has expired") {
          navigate(`/login?redirect=/payment/${id}`);
          return;
        }
      }

      const { error: paymentError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (paymentError)
        throw new Error(
          paymentError.message || "Payment failed. Please try again."
        );
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing your payment. If this persists, please contact your card issuer."
      );
      console.error(err); // eslint-disable-line no-console
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar
        brandName="ClubLink"
        links={[
          { label: "Home", href: "/" },
          { label: "Browse Clubs", href: "/clubs" },
          { label: "Browse Events", href: "/events" },
          { label: "About", href: "/about" },
        ]}
        cta={
          <>
            {isAuthenticated() ? (
              <a
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Login
              </a>
            )}
            <a
              href="/clubs"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Join a Club
            </a>
          </>
        }
      />

      <TitleSection
        title="Complete Your Payment"
        subtitle="Securely process your payment below."
      />

      <div className="container mx-auto p-6">
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
          {success ? (
            <div className="text-center text-green-600">
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p>
                {payInCash
                  ? "Your ticket has been reserved for cash payment."
                  : "Thank you for your payment. You will receive a confirmation email shortly."}
              </p>
              <button
                onClick={navDash}
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
              >
                Continue to Dashboard &gt;&gt;
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Payment Information
              </h2>

              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                  </svg>
                  Your Ticket
                </h3>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-600 font-medium">Ticket:</span>
                    <span className="col-span-2 text-gray-800">
                      {ticket?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-600 font-medium">
                      Ticket Price:
                    </span>
                    <span className="col-span-2 text-gray-800">
                      £{ticketPrice.toFixed(2)}
                    </span>
                  </div>
                  {!payInCash && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-600 font-medium">
                          Payment Fee:
                        </span>
                        <span className="col-span-2 text-gray-800">
                          £{paymentFee.toFixed(2)}
                        </span>
                      </div>
                      {discount && (
                        <div className="grid grid-cols-3 gap-4">
                          <span className="text-gray-600 font-medium">
                            Promo: ({discount * 100}%):
                          </span>
                          <span className="col-span-2 text-gray-800">
                            -£{discountAmt?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4 font-semibold">
                        <span className="text-gray-600 font-medium">
                          Total:
                        </span>
                        <span className="col-span-2 text-gray-800">
                          £{total ? total?.toFixed(2) : totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {ticket?.cashenabled && (
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={payInCash}
                      onChange={() => setPayInCash(!payInCash)}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Pay in Cash</span>
                  </label>
                </div>
              )}

              {!payInCash && (
                <div className="mb-4">
                  <label
                    htmlFor="promo-input"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Promo Code:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="promo-input"
                      type="text"
                      placeholder="Enter Promo Code..."
                      onChange={(e) => setPromo(e.target.value)}
                      defaultValue={promo}
                      className="w-40 px-2 py-1 border border-gray-300 rounded
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={validatePromo}
                      type="submit"
                      className="bg-blue-500 text-white py-2 px-4 rounded
                   hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      Add Promo
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handlePayment} data-testid="payment-form">
                {!payInCash && (
                  <div className="mb-4">
                    <label
                      htmlFor="card-element"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Details:
                    </label>
                    <div className="p-2 border border-gray-300 rounded-md">
                      <CardElement
                        id="card-element"
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#32325d",
                              "::placeholder": { color: "#aab7c4" },
                            },
                            invalid: { color: "#fa755a" },
                          },
                          hidePostalCode: true,
                          disableLink: true,
                        }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading
                    ? "Processing..."
                    : payInCash
                    ? "Reserve Ticket"
                    : "Pay Now"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
