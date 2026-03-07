import api from './api'

export const uploadFiles = (files: FileList) => {
  const formData = new FormData()
  Array.from(files).forEach(file => formData.append('imageFiles', file))
  return api.post('/api/upload', formData)  // axios sets multipart header automatically
}

export const getFiles = () => api.get('/api/upload')