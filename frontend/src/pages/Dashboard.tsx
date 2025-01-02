/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const links = [
        { label: "Home", href: "/" },
        { label: "Browse Clubs", href: "/clubs" },
        { label: "Events", href: "#" },
        { label: "About", href: "#" },
    ];

    const cta = (
        <>
            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Logout
            </button>
        </>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/auth/user`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setLoading(false);
                } else {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } catch (err) {
                console.error(err); // eslint-disable-line no-console
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchData();
    }, [navigate]);

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
            <div className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4 text-center">
                    Welcome, {userData.name}!
                </h1>

                {userData.clubs?.length > 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-2">Your Clubs</h2>
                        <ul className="list-disc list-inside">
                            {userData.clubs.map((club: any) => (
                                <li key={club.id} className="text-gray-600">
                                    {club.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg text-gray-600 mb-4">
                            You are in no clubs yet...
                        </p>
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