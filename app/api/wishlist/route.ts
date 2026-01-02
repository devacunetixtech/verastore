import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Product from "@/models/Product"
import { requireAuth } from "@/lib/session"

export async function GET() {
  try {
    const currentUser = await requireAuth()
    await connectDB()

    const user = await User.findById(currentUser.id).populate("wishlist").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ wishlist: user.wishlist || [] })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth()
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const user = await User.findById(currentUser.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isInWishlist = user.wishlist.some((id: any) => id.toString() === productId)

    if (isInWishlist) {
      user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId)
      await user.save()
      return NextResponse.json({ message: "Product removed from wishlist", inWishlist: false }, { status: 200 })
    } else {
      user.wishlist.push(productId)
      await user.save()
      return NextResponse.json({ message: "Product added to wishlist", inWishlist: true }, { status: 200 })
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error)
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 })
  }
}
