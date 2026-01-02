import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import { requireAdmin } from "@/lib/session"

export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin()
    const { productId } = await params

    await connectDB()

    const product = await Product.findById(productId).lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin()
    const { productId } = await params
    const productData = await request.json()

    await connectDB()

    const product = await Product.findByIdAndUpdate(productId, productData, { new: true })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product updated successfully", product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin()
    const { productId } = await params

    await connectDB()

    const product = await Product.findByIdAndDelete(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
