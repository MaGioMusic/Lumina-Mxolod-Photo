import { z } from 'zod';

const decimalSchema = z.union([z.string(), z.number()]);
const timestampSchema = z.string().datetime({ offset: true });
const uuidSchema = z.string().uuid();
const jsonValueSchema = z.unknown();

const userRoleSchema = z.enum(['guest', 'client', 'agent', 'investor', 'admin']);
export const currencyTypeSchema = z.enum(['GEL', 'USD', 'EUR', 'RUB']);
export const propertyTypeSchema = z.enum([
  'apartment',
  'house',
  'villa',
  'studio',
  'penthouse',
  'commercial',
  'land',
  'office',
]);
export const transactionTypeSchema = z.enum(['sale', 'rent', 'lease']);
const propertyConditionSchema = z.enum(['new', 'excellent', 'good', 'needs_renovation']);
const furnishedTypeSchema = z.enum(['furnished', 'partially_furnished', 'unfurnished']);
const propertyStatusSchema = z.enum(['active', 'pending', 'sold', 'rented', 'inactive']);
const appointmentStatusSchema = z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const appointmentTypeSchema = z.enum(['viewing', 'consultation', 'signing', 'inspection']);
const reviewTypeSchema = z.enum(['agent', 'property']);
const inquiryStatusSchema = z.enum(['new', 'in_progress', 'responded', 'closed']);
const notificationTypeSchema = z.enum(['new_property', 'price_change', 'appointment', 'review', 'system']);
const themeTypeSchema = z.enum(['light', 'dark']);
export const listingStatusSchema = z.enum(['active', 'expired', 'withdrawn', 'sold', 'rented']);
const transactionStatusSchema = z.enum(['pending', 'completed', 'cancelled']);

// Pre-Supabase: Organization
const orgRoleSchema = z.enum(['owner', 'admin', 'agent', 'member', 'viewer']);

export const imageSchema = z.object({
  id: uuidSchema,
  propertyId: uuidSchema,
  url: z.string().min(1),
  alt: z.string().nullable().optional(),
  sortOrder: z.number(),
  createdAt: timestampSchema,
  isAiGenerated: z.boolean().default(false),
  prompt: z.string().nullable().optional(),
  falJobId: z.string().nullable().optional(),
});
export type Image = z.infer<typeof imageSchema>;

export const listingSchema = z.object({
  id: uuidSchema,
  propertyId: uuidSchema,
  agentId: uuidSchema.nullable(),
  userId: uuidSchema.nullable(),
  dateListed: timestampSchema,
  expiryDate: timestampSchema.nullable(),
  price: decimalSchema,
  currency: currencyTypeSchema,
  status: listingStatusSchema,
  notes: z.string().nullable().optional(),
});
export type Listing = z.infer<typeof listingSchema>;

export const propertySchema = z.object({
  id: uuidSchema,
  agentId: uuidSchema.nullable(),
  title: z.string(),
  description: z.string().nullable().optional(),
  price: decimalSchema,
  currency: currencyTypeSchema,
  location: z.string(),
  district: z.string().nullable().optional(),
  city: z.string(),
  country: z.string(),
  propertyType: propertyTypeSchema,
  transactionType: transactionTypeSchema,
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  area: decimalSchema,
  floor: z.number().nullable().optional(),
  totalFloors: z.number().nullable().optional(),
  constructionYear: z.number().nullable().optional(),
  condition: propertyConditionSchema,
  furnished: furnishedTypeSchema,
  amenities: z.array(z.string()),
  imageUrls: z.array(z.string()),
  latitude: decimalSchema.nullable().optional(),
  longitude: decimalSchema.nullable().optional(),
  status: propertyStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  isFeatured: z.boolean(),
  featuredUntil: timestampSchema.nullable(),
  viewsCount: z.number(),
  images: z.array(imageSchema).optional(),
  listings: z.array(listingSchema).optional(),
});
export type Property = z.infer<typeof propertySchema>;

export const userSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable().optional(),
  role: userRoleSchema,
  phone: z.string().nullable().optional(),
  createdAt: timestampSchema,
  lastLogin: timestampSchema.nullable(),
  isActive: z.boolean(),
  passwordHash: z.string().min(1),
  emailVerificationToken: z.string().nullable().optional(),
  isEmailVerified: z.boolean(),
  updatedAt: timestampSchema,
});
type User = z.infer<typeof userSchema>;

export const publicUserSchema = userSchema.omit({
  passwordHash: true,
  emailVerificationToken: true,
});
type PublicUser = z.infer<typeof publicUserSchema>;

export const agentSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  licenseNumber: z.string().min(1),
  experienceYears: z.number().nullable().optional(),
  rating: decimalSchema.nullable().optional(),
  specialization: z.array(z.string()),
  bio: z.string().nullable().optional(),
  languages: z.array(z.string()),
  companyName: z.string().nullable().optional(),
  companyLogo: z.string().nullable().optional(),
  isVerified: z.boolean(),
  verificationDate: timestampSchema.nullable(),
  commissionRate: decimalSchema.nullable().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Agent = z.infer<typeof agentSchema>;

export const publicAgentSchema = agentSchema.omit({
  commissionRate: true,
  verificationDate: true,
});
export type PublicAgent = z.infer<typeof publicAgentSchema>;

export const favoriteSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  propertyId: uuidSchema,
  createdAt: timestampSchema,
});
export type Favorite = z.infer<typeof favoriteSchema>;

export const appointmentSchema = z.object({
  id: uuidSchema,
  clientId: uuidSchema,
  agentId: uuidSchema.nullable(),
  propertyId: uuidSchema,
  scheduledDate: timestampSchema,
  status: appointmentStatusSchema,
  notes: z.string().nullable().optional(),
  type: appointmentTypeSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  meetingLocation: z.string().nullable().optional(),
});
export type Appointment = z.infer<typeof appointmentSchema>;

export const reviewSchema = z.object({
  id: uuidSchema,
  authorId: uuidSchema,
  agentId: uuidSchema.nullable(),
  propertyId: uuidSchema.nullable(),
  rating: z.number(),
  comment: z.string().nullable().optional(),
  reviewType: reviewTypeSchema,
  createdAt: timestampSchema,
  isVerified: z.boolean(),
});
type Review = z.infer<typeof reviewSchema>;

export const inquirySchema = z.object({
  id: uuidSchema,
  userId: uuidSchema.nullable(),
  propertyId: uuidSchema,
  agentId: uuidSchema.nullable(),
  message: z.string().min(1),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  status: inquiryStatusSchema,
  createdAt: timestampSchema,
  respondedAt: timestampSchema.nullable(),
});
export type Inquiry = z.infer<typeof inquirySchema>;

export const searchHistorySchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  searchCriteria: jsonValueSchema,
  resultsCount: z.number(),
  searchDate: timestampSchema,
  searchName: z.string().nullable().optional(),
  isSaved: z.boolean(),
});
type SearchHistory = z.infer<typeof searchHistorySchema>;

export const transactionSchema = z.object({
  id: uuidSchema,
  propertyId: uuidSchema,
  buyerId: uuidSchema.nullable(),
  sellerId: uuidSchema.nullable(),
  agentId: uuidSchema.nullable(),
  salePrice: decimalSchema,
  currency: currencyTypeSchema,
  transactionDate: timestampSchema,
  status: transactionStatusSchema,
  commission: decimalSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});
type Transaction = z.infer<typeof transactionSchema>;

export const propertyAnalyticsSchema = z.object({
  id: uuidSchema,
  propertyId: uuidSchema,
  viewCount: z.number(),
  favoriteCount: z.number(),
  inquiryCount: z.number(),
  appointmentCount: z.number(),
  analyticsDate: z.string(),
  viewSources: jsonValueSchema.optional(),
});
export type PropertyAnalytics = z.infer<typeof propertyAnalyticsSchema>;

export const notificationSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  title: z.string(),
  message: z.string(),
  type: notificationTypeSchema,
  isRead: z.boolean(),
  createdAt: timestampSchema,
  metadata: jsonValueSchema.optional(),
});
type Notification = z.infer<typeof notificationSchema>;

export const mortgageCalculationSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  propertyId: uuidSchema.nullable(),
  loanAmount: decimalSchema,
  interestRate: decimalSchema,
  loanTermYears: z.number(),
  downPayment: decimalSchema,
  monthlyPayment: decimalSchema,
  calculatedAt: timestampSchema,
  isSaved: z.boolean(),
});
type MortgageCalculation = z.infer<typeof mortgageCalculationSchema>;

export const userPreferenceSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  searchPreferences: jsonValueSchema.optional(),
  notificationSettings: jsonValueSchema.optional(),
  preferredLanguage: z.string().min(2).max(5),
  theme: themeTypeSchema,
  currency: currencyTypeSchema,
  updatedAt: timestampSchema,
});
type UserPreference = z.infer<typeof userPreferenceSchema>;

const auditLogSchema = z.object({
  id: uuidSchema,
  tableName: z.string(),
  operation: z.string(),
  oldValues: jsonValueSchema.optional(),
  newValues: jsonValueSchema.optional(),
  userId: uuidSchema.nullable(),
  timestamp: timestampSchema,
});
type AuditLog = z.infer<typeof auditLogSchema>;

// --- Organization Types ---
export const organizationSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Organization = z.infer<typeof organizationSchema>;

export const organizationMembershipSchema = z.object({
  id: uuidSchema,
  organizationId: uuidSchema,
  userId: uuidSchema,
  role: orgRoleSchema,
  invitedAt: timestampSchema,
  joinedAt: timestampSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type OrganizationMembership = z.infer<typeof organizationMembershipSchema>;
