import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const Action = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();

  const isAccept = location.pathname === "/accept";
  const request = searchParams.get("token");

  useEffect(() => {
    const processAction = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      if (isAccept) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/requests/approve`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "POST",
            body: JSON.stringify({ request }),
          }
        );
        const res = await response.json();
        if (!res.ticket) {
          navigate("/dashboard");
        } else {
          navigate(`/payment/${res.ticket}`);
        }
      } else {
        await fetch(`${process.env.REACT_APP_API_URL}/requests/deny`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: JSON.stringify({ request }),
        });
      }
      navigate(`/dashboard`);
    };

    processAction();
  }, []);

  return <div>{message}</div>;
};

export default Action;
