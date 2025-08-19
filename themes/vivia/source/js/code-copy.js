/**
 * 代码块复制功能
 * Author: Assistant
 */

(function() {
  'use strict';

  // 创建复制按钮
  function createCopyButton() {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.type = 'button';
    copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
    copyButton.setAttribute('aria-label', '复制代码');
    copyButton.setAttribute('title', '复制代码');
    return copyButton;
  }

  // 复制文本到剪贴板
  function copyTextToClipboard(text) {
    // 尝试使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => {
        return true;
      }).catch(() => {
        return fallbackCopyTextToClipboard(text);
      });
    } else {
      // 回退到传统方法
      return Promise.resolve(fallbackCopyTextToClipboard(text));
    }
  }

  // 传统的复制方法（回退方案）
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  // 显示复制成功提示
  function showCopySuccess(button) {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check"></i>';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('copied');
    }, 2000);
  }

  // 显示复制失败提示
  function showCopyError(button) {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-times"></i>';
    button.classList.add('copy-error');
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('copy-error');
    }, 2000);
  }

  // 获取代码块的文本内容
  function getCodeText(codeBlock) {
    // 处理不同类型的代码块结构
    let textContent = '';
    
    // 如果是 figure.highlight 结构
    if (codeBlock.classList.contains('highlight')) {
      const codeElement = codeBlock.querySelector('td.code pre') || codeBlock.querySelector('pre code') || codeBlock.querySelector('code');
      if (codeElement) {
        textContent = codeElement.textContent || codeElement.innerText || '';
      }
    } 
    // 如果是普通 pre 标签
    else if (codeBlock.tagName === 'PRE') {
      const codeElement = codeBlock.querySelector('code');
      if (codeElement) {
        textContent = codeElement.textContent || codeElement.innerText || '';
      } else {
        textContent = codeBlock.textContent || codeBlock.innerText || '';
      }
    }
    // 其他情况
    else {
      textContent = codeBlock.textContent || codeBlock.innerText || '';
    }
    
    return textContent;
  }

  // 初始化代码复制功能
  function initCodeCopy() {
    // 查找所有代码块，使用更精确的选择器
    const codeBlocks = document.querySelectorAll('pre:not(.code-block-wrapper pre), .highlight:not(.code-block-wrapper .highlight), figure.highlight');
    
    codeBlocks.forEach((block) => {
      // 避免重复添加按钮
      if (block.querySelector('.copy-code-button') || block.closest('.code-block-wrapper')) {
        return;
      }

      // 检查是否已经被包装
      if (block.parentElement && block.parentElement.classList.contains('code-block-wrapper')) {
        return;
      }

      // 创建容器
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      
      // 将代码块包装在容器中
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);
      
      // 创建并添加复制按钮
      const copyButton = createCopyButton();
      wrapper.appendChild(copyButton);
      
      // 添加复制事件监听器
      copyButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const codeText = getCodeText(block);
        
        if (!codeText.trim()) {
          showCopyError(copyButton);
          return;
        }
        
        try {
          const success = await copyTextToClipboard(codeText);
          if (success) {
            showCopySuccess(copyButton);
          } else {
            showCopyError(copyButton);
          }
        } catch (error) {
          console.error('复制失败:', error);
          showCopyError(copyButton);
        }
      });
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopy);
  } else {
    initCodeCopy();
  }

  // 为动态加载的内容提供重新初始化的方法
  window.initCodeCopy = initCodeCopy;
})();
