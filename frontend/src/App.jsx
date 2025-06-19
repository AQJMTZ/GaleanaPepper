import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)

  return (
      <div className = 'h-screen grid place-items-center'>
        <button 
        onClick = {() => navigate('/registro')}
        className= 'bg-stone-800 text-white px-6 py-3 rounded-md'>
          Ir al Formulario de Regitro
        </button>
        </div>
  )
}

export default App
