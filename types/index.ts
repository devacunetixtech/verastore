export interface IShippingAddress {
  _id?: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  role: "user" | "admin"
  isVerified: boolean
  shippingAddresses: IShippingAddress[]
  wishlist: string[]
  resetPasswordToken?: string
  resetPasswordExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IProductImage {
  url: string
  publicId: string
}

export interface IReview {
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface IProduct {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  category: string
  subcategory?: string
  brand?: string
  images: IProductImage[]
  stock: number
  sku: string
  isActive: boolean
  ratings: {
    average: number
    count: number
  }
  reviews: IReview[]
  createdAt: Date
  updatedAt: Date
}

export interface ICartItem {
  productId: string
  quantity: number
  price: number
}

export interface ICart {
  _id: string
  userId: string
  items: ICartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface IOrderItem {
  productId: string
  name: string
  slug: string
  image: string
  price: number
  quantity: number
}

export interface IPaymentDetails {
  method: "paystack"
  status: "pending" | "success" | "failed"
  transactionId?: string
  reference: string
}

export interface IOrder {
  _id: string
  orderNumber: string
  userId: string
  items: IOrderItem[]
  shippingAddress: IShippingAddress
  paymentDetails: IPaymentDetails
  orderStatus: "pending" | "processing" | "shipped" | "completed" | "cancelled"
  totalAmount: number
  shippingCost: number
  tax: number
  createdAt: Date
  updatedAt: Date
}

export interface ICategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}
