import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@etab.fr' },
    update: {},
    create: {
      email: 'admin@etab.fr',
      passwordHash: 'changeme',
      firstName: 'Admin',
      lastName: 'Principal',
      role: 'ADMIN',
    },
  });

  console.log(`Seed completed with admin ${admin.email}`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
