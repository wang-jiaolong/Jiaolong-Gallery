// 导入原始图片数据
import { rawImages } from './rawImages.js'

// 重新导出相机品牌枚举（保持向后兼容）
export { CameraBrand } from './cameraBrand.js'

// 图片 host 地址
export const IMAGE_HOST = 'https://res.jiaolong.xyz/gallery/'

// 是否启用缩略图功能
// 如果 Cloudflare 图片优化未启用，可以设置为 false，直接使用原图
// 注意：S3 通过 Cloudflare CDN 访问时，需要确保：
// 1. 域名已添加到 Cloudflare 并启用代理（橙色云朵）
// 2. 在 Speed → Optimization 中启用了 "Image Resizing"
// 如果遇到 404 错误，请将此设置为 false
export const ENABLE_THUMBNAIL = false

// 获取完整图片 URL 的辅助函数
export const getImageUrl = (url) => {
  // 如果 URL 已经是完整地址（以 http:// 或 https:// 开头），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则拼接 host 和路径
  return IMAGE_HOST + url
}

// 获取缩略图 URL 的辅助函数（用于列表展示）
// 使用 Cloudflare 的图片优化功能，生成较小尺寸和质量的缩略图
// 
// S3 + Cloudflare CDN 图片优化说明：
// 1. 确保域名已添加到 Cloudflare 并启用代理（橙色云朵）
// 2. 在 Speed → Optimization 中启用 "Image Resizing"
// 3. 如果优化功能未启用，组件会自动回退到原图
// 4. 如果 ENABLE_THUMBNAIL 为 false，直接返回原图
export const getThumbnailUrl = (url) => {
  // 如果禁用了缩略图功能，直接返回原图
  if (!ENABLE_THUMBNAIL) {
    return getImageUrl(url)
  }
  
  const fullUrl = getImageUrl(url)
  
  if (fullUrl.includes('res.jiaolong.xyz')) {
    try {
      const urlObj = new URL(fullUrl)
      const path = urlObj.pathname
      
      // 尝试多种 Cloudflare 图片优化格式
      // 格式1: /cdn-cgi/image/参数/路径（标准格式）
      // 格式2: 如果格式1不工作，可能需要不同的参数格式
      
      // 方案1: 标准 Cloudflare 图片优化格式
      // 注意：路径前不需要额外的斜杠，因为 pathname 已经包含斜杠
      const optimizedPath = `/cdn-cgi/image/width=512,quality=75,format=auto,fit=cover${path}`
      const thumbnailUrl = `${urlObj.origin}${optimizedPath}`
      
      // 开发环境下输出缩略图 URL，方便调试
      if (process.env.NODE_ENV === 'development') {
        console.log('Thumbnail URL:', thumbnailUrl)
      }
      
      return thumbnailUrl
    } catch (e) {
      // 如果 URL 解析失败，返回原图
      console.warn('Failed to parse image URL for thumbnail:', e)
      return fullUrl
    }
  }
  
  // 如果不是 Cloudflare 域名，返回原图
  return fullUrl
}

// 从url解析日期的辅助函数（url格式：YYYYMMDD或YYYYMMDD_N）
const parseDateFromUrl = (url) => {
  // 提取日期部分（YYYYMMDD），忽略_后面的部分和文件扩展名
  const match = url.match(/^(\d{8})/)
  if (match) {
    const dateStr = match[1]
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${year}年${parseInt(month)}月${parseInt(day)}日`
  }
  return '未知日期'
}

// 从url解析日期并添加到每个图片对象中
export const images = rawImages.map(img => ({
  ...img,
  date: parseDateFromUrl(img.url)
})).sort((a, b) => {
  // 按日期排序（从新到旧）
  const getDateValue = (dateStr) => {
    const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    if (match) {
      return parseInt(match[1] + match[2].padStart(2, '0') + match[3].padStart(2, '0'))
    }
    return 0
  }
  return getDateValue(b.date) - getDateValue(a.date)
})

