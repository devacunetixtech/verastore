import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import { requireAuth } from "@/lib/session"

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireAuth()
    const { orderId } = await params

    await connectDB()

    const order = await Order.findOne({ _id: orderId, userId: user.id }).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
