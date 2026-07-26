import CustomerPage from './app/customer/page'
import KioskPage from './app/kiosk/page'
import HomePage from './app/home/page'

import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'


function App() {

  return (
    <>
     <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/customer" element={<CustomerPage />}  />
          <Route path="/kiosk" element={<KioskPage />} />
        </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
