import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/orders.css'
import BottomNav from '../../components/BottomNav'
import { getLocalCart, isInLocalCart, removeLocalCartItem, updateLocalCartItem } from '../../utils/localVideoStore'

const Cart = () => {
    const [ cart, setCart ] = useState({ items: [], totalAmount: 0 })
    const [ loading, setLoading ] = useState(true)
    const navigate = useNavigate()

    const loadCart = () => {
        setLoading(true)
        axios.get("http://localhost:3000/api/cart", { withCredentials: true })
            .then((response) => {
                const apiCart = response.data.cart
                const localItems = getLocalCart().map((item) => ({
                    ...item,
                    price: item.food.price,
                    subtotal: item.food.price * item.quantity,
                }))
                const apiItemIds = new Set(apiCart.items.map((item) => item.food._id))
                const items = [...apiCart.items, ...localItems.filter((item) => !apiItemIds.has(item.food._id))]
                setCart({ items, totalAmount: items.reduce((total, item) => total + item.subtotal, 0) })
            })
            .catch(() => {
                const items = getLocalCart().map((item) => ({
                    ...item,
                    price: item.food.price,
                    subtotal: item.food.price * item.quantity,
                }))
                setCart({ items, totalAmount: items.reduce((total, item) => total + item.subtotal, 0) })
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadCart()
    }, [])

    const updateQuantity = async (foodId, action) => {
        if (isInLocalCart(foodId)) {
            const items = updateLocalCartItem(foodId, action).map((item) => ({
                ...item,
                price: item.food.price,
                subtotal: item.food.price * item.quantity,
            }))
            setCart({ items, totalAmount: items.reduce((total, item) => total + item.subtotal, 0) })
            return
        }
        const response = await axios.patch(`http://localhost:3000/api/cart/${foodId}`, { action }, { withCredentials: true })
        setCart(response.data.cart)
    }

    const removeItem = async (foodId) => {
        if (isInLocalCart(foodId)) {
            const items = removeLocalCartItem(foodId).map((item) => ({
                ...item,
                price: item.food.price,
                subtotal: item.food.price * item.quantity,
            }))
            setCart({ items, totalAmount: items.reduce((total, item) => total + item.subtotal, 0) })
            return
        }
        const response = await axios.delete(`http://localhost:3000/api/cart/${foodId}`, { withCredentials: true })
        setCart(response.data.cart)
    }

    if (loading) {
        return <div className="order-page"><p className="empty-hint">Loading cart...</p></div>
    }

    return (
        <>
            <div className="order-page">
                <h1 className="order-page-title">Your Cart</h1>

                {cart.items.length === 0 ? (
                    <div className="order-card">
                        <p className="empty-hint">Your cart is empty. Go add something tasty!</p>
                    </div>
                ) : (
                    <>
                        <div className="order-card">
                            {cart.items.map((item) => (
                                <div className="line-item" key={item.food._id}>
                                    <video className="line-item-thumb" src={item.food.video} muted />
                                    <div className="line-item-info">
                                        <span className="line-item-name">{item.food.name}</span>
                                        <span className="line-item-price">₹{item.price} each</span>
                                        <div className="qty-control">
                                            <button className="qty-btn" onClick={() => updateQuantity(item.food._id, 'decrease')} aria-label="Decrease quantity">−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item.food._id, 'increase')} aria-label="Increase quantity">+</button>
                                        </div>
                                        <button className="remove-link" onClick={() => removeItem(item.food._id)}>Remove</button>
                                    </div>
                                    <span className="line-item-subtotal">₹{item.subtotal}</span>
                                </div>
                            ))}

                            <hr className="order-divider" />

                            <div className="order-total-row">
                                <span>Total</span>
                                <span>₹{cart.totalAmount}</span>
                            </div>

                            <button className="btn-primary" onClick={() => navigate('/checkout')}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}

                <Link to="/home" className="btn-ghost" style={{ textAlign: 'center' }}>Continue browsing</Link>
            </div>
            <BottomNav />
        </>
    )
}

export default Cart
