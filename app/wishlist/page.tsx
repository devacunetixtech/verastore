"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist")
      const data = await response.json()
      setWishlist(data.wishlist || [])
    } catch (error) {
      toast.error("Failed to load wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    setRemovingItems((prev) => new Set(prev).add(productId))
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        toast.success("Removed from wishlist")
        await fetchWishlist()
      } else {
        toast.error("Failed to remove from wishlist")
      }
    } catch (error) {
      toast.error("Failed to remove from wishlist")
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const addToCart = async (productId: string) => {
    setAddingToCart((prev) => new Set(prev).add(productId))
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
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
      setAddingToCart((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save your favorite items for later</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product: any) => (
            <Card key={product._id} className="group overflow-hidden">
              <Link href={`/products/${product.slug}`}>
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={product.images[0]?.url || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.comparePrice && product.comparePrice > product.price && (
                      <Badge className="absolute top-2 right-2 bg-amber-500">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute top-2 left-2 bg-destructive">Out of Stock</Badge>
                    )}
                  </div>
                </CardContent>
              </Link>
              <CardFooter className="flex flex-col gap-3 p-4">
                <div className="w-full">
                  <Link href={`/products/${product.slug}`} className="hover:text-primary">
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                  </Link>
                  <p className="text-xl font-bold text-blue-900">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock === 0 || addingToCart.has(product._id)}
                  >
                    {addingToCart.has(product._id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(product._id)}
                    disabled={removingItems.has(product._id)}
                  >
                    {removingItems.has(product._id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
