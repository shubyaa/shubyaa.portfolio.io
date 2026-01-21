import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES } from '../lib/supabase'
import { 
  ArrowLeft, Users, MessageSquare, FileText, MapPin, 
  Calendar, Send, Paperclip, Download, CheckCircle2, Edit
} from 'lucide-react'
import './ProjectDetail.css'

const ProjectDetail = () => {
  const { id } = useParams()
  const { user, profile, isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [phases, setPhases] = useState([])
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadProjectData()
    
    // Subscribe to real-time messages
    const messageSubscription = supabase
      .channel(`messages-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.MESSAGES,
        filter: `project_id=eq.${id}`
      }, (payload) => {
        loadMessages()
      })
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadProjectData = async () => {
    try {
      await Promise.all([
        loadProject(),
        loadMembers(),
        loadPhases(),
        loadMessages(),
        loadDocuments()
      ])
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProject = async () => {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    setProject(data)
  }

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from(TABLES.PROJECT_MEMBERS)
      .select(`
        *,
        profiles(id, full_name, email, role, avatar_url)
      `)
      .eq('project_id', id)

    if (error) throw error
    setMembers(data || [])
  }

  const loadPhases = async () => {
    const { data, error } = await supabase
      .from(TABLES.PROJECT_PHASES)
      .select('*')
      .eq('project_id', id)
      .order('order_num', { ascending: true })

    if (error) throw error
    setPhases(data || [])
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from(TABLES.MESSAGES)
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error
    setMessages(data || [])
  }

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from(TABLES.DOCUMENTS)
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error
    setDocuments(data || [])
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const { error } = await supabase
        .from(TABLES.MESSAGES)
        .insert([{
          project_id: id,
          user_id: user.id,
          message: newMessage,
          created_at: new Date().toISOString()
        }])

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const updatePhaseStatus = async (phaseId, newStatus) => {
    try {
      const { error } = await supabase
        .from(TABLES.PROJECT_PHASES)
        .update({ status: newStatus })
        .eq('id', phaseId)

      if (error) throw error
      loadPhases()
    } catch (error) {
      console.error('Error updating phase:', error)
    }
  }

  const getPhaseStatusColor = (status) => {
    const colors = {
      pending: 'phase-pending',
      in_progress: 'phase-progress',
      completed: 'phase-completed'
    }
    return colors[status] || 'phase-pending'
  }

  if (loading) {
    return (
      <div className="project-loading">
        <div className="loading-spinner-large"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-error">
        <h2>Project not found</h2>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="project-detail">
      <div className="project-header">
        <Link to="/dashboard" className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="project-title-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1>{project.name}</h1>
              <p className="project-description">{project.description}</p>
            </div>
            {isAdmin() && (
              <Link to={`/projects/${id}/edit`} className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                <Edit size={18} />
                Edit Project
              </Link>
            )}
          </div>
        </div>

        <div className="project-meta-bar">
          <div className="meta-item">
            <Calendar size={18} />
            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <Users size={18} />
            <span>{members.length} members</span>
          </div>
          <div className="progress-indicator">
            <span>{project.progress}%</span>
            <div className="progress-bar-small">
              <div 
                className="progress-fill-small"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="project-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={18} />
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={18} />
          Chat
        </button>
        <button
          className={`tab-button ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          <MapPin size={18} />
          Roadmap
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <Paperclip size={18} />
          Documents
        </button>
      </div>

      <div className="project-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Team Members</h3>
                <div className="members-list">
                  {members.map((member) => (
                    <div key={member.id} className="member-item">
                      <div className="member-avatar">
                        {member.profiles.full_name[0]}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.profiles.full_name}</div>
                        <div className="member-role">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card">
                <h3>Project Phases</h3>
                <div className="phases-summary">
                  {phases.map((phase) => (
                    <div key={phase.id} className="phase-summary-item">
                      <div className="phase-info">
                        <span className="phase-name">{phase.name}</span>
                        <span className={`phase-badge ${getPhaseStatusColor(phase.status)}`}>
                          {phase.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.user_id === user.id ? 'message-own' : 'message-other'}`}
                >
                  <div className="message-avatar">
                    {msg.profiles.full_name[0]}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">{msg.profiles.full_name}</span>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-text">{msg.message}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit" className="btn-send">
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="roadmap-tab">
            <div className="roadmap-timeline">
              {phases.map((phase, index) => (
                <div key={phase.id} className="timeline-phase">
                  <div className="timeline-marker">
                    <div className={`marker-dot ${getPhaseStatusColor(phase.status)}`}>
                      {phase.status === 'completed' && <CheckCircle2 size={16} />}
                    </div>
                    {index < phases.length - 1 && <div className="marker-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="phase-header">
                      <h3>Phase {phase.order_num}: {phase.name}</h3>
                      {isAdmin() && (
                        <select
                          value={phase.status}
                          onChange={(e) => updatePhaseStatus(phase.id, e.target.value)}
                          className="phase-status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                    <p>{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="documents-header">
              <h3>Project Documents</h3>
              <button className="btn btn-primary btn-sm">
                <Paperclip size={18} />
                Upload Document
              </button>
            </div>
            
            <div className="documents-list">
              {documents.length === 0 ? (
                <div className="empty-docs">
                  <FileText size={48} />
                  <p>No documents yet</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <FileText size={24} />
                    <div className="document-info">
                      <h4>{doc.name}</h4>
                      <p>{doc.description}</p>
                      <span className="document-date">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn-icon">
                      <Download size={18} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail