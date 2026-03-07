import api from './api'

export const getJDs = () => 
  api.get('/api/cv')

export const createJD = (title: string, content: string) =>
  api.post('/api/cv', { title, content })

export const updateJD = (id: number, title: string, content: string) =>
  api.put(`/api/cv/${id}`, { title, content })

export const deleteJD = (id: number) =>
  api.delete(`/api/cv/${id}`)

export const generateCV = (id: number) =>
  api.post(`/api/cv/${id}/generate`)