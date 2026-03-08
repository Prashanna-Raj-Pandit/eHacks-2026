import { useState, useEffect } from 'react'
import { getEducation, createEducation, updateEducation, deleteEducation } from '../../services/education'
import { useToast } from '../../context/ToastContext'

interface Education {
  _id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
  source: string
}

const empty = {
  institution: '', degree: '', field: '',
  startDate: '', endDate: '', current: false
}

export default function EducationSection() {
  const { showToast } = useToast()
  const [education, setEducation] = useState<Education[]>([])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(empty)

  useEffect(() => {
    getEducation().then(res => setEducation(res.data.data))
  }, [])

  const resetForm = () => { setForm(empty); setAdding(false); setEditingId(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await updateEducation(editingId, form)
        setEducation(prev => prev.map(e => e._id === editingId ? res.data.data : e))
        showToast('Education updated')
      } else {
        const res = await createEducation(form)
        setEducation(prev => [res.data.data, ...prev])
        showToast('Education added')
      }
      resetForm()
    } catch {
      showToast('Failed to save education', 'error')
    }
  }

  const handleEdit = (edu: Education) => {
    setEditingId(edu._id)
    setForm({ institution: edu.institution, degree: edu.degree, field: edu.field, startDate: edu.startDate, endDate: edu.endDate, current: edu.current })
    setAdding(true)
  }

  const handleDelete = async (_id: string) => {
    try {
      await deleteEducation(_id)
      setEducation(prev => prev.filter(e => e._id !== _id))
      showToast('Education deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Education</h2>
          <p className="text-xs text-gray-500 mt-1">Your academic background</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            + Add
          </button>
        )}
      </div>

      {/* Form */}
      {adding && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-gray-500">Institution</label>
              <input
                value={form.institution}
                onChange={e => setForm(prev => ({ ...prev, institution: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Degree</label>
              <input
                value={form.degree}
                onChange={e => setForm(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g. Bachelor of Science"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Field of Study</label>
              <input
                value={form.field}
                onChange={e => setForm(prev => ({ ...prev, field: e.target.value }))}
                placeholder="e.g. Computer Science"
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
              <label htmlFor="current" className="text-xs text-gray-400">I currently study here</label>
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
      {education.length === 0 && !adding && (
        <p className="text-sm text-gray-600">No education added yet</p>
      )}
      <div className="flex flex-col gap-4">
        {education.map(edu => (
          <div key={edu._id} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{edu.institution}</p>
                {edu.source === 'linkedin' && (
                  <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full">LinkedIn</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{edu.degree} {edu.field && `· ${edu.field}`}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => handleEdit(edu)} className="text-xs text-gray-400 hover:text-white transition">Edit</button>
              <button onClick={() => handleDelete(edu._id)} className="text-xs text-gray-400 hover:text-red-400 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}