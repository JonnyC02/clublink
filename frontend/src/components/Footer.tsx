import React, { useState } from "react";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const subscribe = async () => {
    if (!email) return;
    const response = await fetch(`${process.env.REACT_APP_API_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg">ClubLink</h3>
          <p className="text-gray-400 mt-2">
            Discover and manage your clubs in one place
          </p>
        </div>
        <div></div>
        <div>
          <h4 className="font-medium">Stay Updated</h4>
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 border-none focus:outline-none"
            />
            <button
              onClick={subscribe}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Subscribe
            </button>
          </form>
          {status === "success" && (
            <p className="text-center text-green-400 mt-2">
              🎉 Thanks for subscribing!
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-red-400 mt-2">
              ⚠️ Something went wrong. Try again.
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500">
        © 2025 ClubLink. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
