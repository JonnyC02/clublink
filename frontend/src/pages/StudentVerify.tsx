import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const StudentVerify = () => {
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
        const response = await fetch(`/api/auth/student?token=${token}`);
        if (response.ok) {
          setStatus("Student status verified successfully!");
          navigate("/dashboard");
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

export default StudentVerify;
