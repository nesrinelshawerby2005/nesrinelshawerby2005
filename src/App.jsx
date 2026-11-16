
import './App.css'

import Login from './Components/Login/Login'
import Dashboard from './Components/Dashboard/Dashboard'

import { Route, Routes, Navigate } from 'react-router-dom'

function App() {

    return (
        <Routes>

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<Dashboard />} />

        </Routes>
    )
}

export default App
