document.addEventListener('DOMContentLoaded', function() {
  const tocWidget = document.querySelector('.toc-widget');
  if (!tocWidget) return;

  const tocLinks = tocWidget.querySelectorAll('.toc-list a, .toc-list .toc-list-link');
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (!tocLinks.length || !headings.length) return;

  let activeHeading = null;
  let isUserScrolling = false;

  // 创建 Intersection Observer 来监听标题元素
  const observer = new IntersectionObserver(function(entries) {
    if (isUserScrolling) return; // 用户正在滚动时不更新
    
    let visibleHeadings = [];
    
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const rect = entry.target.getBoundingClientRect();
        visibleHeadings.push({
          element: entry.target,
          ratio: entry.intersectionRatio,
          top: rect.top,
          distance: Math.abs(rect.top - 100) // 距离视口顶部100px的距离
        });
      }
    });

    // 如果有可见的标题，选择最接近视口顶部100px位置的那个
    if (visibleHeadings.length > 0) {
      // 按照距离视口顶部100px的距离排序
      visibleHeadings.sort((a, b) => a.distance - b.distance);
      const newActiveHeading = visibleHeadings[0].element;
      
      if (activeHeading !== newActiveHeading) {
        activeHeading = newActiveHeading;
        updateActiveTocLink(activeHeading.id);
      }
    }
  }, {
    rootMargin: '-50px 0px -60% 0px', // 上边距-50px，下边距-60%
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });

  function updateActiveTocLink(headingId) {
    if (!headingId) return;
    
    // 移除所有活动状态
    tocLinks.forEach(link => link.classList.remove('active'));
    
    // 尝试匹配原始ID和编码的ID
    const encodedId = encodeURIComponent(headingId);
    const activeTocLink = tocWidget.querySelector(
      `a[href="#${headingId}"], .toc-list-link[href="#${headingId}"], ` +
      `a[href="#${encodedId}"], .toc-list-link[href="#${encodedId}"]`
    );
    
    if (activeTocLink) {
      activeTocLink.classList.add('active');
      
      // 确保活动项在目录容器中可见
      const tocContent = tocWidget.querySelector('.toc-content');
      if (tocContent) {
        const linkRect = activeTocLink.getBoundingClientRect();
        const containerRect = tocContent.getBoundingClientRect();
        
        // 检查链接是否在容器的可视范围内
        if (linkRect.top < containerRect.top + 20 || linkRect.bottom > containerRect.bottom - 20) {
          // 计算需要滚动的距离
          const linkOffsetTop = activeTocLink.offsetTop;
          const containerHeight = tocContent.clientHeight;
          const scrollTop = linkOffsetTop - containerHeight / 2 + activeTocLink.offsetHeight / 2;
          
          tocContent.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
          });
        }
      }
    }
  }

  // 观察所有标题元素
  headings.forEach(function(heading) {
    if (heading.id) {
      observer.observe(heading);
    }
  });

  // 平滑滚动到锚点
  tocLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 获取href属性并处理URL编码
      let targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        targetId = targetId.substring(1);
        // 解码URL编码的字符
        targetId = decodeURIComponent(targetId);
      }
      
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        isUserScrolling = true; // 标记为用户主动滚动
        
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // 更新活动状态
        setTimeout(function() {
          updateActiveTocLink(targetId);
          isUserScrolling = false; // 重置标记
        }, 100);
      } else {
        console.log('目标元素未找到:', targetId);
      }
    });
  });

  // 监听滚动事件，用于检测用户主动滚动
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (isUserScrolling) return;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      // 如果没有 Intersection Observer 检测到的活动标题，手动检测
      if (!activeHeading) {
        const scrollTop = window.pageYOffset;
        let currentHeading = null;
        
        headings.forEach(function(heading) {
          const rect = heading.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          if (elementTop <= scrollTop + 120) { // 120px 的缓冲区
            currentHeading = heading;
          }
        });
        
        if (currentHeading && currentHeading !== activeHeading) {
          activeHeading = currentHeading;
          updateActiveTocLink(currentHeading.id);
        }
      }
    }, 100);
  });

  // 初始化 - 检测当前应该激活的标题
  function initializeActiveToc() {
    const scrollTop = window.pageYOffset;
    let currentHeading = null;
    
    headings.forEach(function(heading) {
      const rect = heading.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      
      if (elementTop <= scrollTop + 120) {
        currentHeading = heading;
      }
    });
    
    if (currentHeading) {
      activeHeading = currentHeading;
      updateActiveTocLink(currentHeading.id);
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'complete') {
    initializeActiveToc();
  } else {
    window.addEventListener('load', initializeActiveToc);
  }

  // 处理页面内锚点跳转（例如从其他页面跳转到特定章节）
  if (window.location.hash) {
    setTimeout(function() {
      let targetId = window.location.hash.substring(1);
      // 解码URL编码的字符
      targetId = decodeURIComponent(targetId);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        updateActiveTocLink(targetId);
      }
    }, 500);
  }
});
