'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Home, 
  TrendingUp, 
  School, 
  Train,
  Search,
  ArrowRight,
  Building2,
  Trees,
  Coffee,
  ShoppingBag,
  Filter
} from 'lucide-react';

interface Neighborhood {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  description: string;
  avgPrice: string;
  priceTrend: 'up' | 'down' | 'stable';
  trendValue: string;
  properties: number;
  type: string;
  tags: string[];
  transit: string[];
  schools: number;
  lifestyle: string;
}

const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'vake',
    name: 'ვაკე',
    nameEn: 'Vake',
    image: '/images/properties/property-14.jpg',
    description: 'თბილისის ერთ-ერთი ყველაზე პრესტიჟული რაიონი, მწვანე პარკებით, ძვირადღირებული რესტორნებითა და მაღალი დონის ინფრასტრუქტურით.',
    avgPrice: '$2,800/მ²',
    priceTrend: 'up',
    trendValue: '+12%',
    properties: 156,
    type: 'პრემიუმი',
    tags: ['პარკები', 'რესტორნები', 'შოპინგი'],
    transit: ['მეტრო', 'ავტობუსი', 'ტაქსი'],
    schools: 8,
    lifestyle: 'აქტიური'
  },
  {
    id: 'saburtalo',
    name: 'საბურთალო',
    nameEn: 'Saburtalo',
    image: '/images/properties/property-2.jpg',
    description: 'თანამედროვე რაიონი განათლებისა და ბიზნესის ცენტრით. მრავალი ახალი აშენებული კორპუსი და განვითარებული ინფრასტრუქტურა.',
    avgPrice: '$1,900/მ²',
    priceTrend: 'up',
    trendValue: '+8%',
    properties: 234,
    type: 'თანამედროვე',
    tags: ['უნივერსიტეტები', 'ოფისები', 'კაფეები'],
    transit: ['მეტრო', 'ავტობუსი'],
    schools: 12,
    lifestyle: 'სტუდენტური'
  },
  {
    id: 'mtatsminda',
    name: 'მთაწმინდა',
    nameEn: 'Mtatsminda',
    image: '/images/properties/property-8.jpg',
    description: 'ისტორიული რაიონი ულამაზესი ხედებით, ძველი თბილისის ქუჩებითა და კულტურული ძეგლებით.',
    avgPrice: '$2,200/მ²',
    priceTrend: 'stable',
    trendValue: '+3%',
    properties: 89,
    type: 'ისტორიული',
    tags: ['ისტორია', 'ხედები', 'ტურიზმი'],
    transit: ['ფუნიკულერი', 'ავტობუსი'],
    schools: 5,
    lifestyle: 'კულტურული'
  },
  {
    id: 'didube',
    name: 'დიდუბე',
    nameEn: 'Didube',
    image: '/images/properties/property-5.jpg',
    description: 'განვითარებადი რაიონი ხელმისაწვდომი ფასებით. აქტიური სამშენებლო სამუშაოები და ახალი ინფრასტრუქტურა.',
    avgPrice: '$1,400/მ²',
    priceTrend: 'up',
    trendValue: '+15%',
    properties: 178,
    type: 'განვითარებადი',
    tags: ['ხელმისაწვდომი ფასები', 'ახალი პროექტები'],
    transit: ['მეტრო', 'ავტობუსი', 'მატარებელი'],
    schools: 6,
    lifestyle: 'საოჯახო'
  },
  {
    id: 'digomi',
    name: 'დიღომი',
    nameEn: 'Digomi',
    image: '/images/properties/property-7.jpg',
    description: 'საოჯახო რაიონი მწვანე ზონებითა და თანამედროვე საცხოვრებელი კომპლექსებით. მშვიდი გარემო ბავშვებისთვის.',
    avgPrice: '$1,600/მ²',
    priceTrend: 'up',
    trendValue: '+10%',
    properties: 145,
    type: 'საოჯახო',
    tags: ['პარკები', 'საბავშვო მოედნები', 'სავაჭრო ცენტრები'],
    transit: ['ავტობუსი', 'მიკროავტობუსი'],
    schools: 9,
    lifestyle: 'მშვიდი'
  },
  {
    id: 'old-tbilisi',
    name: 'ძველი თბილისი',
    nameEn: 'Old Tbilisi',
    image: '/images/properties/property-10.jpg',
    description: 'ქალაქის გული ისტორიული არქიტექტურით, განუმეორებელი შენობებითა და ტრადიციული ატმოსფეროთი.',
    avgPrice: '$2,500/მ²',
    priceTrend: 'up',
    trendValue: '+7%',
    properties: 67,
    type: 'ისტორიული',
    tags: ['არქიტექტურა', 'ტურიზმი', 'კულტურა'],
    transit: ['ავტობუსი', 'ფუნიკულერი'],
    schools: 4,
    lifestyle: 'ტურისტული'
  }
];

const LIFESTYLE_ICONS: Record<string, React.ReactNode> = {
  'აქტიური': <TrendingUp className="w-4 h-4" />,
  'სტუდენტური': <School className="w-4 h-4" />,
  'კულტურული': <Building2 className="w-4 h-4" />,
  'საოჯახო': <Home className="w-4 h-4" />,
  'მშვიდი': <Trees className="w-4 h-4" />,
  'ტურისტული': <MapPin className="w-4 h-4" />
};

export default function NeighborhoodsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);

  const types = ['all', ...new Set(NEIGHBORHOODS.map(n => n.type))];

  const filteredNeighborhoods = NEIGHBORHOODS.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || n.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/properties/property-14.jpg"
            alt="Tbilisi neighborhoods"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              გაიცანით თბილისის რაიონები
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              აღმოაჩინეთ თქვენთვის იდეალური უბანი — გაეცანით ფასებს, ინფრასტრუქტურასა და ცხოვრების სტილს
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="მოძებნეთ უბანი..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F08336]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{NEIGHBORHOODS.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">უბანი</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">869+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">უძრავი ქონება</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">$1,900</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">საშუალო ფასი/მ²</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F08336]">+9.2%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ფასების ზრდა</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-4 sticky top-20 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-500 shrink-0">ტიპი:</span>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-[#F08336] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type === 'all' ? 'ყველა' : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((neighborhood) => (
              <div
                key={neighborhood.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedNeighborhood(neighborhood)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={neighborhood.image}
                    alt={neighborhood.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{neighborhood.name}</h3>
                    <p className="text-sm text-gray-200">{neighborhood.nameEn}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-900">
                      {neighborhood.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Price & Trend */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">საშუალო ფასი</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{neighborhood.avgPrice}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                      neighborhood.priceTrend === 'up' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : neighborhood.priceTrend === 'down'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{neighborhood.trendValue}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {neighborhood.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {neighborhood.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      <span>{neighborhood.properties}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <School className="w-4 h-4" />
                      <span>{neighborhood.schools} სკოლა</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {LIFESTYLE_ICONS[neighborhood.lifestyle]}
                      <span>{neighborhood.lifestyle}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNeighborhoods.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">უბნები ვერ მოიძებნა</h3>
              <p className="text-gray-600 dark:text-gray-400">გთხოვთ, სცადოთ სხვა ძიების პარამეტრები</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedNeighborhood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedNeighborhood(null)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Image */}
            <div className="relative h-64">
              <Image
                src={selectedNeighborhood.image}
                alt={selectedNeighborhood.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedNeighborhood(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-900 hover:bg-white transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold">{selectedNeighborhood.name}</h2>
                <p className="text-gray-200">{selectedNeighborhood.nameEn}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">საშუალო ფასი</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedNeighborhood.avgPrice}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">უძრავი ქონება</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedNeighborhood.properties}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">სკოლა</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedNeighborhood.schools}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">ტრენდი</p>
                  <p className={`text-lg font-bold ${
                    selectedNeighborhood.priceTrend === 'up' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }`}>{selectedNeighborhood.trendValue}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">აღწერა</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedNeighborhood.description}</p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">თავისებურებები</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNeighborhood.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Transit */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ტრანსპორტი</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNeighborhood.transit.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <Train className="w-3 h-3" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link href={`/properties?location=${selectedNeighborhood.id}`}>
                <Button className="w-full bg-[#F08336] hover:bg-[#e0743a] text-white">
                  უძრავი ქონების ნახვა {selectedNeighborhood.name}-ში
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ვერ იპოვეთ თქვენი უბანი?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            დაგვიკავშირდით და ჩვენი აგენტები დაგეხმარებიან თქვენთვის იდეალური ლოკაციის შერჩევაში
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button className="bg-[#F08336] hover:bg-[#e0743a] text-white px-8">
                დაგვიკავშირდით
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" className="px-8">
                ყველა ობიექტი
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
