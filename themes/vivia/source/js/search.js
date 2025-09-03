/**
 * 前端搜索功能
 * 实现精确搜索（标题和标签）和模糊搜索（包括所有内容）
 */

class BlogSearch {
  constructor() {
    this.searchIndex = [];
    this.searchInput = null;
    this.searchResults = null;
    this.searchResultsContent = null;
    this.searchModeSelector = null;
    this.isLoaded = false;
    
    this.init();
  }
  
  async init() {
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.searchResultsContent = document.getElementById('search-results-content');
    this.searchModeSelector = document.getElementById('search-mode-selector');
    
    if (!this.searchInput) return;
    
    // 加载搜索索引
    await this.loadSearchIndex();
    
    // 绑定事件
    this.bindEvents();
    
    // 根据搜索模式更新搜索框占位符
    this.updatePlaceholder();
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
    
    // 搜索模式切换事件
    this.searchModeSelector.addEventListener('change', () => {
      this.updatePlaceholder();
      // 如果有搜索内容，重新搜索
      const query = this.searchInput.value.trim();
      if (query) {
        this.performSearch(query);
      }
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
  
  updatePlaceholder() {
    const selectedMode = this.searchModeSelector.value;
    if (selectedMode === 'exact') {
      this.searchInput.placeholder = '精确搜索文章标题和标签...';
    } else {
      this.searchInput.placeholder = '模糊搜索所有内容...';
    }
  }
  
  getSearchMode() {
    return this.searchModeSelector.value;
  }
  
  performSearch(query) {
    if (!this.isLoaded) {
      this.showLoading();
      return;
    }
    
    const searchMode = this.getSearchMode();
    const results = this.search(query, searchMode);
    this.displayResults(results, query, searchMode);
  }
  
  search(query, mode = 'exact') {
    const lowercaseQuery = query.toLowerCase();
    const results = [];
    
    this.searchIndex.forEach(item => {
      let score = 0;
      let matchedText = '';
      let excerpt = item.excerpt;
      
      if (mode === 'exact') {
        // 精确搜索：只搜索标题和标签
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
      } else {
        // 模糊搜索：搜索所有内容
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
        
        // 内容匹配 (权重最低，但在模糊搜索中启用)
        if (item.content.toLowerCase().includes(lowercaseQuery)) {
          score += 1;
          // 在内容中找到匹配的上下文
          const contentMatch = this.findContentMatch(item.content, query);
          if (contentMatch) {
            excerpt = contentMatch;
          }
          matchedText = matchedText || item.title;
        }
      }
      
      if (score > 0) {
        results.push({
          ...item,
          score,
          matchedText: matchedText || item.title,
          excerpt: excerpt
        });
      }
    });
    
    // 按相关性排序
    return results.sort((a, b) => b.score - a.score).slice(0, 8);
  }
  
  findContentMatch(content, query) {
    const lowercaseContent = content.toLowerCase();
    const lowercaseQuery = query.toLowerCase();
    const index = lowercaseContent.indexOf(lowercaseQuery);
    
    if (index === -1) return null;
    
    // 获取匹配词汇的上下文
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    const contextMatch = content.substring(start, end);
    
    return (start > 0 ? '...' : '') + contextMatch + (end < content.length ? '...' : '');
  }
  
  displayResults(results, query, mode) {
    this.searchResultsContent.innerHTML = '';
    
    if (results.length === 0) {
      this.showNoResults(query, mode);
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
      <div class="search-result-excerpt">${this.highlightText(result.excerpt, query)}</div>
    `;
    
    div.addEventListener('click', () => {
      window.location.href = result.url;
    });
    
    return div;
  }
  
  highlightText(text, query) {
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
  
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  
  showNoResults(query, mode) {
    const modeText = mode === 'exact' ? '精确搜索' : '模糊搜索';
    this.searchResultsContent.innerHTML = `
      <div class="search-no-results">
        ${modeText}没有找到包含 "${query}" 的文章
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
