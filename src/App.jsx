import React, { useState, useCallback, memo, useMemo } from 'react'
import Gallery from './components/Gallery'
import ImageModal from './components/ImageModal'
import { images } from './data/images'
import './App.css'

// 将Header提取为单独的组件，使用memo避免重新渲染
const Header = memo(({ onFeaturedToggle, isFeatured }) => {
  // 计算当前显示的照片数量
  const photoCount = useMemo(() => {
    if (isFeatured) {
      return images.filter(img => img.favorite === true).length
    }
    return images.length
  }, [isFeatured])

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-title">Photography</div>
          <div className="header-name">shot by Jiaolong</div>
        </div>
        <div className="header-right">
          <button 
            className={`header-featured-btn ${isFeatured ? 'active' : ''}`}
            onClick={onFeaturedToggle}
          >
            精选
          </button>
          <div className="header-count">{photoCount} photos</div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

// Footer组件
const Footer = memo(() => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">© 2025 本网站所有照片均为原创作品，未经授权禁止转载</p>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isFeatured, setIsFeatured] = useState(false)

  // 根据 isFeatured 过滤图片
  const filteredImages = useMemo(() => {
    if (isFeatured) {
      return images.filter(img => img.favorite === true)
    }
    return images
  }, [isFeatured])

  // 使用 useCallback 缓存回调函数，避免每次渲染都创建新函数
  const handleImageClick = useCallback((image) => {
    setSelectedImage(image)
  }, [])

  const handleFeaturedToggle = useCallback(() => {
    setIsFeatured(prev => !prev)
    // 切换精选模式时，如果当前选中的图片不在过滤后的列表中，清除选中
    setSelectedImage(null)
  }, [])

  const handleNext = useCallback(() => {
    if (selectedImage) {
      const currentIndex = filteredImages.findIndex(img => img.url === selectedImage.url)
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % filteredImages.length
        setSelectedImage(filteredImages[nextIndex])
      }
    }
  }, [selectedImage, filteredImages])

  const handlePrev = useCallback(() => {
    if (selectedImage) {
      const currentIndex = filteredImages.findIndex(img => img.url === selectedImage.url)
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
        setSelectedImage(filteredImages[prevIndex])
      }
    }
  }, [selectedImage, filteredImages])

  const handleClose = useCallback(() => {
    setSelectedImage(null)
  }, [])

  return (
    <div className="app">
      <Header onFeaturedToggle={handleFeaturedToggle} isFeatured={isFeatured} />
      <div className="app-content">
        <Gallery onImageClick={handleImageClick} isFeatured={isFeatured} />
      </div>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      <Footer />
    </div>
  )
}

export default App

