import React from 'react'

const AuthBrand = () => (
    <div className="auth-brand" aria-label="Cravio">
        <span className="auth-brand-mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M7 5v7M10 5v7M7 9h3M8.5 12v11M18 5v18M18 5c2.4 1.8 3.5 4.2 3.5 7.1H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 3.5c5.8-2.3 12.2-2.3 18 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".45" />
            </svg>
        </span>
        <span className="auth-brand-name">Cravio</span>
        <span className="auth-brand-tagline">See it. Crave it. Get it.</span>
    </div>
)

export default AuthBrand
