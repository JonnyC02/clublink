import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { isAuthenticated } from "../utils/auth";
import TitleSection from "../components/TitleSection";
import { useEffect, useState } from "react";

const ClubDashboard = () => {
    const { id } = useParams<{ id: string }>();
    const [clubData, setClubData] = useState<any>(null)
    const [loading, setLoading] = useState(true);

    const links = [
        { label: 'Home', href: '/' },
        { label: 'Browse Clubs', href: '/clubs' },
        { label: 'Events', href: '#' },
        { label: 'About', href: '#' }
    ];

    const cta = (
        <>
            {isAuthenticated() ? (
                <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
            ) : (
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</a>
            )}
            <a href="/clubs" className="text-sm text-gray-600 hover:text-gray-900">Explore Clubs</a>
        </>
    );

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/clubs/${id}/all`)
                const data = await response.json()
                setClubData(data.clubData)
            } catch (err) {
                console.error('Failed to get club data: ', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    return (
        <div>
            <Navbar cta={cta} links={links} />
            <TitleSection title={clubData?.name || "Club Details"}
                subtitle={clubData?.shortdescription || "Discover more about this club"} />
        </div>
    )
}

export default ClubDashboard