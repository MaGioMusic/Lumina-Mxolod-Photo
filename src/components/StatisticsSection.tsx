'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatisticItem {
  id: string;
  value: number;
  suffix: string;
  labelKey: string;
  duration: number;
  icon: string;
  delay: number;
}

const statisticsData: StatisticItem[] = [
  {
    id: 'satisfaction',
    value: 99,
    suffix: '%',
    labelKey: 'clientSatisfaction',
    duration: 2000,
    icon: '😊',
    delay: 0
  },
  {
    id: 'support',
    value: 24,
    suffix: '/7',
    labelKey: 'support247',
    duration: 1500,
    icon: '🕒',
    delay: 200
  },
  {
    id: 'agents',
    value: 50,
    suffix: '+',
    labelKey: 'verifiedAgents',
    duration: 1800,
    icon: '👥',
    delay: 400
  },
  {
    id: 'views',
    value: 1000000,
    suffix: '+',
    labelKey: 'propertiesViewed',
    duration: 2500,
    icon: '👁️',
    delay: 600
  }
];

interface CountUpProps {
  end: number;
  duration: number;
  suffix: string;
  isVisible: boolean;
  delay: number;
}

function CountUp({ end, duration, suffix, isVisible, delay }: CountUpProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isVisible || hasStarted) return;

    const timer = setTimeout(() => {
      setHasStarted(true);
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;

        if (progress < 1) {
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(end * easeOutCubic));
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, end, duration, hasStarted, delay]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    }
    return num.toString();
  };

  return (
    <span 
      className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#F08336] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
      aria-label={`${end}${suffix}`}
    >
      {formatNumber(count)}{suffix}
    </span>
  );
}

interface StatisticCardProps {
  item: StatisticItem;
  isVisible: boolean;
  index: number;
}

function StatisticCard({ item, isVisible, index }: StatisticCardProps) {
  const { t } = useLanguage();
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setCardVisible(true);
      }, item.delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, item.delay]);

  return (
    <div 
      className={`text-center p-6 md:p-8 bg-white/90 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] ${
        cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${item.delay}ms` }}
    >
      <div className="text-4xl md:text-5xl mb-4">
        {item.icon}
      </div>
      <CountUp 
        end={item.value} 
        duration={item.duration} 
        suffix={item.suffix}
        isVisible={isVisible}
        delay={item.delay}
      />
      <p className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mt-3 leading-tight">
        {t(item.labelKey)}
      </p>
    </div>
  );
}

export default function StatisticsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const observedElement = sectionRef.current;
    if (observedElement) {
      observer.observe(observedElement);
    }

    return () => {
      if (observedElement) {
        observer.unobserve(observedElement);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden"
      aria-label="Company Statistics"
    >
      <div className="absolute inset-0 bg-gradient-radial from-orange-100/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              {t('statisticsTitle')}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('statisticsSubtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {statisticsData.map((item, index) => (
            <StatisticCard 
              key={item.id} 
              item={item} 
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 