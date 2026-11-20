# HTML 独立交付仓库

本仓库用于 HTML 原型和 Agent 平台消费，包含原生 HTML、CSS、JavaScript、静态知识、字体和图库。打开 `index.html` 即可查看，无需安装依赖或构建。

- 当前范围：37 个组件、83 个组件演示入口、1,971 项正式图形资产。
- HTML 交付不包含优惠券和资金管理业务试跑页面。
- 单文件组件示例位于 `examples/`，使用说明见 [README.md](README.md)，Agent 入口见 [SKILL.md](SKILL.md)。
- 原 Vue 2 版本位于 [paylater-design-system](https://github.com/wangchuangrong8-design/paylater-design-system)，两个仓库独立发布。

## 下载与验证

向 Agent 平台上传时，使用本仓库 Releases 中的 `paylater-html-platform.zip`；同名 `.sha256` 文件用于核对下载完整性。该 ZIP 是经过离线验收的白名单交付包。GitHub 的源码 ZIP 另外包含本仓库的发布说明。

`package-manifest.json` 保存交付文件的哈希和大小，`verification/report.json` 保存通过的验证范围，`publication.json` 绑定本次交付包及来源指纹。平台自身的运行环境仍需上传后确认。

## 后续维护

共用视觉规范的维护工作区仍为 `paylater-design-system`，HTML 维护入口为 `packages/ui-html`。需要同步样式或组件时，在该工作区运行 `html:build`、`html:check`、`html:verify` 和 `html:package`，再将通过验证的 HTML 交付文件同步到本仓库并发布新版本。

同步时使用交付文件白名单，保留原生实现、知识与本地资源；不要将维护工具、框架源码、依赖目录、Storybook 或历史截图放入本仓库。改动后的文件不能继续沿用旧的验收结论。
