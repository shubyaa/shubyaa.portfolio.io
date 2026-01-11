import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES } from '../lib/supabase'
import { Plus, Folder, Clock, Users, LogOut, User, Menu, X } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [user])

  const loadProjects = async () => {
    try {
      let query = supabase
        .from(TABLES.PROJECTS)
        .select(`
          *,
          project_members!inner(
            user_id,
            role,
            profiles(full_name, email)
          )
        `)

      // If not admin, filter projects where user is a member
      if (!isAdmin()) {
        query = query.eq('project_members.user_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: 'status-planning',
      in_progress: 'status-progress',
      review: 'status-review',
      completed: 'status-completed',
      on_hold: 'status-hold'
    }
    return colors[status] || 'status-planning'
  }

  const getStatusLabel = (status) => {
    const labels = {
      planning: 'Planning',
      in_progress: 'In Progress',
      review: 'In Review',
      completed: 'Completed',
      on_hold: 'On Hold'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${menuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <span className="logo-text">SP</span>
          </Link>
          <button 
            className="sidebar-close"
            onClick={() => setMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Menu</h3>
            <Link to="/dashboard" className="nav-item active">
              <Folder size={20} />
              <span>Projects</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3>Account</h3>
            <button className="nav-item" onClick={handleSignOut}>
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <div className="user-name">{profile?.full_name}</div>
              <div className="user-role">{profile?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="header-content">
            <div>
              <h1>My Projects</h1>
              <p className="header-subtitle">
                {isAdmin() ? 'Manage all projects' : 'Your assigned projects'}
              </p>
            </div>

            {isAdmin() && (
              <Link to="/projects/create" className="btn btn-primary">
                <Plus size={20} />
                Create Project
              </Link>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          {projects.length === 0 ? (
            <div className="empty-state">
              <Folder size={64} />
              <h2>No projects yet</h2>
              <p>
                {isAdmin() 
                  ? 'Create your first project to get started' 
                  : "You haven't been assigned to any projects yet"}
              </p>
              {isAdmin() && (
                <Link to="/projects/create" className="btn btn-primary">
                  <Plus size={20} />
                  Create Project
                </Link>
              )}
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="project-card"
                >
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={`project-status ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  <p className="project-description">{project.description}</p>

                  <div className="project-meta">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <Users size={16} />
                      <span>{project.project_members?.length || 0} members</span>
                    </div>
                  </div>

                  {project.progress !== null && (
                    <div className="project-progress">
                      <div className="progress-info">
                        <span className="progress-label">Progress</span>
                        <span className="progress-value">{project.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile overlay */}
      {menuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default Dashboard
