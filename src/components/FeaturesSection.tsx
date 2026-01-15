'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Buildings, Lightbulb } from '@phosphor-icons/react';

export default function FeaturesSection() {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      titleKey: 'expertAgents',
      descriptionKey: 'expertAgentsDesc',
      icon: <Users className="w-12 h-12 text-[#F08336]" weight="duotone" />
    },
    {
      titleKey: 'premiumListings',
      descriptionKey: 'premiumListingsDesc',
      icon: <Buildings className="w-12 h-12 text-[#F08336]" weight="duotone" />
    },
    {
      titleKey: 'smartTechnology',
      descriptionKey: 'smartTechnologyDesc',
      icon: <Lightbulb className="w-12 h-12 text-[#F08336]" weight="duotone" />
    }
  ];



  return (
    <section
      id="features-section"
      className="pt-10 pb-20 md:pt-14 md:pb-24 bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('featuresTitle')}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-full border border-[#F08336]/20 dark:border-[#F08336]/25 bg-gradient-to-br from-[#F08336]/20 via-[#D4AF37]/14 to-[#B8860B]/12 dark:from-[#F08336]/18 dark:via-[#D4AF37]/10 dark:to-[#B8860B]/8 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button 
            onClick={() => alert('Redirecting to all features page...')}
            className="bg-[#F08336] hover:bg-[#e0743a] text-white px-8 py-4 rounded-lg font-semibold text-subtitle transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
} 