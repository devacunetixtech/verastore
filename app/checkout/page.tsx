"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2, MapPin, Plus } from "lucide-react"
import { toast } from "sonner"
import { AddressDialog } from "@/components/address-dialog"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [cart, setCart] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      const [cartRes, userRes] = await Promise.all([fetch("/api/cart"), fetch("/api/users/me")])

      const cartData = await cartRes.json()
      const userData = await userRes.json()

      setCart(cartData.cart)
      setAddresses(userData.user?.shippingAddresses || [])

      const defaultAddress = userData.user?.shippingAddresses?.find((addr: any) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id)
      }
    } catch (error) {
      toast.error("Failed to load checkout data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address")
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddressId: selectedAddress }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to create order")
        return
      }

      // Redirect to Paystack payment page
      window.location.href = data.paymentUrl
    } catch (error) {
      toast.error("Failed to process checkout")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    )
  }

  const shippingCost = cart.totalAmount >= 50 ? 0 : 10
  const tax = cart.totalAmount * 0.1
  const finalTotal = cart.totalAmount + shippingCost + tax

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Shipping Address
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressDialog(true)}
                    className="bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No shipping addresses found</p>
                    <Button onClick={() => setShowAddressDialog(true)}>Add Address</Button>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    <div className="space-y-4">
                      {addresses.map((address: any) => (
                        <div key={address._id} className="flex items-start space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value={address._id} id={address._id} />
                          <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                            <div className="font-semibold flex items-center gap-2">
                              {address.name}
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.address}, {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({cart.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item: any) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product?.images[0]?.url || "/placeholder.svg"}
                        alt={item.product?.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold">{item.product?.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `₦${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>₦{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-900">₦{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing || !selectedAddress}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddressDialog open={showAddressDialog} onOpenChange={setShowAddressDialog} onSuccess={fetchData} />
    </div>
  )
}
