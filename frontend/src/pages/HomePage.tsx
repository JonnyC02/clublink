import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeatureSection';
import ClubsSection from '../components/ClubSection';
import Footer from '../components/Footer';

const links = [
    { label: 'Home', href: '#'},
    { label: 'Browse Clubs', href: '#'},
    { label: 'Events', href: '#'},
    { label: 'About', href: '#'}
]

const cta = (
    <>
        <a href="#" className='text-sm text-gray-600 hover:text-gray-900'>Login</a>
        <a href="#" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Join a Club</a>
    </>
)

const HomePage: React.FC = () => {
    return (
        <div>
        <Navbar brandName='ClubLink' links={links} cta={cta} />
        <Hero />
        <FeaturesSection />
        <ClubsSection />
        <Footer />
      </div>
    )
}

export default HomePage; 