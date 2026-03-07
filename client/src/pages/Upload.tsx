import { useState } from 'react'
import { uploadFiles } from '../services/upload'

interface UploadedFile {
  originalname: string
  filename: string
  size: number
  mimetype: string
  name: string
  type: string
}

const DOC_TYPES = ['Resume', 'Cover Letter', 'Certificate', 'Portfolio', 'Other']

const fileIcon = (mimetype?: string) => {
  if (!mimetype) return '📎'
  if (mimetype === 'application/pdf') return '📄'
  if (mimetype.includes('word')) return '📝'
  if (mimetype.includes('image')) return '🖼️'
  return '📎'
}

export default function Upload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState(DOC_TYPES[0])
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setSelectedFile(e.target.files)
    setSelectedFileName(e.target.files[0].name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    setLoading(true)
    const res = await uploadFiles(selectedFile)
    const uploaded = res.data.data.map((f: any) => ({ ...f, name, type }))
    setFiles(prev => [...prev, ...uploaded])
    setName('')
    setType(DOC_TYPES[0])
    setSelectedFile(null)
    setSelectedFileName(null)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h2 className="text-xl font-semibold">Reference Documents</h2>
          <p className="text-sm text-gray-500 mt-1">Upload documents used as reference for CV generation</p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Add Document</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Document Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. My Resume 2024"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Document Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* File picker */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs text-gray-500">File</label>
            <label className="border-2 border-dashed border-gray-700 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition">
              <span className="text-2xl">📎</span>
              <div>
                {selectedFileName ? (
                  <p className="text-sm text-white">{selectedFileName}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">Click to select a file</p>
                    <p className="text-xs text-gray-600 mt-0.5">PDF, DOC, DOCX, PNG, JPG up to 2MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile || !name}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2 text-sm font-medium transition"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>

        {/* File List */}
        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Uploaded ({files.length})</h3>
            <div className="flex flex-col gap-2">
              {files.map((f, i) => (
                <div key={i} className="bg-gray-900 rounded-xl px-5 py-4 flex items-center gap-4">
                  <span className="text-2xl">{fileIcon(f.mimetype)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{f.name || f.originalname}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.type} · {(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{f.type}</span>
                  <button
                    onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                    className="text-gray-600 hover:text-red-400 text-xs transition ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}