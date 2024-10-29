import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";

const links = [
    { label: 'Home', href: '/'},
    { label: 'Browse Clubs', href: '/clubs'},
    { label: 'Events', href: '#'},
    { label: 'About', href: '#'}
]

const cta = (
    <>
        <a href='/clubs' className='px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>Explore Clubs</a>
        <a href="/login" className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Get Started</a>
    </>
)

const ClubsPage: React.FC = () => {
    return (
        <div>
            <Navbar brandName='ClubLink' links={links} cta={cta} />
            <TitleSection title="Browse Clubs" subtitle="A directory of all the clubs available to you" />
        </div>
    )
}

export default ClubsPage;