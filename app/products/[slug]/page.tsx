"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Loader2, Minus, Plus, ShoppingCart, Star, Truck, Shield } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
    if (session) {
      checkWishlistStatus()
    }
  }, [resolvedParams.slug, session])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${resolvedParams.slug}`)
      const data = await response.json()
      if (response.ok) {
        setProduct(data.product)
      } else {
        toast.error("Product not found")
        router.push("/products")
      }
    } catch (error) {
      toast.error("Failed to load product")
    } finally {
      setIsLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist")
      const data = await response.json()
      const inWishlist = data.wishlist?.some((item: any) => item.slug === resolvedParams.slug)
      setIsInWishlist(inWishlist)
    } catch (error) {
      console.error("Failed to check wishlist status")
    }
  }

  const addToCart = async () => {
    if (!session) {
      toast.error("Please login to add items to cart")
      router.push("/login")
      return
    }

    setIsAddingToCart(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity }),
      })

      if (response.ok) {
        toast.success("Added to cart")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add to cart")
      }
    } catch (error) {
      toast.error("Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const toggleWishlist = async () => {
    if (!session) {
      toast.error("Please login to manage wishlist")
      router.push("/login")
      return
    }

    setIsTogglingWishlist(true)
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsInWishlist(data.inWishlist)
        toast.success(data.message)
      } else {
        toast.error("Failed to update wishlist")
      }
    } catch (error) {
      toast.error("Failed to update wishlist")
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.images[selectedImage]?.url || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.comparePrice && product.comparePrice > product.price && (
                <Badge className="absolute top-4 right-4 bg-amber-500 text-lg px-3 py-1">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg ${
                      selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.brand && <p className="text-muted-foreground">by {product.brand}</p>}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.ratings.average)
                        ? "fill-amber-500 text-amber-500"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.ratings.average.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.ratings.count} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-900">${product.price.toFixed(2)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-muted-foreground line-through">₦{product.comparePrice.toFixed(2)}</span>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Stock:</span>
              {product.stock > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button className="flex-1" size="lg" onClick={addToCart} disabled={product.stock === 0 || isAddingToCart}>
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleWishlist}
                disabled={isTogglingWishlist}
                className={isInWishlist ? "bg-red-50" : ""}
              >
                {isTogglingWishlist ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                )}
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-900" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">On orders over $50</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-900" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm text-muted-foreground">100% secure transaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Product Details</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>{product.description}</p>
                  {product.category && (
                    <p>
                      <span className="font-medium text-foreground">Category:</span> {product.category}
                    </p>
                  )}
                  {product.sku && (
                    <p>
                      <span className="font-medium text-foreground">SKU:</span> {product.sku}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {product.reviews.map((review: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.userName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
