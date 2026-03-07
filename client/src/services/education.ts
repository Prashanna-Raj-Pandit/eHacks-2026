import api from './api'

export const getEducation = () => api.get('/api/education')
export const createEducation = (data: object) => api.post('/api/education', data)
export const updateEducation = (id: string, data: object) => api.put(`/api/education/${id}`, data)
export const deleteEducation = (id: string) => api.delete(`/api/education/${id}`)