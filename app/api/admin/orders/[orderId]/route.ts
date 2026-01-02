import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import { requireAdmin } from "@/lib/session"

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAdmin()
    const { orderId } = await params

    await connectDB()

    const order = await Order.findById(orderId).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAdmin()
    const { orderId } = await params
    const { orderStatus } = await request.json()

    await connectDB()

    const order = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order updated successfully", order })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
