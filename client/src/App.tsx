import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Messages from './pages/Messages'
import Upload from './pages/Upload'

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Messages</Link>
        <Link to="/upload">Upload</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Messages />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  )
}