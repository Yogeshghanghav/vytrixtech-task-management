export function Notice({ children, onRetry, retrying = false }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-late bg-late-wash px-4 py-3 text-sm text-late"
    >
      <span>{children}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="font-semibold underline disabled:opacity-50"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {children && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{children}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Skeleton({ rows = 3 }) {
  return (
    <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4">
          <div className="h-3 w-1/3 rounded bg-canvas" />
          <div className="h-3 flex-1 rounded bg-canvas" />
          <div className="h-3 w-16 rounded bg-canvas" />
        </div>
      ))}
    </div>
  )
}
