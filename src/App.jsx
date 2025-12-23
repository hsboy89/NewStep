import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Reader from './pages/Reader'
import Voca from './pages/Voca'
import Layout from './components/Layout'

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<Reader />} />
          <Route path="/voca" element={<Voca />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

