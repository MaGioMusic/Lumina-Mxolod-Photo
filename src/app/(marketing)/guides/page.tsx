'use client';

import type { ElementType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BookmarkSimple,
  ChartLine,
  FileText,
  Handshake,
  House,
  MagnifyingGlass,
  MapTrifold,
  ShieldCheck,
  TrendUp,
  Wrench,
} from '@phosphor-icons/react';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useLanguage } from '@/contexts/LanguageContext';

type GuideModule = {
  titleKey: string;
  descriptionKey: string;
  durationMinutes: number;
  topicKeys: string[];
  icon: ElementType;
};

type GuideTrack = {
  id: 'buyer' | 'seller';
  eyebrowKey: string;
  titleKey: string;
  descriptionKey: string;
  highlightKeys: string[];
  ctaLabelKey: string;
  ctaHref: string;
  cards: GuideModule[];
};

type QuickStat = {
  labelKey: string;
  value: string;
  descriptionKey: string;
};

type TemplateItem = {
  titleKey: string;
  descriptionKey: string;
  formatKey: string;
  icon: ElementType;
};

type ProcessStep = {
  titleKey: string;
  descriptionKey: string;
};

type FaqItem = {
  questionKey: string;
  answerKey: string;
};

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

type GuideModuleCardProps = {
  title: string;
  description: string;
  duration: string;
  topics: string[];
  icon: ElementType;
};

type TemplateCardProps = {
  title: string;
  description: string;
  format: string;
  actionLabel: string;
  icon: ElementType;
};

type ChecklistItemProps = {
  label: string;
};

type ProcessStepCardProps = {
  index: number;
  title: string;
  description: string;
};

type FaqRowProps = {
  question: string;
  answer: string;
};

const guideTracks: GuideTrack[] = [
  {
    id: 'buyer',
    eyebrowKey: 'guidesBuyerEyebrow',
    titleKey: 'guidesBuyerTitle',
    descriptionKey: 'guidesBuyerDescription',
    highlightKeys: ['guidesBuyerHighlight1', 'guidesBuyerHighlight2', 'guidesBuyerHighlight3'],
    ctaLabelKey: 'guidesBuyerCta',
    ctaHref: '#buyer-modules',
    cards: [
      {
        titleKey: 'guidesBuyerModule1Title',
        descriptionKey: 'guidesBuyerModule1Description',
        durationMinutes: 20,
        topicKeys: [
          'guidesBuyerModule1Topic1',
          'guidesBuyerModule1Topic2',
          'guidesBuyerModule1Topic3',
        ],
        icon: ChartLine,
      },
      {
        titleKey: 'guidesBuyerModule2Title',
        descriptionKey: 'guidesBuyerModule2Description',
        durationMinutes: 25,
        topicKeys: [
          'guidesBuyerModule2Topic1',
          'guidesBuyerModule2Topic2',
          'guidesBuyerModule2Topic3',
        ],
        icon: MagnifyingGlass,
      },
      {
        titleKey: 'guidesBuyerModule3Title',
        descriptionKey: 'guidesBuyerModule3Description',
        durationMinutes: 30,
        topicKeys: [
          'guidesBuyerModule3Topic1',
          'guidesBuyerModule3Topic2',
          'guidesBuyerModule3Topic3',
        ],
        icon: BookmarkSimple,
      },
      {
        titleKey: 'guidesBuyerModule4Title',
        descriptionKey: 'guidesBuyerModule4Description',
        durationMinutes: 35,
        topicKeys: [
          'guidesBuyerModule4Topic1',
          'guidesBuyerModule4Topic2',
          'guidesBuyerModule4Topic3',
        ],
        icon: Handshake,
      },
    ],
  },
  {
    id: 'seller',
    eyebrowKey: 'guidesSellerEyebrow',
    titleKey: 'guidesSellerTitle',
    descriptionKey: 'guidesSellerDescription',
    highlightKeys: ['guidesSellerHighlight1', 'guidesSellerHighlight2', 'guidesSellerHighlight3'],
    ctaLabelKey: 'guidesSellerCta',
    ctaHref: '#seller-modules',
    cards: [
      {
        titleKey: 'guidesSellerModule1Title',
        descriptionKey: 'guidesSellerModule1Description',
        durationMinutes: 15,
        topicKeys: [
          'guidesSellerModule1Topic1',
          'guidesSellerModule1Topic2',
          'guidesSellerModule1Topic3',
        ],
        icon: TrendUp,
      },
      {
        titleKey: 'guidesSellerModule2Title',
        descriptionKey: 'guidesSellerModule2Description',
        durationMinutes: 25,
        topicKeys: [
          'guidesSellerModule2Topic1',
          'guidesSellerModule2Topic2',
          'guidesSellerModule2Topic3',
        ],
        icon: Wrench,
      },
      {
        titleKey: 'guidesSellerModule3Title',
        descriptionKey: 'guidesSellerModule3Description',
        durationMinutes: 30,
        topicKeys: [
          'guidesSellerModule3Topic1',
          'guidesSellerModule3Topic2',
          'guidesSellerModule3Topic3',
        ],
        icon: MapTrifold,
      },
      {
        titleKey: 'guidesSellerModule4Title',
        descriptionKey: 'guidesSellerModule4Description',
        durationMinutes: 30,
        topicKeys: [
          'guidesSellerModule4Topic1',
          'guidesSellerModule4Topic2',
          'guidesSellerModule4Topic3',
        ],
        icon: ShieldCheck,
      },
    ],
  },
];

const checklistItems: string[] = [
  'guidesChecklistItem1',
  'guidesChecklistItem2',
  'guidesChecklistItem3',
  'guidesChecklistItem4',
  'guidesChecklistItem5',
  'guidesChecklistItem6',
  'guidesChecklistItem7',
  'guidesChecklistItem8',
];

const templates: TemplateItem[] = [
  {
    titleKey: 'guidesTemplate1Title',
    descriptionKey: 'guidesTemplate1Description',
    formatKey: 'guidesTemplate1Format',
    icon: FileText,
  },
  {
    titleKey: 'guidesTemplate2Title',
    descriptionKey: 'guidesTemplate2Description',
    formatKey: 'guidesTemplate2Format',
    icon: Handshake,
  },
  {
    titleKey: 'guidesTemplate3Title',
    descriptionKey: 'guidesTemplate3Description',
    formatKey: 'guidesTemplate3Format',
    icon: House,
  },
];

const processSteps: ProcessStep[] = [
  {
    titleKey: 'guidesProcessStep1Title',
    descriptionKey: 'guidesProcessStep1Description',
  },
  {
    titleKey: 'guidesProcessStep2Title',
    descriptionKey: 'guidesProcessStep2Description',
  },
  {
    titleKey: 'guidesProcessStep3Title',
    descriptionKey: 'guidesProcessStep3Description',
  },
  {
    titleKey: 'guidesProcessStep4Title',
    descriptionKey: 'guidesProcessStep4Description',
  },
];

const faqs: FaqItem[] = [
  {
    questionKey: 'guidesFaq1Question',
    answerKey: 'guidesFaq1Answer',
  },
  {
    questionKey: 'guidesFaq2Question',
    answerKey: 'guidesFaq2Answer',
  },
  {
    questionKey: 'guidesFaq3Question',
    answerKey: 'guidesFaq3Answer',
  },
  {
    questionKey: 'guidesFaq4Question',
    answerKey: 'guidesFaq4Answer',
  },
];

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-[#F08336] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E07428] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F08336]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function GuideModuleCard({ title, description, duration, topics, icon: Icon }: GuideModuleCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition hover:border-orange-200 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
            <Icon className="h-5 w-5" weight="bold" aria-hidden />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {duration}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-gray-200/80 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ title, description, format, actionLabel, icon: Icon }: TemplateCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:border-orange-200 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
            <Icon className="h-6 w-6" weight="bold" aria-hidden />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {format}
        </span>
      </div>
      <Link
        href="/contact"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F08336] hover:text-[#E07428]"
        aria-label={`${actionLabel}: ${title}`}
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

function ChecklistItem({ label }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#F08336]" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

function ProcessStepCard({ index, title, description }: ProcessStepCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-sm font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
          {index}
        </span>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function FaqRow({ question, answer }: FaqRowProps) {
  return (
    <details className="group rounded-2xl border border-gray-200/80 bg-white p-5 transition dark:border-gray-700 dark:bg-gray-900">
      <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-gray-900 dark:text-white">
        <span>{question}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 group-open:text-[#F08336] dark:border-gray-700 dark:text-gray-400">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{answer}</p>
    </details>
  );
}

export default function GuidesPage() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const totalModules = guideTracks.reduce((total, track) => total + track.cards.length, 0);
  const minutesSuffix = t('guidesMinutesSuffix');
  const templateActionLabel = t('guidesTemplateActionLabel');
  const modulesLabel = t('guidesModulesLabel');

  const fadeInUp = {
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] },
    viewport: { once: true, amount: 0.2 },
  };

  const quickStats: QuickStat[] = [
    {
      labelKey: 'guidesStatsModulesLabel',
      value: `${totalModules}`,
      descriptionKey: 'guidesStatsModulesDescription',
    },
    {
      labelKey: 'guidesStatsChecklistsLabel',
      value: `${checklistItems.length}`,
      descriptionKey: 'guidesStatsChecklistsDescription',
    },
    {
      labelKey: 'guidesStatsTemplatesLabel',
      value: `${templates.length}`,
      descriptionKey: 'guidesStatsTemplatesDescription',
    },
  ];

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <section className="px-4 sm:px-6 lg:px-10 pt-10">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/20 bg-gray-900"
          >
            <Image
              src="/images/properties/property-8.jpg"
              alt={t('guidesHeroImageAlt')}
              fill
              className="object-cover opacity-25"
              sizes="(min-width: 1024px) 900px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
            <div className="relative z-10 px-6 py-12 sm:px-10 md:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">
                {t('guidesHeroEyebrow')}
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
                {t('guidesHeroTitle')}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
                {t('guidesHeroSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#guide-library"
                  className={primaryButtonClass}
                  aria-label={t('guidesHeroPrimaryCta')}
                >
                  {t('guidesHeroPrimaryCta')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </a>
                <Link href="/contact" className={secondaryButtonClass} aria-label={t('guidesHeroSecondaryCta')}>
                  {t('guidesHeroSecondaryCta')}
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div
                    key={stat.labelKey}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                  >
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm font-semibold text-white/90">{t(stat.labelKey)}</p>
                    <p className="mt-1 text-xs text-white/70">{t(stat.descriptionKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section {...fadeInUp} id="guide-library" className="px-4 sm:px-6 lg:px-10 py-16">
          <SectionHeading
            eyebrow={t('guidesStructureEyebrow')}
            title={t('guidesStructureTitle')}
            description={t('guidesStructureDescription')}
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {guideTracks.map((track) => (
              <article key={track.id} id={`${track.id}-modules`} className="rounded-3xl border border-gray-200/80 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F08336]">
                      {t(track.eyebrowKey)}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
                      {t(track.titleKey)}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {t(track.descriptionKey)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {track.highlightKeys.map((highlightKey) => (
                        <span
                          key={highlightKey}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:bg-gray-900 dark:text-gray-300"
                        >
                          {t(highlightKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300">
                    {track.cards.length} {modulesLabel}
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {track.cards.map((card) => (
                    <GuideModuleCard
                      key={card.titleKey}
                      title={t(card.titleKey)}
                      description={t(card.descriptionKey)}
                      duration={`${card.durationMinutes} ${minutesSuffix}`}
                      topics={card.topicKeys.map((topicKey) => t(topicKey))}
                      icon={card.icon}
                    />
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  <span>{t('guidesTrackSupportNote')}</span>
                  <a href={track.ctaHref} className="text-sm font-semibold text-[#F08336] hover:text-[#E07428]">
                    {t(track.ctaLabelKey)}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="bg-gray-50 px-4 sm:px-6 lg:px-10 py-16 dark:bg-gray-800/60">
          <SectionHeading
            eyebrow={t('guidesChecklistEyebrow')}
            title={t('guidesChecklistTitle')}
            description={t('guidesChecklistDescription')}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {checklistItems.map((item) => (
              <ChecklistItem key={item} label={t(item)} />
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeInUp} id="template-library" className="px-4 sm:px-6 lg:px-10 py-16">
          <SectionHeading
            eyebrow={t('guidesTemplatesEyebrow')}
            title={t('guidesTemplatesTitle')}
            description={t('guidesTemplatesDescription')}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.titleKey}
                title={t(template.titleKey)}
                description={t(template.descriptionKey)}
                format={t(template.formatKey)}
                actionLabel={templateActionLabel}
                icon={template.icon}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
              {t('guidesTemplatesSupportBadge')}
            </span>
            {t('guidesTemplatesSupportNote')}
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="bg-gray-50 px-4 sm:px-6 lg:px-10 py-16 dark:bg-gray-800/60">
          <SectionHeading
            eyebrow={t('guidesProcessEyebrow')}
            title={t('guidesProcessTitle')}
            description={t('guidesProcessDescription')}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <ProcessStepCard
                key={step.titleKey}
                index={index + 1}
                title={t(step.titleKey)}
                description={t(step.descriptionKey)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="px-4 sm:px-6 lg:px-10 py-16">
          <SectionHeading
            eyebrow={t('guidesFaqEyebrow')}
            title={t('guidesFaqTitle')}
            description={t('guidesFaqDescription')}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <FaqRow
                key={faq.questionKey}
                question={t(faq.questionKey)}
                answer={t(faq.answerKey)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="px-4 sm:px-6 lg:px-10 pb-20">
          <div className="rounded-3xl border border-orange-200/60 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-10 text-white shadow-xl shadow-orange-500/25 sm:px-10">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold">{t('guidesCtaTitle')}</h2>
                <p className="mt-2 max-w-2xl text-sm text-white/85">
                  {t('guidesCtaDescription')}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-white/90"
                aria-label={t('guidesCtaButton')}
              >
                {t('guidesCtaButton')}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </ErrorBoundary>
  );
}

