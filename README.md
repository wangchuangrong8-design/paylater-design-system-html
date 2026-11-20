# HTML 设计资产

打开 `index.html` 查看组件导览、37 个组件的 83 个演示入口和正式图库。HTML 版本不包含优惠券、资金管理业务试跑页面。所有资源在本地，无需安装、构建或联网；原始来源链接仅用于主动核对。

## 制作页面

1. 按 `SKILL.md` 和 `knowledge/index.json` 找规则、选型及组件契约。
2. 页面引入 `lib/paylater.css`、`lib/paylater.js`。使用标准 HTML 标记，不使用框架模板语法。
3. 用 `data-pd` 标记组件，`data-options` 使用合法 JSON，调用 `PaylaterHTML.init(document)`。重复初始化不会重复绑定事件。

```html
<div id="amount" data-pd="Input" data-options='{"label":"Amount","caption":"Whole IDR amounts"}'></div>
<div data-pd="Button">Confirm</div>
<script>
PaylaterHTML.init(document);
document.getElementById('amount').addEventListener('pd:input', function (event) {
  console.log(event.detail.value);
});
PaylaterHTML.get(document.getElementById('amount')).update({error: 'Enter an amount.'});
</script>
```

控制器的 `update(options)` 更新状态；`destroy()` 清理自身，`PaylaterHTML.destroy(root)` 清理整段界面。公开方法逐项见组件契约，不将内部动作作为公开 API。

默认内容可以放在标记内。代码组合使用 `PaylaterHTML.create(name, options, contents)`，返回控制器，可将其 `element` 插入页面。`contents` 按名称接收 DOM 节点、文字或内容函数；函数参数提供表单字段的 id、error、disabled、`described-by` 等上下文。响应式组合的内容函数使用 `PaylaterHTML.part(name, options, contents, listeners)` 返回子控件描述，由父控制器管理更新、表单上下文和销毁；不要在每次内容函数运行时反复创建独立控制器。不使用不受信任的 HTML 字符串。

## 图片与单文件交付

`knowledge/assets.json` 可按 ID、原名、分类、变体及尺寸搜索。`PaylaterHTML.getVisualAsset(id)` 返回 `{id,src,width,height,format}`，未知 ID 报错。13 个历史图标别名保留。图片按原逻辑尺寸展示，不统一压成 24px。小数尺寸使用 `img.style.width = asset.width + "px"` 和对应的 height，避免 HTML 整数宽高属性截断。

本目录中的资源路径用于本地导览。平台最终页面必须是单个 HTML：将所用 CSS、原生脚本、字体及图片内嵌，保留图片字节和逻辑尺寸，包括弹层及错误状态稍后才使用的资源。不要仅复制相对路径到平台预览。仓库维护命令 `html:export` 可准备独立 HTML；交付包里的 `examples/input--playground.html` 和 `examples/bottomsheet--playground.html` 是已内嵌资源的组件示例，可直接打开，不要求平台运行该命令。

图库完整收录，单个页面只携带其依赖。不能用近似图片替换未知 ID。透明原稿和已知缺口保留提示。

## 范围与证据

组件示例仅展示 UI 能力，不提供业务页面或批准金融规则。原仓库的其他目标案例不进入 HTML 交付。

`knowledge/coverage.json` 给出组件、案例和缺失类别。`verification/report.json` 仅在完整验证后随正式包交付，缺失或过期不能声称通过。视觉对照绑定当前基准版本及本次源码，不表示所有设计变体或宿主业务已通过。

维护仓库可用 `npm run html:export -- --input /path/page.html --output /path/page-standalone.html` 内嵌自定义页面；标记和字面量调用会识别依赖。动态组件名与资源 ID 分别用 `--components Button,Input`、`--assets figma-icon-...` 显式声明。未知组件、资源缺失或外部资源会报错。平台本身无需运行此命令，可从已内嵌的案例保留资源区并编辑页面与配置。
