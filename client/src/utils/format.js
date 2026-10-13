const DAY = 24 * 60 * 60 * 1000

function startOfDay(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d
}

export function statusLabel(status) {
  return status === 'Todo' ? 'To do' : status
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatDate(value, withYear = false) {
  if (!value) return 'No date'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'No date'

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(withYear && { year: 'numeric' }),
  })
}

export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// A task is overdue once its due day has passed. Due today still counts as on time.
export function isOverdue(task) {
  if (!task.dueDate || task.status === 'Completed') return false
  return startOfDay(task.dueDate) < startOfDay(new Date())
}

export function dueLabel(task) {
  if (!task.dueDate) return { text: 'No due date', late: false }
  if (task.status === 'Completed') return { text: formatDate(task.dueDate), late: false }

  const diff = Math.round((startOfDay(task.dueDate) - startOfDay(new Date())) / DAY)

  if (diff < 0) {
    return { text: diff === -1 ? '1 day late' : `${-diff} days late`, late: true }
  }
  if (diff === 0) return { text: 'Today', late: false }
  if (diff === 1) return { text: 'Tomorrow', late: false }
  if (diff < 7) return { text: `In ${diff} days`, late: false }

  return { text: formatDate(task.dueDate), late: false }
}

export function timeAgo(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d ago`

  return formatDate(value)
}

// Tasks and projects can come back populated or as plain ids.
export function idOf(value) {
  if (!value) return ''
  return String(typeof value === 'object' ? value._id ?? value.id ?? '' : value)
}
