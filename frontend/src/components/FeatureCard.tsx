import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: IconDefinition;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
    <div className="mb-4 text-blue-500">
      <FontAwesomeIcon icon={icon} size="2x" data-testid="feature-card-icon" />
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default FeatureCard;