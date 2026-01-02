import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Please provide all required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const verificationToken = crypto.randomBytes(32).toString("hex")

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      resetPasswordToken: verificationToken,
      resetPasswordExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}&email=${email}`
    await sendVerificationEmail(email, name, verificationUrl)

    return NextResponse.json(
      {
        message: "Registration successful! Please check your email to verify your account.",
        userId: user._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
