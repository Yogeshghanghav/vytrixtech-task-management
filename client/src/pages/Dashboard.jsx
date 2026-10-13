import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import useTaskSocket from '../hooks/useTaskSocket'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import OverviewView from '../components/OverviewView'
import ProjectsView from '../components/ProjectsView'
import MyTasksView from '../components/MyTasksView'
import TeamView from '../components/TeamView'
import NewTaskForm from '../components/NewTaskForm'
import { idOf, isOverdue, todayLabel } from '../utils/format'

const MANAGER_ROLES = ['Admin', 'Project Manager']

const pageSubtitles = {
  Projects: 'Projects you own or have been added to',
  'My tasks': 'Update progress and talk through the work',
  Team: 'Who is working on what',
}

function listFrom(data, key) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.data)) return data.data
  return []
}

const errorText = (err, fallback) => err.response?.data?.message || fallback

function Dashboard({ user, onLogout }) {
  const canManage = MANAGER_ROLES.includes(user?.role)
  const isDeveloper = String(user?.role).toLowerCase() === 'developer'

  const [activeNav, setActiveNav] = useState('Overview')
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState({ projects: true, tasks: true, activities: canManage })
  const [errors, setErrors] = useState({ projects: '', tasks: '', activities: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [developers, setDevelopers] = useState([])
  const [loadingDevelopers, setLoadingDevelopers] = useState(false)
  const [developersError, setDevelopersError] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)
  const [taskFormError, setTaskFormError] = useState('')

  const [flash, setFlash] = useState('')

  const setLoadingFor = (key, value) => setLoading((cur) => ({ ...cur, [key]: value }))
  const setErrorFor = (key, value) => setErrors((cur) => ({ ...cur, [key]: value }))

  async function loadProjects() {
    setLoadingFor('projects', true)
    setErrorFor('projects', '')

    try {
      const { data } = await api.get('/projects')
      setProjects(listFrom(data, 'projects'))
    } catch (err) {
      setErrorFor('projects', errorText(err, 'Could not load projects.'))
    } finally {
      setLoadingFor('projects', false)
    }
  }

  async function loadTasks() {
    setLoadingFor('tasks', true)
    setErrorFor('tasks', '')

    try {
      const { data } = await api.get('/tasks')
      setTasks(listFrom(data, 'tasks'))
    } catch (err) {
      setErrorFor('tasks', errorText(err, 'Could not load tasks.'))
    } finally {
      setLoadingFor('tasks', false)
    }
  }

  async function loadActivities() {
    setLoadingFor('activities', true)
    setErrorFor('activities', '')

    try {
      const { data } = await api.get('/activity-logs')
      setActivities(listFrom(data, 'logs'))
    } catch (err) {
      setErrorFor('activities', errorText(err, 'Could not load recent activity.'))
    } finally {
      setLoadingFor('activities', false)
    }
  }

  async function loadDevelopers() {
    setLoadingDevelopers(true)
    setDevelopersError('')

    try {
      const { data } = await api.get('/users/developers')
      setDevelopers(listFrom(data, 'developers'))
    } catch (err) {
      setDevelopersError(errorText(err, 'Could not load the list of developers.'))
    } finally {
      setLoadingDevelopers(false)
    }
  }

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadProjects()
    loadTasks()
    // the activity log endpoint is only open to admins and project managers
    if (canManage) loadActivities()
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fade the notification away on its own.
  useEffect(() => {
    if (!flash) return undefined
    const timer = setTimeout(() => setFlash(''), 6000)
    return () => clearTimeout(timer)
  }, [flash])

  // Progress is worked out from the tasks we already have, so there is one source of truth.
  const projectsWithProgress = useMemo(() => {
    return projects.map((project) => {
      const own = tasks.filter((task) => idOf(task.project) === project._id)
      return {
        ...project,
        total: own.length,
        done: own.filter((task) => task.status === 'Completed').length,
      }
    })
  }, [projects, tasks])

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'Completed').length
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length

    return {
      total: tasks.length,
      done,
      inProgress,
      todo: tasks.length - done - inProgress,
      pending: tasks.length - done,
      overdue: tasks.filter(isOverdue).length,
    }
  }, [tasks])

  // Every project room this user should be listening to.
  const projectIds = useMemo(() => {
    const ids = [...projects.map((p) => p._id), ...tasks.map((t) => idOf(t.project))]
    return [...new Set(ids.filter(Boolean))]
  }, [projects, tasks])

  // Adds a task, or merges it if we already have it (the creator gets it twice:
  // once from the API response and once from the socket).
  function addTask(newTask) {
    setTasks((current) => {
      const id = idOf(newTask)

      if (current.some((task) => idOf(task) === id)) {
        return current.map((task) => (idOf(task) === id ? { ...task, ...newTask } : task))
      }
      return [newTask, ...current]
    })
  }

  function handleTaskUpdated(updated) {
    const id = idOf(updated)
    if (!id) return

    setTasks((current) =>
      current.map((task) => (idOf(task) === id ? { ...task, ...updated } : task))
    )
  }
  function handleTaskCreated(newTask) {
    const id = idOf(newTask)
    if (!id) return

    const knownProject = projects.some((project) => project._id === idOf(newTask.project))
    const visible = isDeveloper ? idOf(newTask.assignedTo) === idOf(user) : knownProject
    if (!visible) return

    const alreadyHere = tasks.some((task) => idOf(task) === id)
    addTask(newTask)

    if (isDeveloper && !knownProject) loadProjects()

    if (isDeveloper && !alreadyHere) {
      setFlash(`New task assigned to you: ${newTask.title}`)
    }
  }

  useTaskSocket({
    projectIds,
    onTaskCreated: handleTaskCreated,
    onTaskUpdated: handleTaskUpdated,
  })

  async function createProject(name) {
    setSaving(true)
    setErrorFor('projects', '')

    try {
      const { data } = await api.post('/projects', { name })
      const created = data.data || data.project

      if (created?._id) {
        setProjects((current) => [created, ...current])
      } else {
        await loadProjects()
      }

      setShowForm(false)
      return true
    } catch (err) {
      setErrorFor('projects', errorText(err, 'Could not create the project.'))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.name}"? This can't be undone.`)) return

    try {
      await api.delete(`/projects/${project._id}`)
      setProjects((current) => current.filter((p) => p._id !== project._id))
    } catch (err) {
      setErrorFor('projects', errorText(err, 'Could not delete the project.'))
    }
  }

  async function createTask(payload) {
    setCreatingTask(true)
    setTaskFormError('')

    try {
      const { data } = await api.post('/tasks', payload)
      const created = data.data

      if (created?._id) addTask(created)

      setShowTaskForm(false)
      setFlash(`Task assigned to ${created?.assignedTo?.name || 'the developer'}: ${payload.title}`)
      return true
    } catch (err) {
      setTaskFormError(errorText(err, 'Could not create the task.'))
      return false
    } finally {
      setCreatingTask(false)
    }
  }

  function openNewProject() {
    setActiveNav('Projects')
    setShowForm(true)
  }

  function openNewTask() {
    setActiveNav('My tasks')
    setTaskFormError('')
    setShowTaskForm(true)
    if (developers.length === 0) loadDevelopers()
  }

  const headerActions =
    canManage && ['Overview', 'Projects', 'My tasks'].includes(activeNav) ? (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={openNewProject}
          className="rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-semibold hover:bg-canvas"
        >
          New project
        </button>
        <button
          type="button"
          onClick={openNewTask}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          New task
        </button>
      </div>
    ) : null

  return (
    <DashboardLayout
      activeNav={activeNav}
      setActiveNav={setActiveNav}
      user={user}
      openCount={stats.pending}
      onLogout={onLogout}
    >
      <PageHeader
        title={activeNav}
        subtitle={activeNav === 'Overview' ? todayLabel() : pageSubtitles[activeNav]}
        action={headerActions}
      />

      {flash && (
        <div
          role="status"
          className="mt-5 flex items-start justify-between gap-4 border-l-4 border-done bg-done-wash px-4 py-3 text-sm text-done"
        >
          <span>{flash}</span>
          <button type="button" onClick={() => setFlash('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {activeNav === 'Overview' && (
        <OverviewView
          user={user}
          canManage={canManage}
          stats={stats}
          tasks={tasks}
          projects={projectsWithProgress}
          activities={activities}
          loading={loading}
          errors={errors}
          onRetry={{ projects: loadProjects, tasks: loadTasks, activities: loadActivities }}
          onGoTo={setActiveNav}
        />
      )}

      {activeNav === 'Projects' && (
        <ProjectsView
          projects={projectsWithProgress}
          canManage={canManage}
          loading={loading.projects}
          error={errors.projects}
          onRetry={loadProjects}
          onDelete={deleteProject}
          showForm={showForm}
          onOpenForm={openNewProject}
          onCloseForm={() => setShowForm(false)}
          onCreate={createProject}
          saving={saving}
        />
      )}

      {activeNav === 'My tasks' && (
        <>
          {canManage && showTaskForm && (
            <div className="mt-6">
              <NewTaskForm
                projects={projects}
                developers={developers}
                loadingDevelopers={loadingDevelopers}
                developersError={developersError}
                saving={creatingTask}
                error={taskFormError}
                onSubmit={createTask}
                onCancel={() => setShowTaskForm(false)}
                onGoToProjects={() => setActiveNav('Projects')}
              />
            </div>
          )}

          {loading.tasks ? (
            <p className="mt-6 text-sm text-ink-soft">Loading tasks...</p>
          ) : errors.tasks ? (
            <p role="alert" className="mt-6 border-l-4 border-late bg-late-wash px-4 py-3 text-sm text-late">
              {errors.tasks}{' '}
              <button type="button" onClick={loadTasks} className="font-semibold underline">
                Try again
              </button>
            </p>
          ) : (
            <MyTasksView tasks={tasks} onTaskUpdated={handleTaskUpdated} />
          )}
        </>
      )}

      {activeNav === 'Team' && <TeamView tasks={tasks} />}
    </DashboardLayout>
  )
}

export default Dashboard
