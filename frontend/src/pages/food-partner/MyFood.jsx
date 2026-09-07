import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../../styles/orders.css'
import '../../styles/create-food.css'
import BottomNav from '../../components/BottomNav'

const MyFood = () => {
    const [foodItems, setFoodItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        axios.get('https://cravio-btre.onrender.com/api/food-partner/me/foods', { withCredentials: true })
            .then((response) => setFoodItems(response.data.foodItems || []))
            .catch((requestError) => setError(requestError?.response?.data?.message || 'Could not load your food videos.'))
            .finally(() => setLoading(false))
    }, [])

    const deleteFood = async (foodId) => {
        setDeletingId(foodId)
        setError('')
        try {
            await axios.delete(`https://cravio-btre.onrender.com/api/food-partner/me/foods/${foodId}`, { withCredentials: true })
            setFoodItems((previousItems) => previousItems.filter((food) => food._id !== foodId))
        } catch (requestError) {
            const message = requestError?.response?.status === 401
                ? 'Please log in again as a food partner before deleting food.'
                : requestError?.response?.data?.message || 'Could not delete this food item.'
            setError(message)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <>
            <main className="order-page">
                <h1 className="order-page-title">My Food</h1>
                <p className="empty-hint">Your uploaded videos and prices.</p>

                {loading && <p className="empty-hint">Loading your food...</p>}
                {error && <p className="error-text" role="alert">{error}</p>}
                {!loading && !error && foodItems.length === 0 && (
                    <div className="order-card">
                        <p className="empty-hint">You have not added any food videos yet.</p>
                    </div>
                )}

                {foodItems.map((food) => (
                    <article className="order-card" key={food._id}>
                        <video className="line-item-thumb" src={food.video} muted controls playsInline />
                        <div className="line-item-info">
                            <strong className="line-item-name">{food.name}</strong>
                            <span className="line-item-price">₹{food.price}</span>
                            {food.description && <span className="line-item-price">{food.description}</span>}
                            <button
                                type="button"
                                className="btn-ghost danger"
                                disabled={deletingId === food._id}
                                onClick={() => deleteFood(food._id)}
                            >
                                {deletingId === food._id ? 'Deleting...' : 'Delete Food'}
                            </button>
                        </div>
                    </article>
                ))}
            </main>
            <BottomNav />
        </>
    )
}

export default MyFood
