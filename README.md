# 不仅代码

## 文章

- [我是如何维权失败的](https://article.mebtte.com/how_do_i_fail_to_protect_my_right)
- [在 React 中使用事件分离状态](https://article.mebtte.com/split_react_state_by_event)
- [CSS 变量](https://article.mebtte.com/css_variable)
- [常见的 WEB 攻击方式](https://article.mebtte.com/familiar_web_attacks)
- [如何处理 RESTFUL 数据异常导致的前端错误](https://article.mebtte.com/handle_restful_api_error)
- [基于 Node.js 的 WebFont 解决方案](https://article.mebtte.com/web_font_solution_by_node)

## 开发

### 目录结构

```
|- articles 存放文章及文章相关数据
|- src 网页模板
|- static 存放静态文件
|- gatsby-*.js gatsby.js配置
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

> 尝试删除 `.cache` / `public` 目录重新运行
