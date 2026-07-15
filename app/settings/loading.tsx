import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-4.5rem)] w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
      <Skeleton className="h-10 w-36 rounded-xl" />
      <Skeleton className="mt-8 h-24 w-full max-w-3xl rounded-2xl" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </main>
  )
}
