import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import { requireAdmin } from "@/lib/session"

export async function GET() {
  try {
    await requireAdmin()
    await connectDB()

    const products = await Product.find().sort({ createdAt: -1 }).lean()

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const productData = await request.json()

    await connectDB()

    let slug = productData.slug
    let slugExists = await Product.findOne({ slug })
    let counter = 1

    while (slugExists) {
      slug = `${productData.slug}-${counter}`
      slugExists = await Product.findOne({ slug })
      counter++
    }

    productData.slug = slug

    const product = await Product.create(productData)

    return NextResponse.json({ message: "Product created successfully", product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create product"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
