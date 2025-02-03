import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { useEffect, useState } from "react";
import { ClubData } from "../types/responses/ClubData";
import { Member } from "../types/Member";
import { ClubType } from "../types/ClubType";
import { AuditLog } from "../types/AuditLog";

const ClubDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("memberlist");
  const [data, setData] = useState<Omit<ClubData, "ismember" | "hasPending">>({
    Club: {
      id: 0,
      name: "",
      email: "",
      description: "",
      shortdescription: "",
      image: "",
      headerimage: "",
      popularity: 0,
      university: "",
      clubtype: ClubType.SOCIETY,
      ratio: 0,
    },
    MemberList: [],
    AuditLog: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const navigate = useNavigate();

  const studentCount =
    data.MemberList.filter((member: Member) => member.studentnumber).length ||
    0;
  const associateCount =
    data.MemberList.filter((member: Member) => !member.studentnumber).length ||
    0;
  const totalMembers = studentCount + associateCount;

  const links = [
    { label: "Home", href: "/" },
    { label: "Browse Clubs", href: "/clubs" },
    { label: "Events", href: "#" },
    { label: "About", href: "/about" },
  ];

  const cta = (
    <>
      <a
        href="/dashboard"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Dashboard
      </a>
      <a href="/clubs" className="text-sm text-gray-600 hover:text-gray-900">
        Explore Clubs
      </a>
    </>
  );

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch club data");
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error("Failed to fetch club data:", err); // eslint-disable-line no-console
        setError("An error occurred while fetching club details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredLogs = data.AuditLog.filter((log: AuditLog) => {
    const searchLower = auditSearch.toLowerCase();

    return (
      log.id.toString().includes(searchLower) ||
      (log.member && log.member.toLowerCase().includes(searchLower)) ||
      (log.user && log.user.toLowerCase().includes(searchLower)) ||
      (log.actionType && log.actionType.toLowerCase().includes(searchLower)) ||
      (log.created_at &&
        new Date(log.created_at)
          .toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .toLowerCase()
          .includes(searchLower))
    );
  });

  const activateMember = async (memberId: number) => {
    if (!window.confirm("Are you sure you want to activate this member?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must be logged in to perform this action");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ memberId }),
        }
      );

      if (response.ok) {
        alert("Member Activated Successfully");
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to activate the member.");
      }
    } catch (err) {
      console.error("Error activating member: ", err); // eslint-disable-line no-console
    }
  };

  const handleKick = async (userId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to perform this action.");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clubs/${id}/kick`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        alert("Member removed successfully!");
        const updatedData = await fetch(
          `${process.env.REACT_APP_API_URL}/clubs/${id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());
        setData(updatedData);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to remove the member.");
      }
    } catch (err) {
      console.error("Error removing member:", err); // eslint-disable-line no-console
      alert("An error occurred while trying to remove the member.");
    }
  };

  return (
    <div>
      <Navbar cta={cta} links={links} />
      <div className="bg-blue-50 w-full">
        <TitleSection
          title={data?.Club.name || "Club Details"}
          subtitle={data?.Club.shortdescription || "Manage your club"}
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
            <p className="ml-4 text-blue-500">Loading club details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md max-w-lg">
            <h3 className="font-bold text-lg">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <div className="border-b mb-6">
            <nav className="flex space-x-6">
              <button
                className={`pb-2 px-4 ${
                  activeTab === "memberlist"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("memberlist")}
              >
                Member List
              </button>
              <button
                className={`pb-2 px-4 ${
                  activeTab === "clubdetails"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("clubdetails")}
              >
                Club Details
              </button>
              <button
                className={`pb-2 px-4 ${
                  activeTab === "auditlog"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("auditlog")}
              >
                Audit Log
              </button>
            </nav>
          </div>

          <div>
            {activeTab === "memberlist" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Member List</h2>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-md mb-6">
                  <div
                    className="absolute h-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      width: `${(studentCount / totalMembers) * 100}%`,
                    }}
                  >
                    {Math.round((studentCount / totalMembers) * 100)}%
                  </div>

                  <div
                    className="absolute h-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      left: `${(studentCount / totalMembers) * 100}%`,
                      width: `${(associateCount / totalMembers) * 100}%`,
                    }}
                  >
                    {Math.round((associateCount / totalMembers) * 100)}%
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search members by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                {data.MemberList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined At
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.MemberList.filter((member: Member) =>
                          member.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        ).map((member: Member, index: number) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } border-b border-gray-200`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {member.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {member.membertype || "Member"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {new Date(member.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.studentnumber
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {member.studentnumber ? "Student" : "Associate"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <input
                                type="checkbox"
                                checked={member.activated}
                                disabled
                                className={`w-5 h-5 border-2 rounded ${
                                  member.activated
                                    ? "bg-blue-500 border-blue-500"
                                    : "bg-gray-200 border-gray-300"
                                } cursor-not-allowed`}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {!member.activated && (
                                <button
                                  onClick={() =>
                                    activateMember(member.memberid)
                                  }
                                  className="px-4 py-2 mr-4 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => handleKick(member.memberid)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Kick
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No members found.</p>
                )}
              </div>
            )}
            {activeTab === "clubdetails" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Edit Club Details</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const token = localStorage.getItem("token");
                      if (!token) {
                        throw new Error(
                          "You must be logged in to update club details."
                        );
                      }

                      let imageUrl = data.Club.image;
                      let headerImageUrl = data.Club.headerimage;

                      const headerFileInput = document.getElementById(
                        "headerImageFile"
                      ) as HTMLInputElement;

                      const imageFileInput = document.getElementById(
                        "imageFile"
                      ) as HTMLInputElement;

                      const formData = new FormData();
                      formData.append("clubId", id || "");

                      if (headerFileInput?.files?.[0]) {
                        formData.append(
                          "headerImage",
                          headerFileInput.files[0]
                        );
                      }
                      if (imageFileInput?.files?.[0]) {
                        formData.append("image", imageFileInput.files[0]);
                      }

                      const uploadResponse = await fetch(
                        `${process.env.REACT_APP_API_URL}/clubs/upload`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                          body: formData,
                        }
                      );

                      if (uploadResponse.ok) {
                        const result = await uploadResponse.json();
                        imageUrl = result.imageUrl;
                        headerImageUrl = result.headerImageUrl;
                      } else {
                        throw new Error("Failed to upload the image.");
                      }

                      const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/clubs/${id}/edit`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            name: data.Club.name,
                            description: data.Club.description,
                            shortdescription: data.Club.shortdescription,
                            email: data.Club.email,
                            headerimage: headerImageUrl,
                            image: imageUrl,
                          }),
                        }
                      );

                      if (response.ok) {
                        alert("Club details updated successfully!");
                      } else {
                        const result = await response.json();
                        throw new Error(
                          result.message || "Failed to update club details."
                        );
                      }
                    } catch (error: unknown) {
                      console.error("Error updating club details:", error); // eslint-disable-line no-console
                      alert(error);
                    }
                  }}
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={data.Club.description || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          Club: {
                            ...data.Club,
                            description: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={data.Club.shortdescription || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          Club: {
                            ...data.Club,
                            shortdescription: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Header Image
                    </label>
                    <input
                      type="file"
                      id="headerImageFile"
                      accept="image/*"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                    {data.Club.headerimage && (
                      <img
                        src={data.Club.headerimage}
                        alt="Header Preview"
                        className="mt-4 w-full max-h-40 object-cover rounded-md"
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                    {data.Club.image && (
                      <img
                        src={data.Club.image}
                        alt="Header Preview"
                        className="mt-4 w-full max-h-40 object-cover rounded-md"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </form>
                <button
                  onClick={() => navigate(`/club/${id}`)}
                  className="px-4 mt-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Club Page &gt;&gt;
                </button>
              </div>
            )}
            {activeTab === "auditlog" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Audit Log</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search audit log..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                {filteredLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Id
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Committee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log: AuditLog, index: number) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } border-b border-gray-200`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {log.id || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {log.member || "Member"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {log.user || "Committee"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {log.actionType || "Action"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {new Date(log.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No logs found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDashboard;
