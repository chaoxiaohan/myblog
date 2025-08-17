/**
 * 搜索索引生成器
 * 为Hexo博客生成搜索索引JSON文件
 */

hexo.extend.generator.register('search', function(locals) {
  const posts = locals.posts.sort('-date');
  const searchIndex = [];
  
  posts.forEach(function(post) {
    if (post.published) {
      const searchItem = {
        title: post.title,
        url: post.permalink,
        date: post.date.format('YYYY-MM-DD'),
        tags: post.tags.map(tag => tag.name),
        categories: post.categories.map(cat => cat.name),
        content: stripHTML(post.content).substring(0, 200) + '...'
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
