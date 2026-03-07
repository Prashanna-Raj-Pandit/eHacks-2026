import { useState, useEffect } from 'react'
import { getProjects, createProject, updateProject, deleteProject, importFromGithub } from '../../services/project'
import { getProfile } from '../../services/user'
import { useToast } from '../../context/ToastContext'

interface Project {
  _id: string
  title: string
  description: string
  techStack: string[]
  liveUrl: string
  githubUrl: string
  stars: number
  source: string
}

const empty: {
  title: string
  description: string
  techStack: string[]
  liveUrl: string
  githubUrl: string
} = {
  title: '', description: '', techStack: [],
  liveUrl: '', githubUrl: ''
}

export default function ProjectsSection() {
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(empty)
  const [techInput, setTechInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')

  useEffect(() => {
    getProjects().then(res => setProjects(res.data.data))
    getProfile().then(res => setGithubUsername(res.data.data.githubUsername || ''))
  }, [])

  const resetForm = () => { setForm(empty); setTechInput(''); setAdding(false); setEditingId(null) }

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const tech = techInput.trim()
    if (!tech || form.techStack.includes(tech)) return
    setForm(prev => ({ ...prev, techStack: [...prev.techStack, tech] }))
    setTechInput('')
  }

  const handleRemoveTech = (tech: string) => {
    setForm(prev => ({ ...prev, techStack: prev.techStack.filter(t => t !== tech) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await updateProject(editingId, form)
        setProjects(prev => prev.map(p => p._id === editingId ? res.data.data : p))
        showToast('Project updated')
      } else {
        const res = await createProject(form)
        setProjects(prev => [res.data.data, ...prev])
        showToast('Project added')
      }
      resetForm()
    } catch {
      showToast('Failed to save project', 'error')
    }
  }

  const handleEdit = (project: Project) => {
    setEditingId(project._id)
    setForm({ title: project.title, description: project.description, techStack: project.techStack, liveUrl: project.liveUrl, githubUrl: project.githubUrl })
    setAdding(true)
  }

  const handleDelete = async (_id: string) => {
    try {
      await deleteProject(_id)
      setProjects(prev => prev.filter(p => p._id !== _id))
      showToast('Project deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const handleGithubImport = async () => {
    if (!githubUsername) {
      showToast('Add GitHub username in Personal Info first', 'error')
      return
    }
    setImporting(true)
    try {
      const res = await importFromGithub(githubUsername)
      setProjects(prev => [...res.data.data, ...prev])
      showToast(`Imported ${res.data.data.length} projects from GitHub`)
    } catch {
      showToast('Failed to import from GitHub', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-xs text-gray-500 mt-1">Your work and side projects</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGithubImport}
            disabled={importing}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition disabled:opacity-40"
          >
            {importing ? 'Importing...' : '⬇ Import GitHub'}
          </button>
          {!adding && (
            <button onClick={() => setAdding(true)} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {adding && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-gray-500">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-gray-500">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Live URL</label>
              <input
                value={form.liveUrl}
                onChange={e => setForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="https://"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">GitHub URL</label>
              <input
                value={form.githubUrl}
                onChange={e => setForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs text-gray-500">Tech Stack — press Enter to add</label>
              <input
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
                placeholder="e.g. React"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-2">
                {form.techStack.map(tech => (
                  <span key={tech} className="flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                    {tech}
                    <button type="button" onClick={() => handleRemoveTech(tech)} className="text-gray-500 hover:text-red-400 transition">✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm transition">
              {editingId ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={resetForm} className="text-sm text-gray-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {projects.length === 0 && !adding && (
        <p className="text-sm text-gray-600">No projects yet — add manually or import from GitHub</p>
      )}
      <div className="flex flex-col gap-4">
        {projects.map(project => (
          <div key={project._id} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{project.title}</p>
                {project.source === 'github' && (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">GitHub</span>
                )}
                {project.stars > 0 && (
                  <span className="text-xs text-yellow-500">★ {project.stars}</span>
                )}
              </div>
              {project.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description}</p>
              )}
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.techStack.map(tech => (
                    <span key={tech} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{tech}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-2">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">Live ↗</a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white">GitHub ↗</a>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => handleEdit(project)} className="text-xs text-gray-400 hover:text-white transition">Edit</button>
              <button onClick={() => handleDelete(project._id)} className="text-xs text-gray-400 hover:text-red-400 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}