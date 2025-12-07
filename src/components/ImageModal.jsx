import React, { useEffect, useState, useRef } from 'react'
import { getImageUrl, getThumbnailUrl } from '../data/images'
import exifr from 'exifr'
import './ImageModal.css'

function ImageModal({ image, onClose, onNext, onPrev }) {
  const [infoVisible, setInfoVisible] = useState(true)
  const [fullImageLoaded, setFullImageLoaded] = useState(false)
  const [exifData, setExifData] = useState(null)
  const imgRef = useRef(null)

  // 当图片切换时，重置加载状态和EXIF数据
  useEffect(() => {
    setFullImageLoaded(false)
    setExifData(null)
  }, [image.url])

  // 读取EXIF数据
  const loadExifData = async (imageUrl, imgElement) => {
    try {
      let exif = null

      // 方法1: 如果img元素已加载，尝试从img元素读取
      if (imgElement && imgElement.complete) {
        try {
          exif = await exifr.parse(imgElement, {
            pick: [
              'Make',           // 相机品牌
              'Model',          // 相机型号
              'LensModel',      // 镜头型号
              'ISO',            // ISO感光度
              'FNumber',        // 光圈值
              'ExposureTime',   // 快门速度
              'FocalLength',    // 焦距
              'DateTimeOriginal', // 拍摄时间
            ]
          })
          if (exif && Object.keys(exif).length > 0) {
            console.log('EXIF data loaded from img element:', exif)
            setExifData(exif)
            return
          }
        } catch (e) {
          console.log('Failed to read from img element, trying URL...', e)
        }
      }

      // 方法2: 尝试通过fetch获取blob
      try {
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        })
        if (response.ok) {
          const blob = await response.blob()
          exif = await exifr.parse(blob, {
            pick: [
              'Make',
              'Model',
              'LensModel',
              'ISO',
              'FNumber',
              'ExposureTime',
              'FocalLength',
              'DateTimeOriginal',
            ]
          })
          if (exif && Object.keys(exif).length > 0) {
            console.log('EXIF data loaded from blob:', exif)
            setExifData(exif)
            return
          }
        }
      } catch (e) {
        console.log('Failed to fetch blob, trying direct URL...', e)
      }

      // 方法3: 尝试直接从URL读取
      try {
        exif = await exifr.parse(imageUrl, {
          pick: [
            'Make',
            'Model',
            'LensModel',
            'ISO',
            'FNumber',
            'ExposureTime',
            'FocalLength',
            'DateTimeOriginal',
          ]
        })
        if (exif && Object.keys(exif).length > 0) {
          console.log('EXIF data loaded from URL:', exif)
          setExifData(exif)
          return
        }
      } catch (e) {
        console.log('Failed to read from URL:', e)
      }

      // 如果所有方法都失败
      if (!exif || Object.keys(exif).length === 0) {
        console.log('No EXIF data found in image:', imageUrl)
      }
    } catch (error) {
      console.warn('Failed to read EXIF data:', error)
      // EXIF读取失败不影响显示，静默处理
    }
  }

  // 格式化快门速度
  const formatShutterSpeed = (exposureTime) => {
    if (!exposureTime) return null
    if (exposureTime >= 1) {
      return `${exposureTime.toFixed(1)}s`
    }
    return `1/${Math.round(1 / exposureTime)}s`
  }

  // 格式化光圈值
  const formatAperture = (fNumber) => {
    if (!fNumber) return null
    return `f/${fNumber.toFixed(1)}`
  }

  // 格式化焦距
  const formatFocalLength = (focalLength) => {
    if (!focalLength) return null
    return `${Math.round(focalLength)}mm`
  }

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
            ref={imgRef}
            src={getImageUrl(image.url)} 
            alt={image.title}
            className="modal-full-image"
            onLoad={async () => {
              setFullImageLoaded(true)
              // 图片加载完成后读取EXIF数据
              await loadExifData(getImageUrl(image.url), imgRef.current)
            }}
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
            {exifData && (() => {
              // 检查是否有任何EXIF数据显示
              const hasCameraInfo = exifData.Make && exifData.Model
              const hasLensInfo = exifData.LensModel
              const hasParams = formatFocalLength(exifData.FocalLength) || 
                               formatAperture(exifData.FNumber) || 
                               formatShutterSpeed(exifData.ExposureTime) || 
                               exifData.ISO
              
              // 如果有任何信息，才显示EXIF区域
              if (!hasCameraInfo && !hasLensInfo && !hasParams) {
                return null
              }

              return (
                <div className="modal-exif">
                  {hasCameraInfo && (
                    <div className="exif-item">
                      <span className="exif-label">相机：</span>
                      <span className="exif-value">
                        {exifData.Make} {exifData.Model}
                      </span>
                    </div>
                  )}
                  {hasLensInfo && (
                    <div className="exif-item">
                      <span className="exif-label">镜头：</span>
                      <span className="exif-value">{exifData.LensModel}</span>
                    </div>
                  )}
                  {hasParams && (
                    <div className="exif-params">
                      {formatFocalLength(exifData.FocalLength) && (
                        <span className="exif-param">
                          {formatFocalLength(exifData.FocalLength)}
                        </span>
                      )}
                      {formatAperture(exifData.FNumber) && (
                        <span className="exif-param">
                          {formatAperture(exifData.FNumber)}
                        </span>
                      )}
                      {formatShutterSpeed(exifData.ExposureTime) && (
                        <span className="exif-param">
                          {formatShutterSpeed(exifData.ExposureTime)}
                        </span>
                      )}
                      {exifData.ISO && (
                        <span className="exif-param">ISO {exifData.ISO}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageModal

