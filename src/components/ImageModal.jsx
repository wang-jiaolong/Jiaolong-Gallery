import React, { useEffect, useState } from 'react'
import { getImageUrl } from '../data/images'
import './ImageModal.css'

function ImageModal({ image, onClose, onNext, onPrev }) {
  const [infoVisible, setInfoVisible] = useState(true)

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
          <img 
            src={getImageUrl(image.url)} 
            alt={image.title}
            onClick={(e) => {
              e.stopPropagation()
              setInfoVisible(!infoVisible)
            }}
            style={{ cursor: 'pointer' }}
          />
          <div className={`modal-info ${infoVisible ? 'visible' : 'hidden'}`}>
            <h2 className="modal-title">
              {image.title}
              {image.favorite && <span className="favorite-badge">精选</span>}
            </h2>
            {(image.location || image.date) && (
              <div className="modal-location-date">
                {image.location && (
                  <span className="modal-location">📍 {image.location}</span>
                )}
                {image.location && image.date && (
                  <span className="modal-separator"> • </span>
                )}
                {image.date && (
                  <span className="modal-date">{image.date}</span>
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

