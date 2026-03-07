import api from './api'

export const getMessages = () => api.get('/api/messages')
export const postMessage = (text: string, author: string) =>
  api.post('/api/messages', { text, author })