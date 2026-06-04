const { PrismaClient } = require("@/src/generated/prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const bcrypt = require("bcryptjs")

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) { console.error("DATABASE_URL not set"); process.exit(1) }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: dbUrl }),
  })

  // Check existing users
  const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } })
  console.log("Existing users:")
  users.forEach(u => console.log(`  ${u.email} — ${u.name || '(no name)'} — ${u.role}`))

  // Check if admin exists
  const admin = users.find(u => u.role === "ADMIN" || u.role === "REVIEWER")
  if (admin) {
    console.log(`\nAdmin already exists: ${admin.email} (${admin.role})`)
  } else {
    console.log("\nNo admin/reviewer account found.")
  }

  await prisma.$disconnect()
}

main()
