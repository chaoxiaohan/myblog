/**
 * 前端搜索功能
 * 实现实时搜索文章标题和标签
 */

class BlogSearch {
  constructor() {
    this.searchIndex = [];
    this.searchInput = null;
    this.searchResults = null;
    this.searchResultsContent = null;
    this.isLoaded = false;
    
    this.init();
  }
  
  async init() {
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.searchResultsContent = document.getElementById('search-results-content');
    
    if (!this.searchInput) return;
    
    // 加载搜索索引
    await this.loadSearchIndex();
    
    // 绑定事件
    this.bindEvents();
  }
  
  async loadSearchIndex() {
    try {
      const response = await fetch('/search.json');
      this.searchIndex = await response.json();
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load search index:', error);
    }
  }
  
  bindEvents() {
    let searchTimer;
    
    // 搜索输入事件
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const query = e.target.value.trim();
      
      if (query.length === 0) {
        this.hideResults();
        return;
      }
      
      searchTimer = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });
    
    // 点击外部隐藏结果
    document.addEventListener('click', (e) => {
      if (!document.getElementById('search-container').contains(e.target)) {
        this.hideResults();
      }
    });
    
    // 输入框获得焦点时显示结果（如果有搜索内容）
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim() && this.searchResultsContent.children.length > 0) {
        this.showResults();
      }
    });
    
    // 键盘导航
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyNavigation(e);
    });
  }
  
  performSearch(query) {
    if (!this.isLoaded) {
      this.showLoading();
      return;
    }
    
    const results = this.search(query);
    this.displayResults(results, query);
  }
  
  search(query) {
    const lowercaseQuery = query.toLowerCase();
    const results = [];
    
    this.searchIndex.forEach(item => {
      let score = 0;
      let matchedText = '';
      
      // 标题匹配 (权重最高)
      if (item.title.toLowerCase().includes(lowercaseQuery)) {
        score += 10;
        matchedText = item.title;
      }
      
      // 标签匹配
      const matchedTags = item.tags.filter(tag => 
        tag.toLowerCase().includes(lowercaseQuery)
      );
      if (matchedTags.length > 0) {
        score += 5 * matchedTags.length;
        matchedText = matchedText || matchedTags.join(', ');
      }
      
      // 分类匹配
      const matchedCategories = item.categories.filter(cat => 
        cat.toLowerCase().includes(lowercaseQuery)
      );
      if (matchedCategories.length > 0) {
        score += 3 * matchedCategories.length;
        matchedText = matchedText || matchedCategories.join(', ');
      }
      
      // 内容匹配 (权重最低)
      if (item.content.toLowerCase().includes(lowercaseQuery)) {
        score += 1;
        matchedText = matchedText || item.content;
      }
      
      if (score > 0) {
        results.push({
          ...item,
          score,
          matchedText: matchedText || item.title
        });
      }
    });
    
    // 按相关性排序
    return results.sort((a, b) => b.score - a.score).slice(0, 8);
  }
  
  displayResults(results, query) {
    this.searchResultsContent.innerHTML = '';
    
    if (results.length === 0) {
      this.showNoResults(query);
      return;
    }
    
    results.forEach(result => {
      const resultElement = this.createResultElement(result, query);
      this.searchResultsContent.appendChild(resultElement);
    });
    
    this.showResults();
  }
  
  createResultElement(result, query) {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.tabIndex = 0;
    
    // 高亮搜索关键词
    const highlightedTitle = this.highlightText(result.title, query);
    const highlightedTags = result.tags.map(tag => 
      this.highlightText(tag, query)
    ).join(', ');
    
    div.innerHTML = `
      <div class="search-result-title">${highlightedTitle}</div>
      <div class="search-result-meta">
        <span class="search-result-date">${result.date}</span>
        ${result.tags.length > 0 ? `<span class="search-result-tags">${highlightedTags}</span>` : ''}
      </div>
      <div class="search-result-excerpt">${result.content}</div>
    `;
    
    div.addEventListener('click', () => {
      window.location.href = result.url;
    });
    
    return div;
  }
  
  highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
  
  showResults() {
    this.searchResults.classList.remove('hidden');
  }
  
  hideResults() {
    this.searchResults.classList.add('hidden');
  }
  
  showLoading() {
    this.searchResultsContent.innerHTML = '<div class="search-loading">正在加载...</div>';
    this.showResults();
  }
  
  showNoResults(query) {
    this.searchResultsContent.innerHTML = `
      <div class="search-no-results">
        没有找到包含 "${query}" 的文章
      </div>
    `;
    this.showResults();
  }
  
  handleKeyNavigation(e) {
    const items = this.searchResultsContent.querySelectorAll('.search-result-item');
    if (items.length === 0) return;
    
    let currentIndex = -1;
    items.forEach((item, index) => {
      if (item.classList.contains('search-result-active')) {
        currentIndex = index;
      }
    });
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        this.setActiveResult(items, currentIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.setActiveResult(items, currentIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0) {
          items[currentIndex].click();
        }
        break;
      case 'Escape':
        this.hideResults();
        this.searchInput.blur();
        break;
    }
  }
  
  setActiveResult(items, index) {
    items.forEach(item => item.classList.remove('search-result-active'));
    if (index >= 0 && index < items.length) {
      items[index].classList.add('search-result-active');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }
}

// 页面加载完成后初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
  new BlogSearch();
});
