import { timeAgo } from '../utils/format'

function ActivityFeed({ items }) {
  return (
    <ol className="px-5 py-4">
      {items.map((item, index) => (
        <li key={item._id} className="relative flex gap-3 pb-5 last:pb-0">
          {index !== items.length - 1 && (
            <span className="absolute left-[4px] top-4 h-full w-px bg-line" aria-hidden="true" />
          )}
          <span className="relative mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full border-2 border-brand bg-paper" />

          <div className="min-w-0 text-sm">
            <p className="break-words">
              <span className="font-semibold">{item.user?.name || 'Someone'}</span>{' '}
              <span className="text-ink-soft">
                {item.details || item.action || 'made a change'}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {[item.project?.name, item.task?.title].filter(Boolean).join(' / ')}
              {item.project?.name || item.task?.title ? ', ' : ''}
              {timeAgo(item.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default ActivityFeed
