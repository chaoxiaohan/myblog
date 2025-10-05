// 自定义右键菜单
(function() {
    'use strict';

    let contextMenu = null;
    let selectedText = '';

    // 创建菜单HTML
    function createContextMenu() {
        if (contextMenu) {
            return;
        }

        contextMenu = document.createElement('div');
        contextMenu.className = 'custom-context-menu';
        contextMenu.id = 'custom-context-menu';
        document.body.appendChild(contextMenu);
    }

    // 获取普通菜单项（无选中文字时）
    function getNormalMenuItems() {
        return [
            {
                icon: 'fas fa-sync-alt',
                text: '刷新页面',
                action: () => location.reload()
            },
            {
                icon: 'fas fa-arrow-up',
                text: '转到顶部',
                action: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            },
            {
                icon: 'fas fa-arrow-down',
                text: '转到底部',
                action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            },
            { divider: true },
            {
                icon: 'fas fa-adjust',
                text: '切换亮/暗色模式',
                action: () => {
                    const html = document.documentElement;
                    const currentTheme = html.getAttribute('theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    html.setAttribute('theme', newTheme);
                    localStorage.setItem('theme', newTheme);
                }
            },
            { divider: true },
            {
                icon: 'fas fa-home',
                text: '回到首页',
                action: () => window.location.href = '/'
            }
        ];
    }

    // 获取选中文字时的菜单项
    function getSelectionMenuItems() {
        return [
            {
                icon: 'fas fa-search',
                text: '本站搜索',
                action: () => {
                    // 触发本站搜索功能
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = selectedText;
                        searchInput.focus();
                        // 触发搜索事件
                        const inputEvent = new Event('input', { bubbles: true });
                        searchInput.dispatchEvent(inputEvent);
                        // 显示搜索结果区域
                        const searchResults = document.getElementById('search-results');
                        if (searchResults) {
                            searchResults.classList.remove('hidden');
                        }
                    } else {
                        // 如果找不到搜索框，显示提示
                        showToast('搜索功能未加载');
                    }
                }
            },
            {
                icon: 'fab fa-bing',
                text: '必应搜索',
                action: () => {
                    window.open(`https://www.bing.com/search?q=${encodeURIComponent(selectedText)}`, '_blank');
                }
            },
            { divider: true },
            {
                icon: 'fas fa-copy',
                text: '复制所选内容',
                action: () => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(selectedText).then(() => {
                            showToast('已复制到剪贴板');
                        }).catch(() => {
                            fallbackCopy();
                        });
                    } else {
                        fallbackCopy();
                    }
                }
            }
        ];
    }

    // 降级复制方法
    function fallbackCopy() {
        const textArea = document.createElement('textarea');
        textArea.value = selectedText;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('已复制到剪贴板');
        } catch (err) {
            showToast('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }

    // 显示提示消息
    function showToast(message) {
        // 检查是否已存在toast
        let toast = document.querySelector('.context-menu-toast');
        if (toast) {
            toast.remove();
        }

        toast = document.createElement('div');
        toast.className = 'context-menu-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 10001;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);

        // 渐入
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // 渐出并移除
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }

    // 渲染菜单
    function renderMenu(items) {
        if (!contextMenu) return;

        contextMenu.innerHTML = '';
        
        items.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'custom-context-menu-divider';
                contextMenu.appendChild(divider);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'custom-context-menu-item';
                menuItem.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span>${item.text}</span>
                `;
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.action();
                    hideMenu();
                });
                contextMenu.appendChild(menuItem);
            }
        });
    }

    // 显示菜单
    function showMenu(x, y, items) {
        if (!contextMenu) return;

        renderMenu(items);

        // 设置位置
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';

        // 显示菜单
        contextMenu.classList.add('show');

        // 调整位置，防止溢出屏幕
        setTimeout(() => {
            const rect = contextMenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newX = x;
            let newY = y;

            if (rect.right > viewportWidth) {
                newX = viewportWidth - rect.width - 10;
            }

            if (rect.bottom > viewportHeight) {
                newY = viewportHeight - rect.height - 10;
            }

            // 确保不会超出左边和上边
            if (newX < 10) newX = 10;
            if (newY < 10) newY = 10;

            contextMenu.style.left = newX + 'px';
            contextMenu.style.top = newY + 'px';
        }, 10);
    }

    // 隐藏菜单
    function hideMenu() {
        if (contextMenu) {
            contextMenu.classList.remove('show');
        }
    }

    // 获取选中的文本
    function getSelectedText() {
        return window.getSelection().toString().trim();
    }

    // 初始化
    function init() {
        createContextMenu();

        // 阻止默认右键菜单
        document.addEventListener('contextmenu', (e) => {
            // 允许在输入框中使用默认右键菜单
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.isContentEditable) {
                return;
            }

            e.preventDefault();

            selectedText = getSelectedText();
            const items = selectedText ? getSelectionMenuItems() : getNormalMenuItems();
            
            // 使用 clientX 和 clientY，因为菜单是 fixed 定位
            showMenu(e.clientX, e.clientY, items);
        });

        // 点击其他地方隐藏菜单
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target)) {
                hideMenu();
            }
        });

        // 滚动时隐藏菜单
        document.addEventListener('scroll', () => {
            hideMenu();
        });

        // ESC键隐藏菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideMenu();
            }
        });

        // 窗口大小改变时隐藏菜单
        window.addEventListener('resize', () => {
            hideMenu();
        });
    }

    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
