---
title: 'LRC 格式以及如何使用 TypeScript 解析'
publish_time: '2000-01-01'
updates:
hidden: false
---

## LRC 格式

LRC 是一种常见的歌词保存格式, 使用文本的形式保存.

> LRC 是 lyric 去掉 y 和 i 后的缩写.

> 为了避免乱码, 所以的文本都应该使用 utf-8 保存.

在 LRC 文本中, 每一行表示一句歌词, 每一行都遵循一下格式:

```txt
[mm:ss.xx]歌词文本
```

`[ ]` 括号的内容表示歌词进入的时间, 其中 `mm` 表示分钟数, `ss` 表示秒数, `xx` 表示百分之一秒, 例如 `[00:20.43]对慢了 爱人会失去可爱` 表示这句歌词在音乐的 0 分 20 秒 430 毫秒处开始. 同时, 歌词文本可以是空字符串.

```txt
[01:58.828]拖着梦寐 说着我想说的梦话
[02:02.709]不停摆
[02:05.569]
[02:06.099]寻找明天
[02:07.450]每一辆飞车彻夜向前开
```

例如上面的第 3 行歌词, 表示第 2 行歌词和第 4 行歌词不是连贯的.

LRC 文本还可以添加一些元数据. 元数据使用 `key -> value` 的形式, key 和 value 使用 `:` 分隔, 每一行表示一对元数据:

```txt
[key:value]
```

常见的元数据有:

| key | description    | example         |
| --- | -------------- | --------------- |
| al  | 专辑           | [al:范特西]     |
| by  | lrc 文本的作者 | [by:mebtte]     |
| ti  | 音乐的标题     | [ti:听妈妈的话] |
| ar  | 歌手           | [ar:周杰伦]     |

当然, 你还可以创造自己的元数据:

```txt
[author:mebtte]
[copyright:mebtte]
```

LRC 格式除了可以用来表示歌词以外, 也可用于视频的**字幕**.

## 不同于定义的实现

事实上, 很多厂商没有按照定义保存 LRC 文本.

### 与定义不同的时间标签

在 LRC 中, 时间标签的格式是 `[分:秒:百分之一秒]`, 第三部分是百分之一秒, 范围是 `00-99`. 但在实现上, 一些厂商第三部分是毫秒, 范围是 `000-999`, 甚至有些厂商直接去掉了第三部分, 只有分和秒.

![时间标签最后一部分是毫秒](./invalid_time_tag_1.png)

![时间标签缺少第三部分](./invalid_time_tag_2.png)

### 多重时间标签

有些厂商为了节省储存空间, 将相同歌词的行合并, 导致一行出现多个时间标签:

![一行歌词多个时间标签](./invalid_time_tag_3.png)

所以, 要想实现高兼容性的 LRC 解析器, 就需要考虑到上面的情况.

## 使用 TypeScript 解析 LRC

对于 TypeScript 解析 LRC, 我的办法是通过正则, 解析思路是这样的:

## [clrc](https://github.com/mebtte/clrc) 和 [react-lrc](https://www.npmjs.com/package/react-lrc)

基于上面的思路, 封装一个 [clrc](https://github.com/mebtte/clrc) 的包发布在 [npm](https://www.npmjs.com/package/clrc), 可以通过下面的方法使用:

```bash
npm i --save clrc
```

```ts
import { parse } from 'clrc';

const lrc = `[01:58.828]拖着梦寐 说着我想说的梦话
[02:02.709]不停摆
[02:05.569]
[02:06.099]寻找明天
[02:07.450]每一辆飞车彻夜向前开`;

parse(lrc); // { metadatas, metadata, lyrics, invalidLine }
```

同时还开发了一个 `clrc` 的 [Playground](https://mebtte.github.io/clrc) .

在 clrc 的基础上封装了 [react-lrc](https://github.com/mebtte/react-lrc), 为 react 项目提供了一个展示 LRC 的组件, 同样也有一个 [Playground](https://mebtte.github.io/react-lrc)

### 参考

- [LRC - Wikipedia](<https://en.wikipedia.org/wiki/LRC_(file_format)>)
