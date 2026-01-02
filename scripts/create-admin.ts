import connectDB from "../lib/db"
import User from "../models/User"
import bcrypt from "bcryptjs"

async function createAdmin() {
  try {
    await connectDB()

    const adminEmail = process.env.ADMIN_EMAIL || "admin@verastore.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456"

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      console.log("Admin user already exists:", adminEmail)
      console.log("Role:", existingAdmin.role)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
    })

    console.log("✅ Admin user created successfully!")
    console.log("Email:", adminEmail)
    console.log("Password:", adminPassword)
    console.log("\n⚠️  Please change the password after first login!")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error)
    process.exit(1)
  }
}

createAdmin()
