import mongoose, { Schema, type Model } from "mongoose"
import type { IOrder, IOrderItem, IPaymentDetails } from "@/types"

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
})

const PaymentDetailsSchema = new Schema<IPaymentDetails>({
  method: { type: String, required: true, default: "paystack" },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  transactionId: String,
  reference: { type: String, required: true },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: "User" },
    items: [OrderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentDetails: { type: PaymentDetailsSchema, required: true },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

export default Order
