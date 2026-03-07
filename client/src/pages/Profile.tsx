import { useState } from 'react'

interface Profile {
  name: string
  email: string
  bio: string
}

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    name: 'Sabin Ghimire',
    email: 'sabin@email.com',
    bio: 'Hackathon builder',
  })
  const [form, setForm] = useState<Profile>(profile)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(form)
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-xl mx-auto bg-gray-900 rounded-2xl p-6">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {(['name', 'email', 'bio'] as (keyof Profile)[]).map(field => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 capitalize">{field}</label>
                <input
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm transition">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="text-sm text-gray-400 hover:text-white transition">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            {(['name', 'email', 'bio'] as (keyof Profile)[]).map(field => (
              <div key={field}>
                <p className="text-xs text-gray-500 capitalize mb-1">{field}</p>
                <p className="text-sm text-white">{profile[field]}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}