import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";

function App() {
  const [backendOnline, setBackendOnline] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
        if (response.status !== 200) {
          setBackendOnline(false)
        }
      } catch(err) {
        console.log(err);
        setBackendOnline(false)
      }
    };

    fetchData()
  }, [])
  return (
    <div className="App">
      {backendOnline ? ( <HomePage /> ) : ( <ErrorPage /> )}
    </div>
  );
}

export default App;
