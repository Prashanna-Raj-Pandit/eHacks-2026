export default function SkeletonLoader() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-800 rounded w-1/4" />
      </div>
      <div className="h-4 bg-gray-800 rounded w-2/3" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="h-10 bg-gray-800 rounded-lg" />
        <div className="h-10 bg-gray-800 rounded-lg" />
        <div className="h-10 bg-gray-800 rounded-lg" />
        <div className="h-10 bg-gray-800 rounded-lg" />
      </div>
      <div className="h-20 bg-gray-800 rounded-lg" />
    </div>
  )
}