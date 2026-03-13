---
title: "使用 Peer Relay 提高 Tailscale 的速度"
publish_time: "2026-03-13"
updates:
hidden: false
---

最近 Tailscale 推出了 Peer Relay [\[1\]](https://tailscale.com/blog/peer-relays-beta) [\[2\]](https://tailscale.com/blog/peer-relays-ga), 当节点间无法直连时, Peer Relay 能够充当隧道加速节点间的连接速度.

在 Peer Relay 之前, 当 Tailnet, 即一个虚拟局域网中, 两个节点无法直连(P2P)时, 会回退到依靠官方 DERP 中继. 但是官方 DERP 服务器数量有限并且拥挤, 最重要的大陆并没有官方 DERP 服务器, 所以只要不是直连, 流量必须要绕海外一圈, 延迟高且速度慢.

当然, 除官方 DERP 外我们可以自建 DERP 服务器, 但是自建 DERP 的门槛有点高, 第一必须公网 IP, 第二必须开放 TCP 端口, 第三需要 TLS 证书, 第四还需要复杂的 ACL 配置, 并且自建 DERP 是不需要鉴权的, 虽然没有安全问题, 但是暴露可能会被第三方滥用.

那 Peer Relay 跟 DERP 有什么不同呢?

1. DERP 作为独立的服务器是不会加入到 Tailnet 的, 而 Peer Relay 是 Tailnet 中的一个节点, 也就是说 Peer Delay 只有自己的 Tailnet 才能用, 不用担心滥用问题.
2. DERP 需要公网 IP, Peer Relay 不需要公网 IP.
3. DERP 使用的是 TCP 协议, Peer Relay 使用的是 UDP 协议.

使用 Peer Relay 也特别简单, 第一步在 access controls 中添加规则:

```json
{
  "grants": [
    {
      "src": ["src"],
      "dst": ["dst"],
      "app": {
        "tailscale.com/cap/relay": []
      }
    }
  ]
}
```

其中 `src` 表示哪些节点可以使用 Peer Relay, 比如 `tag:abc`, `dst` 表示哪些节点可以作为 Peer Relay, 比如 `tag:vps`, `tailscale.com/cap/relay` 用来配置 Peer Relay, 目前没有相关配置项留空即可.

第二步, 在你想要作为中继的节点上运行 `tailscale set --relay-server-port=10000`, 其中 `relay-server-port` 指定端口传输 UDP 流量, 可以设置你想要的端口, 需要注意的是端口必须在防火墙中放行.

这就是配置 Peer Relay 的全部步骤了, 这时候模拟非直连场景 Ping 可以看到从 `DERP-relayed` 变成 `Peer-relayed`, 延迟也大幅下降.

<video src="./peer-relayed.mp4" alt="从 DERP-relayed 变成 Peer-relayed"></video>

更多内容可以参考官方文档 [https://tailscale.com/docs/features/peer-relay](https://tailscale.com/docs/features/peer-relay).
