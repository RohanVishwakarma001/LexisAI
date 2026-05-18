const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getFirstUser() {
  try {
    const user = await prisma.user.findFirst();
    console.log("DB_USER_EMAIL:", user ? user.email : "NONE");
  } catch (err) {
    console.error("Error fetching user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

getFirstUser();
