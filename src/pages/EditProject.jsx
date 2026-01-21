import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES, PROJECT_STATUS } from '../lib/supabase'
import { ArrowLeft, Plus, X, Calendar, Users, FileText, Trash2 } from 'lucide-react'
import './CreateProject.css'

const EditProject = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [phases, setPhases] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjectData()
    loadUsers()
  }, [id])

  const loadProjectData = async () => {
    try {
      const [projectRes, membersRes, phasesRes] = await Promise.all([
        supabase.from(TABLES.PROJECTS).select('*').eq('id', id).single(),
        supabase.from(TABLES.PROJECT_MEMBERS).select('*').eq('project_id', id).neq('user_id', user.id),
        supabase.from(TABLES.PROJECT_PHASES).select('*').eq('project_id', id).order('order_num', { ascending: true })
      ])

      if (projectRes.error) throw projectRes.error

      const project = projectRes.data
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        deadline: project.deadline,
        client_id: project.client_id || '',
        progress: project.progress
      })

      setTeamMembers((membersRes.data || []).map(m => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        isExisting: true
      })))

      setPhases((phasesRes.data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        order: p.order_num,
        status: p.status,
        isExisting: true
      })))

      if (phasesRes.data?.length === 0) {
        setPhases([{ name: '', description: '', order: 1, status: 'pending' }])
      }
    } catch (error) {
      console.error('Error loading project:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

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
    updated.forEach((phase, i) => {
      phase.order = i + 1
    })
    setPhases(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Update project
      const { error: projectError } = await supabase
        .from(TABLES.PROJECTS)
        .update(formData)
        .eq('id', id)

      if (projectError) throw projectError

      // Handle team members
      const existingMembers = teamMembers.filter(m => m.isExisting && m.id)
      const newMembers = teamMembers.filter(m => !m.isExisting && m.user_id && m.role)
      const existingIds = existingMembers.map(m => m.id)

      // Delete removed members
      const { error: deleteError } = await supabase
        .from(TABLES.PROJECT_MEMBERS)
        .delete()
        .eq('project_id', id)
        .neq('user_id', user.id)
        .not('id', 'in', `(${existingIds.join(',') || 'null'})`)

      if (deleteError) throw deleteError

      // Update existing members
      for (const member of existingMembers) {
        const { error } = await supabase
          .from(TABLES.PROJECT_MEMBERS)
          .update({ role: member.role })
          .eq('id', member.id)
        if (error) throw error
      }

      // Insert new members
      if (newMembers.length > 0) {
        const { error } = await supabase
          .from(TABLES.PROJECT_MEMBERS)
          .insert(newMembers.map(m => ({
            project_id: id,
            user_id: m.user_id,
            role: m.role
          })))
        if (error) throw error
      }

      // Handle phases
      const existingPhases = phases.filter(p => p.isExisting && p.id)
      const newPhases = phases.filter(p => !p.isExisting && p.name)
      const existingPhaseIds = existingPhases.map(p => p.id)

      // Delete removed phases
      const { error: deletePhaseError } = await supabase
        .from(TABLES.PROJECT_PHASES)
        .delete()
        .eq('project_id', id)
        .not('id', 'in', `(${existingPhaseIds.join(',') || 'null'})`)

      if (deletePhaseError) throw deletePhaseError

      // Update existing phases
      for (const phase of existingPhases) {
        const { error } = await supabase
          .from(TABLES.PROJECT_PHASES)
          .update({
            name: phase.name,
            description: phase.description,
            order_num: phase.order,
            status: phase.status
          })
          .eq('id', phase.id)
        if (error) throw error
      }

      // Insert new phases
      if (newPhases.length > 0) {
        const { error } = await supabase
          .from(TABLES.PROJECT_PHASES)
          .insert(newPhases.map(p => ({
            project_id: id,
            name: p.name,
            description: p.description,
            order_num: p.order,
            status: p.status
          })))
        if (error) throw error
      }

      navigate(`/projects/${id}`)
    } catch (error) {
      console.error('Error updating project:', error)
      setError(error.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="create-project-page">
        <div className="dashboard-loading">
          <div className="loading-spinner-large"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-project-page">
      <div className="page-header">
        <Link to={`/projects/${id}`} className="back-button">
          <ArrowLeft size={20} />
          Back to Project
        </Link>
        <h1>Edit Project</h1>
      </div>

      <div className="create-project-container">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="project-form">
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
                <label htmlFor="progress">Progress (%)</label>
                <input
                  type="number"
                  id="progress"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
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
                        disabled={member.isExisting}
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
                        placeholder="Role"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="btn-icon btn-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
                    <div className="form-group">
                      <select
                        value={phase.status}
                        onChange={(e) => updatePhase(index, 'status', e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  {phases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhase(index)}
                      className="btn-icon btn-danger"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Link to={`/projects/${id}`} className="btn btn-outline">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProject