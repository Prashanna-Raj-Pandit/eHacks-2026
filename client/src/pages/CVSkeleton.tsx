export default function CVSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4 p-6">
      {/* header */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="h-6 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-800 rounded w-2/5" />
      </div>
      {/* section */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-3 bg-gray-700 rounded w-1/4" />
          <div className="h-px bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-gray-800 rounded w-4/6" />
        </div>
      ))}
    </div>
  )
}