/* eslint-disable @typescript-eslint/no-explicit-any */
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";

const links = [
    { label: 'Home', href: '/' },
    { label: 'Browse Clubs', href: '/clubs' },
    { label: 'Events', href: '#' },
    { label: 'About', href: '#' }
];

const cta = (
    <>
        {isAuthenticated() ? (<a href="/dashboard" className='text-sm text-gray-600 hover:text-gray-900'>Dashboard</a>) : (<a href="/login" className='text-sm text-gray-600 hover:text-gray-900'>Login</a>)}
        <a href="/clubs" className='text-sm text-gray-600 hover:text-gray-900'>Explore Clubs</a>
    </>
);

const ClubsPage: React.FC = () => {
    const [clubs, setClubs] = useState([]);
    const [filters, setFilters] = useState({
        university: "",
        popularity: "",
        proximity: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/clubs`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ longitude, latitude })
                });
                if (response.ok) {
                    const data = await response.json();
                    setClubs(data);
                } else {
                    setError('Failed to fetch clubs');
                }
            } catch (err) {
                console.error("Error fetching clubs:", err); // eslint-disable-line no-console
                setError("An error occurred while fetching clubs.");
            }
        }, (error) => {
            console.error("Error fetching location:", error); // eslint-disable-line no-console
            setError("Failed to get user location.");
        });
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const filteredClubs = clubs.filter((club: any) => {
        if (filters.university && club.university !== filters.university) {
            return false;
        }
        return true;
    });

    return (
        <div>
            <Navbar brandName="ClubLink" links={links} cta={cta} />
            <TitleSection
                title="Browse Clubs"
                subtitle="Find clubs near you"
            />
            <div className="container mx-auto p-6 flex gap-6">
                <div className="w-1/4 bg-white shadow-md p-4 rounded-lg self-start">
                    <h2 className="text-lg font-bold mb-4">Filters</h2>
                    <div className="mb-4">
                        <label
                            htmlFor="university"
                            className="block text-sm font-medium text-gray-700"
                        >
                            University
                        </label>
                        <select
                            name="university"
                            id="university"
                            value={filters.university}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">All</option>
                            <option value="QUB">
                                Queen&apos;s University Belfast
                            </option>
                        </select>
                    </div>
                </div>

                <div className="flex-grow">
                    <div className="space-y-6">
                        {error ? (
                            <div className="text-center text-red-500">
                                {error}
                            </div>
                        ) : filteredClubs.length > 0 ? (
                            filteredClubs.map((club: any) => (
                                <div
                                    key={club.id}
                                    className="bg-white shadow-md rounded-lg p-6 flex items-center"
                                >
                                    <img
                                        src={club.image}
                                        alt={club.name}
                                        className="w-24 h-24 object-cover rounded-md mr-6"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">
                                            {club.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {club.shortdescription}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-600">
                                No clubs found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubsPage;