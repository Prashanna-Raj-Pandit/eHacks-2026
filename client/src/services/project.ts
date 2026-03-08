import api from './api'

export const getProjects = () => api.get('/api/projects')
export const createProject = (data: object) => api.post('/api/projects', data)
export const updateProject = (id: string, data: object) => api.put(`/api/projects/${id}`, data)
export const deleteProject = (id: string) => api.delete(`/api/projects/${id}`)
export const importFromGithub = (username: string) => api.post(`/api/projects/github/${username}`)