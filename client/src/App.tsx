import CustomerPage from './app/customer/page'
import KioskPage from './app/kiosk/page'
import HomePage from './app/home/page'
import KioskCollector from './app/kiosk/kiosk-collector'
import DashboardPage from './app/admin/page'
import { AuthPage } from './app/admin_auth/page'
import ManageEventsPage from './app/manage_events/page'

import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'



function App() {

  return (
    <>
     <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/customer/:concertId" element={<CustomerPage />}  />
          <Route path="/kiosk/:terminalId" element={<KioskPage />} />
          <Route path="/kiosk-collector" element={<KioskCollector />} />
          <Route path='admin/dashboard' element={<DashboardPage/>}/>
          <Route path='admin/auth-page' element={<AuthPage/>}/>
          <Route path='admin/manage-events' element={<ManageEventsPage/>}/>
          <Route path='*' element={<h1>404 Not Found</h1>}/>
        </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
