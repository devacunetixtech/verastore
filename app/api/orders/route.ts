import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import User from "@/models/User"
import { requireAuth } from "@/lib/session"
import { initializePayment } from "@/lib/paystack"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { shippingAddressId } = await request.json()

    await connectDB()

    // Get user and validate shipping address
    const userDoc = await User.findById(user.id)
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const shippingAddress = userDoc.shippingAddresses.id(shippingAddressId)
    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address not found" }, { status: 404 })
    }

    // Get cart
    const cart = await Cart.findOne({ userId: user.id })
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Validate stock and prepare order items
    const orderItems = []
    let totalAmount = 0

    for (const item of cart.items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${product?.name || "item"} is no longer available` },
          { status: 400 },
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${product.stock} available` },
          { status: 400 },
        )
      }

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url || "",
        price: product.price,
        quantity: item.quantity,
      })

      totalAmount += product.price * item.quantity
    }

    // Calculate shipping and tax
    const shippingCost = totalAmount >= 50 ? 0 : 10 // Free shipping over $50
    const tax = totalAmount * 0.1 // 10% tax
    const finalAmount = totalAmount + shippingCost + tax

    // Generate unique order number and payment reference
    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
    const paymentReference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`

    // Create order
    const order = await Order.create({
      orderNumber,
      userId: user.id,
      items: orderItems,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentDetails: {
        method: "paystack",
        status: "pending",
        reference: paymentReference,
      },
      orderStatus: "pending",
      totalAmount: finalAmount,
      shippingCost,
      tax,
    })

    // Initialize Paystack payment
    const paymentData = await initializePayment(user.email, finalAmount, paymentReference)

    if (!paymentData.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
    }

    return NextResponse.json({
      order,
      paymentUrl: paymentData.data.authorization_url,
      reference: paymentReference,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find({ userId: user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ userId: user.id }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
