# 构建工具

需要 Node.js >= 24, 所有 TypeScript 脚本由 Node.js 直接运行.

```sh
# 默认最多使用 4 个 Worker 线程, 不超过可用 CPU 数量
npm run build

# 指定文章构建的并行度
npm run build -- --concurrency 2

# 显示每篇文章的结果和完整错误信息
npm run build -- --verbose

# 查看参数说明
npm run build -- --help
```

初始化完成后, 公共资源并发准备. 文章通过有上限的线程池构建,
全部完成后生成首页, RSS 和 sitemap. 任一任务失败会停止线程池并以非零状态退出.
默认只输出阶段, 文章进度和最终统计; 重定向输出时禁用动画及颜色.

构建和测试分别运行. 构建产物回归测试读取已有的 `build/`, 不触发构建.

```sh
npm run build
npm test
```
