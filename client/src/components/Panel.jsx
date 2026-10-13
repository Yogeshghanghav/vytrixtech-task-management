function Panel({ title, note, action, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-line bg-paper shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {note && <p className="mt-0.5 text-sm text-ink-soft">{note}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export default Panel  