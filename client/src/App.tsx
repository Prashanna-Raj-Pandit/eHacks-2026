import { useState, useEffect } from 'react'
import { getMessages, postMessage } from './services/api'

interface Message {
  id: number
  text: string
  author: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')

  useEffect(() => {
    getMessages().then(res => setMessages(res.data.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await postMessage(text, author)
    setMessages(prev => [...prev, res.data.data])
    setText('')
  }

  return (
    <div>
      {messages.map(msg => (
        <p key={msg.id}><b>{msg.author}:</b> {msg.text}</p>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Name" />
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Message" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}