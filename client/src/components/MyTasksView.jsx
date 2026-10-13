
import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import socket from '../socket'
import Avatar from './Avatar'
import Panel from './Panel'
import { EmptyState, Notice } from './States'
import { dueLabel, formatDateTime, statusLabel } from '../utils/format'

const statusOptions = ['Todo', 'In Progress', 'Completed']

function MyTasksView({ tasks, onTaskUpdated }) {
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

  // Task updates and new tasks are handled for the whole dashboard (useTaskSocket).
  // Comments are local to this screen, so this is the only listener it needs.
  useEffect(() => {
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

    socket.on('comment-created', handleCommentCreated)

    return () => {
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
        onTaskUpdated?.(updatedTask)
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

  const priorityDot = {
    High: 'bg-late',
    Medium: 'bg-doing',
    Low: 'bg-ink-faint',
  }

  const fieldClass =
    'rounded-md border border-line bg-paper px-3 py-2 text-sm'

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_180px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks or projects"
          aria-label="Search tasks"
          className={fieldClass}
        />

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Filter by priority"
          className={fieldClass}
        >
          <option value="All">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className={fieldClass}
        >
          <option value="All">All statuses</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </select>
      </div>

      {error && <Notice>{error}</Notice>}

      <Panel
        title={`${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`}
      >
        {filteredTasks.length === 0 ? (
          <EmptyState title="No tasks found">
            Change the filters, or check back when work is assigned to you.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {filteredTasks.map((task) => {
              const taskId = task._id || task.id
              const taskComments = commentsByTask[taskId] || []
              const commentsOpen = openCommentsTask === taskId
              const commentsLoaded = Object.prototype.hasOwnProperty.call(
                commentsByTask,
                taskId
              )
              const due = dueLabel(task)

              return (
                <li key={taskId} className="px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {task.project?.name || 'Unknown project'}
                      </p>

                      {task.description && (
                        <p className="mt-2 max-w-prose text-sm leading-6 text-ink-soft">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              priorityDot[task.priority] || 'bg-ink-faint'
                            }`}
                          />
                          {task.priority || 'Medium'} priority
                        </span>

                        <span className={due.late ? 'font-semibold text-late' : 'text-ink-soft'}>
                          {due.late ? due.text : `Due ${due.text.toLowerCase()}`}
                        </span>

                        {task.assignedTo?.name && (
                          <span className="flex items-center gap-2 text-ink-soft">
                            <Avatar name={task.assignedTo.name} size="sm" />
                            {task.assignedTo.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-40">
                      <label
                        htmlFor={`status-${taskId}`}
                        className="mb-1 block text-xs text-ink-soft"
                      >
                        Status
                      </label>

                      <select
                        id={`status-${taskId}`}
                        value={task.status}
                        disabled={updatingId === taskId}
                        onChange={(event) =>
                          handleStatusChange(taskId, event.target.value)
                        }
                        className={`${fieldClass} w-full disabled:opacity-60`}
                      >
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>
                            {statusLabel(item)}
                          </option>
                        ))}
                      </select>

                      {updatingId === taskId && (
                        <p className="mt-1 text-xs text-ink-soft">Saving...</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleComments(taskId)}
                    aria-expanded={commentsOpen}
                    className="mt-3 text-sm font-semibold text-brand hover:text-brand-deep"
                  >
                    {commentsOpen ? 'Hide comments' : 'Comments'}
                    {commentsLoaded && ` (${taskComments.length})`}
                  </button>

                  {commentsOpen && (
                    <div className="mt-3 rounded-md bg-canvas p-4">
                      {commentsError && (
                        <div className="mb-3">
                          <Notice onRetry={() => loadComments(taskId)}>
                            {commentsError}
                          </Notice>
                        </div>
                      )}

                      {commentsLoading ? (
                        <p className="text-sm text-ink-soft">Loading comments...</p>
                      ) : taskComments.length === 0 ? (
                        <p className="text-sm text-ink-soft">
                          No comments yet. Start the conversation below.
                        </p>
                      ) : (
                        <ul className="max-h-80 space-y-4 overflow-y-auto">
                          {taskComments.map((comment) => (
                            <li key={comment._id} className="flex gap-3">
                              <Avatar name={comment.user?.name} />
                              <div className="min-w-0">
                                <p className="text-sm">
                                  <span className="font-semibold">
                                    {comment.user?.name || 'Team member'}
                                  </span>
                                  <time className="ml-2 text-xs text-ink-soft">
                                    {formatDateTime(comment.createdAt)}
                                  </time>
                                </p>
                                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-6">
                                  {comment.text}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      <form
                        onSubmit={(event) => handleAddComment(event, taskId)}
                        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
                      >
                        <label className="flex-1">
                          <span className="sr-only">Add a comment</span>
                          <textarea
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                            placeholder="Write a comment"
                            rows={2}
                            maxLength={1000}
                            required
                            className={`${fieldClass} w-full resize-y`}
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={sendingComment || !commentText.trim()}
                          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
                        >
                          {sendingComment ? 'Posting...' : 'Post comment'}
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </div>
  )
}

export default MyTasksView
