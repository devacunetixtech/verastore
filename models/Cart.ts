import mongoose, { Schema, type Model } from "mongoose"
import type { ICart, ICartItem } from "@/types"

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true, ref: "Product" },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
})

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, ref: "User" },
    items: [CartItemSchema],
  },
  { timestamps: true },
)

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema)

export default Cart
