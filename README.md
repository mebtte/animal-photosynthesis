# Answer

MEBTTE's Writing. [https://article.mebtte.com](https://article.mebtte.com)

## 模板

当前项目通过 [Markdown](https://zh.wikipedia.org/wiki/Markdown) 编写文章, 通过 `Node` 编译 `md` 和 `ejs` 模板生成静态页面, 支持在 `md` 文章中以 `HTML` 的方式插入任何网络资源例如 `audio`/`video`/`iframe`/`...`

如果你喜欢这套主题, 可以通过 `fork` 作为主题模板, 移除原有文章和修改 `scripts/config.js` 下的配置即可.

### 环境要求

- Node.js >= 14.12.0

### 目录说明

```txt
|- articles # 文章列表
|- scripts
  |- build.js # 构建脚本
  |- config.js # 构建配置
|- src
  |- static # 静态资源
  |- template # 网页模板
```

### 构建

```bash
npm install
npm run build # 在 *nix 系统可直接执行 scripts/build.js
```

构建支持以下环境变量:

| 变量        | 说明               | 示例                                                                                   |
| ----------- | ------------------ | -------------------------------------------------------------------------------------- |
| SITE        | 发布域名           | 发布到 https://article.mebtte.com, 则 SITE="https://article.mebtte.com"                |
| PUBLIC_PATH | 发布域名对应的路径 | 发布到 https://mebtte.com/article, 则 SITE="https://mebtte.com" PUBLIC_PATH="/article" |

如果不希望通过环境变量构建, 可以直接修改 `scripts/config.js` 中对应的值. 如果同时配置, 则`环境变量`的优先级**高于** `scripts/config.js`.

### 本地预览

```bash
npm run serve # http://localhost:9000
```

### GitHub Pages

当前项目支持自动部署到 `Github Pages`, 需要 [Developer settings](https://github.com/settings/tokens) 生成项目的 `access token`, 并在项目的 `Settings -> Secrets` 添加且命名为 `TOKEN`, 当 `master` 分支发生变更后会自动构建并推送到 `gh-pages` 分支, 将项目的 `Github Pages` 设置为 `gh-pages` 分支即可.

如果不希望在 `Github Pages` 部署, 删除项目下的 `.github` 目录即可.
