// src/app/components/FeatureCard.tsx

import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  id: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, id }) => (
  <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200" id={id}>
    <div className="text-4xl">{icon}</div>
    <h3 className="text-xl font-semibold mt-4">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </div>
);

export default FeatureCard;
