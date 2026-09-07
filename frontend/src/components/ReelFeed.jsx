import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const commentsStorageKey = 'foodview-local-comments'

const readStoredComments = () => {
  try {
    const value = JSON.parse(localStorage.getItem(commentsStorageKey) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, commentsCount, comments, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - onAddToCart: (item) => void | Promise<void>
// - emptyMessage: string
const ReelFeed = ({ items = [], onLike, onSave, onAddToCart, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const commentPanelRef = useRef(null)
  const [openCommentId, setOpenCommentId] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [storedComments, setStoredComments] = useState(readStoredComments)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => { /* ignore autoplay errors */ })
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    if (!openCommentId) return undefined

    const closeOnOutsidePress = (event) => {
      if (commentPanelRef.current?.contains(event.target)) return
      if (event.target.closest?.('.reel-comments-toggle')) return
      setOpenCommentId(null)
      setCommentDraft('')
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [openCommentId])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  const getComments = (item) => [
    ...(Array.isArray(item.comments) ? item.comments : []).map((comment) => ({ value: comment, removable: false })),
    ...(storedComments[item._id] || []).map((comment) => ({ value: comment, removable: true })),
  ]

  const toggleComments = (item) => {
    setOpenCommentId((currentId) => currentId === item._id ? null : item._id)
    setCommentDraft('')
  }

  const addComment = (event, item) => {
    event.preventDefault()
    const comment = commentDraft.trim()
    if (!comment) return

    const nextComments = {
      ...storedComments,
      [item._id]: [...(storedComments[item._id] || []), comment],
    }
    setStoredComments(nextComments)
    localStorage.setItem(commentsStorageKey, JSON.stringify(nextComments))
    setCommentDraft('')
    setOpenCommentId(null)
  }

  const removeComment = (item, commentIndex) => {
    const serverCommentCount = Array.isArray(item.comments) ? item.comments.length : 0
    const localCommentIndex = commentIndex - serverCommentCount
    if (localCommentIndex < 0) return

    const nextComments = {
      ...storedComments,
      [item._id]: (storedComments[item._id] || []).filter((_, index) => index !== localCommentIndex),
    }
    setStoredComments(nextComments)
    localStorage.setItem(commentsStorageKey, JSON.stringify(nextComments))
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => (
          <section key={item._id} className="reel" role="listitem">
            <video
              ref={setVideoRef(item._id)}
              className="reel-video"
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
            />

            <div className="reel-overlay">
              <div className="reel-overlay-gradient" aria-hidden="true" />
              <div className="reel-actions">
                <div className="reel-action-group">
                  <button
                    type="button"
                    onClick={onLike ? () => onLike(item) : undefined}
                    className={`reel-action ${item.isLiked ? 'is-active' : ''}`}
                    aria-label="Like"
                    aria-pressed={item.isLiked}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={item.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    type="button"
                    className={`reel-action ${item.isSaved ? 'is-active' : ''}`}
                    onClick={onSave ? () => onSave(item) : undefined}
                    aria-label="Bookmark"
                    aria-pressed={item.isSaved}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={item.isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    type="button"
                    className={`reel-action reel-comments-toggle ${openCommentId === item._id ? 'is-active' : ''}`}
                    aria-label="Comments"
                    aria-expanded={openCommentId === item._id}
                    onClick={() => toggleComments(item)}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{Math.max(item.commentsCount ?? 0, Array.isArray(item.comments) ? item.comments.length : 0) + (storedComments[item._id]?.length || 0)}</div>
                </div>

                {onAddToCart && (
                  <div className="reel-action-group">
                    <button
                      type="button"
                      onClick={(event) => { event.preventDefault(); event.stopPropagation(); onAddToCart(item) }}
                      className={`reel-action ${item.isInCart ? 'is-in-cart' : ''}`}
                      aria-label={item.isInCart ? 'Added to cart' : 'Add to cart'}
                      aria-pressed={item.isInCart}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L22 8H6" />
                      </svg>
                    </button>
                  </div>
                )}

                {item.foodPartner && (
                  <div className="reel-action-group">
                    <Link
                      className="reel-action reel-store-action"
                      to={`/food-partner/${item.foodPartner}`}
                      aria-label="Visit store"
                      title="Visit store"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 10h16v10H4z" />
                        <path d="M3 10 5 4h14l2 6" />
                        <path d="M8 14h3v6H8zM14 14h3v3h-3z" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              <div className="reel-content">
                {typeof item.price === 'number' && (
                  <p className="reel-price">₹{item.price}</p>
                )}
                <p className="reel-description" title={item.description}>{item.description}</p>
              </div>

              {openCommentId === item._id && (
                <div ref={commentPanelRef} className="reel-comment-panel" role="dialog" aria-label="Comments">
                  <div className="reel-comment-list">
                    {getComments(item).length === 0 ? (
                      <p className="reel-comment-empty">Be the first to comment.</p>
                    ) : (
                      getComments(item).map((comment, index) => (
                        <div className="reel-comment" key={`${item._id}-comment-${index}`}>
                          <span>{typeof comment.value === 'string' ? comment.value : comment.value.text || comment.value.comment || comment.value.content}</span>
                          {comment.removable && (
                            <button
                              type="button"
                              className="reel-comment-remove"
                              aria-label="Remove comment"
                              title="Remove comment"
                              onClick={() => removeComment(item, index)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <form className="reel-comment-form" onSubmit={(event) => addComment(event, item)}>
                    <input
                      type="text"
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder="Add a comment..."
                      aria-label="Write a comment"
                      maxLength={240}
                    />
                    <button type="submit" aria-label="Post comment" title="Post comment">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ReelFeed
