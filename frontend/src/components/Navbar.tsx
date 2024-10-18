// components/Navbar.tsx
import React from 'react';

interface NavbarProps {
  brandName?: string;
  links: { label: string; href: string }[];
  cta?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ brandName = 'Clublink', links, cta }) => {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Brand Name / Logo */}
        <div className="text-xl font-bold text-gray-800">{brandName}</div>

        {/* Navigation Links - Hidden on small screens */}
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

        {/* Call to Action / CTA buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {cta}
        </div>

        {/* Mobile Menu Icon (Hamburger Menu) */}
        <div className="md:hidden">
          {/* You can replace this with a proper mobile menu toggle component */}
          <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
            {/* Simple Hamburger Icon (Can replace with an actual icon from an icon library) */}
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