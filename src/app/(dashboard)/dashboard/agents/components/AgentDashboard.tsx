'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FaHome, 
  FaUsers, 
  FaHandshake, 
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaChartBar
} from 'react-icons/fa';

export default function AgentDashboard() {
  const { theme } = useTheme();
  const { /* t */ } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get active tab from URL parameter, default to 'dashboard'
  const activeTab = searchParams?.get('tab') || 'dashboard';

  // Tasks state management
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Property viewing with Michael Brown', completed: false },
    { id: 2, text: "Follow up on Emma's offer", completed: false },
    { id: 3, text: 'Update listing photos', completed: false },
    { id: 4, text: 'Client meeting preparation', completed: false }
  ]);

  // Handle task completion toggle
  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Handle message click
  const handleMessageClick = (contactName: string) => {
    const contactId = contactName.toLowerCase().replace(' ', '-');
    router.push(`/agents/chat?contact=${contactId}`);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'} pt-20`}>
      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10">
        {activeTab === 'dashboard' && (
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-8">
                {/* Total Properties */}
                <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`} style={{animationDelay: '0.1s'}}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 transform transition-all duration-300 hover:rotate-6">
                      <FaHome className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-500 animate-bounce-subtle">
                      <FaArrowUp className="w-3 h-3" />
                      +12%
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} font-medium mb-2`}>Total Properties</div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} animate-count-up`}>248</div>
                </div>

                {/* Active Clients */}
                <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`} style={{animationDelay: '0.2s'}}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 transform transition-all duration-300 hover:rotate-6">
                      <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-500 animate-bounce-subtle">
                      <FaArrowUp className="w-3 h-3" />
                      +18%
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} font-medium mb-2`}>Active Clients</div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} animate-count-up`}>1,024</div>
                </div>

                {/* Pending Deals */}
                <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`} style={{animationDelay: '0.3s'}}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 transform transition-all duration-300 hover:rotate-6">
                      <FaHandshake className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-red-500 animate-bounce-subtle">
                      <FaArrowDown className="w-3 h-3" />
                      -5%
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} font-medium mb-2`}>Pending Deals</div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} animate-count-up`}>24</div>
                </div>

                {/* Monthly Revenue */}
                <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`} style={{animationDelay: '0.4s'}}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 transform transition-all duration-300 hover:rotate-6">
                      <FaDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-500 animate-bounce-subtle">
                      <FaArrowUp className="w-3 h-3" />
                      +28%
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} font-medium mb-2`}>Monthly Revenue</div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} animate-count-up`}>$284,546</div>
                </div>
              </div>

              {/* Recent Properties */}
              <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 mb-8 animate-fade-in-up`} style={{animationDelay: '0.5s'}}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Recent Properties</h2>
                  <button className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-300 hover:scale-105 transform">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {/* Modern Villa */}
                  <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up`} style={{animationDelay: '0.6s'}}>
                    <div className="overflow-hidden">
                      <Image
                        src="/images/properties/property-1.jpg"
                        alt="Modern Villa"
                        width={400}
                        height={240}
                        className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-1 transition-colors duration-300`}>Modern Villa</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mb-2`}>123 Luxury Lane, Beverly Hills</p>
                      <p className="text-lg font-bold text-[#F08336] mb-3 animate-pulse-gentle">$2,850,000</p>
                      <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mb-3`}>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaBed className="w-4 h-4" />
                          5 beds
                        </div>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaBath className="w-4 h-4" />
                          4 baths
                        </div>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaRulerCombined className="w-4 h-4" />
                          4,250 sqft
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 animate-pulse-gentle">
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Coastal Paradise */}
                  <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up`} style={{animationDelay: '0.7s'}}>
                    <div className="overflow-hidden">
                      <Image
                        src="/images/properties/property-2.jpg"
                        alt="Coastal Paradise"
                        width={400}
                        height={240}
                        className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-1 transition-colors duration-300`}>Coastal Paradise</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mb-2`}>456 Ocean Drive, Malibu</p>
                      <p className="text-lg font-bold text-[#F08336] mb-3 animate-pulse-gentle">$3,975,000</p>
                      <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mb-3`}>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaBed className="w-4 h-4" />
                          6 beds
                        </div>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaBath className="w-4 h-4" />
                          5 baths
                        </div>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaRulerCombined className="w-4 h-4" />
                          5,100 sqft
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 animate-pulse-gentle">
                        Under Contract
                      </span>
                    </div>
                  </div>

                  {/* City Penthouse */}
                  <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up`} style={{animationDelay: '0.8s'}}>
                    <div className="overflow-hidden">
                      <Image
                        src="/images/properties/property-3.jpg"
                        alt="City Penthouse"
                        width={400}
                        height={240}
                        className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-1 transition-colors duration-300`}>City Penthouse</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mb-2`}>789 Downtown Ave, Los Angeles</p>
                      <p className="text-lg font-bold text-[#F08336] mb-3 animate-pulse-gentle">$1,950,000</p>
                      <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mb-3`}>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaBed className="w-4 h-4" />
                          3 beds
                        </div>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaBath className="w-4 h-4" />
                          3 baths
                        </div>
                        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors duration-300">
                          <FaRulerCombined className="w-4 h-4" />
                          2,800 sqft
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Sold
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Client Activity */}
              <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Recent Client Activity</h2>
                  <button className="text-primary-500 hover:text-primary-600 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-1 font-medium ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Client Name</th>
                        <th className={`text-left py-3 px-1 font-medium ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Property Interest</th>
                        <th className={`text-left py-3 px-1 font-medium ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Last Contact</th>
                        <th className={`text-left py-3 px-1 font-medium ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Status</th>
                        <th className={`text-left py-3 px-1 font-medium ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Michael Brown */}
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-4 px-1">
                          <div className="flex items-center gap-3">
                            <Image
                              src="/images/photos/agent-4.jpg"
                              alt="Michael Brown"
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Michael Brown</span>
                          </div>
                        </td>
                        <td className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} py-4 px-1`}>Modern Villa</td>
                        <td className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} py-4 px-1`}>2 hours ago</td>
                        <td className="py-4 px-1">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm">
                            Viewing Scheduled
                          </span>
                        </td>
                        <td className="py-4 px-1">
                          <button className="text-primary-500 hover:text-primary-600 font-medium">Follow Up</button>
                        </td>
                      </tr>

                      {/* Emma Wilson */}
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-4 px-1">
                          <div className="flex items-center gap-3">
                            <Image
                              src="/images/photos/sarah-wilson.jpg"
                              alt="Emma Wilson"
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Emma Wilson</span>
                          </div>
                        </td>
                        <td className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} py-4 px-1`}>Coastal Paradise</td>
                        <td className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} py-4 px-1`}>1 day ago</td>
                        <td className="py-4 px-1">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm">
                            Offer Made
                          </span>
                        </td>
                        <td className="py-4 px-1">
                          <button className="text-primary-500 hover:text-primary-600 font-medium">Review Offer</button>
                        </td>
                      </tr>

                      {/* James Chen */}
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-4 px-1">
                          <div className="flex items-center gap-3">
                            <Image
                              src="/images/photos/agent-2.jpg"
                              alt="James Chen"
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>James Chen</span>
                          </div>
                        </td>
                        <td className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} py-4 px-1`}>City Penthouse</td>
                        <td className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} py-4 px-1`}>3 days ago</td>
                        <td className="py-4 px-1">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm">
                            Negotiating
                          </span>
                        </td>
                        <td className="py-4 px-1">
                          <button className="text-primary-500 hover:text-primary-600 font-medium">Call</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-96 xl:w-[420px] space-y-6">
              {/* Tasks Due Today */}
              <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 animate-fade-in-up transform transition-all duration-300 hover:shadow-lg`} style={{animationDelay: '0.9s'}}>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Tasks Due Today</h3>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 group">
                      <div 
                        className={`w-5 h-5 border-2 rounded mt-0.5 cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                          task.completed 
                            ? 'bg-[#F08336] border-[#F08336] shadow-lg shadow-orange-200 dark:shadow-orange-900/20' 
                            : 'border-[#F08336] hover:border-[#E07429] hover:bg-cream-100 dark:hover:bg-orange-900/10'
                        }`}
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.completed && (
                          <svg 
                            className="w-3 h-3 text-white ml-0.5 mt-0.5 animate-bounce-in" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        )}
                      </div>
                      <span 
                        className={`text-sm leading-6 transition-all duration-300 ${
                          task.completed 
                            ? `${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-400'} line-through opacity-60` 
                            : `${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} group-hover:text-primary-500`
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 animate-fade-in-up transform transition-all duration-300 hover:shadow-lg`} style={{animationDelay: '1.0s'}}>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Upcoming Appointments</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <FaClock className="w-5 h-5 text-primary-500" />
                      <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>10:00 AM</span>
                    </div>
                    <div className="ml-8">
                      <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Property Viewing</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Michael Brown</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <FaClock className="w-5 h-5 text-primary-500" />
                      <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>2:00 PM</span>
                    </div>
                    <div className="ml-8">
                      <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Client Meeting</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Emma Wilson</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <FaClock className="w-5 h-5 text-primary-500" />
                      <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>4:30 PM</span>
                    </div>
                    <div className="ml-8">
                      <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Property Inspection</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>James Chen</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Messages */}
              <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-6 animate-fade-in-up transform transition-all duration-300 hover:shadow-lg`} style={{animationDelay: '1.1s'}}>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Recent Messages</h3>
                <div className="space-y-4">
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 transform"
                    onClick={() => handleMessageClick('Michael Brown')}
                  >
                    <Image
                      src="/images/photos/agent-3.jpg"
                      alt="Michael Brown"
                      width={40}
                      height={40}
                      className="rounded-full transition-transform duration-300 hover:scale-110"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} text-sm transition-colors duration-300 hover:text-primary-500`}>Michael Brown</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>2h ago</span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Looking forward to the viewing tomorrow!</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 transform"
                    onClick={() => handleMessageClick('Emma Wilson')}
                  >
                    <Image
                      src="/images/photos/sarah-wilson.jpg"
                      alt="Emma Wilson"
                      width={40}
                      height={40}
                      className="rounded-full transition-transform duration-300 hover:scale-110"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} text-sm transition-colors duration-300 hover:text-primary-500`}>Emma Wilson</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>5h ago</span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>When can we discuss the offer?</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 transform"
                    onClick={() => handleMessageClick('James Chen')}
                  >
                    <Image
                      src="/images/photos/agent-2.jpg"
                      alt="James Chen"
                      width={40}
                      height={40}
                      className="rounded-full transition-transform duration-300 hover:scale-110"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} text-sm transition-colors duration-300 hover:text-primary-500`}>James Chen</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>1d ago</span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Thanks for the property details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tab Content */}
        {activeTab === 'clients' && (
          <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-8 text-center`}>
            <FaUsers className="w-16 h-16 text-[#F08336] mx-auto mb-4" />
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-2`}>Clients Management</h2>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Manage your client relationships and communications</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-lg shadow-sm p-8 text-center`}>
            <FaChartBar className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} mb-2`}>Analytics & Reports</h2>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>View detailed analytics and performance reports</p>
          </div>
        )}
      </div>
    </div>
  );
}  