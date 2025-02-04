import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface ClubCardProps {
  image: string;
  name: string;
  shortdescription: string;
  popularity: string;
}

const ClubCard: React.FC<ClubCardProps> = ({
  image,
  name,
  shortdescription,
  popularity,
}) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
    <img
      src={image}
      alt={name}
      className="w-full h-40 object-cover rounded-lg"
    />
    <h3 className="text-xl font-medium mt-4">{name}</h3>
    <p className="text-gray-600 mt-2">{shortdescription}</p>
    <p className="text-gray-800 font-medium">
      Members: {popularity} <FontAwesomeIcon icon={faUsers} />
    </p>
  </div>
);

export default ClubCard;
