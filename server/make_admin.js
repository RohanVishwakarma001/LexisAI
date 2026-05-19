const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email. Example: node make_admin.js user@example.com");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.trim() },
      data: { role: 'ADMIN' },
    });

    console.log(`Successfully promoted ${updatedUser.email} (ID: ${updatedUser.id}) to ADMIN!`);
  } catch (err) {
    console.error("Error promoting user to admin:", err);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
