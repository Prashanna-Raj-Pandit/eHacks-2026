import api from './api'

export const getProfile = () => api.get('/api/user/profile')
export const updateProfile = (data: object) => api.put('/api/user/profile', data)
export const uploadLinkedinPdf = (file: File) => {
  const formData = new FormData()
  formData.append('linkedinPdf', file)
  return api.post('/api/user/linkedin', formData)
}
export const autofillFromLinkedin = () => api.post('/api/user/autofill-linkedin')