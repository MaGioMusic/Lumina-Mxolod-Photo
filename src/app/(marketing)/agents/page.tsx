'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Award, 
  TrendingUp,
  Users,
  Home,
  Search,
  Filter
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  title: string;
  image: string;
  phone: string;
  email: string;
  location: string;
  experience: number;
  sales: number;
  rating: number;
  reviews: number;
  specialties: string[];
  languages: string[];
}

const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'ანა სარაბაია',
    title: 'უძრავი ქონების ბროკერი',
    image: '/images/photos/contact-1.jpg',
    phone: '+995 599 123 456',
    email: 'ana@lumina.ge',
    location: 'თბილისი, ვაკე',
    experience: 8,
    sales: 247,
    rating: 4.9,
    reviews: 89,
    specialties: ['აპარტამენტები', 'პრემიუმ ქონება'],
    languages: ['ქართული', 'English', 'Русский']
  },
  {
    id: '2',
    name: 'ლიკა ქავთარაძე',
    title: 'უძრავი ქონების ბროკერი',
    image: '/images/properties/property-2.jpg',
    phone: '+995 599 234 567',
    email: 'lika@lumina.ge',
    location: 'თბილისი, საბურთალო',
    experience: 6,
    sales: 183,
    rating: 4.8,
    reviews: 64,
    specialties: ['სახლები', 'ინვესტიციები'],
    languages: ['ქართული', 'English']
  },
  {
    id: '3',
    name: 'ლევან თათარიშვილი',
    title: 'უძრავი ქონების ბროკერი',
    image: '/images/properties/property-5.jpg',
    phone: '+995 599 345 678',
    email: 'levan@lumina.ge',
    location: 'თბილისი, დიღომი',
    experience: 10,
    sales: 312,
    rating: 5.0,
    reviews: 112,
    specialties: ['კომერციული', 'მიწის ნაკვეთები'],
    languages: ['ქართული', 'Русский']
  },
  {
    id: '4',
    name: 'გიორგი მდივანი',
    title: 'უძრავი ქონების ბროკერი',
    image: '/images/properties/property-7.jpg',
    phone: '+995 599 456 789',
    email: 'giorgi@lumina.ge',
    location: 'თბილისი, დიდუბე',
    experience: 5,
    sales: 156,
    rating: 4.7,
    reviews: 52,
    specialties: ['ახალი აშენებული', 'ქირავნება'],
    languages: ['ქართული', 'English', 'Русский']
  },
  {
    id: '5',
    name: 'ელენე კოპაძე',
    title: 'უძრავი ქონების ბროკერი',
    image: '/images/properties/property-8.jpg',
    phone: '+995 599 567 890',
    email: 'elene@lumina.ge',
    location: 'თბილისი, მთაწმინდა',
    experience: 7,
    sales: 198,
    rating: 4.9,
    reviews: 71,
    specialties: ['პენტჰაუსები', 'ლუქს-კლასი'],
    languages: ['ქართული', 'English']
  },
  {
    id: '6',
    name: 'ნინო ქავთარაძე',
    title: 'უძრავი ქონების ბროკერი',
    image: '/images/properties/property-10.jpg',
    phone: '+995 599 678 901',
    email: 'nino@lumina.ge',
    location: 'თბილისი, ვარკეთილი',
    experience: 4,
    sales: 124,
    rating: 4.8,
    reviews: 45,
    specialties: ['ბინები', 'ოჯახური სახლები'],
    languages: ['ქართული', 'Русский']
  }
];

export default function AgentsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const specialties = ['all', ...new Set(AGENTS.flatMap(a => a.specialties))];

  const filteredAgents = AGENTS.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || agent.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ჩვენი აგენტები
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              გაიცანით ჩვენი გამოცდილი უძრავი ქონების პროფესიონალები, რომლებიც დაგეხმარებიან თქვენი საოცნებო ქონების პოვნაში
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="მოძებნეთ აგენტი სახელით ან ლოკაციით..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-[#F08336]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{AGENTS.length}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">აგენტი</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Home className="w-8 h-8 text-[#F08336]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">1,200+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">გაყიდული ობიექტი</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Star className="w-8 h-8 text-[#F08336]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">საშუალო რეიტინგი</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-8 h-8 text-[#F08336]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">15+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">წლის გამოცდილება</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 sticky top-20 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-500 shrink-0">სპეციალიზაცია:</span>
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSpecialty === specialty
                    ? 'bg-[#F08336] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {specialty === 'all' ? 'ყველა' : specialty}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Agent Image */}
                <div className="relative h-64">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{agent.rating}</span>
                    <span className="text-xs text-gray-500">({agent.reviews})</span>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-[#F08336] font-medium mb-4">{agent.title}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span>{agent.sales} გაყიდული</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span>{agent.experience} წელი</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{agent.location}</span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {agent.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-1 text-xs rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-10"
                      onClick={() => window.location.href = `tel:${agent.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      ზარი
                    </Button>
                    <Button
                      className="flex-1 h-10 bg-[#F08336] hover:bg-[#e0743a] text-white"
                      onClick={() => window.location.href = `mailto:${agent.email}`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      შეტყობინება
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">აგენტები ვერ მოიძებნა</h3>
              <p className="text-gray-600 dark:text-gray-400">გთხოვთ, სცადოთ სხვა ძიების პარამეტრები</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            გსურთ გახდეთ ჩვენი გუნდის წევრი?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Lumina Estate მუდმივ ძიებაშია ნიჭიერი და მოტივირებული პროფესიონალების
          </p>
          <Button className="bg-[#F08336] hover:bg-[#e0743a] text-white px-8 py-3 h-auto text-base">
            გაგვიგზავნეთ რეზიუმე
          </Button>
        </div>
      </section>
    </main>
  );
}
