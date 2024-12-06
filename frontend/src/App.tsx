import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import ClubsPage from "./pages/ClubsPage";

function App() {
  const [backendOnline, setBackendOnline] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/health`, { credentials: 'include' });
        if (response.status !== 200) {
          setBackendOnline(false)
        }
      } catch(err) {
        console.error(err); // eslint-disable-line no-console
        setBackendOnline(false)
      }
    };

    if (!process.env.REACT_APP_SKIP_BACKEND_CHECK) {
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
          </>
        ) : (
          <Route path="*" element={<ErrorPage />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
