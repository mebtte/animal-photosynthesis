---
title: '基于 Node.js 的 WebFont 解决方案'
create: '2019-03-10'
updates:
  - time: '2020-05-01'
    description: '移除PS'
outdated: 'fontmin项目疑似已停止维护, 请采用其他方案'
hidden: false
---

CSS3 中的`@font-face`提供了自定义字体的功能，可以使网页不局限于用户系统中的字体。
然而理想很丰满，现实很骨感。
像英文这类的语言来说，字体文件包含非常少的字符，所以一个字体文件会非常的小。
我随便下载了几份英文字体

![英文字体大小](./english_font_size.png)

除了一些字库特别丰富的一些字体外，大部分的英文字体文件都是在 100KB 以内。
但是对于中文这类包含非常多字符的语言来说，就没有办法保证字体文件的大小了。
比如汉字，[常用的就有三千多个](https://www.zhihu.com/question/20767273)。

![中文字体大小](./chinese_font_size.png)

下载了几份中文字体，都超过 1MB，一些字库丰富的字体可以超过 10MB。
对于一个几十 KB 或几百 KB 的网页来说，加载几个 MB 的字体文件肯定是不划算的。
又或者在网络差的环境，用户已经浏览完页面了，字体才加载回来，这时候已经没有意义了。

但是，换一个角度想，虽然一个中文字体包含了几千个常用字，但一个网页去掉重复字的情况下，往往只包含数十个到数百个字，那加载一个完整包含数千个字的字体文件是否有必要呢？能不能只加载网页需要的字体？一能减小加字体文件的大小，二能保证字体加载的速度。

## 有字库

对于上面两个问题，[有字库](https://www.webfont.com)是一种解决方案，但是对于我来说存在一些问题

1. 收费，免费套餐使用有限制
2. 字体有限，自定义字体需要上传并审核，对于一些需要紧急上线的项目无法使用

如果不关心以上问题，有字库的方案已经够用了。

---

## fontmin

[fontmin](https://github.com/ecomfe/fontmin) 是 [efe](https://efe.baidu.com/) 开发的一个 npm 包，能够提取字体中需要的字体子集。

![](./fontmin_example.png)

官方的一个例子，从一个包含 7500+ 字 / 4.2MB 的字体中提取了 7 个字，输出子集字体只有 4.5KB。fontmin 提供了`API`和`CLI`的使用方式，具体使用方式请查看[官方介绍](https://github.com/ecomfe/fontmin)

## 场景

设想一个场景，现在我们有一个博客需要用到自定义字体，博客可以从管理后台新增/修改/删除博文，根据我们字体子集的方案，每一篇博文都需要生成一个字体子集文件。
这种方案有一些问题

- 当博文修改的时候，我们需要重新生成字体子集文件。
- 想更换另一种字体，我们需要为所有博文重新生成字体子集文件。

## 接口

为了避免这些繁琐的流程，我们决定基于接口设计一种通用的解决方案。
一个接口接受字体和需要的文字，页面直接调用然后返回字体子集文件。

```
https://example.com/api/font?font=fontName&text=text
// font 表示指定的字体
// text 表示需要的文字
```

以`koa`为例

```js
// generateFont.js
import path from 'path';

import Fontmin from 'fontmin';

const FONTS = ['a', 'b', 'c', 'd']; // 我们只允许a,b,c,d这4种字体
const FONT_DIR = path.join(__dirname, 'font dir'); // 存放原始字体的目录

/**
 * 为了简单展示，这里假设所有字体都是ttf格式
 * fontmin支持多种字体格式
 */
export default async (ctx) => {
  // font 表示指定字体，text 表示提取的文本
  const { font, text } = ctx.query;
  if (!font || !FONTS.includes(font) || !text) {
    ctx.status = 400;
    ctx.body = '参数错误';
    return;
  }

  const fontmin = new Fontmin()
    .src(`${FONT_DIR}/${font}.ttf`)
    .use(Fontmin.glyph({ text }));

  // fontmin没有提供promise的方法调用，这里封装一下
  const content = await new Promise((resolve, reject) => {
    fontmin.run((error, files) => {
      if (error) {
        return reject(error);
      }
      return resolve(files[0].contents);
    });
  });

  ctx.body = content;
};
```

上面的代码好像还少了点东西？
是的，缓存。
比如我们设置`cache-control=max-age`，在一个用户浏览器中确实是缓存了，但是当别的用户访问的时候，接口依然要生成新的字体子集。
所以我们需要在服务端作缓存，改进一下代码。

```js
// generateFont.js
import path from 'path';
import fs from 'fs';
import util from 'util';

import md5 from 'md5';
import Fontmin from 'fontmin';

const FONTS = ['a', 'b', 'c', 'd']; // 我们只允许a,b,c,d这4种字体
const FONT_DIR = path.join(__dirname, 'font dir'); // 存放原始字体的目录
const SUB_FONT_DIR = path.join(__dirname, 'sub font dir'); // 子集字体的目录

// 判断文件是否存在
const access = (filename) =>
  new Promise((resolve) => fs.access(filename, (error) => resolve(!error)));
const writeFile = util.promisify(fs.writeFile);

export default async (ctx) => {
  // font 表示指定字体，text 表示提取的文本
  const { font, text } = ctx.query;
  if (!font || !FONTS.includes(font) || !text) {
    ctx.status = 400;
    ctx.body = '参数错误';
    return;
  }

  /**
   * 对text作md5来标记是否已经缓存
   * 缓存存在返回缓存
   * 缓存不存在创建缓存
   */
  const textMd5 = md5(text);
  const cacheFile = `${SUB_FONT_DIR}/${font}_${md5}.ttf`;
  const exist = await access(cacheFile);
  if (!exist) {
    const fontmin = new Fontmin()
      .src(`${FONT_DIR}/${font}.ttf`)
      .use(Fontmin.glyph({ text }));
    const content = await new Promise((resolve, reject) => {
      fontmin.run((error, files) => {
        if (error) {
          return reject(error);
        }
        return resolve(files[0].contents);
      });
    });
    await writeFile(cacheFile, content);
  }

  ctx.body = fs.createReadStream(cacheFile);
};
```

还有一个问题是关于 `text` 的，比如 `text=abc` / `text=aabc` / `text=cba`，虽然它们都不相等，其实他们返回的都是同一份字体，但接口却计算并缓存了三份，所以需要对 `text` 做一下处理。

```js
// 对text去重以及排序
text = Array.from(new Set(text))
  .sort()
  .join('');
```

![](./font_api.png)

对接口进行了测试，从一个 20MB 字体中请求了 400 个汉字，大小约为 150KB。

## 客户端

在博文页面，我们只需要在页面加载后调用一次接口就可以了。

```js
window.addEventListener('onload', () => {
  const font = 'a'; // 使用的字体
  const text = Array.from(new Set(document.body.textContent))
    .sort()
    .join();
  const style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-family: ${font};
      src: url("https://example.com/api/font?font=${font}&text=${encodeURIComponent(
    text,
  )}");
    }
    html {
      font-family: ${font};
    }
  `;
  document.head.appendChild(style);
});
```

## 动态页面

假设博客添加了评论功能，用户的评论可以在不刷新页面的情况下插入到页面中，那么上面的调用就产生了问题。
比如原博文只包含`这是一篇博客`这几个字，然后一个用户评论了`写的真好`这几个字，因为用户内容跟博文内容没有重合文字，所以用户评论并不会产生自定义字体效果。
这种情况下，我们也需要动态加载字体。

第一种方案就是每新增加一个评论，就跟静态页面一样，重新替换页面的字体。

第二种方案就是对每一个新的评论设置自己的字体

```js
const node = document.querySelector('comment node'); // 新增的评论节点
const font = 'a'; // 使用的字体

// 随机生成字体名称避免冲突
const fontFamily = `${Math.random()}`.replace('0.', 'font_family_');

const text = Array.from(new Set(node.textContent))
  .sort()
  .join();
const style = document.createElement('style');
style.innerHTML = `
  @font-face {
    font-family: ${fontFamily};
    src: url("https://example.com/api/font?font=${font}&text=${encodeURIComponent(
  text,
)}");
  }
`;
document.head.appendChild(style);
node.style.fontFamily = fontFamily;
```
