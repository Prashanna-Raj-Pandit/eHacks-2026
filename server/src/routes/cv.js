import { Router } from 'express'
import JD from '../models/jd.js'
import fs from 'fs'
import path from 'path'
import Document from '../models/document.js'
import User from '../models/user.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const jds = await JD.find().sort({ createdAt: -1 })
    res.json({ success: true, data: jds })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body
    const jd = await JD.create({ title, content })
    res.status(201).json({ success: true, data: jd })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body
    const jd = await JD.findByIdAndUpdate(req.params.id, { title, content }, { new: true })
    res.json({ success: true, data: jd })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await JD.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/:id/generate', async (req, res) => {
  try {
    const jd = await JD.findById(req.params.id)
    if (!jd) return res.status(404).json({ success: false, error: 'JD not found' })

    const user = await User.findOne()
    const documents = await Document.find()

    const formData = new FormData()

    // required fields
    formData.append('job_description', jd.content)
    formData.append('target_role', jd.title)

    // github user if available
    if (user?.githubUsername) {
      formData.append('github_user', user.githubUsername)
    }

    // uploaded pdf files
    for (const doc of documents) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', doc.filename)
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath)
        const blob = new Blob([buffer], { type: doc.mimetype })
        formData.append('files', blob, doc.originalname)
      }
    }

//     linkedin pdf
     if (user?.linkedinPdf) {
       const linkedinPath = path.join(process.cwd(), 'public', 'uploads', user.linkedinPdf)
       if (fs.existsSync(linkedinPath)) {
         const buffer = fs.readFileSync(linkedinPath)
         const blob = new Blob([buffer], { type: 'application/pdf' })
         formData.append('files', blob, user.linkedinPdf)
       }
     }

    console.log(formData)

    const aiRes = await fetch('http://localhost:8000/api/resume-generator', {
      method: 'POST',
      body: formData,
    })

    if (!aiRes.ok) throw new Error('AI service error')
    const data = await aiRes.json()
    const latex = data.data.latex

    // remove empty list environments
const cleanedLatex = latex
  .replace(/\\resumeSubHeadingListStart\s*\\resumeSubHeadingListEnd/g, '')
  .replace(/\\resumeItemListStart\s*\\resumeItemListEnd/g, '')
  // remove section if it has no content after cleanup
  .replace(/\\section\{[^}]+\}\s*\n\s*\n/g, '')

    // ensure dirs exist
    const latexDir = path.join(process.cwd(), 'public', 'latex')
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs')
    if (!fs.existsSync(latexDir)) fs.mkdirSync(latexDir, { recursive: true })
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true })

    // save latex
    const texFilename = `${jd._id}.tex`
    fs.writeFileSync(path.join(latexDir, texFilename), latex)
jd.cv = cleanedLatex

    // compile and save pdf
let pdfSaved = false
const pdfPath = path.join(pdfDir, `${jd._id}.pdf`)

try {
  const fileUrl = `${process.env.PUBLIC_URL}/public/latex/${texFilename}`
  const compileUrl = `https://latexonline.cc/compile?url=${encodeURIComponent(fileUrl)}`
  const compileRes = await fetch(compileUrl)
  if (compileRes.ok) {
    const buffer = await compileRes.arrayBuffer()
    fs.writeFileSync(pdfPath, Buffer.from(buffer))
    pdfSaved = true
  }
} catch {
  // delete stale pdf if exists so frontend falls back to latex
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath)
  console.log('PDF compile failed — latex saved, pdf skipped')
}

    jd.cv = latex
    jd.pdfAvailable = pdfSaved
    await jd.save()

    res.json({ success: true, data: { latex, pdfAvailable: pdfSaved } })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id/pdf', (req, res) => {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'pdfs', `${req.params.id}.pdf`)
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ success: false, error: 'PDF not found' })
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.send(fs.readFileSync(pdfPath))
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/:id/compile', async (req, res) => {
  try {
    const jd = await JD.findById(req.params.id)
    if (!jd || !jd.cv) return res.status(404).json({ success: false, error: 'No LaTeX found' })

    const latexDir = path.join(process.cwd(), 'public', 'latex')
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs')
    if (!fs.existsSync(latexDir)) fs.mkdirSync(latexDir, { recursive: true })
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true })

    const texFilename = `${jd._id}.tex`

// clean empty latex environments before recompiling
const cleanedLatex = jd.cv
  .replace(/\\resumeSubHeadingListStart\s*\\resumeSubHeadingListEnd/g, '')
  .replace(/\\resumeItemListStart\s*\\resumeItemListEnd/g, '')
  .replace(/\\section\{[^}]+\}\s*\n\s*\n/g, '')

fs.writeFileSync(path.join(latexDir, texFilename), cleanedLatex)

// also update db with cleaned version
jd.cv = cleanedLatex
await jd.save()

    const fileUrl = `${process.env.PUBLIC_URL}/public/latex/${texFilename}`
    const compileUrl = `https://latexonline.cc/compile?url=${encodeURIComponent(fileUrl)}`
    const compileRes = await fetch(compileUrl)

    console.log(compileRes)

    if (!compileRes.ok) throw new Error('Compile failed')

    const buffer = await compileRes.arrayBuffer()
    fs.writeFileSync(path.join(pdfDir, `${jd._id}.pdf`), Buffer.from(buffer))

    jd.pdfAvailable = true
    await jd.save()

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router