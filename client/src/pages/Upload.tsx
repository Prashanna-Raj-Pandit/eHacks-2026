import { useState } from 'react'
import { uploadFiles } from '../services/upload'

interface UploadedFile {
  originalname: string
  filename: string
  size: number
  mimetype: string
}

export default function Upload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [name, setName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setSelectedFile(e.target.files)
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    setLoading(true)
    const res = await uploadFiles(selectedFile)
    setFiles(prev => [...prev, ...res.data.data])
    setName('')
    setPreview(null)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      {/* Upload Form */}
      <div className="max-w-xl mx-auto mb-10">
        <h2 className="text-xl font-semibold mb-6 text-white">Upload File</h2>
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          {/* Name field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter file label"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* File drop area */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">File</label>
            <label className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-indigo-500 transition">
              {preview ? (
                <img src={preview} className="h-32 object-contain rounded-lg" />
              ) : (
                <>
                  <span className="text-3xl mb-2">📁</span>
                  <span className="text-sm text-gray-400">Click to select or drag & drop</span>
                  <span className="text-xs text-gray-600 mt-1">PNG, JPG, JPEG up to 2MB</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-white">Uploaded Files</h2>
          <div className="flex flex-col gap-3">
            {files.map((f, i) => (
              <div key={i} className="bg-gray-900 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{f.originalname}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(f.size / 1024).toFixed(1)} KB · {f.mimetype}</p>
                </div>
                <button
                  onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}