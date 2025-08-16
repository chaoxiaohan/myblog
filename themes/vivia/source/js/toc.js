document.addEventListener('DOMContentLoaded', function() {
  const tocWidget = document.querySelector('.toc-widget');
  if (!tocWidget) return;

  const tocLinks = tocWidget.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (!tocLinks.length || !headings.length) return;

  let activeHeading = null;

  // 创建 Intersection Observer 来监听标题元素
  const observer = new IntersectionObserver(function(entries) {
    let visibleHeadings = [];
    
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        visibleHeadings.push({
          element: entry.target,
          ratio: entry.intersectionRatio,
          top: entry.boundingClientRect.top
        });
      }
    });

    // 如果有可见的标题，选择最上面的那个
    if (visibleHeadings.length > 0) {
      // 按照在页面中的位置排序
      visibleHeadings.sort((a, b) => a.top - b.top);
      const newActiveHeading = visibleHeadings[0].element;
      
      if (activeHeading !== newActiveHeading) {
        activeHeading = newActiveHeading;
        updateActiveTocLink(activeHeading.id);
      }
    }
  }, {
    rootMargin: '-10% 0% -50% 0%',
    threshold: [0, 0.1, 0.5, 1]
  });

  function updateActiveTocLink(headingId) {
    // 移除所有活动状态
    tocLinks.forEach(link => link.classList.remove('active'));
    
    // 添加当前活动状态
    const activeTocLink = tocWidget.querySelector(`a[href="#${headingId}"]`);
    if (activeTocLink) {
      activeTocLink.classList.add('active');
      
      // 确保活动项在目录容器中可见
      const tocContent = tocWidget.querySelector('.toc-content');
      if (tocContent) {
        const linkRect = activeTocLink.getBoundingClientRect();
        const containerRect = tocContent.getBoundingClientRect();
        
        // 检查链接是否在容器的可视范围内
        if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
          // 计算需要滚动的距离
          const linkOffsetTop = activeTocLink.offsetTop;
          const containerHeight = tocContent.clientHeight;
          const scrollTop = linkOffsetTop - containerHeight / 2 + activeTocLink.offsetHeight / 2;
          
          tocContent.scrollTo({
            top: scrollTop,
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
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // 更新活动状态
        activeHeading = targetElement;
        updateActiveTocLink(targetId);
        
        // 更新URL但不触发页面跳转
        if (history.pushState) {
          history.pushState(null, null, '#' + targetId);
        }
      }
    });
  });

  // 页面加载时检查URL中的锚点
  if (window.location.hash) {
    setTimeout(function() {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        activeHeading = targetElement;
        updateActiveTocLink(targetElement.id);
      }
    }, 100);
  }

  // 页面滚动时的额外检测（备用方案）
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      let currentHeading = null;
      let minDistance = Infinity;
      
      headings.forEach(function(heading) {
        const rect = heading.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100); // 100px 是偏移量
        
        if (rect.top <= 150 && distance < minDistance) {
          minDistance = distance;
          currentHeading = heading;
        }
      });
      
      if (currentHeading && currentHeading !== activeHeading) {
        activeHeading = currentHeading;
        updateActiveTocLink(currentHeading.id);
      }
    }, 100);
  });
});
