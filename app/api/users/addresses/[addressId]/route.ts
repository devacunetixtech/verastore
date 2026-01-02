import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { requireAuth } from "@/lib/session"

export async function DELETE(request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    const currentUser = await requireAuth()
    const { addressId } = await params

    await connectDB()

    const user = await User.findById(currentUser.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const address = user.shippingAddresses.id(addressId)
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (address.isDefault) {
      return NextResponse.json({ error: "Cannot delete default address" }, { status: 400 })
    }

    user.shippingAddresses.pull(addressId)
    await user.save()

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
