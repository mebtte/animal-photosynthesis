# NotJustCode

更好的阅读体验请访问[这里](https://article.mebtte.com)

## 文章

- [RESTFUL 数据异常导致的前端错误](./articles/handle_restful_api_error/index.md)
- [基于 Node.js 的 WebFont 解决方案](./articles/web_font_solution_by_node/index.md)

## 改错

如果你对文章中的一些表述有更好的意见，欢迎对文章进行修改并提交 PR

## 如何在本地运行

### 运行环境

- Node.js
- NPM

### 文章数据

文章数据位于`articles`，文章数据放置在对应的文章目录下

### 开发模式

```bash
npm install
npm run dev
# 预览地址 http://localhost:8000
```

### 生产预览模式

```bash
npm run build
npm run serve
# 预览地址 http://localhost:9000
```

## 问题

- `npm run dev` / `npm run build` 出错
  > `gatsby`相关问题，尝试删除`.cache` / `public`目录重新执行
