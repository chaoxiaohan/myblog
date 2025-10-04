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
        const viewerCaption = viewer.querySelector('.image-viewer-caption');
        const closeBtn = viewer.querySelector('.image-viewer-close');
        const prevBtn = viewer.querySelector('.image-viewer-prev');
        const nextBtn = viewer.querySelector('.image-viewer-next');
        const overlay = viewer.querySelector('.image-viewer-overlay');

        let images = [];
        let currentIndex = 0;

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
        }

        // 关闭查看器
        function closeViewer() {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
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

        // 图片缩放功能（鼠标滚轮）
        let scale = 1;
        viewerImg.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            scale = Math.min(Math.max(0.5, scale + delta), 3);
            
            viewerImg.style.transform = `scale(${scale})`;
        });

        // 重置缩放
        viewer.addEventListener('click', function(e) {
            if (e.target === viewer || e.target === overlay) {
                scale = 1;
                viewerImg.style.transform = 'scale(1)';
            }
        });

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
