import React from "react";
import FeatureCard from "./FeatureCard";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface Feature {
  title: string;
  description: string;
  icon: IconProp;
}

interface FeatureSectionProps {
  features: Feature[];
}

const FeaturesSection: React.FC<FeatureSectionProps> = ({ features }) => (
  <section data-cy="features-section" className="py-16 bg-gray-50">
    <div className="container mx-auto text-center">
      <h2 className="text-3xl font-semibold">Why use ClubLink?</h2>
      <div
        data-cy="features-grid"
        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
