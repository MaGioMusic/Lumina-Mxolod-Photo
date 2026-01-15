import { OrgRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { mapOrganization, mapOrganizationMembership } from './mappers';
import type { Organization, OrganizationMembership } from '@/types/models';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string | null;
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  const record = await prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
    },
  });
  return mapOrganization(record);
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const record = await prisma.organization.findUnique({ where: { slug } });
  return record ? mapOrganization(record) : null;
}

export async function listUserOrganizations(userId: string): Promise<Organization[]> {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: 'asc' },
  });
  return memberships.map(m => mapOrganization(m.organization));
}

export interface AddMembershipInput {
  organizationId: string;
  userId: string;
  role?: OrgRole;
}

export async function addMembership(input: AddMembershipInput): Promise<OrganizationMembership> {
  const record = await prisma.organizationMembership.upsert({
    where: { organization_membership_unique: { organizationId: input.organizationId, userId: input.userId } },
    update: { role: input.role ?? OrgRole.member },
    create: { organizationId: input.organizationId, userId: input.userId, role: input.role ?? OrgRole.member },
  });
  return mapOrganizationMembership(record);
}

export async function setMemberRole(
  organizationId: string,
  userId: string,
  role: OrgRole,
): Promise<OrganizationMembership> {
  const record = await prisma.organizationMembership.update({
    where: { organization_membership_unique: { organizationId, userId } },
    data: { role },
  });
  return mapOrganizationMembership(record);
}

export async function removeMembership(organizationId: string, userId: string): Promise<void> {
  await prisma.organizationMembership.delete({
    where: { organization_membership_unique: { organizationId, userId } },
  });
}


