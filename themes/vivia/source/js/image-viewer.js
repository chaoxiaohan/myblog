// 图片查看器功能
(function() {
    'use strict';

    // 创建查看器HTML结构
    function createViewer() {
        const viewerHTML = `
            <div id="image-viewer" class="image-viewer">
                <div class="image-viewer-overlay"></div>
                <div class="image-viewer-content">
                    <button class="image-viewer-close" aria-label="关闭">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <button class="image-viewer-prev" aria-label="上一张">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button class="image-viewer-next" aria-label="下一张">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                    <div class="image-viewer-wrapper">
                        <img class="image-viewer-img" src="" alt="">
                    </div>
                    <div class="image-viewer-caption"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', viewerHTML);
    }

    // 初始化图片查看器
    function initImageViewer() {
        // 创建查看器
        createViewer();

        const viewer = document.getElementById('image-viewer');
        const viewerImg = viewer.querySelector('.image-viewer-img');
        const viewerWrapper = viewer.querySelector('.image-viewer-wrapper');
        const viewerCaption = viewer.querySelector('.image-viewer-caption');
        const closeBtn = viewer.querySelector('.image-viewer-close');
        const prevBtn = viewer.querySelector('.image-viewer-prev');
        const nextBtn = viewer.querySelector('.image-viewer-next');
        const overlay = viewer.querySelector('.image-viewer-overlay');

        let images = [];
        let currentIndex = 0;

        // 缩放和拖拽状态
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let lastTranslateX = 0;
        let lastTranslateY = 0;

        // 更新图片变换
        function updateTransform(animate) {
            if (animate) {
                viewerImg.style.transition = 'transform 0.3s ease';
            } else {
                viewerImg.style.transition = 'none';
            }
            viewerImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            // 更新光标样式
            viewerImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        }

        // 重置缩放和位移
        function resetTransform() {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateTransform(true);
        }

        // 获取所有文章内容中的图片
        function getContentImages() {
            const contentArea = document.querySelector('#content-body article') || document.querySelector('#content-body');
            if (!contentArea) return [];
            
            const imgElements = contentArea.querySelectorAll('img');
            return Array.from(imgElements).filter(img => {
                // 排除一些不需要查看的图片（如图标等）
                return !img.classList.contains('no-viewer') && 
                       !img.closest('.no-viewer') &&
                       img.src && 
                       !img.src.includes('icon') &&
                       !img.src.includes('avatar');
            });
        }

        // 显示图片
        function showImage(index) {
            if (images.length === 0) return;
            
            currentIndex = index;
            const img = images[currentIndex];
            
            // 重置缩放状态
            scale = 1;
            translateX = 0;
            translateY = 0;
            viewerImg.style.transition = 'none';
            viewerImg.style.transform = '';

            viewerImg.src = img.src;
            viewerImg.alt = img.alt || '';
            
            // 显示图片描述
            if (img.alt) {
                viewerCaption.textContent = img.alt;
                viewerCaption.style.display = 'block';
            } else {
                viewerCaption.style.display = 'none';
            }

            // 更新导航按钮状态
            prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
            nextBtn.style.display = images.length > 1 ? 'flex' : 'none';

            viewer.classList.add('active');
            document.body.style.overflow = 'hidden';
            viewerImg.style.cursor = 'zoom-in';
        }

        // 关闭查看器
        function closeViewer() {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
            // 重置缩放状态
            scale = 1;
            translateX = 0;
            translateY = 0;
            viewerImg.style.transform = '';
            viewerImg.src = '';
        }

        // 上一张
        function showPrev() {
            if (images.length === 0) return;
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        }

        // 下一张
        function showNext() {
            if (images.length === 0) return;
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }

        // 给所有图片添加点击事件
        function attachImageClickEvents() {
            images = getContentImages();
            images.forEach((img, index) => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function(e) {
                    e.preventDefault();
                    showImage(index);
                });
            });
        }

        // 事件监听
        closeBtn.addEventListener('click', closeViewer);
        overlay.addEventListener('click', closeViewer);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

        // 键盘事件
        document.addEventListener('keydown', function(e) {
            if (!viewer.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    closeViewer();
                    break;
                case 'ArrowLeft':
                    showPrev();
                    break;
                case 'ArrowRight':
                    showNext();
                    break;
            }
        });

        // 图片缩放功能（鼠标滚轮）—— 以鼠标位置为中心缩放
        viewerWrapper.addEventListener('wheel', function(e) {
            e.preventDefault();

            const rect = viewerImg.getBoundingClientRect();
            // 鼠标相对于图片中心的位置
            const imgCenterX = rect.left + rect.width / 2;
            const imgCenterY = rect.top + rect.height / 2;
            const mouseOffsetX = e.clientX - imgCenterX;
            const mouseOffsetY = e.clientY - imgCenterY;

            const oldScale = scale;
            const delta = e.deltaY > 0 ? -0.15 : 0.15;
            scale = Math.min(Math.max(0.5, scale + delta), 5);

            // 缩放时调整位移，使鼠标指向的点保持不动
            const ratio = scale / oldScale;
            translateX = mouseOffsetX - ratio * (mouseOffsetX - translateX);
            translateY = mouseOffsetY - ratio * (mouseOffsetY - translateY);

            // 如果缩小到1倍以下，重置位移
            if (scale <= 1) {
                translateX = 0;
                translateY = 0;
            }

            updateTransform(false);
        });

        // 双击缩放切换
        let lastClickTime = 0;
        viewerImg.addEventListener('click', function(e) {
            const now = Date.now();
            if (now - lastClickTime < 300) {
                // 双击
                e.stopPropagation();
                if (scale > 1) {
                    // 已放大，重置
                    resetTransform();
                } else {
                    // 放大到2倍，以点击位置为中心
                    const rect = viewerImg.getBoundingClientRect();
                    const imgCenterX = rect.left + rect.width / 2;
                    const imgCenterY = rect.top + rect.height / 2;
                    const mouseOffsetX = e.clientX - imgCenterX;
                    const mouseOffsetY = e.clientY - imgCenterY;

                    scale = 2;
                    translateX = -mouseOffsetX;
                    translateY = -mouseOffsetY;
                    updateTransform(true);
                }
                lastClickTime = 0;
            } else {
                lastClickTime = now;
            }
        });

        // 拖拽功能（放大时可拖动图片）
        viewerImg.addEventListener('mousedown', function(e) {
            if (scale <= 1) return;
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            lastTranslateX = translateX;
            lastTranslateY = translateY;
            viewerImg.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            translateX = lastTranslateX + (e.clientX - dragStartX);
            translateY = lastTranslateY + (e.clientY - dragStartY);
            updateTransform(false);
        });

        document.addEventListener('mouseup', function() {
            if (!isDragging) return;
            isDragging = false;
            viewerImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        });

        // 触摸拖拽支持（移动端）
        let touchStartX = 0;
        let touchStartY = 0;
        let lastTouchTranslateX = 0;
        let lastTouchTranslateY = 0;

        // 触摸双指缩放
        let lastTouchDist = 0;
        let lastTouchScale = 1;

        viewerImg.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                // 双指缩放开始
                lastTouchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                lastTouchScale = scale;
            } else if (e.touches.length === 1 && scale > 1) {
                // 单指拖拽
                isDragging = true;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                lastTouchTranslateX = translateX;
                lastTouchTranslateY = translateY;
            }
        }, { passive: true });

        viewerImg.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = Math.min(Math.max(0.5, lastTouchScale * (dist / lastTouchDist)), 5);
                if (scale <= 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updateTransform(false);
            } else if (isDragging && e.touches.length === 1) {
                e.preventDefault();
                translateX = lastTouchTranslateX + (e.touches[0].clientX - touchStartX);
                translateY = lastTouchTranslateY + (e.touches[0].clientY - touchStartY);
                updateTransform(false);
            }
        }, { passive: false });

        viewerImg.addEventListener('touchend', function() {
            isDragging = false;
            lastTouchDist = 0;
        }, { passive: true });

        // 初始化
        attachImageClickEvents();

        // 监听内容变化（适用于动态加载的内容）
        const observer = new MutationObserver(function() {
            attachImageClickEvents();
        });

        const contentBody = document.querySelector('#content-body');
        if (contentBody) {
            observer.observe(contentBody, {
                childList: true,
                subtree: true
            });
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageViewer);
    } else {
        initImageViewer();
    }
})();
