// 移动端警告弹窗
(function() {
    // 检测是否为移动设备
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    // 检查是否已经设置了"不再提示"
    function shouldShowWarning() {
        return !localStorage.getItem('mobile-warning-dismissed');
    }

    // 创建弹窗HTML
    function createWarningModal() {
        const modalHTML = `
            <div id="mobile-warning-overlay" class="mobile-warning-overlay">
                <div id="mobile-warning-modal" class="mobile-warning-modal">
                    <div class="mobile-warning-content">
                        <h3>温馨提示</h3>
                        <p>推荐使用电脑端打开此网站，手机端目录及视频显示可能有问题</p>
                        <div class="mobile-warning-buttons">
                            <button id="mobile-warning-dismiss" class="mobile-warning-btn dismiss-btn">下次不再提示</button>
                            <button id="mobile-warning-ok" class="mobile-warning-btn ok-btn">好的</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 将弹窗添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 显示弹窗
    function showWarning() {
        createWarningModal();
        
        const overlay = document.getElementById('mobile-warning-overlay');
        const modal = document.getElementById('mobile-warning-modal');
        
        // 显示弹窗
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('show');
            modal.classList.add('show');
        }, 10);

        // 绑定事件处理器
        bindEventHandlers();
    }

    // 隐藏弹窗
    function hideWarning() {
        const overlay = document.getElementById('mobile-warning-overlay');
        const modal = document.getElementById('mobile-warning-modal');
        
        overlay.classList.remove('show');
        modal.classList.remove('show');
        
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    // 绑定事件处理器
    function bindEventHandlers() {
        const dismissBtn = document.getElementById('mobile-warning-dismiss');
        const okBtn = document.getElementById('mobile-warning-ok');
        const overlay = document.getElementById('mobile-warning-overlay');

        // "下次不再提示"按钮
        dismissBtn.addEventListener('click', function() {
            localStorage.setItem('mobile-warning-dismissed', 'true');
            hideWarning();
        });

        // "好的"按钮
        okBtn.addEventListener('click', function() {
            hideWarning();
        });

        // 点击遮罩层关闭弹窗
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                hideWarning();
            }
        });

        // ESC键关闭弹窗
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideWarning();
            }
        });
    }

    // 初始化
    function init() {
        // 页面加载完成后检查
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    if (isMobileDevice() && shouldShowWarning()) {
                        showWarning();
                    }
                }, 500); // 延迟500ms显示，让页面先完全加载
            });
        } else {
            setTimeout(function() {
                if (isMobileDevice() && shouldShowWarning()) {
                    showWarning();
                }
            }, 500);
        }
    }

    // 启动
    init();
})();
