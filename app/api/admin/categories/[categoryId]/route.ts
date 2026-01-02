import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { requireAdmin } from "@/lib/session"

export async function PUT(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    await requireAdmin()
    const { categoryId } = await params
    const categoryData = await request.json()

    await connectDB()

    const category = await Category.findByIdAndUpdate(categoryId, categoryData, { new: true })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category updated successfully", category })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    await requireAdmin()
    const { categoryId } = await params

    await connectDB()

    const category = await Category.findByIdAndDelete(categoryId)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
