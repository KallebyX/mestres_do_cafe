import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

const ProductSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[200px] w-full rounded-xl bg-brand-brown/10" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 bg-brand-brown/10" />
      <Skeleton className="h-4 w-1/2 bg-brand-brown/10" />
      <Skeleton className="h-8 w-full mt-4 bg-brand-brown/10" />
    </div>
  </div>
)

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <Skeleton className="h-12 w-3/4 mx-auto mb-3 bg-brand-brown/20" />
          <Skeleton className="h-6 w-1/2 mx-auto bg-brand-brown/20" />
        </div>

        <div className="mb-8 md:mb-12 p-6 bg-white rounded-xl shadow-lg border border-brand-brown/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1 space-y-1">
              <Skeleton className="h-4 w-1/3 bg-brand-brown/20" />
              <div className="relative">
                <Skeleton className="h-10 w-full pl-10 bg-brand-brown/10" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-brown/30" />
              </div>
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-1/3 bg-brand-brown/20" />
              <Skeleton className="h-10 w-full bg-brand-brown/10" />
            </div>
            <Skeleton className="h-10 w-full md:w-auto md:self-end bg-brand-brown/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
