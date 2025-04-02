import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { isAuthenticated } from "../utils/auth";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import TitleSection from "../components/TitleSection";

const faqs = [
  {
    question: "What is ClubLink?",
    answer:
      "ClubLink is a university society management platform for handling memberships, transactions, and admin workflows.",
  },
  {
    question: "Who can join a club?",
    answer:
      "Any student or associate (non-student) can join a club, depending on availability and the club's policies.",
  },
  {
    question: "What is the difference between a student and associate member?",
    answer:
      "Student members are verified using student numbers and often receive discounted rates. Associate members are usually staff, alumni, or community members.",
  },
  {
    question: "How do I know if my membership is active?",
    answer:
      "Your membership status will be shown on your dashboard. You’ll see 'Active', 'Pending', or 'Expired' next to your club listing.",
  },
  {
    question: "Where can I get help?",
    answer:
      "You can reach out through the contact form on the Support page or email the club directly from their profile.",
  },
];

const links = [
  { label: "Home", href: "/" },
  { label: "Browse Clubs", href: "/clubs" },
  { label: "FAQ", href: "/faq" },
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

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <Navbar brandName="ClubLink" links={links} cta={cta} />
      <TitleSection
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about ClubLink"
      />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl shadow-sm"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                {faq.question}
                <FontAwesomeIcon
                  icon={
                    openIndex === index
                      ? (faChevronUp as IconProp)
                      : (faChevronDown as IconProp)
                  }
                  className="text-gray-500"
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;
