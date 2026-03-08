import { useState, useEffect, useRef } from 'react'
import { autofillFromLinkedin, getProfile, updateProfile, uploadLinkedinPdf } from '../../services/user'
import { useToast } from '../../context/ToastContext'
import { getFileUrl } from '../../utils/url'

interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  githubUsername: string
  skills: string[]
  linkedinPdf: string | null
}

const FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'githubUsername', label: 'GitHub Username' },
] as const

const empty: Profile = {
  firstName: '', lastName: '', email: '',
  phone: '', bio: '', location: '',
  githubUsername: '', skills: [], linkedinPdf: null
}

// Skeleton that matches the profile grid layout
function ProfileSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-2">
          <div className="h-3 bg-gray-800 rounded w-1/4" />
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="h-3 bg-gray-800 rounded w-1/4" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-800 rounded-full w-16" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for LinkedIn section file row
function LinkedinSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-gray-700 rounded" />
        <div className="flex flex-col gap-1">
          <div className="h-3 bg-gray-700 rounded w-32" />
          <div className="h-2 bg-gray-700 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-3 bg-gray-700 rounded w-8" />
        <div className="h-3 bg-gray-700 rounded w-12" />
      </div>
    </div>
  )
}

export default function PersonalInfo() {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>(empty)
  const [form, setForm] = useState<Profile>(empty)
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [autofilling, setAutofilling] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data.data)
      setForm(res.data.data)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await updateProfile(form)
      setProfile(res.data.data)
      setEditing(false)
      showToast('Profile saved successfully')
    } catch {
      showToast('Failed to save profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const skill = skillInput.trim()
    if (!skill || form.skills.includes(skill)) return
    setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }))
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const handleLinkedinUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setUploading(true)
    try {
      await uploadLinkedinPdf(e.target.files[0])
      showToast('LinkedIn PDF uploaded — extracting data...')
      setUploading(false)
      setAutofilling(true)
      const res = await autofillFromLinkedin()
      const { user, workExperience, education } = res.data.data
      setProfile(user)
      setForm(user)
      showToast(`Profile filled — ${workExperience.length} jobs, ${education.length} education entries`)
    } catch {
      showToast('Failed to process LinkedIn PDF', 'error')
    } finally {
      setUploading(false)
      setAutofilling(false)
    }
  }

  const handleRemoveLinkedin = async () => {
    try {
      await updateProfile({ ...profile, linkedinPdf: null })
      setProfile(prev => ({ ...prev, linkedinPdf: null }))
      setForm(prev => ({ ...prev, linkedinPdf: null }))
      showToast('LinkedIn PDF removed')
    } catch {
      showToast('Failed to remove', 'error')
    }
  }

  const handleAutoFill = async () => {
    setAutofilling(true)
    try {
      const res = await autofillFromLinkedin()
      const { user, workExperience, education } = res.data.data
      setProfile(user)
      setForm(user)
      showToast(`Auto-filled — ${workExperience.length} jobs, ${education.length} education entries`)
    } catch {
      showToast('Auto-fill failed', 'error')
    } finally {
      setAutofilling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* LinkedIn Import */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white">Import from LinkedIn</h3>
            <p className="text-xs text-gray-500 mt-0.5">Upload your LinkedIn PDF to auto-fill profile</p>
          </div>
          {profile.linkedinPdf && !autofilling && (
            <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-md">Uploaded</span>
          )}
          {autofilling && (
            <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-1 rounded-md animate-pulse">Extracting...</span>
          )}
        </div>

        {autofilling ? (
          <LinkedinSkeleton />
        ) : (
          <>
            {profile.linkedinPdf && (
              <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <span>📄</span>
                  <div>
                    <p className="text-sm text-white">{profile.linkedinPdf}</p>
                    <p className="text-xs text-gray-500 mt-0.5">LinkedIn PDF</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={getFileUrl(profile.linkedinPdf)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    View
                  </a>
                  <button
                    onClick={handleRemoveLinkedin}
                    className="text-xs text-gray-500 hover:text-red-400 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg px-4 py-2 transition"
              >
                {uploading ? 'Uploading...' : profile.linkedinPdf ? '↺ Re-upload' : '📎 Upload LinkedIn PDF'}
              </button>
              {profile.linkedinPdf && (
                <button
                  onClick={handleAutoFill}
                  disabled={autofilling}
                  className="border border-indigo-500 hover:bg-indigo-500 disabled:opacity-40 text-indigo-400 hover:text-white text-sm rounded-lg px-4 py-2 transition"
                >
                  ✨ Re-extract
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handleLinkedinUpload}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Profile</h2>
            <p className="text-xs text-gray-500 mt-1">Your details used for CV and portfolio generation</p>
          </div>
          {!editing && !autofilling && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              Edit
            </button>
          )}
        </div>

        {autofilling ? (
          <ProfileSkeleton />
        ) : editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{label}</label>
                  <input
                    value={form[key] as string}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs text-gray-500">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs text-gray-500">Skills — press Enter to add</label>
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="e.g. React"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-400 transition">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm transition"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setForm(profile) }}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm text-white">{(profile[key] as string) || <span className="text-gray-600">—</span>}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Bio</p>
                <p className="text-sm text-white">{profile.bio || <span className="text-gray-600">—</span>}</p>
              </div>
            </div>
            {profile.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span key={skill} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}