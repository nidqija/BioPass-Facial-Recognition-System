import {useState } from 'react'
import Navbar from '../reusable_components/Navbar'   

function CustomerPage(){
    

    return (
        <div>
            <Navbar />
            <h1>Customer Page</h1>
            <p>Welcome to the Customer Page!</p>
            <a href="/kiosk">go to kiosk</a>
        </div>
    )
}


export default CustomerPage