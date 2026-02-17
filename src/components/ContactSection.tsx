'use client';

import { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import { getLocalImagePath } from '@/lib/imageUrls';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert(t('fillRequiredFields'));
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert(t('validEmailAddress'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      alert(t('contactMessageSent'));
    }, 1500);
  };

  const handleContactClick = (type: string) => {
    switch(type) {
      case 'phone':
        window.open('tel:+1-555-123-4567');
        break;
      case 'email':
        window.open('mailto:contact@luminaestate.com');
        break;
    }
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      titleKey: 'phone',
      value: '+995 555 123 456'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      titleKey: 'email',
      value: 'info@luminaestate.ge'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      titleKey: 'address',
      valueKey: 'addressValue'
    }
  ];

  const teamMembers = [
    {
      nameKey: 'teamMember1Name',
      roleKey: 'teamMember1Role',
      experienceKey: 'teamMember1Experience',
      image: '/images/photos/contact-1.jpg'
    },
    {
      nameKey: 'teamMember2Name',
      roleKey: 'teamMember2Role',
      experienceKey: 'teamMember2Experience',
      image: '/images/photos/contact-2.jpg'
    },
    {
      nameKey: 'teamMember3Name',
      roleKey: 'teamMember3Role',
      experienceKey: 'teamMember3Experience',
      image: '/images/photos/contact-3.jpg'
    },
    {
      nameKey: 'teamMember4Name',
      roleKey: 'teamMember4Role',
      experienceKey: 'teamMember4Experience',
      image: '/images/photos/contact-4.jpg'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('contactTitle')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('contactSubtitle')}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F08336] text-white rounded-full mb-6">
                {info.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t(info.titleKey)}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {info.valueKey ? t(info.valueKey) : info.value}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('meetTeam')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={member.image}
                  alt={t(member.nameKey)}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t(member.nameKey)}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {t(member.roleKey)}
              </p>
              <p className="text-sm text-primary-500 font-semibold">
                {t('experience')}: {t(member.experienceKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}