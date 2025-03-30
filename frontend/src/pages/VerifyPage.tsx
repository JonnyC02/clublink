import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("Invalid verification link.");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/verify?token=${token}`
        );
        if (response.ok) {
          setStatus("Email verified successfully!");
          navigate("/login");
        } else {
          setStatus("Verification failed. Please try again.");
        }
      } catch (err) {
        setStatus("An error occurred. Please try again later.");
        console.error(err); // eslint-disable-line no-console
      }
    };

    verifyToken();
  }, [searchParams]);

  return <div>{status}</div>;
};

export default VerifyPage;
