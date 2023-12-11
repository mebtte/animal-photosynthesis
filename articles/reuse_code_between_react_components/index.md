---
title: 'React 组件中复用代码的方式'
publish_time: '2023-12-10'
updates:
hidden: false
---

## Mixin

在 ES6 之前, React 使用 React.createClass 创建组件:

```jsx
const Article = React.createClass({
  getInitialState: function () {
    return {
      content: '',
    };
  },
  componentDidMount: function () {
    document.title = this.props.title;
  },
  onSave: function () {
    // save
  },
  render: function () {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <p>{this.state.content}</p>
        <button onClick={this.onSave}>save</button>
      </div>
    );
  },
});
```

如果组件 A 和 B 都用到了相似的逻辑, 那么我们可以将这部分逻辑抽离成一个 Mixin, 通过 createClass 的 `mixins` 参数创建 A/B 组件:

```jsx
const PrintMixin = {
  print: function () {
    console.log('print ', this.state.name);
  },
};
const ComponentA = React.createClass({
  mixins: [PrintMixin],
  // ...
});
const ComponentB = React.createClass({
  mixins: [PrintMixin],
  // ...
});
```

通过传入 `PrintMixin`, 组件 A/B 都拥有了 `print` 方法. 组件可以接收多个 Mixin, 这样就实现了跨组件的代码复用以及组件的能力拓展.

随着 ES6 的发布, JS 真正拥有了 `class`, 虽然本质依然是原型链, 但是隐藏了原型链晦涩难懂的细节, 特别是通过 `extends` 实现继承. React 也逐渐地从 `createClass` 的方式创建组件迁移到 `ClassComponent`. 虽然 `ClassComponent` 已经没有 `mixins` 选项, 但是本质上 Mixin 是动态添加组件属性, 所以在 `ClassComponent` 也适用:

```jsx
const PrintMixin = function () {
  this.print = function () {
    console.log('print ', this.state.name);
  };
};

class Article extends React.Component {
  constructor(props) {
    super(props);

    // !!!
    PrintMixin.call(this);
    // !!!

    this.state = {
      // ...
    };
  }

  componentDidMount() {
    // ...
  }

  render() {
    // ...
  }
}
```

但是 Mixin 并不是一个好的代码复用模式, 比如存在命名冲突的问题:

```jsx
const PrintMixin = {
  print: function () {
    console.log('print ', this.state.name);
  },
};
const OtherMixin = {
  print: function () {
    console.log('print from other mixin');
  },
};
const ComponentA = React.createClass({
  mixins: [PrintMixin, OtherMixin],
  // ...
});
```

当两个 Mixin 存在同名属性属性时, 后面的 Mixin 会覆盖前面的. 如果是自定义 Mixin 的话可以通过重命名解决, 对于生命周期或者第三方 Mixin 我们就无能为力了. 同时 Mixin 和组件是紧密联系的, 我们修改组件很容易导致 Mixin 异常, 比如 `PrintMixin` 依赖了 `this.state.name`, 如果组件没有 `state.name` 或者重名 `state.name` 为 `state.other` 都会导致无法正常工作.

## High-Order Component, HOC

简单来说, HOC 是一个接收组件为参数并返回新组件的一个函数. HOC 抛弃了 Mixin 修改组件属性的方式, 而是在组件外面包裹一层组件从而实现逻辑复用/功能增强的效果. 实现 HOC 通常来说有两种方法, 反向继承和属性代理.

在反向继承中, 返回的组件不再继承于 `React.Component` 而是继承传入的组件, 从而实现对原组件属性的继承并拓展:

```jsx
function enhance(Component) {
  return class extends Component {
    // ...

    componentDidMount() {
      // do something
      super.componentDidMount();
    }

    inject = () => {
      // ...
    };

    render() {
      return super.render();
    }
  };
}
```

反向继承一般不推荐使用, 首先在 React 中更多推崇的是组合而非是继承, 其次继承中的一些概念比如 `super.render()` 对于新手来说难以理解而且也需要更多的样板代码, 最后 `FunctionComponent` 无法实现继承所以反向继承只适用于 `ClassComponent`. 而属性代理就是一种组合的方式以及同时支持 `ClassComponent`和`FunctionComponent`:

```jsx
function enhance(Component) {
  return class extends React.Component {
    // ...

    componentDidMount() {
      // ...
    }

    doSomething() {}

    render() {
      return <Component {...this.props} newProp="x" />;
    }
  };
}
```

在属性代理中, 传入的组件作为新组件的一个子组件被渲染, 我们可以自定义新组件而无需考虑是否调用传入组件中的方法. 因为 HOC 实际上是劫持了传入组件的渲染, 所以可以任意处置传入组件:

### 劫持 Props

经过 HOC 后, 传入组件的 Props 会先经过外层组件, 所以我们可以对 Props 进行增删查改:

```jsx
function wrap(Component) {
  return class extends React.Component {
    // ...

    doSomething = (event) => {
      this.props.onClick(event);
      // ...
    };

    render() {
      const { x, ...rest } = this.props;
      console.log('prop x: ', x);
      return (
        <Component {...rest} x={x} onClick={this.doSomething} />
      );
    }
  };
}
```

比如 react-redux 中的 `connect` 就是对目标组件的 Props 进行操作:

```js
connect()(MyComponent);
connect(mapState)(MyComponent);
connect(mapState, null, mergeProps, options)(MyComponent);
```

### 条件渲染

传入组件经过封装, 在 HOC 内我们可以通过条件是否渲染传入组件, 在一些需要权限控制的场景下非常有用:

```jsx
function withLogin(Component) {
  return class extends React.Component {
    // ...
    render() {
      const { logined } = this.state;
      return logined ? (
        <Component {...this.props} />
      ) : (
        <div>请先登录</div>
      );
    }
  };
}

const ProfilePage = withLogin(OriginalProfilePage);
const SettingPage = withLogin(OriginalSettingPage);
```

### 组合渲染

和条件渲染一样, HOC 也可以将传入组件和其他组件进行组合渲染或者用其他组件包裹:

```jsx
import Other from 'path/other';
import Title from 'path/title';

function withTitle(Component) {
  return class extends React.Component {
    // ...
    render() {
      return (
        <Other>
          <Title title={this.props.title} />
          <Component {...this.props} />
        </Other>
      );
    }
  };
}
```

## Render Props

无论是 Mixin 还是 HOC, 我们都是给组件拓展功能, 而 Render Props 则是反过来补全组件所缺失的功能. 比如我们有一个需求, 一个列表的每个列表项需要获取容器的宽度进行渲染:

```tsx
import Item from 'path/item';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0 };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver((enties) =>
      this.setState({ width: enties[0].contentRect.width }),
    );
    this.resizeObserver.observe(this.ref.current);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  render() {
    const { width } = this.state;
    return (
      <div ref={this.ref}>
        {this.props.list.map((item) => (
          <Item
            key={item.id}
            containerWidth={width}
            item={item}
          />
        ))}
      </div>
    );
  }
}
```

如果另一个组件 List2 跟 List 相似, 只是列表项从 `Item` 变成了 `Item2`:

```jsx
import Item2 from 'path/item2';

class List2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0 };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver((enties) =>
      this.setState({ width: enties[0].contentRect.width }),
    );
    this.resizeObserver.observe(this.ref.current);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  render() {
    const { width } = this.state;
    return (
      <div ref={this.ref}>
        {this.props.list.map((item) => (
          <Item2
            key={item.id}
            containerWidth={width}
            item={item}
          />
        ))}
      </div>
    );
  }
}
```

可以发现 List 和 List2 逻辑是一致的, 只是渲染有所差别, 我们不妨将渲染方法抽离成 Props, 由调用的地方决定如何渲染:

```jsx
class WidthObserver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0 };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver((enties) =>
      this.setState({ width: enties[0].contentRect.width }),
    );
    this.resizeObserver.observe(this.ref.current);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  render() {
    const { width } = this.state;
    const { renderList } = this.props;
    return <div ref={this.ref}>{renderList(width)}</div>;
  }
}

function List({ list }) {
  return (
    <WidthObserver
      renderList={() =>
        list.map((item) => (
          <Item
            key={item.id}
            containerWidth={width}
            item={item}
          />
        ))
      }
    />
  );
}

function List2({ list }) {
  return (
    <WidthObserver
      renderList={() =>
        list.map((item) => (
          <Item2
            key={item.id}
            containerWidth={width}
            item={item}
          />
        ))
      }
    />
  );
}
```

这就是 Render Props, 组件本身只负责逻辑, 具体的渲染由 Props 决定. 所以 Render Props 本身并没有逻辑复用, 复用的是接收 Render Props 的组件.

本质上接收 Render Props 的组件也可以认为是一种 HOC. 上面的例子中, 我们可以把 `renderList` 的签名 `function renderList(list): ReactNode` 改成 `function renderList({ list }): ReactNode`, 可以看出 `renderList` 本质上是一个 `FunctionComponent`, `WidthObserver` 接收一个组件并返回一个新组件, 这就是 HOC 的定义. 所以任何 Render Props 都可以通过 HOC 实现:

```jsx
function withContainerWidth(Component) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { width: 0 };
      this.ref = React.createRef();
    }

    componentDidMount() {
      this.resizeObserver = new ResizeObserver((enties) =>
        this.setState({ width: enties[0].contentRect.width }),
      );
      this.resizeObserver.observe(this.ref.current);
    }

    componentWillUnmount() {
      this.resizeObserver.disconnect();
    }

    render() {
      const { width } = this.state;
      return (
        <div ref={this.ref}>
          <Component {...this.props} containerWidth={width} />
        </div>
      );
    }
  };
}

function List({ list, containerWidth }) {
  return list.map((item) => (
    <Item
      key={item.id}
      containerWidth={containerWidth}
      item={item}
    />
  ));
}

function List2({ list, containerWidth }) {
  return list.map((item) => (
    <Item2
      key={item.id}
      containerWidth={containerWidth}
      item={item}
    />
  ));
}

const WrappedList = withContainerWidth(List);
const WrappedList2 = withContainerWidth(List2);
```

## Hooks

React 作为一个 UI 库, 其基本范式很简单 `UI=f(state)`, 对比 `ClassComponent` 和 `FunctionComponent` 可以发现 `FunctionComponent` 更符合这个范式. 不过 `UI=f(state)` 这个范式太过于理想, 在现实场景中我们往往需要保留状态以及执行一些副作用, 比如修改页面标题, 所以 `ClassComponent` 才需要各种各样的生命周期. 相较于 `ClassComponent`, `FunctionComponent` 完全缺少状态保留和执行副作用的能力, 所以 `FunctionComponent` 往往也被称为 `Stateless Component`.

`ClassComponent` 虽然能够适用于各种场景, 但是也存在着一些问题:

### 样板代码过多

`ClassComponent` 基于 JS 中的 class, 即使是非常简单的组件也需要一大堆的样板代码, 比如 `extends React.Component`/`constructor`/`各种生命周期方法` 等

### 相关逻辑分散

在 `ClassComponent` 中, 我们往往在 `componentDidMount` 中执行副作用, 在 `componentWillUnmount` 中清除副作用, 执行和清除作用本应是相关逻辑, 但被分散在各个生命周期方法中:

```jsx
class A extends React.Component {
  componentDidMount() {
    window.addEventListener('click', this.onWindowClick);
  }

  // ...

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  onWindowClick() {
    // do something
  }
}
```

相关逻辑分散对于代码阅读难以理解, 重构时更是往往被遗漏.

### HOC 的问题

我们通常使用 React Developer Tools 来辅助开发, 当组件经过 HOC 封装以后, 组件树的深度就会加深一层, 多个 HOC 嵌套往往会形成嵌套地狱的问题. 此外, HOC 还会导致传入组件静态属性的丢失, 我们往往要特殊处理:

```jsx
function enhance(Component) {
  class EnhanceComponent extends React.Component {
    // ...
  }
  EnhanceComponent.displayName = `Enhance(${Component.displayName})`;
  EnhanceComponent.staticMethod = Component.staticMethod;
  return EnhanceComponent;
}
```

此外, HOC 的基本单位都是组件, 而实际开发中我们复用的往往只是一段逻辑, 与组件无关. 因此, React Hooks 正式登场.

这里我们不讨论 Hooks 的[用法](https://react.dev/reference/react/hooks), 只讨论它解决了什么问题和应用场景.

虽然 React 提供了多个 Hooks API, 但是可以统分成两类:

- 保留状态
- 执行副作用

拥有这两项能力, `FunctionComponent` 就能覆盖绝大部分 `ClassComponent` 的场景.

> 即使是 Hooks 加持下的 `FunctionComponent`, 目前仍无法覆盖 `ClassComponent` 中的 `getDerivedStateFromError`/`componentDidCatch` 和 `getSnapshotBeforeUpdate`

上面 `ClassComponent` + HOC 范式中存在的问题, `FunctionComponent` + Hooks 都提供了更好的解决方案.

Hooks 的基本单位可以是组件, 也可以是一段逻辑, 这就避免了嵌套地狱的问题.

样板代码过多的问题, `FunctionComponent` 是一个函数不存在 class 中过度的样板代码, 从某种角度上看, `FunctionComponent` 可以看做是纯函数, 因为内部的副作用已经交由 React 作处理.

相关逻辑分散的问题, 在 Hooks 我们可以把相关逻辑封装在一起, 也可以是自定义 Hooks, 更好地阅读以及修改:

```jsx
function useDocumentClick() {
  useEffect(() => {
    const onDocumentClick = () => {
      // do something
    };
    document.addEventListener('click', onDocumentClick);
    return () =>
      document.removeEventListener('click', onDocumentClick);
  }, []);
}

function Component() {
  // ...
  useDocumentClick();
  // ...
}
```

所以 `FunctionComponent` + Hooks 相对于 `ClassComponent` + HOC 有着更好地阅读性和开发效率.

## Headless Components

最后聊一下最近比较热门的 Headless Components. 所谓 Headless Components 其实就是 Render Props 的一种变体.

对于不同的业务或者不同的项目, 我们的组件往往逻辑是相同的, 但是 UI 却各有特色. 很多 UI 库为了适配不同的设计都会提供更换主题之类的功能, 更换主题更像是换肤, 布局往往是无法修改的.

举个例子, 一个包含输入框和搜索按钮的组件, 不同的 UI 设计往往有不同的选择:

- 输入框在左, 搜索按钮在右
- 输入框在上, 搜索按钮在下
- 搜索按钮在输入框内
- ...

对于提供 UI 的组件库是无法适配上面这么多种情况的. 如果我们在设计组件的时候只考虑逻辑, UI 交由使用者决定如何渲染, 上面的问题就迎刃而解了, 这和 Render Props 的思想是一致的. 当然, 有了 Hooks 之后我们就没有必要用 Render Props 这种以组件为单位的写法了.

```jsx
function useSearch() {
  const [value, setValue] = useState('');
  const onChange = (event) => setValue(event.target.value);
  const onSearch = () => {
    // search
  };
  return { value, onChange, onSearch };
}

function HorizontalSearch() {
  const { value, onChange, onSearch } = useSearch();
  return (
    <div>
      <input value={value} onChange={onChange} />
      <button onClick={onSearch}>Search</button>
    </div>
  );
}

function VerticalSearch() {
  const { value, onChange, onSearch } = useSearch();
  return (
    <div>
      <input value={value} onChange={onChange} />
      <br />
      <button onClick={onSearch}>Search</button>
    </div>
  );
}
```

基于 Headless Components 的设计, 每个业务或者每个项目都能快速地创建 UI 库.

### 参考

- [Mixins Considered Harmful](https://legacy.reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)
- [【React 深入】从 Mixin 到 HOC 再到 Hook](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490057&idx=1&sn=e7a9abb4df2fb7f7baf406dbb20d8313&source=41)
