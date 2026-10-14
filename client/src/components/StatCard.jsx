
function StatCard({ stat }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">
          {stat.label}
        </span>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${stat.tone}`}
        >
          {stat.icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight">
        {stat.value}
      </p>

      <p className="mt-2 text-[11px] text-slate-400">
        {stat.note}
      </p>
    </article>
  )
}

export default StatCard
