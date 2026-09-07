import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import ReelFeed from '../../components/ReelFeed'
import { addLocalCartItem, getLocalSavedVideos, isLocalVideo, removeLocalCartItem, toggleLocalSave } from '../../utils/localVideoStore'

const Saved = () => {
    const [ videos, setVideos ] = useState([])

    useEffect(() => {
        axios.get("https://cravio-btre.onrender.com/api/food/save", { withCredentials: true })
            .then(response => {
                const savedFoods = response.data.savedFoods.map((item) => ({
                    _id: item.food._id,
                    name: item.food.name,
                    video: item.food.video,
                    description: item.food.description,
                    price: item.food.price,
                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,
                    foodPartner: item.food.foodPartner,
                }))
                setVideos([...savedFoods, ...getLocalSavedVideos()])
            })
            .catch(() => setVideos(getLocalSavedVideos()))
    }, [])

    const removeSaved = async (item) => {
        if (isLocalVideo(item)) {
            toggleLocalSave(item._id)
            setVideos((prev) => prev.filter((video) => video._id !== item._id))
            return
        }
        try {
            await axios.post("https://cravio-btre.onrender.com/api/food/save", { foodId: item._id }, { withCredentials: true })
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 1) - 1) } : v))
        } catch {
            // noop
        }
    }

    const addToCart = async (item) => {
        addLocalCartItem(item)
        try {
            if (isLocalVideo(item)) {
                return
            }
            await axios.post("https://cravio-btre.onrender.com/api/cart/add", { foodId: item._id, quantity: 1 }, { withCredentials: true })
            removeLocalCartItem(item._id)
        } catch {
            // Keep the local copy when the cart API is unavailable.
        }
    }

    return (
        <ReelFeed
            items={videos}
            onSave={removeSaved}
            onAddToCart={addToCart}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved
