"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Loader2 } from "lucide-react"

export function ProductsGrid() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams(searchParams.toString())
        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()
        setProducts(data.products || [])
        setPagination(data.pagination)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {pagination?.total || 0} products
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
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
                  {product.stock === 0 && <Badge className="absolute top-2 left-2 bg-destructive">Out of Stock</Badge>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 p-4">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium">{product.ratings.average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.ratings.count})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-900">₦{product.price.toFixed(2)}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₦{product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pagination.pages)].map((_, i) => (
            <Button key={i} variant={pagination.page === i + 1 ? "default" : "outline"} size="sm" asChild>
              <Link
                href={{
                  pathname: "/products",
                  query: { ...Object.fromEntries(searchParams), page: i + 1 },
                }}
              >
                {i + 1}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
