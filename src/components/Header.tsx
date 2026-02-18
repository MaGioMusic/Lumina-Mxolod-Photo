'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { logger } from '@/lib/logger';
import { runtimeFlags } from '@/lib/flags';
import {
  List, X, House, Buildings, /* Users, */ AddressBook,
  /* MagnifyingGlass, */ Heart, Moon, Sun, SignIn, SignOut, Globe, Gear,
  /* Bell, */ EnvelopeSimple, ChartLine, UserList, GridFour, CaretDown, MapTrifold, Info
} from '@phosphor-icons/react';
import IOSToggle from '@/app/(marketing)/properties/components/IOSToggle';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import LoginModal from '@/components/LoginModal';
import PropertySubmitModal from '@/components/PropertySubmitModal';
import { ProfiledSection } from '@/lib/perf/reactProfiler';

// Type definitions for navigation items
interface NavItem {
  name: string;
  href: string;
  icon?: any;
}

export default function Header() {
  const { language, setLanguage: updateLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { getFavoritesCount } = useFavorites();
  const isAgentsUiEnabled = runtimeFlags.enableAgentsUI;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'map'>('grid');
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  
  // Check if we're on properties page
  const isPropertiesPage = pathname === '/properties';
  
  // Debug log (dev only)
  logger.log('Current pathname:', pathname);
  logger.debug('Is Properties Page:', isPropertiesPage);
  
  // Derived flags not used currently

  // Phase-1 navigation (freeze scope)
  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { name: t('home'), href: '/', icon: House },
      { name: t('properties'), href: '/properties', icon: Buildings },
      { name: t('contact'), href: '/contact', icon: AddressBook },
      { name: t('roadmap'), href: '/roadmap', icon: MapTrifold },
    ];

    if (isAuthenticated) {
      items.push({ name: t('profile'), href: '/profile', icon: GridFour });
    }

    return items;
  };

  const navItems = getNavItems();

  // Menu sections with authentication logic (keeping Lumina functionality)
  const getMenuItems = () => {
    const baseItems = [
      { name: t('settings'), icon: Gear, action: 'settings' },
      { name: t('language'), icon: Globe, action: 'language' },
      { name: theme === 'dark' ? t('lightMode') : t('darkMode'), icon: theme === 'dark' ? Sun : Moon, action: 'theme' }
    ];

    if (isAuthenticated) {
      // Add favorites for all authenticated users
      baseItems.splice(1, 0, { name: t('favorites'), icon: Heart, action: 'favorites' });
      // Add agent quick links for agent/admin
      if (isAgentsUiEnabled && (user?.role === 'agent' || user?.role === 'admin')) {
        baseItems.splice(1, 0, { name: t('agentDashboard'), icon: ChartLine, action: 'agentDashboard' });
        baseItems.splice(1, 0, { name: 'Agent Chat', icon: EnvelopeSimple, action: 'agentChat' });
      }
      if (user?.role === 'client') {
        baseItems.splice(1, 0, { name: t('profile'), icon: GridFour, action: 'profile' });
      }
      // Add logout (single entry, routes to /logout for robust clear + redirect)
      baseItems.push({ name: t('logout'), icon: SignOut, action: 'logout' });
    } else {
      // Add login
      baseItems.push({ name: t('login'), icon: SignIn, action: 'login' });
    }

    return [{ id: 'account', items: baseItems }];
  };

  const menuItems = getMenuItems();

  const languages = [
    { code: 'ka', name: t('georgian'), flag: '🇬🇪' },
    { code: 'en', name: t('english'), flag: '🇬🇧' },
    { code: 'ru', name: t('russian'), flag: '🇷🇺' }
  ];

  const handleLanguageChange = (lang: 'ka' | 'en' | 'ru') => {
    updateLanguage(lang);
    try {
      document.cookie = `lumina_language=${lang}; path=/; max-age=31536000`;
    } catch {}
    setIsMobileMenuOpen(false);
  };

  const handleViewChange = (view: 'grid' | 'map') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('viewChange', { detail: view }));
    }
  };

  const handleMenuAction = async (action: string) => {
    switch (action) {
      case 'favorites':
        router.push('/favorites');
        break;
      case 'agentDashboard':
        router.push('/profile');
        break;
      case 'agentChat':
        router.push('/agents/chat');
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'theme':
        toggleTheme();
        break;
      case 'language':
        // Language dropdown is handled separately
        break;
      case 'login':
        setIsLoginModalOpen(true);
        break;
      case 'logout':
        router.push('/logout');
        break;
    }
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Header background polish on scroll
  useEffect(() => {
    const onScroll = () => {
      if (typeof window === 'undefined') return;
      setIsScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isLanguageDropdownOpen && !target.closest('[data-language-dropdown]')) {
        setIsLanguageDropdownOpen(false);
      }
      if (isAccountDropdownOpen && !target.closest('[data-account-dropdown]')) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen, isAccountDropdownOpen]);

  return (
    <>
      {/* Main Header */}
      <header className={`${theme === 'dark' 
          ? (isScrolled ? 'bg-[#111111]/80 backdrop-blur-md border-gray-800' : 'bg-[#111111] border-gray-800') 
          : (isScrolled ? 'bg-white/80 backdrop-blur-md border-gray-100' : 'bg-white border-gray-100')
        } border-b sticky top-0 z-50 h-20 font-['Geist',sans-serif] ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Logo Section - Keeping Lumina Estate */}
            <Link href="/" className="flex items-center gap-1">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                <House className="w-5 h-5 text-white" weight="fill" />
              </div>
              <div className="ml-1">
                <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} [font-family:var(--font-inter),var(--font-noto-georgian),system-ui,sans-serif]`}>Lumina Estate</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('searchingHomes')}</div>
              </div>
            </Link>

            {/* Desktop Navigation - Motiff Style */}
            <nav className="hidden lg:flex items-center space-x-9">
              {navItems.map((item) => (
                <div key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                      pathname === item.href
                        ? 'text-[#FFCB74]'
                        : theme === 'dark' ? 'text-gray-300 hover:text-[#FFCB74]' : 'text-gray-700 hover:text-[#FFCB74]'
                    }`}
                  >
                    <span suppressHydrationWarning>{item.name}</span>
                  </Link>
                </div>
              ))}
              {isPropertiesPage && (
                <div className="ml-4 flex items-center relative group" aria-label="View toggle">
                  <IOSToggle isGrid={currentView === 'grid'} onToggle={handleViewChange} />
                  {/* Hint tooltip */}
                  <div
                    role="tooltip"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-md text-xs text-white bg-gray-900 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
                  >
                    {currentView === 'grid' ? 'Switch to Map View' : 'Switch to Grid View'}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
                </div>
              )}
            </nav>

            {/* Right Side - Auth & Controls */}
            <div className="flex items-center gap-4 relative">
              {/* Language Switcher - Dropdown */}
              <div className="relative" data-language-dropdown>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{languages.find(lang => lang.code === language)?.flag}</span>
                  <span>{language.toUpperCase()}</span>
                  <CaretDown className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {isLanguageDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-40 border rounded-lg shadow-xl z-50 ${
                    theme === 'dark' ? 'bg-[#222222] border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code as 'ka' | 'en' | 'ru');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${
                          language === lang.code
                            ? 'bg-[#FFCB74] text-black'
                            : theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                        } ${lang === languages[0] ? 'rounded-t-lg' : ''} ${lang === languages[languages.length - 1] ? 'rounded-b-lg' : ''}`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                        <span className="ml-auto text-xs opacity-70">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
            )}
          </div>

              {/* Account controls moved next to auth buttons */}

              {/* Theme Toggle */}
              <ProfiledSection id="AnimatedThemeToggler">
                <AnimatedThemeToggler
                  type="button"
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={theme === 'dark' ? t('lightMode') : t('darkMode')}
                />
              </ProfiledSection>

              {/* Favorites (if authenticated) */}
              {isAuthenticated && (
                <Link
                  href="/favorites"
                  className={`relative p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('favorites')}
                >
                  <Heart className="w-5 h-5" />
                  {getFavoritesCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getFavoritesCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* Account + Auth */}
              <div className="flex items-center gap-2">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className={`px-5 py-2 border rounded-full text-sm font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t('signIn')}
                    </button>
                    <button onClick={() => setIsPropertyModalOpen(true)} className="px-5 py-2 bg-[#F08336] text-white rounded-full hover:bg-[#e0743a] transition-colors text-sm font-medium">
                      {t('addProperty')}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Account Dropdown - compact (replaces old welcome/logout area) */}
                    <div className="relative" data-account-dropdown>
                      <button
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <UserList className="w-5 h-5" />
                        {isAuthenticated && user?.role === 'agent' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFCB74] text-black">
                            Agent
                          </span>
                        )}
                        <CaretDown className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isAccountDropdownOpen && (
                        <div className={`absolute right-0 mt-2 w-56 border rounded-lg shadow-xl z-50 ${
                          theme === 'dark' ? 'bg-[#222222] border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                          {menuItems[0].items.map((item: any, idx: number) => (
                            <button
                              key={`${item.action}-${idx}`}
                              onClick={() => { setIsAccountDropdownOpen(false); handleMenuAction(item.action); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${
                                item.action === 'logout'
                                  ? 'text-[#F08336] hover:bg-orange-50'
                                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                              } ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === menuItems[0].items.length - 1 ? 'rounded-b-lg' : ''}`}
                            >
                              {item.icon && <item.icon className="w-5 h-5" />}
                              <span>{item.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
            </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
            {isMobileMenuOpen && (
          <div className={`lg:hidden border-t ${
            theme === 'dark' ? 'border-gray-700 bg-[#111111]' : 'border-gray-100 bg-white'
          }`}>
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              {navItems.map((item) => (
                        <Link
                  key={item.name}
                          href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-[#FFCB74] text-black'
                      : theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                          <span className="font-medium">{item.name}</span>
                        </Link>
              ))}

              {/* Mobile: Pages submenu quick link(s) */}
              <div className="px-3 pt-2">
                <Link
                  href="/investors"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Info className="w-5 h-5" />
                  <span className="font-medium">Investors</span>
                </Link>
                  </div>

              {/* Mobile Language Switcher */}
              <div className="border-t border-gray-100 pt-4">
                <div className="px-3 py-2 text-sm font-medium text-gray-900 mb-2">
                  {t('language')}
                </div>
                    <div className="space-y-1">
                                {languages.map((lang) => (
                                  <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code as 'ka' | 'en' | 'ru')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                      language === lang.code
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

              {/* Mobile Theme Toggle */}
                          <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">
                  {theme === 'dark' ? t('lightMode') : t('darkMode')}
                </span>
                          </button>
              </div>
          </div>
        )}
    </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <PropertySubmitModal isOpen={isPropertyModalOpen} onClose={() => setIsPropertyModalOpen(false)} />
    </>
  );
} 