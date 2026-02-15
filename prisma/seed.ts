import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(__dirname, '..', '.env.local') });

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users...');

  const password = await hash('password123', 12);

  // Demo Agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@lumina.ge' },
    update: {},
    create: {
      email: 'agent@lumina.ge',
      firstName: 'Demo',
      lastName: 'Agent',
      passwordHash: password,
      role: 'agent',
      accountRole: 'AGENT',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create Agent profile
  await prisma.agent.upsert({
    where: { userId: agent.id },
    update: {},
    create: {
      userId: agent.id,
      licenseNumber: 'DEMO-AGENT-001',
      experienceYears: 5,
      specialization: ['residential', 'commercial'],
      bio: 'Demo agent account for testing purposes.',
      languages: ['English', 'ქართული'],
      isVerified: true,
    },
  });

  // Demo Client
  const client = await prisma.user.upsert({
    where: { email: 'client@lumina.ge' },
    update: {},
    create: {
      email: 'client@lumina.ge',
      firstName: 'Demo',
      lastName: 'Client',
      passwordHash: password,
      role: 'client',
      accountRole: 'USER',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Demo Investor
  const investor = await prisma.user.upsert({
    where: { email: 'investor@lumina.ge' },
    update: {},
    create: {
      email: 'investor@lumina.ge',
      firstName: 'Demo',
      lastName: 'Investor',
      passwordHash: password,
      role: 'investor',
      accountRole: 'USER',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create user preferences for all demo users
  for (const user of [agent, client, investor]) {
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        preferredLanguage: 'en',
        theme: 'light',
        currency: 'GEL',
      },
    });
  }

  console.log('Demo users created:');
  console.log(`  Agent:    agent@lumina.ge    / password123  (role: agent)`);
  console.log(`  Client:   client@lumina.ge   / password123  (role: client)`);
  console.log(`  Investor: investor@lumina.ge / password123  (role: investor)`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
