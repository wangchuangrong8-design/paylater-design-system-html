(function () {
  const catalog = window.PaylaterCatalog
  const api = window.PaylaterHTML
  const nav = document.getElementById('navigation')
  const intro = document.getElementById('intro')
  const preview = document.getElementById('preview')
  const controls = document.getElementById('controls')
  const controlsContainer = document.getElementById('controls-container')
  const componentSearch = document.getElementById('component-search')
  const escape = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const paragraphs = (heading, values) => `<h3>${heading}</h3>${(values || []).map((value) => `<p>${escape(typeof value === 'string' ? value : JSON.stringify(value))}</p>`).join('')}`
  const demoName = (name) => ({ Playground:'交互预览',Examples:'状态与示例',States:'状态',Variants:'变体',HelperAndCounter:'辅助信息',Selection:'选择组',NestedOverlays:'嵌套弹层',ActionCounts:'操作数量',LongContent:'长内容',AsyncValidation:'异步校验',SizesAndIcons:'尺寸与图标',Sticky:'固定底部',BlurInteractions:'失焦与关闭回归' }[name] || name)
  let current
  function navigation(query = '') {
    const lower = query.toLowerCase()
    nav.innerHTML = '<a href="#overview">使用说明与覆盖范围</a><a href="#foundations">基础规范</a><a href="#selection">组件选型</a><a href="#icons">图标图库</a><a href="#illustrations">插画图库</a>' + catalog.contracts.filter((entry) => !lower || (entry.name + entry.purpose).toLowerCase().includes(lower)).map((entry) => `<details${entry.examples.includes(location.hash.slice(1)) ? ' open' : ''}><summary>${escape(entry.name)}</summary>${entry.examples.map((id) => `<a href="#${id}" title="${id}">${escape(demoName(catalog.stories.find((story) => story.id === id).name))}</a>`).join('')}</details>`).join('')
    nav.querySelectorAll('a').forEach((a) => { if (a.hash === location.hash) a.setAttribute('aria-current', 'page') })
  }
  function showControls(story) {
    const contract = catalog.contracts.find((entry) => entry.name === story.component)
    const args = { ...story.args }
    controls.replaceChildren()
    const entries = new Map((story.configurable || []).map((key) => [key, args[key] === undefined ? ((contract && contract.options.find((option) => option.name === key)) || {}).default?.value : args[key]]))
    controlsContainer.hidden = !entries.size
    for (const [key, value] of entries) {
      if (key.startsWith('on')) continue
      const option = contract && contract.options.find((option) => option.name === key)
      const spec = { ...(option && option.allowed ? { options:option.allowed } : {}), ...(story.controls[key] || {}) }
      const isBoolean = typeof value === 'boolean' || option && option.types.includes('Boolean')
      const isNumber = typeof value === 'number' || option && option.types.includes('Number') && !option.types.includes('String')
      const label = document.createElement('label'); label.append(document.createTextNode(key))
      const field = document.createElement(spec.options ? 'select' : typeof value === 'object' && value !== null ? 'textarea' : 'input')
      if (spec.options) spec.options.forEach((option) => { const element = document.createElement('option'); element.textContent = String(option); element.value = String(option); field.append(element) })
      else field.type = isBoolean ? 'checkbox' : isNumber ? 'number' : 'text'
      if (field.type === 'checkbox') field.checked = value
      else field.value = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
      field.name = key
      field.addEventListener('change', () => {
        try {
          const next = field.type === 'checkbox' ? field.checked : isNumber ? Number(field.value) : typeof value === 'object' && value !== null ? JSON.parse(field.value) : field.value
          current.update({ [key]: next }); field.setCustomValidity('')
        } catch (error) { field.setCustomValidity(error.message); field.reportValidity() }
      })
      label.append(field); controls.append(label)
    }
  }
  function assets(type) {
    let page = 0; const size = 20
    preview.innerHTML = `<div class="asset-filters"><label>搜索名称或 ID<input type="search" name="asset-query"></label><label>分类<select name="asset-category"><option value="">全部</option></select></label><label>变体<select name="asset-variant"><option value="">全部</option></select></label><label>尺寸<select name="asset-size"><option value="">全部</option></select></label></div><div class="asset-grid"></div><div class="html-pagination"><button type="button" data-page="previous">上一页</button><span role="status"></span><button type="button" data-page="next">下一页</button></div>`
    const entries = catalog.assets.filter((asset) => asset.type === type)
    const query = preview.querySelector('[name="asset-query"]'); const category = preview.querySelector('[name="asset-category"]'); const variant = preview.querySelector('[name="asset-variant"]'); const dimension = preview.querySelector('[name="asset-size"]')
    const variantText = (asset) => Object.entries(asset.variantProperties || asset.variants || {}).map(([key, value]) => key + '=' + value).join(', ')
    const categoryText = (asset) => typeof asset.category === 'object' ? JSON.stringify(asset.category) : asset.category || ''
    for (const [select, values] of [[category, entries.map(categoryText)], [variant, entries.map(variantText)], [dimension, entries.map((asset) => asset.width + ' × ' + asset.height)]]) [...new Set(values)].sort().forEach((value) => { if (value) { const option = document.createElement('option'); option.value = value; option.textContent = value; select.append(option) } })
    let matched = []
    function draw() {
      const term = query.value.trim().toLowerCase()
      matched = entries.filter((entry) => (!term || JSON.stringify(entry).toLowerCase().includes(term)) && (!category.value || categoryText(entry) === category.value) && (!variant.value || variantText(entry) === variant.value) && (!dimension.value || entry.width + ' × ' + entry.height === dimension.value))
      page = Math.min(page, Math.max(0, Math.ceil(matched.length / size) - 1))
      preview.querySelector('.asset-grid').innerHTML = matched.slice(page * size, (page + 1) * size).map((entry) => `<article class="asset-cell"><figure><img loading="lazy" src="${escape(entry.src)}" width="${entry.width}" height="${entry.height}" alt="${escape(entry.name)}" data-asset-id="${entry.id}"></figure><strong>${escape(entry.groupName || entry.name)}</strong><p>${escape(entry.name)}</p><p>${escape(categoryText(entry))} · ${escape(variantText(entry))}</p><code>${entry.id}</code><p>${entry.width} × ${entry.height} · ${entry.format}</p>${entry.usageWarning ? `<p role="note">${escape(entry.usageWarning)}</p>` : ''}<button type="button" data-copy="${entry.id}">复制 ID</button> <button type="button" data-code="${entry.id}">复制用法</button><p><a href="${escape(entry.src)}" target="_blank" rel="noreferrer">查看原始导出图</a></p><p><a href="https://www.figma.com/design/UYIpU2RqNhptJmOT7bUJe8?node-id=${escape((entry.nodeId || '').replace(':', '-'))}" target="_blank" rel="noreferrer">设计来源</a></p></article>`).join('')
      preview.querySelector('[role="status"]').textContent = `${matched.length} 个条目 · ${page + 1} / ${Math.max(1, Math.ceil(matched.length / size))}`
      preview.querySelector('[data-page="previous"]').disabled = page === 0
      preview.querySelector('[data-page="next"]').disabled = (page + 1) * size >= matched.length
      preview.querySelectorAll('[data-copy],[data-code]').forEach((button) => button.addEventListener('click', async () => {
        const id = button.dataset.copy || button.dataset.code
        const entry = catalog.assets.find((entry) => entry.id === id)
        const code = entry.type === 'icon' ? `<div data-pd="Icon" data-options='${JSON.stringify({ name:id, label:entry.groupName || entry.name }).replace(/'/g, '&#39;')}'></div>\nPaylaterHTML.init(document);` : `const image = PaylaterHTML.getVisualAsset('${id}');\nconst img = document.createElement('img');\nimg.src = image.src; img.style.width = image.width + 'px'; img.style.height = image.height + 'px';\nimg.alt = ${JSON.stringify(entry.name)}; // 将 img 插入目标容器；单 HTML 发布前内嵌资源`
        const value = button.dataset.code ? code : id
        try { await navigator.clipboard.writeText(value); button.textContent = '已复制' } catch (_) { const field = document.createElement('textarea'); field.value = value; button.after(field); field.select(); document.execCommand('copy'); field.remove(); button.textContent = '已复制' }
      }))
    }
    ;[query, category, variant, dimension].forEach((field) => field.addEventListener('input', () => { page = 0; draw() }))
    preview.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => { page += button.dataset.page === 'next' ? 1 : -1; draw() }))
    draw()
  }
  function route() {
    const id = new URLSearchParams(location.search).get('demo') || location.hash.slice(1) || 'overview'
    const bare = new URLSearchParams(location.search).get('bare') === '1'
    document.body.classList.toggle('html-bare', bare)
    if (bare) [document.querySelector('.html-header'), nav, intro, controlsContainer].forEach((element) => { if(element) element.remove() })
    api.destroy(preview); preview.replaceChildren(); controls.replaceChildren(); intro.replaceChildren(); current = null
    controlsContainer.hidden = true
    const story = catalog.stories.find((entry) => entry.id === id)
    if (story) {
      const entry = catalog.contracts.find((entry) => entry.name === story.component)
      intro.innerHTML = `<h1>${escape((story.component ? story.component+' · ' : '') + demoName(story.name))}</h1><p><span class="status-label">${escape(entry ? entry.originLabel || entry.origin : '交互回归夹具')}</span> ${escape(entry ? entry.purpose : '用于检查失焦、关闭和取消行为。')}</p>`
      current = api.showDemo(id, preview, story.args); showControls(story)
    } else if (id === 'icons' || id === 'illustrations') {
      intro.innerHTML = `<h1>${id === 'icons' ? '图标图库' : '插画图库'}</h1><p>保留原名、变体与逻辑尺寸。原尺寸大于卡片时可滚动查看；无匹配不会替换资源。</p>`; assets(id === 'icons' ? 'icon' : 'illustration')
    } else if (id === 'selection') {
      intro.innerHTML = '<h1>组件选型指南</h1><p>已有约束、项目 UI 约定与草稿分别标注；页面观察不建立新旧组件映射。</p>'
      preview.innerHTML = '<div class="asset-filters"><label>名称<input id="selection-query" type="search"></label><label>场景<select id="selection-surface"><option value="">全部</option></select></label><label>状态<select id="selection-status"><option value="">全部</option><option>approved</option><option>draft</option></select></label></div><div id="selection-entries"></div>'
      const surface = preview.querySelector('#selection-surface'); [...new Set(catalog.selection.components.flatMap((entry) => entry.scope))].forEach((value) => { const option = document.createElement('option'); option.value = option.textContent = value; surface.append(option) })
      function draw() {
        const query = preview.querySelector('#selection-query').value.toLowerCase(); const status = preview.querySelector('#selection-status').value
        preview.querySelector('#selection-entries').innerHTML = [...catalog.selection.groups, ...catalog.selection.components].filter((entry) => (!query || (entry.title + (entry.component || entry.components.join(','))).toLowerCase().includes(query)) && (!status || status === entry.status) && (!surface.value || (entry.scope || []).includes(surface.value))).map((entry) => `<article class="selection-entry"><h2>${escape(entry.title)} <span class="status-label">${escape(entry.status)}</span></h2><p>${escape(entry.component || entry.components.join('、'))}</p>${entry.comparisons ? paragraphs('比较条件与理由', entry.comparisons.map((item) => item.when + '：' + item.reason)) : paragraphs('适用条件', entry.useWhen) + paragraphs('不适用', entry.avoidWhen) + paragraphs('相近组件差异', entry.differences.map((item) => item.component + '：' + item.reason)) + paragraphs('组合限制', entry.composition) + paragraphs('例子', [entry.goodExample, entry.badExample])}</article>`).join('')
      }
      preview.querySelectorAll('input,select').forEach((field) => field.addEventListener('input', draw)); draw()
    } else if (id === 'foundations') {
      intro.innerHTML = '<h1>基础规范与设计规则</h1>'
      const rules = Array.isArray(catalog.rules) ? catalog.rules : catalog.rules.rules || []
      const f = catalog.foundations
      const cards = (values, render) => '<div class="foundation-grid">' + values.map(render).join('') + '</div>'
      preview.innerHTML = '<div class="html-overview"><p>56 个颜色、26 种文字样式、10 个间距、7 个圆角、4 个阴影；共 103 条本地定义。用途与冲突按规范表及已确认规则处理。</p><h2>颜色</h2>' + cards(f.colors, entry => `<article class="asset-cell"><div class="foundation-sample" style="background:var(--paylater-color-${escape(entry.name)})"></div><strong>${escape(entry.name)}</strong><p>${escape(entry.value)}</p><p>${escape(entry.usage)} · ${escape(entry.description)}</p></article>`) + '<h2>字体</h2>' + cards(f.typography, entry => `<article class="asset-cell"><strong>${escape(entry.name)}</strong><p>${entry.fontSize} / ${entry.lineHeight} · ${entry.fontWeight}</p><p data-typography="${entry.key}" style="font-family:var(--paylater-typography-${entry.key}-font-family);font-size:var(--paylater-typography-${entry.key}-font-size);line-height:var(--paylater-typography-${entry.key}-line-height);font-weight:var(--paylater-typography-${entry.key}-font-weight);letter-spacing:var(--paylater-typography-${entry.key}-letter-spacing);text-decoration:var(--paylater-typography-${entry.key}-text-decoration)">Sphinx of black quartz, judge my vow</p></article>`) + '<h2>间距</h2>' + cards(f.spacing, entry => `<article class="asset-cell"><p>${entry.name} · ${entry.value}px</p><div class="foundation-bar" style="width:var(--paylater-spacing-${entry.name})"></div></article>`) + '<h2>圆角</h2>' + cards(f.radius, entry => `<article class="asset-cell"><p>${entry.name} · ${entry.value}px</p><div class="foundation-sample" style="border-radius:var(--paylater-radius-${entry.name})"></div></article>`) + '<h2>阴影</h2>' + cards(f.shadows, entry => `<article class="asset-cell"><p>${entry.name} · ${escape(entry.usage)}</p><div class="foundation-sample" style="box-shadow:var(--paylater-shadow-${entry.name})"></div></article>`) + '<h2>设计意图与状态</h2>' + rules.map((rule) => `<article><h3>${escape(rule.id)} <span class="status-label">${escape(rule.status)}</span></h3><p>${escape(rule.when)}</p>${paragraphs('决策', rule.decision)}<p>${escape(rule.rationale)}</p></article>`).join('') + '</div>'
    } else {
      intro.innerHTML = '<h1>原生 HTML 设计资产</h1>'
      preview.innerHTML = `<div class="html-overview"><p>37 个组件、83 个组件演示入口及正式图库。全部使用本地样式和原生 JavaScript。</p><p>先从左侧选择组件；配置项可修改，示例可直接操作。使用及单文件交付说明见 README.md，Agent 入口见 SKILL.md。</p><pre>&lt;div data-pd="Input" data-options='{"label":"Amount"}'&gt;&lt;/div&gt;\nPaylaterHTML.init(document);</pre><h2>已知缺失能力</h2>${catalog.unavailableComponents.map((entry) => `<p>${escape(entry.name)}：${escape(entry.designName || entry.note)}</p>`).join('')}<p>来源标签不等于全部设计变体已通过。读取 knowledge/contracts.json 的支持范围和当前验证报告。</p></div>`
    }
    navigation(componentSearch.value)
    window.PaylaterPreview = { id, controller: current }
  }
  componentSearch.addEventListener('input', (event) => navigation(event.target.value))
  window.addEventListener('hashchange', route); route()
})()
