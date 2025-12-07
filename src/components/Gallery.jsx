import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react'
import { images, getImageUrl, getThumbnailUrl } from '../data/images'
import './Gallery.css'

const GalleryItemComponent = ({ image, index, onImageClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [useOriginal, setUseOriginal] = useState(false) // 如果缩略图加载失败，使用原图
  // 预加载前18张图片（约6行，每行3张）
  const [shouldLoad, setShouldLoad] = useState(index < 18)
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const observerRef = useRef(null)

  // 使用 useMemo 缓存样式对象，避免每次渲染都创建新对象
  const placeholderStyle = useMemo(() => ({
    opacity: imageLoaded ? 0 : 1
  }), [imageLoaded])

  const imageStyle = useMemo(() => ({
    opacity: imageLoaded ? 1 : 0,
    display: 'block',
    visibility: 'visible'
  }), [imageLoaded])

  useEffect(() => {
    // 使用 Intersection Observer 来智能加载图片
    if (!shouldLoad && containerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true)
              if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
              }
            }
          })
        },
        {
          rootMargin: '500px', // 提前500px开始加载，减少滚动时的黑屏
          threshold: 0.01
        }
      )

      observerRef.current.observe(containerRef.current)

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
          observerRef.current = null
        }
      }
    }
  }, [shouldLoad])

  useEffect(() => {
    // 一旦图片加载完成，确保它不会被浏览器回收
    if (imageLoaded && imgRef.current) {
      imgRef.current.style.display = 'block'
      imgRef.current.style.visibility = 'visible'
    }
  }, [imageLoaded])

  const handleLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    // 如果缩略图加载失败，尝试使用原图
    if (!useOriginal) {
      setUseOriginal(true)
      setImageError(false) // 重置错误状态，准备加载原图
    } else {
      setImageError(true) // 原图也加载失败
    }
  }, [useOriginal])

  const handleClick = useCallback(() => {
    onImageClick(image)
  }, [image, onImageClick])

  return (
    <div
      ref={containerRef}
      className="gallery-item"
      onClick={handleClick}
    >
      <div className="image-wrapper">
        {!imageLoaded && (
          <div className="image-placeholder" style={placeholderStyle}>
            <div className="image-skeleton"></div>
          </div>
        )}
        {shouldLoad && (
          <img
            ref={imgRef}
            src={useOriginal ? getImageUrl(image.url) : getThumbnailUrl(image.url)}
            alt={image.title}
            loading={index < 18 ? "eager" : "lazy"}
            onLoad={handleLoad}
            onError={handleError}
            style={imageStyle}
          />
        )}
        {image.favorite && (
          <div className="image-favorite-star">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div className="image-overlay">
          <h3 className="image-title">{image.title}</h3>
          {image.location && (
            <p className="image-location">{image.location}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// 使用 memo 包装组件，自定义比较函数避免不必要的重新渲染
const GalleryItem = memo(GalleryItemComponent, (prevProps, nextProps) => {
  // 只有当关键属性改变时才重新渲染
  return (
    prevProps.image.url === nextProps.image.url &&
    prevProps.index === nextProps.index &&
    prevProps.onImageClick === nextProps.onImageClick
  )
})

GalleryItem.displayName = 'GalleryItem'

const Gallery = memo(({ onImageClick, isFeatured }) => {
  const [columnCount, setColumnCount] = useState(3)

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth
      if (width < 768) {
        setColumnCount(1) // 移动端单列显示
      } else if (width < 1024) {
        setColumnCount(2)
      } else {
        setColumnCount(3)
      }
    }

    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)
    return () => window.removeEventListener('resize', updateColumnCount)
  }, [])

  // 根据 isFeatured 过滤图片
  const filteredImages = useMemo(() => {
    if (isFeatured) {
      return images.filter(img => img.favorite === true)
    }
    return images
  }, [isFeatured])

  // 使用 useMemo 缓存样式对象
  const gridStyle = useMemo(() => ({
    '--column-count': columnCount
  }), [columnCount])

  // 使用 useCallback 缓存回调函数
  const handleImageClick = useCallback((image) => {
    onImageClick(image)
  }, [onImageClick])

  return (
    <div className="gallery-container">
      <div 
        className="gallery-grid"
        style={gridStyle}
      >
        {filteredImages.map((image, index) => (
          <GalleryItem
            key={image.url} // 使用 image.url 作为 key，更稳定
            image={image}
            index={index}
            onImageClick={handleImageClick}
          />
        ))}
      </div>
    </div>
  )
})

Gallery.displayName = 'Gallery'

export default Gallery
