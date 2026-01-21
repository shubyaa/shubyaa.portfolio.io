import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ExternalLink, Github } from 'lucide-react'
import './Portfolio.css'

const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  // Add to Portfolio.jsx state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    project_type: '',
    message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactLoading(true)
    setContactStatus({ type: '', message: '' })

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([contactForm])

      if (error) throw error

      setContactStatus({
        type: 'success',
        message: 'Thank you! I\'ll get back to you soon.'
      })
      setContactForm({ name: '', email: '', project_type: '', message: '' })
    } catch (error) {
      setContactStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.'
      })
    } finally {
      setContactLoading(false)
    }
  }

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    loadShowcaseProjects()
  }, [])

  const loadShowcaseProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('showcase_projects')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      // Fallback to empty array or show error message
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-text">SP</span>
          </Link>

          <button
            className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#projects" onClick={() => setIsMenuOpen(false)}>Projects</a></li>
            <li><a href="#about" onClick={() => setIsMenuOpen(false)}>About</a></li>
            <li><a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</a></li>
            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
            <li><Link to="/login" className="nav-login-btn">Login</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <motion.div 
              className="hero-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="hero-title">
                Hi, I'm <span className="text-gradient">Shubham Pednekar</span>
              </h1>
              <p className="hero-subtitle">Software Engineer & Full-Stack Developer</p>
              <p className="hero-description">
                I craft innovative digital solutions with 4+ years of experience in full-stack development,
                mobile applications, and machine learning. Transforming ideas into scalable, user-centered products.
              </p>

              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">20+</span>
                  <span className="stat-label">Projects Delivered</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4+</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                <div className="stat">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Technologies</span>
                </div>
              </div>

              <div className="hero-actions">
                <a href="#projects" className="btn btn-primary">View My Work</a>
                <a href="#contact" className="btn btn-secondary">Get In Touch</a>
              </div>
            </motion.div>

            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="code-snippet">
                <div className="code-header">
                  <div className="code-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span className="file-name">developer.js</span>
                </div>
                <div className="code-content">
                  <div className="line">
                    <span className="keyword">const</span> <span className="variable">developer</span> = {'{'}
                  </div>
                  <div className="line">
                    <span className="property">name</span>: <span className="string">'Shubham Pednekar'</span>,
                  </div>
                  <div className="line">
                    <span className="property">skills</span>: [<span className="string">'React'</span>, <span className="string">'Django'</span>, <span className="string">'Android'</span>],
                  </div>
                  <div className="line">
                    <span className="property">passion</span>: <span className="string">'Building amazing products'</span>
                  </div>
                  <div className="line">{'};'}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-subtitle">Real-world solutions that make an impact</p>
          </div>

          {loading ? (
            <div className="projects-loading">
              <div className="loading-spinner-large"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="projects-empty">
              <p>No projects to display at the moment.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {project.image_url && (
                    <div className="project-image">
                      <img src={project.image_url} alt={project.title} />
                    </div>
                  )}
                  <div className="project-category">{project.category}</div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.tech_stack?.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  {(project.demo_url || project.github_url) && (
                    <div className="project-links">
                      {project.demo_url && (
                        <a 
                          href={project.demo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="project-link"
                        >
                          <ExternalLink size={16} />
                          Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a 
                          href={project.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="project-link"
                        >
                          <Github size={16} />
                          Code
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="projects-cta">
            <a href="https://github.com/shubyaa" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              View All Projects on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About Me</h2>
              <p className="about-description">
                I'm a passionate Software Engineer with 4+ years of experience building scalable web applications,
                mobile apps, and machine learning solutions. My journey spans from Android development to full-stack
                web development, with expertise in modern frameworks and technologies.
              </p>

              <div className="about-highlights">
                <div className="highlight">
                  <h3>🚀 Innovation-Driven</h3>
                  <p>Always exploring cutting-edge technologies to solve complex problems efficiently.</p>
                </div>
                <div className="highlight">
                  <h3>🎯 Results-Focused</h3>
                  <p>Delivered 20+ successful projects with measurable impact on user experience and business goals.</p>
                </div>
                <div className="highlight">
                  <h3>🤝 Collaborative</h3>
                  <p>Strong team player who thrives in cross-functional environments and mentors junior developers.</p>
                </div>
              </div>

              <div className="tech-stack">
                <h3>Technical Expertise</h3>
                <div className="tech-categories">
                  <div className="tech-category">
                    <h4>Frontend</h4>
                    <div className="tech-tags">
                      <span className="tech-tag">React</span>
                      <span className="tech-tag">JavaScript</span>
                      <span className="tech-tag">TypeScript</span>
                      <span className="tech-tag">HTML5</span>
                      <span className="tech-tag">CSS3</span>
                    </div>
                  </div>
                  <div className="tech-category">
                    <h4>Backend</h4>
                    <div className="tech-tags">
                      <span className="tech-tag">Django</span>
                      <span className="tech-tag">Spring Boot</span>
                      <span className="tech-tag">Node.js</span>
                      <span className="tech-tag">Python</span>
                      <span className="tech-tag">Java</span>
                    </div>
                  </div>
                  <div className="tech-category">
                    <h4>Mobile</h4>
                    <div className="tech-tags">
                      <span className="tech-tag">Android</span>
                      <span className="tech-tag">Kotlin</span>
                      <span className="tech-tag">Flutter</span>
                      <span className="tech-tag">React Native</span>
                    </div>
                  </div>
                  <div className="tech-category">
                    <h4>Data & ML</h4>
                    <div className="tech-tags">
                      <span className="tech-tag">Python</span>
                      <span className="tech-tag">scikit-learn</span>
                      <span className="tech-tag">NLP</span>
                      <span className="tech-tag">Data Analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-visual">
              <div className="experience-card">
                <h3>Professional Journey</h3>
                <div className="experience-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Software Engineer II</h4>
                      <p>Ergobite Technologies</p>
                      <span className="timeline-date">2024 - Present</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Software Engineer</h4>
                      <p>Mobigic Technologies</p>
                      <span className="timeline-date">2023 - 2024</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Android Developer</h4>
                      <p>Eventhorizon Pvt Ltd</p>
                      <span className="timeline-date">2021</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Clients Say</h2>
            <p className="section-subtitle">Trusted by teams and clients worldwide</p>
          </div>

          <div className="testimonials-grid">
            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="testimonial-content">
                <p>"Always great working with Shubham. Knows how to solve any problem. Doesn't say no and works hard."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Srikar Ruchira</h4>
                  <p>Product Owner, The Poonch App</p>
                </div>
                <div className="rating">★★★★★</div>
              </div>
            </motion.div>

            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="testimonial-content">
                <p>"Working with Shubham on our web application was a pleasure. He's professional, communicative, and delivers high-quality code on time."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Rajeev Sivarajah</h4>
                  <p>CTO, Intelli-Edge</p>
                </div>
                <div className="rating">★★★★★</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">Let's Work Together</h2>
              <p className="contact-description">
                Ready to bring your project to life? I'm here to help you build amazing digital experiences.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">📧</div>
                  <div className="contact-details">
                    <h3>Email</h3>
                    <a href="mailto:shubhped0712@gmail.com">shubhped0712@gmail.com</a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">💼</div>
                  <div className="contact-details">
                    <h3>LinkedIn</h3>
                    <a href="https://linkedin.com/in/shubham-pednekar-573369213" target="_blank" rel="noopener noreferrer">
                      Connect with me
                    </a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">🐙</div>
                  <div className="contact-details">
                    <h3>GitHub</h3>
                    <a href="https://github.com/shubyaa" target="_blank" rel="noopener noreferrer">
                      View my code
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              {contactStatus.message && (
                <div className={`alert alert-${contactStatus.type}`}>
                  {contactStatus.message}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="project_type">Project Type</label>
                <select
                  id="project_type"
                  name="project_type"
                  value={contactForm.project_type}
                  onChange={handleContactChange}
                >
                  <option value="">Select project type</option>
                  <option value="web-app">Web Application</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="ml-project">Machine Learning</option>
                  <option value="consultation">Technical Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Project Details *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  placeholder="Tell me about your project requirements, timeline, and goals..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={contactLoading}>
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h3>Shubham Pednekar</h3>
              <p>Software Engineer & Full-Stack Developer</p>
            </div>
            <div className="footer-links">
              <a href="https://github.com/shubyaa" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                GitHub
              </a>
              <a href="https://linkedin.com/in/shubham-pednekar-573369213" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                LinkedIn
              </a>
              <a href="mailto:shubhped0712@gmail.com" aria-label="Email">
                Email
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Shubham Pednekar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Portfolio
