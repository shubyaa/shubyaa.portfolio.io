# Portfolio & Project Management Platform

A comprehensive portfolio website and project management system built with React, Vite, and Supabase. Features include real-time chat, project tracking, team collaboration, and document management.

## 🚀 Features

### Public Portfolio
- Modern, responsive portfolio website
- Project showcase
- Professional experience timeline
- Client testimonials
- Contact form

### Authentication
- Email/Password authentication
- Google OAuth integration
- Role-based access control (Admin, Freelancer, Client)

### Project Management (Admin)
- Create and manage projects
- Assign team members with roles
- Set project deadlines and phases
- Track project progress
- Manage clients

### Project Collaboration
- Real-time chat with team members
- Project phases/roadmap visualization
- Document upload and management
- Progress tracking
- Status updates

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Custom CSS with CSS Variables
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier works)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
# Navigate to the project directory
cd portfolio-platform

# Install dependencies
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Wait for the project to be set up

#### Set up the Database

1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `database-schema.sql`
3. Paste and run the SQL to create all tables, policies, and functions

#### Enable Google OAuth (Optional but Recommended)

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Google provider
3. Follow the instructions to set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Supabase
   - Copy Client ID and Client Secret to Supabase

#### Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy your:
   - Project URL
   - anon/public key

### 3. Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase credentials.

### 4. Create Admin User

1. Start the development server (see below)
2. Sign up with your email
3. Go to Supabase Dashboard → Authentication → Users
4. Find your user and copy the User ID
5. Go to SQL Editor and run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

Or update by email:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# The app will open at http://localhost:3000
```

### 6. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
portfolio-platform/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (Auth)
│   ├── lib/              # Utility functions and config
│   │   └── supabase.js   # Supabase client
│   ├── pages/            # Page components
│   │   ├── Portfolio.jsx     # Public portfolio
│   │   ├── Login.jsx         # Login page
│   │   ├── Signup.jsx        # Signup page
│   │   ├── Dashboard.jsx     # Projects dashboard
│   │   ├── CreateProject.jsx # Create project form
│   │   └── ProjectDetail.jsx # Project detail view
│   ├── styles/           # CSS files
│   │   └── index.css     # Global styles
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── database-schema.sql    # Supabase database schema
├── .env                   # Environment variables (create this)
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 User Roles

### Admin
- Create and manage all projects
- Assign team members and clients
- Full access to all features
- Manage project phases and documents

### Freelancer/Team Member
- View assigned projects
- Participate in project chat
- Update project phases (if assigned)
- Upload documents

### Client
- View their projects
- Participate in project chat
- View project progress and roadmap
- Access project documents

## 🔑 Key Features Explained

### Real-time Chat
- Uses Supabase Realtime for instant messaging
- Messages are project-specific
- All team members can participate

### Project Phases
- Customizable project milestones
- Track status: Pending, In Progress, Completed
- Visual roadmap timeline

### Document Management
- Upload project-related documents
- Organize by project
- Track upload date and uploader

### Progress Tracking
- 0-100% progress indicator
- Visual progress bars
- Status updates (Planning, In Progress, Review, etc.)

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their assigned projects
- Admins have elevated permissions
- Secure authentication with Supabase Auth

## 🎨 Customization

### Update Portfolio Content

Edit `src/pages/Portfolio.jsx` to update:
- Personal information
- Projects showcase
- Skills and experience
- Contact information

### Styling

- Global styles: `src/styles/index.css`
- CSS variables for theming
- Dark mode support (add theme toggle if needed)
- Responsive design included

### Adding Features

The codebase is modular and easy to extend:
- Add new pages in `src/pages/`
- Create reusable components in `src/components/`
- Extend database schema in Supabase

## 🐛 Troubleshooting

### "Network Error" on API calls
- Check your `.env` file has correct Supabase credentials
- Verify Supabase project is running
- Check browser console for detailed errors

### Can't create projects
- Ensure your user role is set to 'admin' in the database
- Check Supabase RLS policies are enabled

### Real-time chat not working
- Verify Supabase Realtime is enabled in your project
- Check browser console for connection errors
- Ensure project ID is valid

### Google OAuth not working
- Verify OAuth credentials in Google Cloud Console
- Check redirect URLs match in both Google and Supabase
- Clear browser cache and try again

## 📝 Database Schema

The application uses the following main tables:

- **profiles**: User profiles with role-based access
- **projects**: Project information and metadata
- **project_members**: Links users to projects with roles
- **project_phases**: Project milestones and phases
- **messages**: Real-time chat messages
- **documents**: Project documents and files
- **notifications**: User notifications

See `database-schema.sql` for complete schema with policies.

## 🚀 Deployment

### Recommended Platforms

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **GitHub Pages**
   - Build the project
   - Deploy the `dist` folder

### Environment Variables

Remember to set environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase setup
3. Ensure all environment variables are set
4. Check that database migrations ran successfully

## 📄 License

This project is for personal/professional use. Modify as needed for your portfolio and projects.

## 🎉 Getting Started Checklist

- [ ] Install dependencies
- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Set up environment variables
- [ ] Enable Google OAuth (optional)
- [ ] Create admin user
- [ ] Start development server
- [ ] Customize portfolio content
- [ ] Create your first project
- [ ] Deploy to production

---

**Built with ❤️ using React, Vite, and Supabase**
