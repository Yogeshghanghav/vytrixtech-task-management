
import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')

    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const [showRegister, setShowRegister] = useState(false)

  function handleLogin(loggedInUser) {
    setUser(loggedInUser)
    setShowRegister(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return showRegister ? (
      <Register
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default App
