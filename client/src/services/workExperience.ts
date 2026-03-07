import api from './api'

export const getExperiences = () => api.get('/api/work-experience')
export const createExperience = (data: object) => api.post('/api/work-experience', data)
export const updateExperience = (id: string, data: object) => api.put(`/api/work-experience/${id}`, data)
export const deleteExperience = (id: string) => api.delete(`/api/work-experience/${id}`)