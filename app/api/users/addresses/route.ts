import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { requireAuth } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth()
    const addressData = await request.json()

    await connectDB()

    const user = await User.findById(currentUser.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If this is set as default, unset all other default addresses
    if (addressData.isDefault) {
      user.shippingAddresses.forEach((addr: any) => {
        addr.isDefault = false
      })
    }

    user.shippingAddresses.push(addressData)
    await user.save()

    return NextResponse.json({ message: "Address added successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error adding address:", error)
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
  }
}
