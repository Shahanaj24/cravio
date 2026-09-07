import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../styles/orders.css'
import '../../styles/create-food.css'

const Checkout = () => {
    const [ cart, setCart ] = useState({ items: [], totalAmount: 0 })
    const [ deliveryAddress, setDeliveryAddress ] = useState('')
    const [ loading, setLoading ] = useState(true)
    const [ placingOrder, setPlacingOrder ] = useState(false)
    const [ error, setError ] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        axios.get("https://cravio-btre.onrender.com/api/cart", { withCredentials: true })
            .then((response) => setCart(response.data.cart))
            .finally(() => setLoading(false))
    }, [])

    const placeOrder = async (e) => {
        e.preventDefault()
        setError('')

        if (!deliveryAddress.trim()) {
            setError('Please enter a delivery address.')
            return
        }

        setPlacingOrder(true)
        try {
            await axios.post("https://cravio-btre.onrender.com/api/orders", { deliveryAddress }, { withCredentials: true })
            navigate('/orders')
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not place order. Please try again.')
        } finally {
            setPlacingOrder(false)
        }
    }

    if (loading) {
        return <div className="order-page"><p className="empty-hint">Loading...</p></div>
    }

    if (cart.items.length === 0) {
        return (
            <div className="order-page">
                <h1 className="order-page-title">Checkout</h1>
                <div className="order-card">
                    <p className="empty-hint">Your cart is empty.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="order-page">
            <h1 className="order-page-title">Checkout</h1>

            <div className="order-card">
                <strong>Order Summary</strong>
                {cart.items.map((item) => (
                    <div className="line-item" key={item.food._id}>
                        <div className="line-item-info">
                            <span className="line-item-name">{item.food.name}</span>
                            <span className="line-item-price">Qty {item.quantity} × ₹{item.price}</span>
                        </div>
                        <span className="line-item-subtotal">₹{item.subtotal}</span>
                    </div>
                ))}

                <hr className="order-divider" />

                <div className="order-total-row">
                    <span>Total Amount</span>
                    <span>₹{cart.totalAmount}</span>
                </div>
            </div>

            <form className="order-card" onSubmit={placeOrder}>
                <div className="order-sub-row">
                    <span>Payment method</span>
                    <strong>Cash on Delivery</strong>
                </div>
                <div className="field-group">
                    <label htmlFor="deliveryAddress">Delivery Address</label>
                    <textarea
                        id="deliveryAddress"
                        rows={3}
                        placeholder="House no., street, city, pincode"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="error-text" role="alert">{error}</p>}

                <button className="btn-primary" type="submit" disabled={placingOrder}>
                    {placingOrder ? 'Placing order...' : 'Place Cash on Delivery Order'}
                </button>
            </form>
        </div>
    )
}

export default Checkout
