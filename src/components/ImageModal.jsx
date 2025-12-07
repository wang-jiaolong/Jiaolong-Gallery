import React, { useEffect, useState } from 'react'
import { getImageUrl, getThumbnailUrl } from '../data/images'
import './ImageModal.css'

function ImageModal({ image, onClose, onNext, onPrev }) {
  const [infoVisible, setInfoVisible] = useState(true)
  const [fullImageLoaded, setFullImageLoaded] = useState(false)

  // 当图片切换时，重置加载状态
  useEffect(() => {
    setFullImageLoaded(false)
  }, [image.url])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onPrev()
      } else if (e.key === 'ArrowRight') {
        onNext()
      } else if (e.key === ' ') {
        e.preventDefault() // 防止空格键滚动页面
        setInfoVisible(!infoVisible)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onNext, onPrev, infoVisible])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${!infoVisible ? 'immersive' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-image-wrapper">
          <button className={`modal-close ${!infoVisible ? 'hidden' : ''}`} onClick={onClose}>
            ×
          </button>
          <button 
            className={`modal-nav modal-nav-prev ${!infoVisible ? 'hidden' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            title="上一张 (←)"
            aria-label="上一张"
          />
          <button 
            className={`modal-nav modal-nav-next ${!infoVisible ? 'hidden' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            title="下一张 (→)"
            aria-label="下一张"
          />
          {/* 缩略图（作为占位符，快速显示） */}
          <img 
            src={getThumbnailUrl(image.url)} 
            alt={image.title}
            className="modal-thumbnail"
            style={{ 
              opacity: fullImageLoaded ? 0 : 1,
              transition: 'opacity 0.3s ease',
              filter: fullImageLoaded ? 'blur(0)' : 'blur(4px)',
            }}
          />
          {/* 原图（点击后加载） */}
          <img 
            src={getImageUrl(image.url)} 
            alt={image.title}
            className="modal-full-image"
            onLoad={() => setFullImageLoaded(true)}
            onClick={(e) => {
              e.stopPropagation()
              setInfoVisible(!infoVisible)
            }}
            style={{ 
              cursor: 'pointer',
              opacity: fullImageLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />
          <div className={`modal-info ${infoVisible ? 'visible' : 'hidden'}`}>
            <h2 className="modal-title">
              {image.title}
              {image.favorite && <span className="favorite-badge">精选</span>}
            </h2>
            {(image.location || image.date || image.camera) && (
              <div className="modal-location-date">
                {image.location && (
                  <span className="modal-location">
                    <svg className="location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {image.location}
                  </span>
                )}
                {image.location && (image.date || image.camera) && (
                  <span className="modal-separator">|</span>
                )}
                {image.date && (
                  <span className="modal-date">
                    <svg className="date-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {image.date}
                  </span>
                )}
                {image.date && image.camera && (
                  <span className="modal-separator">|</span>
                )}
                {image.camera && (
                  <span className="modal-camera">
                    <svg className="camera-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {image.camera}
                  </span>
                )}
              </div>
            )}
            {image.description && (
              <p className="modal-description">{image.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageModal

