import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UserClubsResp } from "../types/responses/UserClubsResp";
import { UserResp } from "../types/responses/UserResp";

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserResp>();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<UserClubsResp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const links = [
    { label: "Home", href: "/" },
    { label: "Browse Clubs", href: "/clubs" },
    { label: "Events", href: "#" },
    { label: "About", href: "/about" },
  ];

  const cta = (
    <button
      onClick={() => {
        localStorage.removeItem("token");
        navigate("/login?redirect=/dashboard");
      }}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Logout
    </button>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login?redirect=/dashbaord");
          return;
        }

        const userResponse = await fetch(`/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData);
        } else {
          localStorage.removeItem("token");
          navigate("/login?redirect=/dashboard");
        }

        const clubsResponse = await fetch(`/api/user/clubs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          setClubs(clubsData);
        }

        setLoading(false);
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        localStorage.removeItem("token");
        navigate("/login?redirect=/dashboard");
      }
    };

    fetchData();
  }, [navigate]);

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.shortdescription || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const ClubCard = ({ club }: { club: UserClubsResp }) => (
    <div className="bg-gray-50 shadow-md rounded-lg p-4 hover:shadow-lg transition">
      <img
        src={club.image}
        alt={club.name}
        className="w-full h-32 object-cover rounded-md mb-4"
      />
      {(club.status === "Expired" || club.status === "Pending") && (
        <div
          className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
          role="alert"
        >
          <p className="font-bold">Membership Inactive</p>
          <p>
            Purchase it{" "}
            <a
              href={`/payment/${club.membershipticket}`}
              className="underline hover:text-yellow-800"
            >
              HERE
            </a>
          </p>
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-700 mb-2">{club.name}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {club.shortdescription || "No description available"}
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/club/${club.id}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Details
        </button>
        {club.iscommittee && (
          <button
            onClick={() => navigate(`/club/${club.id}/committee`)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Committee View
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar links={links} cta={cta} />
      <div className="flex flex-col items-center py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {userData?.name || "User"}!
        </h1>

        <div className="mb-6 w-full max-w-lg">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-lg">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center flex flex-col items-center">
            <p className="text-lg text-gray-600 mb-4">No clubs found...</p>
            <button
              onClick={() => navigate("/clubs")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Browse Clubs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
