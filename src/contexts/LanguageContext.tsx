'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger, sanitizeForLogging } from '@/lib/logger';
import { z } from 'zod';

// Language schema for validation
const LanguageSchema = z.enum(['ka', 'en', 'ru']);
type Language = z.infer<typeof LanguageSchema>;

// Translation interface
interface Translations {
  [key: string]: {
    ka: string;
    en: string;
    ru: string;
  };
}

// Complete translations for the entire website
const translations: Translations = {
  // Navigation
  home: {
    ka: 'მთავარი',
    en: 'Home',
    ru: 'Главная'
  },
  properties: {
    ka: 'უძრავი ქონება',
    en: 'Properties',
    ru: 'Недвижимость'
  },
  investors: {
    ka: 'ინვესტორები',
    en: 'Investors',
    ru: 'Инвесторы'
  },
  agents: {
    ka: 'აგენტები',
    en: 'Agents',
    ru: 'Агенты'
  },
  about: {
    ka: 'ჩვენ შესახებ',
    en: 'About',
    ru: 'О нас'
  },
  contact: {
    ka: 'კონტაქტი',
    en: 'Contact',
    ru: 'Контакт'
  },
  roadmap: {
    ka: 'გეგმა',
    en: 'Roadmap',
    ru: 'Дорожная карта'
  },
  roadmapHeroDescription: {
    ka: 'გაიგე, რა ახალი ფუნქციები მოაქვს Lumina Estate-ს. ჩვენ მუდმივად ვაუმჯობესებთ უძრავი ქონების გამოცდილებას.',
    en: 'Discover what\'s coming next to Lumina Estate. We\'re constantly working to improve your real estate experience.',
    ru: 'Узнайте, что дальше появится в Lumina Estate. Мы постоянно улучшаем опыт с недвижимостью.'
  },
  roadmapTimelineLabel: {
    ka: 'პროდუქტის გეგმა',
    en: 'Product Roadmap',
    ru: 'Дорожная карта продукта'
  },
  roadmapTimelineTitle: {
    ka: 'Lumina Estate-ის ნაბიჯ-ნაბიჯ განვითარება',
    en: 'Step-by-step evolution of Lumina Estate',
    ru: 'Пошаговое развитие Lumina Estate'
  },
  roadmapTimelineSubtitle: {
    ka: 'Aceternity-ის თაიმლაინით შთაგონებული ეს გეგმა გამოკვეთავს მთავარ ეტაპებს და ფუნქციებს, რომელთაც წელს ვამატებთ.',
    en: 'Inspired by the Aceternity timeline, this roadmap highlights key milestones and the features we\'re delivering across the year.',
    ru: 'Вдохновленная таймлайном Aceternity, эта дорожная карта подчеркивает ключевые этапы и функции, которые мы выпускаем в течение года.'
  },
  roadmapStatusCompleted: {
    ka: 'დასრულებული',
    en: 'Completed',
    ru: 'Завершено'
  },
  roadmapStatusInProgress: {
    ka: 'მიმდინარეობს',
    en: 'In Progress',
    ru: 'В процессе'
  },
  roadmapStatusPlanned: {
    ka: 'დაგეგმილი',
    en: 'Planned',
    ru: 'Запланировано'
  },
  roadmapQuarter1Title: {
    ka: 'ფუნდამენტი და საბაზისო ფუნქციები',
    en: 'Foundation & Core Features',
    ru: 'Основы и базовые функции'
  },
  roadmapQuarter1Item1: {
    ka: 'უძრავი ქონების კატალოგის სისტემა',
    en: 'Property listing system',
    ru: 'Система публикации объектов'
  },
  roadmapQuarter1Item2: {
    ka: 'ძიებისა და ფილტრაციის ფუნქციონალი',
    en: 'Search and filter functionality',
    ru: 'Функционал поиска и фильтров'
  },
  roadmapQuarter1Item3: {
    ka: 'მომხმარებლის ავტორიზაცია',
    en: 'User authentication',
    ru: 'Аутентификация пользователей'
  },
  roadmapQuarter1Item4: {
    ka: 'ძირითადი AI ჩატის ინტეგრაცია',
    en: 'Basic AI chat integration',
    ru: 'Базовая интеграция AI-чату'
  },
  roadmapQuarter1ImageAlt: {
    ka: 'Lumina Estate-ის საფუძვლების სამუშაო გეგმა',
    en: 'Blueprints and planning documents representing the project foundation',
    ru: 'Чертежи и планирование, символизирующие фундамент проекта'
  },
  roadmapQuarter2Title: {
    ka: 'გაუმჯობესებული ფუნქციები',
    en: 'Enhanced Features',
    ru: 'Расширенные возможности'
  },
  roadmapQuarter2Item1: {
    ka: 'გაფართოებული AI ხმოვანი ჩატი',
    en: 'Advanced AI voice chat',
    ru: 'Продвинутый голосовой AI-чат'
  },
  roadmapQuarter2Item2: {
    ka: 'უძრავი ქონების შედარების ინსტრუმენტი',
    en: 'Property comparison tool',
    ru: 'Инструмент сравнения объектов'
  },
  roadmapQuarter2Item3: {
    ka: 'ინვესტიციის კალკულატორი',
    en: 'Investment calculator',
    ru: 'Инвестиционный калькулятор'
  },
  roadmapQuarter2Item4: {
    ka: 'ბაზრის ანალიტიკის დაფა',
    en: 'Market analytics dashboard',
    ru: 'Панель рыночной аналитики'
  },
  roadmapQuarter2ImageAlt: {
    ka: 'ინოვაციური ინტერიერის დიზაინი Lumina Estate-ის გაუმჯობესებებისთვის',
    en: 'Modern real estate interior symbolising enhanced product features',
    ru: 'Современный интерьер, символизирующий расширенные возможности продукта'
  },
  roadmapQuarter3Title: {
    ka: 'მობილური და ინტეგრაციები',
    en: 'Mobile & Integration',
    ru: 'Мобильность и интеграции'
  },
  roadmapQuarter3Item1: {
    ka: 'მობილური აპი (iOS და Android)',
    en: 'Mobile app (iOS & Android)',
    ru: 'Мобильное приложение (iOS и Android)'
  },
  roadmapQuarter3Item2: {
    ka: 'გადახდის გეითვეის ინტეგრაცია',
    en: 'Payment gateway integration',
    ru: 'Интеграция платежного шлюза'
  },
  roadmapQuarter3Item3: {
    ka: 'CRM სისტემა აგენტებისთვის',
    en: 'CRM system for agents',
    ru: 'CRM-система для агентов'
  },
  roadmapQuarter3Item4: {
    ka: 'მრავალენოვანი მხარდაჭერის გაფართოება',
    en: 'Multi-language support expansion',
    ru: 'Расширение многоязычной поддержки'
  },
  roadmapQuarter3ImageAlt: {
    ka: 'მობილური აპის დიზაინი და ინტეგრაციები',
    en: 'Mobile devices showcasing integrated real estate applications',
    ru: 'Мобильные устройства с интегрированными приложениями недвижимости'
  },
  roadmapQuarter4Title: {
    ka: 'გაფართოებული ანალიტიკა',
    en: 'Advanced Analytics',
    ru: 'Продвинутая аналитика'
  },
  roadmapQuarter4Item1: {
    ka: 'AI-ზე დაფუძნებული ქონების რეკომენდაციები',
    en: 'AI-powered property recommendations',
    ru: 'Рекомендации объектов на базе AI'
  },
  roadmapQuarter4Item2: {
    ka: 'ბაზრის ტენდენციების პროგნოზები',
    en: 'Market trend predictions',
    ru: 'Прогнозы рыночных трендов'
  },
  roadmapQuarter4Item3: {
    ka: 'ინვესტიციის ROI კალკულატორი',
    en: 'Investment ROI calculator',
    ru: 'Калькулятор ROI инвестиций'
  },
  roadmapQuarter4Item4: {
    ka: 'ვირტუალური ტურნეები ქონებაზე',
    en: 'Virtual property tours',
    ru: 'Виртуальные туры по объектам'
  },
  roadmapQuarter4ImageAlt: {
    ka: 'მონაცემთა დაფა და AI ანალიტიკა',
    en: 'Data dashboard with AI analytics for Lumina Estate insights',
    ru: 'Панель данных с AI-аналитикой для Lumina Estate'
  },
  roadmapCtaTitle: {
    ka: 'გაქვს ფუნქციის იდეა?',
    en: 'Have a Feature Request?',
    ru: 'Есть предложение по функции?'
  },
  roadmapCtaDescription: {
    ka: 'მოხარული ვიქნებით შენი იდეების მოსმენით! გაგვიზიარე ხედვა და დაგვეხმარე Lumina Estate-ის განვითარებაში.',
    en: 'We\'d love to hear your ideas! Share your suggestions and help shape the future of Lumina Estate.',
    ru: 'Мы будем рады услышать ваши идеи! Поделитесь своим видением и помогите развивать Lumina Estate.'
  },
  roadmapCtaButton: {
    ka: 'დაგვიკავშირდი',
    en: 'Contact Us',
    ru: 'Свяжитесь с нами'
  },
  blog: {
    ka: 'ბლოგი',
    en: 'Blog',
    ru: 'Блог'
  },
  blogHeroTitle: {
    ka: 'საქართველოს უძრავი ქონების ექსპერტული ანალიზი',
    en: 'Expert Insights on Georgian Real Estate',
    ru: 'Экспертная аналитика недвижимости Грузии'
  },
  blogHeroSubtitle: {
    ka: 'გაეცანით ბაზრის ტენდენციებს, უბნების განვითარებასა და საინვესტიციო რჩევებს. ხვდით ინტერიერის ტრენდებს და პრაქტიკულ გზამკვლევებს ერთ სივრცეში.',
    en: 'Explore market trends, neighbourhood growth, and investment advice. Discover interior trends and practical guides in one place.',
    ru: 'Изучайте рыночные тренды, развитие районов и инвестиционные советы. Узнавайте интерьерные тренды и практические гиды в одном месте.'
  },
  blogHeroSlideMarketTitle: {
    ka: 'თბილისის ცათამბჯენების პანორამა',
    en: 'Skyline Panorama of Tbilisi',
    ru: 'Панорама небоскрёбов Тбилиси'
  },
  blogHeroSlideMarketDescription: {
    ka: 'სადღესასწაულო შუქები და მდინარისპირა დინამიკა, სადაც ბიზნეს ცენტრები და პრემიუმ საცხოვრებლები ერთ სივრცეში თავმოყრილია.',
    en: 'Festive lights and riverside energy where business towers meet premium residences.',
    ru: 'Праздничные огни и набережная, где деловые башни соседствуют с премиальным жильём.'
  },
  blogHeroSlideHistoricTitle: {
    ka: 'ძველი თბილისის კულტურული კვარტალი',
    en: 'Cultural Quarter of Old Tbilisi',
    ru: 'Культурный квартал Старого Тбилиси'
  },
  blogHeroSlideHistoricDescription: {
    ka: 'თბილი ქვაფენილი, ისტორიული აივნები და ქუჩის არტი, რომელიც ინვესტორებსა და სტუმრებს იზიდავს.',
    en: 'Warm cobblestones, historic balconies, and street art that attracts investors and visitors alike.',
    ru: 'Тёплая брусчатка, исторические балконы и стрит-арт, привлекающие инвесторов и гостей.'
  },
  blogHeroSlideInteriorTitle: {
    ka: 'ინტერიერი მაღალი სილამაზის სტანდარტებით',
    en: 'Interior with Elevated Aesthetics',
    ru: 'Интерьер с высокими стандартами эстетики'
  },
  blogHeroSlideInteriorDescription: {
    ka: 'მაქსიმალური ბუნებრივი შუქი, გონივრული ზონირება და ნატურალური ტექსტურები პრემიუმ ბინებისთვის.',
    en: 'Maximum natural light, smart zoning, and natural textures for premium apartments.',
    ru: 'Максимум естественного света, продуманное зонирование и натуральные фактуры для премиальных апартаментов.'
  },
  blogHeroSlideInvestmentTitle: {
    ka: 'საინვესტიციო შესაძლებლობები სანაპიროზე',
    en: 'Coastal Investment Opportunities',
    ru: 'Инвестиционные возможности на побережье'
  },
  blogHeroSlideInvestmentDescription: {
    ka: 'აპარტ-ჰოტელები და დასვენების ზონები მაღალი გაქირავების მაჩვენებლითა და სტაბილური მოთხოვნით.',
    en: 'Aparthotels and leisure zones delivering high occupancy and consistent returns.',
    ru: 'Апарт-отели и зоны отдыха с высокой заполняемостью и стабильной доходностью.'
  },
  blogHeroEyebrow: {
    ka: 'LUMINA INSIGHTS',
    en: 'LUMINA INSIGHTS',
    ru: 'LUMINA INSIGHTS'
  },
  blogSearchPlaceholder: {
    ka: 'სტატიების ძიება...',
    en: 'Search articles...',
    ru: 'Искать статьи...'
  },
  blogLastViewed: {
    ka: 'ბოლოს ნანახი',
    en: 'Last viewed',
    ru: 'Последние'
  },
  blogAllArticles: {
    ka: 'ყველა სტატია',
    en: 'All articles',
    ru: 'Все статьи'
  },
  blogFeatured: {
    ka: 'რჩეული',
    en: 'Featured',
    ru: 'Избранное'
  },
  blogCategoryGuides: {
    ka: 'გიდები',
    en: 'Guides',
    ru: 'Гайды'
  },
  blogCategoryInvestments: {
    ka: 'ინვესტიციები',
    en: 'Investments',
    ru: 'Инвестиции'
  },
  blogCategoryInterior: {
    ka: 'ინტერიერი',
    en: 'Interior',
    ru: 'Интерьер'
  },
  blogCategoryRenovation: {
    ka: 'გადაკეთებები',
    en: 'Renovations',
    ru: 'Реновации'
  },
  blogCategoryMarket: {
    ka: 'ბაზრის ანალიზი',
    en: 'Market Analysis',
    ru: 'Аналитика рынка'
  },
  blogReadTimeSuffix: {
    ka: 'წთ',
    en: 'min',
    ru: 'мин'
  },
  blogStartReading: {
    ka: 'კითხვის დაწყება',
    en: 'Start reading',
    ru: 'Читать'
  },
  blogEditorsPick: {
    ka: 'რედაქტორის არჩევანი',
    en: "Editor's Pick",
    ru: 'Выбор редакции'
  },
  blogLoadMore: {
    ka: 'მეტი სტატიები',
    en: 'More articles',
    ru: 'Больше статей'
  },
  blogShare: {
    ka: 'გაზიარება',
    en: 'Share',
    ru: 'Поделиться'
  },
  blogCopyLink: {
    ka: 'ბმულის კოპირება',
    en: 'Copy link',
    ru: 'Скопировать ссылку'
  },
  blogStatsArticles: {
    ka: 'სტატიები',
    en: 'Articles',
    ru: 'Статьи'
  },
  blogStatsCategories: {
    ka: 'კატეგორიები',
    en: 'Categories',
    ru: 'Категории'
  },
  blogStatsFeatured: {
    ka: 'რჩეული',
    en: 'Featured',
    ru: 'Избранные'
  },
  blogConsultationCta: {
    ka: 'გსურთ კონსულტაცია? დაუკავშირდით ჩვენს ექსპერტებს და მიიღეთ პერსონალური რჩევა რამდენიმე წუთში.',
    en: 'Need consultation? Contact our experts for personalised advice in minutes.',
    ru: 'Нужна консультация? Свяжитесь с нашими экспертами и получите персональный совет за несколько минут.'
  },
  blogConsultationButton: {
    ka: 'კონსულტაციის დაჯავშნა',
    en: 'Book consultation',
    ru: 'Записаться на консультацию'
  },
  blogPopularArticles: {
    ka: 'პოპულარული სტატიები',
    en: 'Popular articles',
    ru: 'Популярные статьи'
  },
  blogArticleBadgeNew: {
    ka: 'ახალი',
    en: 'New',
    ru: 'Новое'
  },
  blogArticleBadgeInsight: {
    ka: 'ინსაითი',
    en: 'Insight',
    ru: 'Инсайт'
  },
  blogOverlayLead: {
    ka: 'მარტივად წასაკითხი, კარგად დამუშავებული აბზაცები, რომლებიც დაგეხმარებათ გადაწყვეტილების მიღებაში.',
    en: 'Readable, well-structured paragraphs that help you make confident decisions.',
    ru: 'Читаемые, структурированные абзацы, которые помогают принимать уверенные решения.'
  },
  blogOverlaySecondary: {
    ka: 'გადახედეთ მნიშვნელოვან საკითხებს შეკუმშული სიების და მოკლე რჩევების სახით.',
    en: 'Review key considerations distilled into concise checklists and quick tips.',
    ru: 'Изучайте важные моменты, собранные в краткие чек-листы и советы.'
  },
  blogOverlayListOne: {
    ka: 'შესაბამისი მონაცემები და მაგალითები რეალური ბაზრიდან',
    en: 'Relevant data points with real-market examples',
    ru: 'Актуальные данные и примеры с реального рынка'
  },
  blogOverlayListTwo: {
    ka: 'მოქმედების შკალა — რა გააკეთოთ შემდეგი ნაბიჯისთვის',
    en: 'Actionable checklist for your next steps',
    ru: 'Практический чек-лист для следующих шагов'
  },
  blogOverlayListThree: {
    ka: 'ექსპერტის რჩევები, რომლებსაც დაუყოვნებლივ გამოიყენებთ',
    en: 'Expert tips you can apply immediately',
    ru: 'Советы экспертов, которые можно применить сразу'
  },
  blogPost1Title: {
    ka: 'რუხი, მოდერნული ბინა – ინტერიერის თანამედროვე მიდგომა',
    en: 'Grey, Modern Apartment – A Contemporary Interior Approach',
    ru: 'Серая современная квартира — актуальный подход к интерьеру'
  },
  blogPost1Excerpt: {
    ka: 'მოდერნისტული გადაწყვეტები და თბილი ტექსტურების ბალანსი. როგორ შევქმნათ კომფორტული და ფუნქციური სივრცე მცირე ბიუჯეტით.',
    en: 'Balancing modernist lines with warm textures: how to create a comfortable, functional space on a modest budget.',
    ru: 'Баланс модернистских линий и тёплых текстур: как создать уютное и функциональное пространство при умеренном бюджете.'
  },
  blogPost1Author: {
    ka: 'ანა სარაბაია',
    en: 'Ana Sarabaia',
    ru: 'Ана Сарабаия'
  },
  blogPost2Title: {
    ka: 'ბაზრის ანალიზი: ფასების დინამიკა 2024 წელს',
    en: 'Market Analysis: Price Dynamics in 2024',
    ru: 'Анализ рынка: динамика цен в 2024 году'
  },
  blogPost2Excerpt: {
    ka: 'რა ფაქტორები განსაზღვრავს ფასების ზრდას თბილისში და რეგიონებში. რომელი უბნები ინარჩუნებს ყველაზე მაღალ მოთხოვნას.',
    en: 'Key factors behind price growth in Tbilisi and beyond, and the neighbourhoods that continue to lead demand.',
    ru: 'Ключевые факторы роста цен в Тбилиси и регионах, а также районы с устойчивым спросом.'
  },
  blogPost2Author: {
    ka: 'ლიკა ქავთარაძე',
    en: 'Lika Kavtaradze',
    ru: 'Лика Кавтарадзе'
  },
  blogPost3Title: {
    ka: 'Airbnb თუ გრძელვადიანი ქირავნება – რომელი მოდელია მოგებიანი?',
    en: 'Airbnb vs Long-Term Rentals – Which Model Wins?',
    ru: 'Airbnb или долгосрочная аренда — какая модель выгоднее?'
  },
  blogPost3Excerpt: {
    ka: 'შემოსავლიანობის შედარება, სეზონურობის ეფექტი და სამართლებრივი დეტალები. როდის სჯობს მოკლევადიანი გაქირავება და როდის — გრძელვადიანი.',
    en: 'Compare profitability, seasonality, and legal nuances to decide when short-term or long-term rentals make more sense.',
    ru: 'Сравниваем доходность, сезонность и правовые нюансы, чтобы понять, когда выгоднее краткосрочная или долгосрочная аренда.'
  },
  blogPost3Author: {
    ka: 'ლევან თათარიშვილი',
    en: 'Levan Tatarishvili',
    ru: 'Леван Татаришвили'
  },
  blogPost4Title: {
    ka: 'სახლის ყიდვის გზამკვლევი – ნაბიჯ-ნაბიჯ პროცესი',
    en: 'Home Buying Guide – Step by Step',
    ru: 'Покупка жилья: пошаговое руководство'
  },
  blogPost4Excerpt: {
    ka: 'სესხის წინასწარი დამტკიცებიდან საბოლოო რეგისტრაციამდე. რას უნდა მიაქციოთ ყურადღება დათვალიერებისას და შესყიდვის კონტრაქტში.',
    en: 'From pre-approval to final registration: what to inspect during viewings and the clauses to watch in your purchase agreement.',
    ru: 'От предварительного одобрения кредита до регистрации: на что обратить внимание при осмотре и в договоре купли-продажи.'
  },
  blogPost4Author: {
    ka: 'გიორგი მდივანი',
    en: 'Giorgi Midivani',
    ru: 'Гиорги Мдивани'
  },
  blogPost5Title: {
    ka: 'ინტერიერის ტრენდები 2024: თბილი მიწისფერი პალიტრა',
    en: 'Interior Trends 2024: Warm Earthy Palette',
    ru: 'Тренды интерьера 2024: тёплая природная палитра'
  },
  blogPost5Excerpt: {
    ka: 'ნატურალური ხე, ქვის ტექსტურები და სხივოვანი განათება — როგორ შევქმნათ მშვიდი, მყუდრო ატმოსფერო თანამედროვე ბინაში.',
    en: 'Natural wood, stone textures, and layered lighting: creating a calm and cosy atmosphere in a contemporary home.',
    ru: 'Натуральное дерево, каменные фактуры и слоистое освещение: как создать спокойную и уютную атмосферу в современном доме.'
  },
  blogPost5Author: {
    ka: 'ელენე კოპაძე',
    en: 'Elene Kopadze',
    ru: 'Элене Копадзе'
  },
  blogPost6Title: {
    ka: 'როგორ გავზარდოთ ქონების ღირებულება რემონტის გარეშე',
    en: 'How to Increase Property Value Without Renovation',
    ru: 'Как повысить стоимость недвижимости без ремонта'
  },
  blogPost6Excerpt: {
    ka: 'სტაილინგი, განათება და ფოტოების ხარისხი — პატარა ცვლილებები, რომლებიც დიდ სხვაობას ქმნის გაყიდვებში.',
    en: 'Styling, lighting, and strong photography: small changes that make a big difference when selling.',
    ru: 'Стайлинг, освещение и качественные фото — небольшие изменения, которые сильно влияют на продажу.'
  },
  blogPost6Author: {
    ka: 'ნინო ქავთარაძე',
    en: 'Nino Kavtaradze',
    ru: 'Нино Кавтарадзе'
  },
  // Short tagline under logo
  searchingHomes: {
    ka: 'სახლების ძიება',
    en: 'Searching homes',
    ru: 'Поиск жилья'
  },
  pages: {
    ka: 'გვერდები',
    en: 'Pages',
    ru: 'Страницы'
  },
  legal: {
    ka: 'იურიდიული',
    en: 'Legal',
    ru: 'Юридическое'
  },
  dashboard: {
    ka: 'დეშბორდი',
    en: 'Dashboard',
    ru: 'Панель'
  },
  clients: {
    ka: 'კლიენტები',
    en: 'Clients',
    ru: 'Клиенты'
  },
  analytics: {
    ka: 'ანალიტიკა',
    en: 'Analytics',
    ru: 'Аналитика'
  },
  
  // Menu items
  login: {
    ka: 'შესვლა',
    en: 'Login',
    ru: 'Войти'
  },
  agentDashboard: {
    ka: 'აგენტის დეშბორდი',
    en: 'Agent Dashboard',
    ru: 'Панель агента'
  },
  profile: {
    ka: 'ჩემი პროფილი',
    en: 'My Profile',
    ru: 'Мой профиль'
  },
  logout: {
    ka: 'გასვლა',
    en: 'Logout',
    ru: 'Выйти'
  },
  signup: {
    ka: 'რეგისტრაცია',
    en: 'Sign Up',
    ru: 'Регистрация'
  },
  search: {
    ka: 'ძებნა',
    en: 'Search',
    ru: 'Поиск'
  },
  favorites: {
    ka: 'რჩეულები',
    en: 'Favorites',
    ru: 'Избранное'
  },
  addToFavorites: {
    ka: 'რჩეულებში დამატება',
    en: 'Add to favorites',
    ru: 'Добавить в избранное'
  },
  compare: {
    ka: 'შედარება',
    en: 'Compare',
    ru: 'Сравнение'
  },
  compareNow: {
    ka: 'შედარება ახლა',
    en: 'Compare now',
    ru: 'Сравнить'
  },
  addToCompare: {
    ka: 'დამატება შედარებაში',
    en: 'Add to compare',
    ru: 'Добавить к сравнению'
  },
  addedToCompare: {
    ka: 'დამატებულია შედარებაში',
    en: 'Added to compare',
    ru: 'Добавлено к сравнению'
  },
  clearAll: {
    ka: 'გასუფთავება',
    en: 'Clear all',
    ru: 'Очистить'
  },
  minTwoObjects: {
    ka: 'მინ. 2 ობიექტი',
    en: 'Min. 2 items',
    ru: 'Мин. 2 объекта'
  },
  compareEmptyState: {
    ka: 'არაფერი არაა არჩეული, სცადე არჩევა',
    en: 'Nothing selected. Try choosing some properties.',
    ru: 'Ничего не выбрано. Выберите объекты.'
  },
  photo: { ka: 'ფოტო', en: 'Photo', ru: 'Фото' },
  price: { ka: 'ფასი', en: 'Price', ru: 'Цена' },
  area: { ka: 'ფართობი (მ²)', en: 'Area (m²)', ru: 'Площадь (м²)' },
  bedrooms: { ka: 'საძინებლები', en: 'Bedrooms', ru: 'Спальни' },
  bathrooms: { ka: 'სააბაზანოები', en: 'Bathrooms', ru: 'Ванные' },
  year: { ka: 'წელი', en: 'Year', ru: 'Год' },
  address: { ka: 'მისამართი', en: 'Address', ru: 'Адрес' },
  amenities: { ka: 'საუკეთესოები', en: 'Amenities', ru: 'Удобства' },
  status: { ka: 'სტატუსი', en: 'Status', ru: 'Статус' },
  attribute: { ka: 'ატრიბუტი', en: 'Attribute', ru: 'Параметр' },
  remove: { ka: 'წაშლა', en: 'Remove', ru: 'Удалить' },
  browseProperties: { ka: 'ქონებების დათვალიერება', en: 'Browse properties', ru: 'Смотреть объекты' },
  pricePerSqm: { ka: 'ფასი / მ²', en: 'Price / m²', ru: 'Цена / м²' },
  estimatedMonthly: { ka: 'MONTHLY', en: 'Estimated monthly', ru: 'Ежемесячный платёж' },
  perMonth: { ka: '/თვეში', en: '/mo', ru: '/мес' },
  energyClass: { ka: 'ენერგო კლასი', en: 'Energy Class', ru: 'Класс энергоэфф.' },
  showDifferences: { ka: 'მაჩვენე განსხვავებები', en: 'Show only differences', ru: 'Показывать отличия' },
  darkMode: {
    ka: 'მუქი რეჟიმი',
    en: 'Dark Mode',
    ru: 'Тёмный режим'
  },
  lightMode: {
    ka: 'ღია რეჟიმი',
    en: 'Light Mode',
    ru: 'Светлый режим'
  },
  language: {
    ka: 'ენა',
    en: 'Language',
    ru: 'Язык'
  },
  
  // Language names
  georgian: {
    ka: 'ქართული',
    en: 'Georgian',
    ru: 'Грузинский'
  },
  english: {
    ka: 'ინგლისური',
    en: 'English',
    ru: 'Английский'
  },
  russian: {
    ka: 'რუსული',
    en: 'Russian',
    ru: 'Русский'
  },

  // Hero Section
  heroSectionLabel: {
    ka: 'ჰერო სექცია',
    en: 'Hero section',
    ru: 'Герой секция'
  },
  heroTitle: {
    ka: 'იპოვეთ თქვენი იდეალური სახლი',
    en: 'Find Your Perfect Home',
    ru: 'Найдите свой идеальный дом'
  },
  heroSubtitle: {
    ka: 'ლუმინა ესტეითთან ერთად აღმოაცენით პრემიუმ უძრავი ქონების შესაძლებლობები. პროფესიონალური მომსახურება და ექსპერტული რჩევები.',
    en: 'Discover premium real estate opportunities with Lumina Estate. Professional service and expert advice for your dream property.',
    ru: 'Откройте для себя возможности премиальной недвижимости с Lumina Estate. Профессиональное обслуживание и экспертные советы.'
  },
  searchPlaceholder: {
    ka: 'მდებარეობა',
    en: 'Location',
    ru: 'Местоположение'
  },
  propertyType: {
    ka: 'ქონების ტიპი',
    en: 'Property Type',
    ru: 'Тип недвижимости'
  },
  priceRange: {
    ka: 'ფასების დიაპაზონი',
    en: 'Price Range',
    ru: 'Ценовой диапазон'
  },
  searchButton: {
    ka: 'ძებნა',
    en: 'Search',
    ru: 'Поиск'
  },

  // Property Types
  apartment: {
    ka: 'ბინა',
    en: 'Apartment',
    ru: 'Квартира'
  },
  house: {
    ka: 'სახლი',
    en: 'House',
    ru: 'Дом'
  },
  villa: {
    ka: 'ვილა',
    en: 'Villa',
    ru: 'Вилла'
  },
  commercial: {
    ka: 'კომერციული',
    en: 'Commercial',
    ru: 'Коммерческая'
  },
  studio: {
    ka: 'სტუდიო',
    en: 'Studio',
    ru: 'Студия'
  },
  penthouse: {
    ka: 'პენთჰაუსი',
    en: 'Penthouse',
    ru: 'Пентхаус'
  },
  anyPropertyType: {
    ka: 'ნებისმიერი ტიპი',
    en: 'Any Type',
    ru: 'Любой тип'
  },
  anyPriceRange: {
    ka: 'ნებისმიერი ფასი',
    en: 'Any Price',
    ru: 'Любая цена'
  },

  // Features Section
  featuresTitle: {
    ka: 'რატომ ლუმინა ესტეითი?',
    en: 'Why Lumina Estate?',
    ru: 'Почему Lumina Estate?'
  },
  expertAgents: {
    ka: 'ექსპერტი აგენტები',
    en: 'Expert Agents',
    ru: 'Эксперт агенты'
  },
  expertAgentsDesc: {
    ka: 'ჩვენი გამოცდილი აგენტები დაგეხმარებიან იპოვოთ სრულყოფილი ქონება',
    en: 'Our experienced agents will help you find the perfect property',
    ru: 'Наши опытные агенты помогут вам найти идеальную недвижимость'
  },
  premiumListings: {
    ka: 'პრემიუმ განცხადებები',
    en: 'Premium Listings',
    ru: 'Премиум объявления'
  },
  premiumListingsDesc: {
    ka: 'მხოლოდ საუკეთესო და შემოწმებული უძრავი ქონების შეთავაზებები',
    en: 'Only the best and verified real estate offers',
    ru: 'Только лучшие и проверенные предложения недвижимости'
  },
  smartTechnology: {
    ka: 'ჭკვიანი ტექნოლოგია',
    en: 'Smart Technology',
    ru: 'Умные технологии'
  },
  smartTechnologyDesc: {
    ka: 'AI-ით გაძლიერებული ძებნა და პერსონალიზებული რეკომენდაციები',
    en: 'AI-powered search and personalized recommendations',
    ru: 'Поиск с помощью ИИ и персонализированные рекомендации'
  },

  // Contact Section
  contactTitle: {
    ka: 'დაგვიკავშირდით',
    en: 'Contact Us',
    ru: 'Свяжитесь с нами'
  },
  contactSubtitle: {
    ka: 'მზად ვართ დაგეხმაროთ თქვენი უძრავი ქონების საჭიროებებში',
    en: 'Ready to help you with your real estate needs',
    ru: 'Готовы помочь вам с вашими потребностями в недвижимости'
  },
  phone: {
    ka: 'ტელეფონი',
    en: 'Phone',
    ru: 'Телефон'
  },
  email: {
    ka: 'ელ. ფოსტა',
    en: 'Email',
    ru: 'Эл. почта'
  },
  addressValue: {
    ka: 'თბილისი, საქართველო',
    en: 'Tbilisi, Georgia',
    ru: 'Тбилиси, Грузия'
  },
  
  // Properties Page
  allProperties: {
    ka: 'ყველა ქონება',
    en: 'All Properties',
    ru: 'Вся недвижимость'
  },
  discoverPerfectProperty: {
    ka: 'იპოვეთ თქვენი იდეალური ქონება',
    en: 'Discover your perfect property',
    ru: 'Найдите свою идеальную недвижимость'
  },
  uploadProperty: {
    ka: 'ქონების ატვირთვა',
    en: 'Upload Property',
    ru: 'Загрузить недвижимость'
  },
  addProperty: {
    ka: 'ქონების დამატება',
    en: 'Add Property',
    ru: 'Добавить недвижимость'
  },
  basicInformation: {
    ka: 'ძირითადი ინფორმაცია',
    en: 'Basic Information',
    ru: 'Основная информация'
  },
  propertyTitle: {
    ka: 'ქონების სათაური',
    en: 'Property Title',
    ru: 'Название недвижимости'
  },
  enterPropertyTitle: {
    ka: 'შეიყვანეთ ქონების სათაური',
    en: 'Enter property title',
    ru: 'Введите название недвижимости'
  },
  district: {
    ka: 'რაიონი',
    en: 'District',
    ru: 'Район'
  },
  selectDistrict: {
    ka: 'აირჩიეთ რაიონი',
    en: 'Select district',
    ru: 'Выберите район'
  },
  selectPropertyType: {
    ka: 'აირჩიეთ ქონების ტიპი',
    en: 'Select property type',
    ru: 'Выберите тип недвижимости'
  },
  transactionType: {
    ka: 'გარიგების ტიპი',
    en: 'Transaction Type',
    ru: 'Тип сделки'
  },
  selectTransactionType: {
    ka: 'აირჩიეთ გარიგების ტიპი',
    en: 'Select transaction type',
    ru: 'Выберите тип сделки'
  },
  fullAddress: {
    ka: 'სრული მისამართი',
    en: 'Full Address',
    ru: 'Полный адрес'
  },
  enterFullAddress: {
    ka: 'შეიყვანეთ სრული მისამართი',
    en: 'Enter full address',
    ru: 'Введите полный адрес'
  },
  description: {
    ka: 'აღწერა',
    en: 'Description',
    ru: 'Описание'
  },
  enterPropertyDescription: {
    ka: 'შეიყვანეთ ქონების აღწერა',
    en: 'Enter property description',
    ru: 'Введите описание недвижимости'
  },
  propertyDetails: {
    ka: 'ქონების დეტალები',
    en: 'Property Details',
    ru: 'Детали недвижимости'
  },
  floor: {
    ka: 'სართული',
    en: 'Floor',
    ru: 'Этаж'
  },
  totalFloors: {
    ka: 'სართულების რაოდენობა',
    en: 'Total Floors',
    ru: 'Общее количество этажей'
  },
  propertyImages: {
    ka: 'ქონების ფოტოები',
    en: 'Property Images',
    ru: 'Фотографии недвижимости'
  },
  dragDropImages: {
    ka: 'ჩააგდეთ ფოტოები აქ ან დააწკაპუნეთ ასარჩევად',
    en: 'Drag and drop images here or click to select',
    ru: 'Перетащите изображения сюда или нажмите для выбора'
  },
  selectImages: {
    ka: 'ფოტოების არჩევა',
    en: 'Select Images',
    ru: 'Выбрать изображения'
  },
  uploading: {
    ka: 'იტვირთება...',
    en: 'Uploading...',
    ru: 'Загружается...'
  },
  filters: {
    ka: 'ფილტრები',
    en: 'Filters',
    ru: 'Фильтры'
  },
  
  // Pagination
  showing: {
    ka: 'ნაჩვენებია',
    en: 'Showing',
    ru: 'Показано'
  },
  of: {
    ka: '-დან',
    en: 'of',
    ru: 'из'
  },
  page: {
    ka: 'გვერდი',
    en: 'Page',
    ru: 'Страница'
  },
  previous: {
    ka: 'წინა',
    en: 'Previous',
    ru: 'Предыдущая'
  },
  next: {
    ka: 'შემდეგი',
    en: 'Next',
    ru: 'Следующая'
  },
  goToPage: {
    ka: 'გვერდზე გადასვლა',
    en: 'Go to page',
    ru: 'Перейти на страницу'
  },
  propertiesCount: {
    ka: 'ქონება',
    en: 'properties',
    ru: 'недвижимость'
  },
  

  // Agents Page
  ourAgents: {
    ka: 'ჩვენი აგენტები',
    en: 'Our Agents',
    ru: 'Наши Агенты'
  },
  meetTeam: {
    ka: 'გაიცანით ჩვენი გუნდი',
    en: 'Meet Our Team',
    ru: 'Познакомьтесь с нашей командой'
  },
  experience: {
    ka: 'გამოცდილება',
    en: 'Experience',
    ru: 'Опыт'
  },
  years: {
    ka: 'წელი',
    en: 'years',
    ru: 'лет'
  },
  specialization: {
    ka: 'სპეციალიზაცია',
    en: 'Specialization',
    ru: 'Специализация'
  },
  contactAgent: {
    ka: 'აგენტთან კონტაქტი',
    en: 'Contact Agent',
    ru: 'Связаться с агентом'
  },

  // Team Members
  teamMember1Name: {
    ka: 'ნინო გელაშვილი',
    en: 'Nino Gelashvili',
    ru: 'Нино Гелашвили'
  },
  teamMember1Role: {
    ka: 'უფროსი უძრავი ქონების აგენტი',
    en: 'Senior Real Estate Agent',
    ru: 'Старший агент по недвижимости'
  },
  teamMember1Experience: {
    ka: '8 წელი',
    en: '8 years',
    ru: '8 лет'
  },
  teamMember2Name: {
    ka: 'დავით მამაცაშვილი',
    en: 'Davit Mamacashvili',
    ru: 'Давид Мамацашвили'
  },
  teamMember2Role: {
    ka: 'ქონების ინვესტიციების კონსულტანტი',
    en: 'Property Investment Consultant',
    ru: 'Консультант по инвестициям в недвижимость'
  },
  teamMember2Experience: {
    ka: '12 წელი',
    en: '12 years',
    ru: '12 лет'
  },
  teamMember3Name: {
    ka: 'ანა ხუციშვილი',
    en: 'Ana Khutsishvili',
    ru: 'Ана Хуцишвили'
  },
  teamMember3Role: {
    ka: 'ლუქს ქონების სპეციალისტი',
    en: 'Luxury Property Specialist',
    ru: 'Специалист по элитной недвижимости'
  },
  teamMember3Experience: {
    ka: '6 წელი',
    en: '6 years',
    ru: '6 лет'
  },
  teamMember4Name: {
    ka: 'გიორგი ნადირაძე',
    en: 'Giorgi Nadiradze',
    ru: 'Георгий Надирадзе'
  },
  teamMember4Role: {
    ka: 'კომერციული უძრავი ქონების ექსპერტი',
    en: 'Commercial Real Estate Expert',
    ru: 'Эксперт по коммерческой недвижимости'
  },
  teamMember4Experience: {
    ka: '15 წელი',
    en: '15 years',
    ru: '15 лет'
  },

  // Footer
  footerDescription: {
    ka: 'ლუმინა ესტეითი - თქვენი სანდო პარტნიორი უძრავი ქონების სფეროში',
    en: 'Lumina Estate - Your trusted partner in real estate',
    ru: 'Lumina Estate - Ваш надежный партнер в сфере недвижимости'
  },
  quickLinks: {
    ka: 'სწრაფი ბმულები',
    en: 'Quick Links',
    ru: 'Быстрые ссылки'
  },
  services: {
    ka: 'მომსახურებები',
    en: 'Services',
    ru: 'Услуги'
  },
  buyProperty: {
    ka: 'ქონების ყიდვა',
    en: 'Buy Property',
    ru: 'Купить недвижимость'
  },
  sellProperty: {
    ka: 'ქონების გაყიდვა',
    en: 'Sell Property',
    ru: 'Продать недвижимость'
  },
  rentProperty: {
    ka: 'ქონების ქირავება',
    en: 'Rent Property',
    ru: 'Арендовать недвижимость'
  },
  propertyManagement: {
    ka: 'ქონების მართვა',
    en: 'Property Management',
    ru: 'Управление недвижимостью'
  },
  followUs: {
    ka: 'გამოგვყევით',
    en: 'Follow Us',
    ru: 'Подписывайтесь'
  },
  allRightsReserved: {
    ka: 'ყველა უფლება დაცულია',
    en: 'All rights reserved',
    ru: 'Все права защищены'
  },

  // Common
  loading: {
    ka: 'იტვირთება...',
    en: 'Loading...',
    ru: 'Загрузка...'
  },
  error: {
    ka: 'შეცდომა',
    en: 'Error',
    ru: 'Ошибка'
  },
  success: {
    ka: 'წარმატება',
    en: 'Success',
    ru: 'Успех'
  },
  save: {
    ka: 'შენახვა',
    en: 'Save',
    ru: 'Сохранить'
  },
  cancel: {
    ka: 'გაუქმება',
    en: 'Cancel',
    ru: 'Отмена'
  },
  submit: {
    ka: 'გაგზავნა',
    en: 'Submit',
    ru: 'Отправить'
  },
  close: {
    ka: 'დახურვა',
    en: 'Close',
    ru: 'Закрыть'
  },

  // Additional translations (deduped)

  // Hero section search form
  searchProperties: {
    ka: 'ქონების ძებნა',
    en: 'Search Properties',
    ru: 'Поиск недвижимости'
  },

  // Common phrases
  discoverYourPerfectProperty: {
    ka: 'აღმოაცენით თქვენი სრულყოფილი ქონება',
    en: 'Discover your perfect property',
    ru: 'Откройте для себя идеальную недвижимость'
  },
  propertyCount: {
    ka: 'ქონება',
    en: 'properties',
    ru: 'объектов'
  },
  propertiesFound: {
    ka: 'ქონება ნაპოვნია',
    en: 'Properties Found',
    ru: 'Найдено объектов'
  },
  searchResultsFor: {
    ka: 'ძებნის შედეგები:',
    en: 'Search results for',
    ru: 'Результаты поиска для'
  },
  noPropertiesFound: {
    ka: 'ქონება ვერ მოიძებნა',
    en: 'No properties found',
    ru: 'Недвижимость не найдена'
  },
  tryAdjustingFilters: {
    ka: 'სცადეთ ძებნის კრიტერიუმების ან ფილტრების შეცვლა მეტი ქონების მოსაძებნად.',
    en: 'Try adjusting your search criteria or filters to find more properties.',
    ru: 'Попробуйте изменить критерии поиска или фильтры, чтобы найти больше объектов.'
  },
  searchAgents: {
    ka: 'აგენტების ძებნა...',
    en: 'Search agents...',
    ru: 'Поиск агентов...'
  },
  noAgentsFound: {
    ka: 'აგენტები ვერ მოიძებნა',
    en: 'No agents found matching your search',
    ru: 'Агенты не найдены'
  },

  // Map related
  loadingMap: {
    ka: 'რუკა იტვირთება...',
    en: 'Loading map...',
    ru: 'Загрузка карты...'
  },
  resetView: {
    ka: 'ნახვის განულება',
    en: 'Reset view',
    ru: 'Сбросить вид'
  },

  // Transaction types
  forSale: {
    ka: 'იყიდება',
    en: 'For Sale',
    ru: 'Продается'
  },
  forRent: {
    ka: 'ქირავდება',
    en: 'For Rent',
    ru: 'Сдается'
  },
  forLease: {
    ka: 'გირავდება',
    en: 'For Lease',
    ru: 'В аренду'
  },

  // Construction status
  newProperty: {
    ka: 'ახალი',
    en: 'New',
    ru: 'Новый'
  },
  // Generic "new" label used by some components
  new: {
    ka: 'ახალი',
    en: 'New',
    ru: 'Новый'
  },
  newConstruction: {
    ka: 'ახალი აშენებული',
    en: 'New Construction',
    ru: 'Новостройка'
  },
  underConstruction: {
    ka: 'მშენებარე',
    en: 'Under Construction',
    ru: 'Строится'
  },
  oldConstruction: {
    ka: 'ძველი აშენებული',
    en: 'Old Construction',
    ru: 'Старая постройка'
  },
  renovated: {
    ka: 'რემონტირებული',
    en: 'Renovated',
    ru: 'С ремонтом'
  },

  // Floor options
  firstFloor: {
    ka: 'პირველი სართული',
    en: 'First Floor',
    ru: 'Первый этаж'
  },
  lastFloor: {
    ka: 'ბოლო სართული',
    en: 'Last Floor',
    ru: 'Последний этаж'
  },
  middleFloors: {
    ka: 'შუა სართულები',
    en: 'Middle Floors',
    ru: 'Средние этажи'
  },
  floor15: {
    ka: '1-5 სართული',
    en: '1-5 Floor',
    ru: '1-5 этаж'
  },
  floor610: {
    ka: '6-10 სართული',
    en: '6-10 Floor',
    ru: '6-10 этаж'
  },
  floor1115: {
    ka: '11-15 სართული',
    en: '11-15 Floor',
    ru: '11-15 этаж'
  },
  floor16plus: {
    ka: '16+ სართული',
    en: '16+ Floor',
    ru: '16+ этаж'
  },

  // Furniture status
  furnished: {
    ka: 'ავეჯით',
    en: 'Furnished',
    ru: 'С мебелью'
  },
  partiallyFurnished: {
    ka: 'ნაწილობრივ ავეჯით',
    en: 'Partially Furnished',
    ru: 'Частично меблированная'
  },
  unfurnished: {
    ka: 'ავეჯის გარეშე',
    en: 'Unfurnished',
    ru: 'Без мебели'
  },

  // Filter labels
  constructionStatus: {
    ka: 'მშენებლობის სტატუსი',
    en: 'Construction Status',
    ru: 'Статус строительства'
  },
  myLocation: {
    ka: 'ჩემი მდებარეობა',
    en: 'My location',
    ru: 'Моё местоположение'
  },
  propertiesOnMap: {
    ka: 'უძრავი ქონება რუკაზე',
    en: 'properties on map',
    ru: 'объектов на карте'
  },

  // New translations
  warning: {
    ka: 'გაფრთხილება',
    en: 'Warning',
    ru: 'Предупреждение'
  },
  googleMapsApiKeyRequired: {
    ka: 'Google Maps API Key საჭიროა რუქის სწორი მუშაობისთვის',
    en: 'Google Maps API Key is required for proper map functionality',
    ru: 'Для корректной работы карты требуется Google Maps API Key'
  },
  gridView: {
    ka: 'ბადის ხედი',
    en: 'Grid View',
    ru: 'Сетка'
  },
  mapView: {
    ka: 'რუქის ხედი',
    en: 'Map View',
    ru: 'Карта'
  },
  zoomIn: {
    ka: 'გადიდება',
    en: 'Zoom In',
    ru: 'Увеличить'
  },
  zoomOut: {
    ka: 'დაპატარავება',
    en: 'Zoom Out',
    ru: 'Уменьшить'
  },
  typeMessage: {
    ka: 'დაწერეთ შეკითხვა...',
    en: 'Type your message...',
    ru: 'Введите сообщение...'
  },
  askAI: {
    ka: 'AI-ს კითხვა',
    en: 'Ask AI',
    ru: 'Спросить ИИ'
  },
  send: {
    ka: 'გაგზავნა',
    en: 'Send',
    ru: 'Отправить'
  },
  showMore: {
    ka: 'მეტის ნახვა',
    en: 'Show More',
    ru: 'Показать больше'
  },
  showLess: {
    ka: 'ნაკლების ნახვა',
    en: 'Show Less',
    ru: 'Показать меньше'
  },

  // Settings menu
  settings: {
    ka: 'პარამეტრები',
    en: 'Settings',
    ru: 'Настройки'
  },
  notifications: {
    ka: 'შეტყობინებები',
    en: 'Notifications',
    ru: 'Уведомления'
  },
  privacy: {
    ka: 'კონფიდენციალურობა',
    en: 'Privacy',
    ru: 'Конфиденциальность'
  },
  accountSettings: {
    ka: 'ანგარიშის პარამეტრები',
    en: 'Account Settings',
    ru: 'Настройки аккаунта'
  },
  help: {
    ka: 'დახმარება',
    en: 'Help',
    ru: 'Помощь'
  },
  support: {
    ka: 'მხარდაჭერა',
    en: 'Support',
    ru: 'Поддержка'
  },
  theme: {
    ka: 'თემა',
    en: 'Theme',
    ru: 'Тема'
  },
  on: {
    ka: 'ჩართული',
    en: 'On',
    ru: 'Включено'
  },
  off: {
    ka: 'გამორთული',
    en: 'Off',
    ru: 'Выключено'
  },
  account: {
    ka: 'ანგარიში',
    en: 'Account',
    ru: 'Аккаунт'
  },
  tools: {
    ka: 'ხელსაწყოები',
    en: 'Tools',
    ru: 'Инструменты'
  },
  quickSearch: {
    ka: 'სწრაფი ძებნა',
    en: 'Quick Search',
    ru: 'Быстрый поиск'
  },

  // Property Types
  propertyTypes: {
    ka: 'ქონების ტიპები',
    en: 'Property Types',
    ru: 'Типы недвижимости'
  },

  // Settings Page
  appearance: {
    ka: 'გარეგნობა',
    en: 'Appearance',
    ru: 'Внешний вид'
  },
  privacySecurity: {
    ka: 'კონფიდენციალურობა და უსაფრთხოება',
    en: 'Privacy & Security',
    ru: 'Конфиденциальность и безопасность'
  },
  applications: {
    ka: 'აპლიკაციები',
    en: 'Applications',
    ru: 'Приложения'
  },
  integrations: {
    ka: 'ინტეგრაციები',
    en: 'Integrations',
    ru: 'Интеграции'
  },
  billingSubscription: {
    ka: 'ბილინგი და გამოწერა',
    en: 'Billing & Subscription',
    ru: 'Биллинг и подписка'
  },
  helpSupport: {
    ka: 'დახმარება და მხარდაჭერა',
    en: 'Help & Support',
    ru: 'Помощь и поддержка'
  },
  themePreferences: {
    ka: 'თემის პარამეტრები',
    en: 'Theme Preferences',
    ru: 'Настройки темы'
  },
  light: {
    ka: 'ღია',
    en: 'Light',
    ru: 'Светлая'
  },
  dark: {
    ka: 'მუქი',
    en: 'Dark',
    ru: 'Темная'
  },
  system: {
    ka: 'სისტემის',
    en: 'System',
    ru: 'Системная'
  },
  highContrastMode: {
    ka: 'მაღალი კონტრასტის რეჟიმი',
    en: 'High Contrast Mode',
    ru: 'Режим высокого контраста'
  },
  increaseContrast: {
    ka: 'კონტრასტის გაზრდა უკეთესი ხილვადობისთვის',
    en: 'Increase contrast for better visibility',
    ru: 'Увеличить контрастность для лучшей видимости'
  },
  fontSize: {
    ka: 'შრიფტის ზომა',
    en: 'Font Size',
    ru: 'Размер шрифта'
  },
  small: {
    ka: 'მცირე',
    en: 'Small',
    ru: 'Маленький'
  },
  editProfile: {
    ka: 'პროფილის რედაქტირება',
    en: 'Edit Profile',
    ru: 'Редактировать профиль'
  },
  personalInformation: {
    ka: 'პირადი ინფორმაცია',
    en: 'Personal Information',
    ru: 'Личная информация'
  },
  updatePersonalDetails: {
    ka: 'თქვენი პირადი მონაცემების განახლება',
    en: 'Update your personal details',
    ru: 'Обновите ваши личные данные'
  },
  fullName: {
    ka: 'სრული სახელი',
    en: 'Full Name',
    ru: 'Полное имя'
  },
  emailAddress: {
    ka: 'ელ. ფოსტის მისამართი',
    en: 'Email Address',
    ru: 'Адрес электронной почты'
  },
  phoneNumber: {
    ka: 'ტელეფონის ნომერი',
    en: 'Phone Number',
    ru: 'Номер телефона'
  },
  saveChanges: {
    ka: 'ცვლილებების შენახვა',
    en: 'Save Changes',
    ru: 'Сохранить изменения'
  },
  password: {
    ka: 'პაროლი',
    en: 'Password',
    ru: 'Пароль'
  },
  updatePassword: {
    ka: 'პაროლის განახლება',
    en: 'Update your password',
    ru: 'Обновить ваш пароль'
  },
  currentPassword: {
    ka: 'მიმდინარე პაროლი',
    en: 'Current Password',
    ru: 'Текущий пароль'
  },
  newPassword: {
    ka: 'ახალი პაროლი',
    en: 'New Password',
    ru: 'Новый пароль'
  },
  confirmNewPassword: {
    ka: 'ახალი პაროლის დადასტურება',
    en: 'Confirm New Password',
    ru: 'Подтвердить новый пароль'
  },
  updatePasswordBtn: {
    ka: 'პაროლის განახლება',
    en: 'Update Password',
    ru: 'Обновить пароль'
  },
  twoFactorAuth: {
    ka: 'ორფაქტორიანი ავტენტიფიკაცია',
    en: 'Two-Factor Authentication',
    ru: 'Двухфакторная аутентификация'
  },
  extraSecurity: {
    ka: 'დამატებითი უსაფრთხოების დონის დამატება თქვენს ანგარიშზე',
    en: 'Add an extra layer of security to your account',
    ru: 'Добавьте дополнительный уровень безопасности к вашему аккаунту'
  },
  enableTwoFactor: {
    ka: 'ორფაქტორიანი ავტენტიფიკაციის ჩართვა',
    en: 'Enable Two-Factor Authentication',
    ru: 'Включить двухфакторную аутентификацию'
  },
  secure2FA: {
    ka: 'ანგარიშის უსაფრთხოება 2FA-ით',
    en: 'Secure your account with 2FA',
    ru: 'Защитите ваш аккаунт с помощью 2FA'
  },
  connectedAccounts: {
    ka: 'დაკავშირებული ანგარიშები',
    en: 'Connected Accounts',
    ru: 'Подключенные аккаунты'
  },
  connectAccounts: {
    ka: 'ანგარიშების დაკავშირება მარტივი შესვლისთვის',
    en: 'Connect your accounts for easier sign-in',
    ru: 'Подключите ваши аккаунты для упрощения входа'
  },
  google: {
    ka: 'Google',
    en: 'Google',
    ru: 'Google'
  },
  apple: {
    ka: 'Apple',
    en: 'Apple',
    ru: 'Apple'
  },
  facebook: {
    ka: 'Facebook',
    en: 'Facebook',
    ru: 'Facebook'
  },
  connected: {
    ka: 'დაკავშირებული',
    en: 'Connected',
    ru: 'Подключен'
  },
  notConnected: {
    ka: 'არ არის დაკავშირებული',
    en: 'Not connected',
    ru: 'Не подключен'
  },
  disconnect: {
    ka: 'გათიშვა',
    en: 'Disconnect',
    ru: 'Отключить'
  },
  connect: {
    ka: 'დაკავშირება',
    en: 'Connect',
    ru: 'Подключить'
  },

  // Agent Dashboard translations
  'agents.dashboard.title': {
    ka: 'აგენტების დაშბორდი',
    en: 'Agent Dashboard',
    ru: 'Панель Агента'
  },
  'agents.dashboard.subtitle': {
    ka: 'მართეთ თქვენი ქონება, კლიენტები და შეხვედრები',
    en: 'Manage your properties, clients, and appointments',
    ru: 'Управляйте недвижимостью, клиентами и встречами'
  },
  'agents.stats.totalProperties': {
    ka: 'სულ ქონება',
    en: 'Total Properties',
    ru: 'Всего Объектов'
  },
  'agents.stats.activeClients': {
    ka: 'აქტიური კლიენტები',
    en: 'Active Clients',
    ru: 'Активные Клиенты'
  },
  'agents.stats.pendingDeals': {
    ka: 'მიმდინარე გარიგებები',
    en: 'Pending Deals',
    ru: 'Текущие Сделки'
  },
  'agents.stats.monthlyRevenue': {
    ka: 'ყოველთვიური შემოსავალი',
    en: 'Monthly Revenue',
    ru: 'Месячный Доход'
  },
  'agents.list.title': {
    ka: 'ჩვენი აგენტები',
    en: 'Our Agents',
    ru: 'Наши Агенты'
  },
  'agents.search.placeholder': {
    ka: 'ძებნა აგენტებში...',
    en: 'Search agents...',
    ru: 'Поиск агентов...'
  },
  'agents.filter.all': {
    ka: 'ყველა აგენტი',
    en: 'All Agents',
    ru: 'Все Агенты'
  },
  'agents.filter.luxury': {
    ka: 'ლუქსის სპეციალისტები',
    en: 'Luxury Specialists',
    ru: 'Специалисты по Люксу'
  },
  'agents.filter.commercial': {
    ka: 'კომერციული ექსპერტები',
    en: 'Commercial Experts',
    ru: 'Коммерческие Эксперты'
  },
  'agents.filter.residential': {
    ka: 'საცხოვრებელი აგენტები',
    en: 'Residential Agents',
    ru: 'Жилые Агенты'
  },
  'agents.properties': {
    ka: 'ქონება',
    en: 'properties',
    ru: 'объектов'
  },
  'agents.call': {
    ka: 'დარეკვა',
    en: 'Call',
    ru: 'Звонок'
  },
  'agents.email': {
    ka: 'იმეილი',
    en: 'Email',
    ru: 'Почта'
  },
  'agents.tasks.title': {
    ka: 'დღევანდელი ამოცანები',
    en: 'Tasks Due Today',
    ru: 'Задачи на Сегодня'
  },
  'agents.tasks.propertyViewing': {
    ka: 'ქონების ნახვა მაიკლ ბრაუნთან',
    en: 'Property viewing with Michael Brown',
    ru: 'Просмотр недвижимости с Майклом Брауном'
  },
  'agents.tasks.followUp': {
    ka: 'ემას შეთავაზების თვალყურისდევნება',
    en: "Follow up on Emma's offer",
    ru: 'Отследить предложение Эммы'
  },
  'agents.tasks.updatePhotos': {
    ka: 'ლისტინგის ფოტოების განახლება',
    en: 'Update listing photos',
    ru: 'Обновить фото объявления'
  },
  'agents.tasks.clientMeeting': {
    ka: 'კლიენტთან შეხვედრის მომზადება',
    en: 'Client meeting preparation',
    ru: 'Подготовка к встрече с клиентом'
  },
  'agents.appointments.title': {
    ka: 'მომავალი შეხვედრები',
    en: 'Upcoming Appointments',
    ru: 'Предстоящие Встречи'
  },
  'agents.appointments.propertyViewing': {
    ka: 'ქონების ნახვა',
    en: 'Property Viewing',
    ru: 'Просмотр Недвижимости'
  },
  'agents.appointments.clientMeeting': {
    ka: 'კლიენტთან შეხვედრა',
    en: 'Client Meeting',
    ru: 'Встреча с Клиентом'
  },
  'agents.appointments.propertyInspection': {
    ka: 'ქონების ინსპექცია',
    en: 'Property Inspection',
    ru: 'Инспекция Недвижимости'
  },
  'agents.messages.title': {
    ka: 'ბოლო შეტყობინებები',
    en: 'Recent Messages',
    ru: 'Последние Сообщения'
  },
  'agents.messages.lookingForward': {
    ka: 'ველოდები ხვალინდელ ნახვას!',
    en: 'Looking forward to the viewing tomorrow!',
    ru: 'Жду завтрашнего просмотра!'
  },
  'agents.messages.discussOffer': {
    ka: 'როდის შეგვიძლია შეთავაზების განხილვა?',
    en: 'When can we discuss the offer?',
    ru: 'Когда можем обсудить предложение?'
  },
  'agents.messages.thanksDetails': {
    ka: 'მადლობა ქონების დეტალებისთვის',
    en: 'Thanks for the property details',
    ru: 'Спасибо за детали недвижимости'
  },
  resultsUpdateAutomatically: {
    ka: 'შედეგები განახლდება ავტომატურად',
    en: 'Results update automatically',
    ru: 'Результаты обновляются автоматически'
  },
  min: {
    ka: 'მინ',
    en: 'Min',
    ru: 'Мин'
  },
  max: {
    ka: 'მაქს',
    en: 'Max',
    ru: 'Макс'
  },
  clearSelection: {
    ka: 'არჩევანის გასუფთავება',
    en: 'Clear selection',
    ru: 'Очистить выбор'
  },
  selected: {
    ka: 'არჩეული',
    en: 'selected',
    ru: 'выбрано'
  },
  
  // Districts
  tbilisi: {
    ka: 'თბილისი',
    en: 'Tbilisi',
    ru: 'Тбилиси'
  },
  vake: {
    ka: 'ვაკე',
    en: 'Vake',
    ru: 'Ваке'
  },
  mtatsminda: {
    ka: 'მთაწმინდა',
    en: 'Mtatsminda',
    ru: 'Мтацминда'
  },
  saburtalo: {
    ka: 'საბურთალო',
    en: 'Saburtalo',
    ru: 'Сабуртало'
  },
  isani: {
    ka: 'ისანი',
    en: 'Isani',
    ru: 'Исани'
  },
  gldani: {
    ka: 'გლდანი',
    en: 'Gldani',
    ru: 'Глдани'
  },
  didube: {
    ka: 'დიდუბე',
    en: 'Didube',
    ru: 'Дидубе'
  },
  vera: {
    ka: 'ვერა',
    en: 'Vera',
    ru: 'Вера'
  },
  ortachala: {
    ka: 'ორთაჭალა',
    en: 'Ortachala',
    ru: 'Ортачала'
  },
  samgori: {
    ka: 'სამგორი',
    en: 'Samgori',
    ru: 'Самгори'
  },
  varketili: {
    ka: 'ვარკეთილი',
    en: 'Varketili',
    ru: 'Варкетили'
  },
  oldTown: {
    ka: 'ძველი ქალაქი',
    en: 'Old Town',
    ru: 'Старый город'
  },
  rike: {
    ka: 'რიყე',
    en: 'Rike',
    ru: 'Рике'
  },
  mtkvariRiver: {
    ka: 'მტკვარი',
    en: 'Mtkvari River',
    ru: 'Река Мтквари'
  },
  tbilisiMap: {
    ka: 'თბილისის რუქა',
    en: 'Tbilisi Map',
    ru: 'Карта Тбилиси'
  },
  items: {
    ka: 'ნივთი',
    en: 'items',
    ru: 'объектов'
  },
  staticMapWithInteractivePins: {
    ka: 'სტატიკური რუქა ინტერაქტიული pin-ებით',
    en: 'Static map with interactive pins',
    ru: 'Статическая карта с интерактивными маркерами'
  },
  
  // Property titles
  luxuryVillaInVake: {
    ka: 'ვაკეში ძვირადღირებული ვილა',
    en: 'Luxury Villa in Vake',
    ru: 'Роскошная вилла в Ваке'
  },
  modernPenthouseInCenter: {
    ka: 'თანამედროვე პენტჰაუსი ცენტრში',
    en: 'Modern Penthouse in Center',
    ru: 'Современный пентхаус в центре'
  },
  // Street names
  rustaveliAvenue: {
    ka: 'რუსთაველის გამზირი',
    en: 'Rustaveli Avenue',
    ru: 'Проспект Руставели'
  },
  
  // Country
  georgia: {
    ka: 'საქართველო',
    en: 'Georgia',
    ru: 'Грузия'
  },
  
  // Business districts
  downtownFinancialDistrict: {
    ka: 'ცენტრალური ფინანსური უბანი',
    en: 'Downtown Financial District',
    ru: 'Центральный финансовый район'
  },
  techHubArea: {
    ka: 'ტექნოლოგიური ცენტრი',
    en: 'Tech Hub Area',
    ru: 'Технологический центр'
  },
  shoppingDistrict: {
    ka: 'სავაჭრო უბანი',
    en: 'Shopping District',
    ru: 'Торговый район'
  },
  
  // Georgian cities
  batumi: {
    ka: 'ბათუმი',
    en: 'Batumi',
    ru: 'Батуми'
  },
  kutaisi: {
    ka: 'ქუთაისი',
    en: 'Kutaisi',
    ru: 'Кутаиси'
  },
  rustavi: {
    ka: 'რუსთავი',
    en: 'Rustavi',
    ru: 'Рустави'
  },
  zugdidi: {
    ka: 'ზუგდიდი',
    en: 'Zugdidi',
    ru: 'Зугдиди'
  },
  telavi: {
    ka: 'თელავი',
    en: 'Telavi',
    ru: 'Телави'
  },
  gori: {
    ka: 'გორი',
    en: 'Gori',
    ru: 'Гори'
  },
  poti: {
    ka: 'ფოთი',
    en: 'Poti',
    ru: 'Поти'
  },
  samtredia: {
    ka: 'სამტრედია',
    en: 'Samtredia',
    ru: 'Самтредиа'
  },
  kobuleti: {
    ka: 'ქობულეთი',
    en: 'Kobuleti',
    ru: 'Кобулети'
  },

  
  // Authentication
  signIn: {
    ka: 'შესვლა',
    en: 'Sign In',
    ru: 'Вход'
  },
  signUp: {
    ka: 'რეგისტრაცია',
    en: 'Sign Up',
    ru: 'Регистрация'
  },
  enterEmail: {
    ka: 'შეიყვანეთ ელ. ფოსტა',
    en: 'Enter email',
    ru: 'Введите email'
  },
  enterPassword: {
    ka: 'შეიყვანეთ პაროლი',
    en: 'Enter password',
    ru: 'Введите пароль'
  },
  enterFullName: {
    ka: 'შეიყვანეთ სრული სახელი',
    en: 'Enter full name',
    ru: 'Введите полное имя'
  },
  confirmPassword: {
    ka: 'პაროლის დადასტურება',
    en: 'Confirm Password',
    ru: 'Подтвердите пароль'
  },
  signingIn: {
    ka: 'შედის...',
    en: 'Signing in...',
    ru: 'Входим...'
  },
  signingUp: {
    ka: 'რეგისტრირდება...',
    en: 'Signing up...',
    ru: 'Регистрируемся...'
  },
  invalidCredentials: {
    ka: 'არასწორი მონაცემები',
    en: 'Invalid credentials',
    ru: 'Неверные данные'
  },
  loginError: {
    ka: 'შესვლისას მოხდა შეცდომა',
    en: 'Login error occurred',
    ru: 'Произошла ошибка входа'
  },
  registrationError: {
    ka: 'რეგისტრაციისას მოხდა შეცდომა',
    en: 'Registration error occurred',
    ru: 'Произошла ошибка регистрации'
  },
  passwordsDoNotMatch: {
    ka: 'პაროლები არ ემთხვევა',
    en: 'Passwords do not match',
    ru: 'Пароли не совпадают'
  },
  demoCredentials: {
    ka: 'ტესტისთვის',
    en: 'Demo credentials',
    ru: 'Тестовые данные'
  },
  
  // Enhanced Search Form
  locationLabel: {
    ka: 'მდებარეობა',
    en: 'Location',
    ru: 'Местоположение'
  },
  propertyTypeLabel: {
    ka: 'ქონების ტიპი',
    en: 'Property Type',
    ru: 'Тип недвижимости'
  },
  minPriceLabel: {
    ka: 'მინიმალური ფასი',
    en: 'Min Price',
    ru: 'Мин. цена'
  },
  maxPriceLabel: {
    ka: 'მაქსიმალური ფასი',
    en: 'Max Price',
    ru: 'Макс. цена'
  },
  minPrice: {
    ka: 'მინ. ფასი',
    en: 'Min Price',
    ru: 'Мин. цена'
  },
  maxPrice: {
    ka: 'მაქს. ფასი',
    en: 'Max Price',
    ru: 'Макс. цена'
  },
  locationInputLabel: {
    ka: 'შეიყვანეთ მდებარეობა',
    en: 'Enter location',
    ru: 'Введите местоположение'
  },
  minPriceInputLabel: {
    ka: 'შეიყვანეთ მინიმალური ფასი',
    en: 'Enter minimum price',
    ru: 'Введите минимальную цену'
  },
  maxPriceInputLabel: {
    ka: 'შეიყვანეთ მაქსიმალური ფასი',
    en: 'Enter maximum price',
    ru: 'Введите максимальную цену'
  },
  searchListingsLabel: {
    ka: 'ძებნა განცხადებებში',
    en: 'Search listings',
    ru: 'Поиск объявлений'
  },
  popularSearches: {
    ka: 'პოპულარული ძებნები',
    en: 'Popular searches',
    ru: 'Популярные поиски'
  },
  addToSearch: {
    ka: 'დაამატე ძებნაში',
    en: 'Add to search',
    ru: 'Добавить в поиск'
  },
  // vake, saburtalo already defined above in Districts
  withTerrace: {
    ka: 'ტერასით',
    en: 'With Terrace',
    ru: 'С террасой'
  },
  withGarage: {
    ka: 'გარაჟით',
    en: 'With Garage',
    ru: 'С гаражом'
  },
  newBuilding: {
    ka: 'ახალი შენობა',
    en: 'New Building',
    ru: 'Новое здание'
  },
  tryExampleSearch: {
    ka: 'დემო ძებნა',
    en: 'Try Example Search',
    ru: 'Пробный поиск'
  },
  tryExampleSearchDesc: {
    ka: 'სცადეთ მაგალითური ძებნა',
    en: 'Try an example search',
    ru: 'Попробуйте пример поиска'
  },

  // Statistics Section
  clientSatisfaction: {
    ka: 'კლიენტების კმაყოფილება',
    en: 'Client Satisfaction',
    ru: 'Удовлетворенность клиентов'
  },
  support247: {
    ka: '24/7 მხარდაჭერა',
    en: '24/7 Support',
    ru: 'Поддержка 24/7'
  },
  verifiedAgents: {
    ka: 'გადამოწმებული აგენტები',
    en: 'Verified Agents',
    ru: 'Проверенные агенты'
  },
  propertiesViewed: {
    ka: 'ნახული ქონება',
    en: 'Properties Viewed',
    ru: 'Просмотров недвижимости'
  },
  successfulDeals: {
    ka: 'წარმატებული გარიგებები',
    en: 'Successful Deals',
    ru: 'Успешные сделки'
  },
  statisticsTitle: {
    ka: 'ჩვენი მიღწევები',
    en: 'Our Achievements',
    ru: 'Наши достижения'
  },
  statisticsSubtitle: {
    ka: 'ციფრებში ჩვენი წარმატების ისტორია',
    en: 'Our success story in numbers',
    ru: 'История нашего успеха в цифрах'
  },

  // Newsletter & Footer
  newsletter: {
    ka: 'ახალი ამბები',
    en: 'Newsletter',
    ru: 'Новости'
  },
  newsletterDescription: {
    ka: 'გამოიწერეთ ახალი განცხადებები და ინვესტიციის შესაძლებლობები',
    en: 'Subscribe to get the latest investment opportunities',
    ru: 'Подпишитесь на новые объявления и инвестиционные возможности'
  },
  emailPlaceholder: {
    ka: 'შეიყვანეთ თქვენი ელფოსტა',
    en: 'Enter your email',
    ru: 'Введите ваш email'
  },
  subscribe: {
    ka: 'გამოწერა',
    en: 'Subscribe',
    ru: 'Подписаться'
  },
  subscribing: {
    ka: 'იწერება...',
    en: 'Subscribing...',
    ru: 'Подписка...'
  },
  noSpamMessage: {
    ka: 'არანაირი სპამი. მხოლოდ სასარგებლო განცხადებები.',
    en: 'No spam. Only useful property listings.',
    ru: 'Никакого спама. Только полезные объявления.'
  },
  subscriptionSuccess: {
    ka: 'დაგემატა სიაში!',
    en: 'Successfully subscribed!',
    ru: 'Успешно подписаны!'
  },
  scrollToTop: {
    ka: 'თავში დაბრუნება',
    en: 'Scroll to top',
    ru: 'Наверх'
  },
  // Chat UI
  chat_schedule: { ka: 'შეხვედრა', en: 'Schedule', ru: 'Встреча' },
  chat_share: { ka: 'გაზიარება', en: 'Share', ru: 'Поделиться' },
  chat_reminder: { ka: 'შეხსენება', en: 'Reminder', ru: 'Напоминание' },
  chat_note: { ka: 'ნოტი', en: 'Note', ru: 'Заметка' },
  chat_quick_replies: { ka: 'სწრაფი პასუხები', en: 'Quick Replies', ru: 'Быстрые ответы' },
  chat_type_message: { ka: 'დაწერეთ შეტყობინება...', en: 'Type a message...', ru: 'Напишите сообщение...' },
  chat_empty_title: { ka: 'დაიწყე საუბარი', en: 'Start a conversation', ru: 'Начните разговор' },
  chat_empty_sub: { ka: 'დაწერე შეტყობინება ან გამოიყენე მიკროფონი.', en: 'Type a message or use the mic.', ru: 'Напишите сообщение или используйте микрофон.' },
  chat_suggest_1: { ka: 'იპოვე ბინა ვაკეში', en: 'Find apartments in Vake', ru: 'Квартиры в Ваке' },
  chat_suggest_2: { ka: 'ქირა საბურთალოზე', en: 'Rentals in Saburtalo', ru: 'Аренда в Сабуртало' },
  chat_suggest_3: { ka: 'ახალი აშენებული ₾300,000-მდე', en: 'New builds under ₾300,000', ru: 'Новостройки до ₾300,000' },
  chat_suggest_4: { ka: '2 საძინებელი მეტროსთან', en: '2-bedroom near Metro', ru: '2 спальни рядом с метро' },
  chat_close: { ka: 'დახურვა', en: 'Close', ru: 'Закрыть' },
  chat_attach: { ka: 'ფაილის მიმაგრება', en: 'Attach', ru: 'Прикрепить' },
  chat_send: { ka: 'გაგზავნა', en: 'Send', ru: 'Отправить' },
  chat_voice_start: { ka: 'ხმოვანი რეჟიმის ჩართვა', en: 'Start voice', ru: 'Включить голос' },
  chat_voice_stop: { ka: 'ხმოვანი რეჟიმის გაჩერება', en: 'Stop voice', ru: 'Остановить голос' },
  chat_mic_mute: { ka: 'მიკროფონის დადუმება', en: 'Mute microphone', ru: 'Выключить микрофон' },
  chat_mic_unmute: { ka: 'მიკროფონის ჩართვა', en: 'Unmute microphone', ru: 'Включить микрофон' },
  chat_go_to_bottom: { ka: 'ბოლოში გადასვლა', en: 'Go to bottom', ru: 'Вниз' },
  chat_recent_properties: { ka: 'ბოლოს ნანახი ქონება', en: 'Recent Properties', ru: 'Недавние объекты' },
  chat_save: { ka: 'შენახვა', en: 'Save', ru: 'Сохранить' },
  chat_confirm: { ka: 'დამტკიცება', en: 'Confirm', ru: 'Подтвердить' },
  chat_pin: { ka: 'მიმაგრება', en: 'Pin', ru: 'Закрепить' },
  chat_unpin: { ka: 'მოხსნა', en: 'Unpin', ru: 'Открепить' },
  chat_favorite: { ka: 'რჩეულებში', en: 'Favorite', ru: 'Избранное' },
  chat_unfavorite: { ka: 'რჩეულებიდან ამოღება', en: 'Unfavorite', ru: 'Убрать из избранного' },
  chat_mute_1h: { ka: 'დადუმება 1სთ', en: 'Mute 1h', ru: 'Отключить на 1ч' },
  chat_unmute: { ka: 'ხმების ჩართვა', en: 'Unmute', ru: 'Включить звук' },
  chat_private_note: { ka: 'პირადი ნოტი', en: 'Private note', ru: 'Личная заметка' },
  chat_qr_1: { ka: 'მადლობა შეტყობინებისთვის, მალე დაგიკავშირდებით.', en: 'Thanks for your message, I will get back soon.', ru: 'Спасибо за сообщение, скоро отвечу.' },
  chat_qr_2: { ka: 'შეგიძლიათ მომწეროთ სასურველი ბიუჯეტი?', en: 'Could you share your budget?', ru: 'Подскажите ваш бюджет?' },
  chat_qr_3: { ka: 'როდის გირჩევნიათ დათვალიერება?', en: 'When is a good time for a viewing?', ru: 'Когда удобно для просмотра?' },
  chat_qr_4: { ka: 'გთხოვთ დატოვოთ საკონტაქტო ნომერი.', en: 'Please leave a contact number.', ru: 'Оставьте, пожалуйста, контактный номер.' },
  chat_qr_5: { ka: 'მოგწერთ დეტალებს მოკლე დროში.', en: 'I will send details shortly.', ru: 'Скоро отправлю детали.' },
  today: { ka: 'დღეს', en: 'Today', ru: 'Сегодня' },
  tomorrow: { ka: 'ხვალ', en: 'Tomorrow', ru: 'Завтра' },
  oneWeek: { ka: '1 კვირა', en: '1 week', ru: '1 неделя' },
  other: { ka: 'სხვა', en: 'Other', ru: 'Другое' },
  yesterday: { ka: 'გუშინ', en: 'Yesterday', ru: 'Вчера' },
  chat_reminder_set: { ka: 'შეხსენება დაყენებულია', en: 'Reminder set', ru: 'Напоминание установлено' },
  chat_shared_property: { ka: 'გაგიზიარეთ ქონება', en: 'Shared property', ru: 'Поделился объектом' },
  contactUs: {
    ka: 'დაგვიკავშირდით',
    en: 'Contact Us',
    ru: 'Связаться с нами'
  },
  contactInformation: {
    ka: 'საკონტაქტო ინფორმაცია',
    en: 'Contact Information',
    ru: 'Контактная информация'
  },
  transactionHistory: {
    ka: 'ტრანზაქციების ისტორია',
    en: 'Transaction History',
    ru: 'История транзакций'
  },
  quickActions: {
    ka: 'სწრაფი ქმედებები',
    en: 'Quick Actions',
    ru: 'Быстрые действия'
  },
  online: {
    ka: 'ონლაინ',
    en: 'Online',
    ru: 'Онлайн'
  },
  completed: {
    ka: 'დასრულებული',
    en: 'Completed',
    ru: 'Завершено'
  },
  callUs: {
    ka: 'დაგვირეკეთ',
    en: 'Call Us',
    ru: 'Позвоните нам'
  },
  emailUs: {
    ka: 'მოგვწერეთ',
    en: 'Email Us',
    ru: 'Напишите нам'
  },

  // Filter Panel keys deduped above; removed duplicated definitions here
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Secure storage class for language preference
class SecureLanguageStorage {
  private static readonly STORAGE_KEY = 'lumina_language';
  
  static get(): Language {
    try {
      if (typeof window === 'undefined') return 'ka'; // Default to Georgian on server
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return 'ka';
      
      // Validate stored language
      const parsed = LanguageSchema.safeParse(stored);
      return parsed.success ? parsed.data : 'ka';
    } catch (error) {
      // Non-fatal warning in dev
      logger.warn('Failed to get language from storage:', sanitizeForLogging(error));
      return 'ka';
    }
  }
  
  static set(language: Language): void {
    try {
      if (typeof window === 'undefined') return;
      
      // Validate before storing
      const validated = LanguageSchema.parse(language);
      localStorage.setItem(this.STORAGE_KEY, validated);
    } catch (error) {
      logger.error('Failed to set language in storage:', sanitizeForLogging(error));
    }
  }
  
  static clear(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      logger.warn('Failed to clear language from storage:', sanitizeForLogging(error));
    }
  }
}

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

function setLanguageCookie(lang: Language) {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `lumina_language=${lang}; path=/; max-age=31536000`;
  } catch {
    // ignore
  }
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  // Always prefer the server-provided initialLanguage to avoid SSR/CSR mismatches
  const [language, setLanguageState] = useState<Language>(
    initialLanguage ?? (typeof window === 'undefined' ? 'ka' : SecureLanguageStorage.get())
  );
  const [isLoading] = useState(false);

  // Sync the chosen language into client storage and cookie on mount/update
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialLanguage) {
      try {
        SecureLanguageStorage.set(initialLanguage);
        setLanguageCookie(initialLanguage);
      } catch {}
    }
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    try {
      // Validate language
      const validated = LanguageSchema.parse(lang);
      setLanguageState(validated);
      SecureLanguageStorage.set(validated);
      setLanguageCookie(validated);
    } catch (error) {
      logger.error('Invalid language:', sanitizeForLogging(error));
    }
  };

  // Translation function
  const t = (key: string): string => {
    try {
      const translation = translations[key];
      if (!translation) {
        logger.warn(`Translation key "${key}" not found`);
        return key; // Return key as fallback
      }
      return translation[language] || translation.en || key;
    } catch (error) {
      logger.error('Translation error:', sanitizeForLogging(error));
      return key;
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };
export { translations }; 