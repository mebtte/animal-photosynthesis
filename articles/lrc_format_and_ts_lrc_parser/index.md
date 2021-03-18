---
title: 'LRC 格式以及如何使用 TypeScript 解析'
publish_time: '0000-00-00'
updates:
hidden: false
---

## LRC 基本格式

LRC 是一种常见的歌词保存格式, 使用文本文件的形式保存.

> LRC 是 lyric 去掉 y 和 i 后的缩写.

> 为了避免乱码, 所以的文本文件都应该使用 utf-8 保存.

在 LRC 文件中, 每一行表示一句歌词, 每一行都遵循一下格式:

```txt
[mm:ss.xx]歌词文本
```

`[ ]` 括号的内容表示歌词进入的时间, 其中 `mm` 表示分钟数, `ss` 表示秒数, `xx` 表示百分之一秒, 例如 `[00:20.43]对慢了 爱人会失去可爱` 表示这句歌词在音乐的 0 分 20 秒 430 毫秒处开始. 同时, 歌词文本可以是空字符串.

通常情况下, 下一句歌词的开始时间就是上一句歌词的结束时间, 例如:

```txt
[00:20.43]对慢了 爱人会失去可爱
[00:27.94]记低 这感慨
[00:33.81]世事变 有没有将你淹盖
```

第一句歌词的开始时间是 0 分 20 秒 430 毫秒, 结束时间是 0 分 27 秒 940 毫秒, 以此类推. 但是, 并不是每句歌词都会和下一句歌词无延迟连接, 这种情况下, 可以插入一行空歌词:

```txt
[01:58.828]拖着梦寐 说着我想说的梦话
[02:02.709]不停摆
[02:05.569]
[02:06.099]寻找明天
[02:07.450]每一辆飞车彻夜向前开
```

例如上面的第 3 行歌词, 本身没有内容, 只是用于分隔第 2 行歌词和第 4 行歌词.

LRC 文件还可以添加一些元数据. 元数据使用 `key -> value` 的形式, key 和 value 使用 `:` 分隔, 每一行表示一对元数据:

```txt
[key:value]
```

常见的元数据有:

| key | description    | example         |
| --- | -------------- | --------------- |
| al  | 专辑           | [al:范特西]     |
| by  | lrc 文件的作者 | [by:mebtte]     |
| ti  | 音乐的标题     | [ti:听妈妈的话] |
| ar  | 歌手           | [ar:周杰伦]     |

当然, 你还可以创造自己的元数据:

```txt
[author: mebtte]
[copyright: mebtte]
```

LRC 格式除了可以用来表示歌词以外, 也可用于视频的**字幕**.

## 使用 TypeScript 解析 LRC

对于 TypeScript 解析 LRC, 我的办法是通过正则, 解析思路是这样的:

## [clrc](https://github.com/mebtte/clrc) 和 [react-lrc](https://www.npmjs.com/package/react-lrc)

基于上面的思路, 封装一个 clrc 的包发布在 [npm](https://www.npmjs.com/package/clrc), 可以通过下面的方法使用:

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

这里还有一个 `clrc` 的 [Playground](https://mebtte.github.io/clrc) .

同时, 在 clrc 的基础上再度封装了 [react-lrc](https://www.npmjs.com/package/react-lrc), 为 react 项目提供了一个展示 LRC 的组件, 同样也有一个 [Playground](https://mebtte.github.io/react-lrc)

### 参考

- [LRC (file format) - Wikipedia](<https://en.wikipedia.org/wiki/LRC_(file_format)>)
