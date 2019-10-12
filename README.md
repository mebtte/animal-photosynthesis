# NotJustCode

更好的阅读体验请访问[这里](https://article.mebtte.com)

## 文章

- [常见的 WEB 攻击方式](./articles/familiar_web_attacks/index.md)
- [如何处理 RESTFUL 数据异常导致的前端错误](./articles/handle_restful_api_error/index.md)
- [基于 Node.js 的 WebFont 解决方案](./articles/web_font_solution_by_node/index.md)

## 本地运行

### 目录结构

```
|- articles 存放文章及文章相关数据
|- src 网页模板
|- static 存放静态文件
```

### 运行环境

- Node.js
- NPM

### 开发模式

```bash
npm install
npm run dev
# http://localhost:8000
```

### 生产预览模式

```bash
npm run build
npm run serve
# http://localhost:9000
```

## 问题

### `npm run dev` / `npm run build` 出错

> 尝试删除`.cache` / `public`目录重新运行
