import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../../styles/orders.css'
import BottomNav from '../../components/BottomNav'

const MyOrders = () => {
    const [ orders, setOrders ] = useState([])
    const [ loading, setLoading ] = useState(true)

    useEffect(() => {
        axios.get("https://cravio-btre.onrender.com/api/orders/my-orders", { withCredentials: true })
            .then((response) => setOrders(response.data.orders))
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <div className="order-page">
                <h1 className="order-page-title">My Orders</h1>

                {loading && <p className="empty-hint">Loading orders...</p>}

                {!loading && orders.length === 0 && (
                    <div className="order-card">
                        <p className="empty-hint">You haven't placed any orders yet.</p>
                    </div>
                )}

                {orders.map((order) => (
                    <div className="order-summary-card" key={order._id}>
                        <div className="order-summary-header">
                            <span className="order-summary-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                            <span className="order-summary-date">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>

                        {order.foodPartner?.name && (
                            <span className="line-item-price">From {order.foodPartner.name}</span>
                        )}

                        <div className="order-summary-items">
                            {order.items.map((item, idx) => (
                                <span key={idx}>{item.name} × {item.quantity}</span>
                            ))}
                        </div>

                        <div className="order-total-row">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>

                        <div className="order-status-row">
                            <span className={`status-pill pay-${order.paymentStatus}`}>Payment: Cash on Delivery</span>
                            <span className={`status-pill status-${order.orderStatus}`}>Status: {order.orderStatus}</span>
                        </div>
                    </div>
                ))}
            </div>
            <BottomNav />
        </>
    )
}

export default MyOrders
