import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import ClubsPage from "./pages/ClubsPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import VerifyPage from "./pages/VerifyPage";

function App() {
  const [backendOnline, setBackendOnline] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/health`, { credentials: 'include' });
        if (response.status !== 200) {
          setBackendOnline(false)
        }
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        setBackendOnline(false)
      }
    };

    if (!process.env.REACT_APP_IS_TESTING) {
      fetchData()
    }
  }, [])
  return (
    <Router>
      <Routes>
        {backendOnline ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/login" element={<AuthPage isSignup={false} />} />
            <Route path="/signup" element={<AuthPage isSignup={true} />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </>
        ) : (
          <Route path="*" element={<ErrorPage />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
