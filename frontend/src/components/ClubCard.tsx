import React from 'react';

interface ClubCardProps {
    image: string;
    name: string;
    description: string;
    members: number[];
}

const ClubCard: React.FC<ClubCardProps> = ({ image, name, description, members }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
        <img src={image} alt={name} className="w-full h-40 object-cover rounded-lg" />
        <h3 className='text-xl font-medium mt-4'>{name}</h3>
        <p className='text-gray-600 mt-2'>{description}</p>
        <p className='text-gray-800 font-medium'>Members: {members.length}</p>
    </div>
)

export default ClubCard