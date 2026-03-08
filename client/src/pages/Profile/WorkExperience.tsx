import { useState, useEffect } from 'react'
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../../services/workExperience'
import { useToast } from '../../context/ToastContext'

interface WorkExperience {
  _id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  source: string
}

const empty = {
  company: '', role: '', startDate: '',
  endDate: '', current: false, description: ''
}

export default function WorkExperienceSection() {
  const { showToast } = useToast()
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(empty)

  useEffect(() => {
    getExperiences().then(res => setExperiences(res.data.data))
  }, [])

  const resetForm = () => { setForm(empty); setAdding(false); setEditingId(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await updateExperience(editingId, form)
        setExperiences(prev => prev.map(e => e._id === editingId ? res.data.data : e))
        showToast('Experience updated')
      } else {
        const res = await createExperience(form)
        setExperiences(prev => [res.data.data, ...prev])
        showToast('Experience added')
      }
      resetForm()
    } catch {
      showToast('Failed to save experience', 'error')
    }
  }

  const handleEdit = (exp: WorkExperience) => {
    setEditingId(exp._id)
    setForm({ company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate, current: exp.current, description: exp.description })
    setAdding(true)
  }

  const handleDelete = async (_id: string) => {
    try {
      await deleteExperience(_id)
      setExperiences(prev => prev.filter(e => e._id !== _id))
      showToast('Experience deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Work Experience</h2>
          <p className="text-xs text-gray-500 mt-1">Your work history</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            + Add
          </button>
        )}
      </div>

      {/* Form */}
      {adding && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Company</label>
              <input
                value={form.company}
                onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Role</label>
              <input
                value={form.role}
                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Start Date</label>
              <input
                type="month"
                value={form.startDate}
                onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">End Date</label>
              <input
                type="month"
                value={form.endDate}
                disabled={form.current}
                onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="current"
                checked={form.current}
                onChange={e => setForm(prev => ({ ...prev, current: e.target.checked, endDate: '' }))}
                className="accent-indigo-500"
              />
              <label htmlFor="current" className="text-xs text-gray-400">I currently work here</label>
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
      {experiences.length === 0 && !adding && (
        <p className="text-sm text-gray-600">No work experience added yet</p>
      )}
      <div className="flex flex-col gap-4">
        {experiences.map(exp => (
          <div key={exp._id} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{exp.role}</p>
                {exp.source === 'linkedin' && (
                  <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full">LinkedIn</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{exp.company}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
              </p>
              {exp.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exp.description}</p>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => handleEdit(exp)} className="text-xs text-gray-400 hover:text-white transition">Edit</button>
              <button onClick={() => handleDelete(exp._id)} className="text-xs text-gray-400 hover:text-red-400 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}