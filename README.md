# 答案

Mebtte 写的那些东西. [https://article.mebtte.com](https://article.mebtte.com)

## 开发

### 目录结构

```
|- articles 存放文章及文章相关数据
|- node Node相关API/编译前资源
|- src 网页模板
|- static 存放静态文件
|- gatsby-*.js gatsby.js配置
```

### 运行环境

- Node.js / NPM

### 开发

```bash
npm install
npm run dev
# http://localhost:8000
```

### 预览

```bash
npm run build
npm run serve
# http://localhost:9000
```

## 问题

### `npm run dev` / `npm run build` 出错

> 尝试删除 `.cache` / `public` 目录重新运行
