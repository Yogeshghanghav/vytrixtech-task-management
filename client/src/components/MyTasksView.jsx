
import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../api'
import socket from '../socket'

const statusOptions = ['Todo', 'In Progress', 'Completed']

function formatDate(dateValue) {
  if (!dateValue) return 'No due date'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return 'No due date'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateValue) {
  if (!dateValue) return ''

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MyTasksView({ tasks, onTaskUpdated, onTaskCreated }) {
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('All')
  const [status, setStatus] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const [openCommentsTask, setOpenCommentsTask] = useState(null)
  const [commentsByTask, setCommentsByTask] = useState({})
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  // Keep the latest task IDs and callbacks without re-registering socket listeners.
  const projectIdsRef = useRef([])
  const callbacksRef = useRef({})
  const openCommentsTaskRef = useRef(null)

  useEffect(() => {
    projectIdsRef.current = [
      ...new Set(
        tasks
          .map((task) => {
            return typeof task.project === 'object'
              ? task.project?._id
              : task.project
          })
          .filter(Boolean)
          .map(String)
      ),
    ]

    if (socket.connected) {
      projectIdsRef.current.forEach((projectId) => {
        socket.emit('join-project', projectId)
      })
    }
  }, [tasks])

  useEffect(() => {
    callbacksRef.current = {
      onTaskUpdated,
      onTaskCreated,
    }
  }, [onTaskUpdated, onTaskCreated])

  useEffect(() => {
    openCommentsTaskRef.current = openCommentsTask
  }, [openCommentsTask])

  // Connect once, join authorized project rooms, and listen for live updates.
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) return

    function joinProjectRooms() {
      projectIdsRef.current.forEach((projectId) => {
        socket.emit('join-project', projectId)
      })
    }

    function handleTaskUpdated(payload) {
      if (payload?.task?._id) {
        callbacksRef.current.onTaskUpdated?.(payload.task)
      }
    }

    function handleTaskCreated(payload) {
      if (payload?.task?._id) {
        callbacksRef.current.onTaskCreated?.(payload.task)
      }
    }

    function handleCommentCreated(payload) {
      const taskId = payload?.taskId
      const newComment = payload?.comment

      if (!taskId || !newComment?._id) return

      setCommentsByTask((current) => {
        // Update comments only when this task's comments have already been loaded.
        if (!Object.prototype.hasOwnProperty.call(current, taskId)) {
          return current
        }

        const existingComments = current[taskId] || []

        // Avoid duplicates when the POST response and socket event both arrive.
        if (existingComments.some((comment) => comment._id === newComment._id)) {
          return current
        }

        return {
          ...current,
          [taskId]: [...existingComments, newComment],
        }
      })
    }

    socket.auth = { token }

    socket.on('connect', joinProjectRooms)
    socket.on('task-updated', handleTaskUpdated)
    socket.on('task-created', handleTaskCreated)
    socket.on('comment-created', handleCommentCreated)

    if (!socket.connected) {
      socket.connect()
    } else {
      joinProjectRooms()
    }

    return () => {
      socket.off('connect', joinProjectRooms)
      socket.off('task-updated', handleTaskUpdated)
      socket.off('task-created', handleTaskCreated)
      socket.off('comment-created', handleCommentCreated)
    }
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        (task.title || '').toLowerCase().includes(searchText) ||
        (task.project?.name || '').toLowerCase().includes(searchText)

      const matchesPriority =
        priority === 'All' || task.priority === priority

      const matchesStatus =
        status === 'All' || task.status === status

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [tasks, search, priority, status])

  async function handleStatusChange(taskId, newStatus) {
    try {
      setUpdatingId(taskId)
      setError('')

      const response = await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      })

      const updatedTask = response.data?.data

      if (updatedTask) {
        callbacksRef.current.onTaskUpdated?.(updatedTask)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update task status. Please try again.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  async function loadComments(taskId) {
    try {
      setCommentsLoading(true)
      setCommentsError('')

      const response = await api.get(`/comments/${taskId}`)
      const commentList = response.data?.data

      setCommentsByTask((current) => ({
        ...current,
        [taskId]: Array.isArray(commentList) ? commentList : [],
      }))
    } catch (err) {
      setCommentsError(
        err.response?.data?.message ||
          'Unable to load comments. Please try again.'
      )
    } finally {
      setCommentsLoading(false)
    }
  }

  async function toggleComments(taskId) {
    if (openCommentsTask === taskId) {
      setOpenCommentsTask(null)
      setCommentsError('')
      return
    }

    setOpenCommentsTask(taskId)
    setCommentText('')

    if (!Object.prototype.hasOwnProperty.call(commentsByTask, taskId)) {
      await loadComments(taskId)
    } else {
      setCommentsError('')
    }
  }

  async function handleAddComment(event, taskId) {
    event.preventDefault()

    const text = commentText.trim()

    if (!text || sendingComment) return

    try {
      setSendingComment(true)
      setCommentsError('')

      const response = await api.post(`/comments/${taskId}`, { text })
      const savedComment = response.data?.data

      if (savedComment) {
        setCommentsByTask((current) => {
          const existingComments = current[taskId] || []

          if (
            existingComments.some(
              (comment) => comment._id === savedComment._id
            )
          ) {
            return current
          }

          return {
            ...current,
            [taskId]: [...existingComments, savedComment],
          }
        })
      } else {
        await loadComments(taskId)
      }

      setCommentText('')
    } catch (err) {
      setCommentsError(
        err.response?.data?.message ||
          'Unable to add comment. Please try again.'
      )
    } finally {
      setSendingComment(false)
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
          Task management
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          My tasks
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Track assignments, update progress, and discuss your work.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks or projects..."
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
        >
          <option value="All">All priorities</option>
          <option value="High">High priority</option>
          <option value="Medium">Medium priority</option>
          <option value="Low">Low priority</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
        >
          <option value="All">All statuses</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item === 'Todo' ? 'To Do' : item}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No tasks found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters, or check back when tasks are assigned.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const taskId = task._id || task.id
            const taskComments = commentsByTask[taskId] || []
            const commentsOpen = openCommentsTask === taskId

            return (
              <article
                key={taskId}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {task.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Project: {task.project?.name || 'Unknown project'}
                    </p>

                    {task.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-600'
                            : task.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {task.priority || 'Medium'} priority
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-44">
                    <label
                      htmlFor={`status-${taskId}`}
                      className="mb-2 block text-xs font-semibold text-slate-500"
                    >
                      Task status
                    </label>

                    <select
                      id={`status-${taskId}`}
                      value={task.status}
                      disabled={updatingId === taskId}
                      onChange={(event) =>
                        handleStatusChange(taskId, event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 disabled:opacity-60"
                    >
                      {statusOptions.map((item) => (
                        <option key={item} value={item}>
                          {item === 'Todo' ? 'To Do' : item}
                        </option>
                      ))}
                    </select>

                    {updatingId === taskId && (
                      <p className="mt-2 text-xs text-indigo-600">
                        Saving status...
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleComments(taskId)}
                    aria-expanded={commentsOpen}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <span aria-hidden="true">▤</span>
                    {commentsOpen ? 'Hide comments' : 'View comments'}

                    {Object.prototype.hasOwnProperty.call(
                      commentsByTask,
                      taskId
                    ) && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs">
                        {taskComments.length}
                      </span>
                    )}
                  </button>

                  {commentsOpen && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-slate-800">
                          Task discussion
                        </h4>

                        <button
                          type="button"
                          onClick={() => loadComments(taskId)}
                          disabled={commentsLoading}
                          className="text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                        >
                          Refresh
                        </button>
                      </div>

                      {commentsError && (
                        <div
                          role="alert"
                          className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                        >
                          {commentsError}
                          <button
                            type="button"
                            onClick={() => loadComments(taskId)}
                            className="ml-2 font-semibold underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {commentsLoading ? (
                        <p className="py-4 text-sm text-slate-500">
                          Loading comments...
                        </p>
                      ) : taskComments.length === 0 ? (
                        <p className="py-4 text-sm text-slate-500">
                          No comments yet. Start the conversation.
                        </p>
                      ) : (
                        <div className="mb-5 max-h-80 space-y-3 overflow-y-auto">
                          {taskComments.map((comment) => (
                            <div
                              key={comment._id}
                              className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800">
                                  {comment.user?.name || 'Team member'}
                                </p>

                                <time className="text-xs text-slate-400">
                                  {formatDateTime(comment.createdAt)}
                                </time>
                              </div>

                              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(event) =>
                          handleAddComment(event, taskId)
                        }
                        className="flex flex-col gap-3 sm:flex-row sm:items-end"
                      >
                        <label className="flex-1">
                          <span className="mb-2 block text-xs font-semibold text-slate-600">
                            Add a comment
                          </span>
                          <textarea
                            value={commentText}
                            onChange={(event) =>
                              setCommentText(event.target.value)
                            }
                            placeholder="Share an update or ask a question..."
                            rows={2}
                            maxLength={2000}
                            required
                            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400"
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={sendingComment || !commentText.trim()}
                          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {sendingComment ? 'Sending...' : 'Send comment'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MyTasksView
