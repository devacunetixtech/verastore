import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import { requireAdmin } from "@/lib/session"

export async function GET() {
  try {
    await requireAdmin()
    await connectDB()

    const orders = await Order.find().sort({ createdAt: -1 }).lean()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
