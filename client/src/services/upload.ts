import api from './api'

export const uploadFiles = (files: FileList, name: string, type: string) => {
  const formData = new FormData()
  Array.from(files).forEach(file => formData.append('imageFiles', file))
  formData.append('name', name)
  formData.append('type', type)
  return api.post('/api/upload', formData)
}

export const getDocuments = () => api.get('/api/upload')
export const deleteDocument = (id: string) => api.delete(`/api/upload/${id}`)