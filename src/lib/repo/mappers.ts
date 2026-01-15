import { Prisma } from '@prisma/client';
import {
  agentSchema,
  appointmentSchema,
  favoriteSchema,
  imageSchema,
  inquirySchema,
  listingSchema,
  mortgageCalculationSchema,
  notificationSchema,
  organizationMembershipSchema,
  organizationSchema,
  propertyAnalyticsSchema,
  propertySchema,
  reviewSchema,
  searchHistorySchema,
  transactionSchema,
  userPreferenceSchema,
  publicAgentSchema,
  publicUserSchema,
  userSchema,
} from '@/types/models';

const toDecimalString = (value: Prisma.Decimal | string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Prisma.Decimal) return value.toString();
  return value.toString();
};

const toISOString = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
};

export const mapImage = (record: Prisma.ImageGetPayload<Record<string, never>>) =>
  imageSchema.parse({
    id: record.id,
    propertyId: record.propertyId,
    url: record.url,
    alt: record.alt ?? null,
    sortOrder: record.sortOrder,
    createdAt: toISOString(record.createdAt),
  });

export const mapListing = (record: Prisma.ListingGetPayload<Record<string, never>>) =>
  listingSchema.parse({
    id: record.id,
    propertyId: record.propertyId,
    agentId: record.agentId ?? null,
    userId: record.userId ?? null,
    dateListed: toISOString(record.dateListed),
    expiryDate: toISOString(record.expiryDate),
    price: toDecimalString(record.price) ?? '0',
    currency: record.currency,
    status: record.status,
    notes: record.notes ?? null,
  });

export const mapAgent = (record: Prisma.AgentGetPayload<Record<string, never>>) =>
  agentSchema.parse({
    id: record.id,
    userId: record.userId,
    licenseNumber: record.licenseNumber,
    experienceYears: record.experienceYears ?? null,
    rating: toDecimalString(record.rating),
    specialization: record.specialization ?? [],
    bio: record.bio ?? null,
    languages: record.languages ?? [],
    companyName: record.companyName ?? null,
    companyLogo: record.companyLogo ?? null,
    isVerified: record.isVerified,
    verificationDate: toISOString(record.verificationDate),
    commissionRate: toDecimalString(record.commissionRate),
    createdAt: toISOString(record.createdAt),
    updatedAt: toISOString(record.updatedAt),
  });

type PropertyWithRelations = Prisma.PropertyGetPayload<Record<string, never>> & {
  images?: Prisma.ImageGetPayload<Record<string, never>>[];
  listings?: Prisma.ListingGetPayload<Record<string, never>>[];
};

export const mapProperty = (record: PropertyWithRelations) =>
  propertySchema.parse({
    id: record.id,
    agentId: record.agentId ?? null,
    title: record.title,
    description: record.description ?? null,
    price: toDecimalString(record.price) ?? '0',
    currency: record.currency,
    location: record.location,
    district: record.district ?? null,
    city: record.city,
    country: record.country,
    propertyType: record.propertyType,
    transactionType: record.transactionType,
    bedrooms: record.bedrooms ?? null,
    bathrooms: record.bathrooms ?? null,
    area: toDecimalString(record.area) ?? '0',
    floor: record.floor ?? null,
    totalFloors: record.totalFloors ?? null,
    constructionYear: record.constructionYear ?? null,
    condition: record.condition,
    furnished: record.furnished,
    amenities: record.amenities ?? [],
    imageUrls: record.imageUrls ?? [],
    latitude: toDecimalString(record.latitude),
    longitude: toDecimalString(record.longitude),
    status: record.status,
    createdAt: toISOString(record.createdAt),
    updatedAt: toISOString(record.updatedAt),
    isFeatured: record.isFeatured,
    featuredUntil: toISOString(record.featuredUntil),
    viewsCount: record.viewsCount,
    images: record.images?.map(mapImage),
    listings: record.listings?.map(mapListing),
  });

export const mapFavorite = (record: Prisma.FavoriteGetPayload<Record<string, never>>) =>
  favoriteSchema.parse({
    id: record.id,
    userId: record.userId,
    propertyId: record.propertyId,
    createdAt: toISOString(record.createdAt),
  });

export const mapAppointment = (record: Prisma.AppointmentGetPayload<Record<string, never>>) =>
  appointmentSchema.parse({
    id: record.id,
    clientId: record.clientId,
    agentId: record.agentId ?? null,
    propertyId: record.propertyId,
    scheduledDate: toISOString(record.scheduledDate),
    status: record.status,
    notes: record.notes ?? null,
    type: record.type,
    createdAt: toISOString(record.createdAt),
    updatedAt: toISOString(record.updatedAt),
    meetingLocation: record.meetingLocation ?? null,
  });

export const mapInquiry = (record: Prisma.InquiryGetPayload<Record<string, never>>) =>
  inquirySchema.parse({
    id: record.id,
    userId: record.userId ?? null,
    propertyId: record.propertyId,
    agentId: record.agentId ?? null,
    message: record.message,
    contactPhone: record.contactPhone ?? null,
    contactEmail: record.contactEmail ?? null,
    status: record.status,
    createdAt: toISOString(record.createdAt),
    respondedAt: toISOString(record.respondedAt),
  });

export const mapReview = (record: Prisma.ReviewGetPayload<Record<string, never>>) =>
  reviewSchema.parse({
    id: record.id,
    authorId: record.authorId,
    agentId: record.agentId ?? null,
    propertyId: record.propertyId ?? null,
    rating: record.rating,
    comment: record.comment ?? null,
    reviewType: record.reviewType,
    createdAt: toISOString(record.createdAt),
    isVerified: record.isVerified,
  });

export const mapSearchHistory = (record: Prisma.SearchHistoryGetPayload<Record<string, never>>) =>
  searchHistorySchema.parse({
    id: record.id,
    userId: record.userId,
    searchCriteria: record.searchCriteria,
    resultsCount: record.resultsCount,
    searchDate: toISOString(record.searchDate),
    searchName: record.searchName ?? null,
    isSaved: record.isSaved,
  });

export const mapTransaction = (record: Prisma.TransactionGetPayload<Record<string, never>>) =>
  transactionSchema.parse({
    id: record.id,
    propertyId: record.propertyId,
    buyerId: record.buyerId ?? null,
    sellerId: record.sellerId ?? null,
    agentId: record.agentId ?? null,
    salePrice: toDecimalString(record.salePrice) ?? '0',
    currency: record.currency,
    transactionDate: toISOString(record.transactionDate),
    status: record.status,
    commission: toDecimalString(record.commission),
    notes: record.notes ?? null,
  });

export const mapPropertyAnalytics = (record: Prisma.PropertyAnalyticsGetPayload<Record<string, never>>) =>
  propertyAnalyticsSchema.parse({
    id: record.id,
    propertyId: record.propertyId,
    viewCount: record.viewCount,
    favoriteCount: record.favoriteCount,
    inquiryCount: record.inquiryCount,
    appointmentCount: record.appointmentCount,
    analyticsDate: record.analyticsDate instanceof Date ? record.analyticsDate.toISOString().slice(0, 10) : record.analyticsDate,
    viewSources: record.viewSources ?? {},
  });

export const mapNotification = (record: Prisma.NotificationGetPayload<Record<string, never>>) =>
  notificationSchema.parse({
    id: record.id,
    userId: record.userId,
    title: record.title,
    message: record.message,
    type: record.type,
    isRead: record.isRead,
    createdAt: toISOString(record.createdAt),
    metadata: record.metadata ?? {},
  });

export const mapMortgageCalculation = (record: Prisma.MortgageCalculationGetPayload<Record<string, never>>) =>
  mortgageCalculationSchema.parse({
    id: record.id,
    userId: record.userId,
    propertyId: record.propertyId ?? null,
    loanAmount: toDecimalString(record.loanAmount) ?? '0',
    interestRate: toDecimalString(record.interestRate) ?? '0',
    loanTermYears: record.loanTermYears,
    downPayment: toDecimalString(record.downPayment) ?? '0',
    monthlyPayment: toDecimalString(record.monthlyPayment) ?? '0',
    calculatedAt: toISOString(record.calculatedAt),
    isSaved: record.isSaved,
  });

export const mapUserPreference = (record: Prisma.UserPreferenceGetPayload<Record<string, never>>) =>
  userPreferenceSchema.parse({
    id: record.id,
    userId: record.userId,
    searchPreferences: record.searchPreferences ?? {},
    notificationSettings: record.notificationSettings ?? {},
    preferredLanguage: record.preferredLanguage,
    theme: record.theme,
    currency: record.currency,
    updatedAt: toISOString(record.updatedAt),
  });

export const mapOrganization = (record: Prisma.OrganizationGetPayload<Record<string, never>>) =>
  organizationSchema.parse({
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description ?? null,
    isActive: record.isActive,
    createdAt: toISOString(record.createdAt),
    updatedAt: toISOString(record.updatedAt),
  });

export const mapOrganizationMembership = (
  record: Prisma.OrganizationMembershipGetPayload<Record<string, never>>,
) =>
  organizationMembershipSchema.parse({
    id: record.id,
    organizationId: record.organizationId,
    userId: record.userId,
    role: record.role,
    invitedAt: toISOString(record.invitedAt),
    joinedAt: toISOString(record.joinedAt),
    createdAt: toISOString(record.createdAt),
    updatedAt: toISOString(record.updatedAt),
  });

export const mapPublicUser = (record: Prisma.UserGetPayload<Record<string, never>>) => {
  const user = userSchema.parse({
    id: record.id,
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    avatar: record.avatar ?? null,
    role: record.role,
    phone: record.phone ?? null,
    createdAt: toISOString(record.createdAt),
    lastLogin: toISOString(record.lastLogin),
    isActive: record.isActive,
    passwordHash: record.passwordHash,
    emailVerificationToken: record.emailVerificationToken ?? null,
    isEmailVerified: record.isEmailVerified,
    updatedAt: toISOString(record.updatedAt),
  });
  const safe = { ...user };
  delete (safe as Partial<typeof safe>).passwordHash;
  delete (safe as Partial<typeof safe>).emailVerificationToken;
  return publicUserSchema.parse(safe);
};

export const mapPublicAgent = (record: Prisma.AgentGetPayload<Record<string, never>>) => {
  const agent = mapAgent(record);
  const safe = { ...agent };
  delete (safe as Partial<typeof safe>).commissionRate;
  delete (safe as Partial<typeof safe>).verificationDate;
  return publicAgentSchema.parse(safe);
};
