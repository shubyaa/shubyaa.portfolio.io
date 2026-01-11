import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES, PROJECT_STATUS } from '../lib/supabase'
import { ArrowLeft, Plus, X, Calendar, Users, FileText } from 'lucide-react'
import './CreateProject.css'

const CreateProject = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: PROJECT_STATUS.PLANNING,
    deadline: '',
    client_id: '',
    progress: 0
  })
  const [teamMembers, setTeamMembers] = useState([])
  const [phases, setPhases] = useState([
    { name: '', description: '', order: 1, status: 'pending' }
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .neq('id', user.id)
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { user_id: '', role: '' }])
  }

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const addPhase = () => {
    setPhases([...phases, { 
      name: '', 
      description: '', 
      order: phases.length + 1, 
      status: 'pending' 
    }])
  }

  const updatePhase = (index, field, value) => {
    const updated = [...phases]
    updated[index][field] = value
    setPhases(updated)
  }

  const removePhase = (index) => {
    const updated = phases.filter((_, i) => i !== index)
    // Reorder remaining phases
    updated.forEach((phase, i) => {
      phase.order = i + 1
    })
    setPhases(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from(TABLES.PROJECTS)
        .insert([{
          ...formData,
          created_by: user.id
        }])
        .select()
        .single()

      if (projectError) throw projectError

      // Add admin as project member
      const members = [
        { 
          project_id: project.id, 
          user_id: user.id, 
          role: 'Admin' 
        },
        ...teamMembers
          .filter(m => m.user_id && m.role)
          .map(m => ({ ...m, project_id: project.id }))
      ]

      const { error: membersError } = await supabase
        .from(TABLES.PROJECT_MEMBERS)
        .insert(members)

      if (membersError) throw membersError

      // Add phases
      if (phases.some(p => p.name)) {
        const validPhases = phases
          .filter(p => p.name)
          .map(p => ({ ...p, project_id: project.id }))

        const { error: phasesError } = await supabase
          .from(TABLES.PROJECT_PHASES)
          .insert(validPhases)

        if (phasesError) throw phasesError
      }

      navigate(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="create-project-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1>Create New Project</h1>
      </div>

      <div className="create-project-container">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="project-form">
          {/* Basic Info */}
          <div className="form-section">
            <h2>
              <FileText size={20} />
              Project Details
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value={PROJECT_STATUS.PLANNING}>Planning</option>
                  <option value={PROJECT_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={PROJECT_STATUS.REVIEW}>In Review</option>
                  <option value={PROJECT_STATUS.COMPLETED}>Completed</option>
                  <option value={PROJECT_STATUS.ON_HOLD}>On Hold</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe the project goals and requirements"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deadline">
                  <Calendar size={18} />
                  Deadline *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="client_id">Client</label>
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                >
                  <option value="">Select a client</option>
                  {users.filter(u => u.role === 'client').map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="form-section">
            <div className="section-header">
              <h2>
                <Users size={20} />
                Team Members
              </h2>
              <button
                type="button"
                onClick={addTeamMember}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={18} />
                Add Member
              </button>
            </div>

            <div className="team-members-list">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member-item">
                  <div className="form-row">
                    <div className="form-group">
                      <select
                        value={member.user_id}
                        onChange={(e) => updateTeamMember(index, 'user_id', e.target.value)}
                        required
                      >
                        <option value="">Select user</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        placeholder="Role (e.g., Frontend Developer)"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="btn-icon btn-danger"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Phases */}
          <div className="form-section">
            <div className="section-header">
              <h2>Project Phases</h2>
              <button
                type="button"
                onClick={addPhase}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={18} />
                Add Phase
              </button>
            </div>

            <div className="phases-list">
              {phases.map((phase, index) => (
                <div key={index} className="phase-item">
                  <div className="phase-number">Phase {index + 1}</div>
                  <div className="phase-fields">
                    <div className="form-group">
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => updatePhase(index, 'name', e.target.value)}
                        placeholder="Phase name"
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        value={phase.description}
                        onChange={(e) => updatePhase(index, 'description', e.target.value)}
                        placeholder="Phase description"
                        rows="2"
                      />
                    </div>
                  </div>
                  {phases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhase(index)}
                      className="btn-icon btn-danger"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Link to="/dashboard" className="btn btn-outline">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject
