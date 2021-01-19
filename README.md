# Answer

MEBTTE's Writing. [https://article.mebtte.com](https://article.mebtte.com)

## 模板

当前项目通过 [Markdown](https://zh.wikipedia.org/wiki/Markdown) 编写文章, 通过 `Node` 编译 `md` 和 `ejs` 模板生成静态页面, 支持在 `md` 文章中以 `HTML` 的方式插入任何网络资源例如 `audio`/`video`/`iframe`/`...`

如果你喜欢这套主题, 可以通过 `fork` 作为主题模板, 移除原有文章和修改 `scripts/config.js` 下的配置即可.

### 环境要求

- Node.js >= 14.12.0

### 目录

```txt
|- articles # 文章列表
|- scripts
  |- build.js # 构建脚本
  |- config.js # 构建配置
|- src
  |- static # 静态资源
  |- template # 网页模板
```

### 文章目录结构

每篇文章需要遵循以下结构:

```txt
|- id
  |- index.md # 文章内容
  |- ... # 其他文件
```

其中, 目录名作为文章的 `ID`, 在 `md` 中可以通过相对路径引用目录下的其他文件, 例如:

```md
![](./image.png)

<audio src="./music.mp3"></audio>
```

`md` 文件需要补充一些元数据, 支持以下字段:

```ts
interface Frontmatter {
  title: string; // 文章标题
  create: string; // 创建日期, 遵循格式 YYYY-MM-DD
  updates?: {
    // 更新记录
    time: string; // 更新时间, 遵循格式 YYYY-MM-DD
    description: string; // 更新说明
  }[];
  hidden?: boolean; // 文章是否隐藏, 隐藏后不会出现在首页, 但可以通过 url 直接访问
}
```

```md
---
title: '文章标题'
create: '2020-10-01'
updates:
  - time: '2020-10-02'
    description: '更新说明'
  - time: '2020-10-03'
    description: '更新说明'
hidden: false
---

文章内容, 文章内容, 文章内容, 文章内容
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

当前项目支持自动部署到 `Github Pages`, 需要 [Developer settings](https://github.com/settings/tokens) 生成项目的 `access token`, 并在项目的 `Settings -> Secrets` 添加且命名为 `TOKEN`, 以及把构建脚本 `.github/workflows/gh_pages.yml` 中的 `user` 和 `email` 更换成自己的账号和邮箱, 当 `master` 分支发生变更后会自动构建并推送到 `gh-pages` 分支, 将项目的 `Github Pages` 设置为 `gh-pages` 分支即可.

如果不希望在 `Github Pages` 部署, 删除项目下的 `.github` 目录即可.

### 字体

当前项目支持自定义字体, 如果不喜欢当前的字体, 把 `src/static` 下的字体替换以及将构建脚本 `scripts/build.js` 中字体名替换即可

## 版权

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />本作品采用<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议</a>进行许可
