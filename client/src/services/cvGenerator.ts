import api from './api'

export const getJDs = () => api.get('/api/cv')
export const createJD = (title: string, content: string) =>
  api.post('/api/cv', { title, content })
export const updateJD = (id: string, title: string, content: string) =>
  api.put(`/api/cv/${id}`, { title, content })
export const deleteJD = (id: string) =>
  api.delete(`/api/cv/${id}`)
export const generateCV = (id: string) =>
  api.post(`/api/cv/${id}/generate`)
export const compileCV = (id: string) => api.post(`/api/cv/${id}/compile`)