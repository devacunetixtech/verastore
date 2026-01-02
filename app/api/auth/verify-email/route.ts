import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json({ error: "Invalid verification link" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 })
    }

    user.isVerified = true
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    await user.save()

    return NextResponse.json({ message: "Email verified successfully! You can now log in." }, { status: 200 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "An error occurred during email verification" }, { status: 500 })
  }
}
