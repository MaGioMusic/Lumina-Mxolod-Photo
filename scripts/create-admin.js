const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@lumina.ge' },
      update: {
        role: 'admin',
        accountRole: 'ADMIN',
        passwordHash: hashedPassword,
        isEmailVerified: true,
      },
      create: {
        email: 'admin@lumina.ge',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: hashedPassword,
        role: 'admin',
        accountRole: 'ADMIN',
        isEmailVerified: true,
      },
    });
    
    console.log('✅ Admin user created/updated:', admin.email);
    console.log('📧 Email: admin@lumina.ge');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role, '|', admin.accountRole);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
