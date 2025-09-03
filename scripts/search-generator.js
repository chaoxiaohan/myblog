/**
 * 搜索索引生成器
 * 为Hexo博客生成搜索索引JSON文件，支持精确搜索和模糊搜索
 */

hexo.extend.generator.register('search', function(locals) {
  const posts = locals.posts.sort('-date');
  const searchIndex = [];
  
  posts.forEach(function(post) {
    if (post.published) {
      const fullContent = stripHTML(post.content);
      const searchItem = {
        title: post.title,
        url: post.permalink,
        date: post.date.format('YYYY-MM-DD'),
        tags: post.tags.map(tag => tag.name),
        categories: post.categories.map(cat => cat.name),
        excerpt: fullContent.substring(0, 200) + (fullContent.length > 200 ? '...' : ''),
        content: fullContent // 保存完整内容用于模糊搜索
      };
      searchIndex.push(searchItem);
    }
  });
  
  return {
    path: 'search.json',
    data: JSON.stringify(searchIndex)
  };
});

// 去除HTML标签的函数
function stripHTML(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
