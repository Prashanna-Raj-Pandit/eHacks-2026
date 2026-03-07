import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

export const getMessages = () => api.get('/api/messages')
export const postMessage = (text: string, author: string) =>
  api.post('/api/messages', { text, author })