import React, { useState } from 'react'
import Login from './components/login.jsx'
import SignUp from './components/SignUp.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import CandidateDashboard from './components/CandidateDashboard.jsx'

const App = () => {
  const [currentPage, setCurrentPage] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null) // 'admin' or 'candidate'
  const [userData, setUserData] = useState(null)

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  const handleLogin = (email, password, role = 'candidate') => {
    // Simulate successful login
    setIsAuthenticated(true)
    setUserRole(role)
    setUserData({
      name: role === 'admin' ? 'Admin User' : 'Candidate User',
      email: email
    })
    
    // Navigate to appropriate dashboard
    if (role === 'admin') {
      setCurrentPage('admin-dashboard')
    } else {
      setCurrentPage('candidate-dashboard')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    setUserData(null)
    setCurrentPage('login')
  }

  return (
    <>
      {currentPage === 'login' && (
        <Login 
          onNavigate={navigateTo} 
          onLogin={handleLogin}
        />
      )}
      {currentPage === 'signup' && (
        <SignUp 
          onNavigate={navigateTo}
        />
      )}
      {currentPage === 'admin-dashboard' && isAuthenticated && userRole === 'admin' && (
        <AdminDashboard 
          onLogout={handleLogout}
          userData={userData}
        />
      )}
      {currentPage === 'candidate-dashboard' && isAuthenticated && userRole === 'candidate' && (
        <CandidateDashboard 
          onLogout={handleLogout}
          userData={userData}
        />
      )}
    </>
  )
}

export default App