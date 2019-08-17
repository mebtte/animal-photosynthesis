---
title: '如何处理 RESTFUL 数据异常导致的前端错误'
create: '2019-05-30'
update: ''
outdated: ''
hidden: false
---

最近一段时间监控平台收集了很多 JS 错误，大部分都是`TypeError`

```
Uncaught TypeError: Cannot read property 'xxx' of null
```

经过排查后发现基本都是因为接口数据错误的导致，比如

```json5
// 正常数据
{
  "data": {
    "name": "xxx",
  },
}

// 错误数据
{
  "data": null,
}
```

data 应该是一个对象，如果返回 null 的话访问`data.name`就会产生`TypeError`。
至于接口为什么会返回错误的数据，原因有很多种

- 接口本身 BUG
- 手动修改数据库
- 其他接口 BUG 导致错误地修改了数据
- ...

修复这些错误其实很简单，比如访问`data`之前先判断`data`是否为`null`

```js
data ? data.name : '';
// 在其他的一些语言中有`?.`操作符可以很方便地进行上面的操作
```

但同时也会带来一些问题。

比如`name`是要显示在页面上，`我的名字是xxx，我喜欢唱跳RAP和篮球`，因为缺失了`name`，所以变成了`我的名字是，我喜欢唱跳RAP和篮球`。
这会对用户造成一些困扰。
在一些涉及到交易的场景可能会造成更大的麻烦。

另一个问题是如果接口数据复杂一点的话，为了避免报错你的页面可能会有很多判断的语句

```js
{
  data: {
    user: { name: 'xxx' },
    theme: { color: 'red' },
  },
}

// 访问`user.name`
data ? (data.user ? data.user.name : '') : '';
// 或者
(data && data.user && data.user.name) || '';

// 访问`theme.color`
data ? (data.theme ? data.theme.color : '') : '';
// 或者
(data && data.theme && data.theme.color) || '';
```

对于这类问题，我的观点是**数据异常的页面不应该展示给用户**。所以，应该对接口的数据进行校验。

`npm`上有很多优秀的数据校验包，比如 [ajv](https://www.npmjs.com/package/ajv)，[joi](https://www.npmjs.com/package/@hapi/joi) 这些，以`joi`为例。

统一接口格式

```js
{
  error_code: "错误码，正常为0",
  error_message: "错误信息，正常为''",
  data: "数据",
}
```

封装请求

```js
// request.js
import axios from 'axios'; // 或 window.fetch

const request = async (options) => {
  const response = await axios(options);
  const { error_code: errorCode, error_message: errorMessage, data } = response.data;
  if (errorCode !== 0) {
    throw new Error(`${errorCode}:${errorMessage}`);
  }

  // shcema 表示 joi 对象
  // 验证数据，部分接口可能不需要验证，所以 schema 是可选参数
  if (options.schema) {
    // validate 是 joi 对象自带的方法用于验证数据
    const { error } = schema.validate(data);

    // 数据验证失败
    if (error) {
      // 上报数据格式错误，对于一些简单的数据错误可以及时修改数据库
      reportDataError();
      throw error;
    }
  }

  return data;
};

export default request;
```

以`react`为例，调用请求

```jsx
import React, { useState, useEffect } from 'react';
import Joi from '@hapi/joi';

import request from './path/request';

// schema
const schema = Joi.object().keys({
  user: Joi.object().keys({
    name: Joi.string().required(),
  }),
  theme: Joi.object().keys({
    color: Joi.string().required(),
  }),
});

const Component = () => {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    request({
      method: 'get',
      url: '/user',
      schema,
    }).then(user => {
      setStatus('success');
      setUser(user);
    }).catch(() => setStatus('error'));
  }, []);

  if (status === 'success') {
    // 保证了可以正确地获取变量，渲染过程中不会报错
    return (
      <div style={{ color: data.theme.color }}>
        {data.user.name}
      </duv>
    );
  }
  if (status === 'loading') {
    return <div>loading</div>;
  }
  return <div>error</div>;
};
```

当调用请求的时候，数据格式或数据出错可以显式地抛出错误让组件捕获，可以保证用户看到的页面一定是正确的，否则只会看到错误页面。
可以对请求进一步封装，如果多个组件调用就不需要重复定义`schema`

```js
// getUserInfo.js
import Joi from 'joi';

import request from './path/request';

const schema = Joi.object().keys({
  user: Joi.object().keys({
    name: Joi.string().required(),
  }),
  theme: Joi.object().keys({
    color: Joi.string().required(),
  }),
});

export default () =>
  request({
    method: 'get',
    url: '/user',
    schema,
  });
```

当然，上面只是前端的一种预防方案，最重要应该还是在接口层面保证数据的完整性和正确性。
