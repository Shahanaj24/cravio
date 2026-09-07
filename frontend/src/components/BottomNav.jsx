import React, { useState } from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'
import '../styles/bottom-nav.css'

const BottomNav = () => {
  const [role] = useState(() => localStorage.getItem('foodview-role') || '')
  const isPartner = role === 'food-partner'
  const accountLabel = isPartner ? 'Partner' : role === 'user' ? 'User' : 'Login'
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (!role) {
      navigate('/user/login')
      return
    }

    const endpoint = isPartner ? '/api/auth/food-partner/logout' : '/api/auth/user/logout'
    try {
      await axios.get(`http://localhost:3000${endpoint}`, { withCredentials: true })
    } finally {
      localStorage.removeItem('foodview-role')
      navigate('/user/login')
    }
  }

  return (
    <nav className={`bottom-nav ${isPartner ? 'bottom-nav--partner' : ''}`} role="navigation" aria-label="Bottom">
      <div className="bottom-nav__inner">
        <NavLink to={isPartner ? '/partner-home' : '/home'} end className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {/* home icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5"/>
              <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
            </svg>
          </span>
          <span className="bottom-nav__label">Home</span>
        </NavLink>

        {!isPartner && <NavLink to="/saved" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {/* bookmark icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
            </svg>
          </span>
          <span className="bottom-nav__label">Saved</span>
        </NavLink>}

        {!isPartner && <NavLink to="/cart" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {/* cart icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L22 8H6" />
            </svg>
          </span>
          <span className="bottom-nav__label">Cart</span>
        </NavLink>}

        <NavLink to={isPartner ? '/food-partner/orders' : '/orders'} className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {/* orders/receipt icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" />
              <path d="M9 8h6M9 12h6" />
            </svg>
          </span>
          <span className="bottom-nav__label">Orders</span>
        </NavLink>

        <button type="button" onClick={handleLogout} className="bottom-nav__item" aria-label={`Log out ${accountLabel}`} title={`Log out ${accountLabel}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isPartner ? (
                <>
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-5h6v5" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </>
              )}
            </svg>
          </span>
          <span className="bottom-nav__label">{accountLabel}</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
