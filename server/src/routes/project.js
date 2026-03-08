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

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`)
    if (!reposRes.ok) throw new Error('GitHub API error')
    const repos = await reposRes.json()

    const projects = await Promise.all(repos.map(async (repo) => {
      let readme = ''
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
          headers: { Accept: 'application/vnd.github.v3.raw' }
        })
        if (readmeRes.ok) readme = await readmeRes.text()
      } catch { /* no readme */ }

      // upsert by githubUrl — no duplicates on re-import
      return Project.findOneAndUpdate(
        { githubUrl: repo.html_url },
        {
          title: repo.name,
          description: repo.description || '',
          techStack: repo.language ? [repo.language] : [],
          liveUrl: repo.homepage || '',
          githubUrl: repo.html_url,
          stars: repo.stargazers_count,
          readme,
          source: 'github',
        },
        { upsert: true, new: true }
      )
    }))

    res.json({ success: true, data: projects })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router