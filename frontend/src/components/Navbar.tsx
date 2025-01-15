import React from "react";

interface NavbarProps {
  brandName?: string;
  links: { label: string; href: string }[];
  cta?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({
  brandName = "Clublink",
  links,
  cta,
}) => {
  return (
    <nav className="bg-white shadow-md py-4" data-testid="navbar">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">{brandName}</div>

        <div className="hidden md:flex space-x-6">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">{cta}</div>

        <div className="md:hidden">
          <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
