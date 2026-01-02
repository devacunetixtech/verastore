import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { requireAdmin } from "@/lib/session"

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const categoryData = await request.json()

    await connectDB()

    const category = await Category.create(categoryData)

    return NextResponse.json({ message: "Category created successfully", category }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
