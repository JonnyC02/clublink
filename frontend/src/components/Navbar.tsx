import React, { useState } from "react";

interface NavbarProps {
  brandName?: string;
  links: { label: string; href: string }[];
  cta?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({
  brandName = "ClubLink",
  links,
  cta,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md py-4" data-testid="navbar">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-3xl font-bold text-gray-800">{brandName}</div>

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
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
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

      {isMobileOpen && (
        <div className="md:hidden px-4 pt-4 pb-6 space-y-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}

          {cta && (
            <div className="pt-4 flex flex-col gap-3">
              {React.Children.map(cta, (child, index) => (
                <div key={index} className="w-full">
                  {React.isValidElement(child)
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      React.cloneElement(child as React.ReactElement<any>, {
                        className: `${
                          child.props.className || ""
                        } w-full text-center`.trim(),
                      })
                    : child}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
