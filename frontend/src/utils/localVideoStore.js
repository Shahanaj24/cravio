const likedKey = 'foodview-local-liked'
const savedKey = 'foodview-local-saved'
const cartKey = 'foodview-local-cart'

export const localVideos = [
    ['1583289-hd_712_1366_20fps.mp4', 149],
    ['3198245-hd_720_1280_50fps.mp4', 279],
    ['3298011-hd_1080_2048_25fps.mp4', 399],
    ['4058071-hd_1080_2048_25fps.mp4', 529],
    ['5900834-hd_1080_2048_25fps.mp4', 189],
    ['6202680-hd_1080_1920_25fps.mp4', 599],
].map(([fileName, price], index) => ({
    _id: `local-video-${index}`,
    name: 'Featured dish',
    video: `/${fileName}`,
    description: 'Featured dish',
    price,
    isLocal: true,
}))

export const isLocalVideo = (item) => item?.isLocal === true || item?._id?.startsWith('local-video-')

const readIds = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]')
        return Array.isArray(value) ? value : []
    } catch {
        return []
    }
}

const writeIds = (key, ids) => localStorage.setItem(key, JSON.stringify(ids))

const setStoredState = (key, id, active) => {
    const ids = readIds(key).filter((storedId) => storedId !== id)
    writeIds(key, active ? [...ids, id] : ids)
}

export const isStoredLiked = (id) => readIds(likedKey).includes(id)
export const isStoredSaved = (id) => readIds(savedKey).includes(id)
export const setStoredLiked = (id, active) => setStoredState(likedKey, id, active)
export const setStoredSaved = (id, active) => setStoredState(savedKey, id, active)

export const getLocalVideos = () => {
    const likedIds = readIds(likedKey)
    const savedIds = readIds(savedKey)
    const cartIds = getLocalCart().map((item) => item.food?._id)
    return localVideos.map((video) => ({
        ...video,
        isLiked: likedIds.includes(video._id),
        isSaved: savedIds.includes(video._id),
        isInCart: cartIds.includes(video._id),
        likeCount: likedIds.includes(video._id) ? 1 : 0,
        savesCount: savedIds.includes(video._id) ? 1 : 0,
    }))
}

export const toggleLocalLike = (id) => {
    const liked = !isStoredLiked(id)
    setStoredLiked(id, liked)
    return liked
}

export const toggleLocalSave = (id) => {
    const saved = !isStoredSaved(id)
    setStoredSaved(id, saved)
    return saved
}

export const getLocalSavedVideos = () => {
    const savedIds = readIds(savedKey)
    return getLocalVideos().filter((video) => savedIds.includes(video._id))
}

export const getLocalCart = () => {
    try {
        const value = JSON.parse(localStorage.getItem(cartKey) || '[]')
        return Array.isArray(value) ? value : []
    } catch {
        return []
    }
}

export const addLocalCartItem = (video) => {
    const cart = getLocalCart()
    const existing = cart.find((item) => item.food._id === video._id)
    if (existing) {
        existing.quantity += 1
    } else {
        cart.push({ food: { ...video, isLocal: true }, quantity: 1 })
    }
    localStorage.setItem(cartKey, JSON.stringify(cart))
    return cart
}

export const updateLocalCartItem = (id, action) => {
    const cart = getLocalCart()
    const item = cart.find((entry) => entry.food._id === id)
    if (!item) return cart
    item.quantity += action === 'increase' ? 1 : -1
    const nextCart = cart.filter((entry) => entry.quantity > 0)
    localStorage.setItem(cartKey, JSON.stringify(nextCart))
    return nextCart
}

export const removeLocalCartItem = (id) => {
    const nextCart = getLocalCart().filter((entry) => entry.food._id !== id)
    localStorage.setItem(cartKey, JSON.stringify(nextCart))
    return nextCart
}

export const isInLocalCart = (id) => getLocalCart().some((item) => item.food?._id === id)