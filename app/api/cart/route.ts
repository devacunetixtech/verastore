import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import { requireAuth } from "@/lib/session"

export async function GET() {
  try {
    const user = await requireAuth()
    await connectDB()

    const cart = await Cart.findOne({ userId: user.id }).lean()

    if (!cart) {
      return NextResponse.json({ cart: { items: [], totalAmount: 0 } })
    }

    // Populate product details
    const cartItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await Product.findById(item.productId).lean()
        return {
          ...item,
          product,
        }
      }),
    )

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return NextResponse.json({ cart: { ...cart, items: cartItems, totalAmount } })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { productId, quantity = 1 } = await request.json()

    if (!productId || quantity < 1) {
      return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    let cart = await Cart.findOne({ userId: user.id })

    if (!cart) {
      cart = await Cart.create({
        userId: user.id,
        items: [{ productId, quantity, price: product.price }],
      })
    } else {
      const existingItemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId)

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity
      } else {
        cart.items.push({ productId, quantity, price: product.price })
      }

      await cart.save()
    }

    return NextResponse.json({ message: "Product added to cart", cart }, { status: 200 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth()
    const { productId, quantity } = await request.json()

    if (!productId || quantity < 0) {
      return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 })
    }

    await connectDB()

    const cart = await Cart.findOne({ userId: user.id })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId)
    } else {
      const itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId)

      if (itemIndex === -1) {
        return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
      }

      const product = await Product.findById(productId)
      if (product.stock < quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }

      cart.items[itemIndex].quantity = quantity
    }

    await cart.save()

    return NextResponse.json({ message: "Cart updated", cart }, { status: 200 })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth()
    await connectDB()

    await Cart.findOneAndDelete({ userId: user.id })

    return NextResponse.json({ message: "Cart cleared" }, { status: 200 })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
