/** Loading placeholder that mirrors StoreCard's geometry to avoid layout shift. */
export default function SkeletonCard({ index = 0 }) {
  return (
    <div
      className="card p-5 pl-6"
      style={{ animation: `fade 0.4s ease-out ${index * 0.08}s both` }}
      aria-hidden="true"
    >
      <div className="skeleton h-4 w-2/3 rounded-md" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded-md" />
      <div className="skeleton mt-4 h-6 w-24 rounded-full" />
      <div className="skeleton mt-4 h-7 w-28 rounded-md" />
      <div className="skeleton mt-4 h-3 w-full rounded-md" />
      <div className="skeleton mt-1.5 h-3 w-4/5 rounded-md" />
      <div className="skeleton mt-4 h-3 w-1/2 rounded-md" />
      <div className="skeleton mt-6 h-10 w-full rounded-xl" />
    </div>
  )
}
