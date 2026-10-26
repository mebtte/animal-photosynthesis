# 动物的光合作用

<!-- article-list -->

## 依赖 & 初始化

- [Node.js](https://nodejs.org) >= 24（包含 npm）

```sh
npm ci
git config --local core.hooksPath .githooks
```

## 开发 & 构建

构建脚本使用 TypeScript，由 Node.js 直接运行 `.ts` 文件。

```sh
# 生成 README 文章列表（提交前也会自动执行）
npm run generate-readme

# 构建网站到 build/
npm run build

# 构建并在 http://localhost:8000 预览
npm run preview

# 监听指定文章并预览，将 article_id 替换为 articles/ 下的目录名
npm run watch -- --id article_id
```

## 版权

本作品采用知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议进行许可. 要查看该许可协议, 可访问 [https://creativecommons.org/licenses/by/4.0](https://creativecommons.org/licenses/by/4.0)

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>
