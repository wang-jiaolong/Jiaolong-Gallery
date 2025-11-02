/*
 Multiverse by HTML5 UP
 html5up.net | @ajlkn
 Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)

 Added EXIF data and enhanced for Jekyll by Ram Patra
 */

(function ($) {

    skel.breakpoints({
        xlarge: '(max-width: 1680px)',
        large: '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small: '(max-width: 736px)',
        xsmall: '(max-width: 480px)'
    });

    $(function () {

        var $window = $(window),
            $body = $('body'),
            $wrapper = $('#wrapper');

        // Hack: Enable IE workarounds.
        if (skel.vars.IEVersion < 12)
            $body.addClass('ie');

        // Touch?
        if (skel.vars.mobile)
            $body.addClass('touch');

        // Transitions supported?
        if (skel.canUse('transition')) {

            // Add (and later, on DOM ready, remove) "loading" class.
            // Changed from 'load' to immediate removal so page shows without waiting for all images.
            // Images will load asynchronously in their respective cells.
            $body.addClass('loading');

            // Remove loading class immediately after DOM is ready (which it already is at this point)
            // This allows images to load asynchronously without blocking the page display
            window.setTimeout(function () {
                $body.removeClass('loading');
            }, 100);

            // Prevent transitions/animations on resize.
            var resizeTimeout;

            $window.on('resize', function () {

                window.clearTimeout(resizeTimeout);

                $body.addClass('resizing');

                resizeTimeout = window.setTimeout(function () {
                    $body.removeClass('resizing');
                }, 100);

            });

        }

        // Scroll back to top.
        $window.scrollTop(0);

        // Fix: Placeholder polyfill.
        $('form').placeholder();

        // Panels.
        var $panels = $('.panel');

        $panels.each(function () {

            var $this = $(this),
                $toggles = $('[href="#' + $this.attr('id') + '"]'),
                $closer = $('<div class="closer" />').appendTo($this);

            // Closer.
            $closer
                .on('click', function (event) {
                    $this.trigger('---hide');
                });

            // Events.
            $this
                .on('click', function (event) {
                    event.stopPropagation();
                })
                .on('---toggle', function () {

                    if ($this.hasClass('active'))
                        $this.triggerHandler('---hide');
                    else
                        $this.triggerHandler('---show');

                })
                .on('---show', function () {

                    // Hide other content.
                    if ($body.hasClass('content-active'))
                        $panels.trigger('---hide');

                    // Activate content, toggles.
                    $this.addClass('active');
                    $toggles.addClass('active');

                    // Activate body.
                    $body.addClass('content-active');

                })
                .on('---hide', function () {

                    // Deactivate content, toggles.
                    $this.removeClass('active');
                    $toggles.removeClass('active');

                    // Deactivate body.
                    $body.removeClass('content-active');

                });

            // Toggles.
            $toggles
                .removeAttr('href')
                .css('cursor', 'pointer')
                .on('click', function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    $this.trigger('---toggle');

                });

        });

        // Global events.
        $body
            .on('click', function (event) {

                if ($body.hasClass('content-active')) {

                    event.preventDefault();
                    event.stopPropagation();

                    $panels.trigger('---hide');

                }

            });

        $window
            .on('keyup', function (event) {

                if (event.keyCode == 27
                    && $body.hasClass('content-active')) {

                    event.preventDefault();
                    event.stopPropagation();

                    $panels.trigger('---hide');

                }

            });

        // Header.
        var $header = $('#header');

        // Links.
        $header.find('a').each(function () {

            var $this = $(this),
                href = $this.attr('href');

            // Internal link? Skip.
            if (!href
                || href.charAt(0) == '#')
                return;

            // Redirect on click.
            $this
                .removeAttr('href')
                .css('cursor', 'pointer')
                .on('click', function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    window.location.href = href;

                });

        });

        // Footer.
        var $footer = $('#footer');

        // Copyright.
        // This basically just moves the copyright line to the end of the *last* sibling of its current parent
        // when the "medium" breakpoint activates, and moves it back when it deactivates.
        $footer.find('.copyright').each(function () {

            var $this = $(this),
                $parent = $this.parent(),
                $lastParent = $parent.parent().children().last();

            skel
                .on('+medium', function () {
                    $this.appendTo($lastParent);
                })
                .on('-medium', function () {
                    $this.appendTo($parent);
                });

        });

        // Main.
        var $main = $('#main'),
            exifDatas = {},
            locationDataCache = null; // 缓存 locationDic.json 数据

        // OSS configuration
        var OSS_CONFIG = {
            baseUrl: 'https://jiaolong.s3.bitiful.net/gallery/',
            // OSS图片处理参数 - 用于生成缩略图
            // 根据你的OSS服务调整参数格式
            // 常见的格式有：
            // - 阿里云OSS: '?x-oss-process=image/resize,w_512,m_lfit/quality,q_20'
            // - 腾讯云COS: '?imageMogr2/thumbnail/512x/quality/20'
            // - 通用格式: '?w=512&h=512&q=20'
            // q=20 表示质量20%，用于减少缩略图大小
            // 根据你的OSS服务，选择以下格式之一：
            // 1. 简单URL参数格式: '?w=512&q=20' (宽度512px，质量20%)
            // 2. 阿里云OSS格式: '?x-oss-process=image/resize,w_512,m_lfit/quality,q_20'
            // 3. 腾讯云COS格式: '?imageMogr2/thumbnail/512x/quality/20'
            thumbParam: '?w=512&q=20', // 宽度512px，质量20%的缩略图
            // 需要使用OSS的图片文件名列表（不含路径，仅文件名）
            // 如果文件名在locationDic.json中存在，将自动使用OSS
            useOSSForFiles: [] // 留空则自动检测locationDic.json中的文件
        };

        // 获取OSS缩略图URL（小尺寸）
        function getOSSThumbUrl(filename) {
            return OSS_CONFIG.baseUrl + filename + OSS_CONFIG.thumbParam;
        }

        // 获取OSS完整图片URL
        function getOSSFullUrl(filename) {
            return OSS_CONFIG.baseUrl + filename;
        }

        // 确保locationDataCache已加载
        function ensureLocationDataCache() {
            if (!locationDataCache) {
                try {
                    const request = new XMLHttpRequest();
                    request.open('GET', '../images/locationDic.json', false); // 同步请求
                    request.send();
                    if (request.status === 200) {
                        locationDataCache = JSON.parse(request.responseText);
                    }
                } catch (error) {
                    console.error('加载locationDic.json失败:', error);
                }
            }
        }

        // 检查图片是否应该使用OSS
        function shouldUseOSS(filename) {
            // 如果配置了useOSSForFiles列表，检查文件名是否在列表中
            if (OSS_CONFIG.useOSSForFiles.length > 0) {
                return OSS_CONFIG.useOSSForFiles.indexOf(filename) !== -1;
            }
            
            // 暂时只对以 "20251102" 前缀开头的照片使用OSS
            var baseName = removeFileExtension(filename);
            if (baseName.startsWith('20251102')) {
                return true;
            }
            
            return false;
            
            // 以下代码已暂时禁用，如需启用所有locationDic.json中的文件，可以取消注释
            /*
            // 确保locationDataCache已加载
            ensureLocationDataCache();
            
            // 检查文件名（去掉扩展名）是否在locationDic.json中存在
            if (locationDataCache) {
                // 检查完全匹配或前缀匹配
                if (locationDataCache[baseName]) {
                    return true;
                }
                // 检查前缀匹配
                var prefix = baseName.split(/[-_]/)[0];
                for (var key in locationDataCache) {
                    if (key.startsWith(prefix) || baseName.startsWith(key)) {
                        return true;
                    }
                }
            }
            */
        }

        // Image loading queue manager - loads images in batches to prevent network congestion
        // This ensures images load sequentially in groups, preventing all images from competing for bandwidth
        var ImageLoader = {
            queue: [],
            loading: 0,
            batchSize: 4, // Number of images to load simultaneously (adjust between 3-5 for optimal performance)
            currentIndex: 0,

            // Initialize: collect all images and store their src in data-src
            init: function($thumbs) {
                var self = this;
                $thumbs.each(function() {
                    var $this = $(this),
                        $image = $this.find('.image'),
                        $image_img = $image.children('img');

                    if ($image.length == 0 || $image_img.length == 0)
                        return;

                    var src = $image_img.attr('src');
                    if (!src) return;

                    // 检查是否应该使用OSS
                    var filename = $image_img.data('name') || src.split('/').pop();
                    var useOSS = shouldUseOSS(filename);
                    
                    if (useOSS) {
                        // 使用OSS URL
                        // 缩略图使用小尺寸
                        src = getOSSThumbUrl(filename);
                        // 大图链接使用完整尺寸
                        var fullUrl = getOSSFullUrl(filename);
                        $image.attr('href', fullUrl);
                    }

                    // Store original src in data attribute and remove from src
                    $image_img.attr('data-src', src);
                    $image_img.attr('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'); // 1x1 transparent SVG

                    // Add to queue
                    self.queue.push({
                        $thumb: $this,
                        $image: $image,
                        $image_img: $image_img,
                        src: src, // 缩略图URL（用于显示）
                        filename: filename,
                        useOSS: useOSS
                    });
                });

                // Start loading first batch
                this.loadNextBatch();
            },

            // Load next batch of images (maintains batchSize concurrent loads)
            loadNextBatch: function() {
                // Keep loading until we have batchSize images loading or queue is empty
                while (this.loading < this.batchSize && this.currentIndex < this.queue.length) {
                    var item = this.queue[this.currentIndex];
                    this.loadImage(item);
                    this.currentIndex++;
                }
            },

            // Load a single image
            loadImage: function(item) {
                var self = this,
                    $image = item.$image,
                    $image_img = item.$image_img,
                    src = item.src; // 缩略图URL（用于显示）

                this.loading++;

                // Create a new image object to preload
                var img = new Image();
                
                img.onload = function() {
                    // Set the actual src to trigger browser caching
                    $image_img.attr('src', src);
                    
                    // Set background image
                    $image.css('background-image', 'url(' + src + ')');

                    // Set background position if specified
                    var x = $image_img.data('position');
                    if (x)
                        $image.css('background-position', x);

                    // Hide original img
                    $image_img.hide();

                    // EXIF数据现在只在点击放大查看时才读取（在Poptrox的caption函数中）
                    // 这样可以提高页面加载速度，特别是对于OSS图片

                    self.loading--;
                    self.loadNextBatch(); // Try to load next image to maintain batchSize
                };

                img.onerror = function() {
                    // On error, still try to set the src (might be a CORS issue with EXIF)
                    $image_img.attr('src', src);
                    $image.css('background-image', 'url(' + src + ')');
                    var x = $image_img.data('position');
                    if (x)
                        $image.css('background-position', x);
                    $image_img.hide();

                    self.loading--;
                    self.loadNextBatch(); // Try to load next image to maintain batchSize
                };

                // Start loading
                img.src = src;
            }
        };

        // Initialize thumbs and set up IE hack
        var $thumbs = $main.children('.thumb');
        
        $thumbs.each(function () {
            var $this = $(this),
                $image = $this.find('.image');

            // Hack: IE<11 doesn't support pointer-events, which means clicks to our image never
            // land as they're blocked by the thumbnail's caption overlay gradient. This just forces
            // the click through to the image.
            if (skel.vars.IEVersion < 11)
                $this
                    .css('cursor', 'pointer')
                    .on('click', function () {
                        $image.trigger('click');
                    });
        });

        // Initialize image loader
        ImageLoader.init($thumbs);

        // Poptrox.
        $main.poptrox({
            baseZIndex: 20000,
            caption: function ($a) {
                var $image_img = $a.children('img');
                var filename = $image_img.data('name');
                var data = exifDatas[filename];
                
                // 如果还没有EXIF数据，现在读取（只在点击放大查看时才读取）
                if (data === undefined) {
                    // 检查是否是OSS图片，如果是则使用完整URL读取EXIF（避免图片处理丢失EXIF）
                    var useOSS = shouldUseOSS(filename);
                    var exifSrc;
                    
                    if (useOSS) {
                        // OSS图片使用完整URL（不带处理参数）来读取EXIF
                        exifSrc = getOSSFullUrl(filename);
                        var exifImg = new Image();
                        exifImg.crossOrigin = 'anonymous'; // 设置CORS属性，允许跨域读取
                        exifImg.onload = function() {
                            EXIF.getData(exifImg, function() {
                                exifDatas[filename] = getExifDataMarkup(this);
                                // 更新弹窗中的caption
                                var popup = $main[0]._poptrox;
                                if (popup && popup.$popup) {
                                    var caption = popup.$popup.find('.poptrox-caption');
                                    if (caption.length) {
                                        caption.html('<p>' + exifDatas[filename] + '</p>');
                                    }
                                }
                            });
                        };
                        exifImg.onerror = function() {
                            // 如果CORS失败，尝试从当前图片读取（可能会失败）
                            EXIF.getData($image_img[0], function() {
                                exifDatas[filename] = getExifDataMarkup(this);
                                var popup = $main[0]._poptrox;
                                if (popup && popup.$popup) {
                                    var caption = popup.$popup.find('.poptrox-caption');
                                    if (caption.length) {
                                        caption.html('<p>' + exifDatas[filename] + '</p>');
                                    }
                                }
                            });
                        };
                        exifImg.src = exifSrc;
                        // 返回空字符串，等待EXIF加载完成后再更新
                        return ' ';
                    } else {
                        // 本地图片直接从img元素读取
                        EXIF.getData($image_img[0], function () {
                            data = exifDatas[filename] = getExifDataMarkup(this);
                            // 更新弹窗中的caption
                            var popup = $main[0]._poptrox;
                            if (popup && popup.$popup) {
                                var caption = popup.$popup.find('.poptrox-caption');
                                if (caption.length) {
                                    caption.html('<p>' + data + '</p>');
                                }
                            }
                        });
                        // 返回空字符串，等待EXIF加载完成后再更新
                        return ' ';
                    }
                }
                return data !== undefined ? '<p>' + data + '</p>' : ' ';
            },
            fadeSpeed: 300,
            onPopupClose: function () {
                $body.removeClass('modal-active');
            },
            onPopupOpen: function () {
                $body.addClass('modal-active');
            },
            overlayOpacity: 0,
            popupCloserText: '',
            popupHeight: 150,
            popupLoaderText: '',
            popupSpeed: 300,
            popupWidth: 150,
            selector: '.thumb > a.image',
            usePopupCaption: true,
            usePopupCloser: true,
            usePopupDefaultStyling: false,
            usePopupForceClose: true,
            usePopupLoader: true,
            usePopupNav: true,
            windowMargin: 50
        });

        // Hack: Set margins to 0 when 'xsmall' activates.
        skel
            .on('-xsmall', function () {
                $main[0]._poptrox.windowMargin = 50;
            })
            .on('+xsmall', function () {
                $main[0]._poptrox.windowMargin = 0;
            });

        function removeFileExtension(filename) {
            // 找到最后一个点的位置
            const lastDotIndex = filename.lastIndexOf('.');

            // 如果找到了点，并且点不是第一个字符
            if (lastDotIndex > 0) {
                // 返回不包括后缀的部分
                return filename.substring(0, lastDotIndex);
            } else {
                // 如果没有找到点或者点在第一个字符，则返回原始字符串
                return filename;
            }
        }

        function getLocationValue(key) {
            if (!locationDataCache) {
                const request = new XMLHttpRequest();
                request.open('GET', '../images/locationDic.json', false); // false 表示同步请求
                try {
                    request.send();
                    if (request.status === 200) {
                        const data = JSON.parse(request.responseText);
                        locationDataCache = data;
                    } else {
                        console.error('Network response was not ok', request.status);
                    }
                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                }
            }
        
            // 首先尝试完全匹配
            var value = locationDataCache[removeFileExtension(key)];
            
            // 如果没有找到完全匹配，尝试查找前缀匹配
            if (!value) {
                const baseKey = removeFileExtension(key).split(/[-_]/)[0]; // 获取基础前缀（不包含序号）
                // 遍历所有键，查找具有相同前缀的键
                for (const dictKey in locationDataCache) {
                    if (dictKey.startsWith(baseKey)) {
                        value = locationDataCache[dictKey];
                        break;
                    }
                }
                
                // 如果还是没有找到，尝试反向匹配：查找字典中的键是否是当前键的前缀
                if (!value) {
                    for (const dictKey in locationDataCache) {
                        if (baseKey.startsWith(dictKey)) {
                            value = locationDataCache[dictKey];
                            break;
                        }
                    }
                }
            }

            if (value) {
                return value.replace(/-/g, '・');
            } else {
                return null;
            }
        }

        function getExifDataMarkup(img) {
            var exif = $('#main').data('exif');
            var template = '';
            for (var current in exif) {
                var current_data = exif[current];
                var exif_data = EXIF.getTag(img, current_data['tag']);
                if (typeof exif_data !== "undefined") {
                    template += '<span><i class="fa fa-' + current_data['icon'] + '" aria-hidden="true"></i> ' + exif_data + '&nbsp;&nbsp;</span>';
                }
            }

            const locationName = getLocationValue(img.dataset["name"]);
            if (locationName) {
                template += '<span class="location"><i class="fa fa-location-arrow" aria-hidden="true"></i> ' + locationName + '&nbsp;&nbsp;</span>';
            }
            return template;
        }
    });

})(jQuery);