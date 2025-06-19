import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import './styles/main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<App/>}/>
        <Route path = "/registro" element={<HomePage/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
