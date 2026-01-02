"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Loader2, XCircle, Package } from "lucide-react"
import { toast } from "sonner"

function OrderConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    const reference = searchParams.get("reference")
    if (!reference) {
      setStatus("error")
      return
    }

    verifyPayment(reference)
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setOrder(data.order)
        toast.success("Payment successful!")
      } else {
        setStatus("error")
        toast.error(data.error || "Payment verification failed")
      }
    } catch (error) {
      setStatus("error")
      toast.error("Failed to verify payment")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">
            There was an issue processing your payment. Please try again or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
            <Button variant="outline" onClick={() => router.push("/orders")} className="bg-transparent">
              View Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-semibold">{order?.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <p className="font-semibold capitalize">{order?.orderStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="font-semibold capitalize text-green-600">{order?.paymentDetails?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-blue-900">₦{order?.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">
                  {order?.shippingAddress?.name}
                  <br />
                  {order?.shippingAddress?.address}
                  <br />
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.postalCode}
                  <br />
                  {order?.shippingAddress?.phone}
                </p>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order?.items?.map((item: any) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" asChild>
              <Link href="/orders">
                <Package className="mr-2 h-5 w-5" />
                View All Orders
              </Link>
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  )
}
