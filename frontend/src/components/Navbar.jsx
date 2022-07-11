import React from 'react'
import logo from "../images/hmswaplogo.png"

function Navbar() {
    return (
        <div className='Navbar-bg p-4'>
            <img src={logo} alt="" className='Navbar-logo' />
        </div>
    )
}

export default Navbar