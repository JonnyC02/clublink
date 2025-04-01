import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { isAuthenticated } from "../utils/auth";

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

const AboutPage: React.FC = () => {
  return (
    <>
      <Navbar cta={cta} links={links} />
      <TitleSection title="About Us" subtitle="" />
      <main className="px-6 py-10 bg-gray-50">
        <section className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-600 leading-relaxed">
            Welcome to <strong>Our Community Platform</strong>, where
            individuals with shared interests can connect, collaborate, and grow
            together. Whether you&apos;re looking to join a club, participate in
            exciting events, or simply learn more about what we do, this is the
            place to start.
          </p>
        </section>

        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Our Mission
          </h2>
          <p className="text-gray-600 mb-4">
            Our mission is to empower individuals by creating a space for
            meaningful connections, fostering growth, and encouraging
            collaboration. We believe that bringing people together through
            shared passions creates a stronger and more vibrant community.
          </p>
          <p className="text-gray-600">
            We aim to provide resources, tools, and opportunities for clubs and
            organisations to thrive, making it easy for everyone to find their
            place and pursue their passions.
          </p>
        </section>

        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            What We Offer
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-4">
            <li>
              Browse and join a wide range of clubs catering to various
              interests and hobbies.
            </li>
            <li>
              Stay updated on events, workshops, and meetups happening in your
              area.
            </li>
            <li>
              Connect with like-minded individuals and build lasting
              relationships.
            </li>
            <li>
              Access tools and resources to help your club or organisation
              succeed.
            </li>
          </ul>
        </section>

        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Join Us</h2>
          <p className="text-gray-600">
            Ready to take the next step? Whether yo&apos;re here to join a club,
            start your own, or simply explore, we have everything you need to
            get started. Together, we can build something extraordinary.
          </p>
          <div className="mt-8">
            <a
              href="/clubs"
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Browse Clubs
            </a>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
