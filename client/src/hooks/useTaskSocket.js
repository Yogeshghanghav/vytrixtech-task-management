import { useEffect, useRef } from 'react'
import socket from '../socket'

function useTaskSocket({ projectIds, onTaskCreated, onTaskUpdated }) {
  const projectIdsRef = useRef(projectIds)
  const handlersRef = useRef({ onTaskCreated, onTaskUpdated })

  useEffect(() => {
    handlersRef.current = { onTaskCreated, onTaskUpdated }
  })
  useEffect(() => {
    projectIdsRef.current = projectIds

    if (socket.connected) {
      projectIds.forEach((id) => socket.emit('join-project', id))
    }
  }, [projectIds])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    function joinRooms() {
      projectIdsRef.current.forEach((id) => socket.emit('join-project', id))
    }

    function handleCreated(payload) {
      if (payload?.task?._id) handlersRef.current.onTaskCreated?.(payload.task)
    }

    function handleUpdated(payload) {
      if (payload?.task?._id) handlersRef.current.onTaskUpdated?.(payload.task)
    }

    socket.auth = { token }
    socket.on('connect', joinRooms)
    socket.on('task-created', handleCreated)
    socket.on('task-updated', handleUpdated)
    socket.connect()

    return () => {
      socket.off('connect', joinRooms)
      socket.off('task-created', handleCreated)
      socket.off('task-updated', handleUpdated)
      // Closing here also stops the next person who logs in from reusing this connection.
      socket.disconnect()
    }
  }, [])
}

export default useTaskSocket
