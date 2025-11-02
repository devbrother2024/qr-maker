import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { MyPage } from '@/pages/MyPage'
import { VerifyEmail } from '@/pages/VerifyEmail'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
