// 示例图片数据
// 你可以将这里的 URL 替换为你自己的图片链接
// 或者将图片放在 public 文件夹中，使用相对路径

// 图片 host 地址
export const IMAGE_HOST = 'https://res.jiaolong.xyz/gallery/'

// 获取完整图片 URL 的辅助函数
export const getImageUrl = (url) => {
  // 如果 URL 已经是完整地址（以 http:// 或 https:// 开头），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则拼接 host 和路径
  return IMAGE_HOST + url
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

const rawImages = [
  {
    title: '睡在山顶的小橘猫',
    url: '20230523.jpeg',
    location: '焦作-云台山',
    favorite: true,
    description: '小猫能有什么烦恼呢？',
  },
  {
    url: '2024042_7.jpeg',
  },
  {
    url: '20240420_2.jpeg',
    location: '北京-798艺术区',
  },
  {
    url: '20240420_4.jpeg',
    title: '贩卖快乐',
    location: '北京-798艺术区',
  },
  {
    url: '20240420_6.jpeg',
    location: '北京-798艺术区',
  },
  {
    url: '20240501.jpeg',
    title: '偶遇的青橙时刻',
    location: '北京',
  },
  {
    url: '20240603.jpeg',
    title: '大理洱海',
    location: '云南·大理',
  },
  {
    url: '20240605.jpeg',
    title: '丽江古城',
    location: '云南·丽江',
  },
  {
    url: '20240724.jpeg',
    title: '小熊猫',
    location: '北京·野生动物园',
  },
  {
    url: '20241024_1.jpeg',
    title: '外白渡桥',
    location: '上海',
  },
  {
    url: '20241024_2.jpeg',
  },
  {
    url: '20241024_3.jpeg',
  },
  {
    url: '20241024_4.jpeg',
    title: '外滩夜景',
    location: '上海·外滩',
    favorite: true,
  },
  {
    url: '20241025_1.jpeg',
    title: '太湖夜景',
    location: '苏州·太湖',
  },
  {
    title: '打铁花',
    url: '20241025_2.jpeg',
    location: '苏州·太湖',
    favorite: true,
  },
  {
    title: '烟花',
    url: '20241025_3.jpeg',
    location: '苏州·太湖',
  },
  {
    url: '20241103_1.jpeg',
    location: '北京·金海湖',
  },
  {
    url: '20241103_2.jpeg',
    location: '北京·金海湖',
  },
  {
    url: '20241123.jpeg',
    location: '北京·故宫',
  },
  {
    url: '20250301_1.jpeg',
    location: '北京·朗园 Station',
  },
  {
    url: '20250301_2.jpeg',
    location: '北京·朗园 Station',
  },
  {
    url: '20250301.jpeg',
    location: '北京·朗园 Station',
  },
  {
    url: '20250301.JPG',
    title: '咖啡续命',
    location: '北京·朗园 Station',
  },
  {
    url: '20250405_1.jpeg',
    title: '海棠花溪',
    location: '北京·望京南',
  },
  {
    url: '20250405_2.jpeg',
    title: '海棠花溪',
    location: '北京·望京南',
  },
  {
    url: '20250613_2.JPG',
    title: '香山公园',
    location: '北京·香山公园',
  },
  {
    url: '20250613_3.JPG',
    title: '香山公园',
    location: '北京·香山公园',
  },
  {
    url: '20250613.JPG',
    title: '香山公园',
    location: '北京·香山公园',
  },
  {
    url: '20250718_1.JPG',
    title: '城市夜景',
    location: '天津',
  },
  {
    url: '20250718_2.JPG',
    title: '世纪钟',
    location: '天津',
  },
  {
    title: '城市夜景',
    url: '20250718.jpg',
    location: '天津',
  },
  {
    title: '天津之眼下的夜晚',
    url: '20250719.JPG',
    location: '天津',
  },
  {
    title: '水母',
    url: '20250720.JPG',
    location: '天津·极地海洋公园',
  },
  {
    url: '20251102_1.JPG',
    title: '枯木',
    location: '上海·共青国家森林公园',
  },
  {
    title: '静谧的白',
    url: '20251102_2.JPG',
    location: '上海·共青国家森林公园',
  },
  {
    url: '20251102_3.JPG',
    title: '落叶',
    location: '上海·共青国家森林公园',
  },
  {
    url: '20251102_4.JPG',
    title: '码头的蓝调时刻',
    location: '上海·共青国家森林公园',
    favorite: true,
  },
  {
    url: '20251102.jpeg',
    title: '小火车来喽～',
    location: '上海·共青国家森林公园',
  },
  {
    url: '20251102.JPG',
    title: '阳光与森林',
    location: '上海·共青国家森林公园',
  },
  {
    url: '20251115.JPG',
    title: '上海长江大桥',
    location: '上海',
    description: '《悲伤逆流成河》取景地，上海长江大桥',
    favorite: true,
  },
]

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

