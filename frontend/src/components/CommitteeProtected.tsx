import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

interface CommitteeProtectedProps {
  children: JSX.Element;
}

const CommitteeProtected: React.FC<CommitteeProtectedProps> = ({
  children,
}) => {
  const { id } = useParams<{ id: string }>();
  const [isCommitteeMember, setIsCommitteeMember] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCommitteeStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsCommitteeMember(false);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/is-committee`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsCommitteeMember(data.isCommittee);
        } else {
          setIsCommitteeMember(false);
        }
      } catch (err) {
        console.error("Error checking committee status:", err); // eslint-disable-line no-console
        setIsCommitteeMember(false);
      } finally {
        setLoading(false);
      }
    };

    checkCommitteeStatus();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isCommitteeMember ? (
    children
  ) : (
    <Navigate to={`/login?redirect=${window.location.pathname}`} />
  );
};

export default CommitteeProtected;
