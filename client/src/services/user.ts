import api from './api'

export const getProfile = () => api.get('/api/user/profile')
export const updateProfile = (data: object) => api.put('/api/user/profile', data)