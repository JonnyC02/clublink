import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface AuthPageProps {
    isSignup?: boolean;
}

const links = [
    { label: "Home", href: "/" },
    { label: "Browse Clubs", href: "/clubs" },
    { label: "Events", href: "#" },
    { label: "About", href: "#" },
];

const cta = (
    <>
        <a href="/clubs" className="text-sm text-gray-600 hover:text-gray-900">
            Explore Clubs
        </a>
        <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Get Started
        </a>
    </>
);

const AuthPage: React.FC<AuthPageProps> = ({ isSignup }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        studentNumber: "",
        university: "",
        password: "",
        confirmPassword: "",
        isStudent: false,
    });

    const [universities, setUniversities] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignup && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/universities`, {
                    credentials: "include",
                });
                if (response.status === 200) {
                    const data = await response.json();
                    setUniversities(data);
                    setLoading(false);
                } else {
                    setError("Failed to load universities.");
                    setLoading(false);
                }
            } catch (err) {
                console.error(err); // eslint-disable-line no-console
                setError("An error occurred while fetching universities.");
                setLoading(false);
            }
        };

        if (!process.env.REACT_APP_SKIP_BACKEND_CHECK) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar links={links} cta={cta} />
            <div className="flex flex-grow justify-center items-center">
                <div className="bg-white p-10 rounded-lg shadow-lg w-[28rem]">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                        {isSignup ? "Sign Up" : "Log In"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {isSignup && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isStudent"
                                            name="isStudent"
                                            checked={formData.isStudent}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 rounded"
                                        />
                                        <label
                                            htmlFor="isStudent"
                                            className="ml-2 text-gray-700 font-medium"
                                        >
                                            I am a student
                                        </label>
                                    </div>
                                </div>

                                {formData.isStudent && (
                                    <div className="mb-6">
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-medium mb-2"
                                                htmlFor="university"
                                            >
                                                University
                                            </label>
                                            {loading ? (
                                                <div className="text-gray-500">Loading universities...</div>
                                            ) : error ? (
                                                <div className="text-red-500">{error}</div>
                                            ) : (
                                                <select
                                                    id="university"
                                                    name="university"
                                                    value={formData.university}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                >
                                                    <option value="" disabled>
                                                        Select your university
                                                    </option>
                                                    {universities?.map((university, index) => (
                                                        <option key={index} value={university}>
                                                            {university}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-medium mb-2"
                                                htmlFor="studentNumber"
                                            >
                                                Student Number
                                            </label>
                                            <input
                                                type="text"
                                                id="studentNumber"
                                                name="studentNumber"
                                                value={formData.studentNumber}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        {isSignup && (
                            <div className="mb-6">
                                <label
                                    className="block text-gray-700 font-medium mb-2"
                                    htmlFor="confirmPassword"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                        >
                            {isSignup ? "Sign Up" : "Log In"}
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-700">
                        {isSignup ? (
                            <p>
                                Already have an account?{" "}
                                <a href="/login" className="text-blue-500 hover:underline">
                                    Log In
                                </a>
                            </p>
                        ) : (
                            <p>
                                Don&apos;t have an account?{" "}
                                <a href="/signup" className="text-blue-500 hover:underline">
                                    Sign Up
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;