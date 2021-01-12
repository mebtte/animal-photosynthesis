---
title: '浏览器和 JavaScript 的一些新特性'
create: '2021-01-03'
updates:
hidden: false
---

## MediaSession

#### 兼容性及参考

- [Can I use 传送门](https://caniuse.com/?search=mediaSession)

## CookieStore

回想一下, 平时我们都是怎么操作 cookie 的. 比如想要获取某个 cookie, 因为 `document.cookie` 返回所有 cookie 联合的字符串, 所以必须要手动解析才能获取到某个 cookie 的值.

![from https://medium.com/nmc-techblog/introducing-the-async-cookie-store-api-89cbecf401f](./get_cookie.png)

如果想要添加一个 cookie, 那么需要像下面一样将 cookie 转换成字符串然后赋值给 `document.cookie`.

![from https://medium.com/nmc-techblog/introducing-the-async-cookie-store-api-89cbecf401f](./set_cookie.png)

是不是觉得很奇怪, 明明 `document.cookie` 是所有 cookie 的集合, 但是添加一个 cookie 却是直接给 `document.cookie` 赋值. 还有另一个奇怪的点, 有些时候添加一个 cookie 根本不生效, 但是浏览器并不会给出任何的错误信息, 所以只能在 `setCookie` 之后通过 `getCookie` 判断是否生效.

```js
setCookie('name', 'value', 1);
if (getCookie('name')) {
  console.log('success to setCookie');
} else {
  console.log('fail to setCookie');
}
```

然而, 删除一个 cookie 更奇怪, 我们无法直接删除, 而是让 cookie 过期.

![from https://medium.com/nmc-techblog/introducing-the-async-cookie-store-api-89cbecf401f](./delete_cookie.png)

基于以上的问题推出了新的 CookieStore API.

首先, 在 window 上添加了一个名为 `cookieStore` 的对象, 然后 `cookieStore` 对象上挂载 `get/set/delete` 三个方法分别对应单个 cookie 的 `获取/添加/删除` 操作. 需要注意的是, `get/set/delete` 返回的都是 `Promise`, 所以需要处理异常.

```js
/** 获取一个 cookie */
try {
  // 根据 name 获取
  const cookie = await window.cookieStore.get('name');
  // 获取根据条件获取
  const cookie = await window.cookieStore.get({
    value: 'xxx',
  });
  if (cookie === null) {
    console.log('name is a emtpy cookie');
  } else {
    console.log(cookie);
    /**
     * cookie 包含以下字段
     * { domain, expires, name, path, sameSite, secure, value }
     * 如果某些字段未设置则为 null
     */
  }
} catch (error) {
  // do with error
}
```

```js
/** 添加一个 cookie, 修改一个 cookie 跟之前一样通过覆盖实现 */
try {
  /**
   * 可配置的字段如下
   * { domain, expires, name, path, sameSite, secure, value }
   */
  await window.cookieStore.set({
    name: 'name',
    value: 'value',
    expires: Date.now() + 1000 * 60 * 60 * 24, // 一天后过期
  });
} catch (error) {
  // do with error
}
```

```js
/** 删除一个 cookie */
try {
  await window.cookieStore.delete('name');
} catch (error) {
  // do with error
}
```

同时, cookieStore 还提供了 `getAll` 的方法, 用于获取 cookie 列表.

```js
try {
  // 根据 name 获取, 因为 cookie 可以存在同名的 cookie
  const cookieList = await window.cookieStore.getAll('name');
  // 或者根据条件获取
  const cookieList = await window.cookieStore.getAll({
    value: 'xxx',
  });
  // 如果没有条件, 则返回所有 cookie
  const cookieList = await window.cookieStore.getAll();
  // ...
} catch (error) {
  // do with error
}
```

以前想要监听 cookie 变化, 只能通过定时器定时检查 cookie, 而 `cookieStore` 直接提供了监听 cookie 变化的能力.

```js
cookieStore.addEventlistener('change', (event) => {
  const {
    changed, // 发生变化的 cookie 数组
    deleted, // 删除的 cookie 数组
  } = event;
  // ...
});
```

#### 兼容性及参考

- [Can I use 传送门](https://caniuse.com/?search=cookieStore)
- [Introducing: The Async Cookie Store API](https://medium.com/nmc-techblog/introducing-the-async-cookie-store-api-89cbecf401f)
- [Cookie Store API](https://wicg.github.io/cookie-store)

## Shape Detection

#### 兼容性及参考

- [Can I use 传送门](https://caniuse.com/?search=barcodedetector)
- [Accelerated Shape Detection in Images](https://wicg.github.io/shape-detection-api)

## CSS 颜色方法新的语法

CSS 中提供了 4 个`颜色方法`, 分别是 `rgb` / `rgba` / `hsl` / `hsla`. 以前每个方法的参数都需要用`逗号`分隔, 现在 `rgb` / `hsl` 新的语法可以省略参数中的`逗号`而直接使用`空格`分隔.

```css
color: rgb(1, 2, 3);
/* 等同于 */
color: rgb(1 2 3);

color: hsl(1, 2%, 3%);
/* 等同于 */
color: hsl(1 2% 3%);
```

省略逗号的同时, `rgb` / `hsl` 都支持第 4 个参数, 表示透明度, 从而替换 `rgba` 和 `hsla`.

```css
color: rgba(1, 2, 3, 0.4);
/* 等同于 */
color: rgb(1 2 3 / 0.4);

color: hsla(1, 2%, 3%, 0.4);
/* 等同于 */
color: hsl(1 2% 3% / 0.4);
```

其中, `/` 两侧的空格可有可无.

#### 兼容性及参考

- [Can I use 传送门](https://caniuse.com/mdn-css_types_color_space_separated_functional_notation)
- [No-Comma Color Functions in CSS](https://css-tricks.com/no-comma-color-functions-in-css)

## Top level await

## BigInt
