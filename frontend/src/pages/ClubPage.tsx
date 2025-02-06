import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { useEffect, useState } from "react";
import { ClubData } from "../types/responses/ClubData";
import { ClubType } from "../types/ClubType";
import { CommitteeResp } from "../types/responses/CommitteeResp";

const links = [
  { label: "Home", href: "/" },
  { label: "Browse Clubs", href: "/clubs" },
  { label: "Events", href: "#" },
  { label: "About", href: "/about" },
];

const cta = (
  <>
    {isAuthenticated() ? (
      <a
        href="/dashboard"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Dashboard
      </a>
    ) : (
      <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">
        Login
      </a>
    )}
    <a href="/clubs" className="text-sm text-gray-600 hover:text-gray-900">
      Explore Clubs
    </a>
  </>
);

const ClubPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState<
    Omit<ClubData, "Requests" | "MemberList" | "AuditLog" | "Tickets">
  >({
    Club: {
      id: 0,
      name: "",
      email: "",
      description: "",
      shortdescription: "",
      image: "",
      headerimage: "",
      university: "",
      clubtype: ClubType.SOCIETY,
      popularity: 0,
      ratio: 0,
    },
    ismember: false,
    hasPending: false,
  });
  const [error, setError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeResp[]>([]);
  const [committeeError, setCommitteeError] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setIsStudent(userData.isStudent);
          }
        }
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setClubData(data);
        } else {
          setError("Failed to fetch club data");
        }

        const committeeResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/committee`
        );
        if (committeeResponse.ok) {
          const committeeData = await committeeResponse.json();
          setCommitteeMembers(committeeData);
        } else {
          setCommitteeError("Failed to fetch committee members");
        }
      } catch (err) {
        console.error("Error fetching club data:", err); // eslint-disable-line no-console
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleJoinClub = async () => {
    setJoinError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/join/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Successfully joined the club!");
        const { ticket } = await response.json();
        if (ticket) {
          navigate(`/payment/${ticket}`);
        }
      } else {
        const data = await response.json();
        setJoinError(data.message || "Failed to join the club.");
      }
    } catch (err) {
      console.error("Error joining club:", err); // eslint-disable-line no-console
      setJoinError("An error occurred while trying to join the club.");
    }
  };

  return (
    <div>
      <Navbar cta={cta} links={links} />
      <div className="bg-blue-50">
        <TitleSection
          title={clubData.Club.name || "Club Details"}
          subtitle={
            clubData.Club.shortdescription || "Discover more about this club"
          }
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          <p className="ml-4 text-blue-500">Loading club details...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md max-w-lg">
            <h3 className="font-bold text-lg">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6 mt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white shadow-md rounded-lg p-6">
              <img
                src={clubData.Club.headerimage}
                alt={clubData.Club.name}
                className="w-full h-auto max-h-64 object-cover rounded-md mb-6"
              />
              <h2 className="text-2xl font-bold mb-4">{clubData.Club.name}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {clubData.Club.description || "No description available."}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {clubData.Club.clubtype}
              </p>
              <p className="text-sm text-gray-600">
                <strong>University:</strong> {clubData.Club.university}
              </p>
              {clubData.Club.email && (
                <p className="text-sm text-gray-600">
                  <strong>Contact:</strong>{" "}
                  <a
                    href={`mailto:${clubData.Club.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {clubData.Club.email}
                  </a>
                </p>
              )}
            </div>

            <div className="w-full md:w-1/3 bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Want to Join?</h3>
              <button
                onClick={handleJoinClub}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  clubData.ismember
                    ? "bg-gray-400 cursor-not-allowed"
                    : clubData.hasPending
                    ? "bg-yellow-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } transition`}
                disabled={clubData.ismember || clubData.hasPending}
              >
                {clubData.ismember
                  ? "Joined"
                  : clubData.hasPending
                  ? "Pending"
                  : isStudent
                  ? "Join Club"
                  : clubData.Club.ratio < 0.2
                  ? "Join Club"
                  : "Request to Join"}
              </button>
              {joinError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mt-4">
                  <p className="text-sm">{joinError}</p>
                </div>
              )}
              <h3 className="text-xl font-bold mb-4 mt-8">
                Member Count: {clubData.Club.popularity}
              </h3>
              <h3 className="text-xl font-bold mb-4 mt-8">
                Club Ratio: {clubData.Club.ratio * 100}%
              </h3>
              <h3 className="text-xl font-bold mb-4 mt-8">
                Committee Members:
              </h3>
              {committeeError ? (
                <p className="text-red-500 text-sm">{committeeError}</p>
              ) : committeeMembers.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {committeeMembers.map((member) => (
                    <li key={member.id}>
                      <strong>{member.name}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  No committee members found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubPage;
