import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import { requireAuth } from "@/lib/session"
import { verifyPayment } from "@/lib/paystack"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    await connectDB()

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference)

    if (!paymentData.status || paymentData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Find and update order
    const order = await Order.findOne({ "paymentDetails.reference": reference, userId: user.id })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update payment status
    order.paymentDetails.status = "success"
    order.paymentDetails.transactionId = paymentData.data.id
    order.orderStatus = "processing"
    await order.save()

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      })
    }

    // Clear cart
    await Cart.findOneAndDelete({ userId: user.id })

    return NextResponse.json({
      message: "Payment verified successfully",
      order,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
