'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { runtimeFlags } from '@/lib/flags';
import Newsletter from './Newsletter';

export default function Footer() {
  const { t } = useLanguage();

  const showAgentsUi = runtimeFlags.enableAgentsUI;

  const quickLinks = [
    { key: 'home', href: '/' },
    { key: 'properties', href: '/properties' },
    ...(showAgentsUi ? [{ key: 'agents', href: '/agents' }] : []),
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' }
  ];

  const services = [
    { key: 'buyProperty', href: '/properties?type=sale' },
    ...(showAgentsUi ? [{ key: 'sellProperty', href: '/agents' }] : []),
    { key: 'rentProperty', href: '/properties?type=rent' },
    ...(showAgentsUi ? [{ key: 'propertyManagement', href: '/agents' }] : [])
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/luminaestate',
      icon: Facebook,
      color: 'hover:bg-blue-600'
    },
    {
      name: 'Instagram', 
      href: 'https://instagram.com/luminaestate',
      icon: Instagram,
      color: 'hover:bg-pink-600'
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/luminaestate',
      icon: Linkedin,
      color: 'hover:bg-blue-700'
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                     text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 
                     transition-all duration-300">
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/icons/logo.svg"
                alt="Lumina Estate Logo"
                width={40}
                height={40}
                className="object-cover transition-transform duration-200 hover:scale-110"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Lumina Estate
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
              {t('footerDescription')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">+995 555 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">info@luminaestate.ge</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">თბილისი, საქართველო</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('quickLinks')}
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="block text-sm text-gray-600 dark:text-gray-400 
                           hover:text-primary-500 dark:hover:text-primary-400 
                           transition-colors duration-200 hover:translate-x-1 transform"
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              სერვისები
            </h3>
            <div className="space-y-2">
              {services.map((service) => (
                <Link
                  key={service.key}
                  href={service.href}
                  className="block text-sm text-gray-600 dark:text-gray-400 
                           hover:text-primary-500 dark:hover:text-primary-400 
                           transition-colors duration-200 hover:translate-x-1 transform"
                >
                  {t(service.key)}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <Newsletter />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} Lumina Estate. {t('allRightsReserved')}.
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                              text-gray-600 dark:text-gray-400 ${social.color} hover:text-white
                              transition-all duration-300 hover:scale-110 hover:shadow-lg
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 