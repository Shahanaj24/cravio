import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom'
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
import { addLocalCartItem, getLocalCart, getLocalVideos, isLocalVideo, isStoredLiked, isStoredSaved, setStoredLiked, setStoredSaved, toggleLocalLike, toggleLocalSave } from '../../utils/localVideoStore'

const Home = () => {
    const [ videos, setVideos ] = useState([])
    const [ toast, setToast ] = useState('')
    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        axios.get("https://cravio-btre.onrender.com/api/food", { withCredentials: true })
            .then(response => {

                console.log(response.data);

                const localCartIds = getLocalCart().map((cartItem) => cartItem.food?._id)
                const foodItems = response.data.foodItems.map((item) => ({
                    ...item,
                    isLiked: isStoredLiked(item._id),
                    isSaved: isStoredSaved(item._id),
                    isInCart: localCartIds.includes(item._id),
                }))
                setVideos(foodItems.length > 0 ? foodItems : getLocalVideos())
            })
            .catch(() => setVideos(getLocalVideos()))
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {
        if (isLocalVideo(item)) {
            const liked = toggleLocalLike(item._id)
            setVideos((prev) => prev.map((video) => video._id === item._id ? { ...video, isLiked: liked, likeCount: liked ? 1 : 0 } : video))
            return
        }

        const liked = !item.isLiked
        try {
            await axios.post("https://cravio-btre.onrender.com/api/food/like", { foodId: item._id }, {withCredentials: true})
        } catch (error) {
            console.log("Like API unavailable; saved like locally", error)
        }
        setStoredLiked(item._id, liked)

        setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, isLiked: liked, likeCount: Math.max(0, (v.likeCount ?? 0) + (liked ? 1 : -1)) } : v))
        
    }

    async function saveVideo(item) {
        if (isLocalVideo(item)) {
            const saved = toggleLocalSave(item._id)
            setVideos((prev) => prev.map((video) => video._id === item._id ? { ...video, isSaved: saved, savesCount: saved ? 1 : 0 } : video))
            return
        }

        const saved = !item.isSaved
        try {
            await axios.post("https://cravio-btre.onrender.com/api/food/save", { foodId: item._id }, { withCredentials: true })
        } catch (error) {
            console.log("Save API unavailable; saved state locally", error)
        }
        setStoredSaved(item._id, saved)
        setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, isSaved: saved, savesCount: Math.max(0, (v.savesCount ?? 0) + (saved ? 1 : -1)) } : v))
    }

    async function addToCart(item) {
        const markAsAdded = () => {
            setVideos((prev) => prev.map((video) => video._id === item._id ? { ...video, isInCart: true } : video))
            setToast(`${item.name || 'Item'} added to cart`);
            setTimeout(() => setToast(''), 1800);
        }

        addLocalCartItem(item)
        try {
            if (isLocalVideo(item)) {
                markAsAdded()
                return
            }
            await axios.post("https://cravio-btre.onrender.com/api/cart/add", { foodId: item._id, quantity: 1 }, { withCredentials: true })
            markAsAdded()
        } catch (err) {
            markAsAdded()
            console.log("Cart API unavailable; saved item locally", err);
        }
    }

    return (
        <>
            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={saveVideo}
                onAddToCart={addToCart}
                emptyMessage="No videos available."
            />
            {toast && (
                <div className="cart-toast" role="status">
                    <span>{toast}</span>
                    <Link className="cart-toast__link" to="/cart">View cart</Link>
                </div>
            )}
        </>
    )
}

export default Home