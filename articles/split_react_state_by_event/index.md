---
title: '在 React 中使用事件分离状态'
create: '2020-01-15'
update: '2020-01-16'
outdated: ''
hidden: false
---

最近在 React 项目遇到了一个问题, Web App 有一个登录弹窗, 在没有登录的情况下进行一些需要用户信息的操作, 首先会弹出登录弹窗.

然而这种操作分布在各个组件, 所以在 redux 保留一个变量 `loginDialogVisible`, 通过 `action` 控制登录弹窗是否展示.

```js
// reducer
import TYPE from 'path/type';

export const showLoginDialog = () => ({
  type: TYPE.SHOW_LOGIN_DIALOG,
});

export const hideLoginDialog = () => ({
  type: TYPE.HIDE_LOGIN_DIALOG,
});

const initialState = {
  // ...
  loginDialogVisible: false,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    // ...
    case TYPE.SHOW_LOGIN_DIALOG:
      return {
        ...state,
        loginDialogVisible: true,
      };
    case TYPE.HIDE_LOGIN_DIALOG:
      return {
        ...state,
        loginDialogVisible: false,
      };
    // ...
  }
};
```

```jsx
// 登录弹窗
import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

const LoginDialog = () => {
  const visible = useSelector((state) => state.loginDialogVisible, shallowEqual);
  // ...

  return visible && <div>...</div>;
};

export default LoginDialog;
```

```jsx
// 需要弹出登录弹窗的组件
import React from 'react';
import { useDispatch } from 'react-redux';

import { showLoginDialog } from 'path/reducer';

const Component = () => {
  const dispatch = useDispatch();
  const onShowLoginDialog = () => dispatch(showLoginDialog());

  return (
    <button type="button" onClick={onShowLoginDialog}>
      show login dialog
    </button>
  );
};

export default Component;
```

随着功能的迭代, 需要弹出登录弹窗的组件越来越多, 所以下面的代码会重复出现.

```js
import { useDispatch } from 'react-redux';

import { showLoginDialog } from 'path/reducer';

// ...
const dispatch = useDispatch();
const onShowLoginDialog = () => dispatch(showLoginDialog());
// ...
```

为了减少重复代码, 可以提取成一个自定义 `hooks`.

```js
// useShowLoginDialog.js
import { useDispatch, useCallback } from 'react-redux';

import { showLoginDialog } from 'path/reducer';

export default () => {
  const dispatch = useDispatch();
  const onShowLoginDialog = useCallback(() => dispatch(showLoginDialog()), [dispatch]);
  return onShowLoginDialog;
};
```

在需要弹出弹窗的组件移除重复的代码.

```jsx
import React from 'react';

import useShowLoginDialog from 'path/useShowLoginDialog';

const Component = () => {
  const onShowLoginDialog = useShowLoginDialog();

  return (
    <button type="button" onClick={onShowLoginDialog}>
      show login dialog
    </button>
  );
};

export default Component;
```

虽然上面的解决方案已经挺好, 但有一个问题, `loginDialogVisible` 这个状态有且只有 `LoginDialog` 使用, 应属于 `LoginDialog` 的 `局部状态`, 没有必要放在 `redux` 影响全局状态, 放在 `redux` 的目的只是为了其他组件能够控制这个状态.

怎么使 `loginDialogVisible` 成为 `LoginDialog` 的局部状态, 并且能在其他组件控制这个状态?

答案就是通过 `事件`.

首先实现一个全局事件触发器, 当然, 也可以选用一些非常受欢迎的库, 比如 [eventemitter3](https://www.npmjs.com/package/eventemitter3).

为了重复造轮子(其实是为了减小包体积), 下面以自定义全局事件触发器为例, 原理是利用浏览器自身的 `CustomEvent` 接口.

```js
// eventemitter.js

// 自定义事件类型
export const TYPE = {
  SHOW_LOGIN_DIALOG: 'show_login_dialog',
};

export default {
  on: (type, listener) => document.addEventListener(type, listener),
  off: (type, listener) => document.removeEventListener(type, listener),
  /**
   * payload就是在触发事件的同时携带数据
   * 但是在登录弹窗这个例子里没有用到
   * 通过event.detail可以获取到payload
   */
  emit: (type, payload) =>
    document.dispatchEvent(
      new CustomEvent(type, {
        detail: payload,
        bubbles: false,
        cancelable: false,
      }),
    ),
};
```

```jsx
// 登录弹窗
import React, { useState, useEffect } from 'react';

import eventemitter, { TYPE } from 'path/eventemitter';

const LoginDialog = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const listener = () => setVisible(true);
    eventemitter.on(TYPE.SHOW_LOGIN_DIALOG, listener);
    return () => eventemitter.off(TYPE.SHOW_LOGIN_DIALOG, listener);
  }, []);

  return visible && <div>...</div>;
};

export default LoginDialog;
```

```jsx
// 触发弹窗的组件
import React, { useCallback } from 'react';

import eventemitter, { TYPE } from 'path/eventemitter';

const Component = () => {
  const onShowLoginDialog = useCallback(() => eventemitter.emit(TYPE.SHOW_LOGIN_DIALOG), []);

  return (
    <button type="button" onClick={onShowLoginDialog}>
      show login dialog
    </button>
  );
};

export default Component;
```

这样, 使 `loginDialogVisible` 成为 `LoginDialog` 的局部状态, 其他组件依然能够控制 `loginDialogVisible`, 并且完全脱离了 `redux` 的依赖.

通过事件机制, 可以很大程度上分离 `react` 中的状态, 不仅可以分离全局状态, 而且可以提升 React 性能.

```jsx
import React, { useState } from 'react';

import Increase from 'path/increase';
import Decrease from 'path/decrease';
import Display from 'path/display';

const App = () => {
  const [count, setCount] = useState(0);
  const onIncrease = () => setCount((c) => c + 1);
  const onDecrease = () => setCount((c) => c - 1);

  return (
    <div>
      <Display count={count} />
      <Increase onIncrease={onIncrease} />
      <Decrease onDecrease={onDecrease} />
    </div>
  );
};
```

上面点击 `Increase` 组件使 `count + 1`, 点击 `Decrease` 组件使 `count - 1`, `Display` 组件负责展示 `count`.

因为状态 `count` 属于根组件, 所以无论点击 `Increase` 或者 `Decrease` 组件导致的变更, 三个子组件都会重新执行各自的 `render` 方法. 然而实际上无论 `count` 怎么变, 我们都知道 `Increase` 和 `Decrease` 的 `render` 结果都不会变, 所以重新执行 `render` 是没有必要的, 唯一需要更新的只有 `Display` 组件.

当然, 通过 React 自带的一些工具方法可以达到性能优化的目的.

```jsx
import React, { useCallback, useMemo } from 'react';

// ...
const onIncrease = useCallback(() => setCount((c) => c + 1), []);
const onDecrease = useCallback(() => setCount((c) => c - 1), []);
return (
  <div>
    <Display count={count} />
    {useMemo(
      () => (
        <Increase onIncrease={onIncrease} />
      ),
      [onIncrease],
    )}
    {useMemo(
      () => (
        <Decrease onIncrease={onIncrease} />
      ),
      [onDecrease],
    )}
  </div>
);
```

通过 `useCallback` 能够保证 `onIncrease` 和 `onDecrease` 在组件存活周期内不变, 而通过 `useMemo` 可以缓存 `Increase` 和 `Decrease` 的渲染结果, 但是 `useCallback` 和 `useMemo` 依然要消耗性能.

通过事件机制, 可以更简单地实现性能优化.

`Increase` 和 `Decrease` 组件保持不变, 将状态 `count` 放到 `Display` 中, 通过事件传递 `count` 的变更.

```jsx
// app.js
import React, { useState } from 'react';

import eventemitter from 'path/eventemitter';

import Increase from 'path/increase';
import Decrease from 'path/decrease';
import Display from 'path/display';

const App = () => {
  const onIncrease = () => eventemitter.emit(TYPE.INCREASE);
  const onDecrease = () => eventemitter.emit(TYPE.DECREASE);

  return (
    <div>
      <Display />
      <Increase onIncrease={onIncrease} />
      <Decrease onDecrease={onDecrease} />
    </div>
  );
};
```

```jsx
// display.js
import React, { useState, useEffect } from 'react';

import eventemitter from 'path/eventemitter';

const Display = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increaseListener = () => setCount((c) => c + 1);
    const decreaseListener = () => setCount((c) => c - 1);
    eventemitter.on(TYPE.INCREASE, increaseListener);
    eventemitter.on(TYPE.DECREASE, decreaseListener);
    return () => {
      eventemitter.off(TYPE.INCREASE, increaseListener);
      eventemitter.off(TYPE.DECREASE, decreaseListener);
    };
  }, []);

  return <div>{count}</div>;
};

export default Display;
```

这样, 无论 `count` 怎么发生变更, 只会 `rerender` Display 组件. 当然, 为了节省内存, 可以合并 `INCREASE` 和 `DECREASE`, 通过 `eventemitter` 的 `payload` 表示增加还是减少.

```js
// app.js
const onIncrease = () => eventemitter.emit(TYPE.COUNT_CHANGE, 1);
const onDecrease = () => eventemitter.emit(TYPE.COUNT_CHANGE, -1);

// display.js
useEffect(() => {
  const listener = (event) => setCount((c) => c + event.detail);
  eventemitter.on(TYPE.COUNT_CHANGE, listener);
  return () => eventemitter.off(TYPE.COUNT_CHANGE, listener);
}, []);
```

最后, 要记得移除事件监听器.
