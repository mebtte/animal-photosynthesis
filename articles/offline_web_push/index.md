---
title: '浏览器离线推送的实现'
publish_time: '2022-08-09'
updates:
hidden: false
---

实现浏览器离线推送, 主要涉及到三个 [Web API](https://developer.mozilla.org/zh-CN/docs/Web/API):

- [Notification](https://developer.mozilla.org/zh-CN/docs/Web/API/notification)
- [Push API](https://developer.mozilla.org/zh-CN/docs/Web/API/Push_API)
- [Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

## Notification

Notification API 用于展示通知, 通知是系统级别的, 所以

<a href="./notification.html">DEMO</a>
