import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/categories`, {
      cache: "no-store",
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.categories || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function CategoryShowcase() {
  const categories = await getCategories()

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category: any) => (
            <Link key={category._id} href={`/products?category=${category.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className="relative h-20 w-20 rounded-full bg-muted overflow-hidden">
                    <Image
                      src={category.image || `/placeholder.svg?height=80&width=80&query=${category.name}`}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-center text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
