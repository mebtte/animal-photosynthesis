---
title: 'styled-components 与 React Hooks 升级指北'
create: '2020-03-28'
updates:
  - time: '2020-03-31'
    description: '移除部分 styled-components 高级 api 的内容'
outdated: ''
hidden: false
---

## styled-components

在 react 应用中样式使用 css 文件存在几个痛点:

1. 需要额外的样式文件, 比如一个 A 组件往往附带了一个 A.(css|less|scss|styl) 的样式文件, 而且样式与结构和逻辑分离不符合组件化的思想
2. 为了防止样式互相污染, 类似于 BEM 规范命名的 classname 非常冗长, 而且增加打包体积
3. JavaScript 只能通过 classname 或者 style 属性修改样式
4. 样式难以复用
5. 当一个组件被删除时, 它的样式文件不一定同时删除从而成为遗留垃圾文件

css-in-js 可以解决上面这些问题, 在众多的 css-in-js 的方案中这里推荐的是 [styled-components](https://styled-components.com).

> 之所以采用 styled-components 是因为它是 css-in-js 里面用的最多的. 我个人的理解是选用一门技术不是要看这门技术有多高深, 而是看它是不是用的最广泛. 用的最广泛也就是说基本上你遇到过的坑, 别人已经帮你踩过了.

styled-components 有三个常用的 API, `styled`, `css` 和 `keyframes`.

首先是 styled 用于创建标签

```jsx
import React from 'react';

// 引入styled-components
import styled from 'styled-components';

// 比如我们需要一个 div
const Container = styled.div`
  // 样式写在这里, 支持 scss 语法
  font-size: 16px;
  color: red;
`;
// 这里我们可以把 Container 当做普通 div 去使用
const Component = () => (
  <Container
    onClick={() => alert('hello styled!')} // 添加事件
    data-balloon="styled-components" // 添加 dom 属性
  >
    hello styled!
  </Container>
);
```

跟上面一样, 当我们需要 span/button/a/... 这些标签的时候, 也是通过 styled.[tagName]\`样式\` 这种写法.

```jsx
// span
styled.span`
  // 样式
`;

// button
styled.button`
  // 样式
`;

// a
styled.a`
  // 样式
`;

// ...
```

和 css 文件相比, styled-components 可以让样式写在组件里面, 不需要我们额外创建一个样式文件以及写非常冗长的 className, 所以不需要担心 className 相同导致样式污染的问题. 不同于 css 文件方式只能通过修改 className 和 style 属性的方式修改样式, styled-components 可以直接通过 props 修改样式.

比如下面这个例子, 我们可以传递 props 给 styled-components, 然后可以在样式里面插入一个 props 处理方法然后返回需要的样式

<iframe
  src="https://codesandbox.io/embed/hopeful-meitner-5lbw5?fontsize=14&hidenavigation=1&theme=dark"
  title="styled_components_with_props"
></iframe>

题外话, 上面 styled.[tagName]\`样式\` 写法其实是模板字符串一种叫做 `tagged template` 的用法, 比如

```js
const name = 'xxx';

console.log`hello ${name}`;
// 相当于
console.log(['hello', ''], name);
```

所以 styled-components 能够提取里面变量或者方法执行, 对模板字符串这种用法感兴趣的可以了解下.

然后是 `css` 和 `keyframes` , css 用于创建样式片段, keyframes 用于创建动画, 比如

```jsx
import React from 'react';
import Types from 'prop-types';
import styled, { css, keyframes } from 'styled-components';

// 透明度从0到1的动画
const fadeIn = keyframes`
  0% {
    opacity: 0;
  } 100% {
    opacity: 1;
  }
`;

// 文本溢出展示...
const ellipsis = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${({ color }) => color};
`;

// 这时可以将 fadeIn 和 ellipsis 像普通变量一样插入到样式中
const Container = styled.div`
  color: red;
  font-size: 16px;
  animation: ${fadeIn} 1s linear;
  ${ellipsis}
`;
```

通过 css 和 keyframes 可以提取常用的样式片段和动画进行复用.

下面是使用 styled-components 实现一个进度条组件的例子(提示: 这个组件虽然能够正常工作, 但存在隐藏的性能问题, 查看完整的 styled-components [官方文档](https://styled-components.com)应该能找出问题所在)

<iframe
  src="https://codesandbox.io/embed/infinite-class-name-yd3w1?fontsize=14&hidenavigation=1&theme=dark"
  title="infinite-class-name"
></iframe>

styled-components 还可用来修改已有组件的样式, 比如需要在一些公用组件的基础上修改样式或者第三方组件库, 通过 styled-components 我们不需要插入 className 或者 style 属性的方式可以对样式进行修改, 以 antd 作为例子

<iframe
  src="https://codesandbox.io/embed/silly-davinci-9qke3?fontsize=14&hidenavigation=1&theme=dark"
  title="styled-other-component"
></iframe>

因为 styled-components 是通过模板字符串创建样式, 所以编辑器会把样式当做普通字符串处理. 这时需要安装额外的插件, 比如在 vscode 中 [vscode-styled-components](https://github.com/styled-components/vscode-styled-components) 插件可以高亮 styled-components 中的样式以及支持输入提示, 配合 [prettier](https://prettier.io/) 可以做到自动格式化.

![](./highlight_and_format.gif)

其他编辑器的高亮和格式化可以参考[官方文档](https://styled-components.com/docs/tooling#syntax-highlighting).

## react 即将废弃以及新的生命周期方法

在大于 react@16.4 的版本中新增了 `getDerivedStateFromProps` 和 `getSnapshotBeforeUpdate` 两个新的生命周期方法, 同时给出了 `componentWillMount`, `componentWillReceiveProps` 和 `componentWillUpdate` 这三个生命周期方法将被弃用的警告, 以及在 react@17 的版本中这三个生命周期方法将会替换成 `UNSAFE_componentWillMount`, `UNSAFE_componentWillReceiveProps` 和 `UNSAFE_componentWillUpdate`, 在更往后的版本这些生命周期方法还会被删除.

react 的目的是让我们不要再用这三个生命周期方法, 如果需要用到这三个生命周期方法的话, 应该用新的生命周期方法替代, 同时旧代码也应当及时替换掉这三个即将废弃的生命周期方法, 这样做的目的是为了实现 react 的[异步渲染](http://react.html.cn/blog/2018/03/27/update-on-async-rendering.html), 至于如何用新的生命周期方法替换这三个即将废弃的生命周期方法, 可以参看[官方例子](http://react.html.cn/blog/2018/03/27/update-on-async-rendering.html#examples).

除了用新的生命周期方法替换这些即将被废弃的方法, 你还可以尝试用 react hook.

## react hook

在 react@16.8 的版本中推出了 hook, hook 能够使 `function component` 拥有状态和模拟生命周期方法的特性.

在 hook 之前, 先看一下目前 class component 存在的一些问题:

> 相关逻辑分散在不同的生命周期方法, 比如在 componentDidMount 里面设置订阅, 然后在 componentWillUnmount 取消订阅, 当产生修改的时候很容易只修改了一处而忘了另一处的修改, 从而容易产生 bug

> class 中的 this 难以理解, 这也容易导致 bug. 大部分人应该都遇到过忘记将类方法绑定 this 产生的 bug.

> 难以复用状态和逻辑. 许多组件包含相同的状态的逻辑, 但是却拥有多份代码, 当发生修改时容易产生遗漏. 高阶组件能在一定程度上解决这个问题, 但是会导致 render tree 嵌套过深, 例如下图

![](./render_tree.png)

基于上面这些问题 react 推出了 hook.

hook 包含了 `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, `useRef`, `useImperativeHandle`, `useLayoutEffect`, `useDebugValue` 这十个基础 hook 以及由这些基础 hook 组成的自定义 hook. 这里需要注意的是, hook 只能在 function component 里面使用, 不能在 class component 或者普通函数中使用. 下面只介绍几个常用的 hook, 完整 api 可以参考[官方文档](https://reactjs.org/docs/hooks-intro.html).

### useState

`useState` 可以让 function component 拥有状态的特性, useState 接受一个初始值的参数(如果初始值需要计算的话, 可以传入一个初始化方法), 然后返会状态以及变更状态的一个数组, 然后就可以使用这个状态以及更新这个状态.

<iframe
  src="https://codesandbox.io/embed/dry-shape-ymg5s?fontsize=14&hidenavigation=1&theme=dark"
  title="use_state"
></iframe>

可以思考下[为什么 useState 返回一个数组](https://reactjs.org/docs/hooks-state.html#tip-what-do-square-brackets-mean)?

### useEffect

`useEffect` 用于引入含有副作用的操作, 副作用比较难理解, 如果换成可以模拟生命周期方法就容易理解多了.

useEffect 有两个参数, 第一个参数是一个方法, 第二个可选参数是一个可选的依赖项数组, 当数组里面的依赖项发生变化的时候, 第一个方法参数就会被执行. 当不指定依赖项数组时, 则表示每次更新都需要执行第一个方法参数.

```jsx
import React, { useEffect } from 'react';

const Component = ({ count }) => {
  // 模拟 componentDidMount
  useEffect(() => {
    console.log('component did mount');
  }, []); // 不指定依赖项

  // 模拟 componentWillReceiveProps
  useEffect(() => {
    console.log('component will receive props');
  }, [count]); // 依赖 count props

  // 模拟 componentDidUpdate
  useEffect(() => {
    console.log('component did update');
  }); // 没有依赖项

  return <div>...</div>;
};
```

`useEffect` 可以模拟除 `componentDidCatch`, `getSnapshotBeforeUpdate` 和 `getDerivedStateFromError` 以外的所有 class component 生命周期方法.

与生命周期方法不同的是, `useEffect` 可以更方便地检查 props 的变更以及可以将相关逻辑写在一起. 以聊天室作为例子, 当用户进入不同的聊天室的时候, 需要监听不同的聊天服务器, 当退出聊天室的时候需要取消监听聊天服务器, 用 class component 需要这样写

```jsx
import React from 'react';
import Types from 'prop-types';

import chatServer from 'path/chat_server'; // 表示聊天服务

// 聊天室组件
class ChatRoom extends React.PureComponent {
  static propTypes = {
    roomId: Types.number.isRequired, // 聊天室ID
    // other props
  };

  componendDidMount() {
    const { roomId } = this.props;
    chatServer.listen(roomId); // 监听指定房间的聊天服务
  }

  componendDidUpdate(prevProps) {
    const { prevRoomId } = prevProps;
    const { roomId } = this.props;
    // 当切换房间时需要取消监听旧房间的聊天服务, 监听新房间的聊天服务
    if (prevRoomId !== roomId) {
      chatServer.unlisten(prevRoomId);
      chatServer.listen(roomId);
    }
  }

  componentWillUnmount() {
    const { roomId } = this.props;
    chatServer.unlisten(roomId); // 取消监听指定房间的聊天服务
  }

  render() {
    return <div>...</div>;
  }
}
```

在 class 组件中, 我们需要在 `componentDidMount` 监听聊天服务, `componentWillUnmount` 取消监听聊天服务, 同时还需要在 `componentDidUpdate` 检查聊天室 ID 的变化重新设置聊天服务的监听. 通过 `useEffect`, 我们可以省略很多逻辑

```jsx
import React from 'react';
import Types from 'prop-types';

import chatServer from 'path/chat_server'; // 表示聊天服务

// 聊天室组件
const ChatRoom = ({ roomId }) => {
  useEffect(() => {
    chatServer.listen(roomId);
    return () => chatServer.unlisten(roomId);
  }, [roomId]); // 当 roomId 发生变更的时候自动执行里面的方法

  return <div>...</div>;
};
```

需要注意的是, useEffect 里面的方法返回了一个取消监听的方法, 表示 roomId 发生变更之后先执行这个取消监听的方法, 然后再执行新 roomId 的聊天服务监听, 这样做的好处的是能够把订阅和取消订阅两个相关的逻辑写在一起, 不必分散在不同生命周期方法. 同时, 当 ChatRoom 组件被卸载的时候, 取消订阅的方法同样也会被执行, 我们不需要用额外的代码去干预.

### useMemo 和 useCallback

`useMemo` 和 `useCallback` 用于缓存, useMemo 用于缓存变量, useCallback 用于缓存方法, 这两个方法和 useEffect 一样需要指明依赖项, 当依赖项发生变更的时候, 它们的缓存才会更新

```jsx
import React, { useMemo, useCallback } from 'react';

const Component = ({ a, b, c }) => {
  // a 发生变更的时候才会重新计算 double 的值
  const double = useMemo(() => a * 2, [a]);

  // b 发生变更的时候才会生成新的 logB 方法
  const logB = useCallback(() => console.log(b), [b]);

  return <div>...</div>;
};
```

useMemo 和 useCallback 对于一些高频率更新的组件有很好的性能优化效果. 以上面这个组件为例, double 和 logB 都不依赖 c, 所以 c 无论如何变化, double 和 logB 都只会使用缓存.

### 自定义 hook

通过 useState, useEffect 这些基础 hook 的组合可以实现自定义 hook, 这能够抽离一些通用逻辑进行复用. 这里有一个约定, 自定义 hook 需要用 `use` 前缀命名, 这样 eslint 的 [hook 插件](https://www.npmjs.com/package/eslint-plugin-react-hooks)才会去检查里面的语法和依赖.

我们先来看一个例子

```jsx
import React, { useState, useEffect, useEffect } from 'react';

import logger from 'path/logger'; // 日志记录

const Popup = () => {
  // 控制 popup 是否打开
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    logger.log(`popup ${open ? 'open' : 'close'}`); // 记录 popup 打开/关闭日志
  }, [open]);

  // do popup thing

  return <div>popup</div>;
};

const Dialog = () => {
  // 控制 dialog 是否打开
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    logger.log(`dialog ${open ? 'open' : 'close'}`); // 记录 dialog 打开/关闭日志
  }, [open]);

  // do dialog thing

  return <div>dialog</div>;
};
```

上面 popup 和 dialog 组件都有一部分相似的逻辑, 包含了 open 的状态, onOpen 和 onClose 的方法以及记录打开和关闭的日志, 这种情况下就可以把这部分逻辑抽离成一个自定义 hook 进行复用, 假设我们把这个自定义 hook 叫做 `useSwitch`.

```jsx
// use_switch.js
import { useState, useCallback, useEffect } from 'react';

import logger from 'path/logger'; // 日志记录

/**
 * type 表示 popup 还是 dialog
 * 因为需要区别日志记录
 */
export default (type) => {
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    logger.log(`${type} ${open ? 'open' : 'close'}`); // 记录打开/关闭日志
  }, [open, type]); // 这里需要将 type 添加到依赖项

  return {
    open,
    onOpen,
    onClose,
  };
};
```

这样就完成了一个自定义 hook, 可以像其他基础 hook 一样在组件里面使用

```jsx
import React from 'react';

import useSwitch from 'path/use_switch';

const Popup = () => {
  const { open, onOpen, onClose } = useSwitch('popup'); // type = popup
  // do popup thing
  return <div>popup</div>;
};

const Dialog = () => {
  const { open, onOpen, onClose } = useSwitch('dialog'); // type = dialog
  // do dialog thing
  return <div>dialog</div>;
};
```

通过自定义 hook, 达到了公共逻辑复用的效果. 如果一个很复杂的 function component 里面包含很多 hook 的话, 同样也可以将相关的部分提取成自定义 hook

```jsx
const Component = () => {
  useA(); // a 相关 hook
  useB('xxx'); // b 相关 hook
  useC(); // c 相关 hook

  return <div>...</div>;
};
```

目前很多 react 第三方库推出了自定义 hook 的 api, 例如 `react-redux` 新增了 `useSelector` 和 `useDispatch`, 组件不需要通过 `connect` 也能够使用 redux state

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

const Component = () => {
  const user = useSelector((state) => state.user); // 返回 redux 里面的 user
  const dispatch = useDispatch();

  return <div>...</div>;
};

// ...
```

`react-router-dom` 也提供了 `useLocation`, `useHistory` 等多个 api

```jsx
import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

const Component = () => {
  const history = useHistory();
  const location = useLocation();

  // do something

  return <div>...</div>;
};

// ...
```

除了上面这些以外, react 还有其他 6 个基础 hook, 比如 `useReducer` 可以用来实现 redux, 完整 hook 教程建议看[官方文档](https://reactjs.org/docs/hooks-intro.html), 文档写的非常不错.

## 参考

- [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html)
- [React Hooks 入门教程](https://www.ruanyifeng.com/blog/2019/09/react-hooks.html)
