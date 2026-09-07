import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/create-food.css'
import BottomNav from '../../components/BottomNav'

const PartnerHome = () => {
    return (
        <>
            <main className="create-food-page">
                <section className="create-food-card partner-home-card">
                    <header className="create-food-header">
                        <h1 className="create-food-title">Partner Home</h1>
                        <p className="create-food-subtitle">Manage your food videos and customer orders.</p>
                    </header>

                    <div className="partner-home-actions">
                        <Link className="btn-primary" to="/create-food">Create Food</Link>
                        <Link className="btn-ghost" to="/food-partner/my-food">My Food</Link>
                        <Link className="btn-ghost" to="/food-partner/orders">Check Orders</Link>
                    </div>
                </section>
            </main>
            <BottomNav />
        </>
    )
}

export default PartnerHome
