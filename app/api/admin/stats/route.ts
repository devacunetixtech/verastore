import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Product from "@/models/Product"
import User from "@/models/User"
import { requireAdmin } from "@/lib/session"

export async function GET() {
  try {
    await requireAdmin()
    await connectDB()

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalProducts,
      activeProducts,
      totalUsers,
      verifiedUsers,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.find({ orderStatus: "completed" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lte: 10 }, isActive: true })
        .sort({ stock: 1 })
        .limit(5)
        .lean(),
    ])

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      processingOrders,
      totalProducts,
      activeProducts,
      totalUsers,
      verifiedUsers,
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
