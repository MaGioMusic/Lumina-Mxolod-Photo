'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import ContactMap from './ContactMap';
import PageSnapshotEmitter, { emitPageSnapshotNow } from '@/app/components/PageSnapshotEmitter';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      alert(t('contactMessageSent'));
    }, 1500);
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      value: '+995 555 123 456',
      description: 'Mon-Fri 9am-6pm'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      value: 'info@luminaestate.ge',
      description: 'We reply within 24 hours'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Office',
      value: 'Rustaveli Avenue 12, Tbilisi',
      description: 'Visit us in person'
    }
  ];

  const offices = [
    {
      city: 'Tbilisi',
      address: 'Rustaveli Avenue 12, 0108 Tbilisi',
      phone: '+995 555 123 456',
      email: 'tbilisi@luminaestate.ge',
      image: '/images/photos/contact-1.jpg'
    },
    {
      city: 'Batumi',
      address: 'Baratashvili Street 15, 6010 Batumi',
      phone: '+995 555 123 457',
      email: 'batumi@luminaestate.ge',
      image: '/images/photos/contact-2.jpg'
    },
    {
      city: 'Kutaisi',
      address: 'David Aghmashenebeli Avenue 8, 4600 Kutaisi',
      phone: '+995 555 123 458',
      email: 'kutaisi@luminaestate.ge',
      image: '/images/photos/contact-3.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PageSnapshotEmitter
        page="contact"
        title="Contact — Lumina Estate"
        summary="საკონტაქტო ინფორმაცია და ფორმა."
        data={{ email: 'info@luminaestate.ge', phone: '+995 555 123 456', address: 'Rustaveli Avenue 12, Tbilisi', hasForm: true }}
        auto
      />
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-orange-500 to-red-500 flex items-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Contact Us
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Ready to find your dream property? Get in touch with our expert team today. 
              We're here to help you every step of the way.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full mb-6">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {info.title}
                </h3>
                <p className="text-lg text-primary-500 font-semibold mb-2">
                  {info.value}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="+995 555 123 456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a subject</option>
                      <option value="buying">Buying Property</option>
                      <option value="selling">Selling Property</option>
                      <option value="renting">Renting Property</option>
                      <option value="investment">Investment Consultation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Tell us about your property needs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Map Placeholder */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Find Us
              </h2>
              <ContactMap />
              <div className="mt-4">
                <button
                  onClick={() => emitPageSnapshotNow({ page: 'contact', title: 'Contact — Lumina Estate', summary: 'მიმდინარე საკონტაქტო სექციები', data: { hasForm: true } })}
                  className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  ამ გვერდის აღწერა
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Office Locations */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Offices
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Visit us at any of our convenient locations across Georgia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="relative h-48">
                  <Image
                    src={office.image}
                    alt={`${office.city} Office`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {office.city} Office
                  </h3>
                  <div className="space-y-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{office.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{office.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 