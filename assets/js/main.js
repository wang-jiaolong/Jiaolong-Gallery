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

            // Add (and later, on load, remove) "loading" class.
            $body.addClass('loading');

            $window.on('load', function () {
                window.setTimeout(function () {
                    $body.removeClass('loading');
                }, 100);
            });

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

        // Thumbs.
        $main.children('.thumb').each(function () {

            var $this = $(this),
                $image = $this.find('.image'), $image_img = $image.children('img'),
                x;

            // No image? Bail.
            if ($image.length == 0)
                return;

            // Image.
            // This sets the background of the "image" <span> to the image pointed to by its child
            // <img> (which is then hidden). Gives us way more flexibility.

            // Set background.
            $image.css('background-image', 'url(' + $image_img.attr('src') + ')');

            // Set background position.
            if (x = $image_img.data('position'))
                $image.css('background-position', x);

            // Hide original img.
            $image_img.hide();

            // Hack: IE<11 doesn't support pointer-events, which means clicks to our image never
            // land as they're blocked by the thumbnail's caption overlay gradient. This just forces
            // the click through to the image.
            if (skel.vars.IEVersion < 11)
                $this
                    .css('cursor', 'pointer')
                    .on('click', function () {
                        $image.trigger('click');
                    });

            // EXIF data
            $image_img[0].addEventListener("load", function () {
                EXIF.getData($image_img[0], function () {
                    exifDatas[$image_img.data('name')] = getExifDataMarkup(this);
                });
            });

        });

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
            }

            if (value) {
                return value.replace('-', '・');
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