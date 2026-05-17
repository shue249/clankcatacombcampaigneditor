import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ListPage from './pages/ListPage'
import CreatorPage from './pages/CreatorPage'
import PlayerPage from './pages/PlayerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/creator" element={<CreatorPage />} />
        <Route path="/creator/:id" element={<CreatorPage />} />
        <Route path="/play/:id" element={<PlayerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
