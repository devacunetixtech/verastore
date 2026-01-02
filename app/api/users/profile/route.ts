import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { requireAuth } from "@/lib/session"

export async function PUT(request: Request) {
  try {
    const currentUser = await requireAuth()
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    await connectDB()

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: currentUser.id } })
    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(currentUser.id, { name, email }, { new: true }).select("-password")

    return NextResponse.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
