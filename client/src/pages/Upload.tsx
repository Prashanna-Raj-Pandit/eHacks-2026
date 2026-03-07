import { useState } from 'react'
import { uploadFiles, getFiles } from '../services/upload.ts'

export default function Upload() {
  const [files, setFiles] = useState<any[]>([])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const res = await uploadFiles(e.target.files)
    setFiles(prev => [...prev, ...res.data.data])
  }

  return (
    <div>
      <input type="file" multiple accept="image/*" onChange={handleUpload} />
      {files.map((f, i) => (
        <p key={i}>{f.originalname}</p>
      ))}
    </div>
  )
}