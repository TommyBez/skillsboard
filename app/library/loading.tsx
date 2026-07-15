import { Skeleton } from "@/components/ui/skeleton"

export default function LibraryLoading() {
  return (
    <main className="min-h-[calc(100dvh-4.5rem)] px-4 py-10 pb-28 md:px-8 md:pb-12">
      <div className="mx-auto max-w-[1440px]">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-5 h-16 w-full max-w-2xl rounded-2xl" />
        <Skeleton className="mt-10 h-28 w-full rounded-2xl" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl md:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </main>
  )
}
