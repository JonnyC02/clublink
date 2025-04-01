import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";
import { University } from "../types/University";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Club } from "../types/Club";
import Filters from "../components/Filters";
import { FilterOption } from "../types/FilterOption";

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
        className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
      >
        Dashboard
      </a>
    ) : (
      <a
        href="/login"
        className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
      >
        Login
      </a>
    )}
    <a
      href="/clubs"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Join a Club
    </a>
  </>
);

const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filters, setFilters] = useState<Record<string, string | boolean>>({
    university: "",
    clubtype: "",
    popularity: "",
    search: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[] | null>(null);

  useEffect(() => {
    const fetchClubs = async (latitude?: number, longitude?: number) => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/clubs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            latitude && longitude ? { latitude, longitude } : {}
          ),
        });

        if (!response.ok) throw new Error("Failed to fetch clubs.");
        const data = await response.json();
        setClubs(data);

        const uniResp = await fetch(
          `${process.env.REACT_APP_API_URL}/universities`
        );
        if (!uniResp.ok) throw new Error("Failed to fetch Universities.");
        const uniData = await uniResp.json();
        setUniversities(uniData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchClubs(latitude, longitude);
      },
      () => fetchClubs()
    );
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { name, value, type, checked } = e.target as any;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "text",
      placeholder: "Search by Club Name",
    },
    {
      id: "university",
      label: "University",
      type: "select",
      options:
        universities?.map((uni) => ({ value: uni.acronym, label: uni.name })) ||
        [],
    },
    {
      id: "clubtype",
      label: "Club Type",
      type: "select",
      options: [
        { value: "Club", label: "Club" },
        { value: "Society", label: "Society" },
      ],
    },
    {
      id: "popularity",
      label: "Club Size",
      type: "select",
      options: [
        { value: "small", label: "Small (1-10)" },
        { value: "medium", label: "Medium (11-30)" },
        { value: "large", label: "Large (30+)" },
      ],
    },
  ];

  const filteredClubs = clubs.filter((club) => {
    const searchLower = filters.search.toString().toLowerCase();
    if (
      filters.search &&
      !(
        club.name.toLowerCase().includes(searchLower) ||
        club.shortdescription.toLowerCase().includes(searchLower)
      )
    )
      return false;
    if (filters.university && club.university !== filters.university)
      return false;
    if (filters.clubtype && club.clubtype !== filters.clubtype) return false;
    if (filters.popularity) {
      const size = filters.popularity;
      if (size === "small" && (club.popularity < 1 || club.popularity > 10))
        return false;
      if (size === "medium" && (club.popularity < 11 || club.popularity > 30))
        return false;
      if (size === "large" && club.popularity <= 30) return false;
    }
    return true;
  });

  return (
    <div>
      <Navbar brandName="ClubLink" links={links} cta={cta} />
      <TitleSection title="Browse Clubs" subtitle="Find clubs near you" />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:max-w-xs lg:min-w-[260px]">
            <Filters
              filterOptions={filterOptions}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          <section className="flex-1">
            {loading ? (
              <div className="text-center text-blue-500">Loading clubs...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : filteredClubs.length > 0 ? (
              <div className="space-y-4">
                {filteredClubs.map((club) => (
                  <a key={club.id} href={`/club/${club.id}`} className="block">
                    <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg">
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-20 h-20 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{club.name}</h3>
                        <p className="text-sm text-gray-600">
                          {club.shortdescription}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {club.popularity}{" "}
                          <FontAwesomeIcon icon={faUsers as IconProp} />
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No clubs found.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ClubsPage;
