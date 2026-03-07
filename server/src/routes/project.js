import { Router } from 'express'
import Project from '../models/project.js'

const router = Router()

router.get('/', async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 })
  res.json({ success: true, data: projects })
})

router.post('/', async (req, res) => {
  const { title, description, techStack, liveUrl, githubUrl, source } = req.body
  const project = await Project.create({ title, description, techStack, liveUrl, githubUrl, source })
  res.status(201).json({ success: true, data: project })
})

router.put('/:id', async (req, res) => {
  const { title, description, techStack, liveUrl, githubUrl } = req.body
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { title, description, techStack, liveUrl, githubUrl },
    { new: true }
  )
  res.json({ success: true, data: project })
})

router.delete('/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// POST import from github — fetches repos and creates projects
router.post('/github/:username', async (req, res) => {
  try {
    const { username } = req.params
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`)
    const repos = await reposRes.json()

    if (!Array.isArray(repos)) return res.status(400).json({ success: false, error: 'Invalid GitHub username' })

    const projects = await Promise.all(repos.map(async repo => {
      // fetch readme
      let readme = ''
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
          headers: { Accept: 'application/vnd.github.v3.raw' }
        })
        if (readmeRes.ok) readme = await readmeRes.text()
      } catch { }

      return Project.create({
        title: repo.name,
        description: repo.description || '',
        techStack: repo.topics || [],
        githubUrl: repo.html_url,
        stars: repo.stargazers_count,
        readme: readme.slice(0, 2000), // limit readme size
        source: 'github',
      })
    }))

    res.status(201).json({ success: true, data: projects })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router