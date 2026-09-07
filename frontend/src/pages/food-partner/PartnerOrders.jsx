import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../../styles/orders.css'
import BottomNav from '../../components/BottomNav'

const NEXT_STATUS = {
    PLACED: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'DELIVERED'
}

const CANCELLABLE = [ 'PLACED', 'CONFIRMED', 'PREPARING' ]

const PartnerOrders = () => {
    const [ orders, setOrders ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ updatingId, setUpdatingId ] = useState(null)

    const loadOrders = () => {
        setLoading(true)
        axios.get("https://cravio-btre.onrender.com/api/orders/partner", { withCredentials: true })
            .then((response) => setOrders(response.data.orders))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadOrders()
    }, [])

    const updateStatus = async (orderId, orderStatus) => {
        setUpdatingId(orderId)
        try {
            const response = await axios.patch(
                `https://cravio-btre.onrender.com/api/orders/${orderId}/status`,
                { orderStatus },
                { withCredentials: true }
            )
            setOrders((prev) => prev.map((o) => o._id === orderId ? response.data.order : o))
        } catch (err) {
            console.log('Failed to update order status', err)
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <>
            <div className="order-page">
                <h1 className="order-page-title">Partner Orders</h1>

            {loading && <p className="empty-hint">Loading orders...</p>}

            {!loading && orders.length === 0 && (
                <div className="order-card">
                    <p className="empty-hint">No orders yet.</p>
                </div>
            )}

            {orders.map((order) => {
                const nextStatus = NEXT_STATUS[ order.orderStatus ]
                const canCancel = CANCELLABLE.includes(order.orderStatus)
                const isUpdating = updatingId === order._id

                return (
                    <div className="order-summary-card" key={order._id}>
                        <div className="order-summary-header">
                            <span className="order-summary-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                            <span className="order-summary-date">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>

                        {order.user?.fullName && (
                            <span className="line-item-price">For {order.user.fullName}</span>
                        )}

                        <div className="order-summary-items">
                            {order.items.map((item, idx) => (
                                <span key={idx}>{item.name} × {item.quantity}</span>
                            ))}
                        </div>

                        <div className="line-item-price">Deliver to: {order.deliveryAddress}</div>

                        <div className="order-total-row">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>

                        <div className="order-status-row">
                            <span className={`status-pill pay-${order.paymentStatus}`}>Payment: Cash on Delivery</span>
                            <span className={`status-pill status-${order.orderStatus}`}>Status: {order.orderStatus}</span>
                        </div>

                        {(nextStatus || canCancel) && (
                            <div className="order-status-row">
                                {nextStatus && (
                                    <button
                                        className="btn-primary"
                                        disabled={isUpdating}
                                        onClick={() => updateStatus(order._id, nextStatus)}
                                    >
                                        {order.orderStatus === 'PLACED' ? 'Accept Order' : `Mark as ${nextStatus}`}
                                    </button>
                                )}
                                {canCancel && (
                                    <button
                                        className="btn-ghost danger"
                                        disabled={isUpdating}
                                        onClick={() => updateStatus(order._id, 'CANCELLED')}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
            </div>
            <BottomNav />
        </>
    )
}

export default PartnerOrders
