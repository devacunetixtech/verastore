import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { requireAuth } from "@/lib/session"

export async function GET() {
  try {
    const currentUser = await requireAuth()
    await connectDB()

    const user = await User.findById(currentUser.id).select("-password").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
