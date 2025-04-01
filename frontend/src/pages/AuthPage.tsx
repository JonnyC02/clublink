import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/authService";
import { University } from "../types/University";
import { Errors } from "../types/Error";
import { isAuthenticated } from "../utils/auth";

interface AuthPageProps {
  isSignup?: boolean;
}

const links = [
  { label: "Home", href: "/" },
  { label: "Browse Clubs", href: "/clubs" },
  { label: "About", href: "/about" },
];

const cta = (
  <>
    {isAuthenticated() ? (
      <a
        href="/dashboard"
        className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
      >
        Dashboard
      </a>
    ) : (
      <a
        href="/login"
        className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
      >
        Login
      </a>
    )}
    <a
      href="/clubs"
      className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 w-full md:w-auto"
    >
      Join a Club
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

  const navigate = useNavigate();
  const [universities, setUniversities] = useState<University[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              studentNumber: formData.isStudent
                ? formData.studentNumber
                : undefined,
              university: formData.isStudent ? formData.university : undefined,
            }),
          }
        );

        if (response.ok) {
          localStorage.setItem("pendingVerificationEmail", formData.email);
          navigate("/signup/success");
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Signup failed. Please try again.");
        }
      } catch (err) {
        const error = err as Errors;
        setError(
          error.message || "An error occurred during signup. Please try again."
        );
      }
    } else {
      try {
        const token = await login(formData.email, formData.password);
        localStorage.setItem("token", token);
        const redirect = searchParams.get("redirect");
        if (redirect) {
          navigate(redirect);
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        const error = err as Errors;
        setError(error.message || "Invalid email or password.");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/universities`,
          {
            credentials: "include",
          }
        );
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

    if (!process.env.REACT_APP_IS_TESTING) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar links={links} cta={cta} />
      <main className="flex-grow flex items-start justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white w-full max-w-md px-4 py-8 sm:px-8 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
            {isSignup ? "Sign Up" : "Log In"}
          </h2>

          {error && (
            <div
              className="text-red-700 text-md mb-6 bg-red-100 border border-red-400 p-3 rounded-lg"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <div className="mb-5">
                  <label className="block text-gray-600 font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                      <label className="block text-gray-600 font-medium mb-2">
                        University
                      </label>
                      {loading ? (
                        <div className="text-gray-500">
                          Loading universities...
                        </div>
                      ) : (
                        <select
                          id="university"
                          name="university"
                          value={formData.university}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        >
                          <option value="" disabled>
                            Select your university
                          </option>
                          {universities?.map((university) => (
                            <option
                              key={university.acronym}
                              value={university.acronym}
                            >
                              {university.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-600 font-medium mb-2">
                        Student Number
                      </label>
                      <input
                        type="text"
                        id="studentNumber"
                        name="studentNumber"
                        value={formData.studentNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mb-5">
              <label className="block text-gray-600 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-600 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {isSignup && (
              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition hover:shadow-md"
            >
              {isSignup ? "Sign Up" : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignup ? (
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Log In
                </a>
              </p>
            ) : (
              <>
                <p>
                  Forgot Password?{" "}
                  <a
                    href="/forgot-password"
                    className="text-blue-500 hover:underline"
                  >
                    Reset Password
                  </a>
                </p>
                <p className="mt-4">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="text-blue-500 hover:underline">
                    Sign Up
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
