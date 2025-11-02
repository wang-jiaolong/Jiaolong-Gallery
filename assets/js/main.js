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
            exifDatas = {};

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

                    // Store original src in data attribute and remove from src
                    $image_img.attr('data-src', src);
                    $image_img.attr('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'); // 1x1 transparent SVG

                    // Add to queue
                    self.queue.push({
                        $thumb: $this,
                        $image: $image,
                        $image_img: $image_img,
                        src: src
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
                    src = item.src;

                this.loading++;

                // Create a new image object to preload
                var img = new Image();
                
                img.onload = function() {
                    // Get image name for EXIF data
                    var imgName = $image_img.data('name');
                    
                    // Set background image first (from preloaded img, no additional request)
                    $image.css('background-image', 'url(' + src + ')');
                    
                    // Set background position if specified
                    var x = $image_img.data('position');
                    if (x)
                        $image.css('background-position', x);
                    
                    // Now set the actual src on DOM element (browser will use cached version)
                    // Do this after setting background to ensure display works
                    $image_img.attr('src', src);

                    // Hide original img
                    $image_img.hide();
                    
                    // Load EXIF data asynchronously (may trigger XHR but will use browser cache)
                    // Do this after setting src to ensure image is displayed even if EXIF fails
                    EXIF.getData(img, function() {
                        if (imgName) {
                            exifDatas[imgName] = getExifDataMarkup(this);
                        }
                    });

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
                var data = exifDatas[$image_img.data('name')];
                if (data === undefined) {
                    // EXIF data					
                    EXIF.getData($image_img[0], function () {
                        data = exifDatas[$image_img.data('name')] = getExifDataMarkup(this);
                    });
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
        // 缓存 locationDic.json 数据
        let locationDataCache = null;
        let locationDataLoading = false;
        let locationDataCallbacks = [];

        // 异步加载 locationDic.json（避免阻塞主线程）
        function loadLocationData(callback) {
            if (locationDataCache) {
                // 数据已加载，立即调用回调
                if (callback) callback();
                return;
            }

            // 如果有回调，加入队列
            if (callback) {
                locationDataCallbacks.push(callback);
            }

            // 如果正在加载，不重复请求
            if (locationDataLoading) {
                return;
            }

            locationDataLoading = true;

            const request = new XMLHttpRequest();
            request.open('GET', '../images/locationDic.json', true); // true 表示异步请求
            request.onload = function() {
                try {
                    if (request.status === 200) {
                        locationDataCache = JSON.parse(request.responseText);
                    } else {
                        console.error('Network response was not ok', request.status);
                        locationDataCache = {}; // 设置为空对象避免后续请求
                    }
                } catch (error) {
                    console.error('There was a problem parsing location data:', error);
                    locationDataCache = {}; // 设置为空对象避免后续请求
                } finally {
                    locationDataLoading = false;
                    // 执行所有等待的回调
                    locationDataCallbacks.forEach(function(cb) { cb(); });
                    locationDataCallbacks = [];
                }
            };
            request.onerror = function() {
                console.error('Failed to load locationDic.json');
                locationDataCache = {}; // 设置为空对象避免后续请求
                locationDataLoading = false;
                // 执行所有等待的回调
                locationDataCallbacks.forEach(function(cb) { cb(); });
                locationDataCallbacks = [];
            };
            request.send();
        }

        // 预加载 locationDic.json（页面初始化时）
        loadLocationData();

        function getLocationValue(key) {
            // 如果数据还未加载，返回null（避免阻塞）
            if (!locationDataCache) {
                return null;
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