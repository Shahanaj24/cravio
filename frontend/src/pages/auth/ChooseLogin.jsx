import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/auth-shared.css'
import AuthBrand from '../../components/AuthBrand'

const ChooseLogin = () => {
    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="choose-login-title">
                <header>
                    <AuthBrand />
                    <h1 id="choose-login-title" className="auth-title">Welcome to Cravio</h1>
                    <p className="auth-subtitle">Choose how you want to continue.</p>
                </header>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Link to="/user/login" className="auth-submit" style={{ textDecoration: 'none' }}>
                        User Login
                    </Link>
                    <Link to="/food-partner/login" className="auth-submit" style={{ textDecoration: 'none', background: 'var(--color-surface-alt)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                        Food Partner Login
                    </Link>
                </div>
                <div className="auth-alt-action" style={{ marginTop: '4px' }}>
                    New account? <Link to="/register">Choose registration type</Link>
                </div>
            </div>
        </div>
    )
}

export default ChooseLogin
