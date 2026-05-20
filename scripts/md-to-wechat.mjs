#!/usr/bin/env node
/**
 * Markdown → 公众号预览 HTML（零依赖）
 * 用法:
 *   node scripts/md-to-wechat.mjs content/posts/ai-for-ordinary-people
 *   node scripts/md-to-wechat.mjs --all
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_DIR = join(ROOT, 'content', 'posts');
/** 框线四角/竖线（不含 ─→，避免把流程图误判为框线图） */
const BOX_CORNER = /[╔╗╚╝┌┐└┘│├┤┬┴┼╠╣╦╩╤╧═]/;
const THEME = {
  teal: '#19C8B9',
  tealDark: '#01B0A7',
  tealSoft: '#E6F9F6',
  sandPage: '#F0E8D8',
  sandSurface: '#F8F8F0',
  sandRaised: '#FFFDF7',
  sandWarm: '#F7F3DF',
  sandBorder: '#D4C9B4',
  wood: '#794F27',
  woodSoft: '#8A7B66',
  woodLight: '#9F927D',
  sun: '#F5C31C',
  sunSoft: '#FFEEA0',
  leaf: '#6FBA2C',
  coral: '#E05A5A',
};

function escapeHtml(s) {
  return s
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function preprocessAsciiBoxes(md) {
  const lines = md.split('\n');
  const out = [];
  let buf = [];
  let inBox = false;
  let inFence = false;

  const flush = () => {
    if (buf.length) {
      out.push('```ascii-box');
      out.push(...buf);
      out.push('```');
      buf = [];
    }
    inBox = false;
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inBox) flush();
      inFence = !inFence;
      out.push(line);
      continue;
    }

    // 已在 ``` 围栏内的内容（含框线图）原样保留，避免破坏代码块结构
    if (inFence) {
      out.push(line);
      continue;
    }

    const trimmed = line.trim();
    const isBox =
      trimmed.length > 0 && BOX_CORNER.test(line) && !line.startsWith('|');

    if (isBox) {
      inBox = true;
      buf.push(line);
    } else {
      if (inBox) flush();
      out.push(line);
    }
  }
  if (inBox) flush();
  return out.join('\n');
}

function inlineFormat(text) {
  let s = escapeHtml(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const clean = src.replace(/^\.\//, '');
    return `<img src="${clean}" alt="${escapeHtml(alt)}" style="max-width:100%;border-radius:18px;display:block;border:2px solid ${THEME.sandBorder};box-shadow:0 8px 24px rgba(61,52,40,0.12);" />`;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${THEME.tealDark};text-decoration:none;border-bottom:1px dashed ${THEME.teal};font-weight:700;">$1</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, `<strong style="font-weight:800;color:${THEME.wood};background:linear-gradient(transparent 62%, ${THEME.sunSoft} 62%);padding:0 2px;">$1</strong>`);
  s = s.replace(/\*([^*]+)\*/g, `<em style="font-style:italic;color:${THEME.woodLight};">$1</em>`);
  s = s.replace(/`([^`]+)`/g, `<code style="background:${THEME.sunSoft};padding:2px 8px;border-radius:999px;font-size:14px;font-family:Menlo,Consolas,monospace;color:${THEME.wood};border:1px solid ${THEME.sandBorder};">$1</code>`);
  return s;
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function isTableSep(line) {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function renderTable(rows) {
  if (rows.length < 2) return '';
  const [header, ...body] = rows;
  const ths = header
    .map(
      (c) =>
        `<th style="background:${THEME.teal};color:#fff;padding:12px 14px;text-align:left;font-weight:800;border:2px solid ${THEME.teal};">${inlineFormat(c)}</th>`
    )
    .join('');
  const trs = body
    .map((row, ri) => {
      const bg = ri % 2 === 1 ? `background:${THEME.sandSurface};` : `background:${THEME.sandRaised};`;
      const tds = row
        .map(
          (c) =>
            `<td style="padding:10px 14px;border:2px solid ${THEME.sandBorder};${bg}color:${THEME.woodSoft};">${inlineFormat(c)}</td>`
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n');
  return `<section style="margin:16px 0;padding:6px;background:${THEME.sandRaised};border:2px solid ${THEME.sandBorder};border-radius:18px;box-shadow:0 3px 0 ${THEME.sandBorder};overflow:hidden;"><table style="width:100%;border-collapse:separate;border-spacing:0;font-size:15px;border-radius:14px;overflow:hidden;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></section>\n`;
}

function renderBlockquote(lines) {
  const raw = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
  const html = inlineFormat(raw).replace(/\n\n/g, '</p><p style="margin:4px 0;">').replace(/\n/g, '<br/>');
  const text = lines.join(' ');
  const cls = text.includes('⚠️') ? 'warning' : text.includes('💡') ? 'tip' : '';
  const bg = cls === 'warning' ? '#FFF8E6' : cls === 'tip' ? '#E6F9F6' : THEME.sandRaised;
  const border = cls === 'warning' ? THEME.sun : cls === 'tip' ? THEME.teal : THEME.sandBorder;
  return `<blockquote style="margin:16px 0;padding:14px 18px;background:${bg};border:2px solid ${border};border-left:8px solid ${border};border-radius:18px;color:${THEME.woodSoft};box-shadow:0 4px 0 rgba(189,174,160,0.55);"><p style="margin:4px 0;line-height:1.85;">${html}</p></blockquote>\n`;
}

/** 流程图：含箭头/emoji，无框线四角（公众号友好浅色卡片） */
function isFlowDiagram(code) {
  return (
    /[─→↓]/.test(code) &&
    /[📋✍️🎥✂️📤✅🙋❶❷❸①②③🎼🎤]/.test(code) &&
    !BOX_CORNER.test(code)
  );
}

function renderFlowDiagram(code) {
  const lines = code.split('\n').filter((l) => l.trim());
  const row1 = escapeHtml(lines[0] || '');
  const row2 = lines[1] ? escapeHtml(lines[1]) : '';
  let inner = `<p style="margin:0;padding:0;color:${THEME.wood};font-size:15px;line-height:1.9;font-weight:800;letter-spacing:0;">${row1}</p>`;
  if (row2) {
    inner += `<p style="margin:10px 0 0;padding:0;color:${THEME.woodSoft};font-size:14px;line-height:1.9;">${row2}</p>`;
  }
  return `<section style="background-color:${THEME.tealSoft};border:2px solid ${THEME.teal};border-radius:24px;padding:18px 14px;margin:16px 0;text-align:center;box-shadow:0 5px 0 ${THEME.tealDark};">${inner}</section>\n`;
}

function renderAsciiBox(code) {
  const escaped = escapeHtml(code);
  const wide = code.split('\n').some((l) => l.length > 50);
  const align = wide ? 'left' : 'center';
  return `<pre style="font-family:Menlo,Consolas,'PingFang SC',monospace;background-color:${THEME.sandRaised};color:${THEME.wood};border:2px solid ${THEME.sandBorder};padding:16px;border-radius:18px;text-align:${align};font-size:12px;line-height:1.45;margin:16px 0;overflow-x:auto;white-space:pre;box-shadow:0 4px 0 ${THEME.sandBorder};">${escaped}</pre>\n`;
}

function renderCode(code, lang) {
  if (!code.trim()) return '';
  if (BOX_CORNER.test(code) || lang === 'ascii-box') {
    return renderAsciiBox(code);
  }
  if (isFlowDiagram(code)) {
    return renderFlowDiagram(code);
  }
  const escaped = escapeHtml(code);
  return `<pre style="background-color:${THEME.sandRaised};color:${THEME.wood};border:2px solid ${THEME.sandBorder};padding:16px;border-radius:18px;overflow-x:auto;font-size:14px;line-height:1.7;font-family:Menlo,Consolas,monospace;margin:16px 0;white-space:pre-wrap;box-shadow:0 4px 0 ${THEME.sandBorder};"><code style="color:${THEME.wood};background-color:transparent;">${escaped}</code></pre>\n`;
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      html.push(renderCode(codeLines.join('\n'), lang));
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push(`<hr style="border:none;border-top:2px dashed ${THEME.sandBorder};margin:30px 0;" />\n`);
      i++;
      continue;
    }

    if (line.startsWith('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const rows = [parseTableRow(line)];
      i += 2;
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      html.push(renderTable(rows));
      continue;
    }

    if (line.startsWith('>')) {
      const bq = [];
      while (i < lines.length && (lines[i].startsWith('>') || (lines[i].trim() === '' && i + 1 < lines.length && lines[i + 1].startsWith('>')))) {
        if (lines[i].trim() !== '') bq.push(lines[i]);
        i++;
      }
      html.push(renderBlockquote(bq));
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      html.push(
        `<h3 style="font-size:17px;font-weight:800;margin:24px 0 10px;color:${THEME.wood};line-height:1.45;"><span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:${THEME.sun};margin-right:8px;box-shadow:0 2px 0 ${THEME.sandBorder};"></span>${inlineFormat(h3[1])}</h3>\n`
      );
      i++;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      html.push(
        `<h2 style="font-size:19px;font-weight:900;margin:34px 0 14px;color:${THEME.wood};line-height:1.45;padding:12px 16px;background:${THEME.sunSoft};border:2px solid ${THEME.sandBorder};border-radius:999px;box-shadow:0 5px 0 ${THEME.sandBorder};"><span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${THEME.teal};margin-right:8px;"></span>${inlineFormat(h2[1])}</h2>\n`
      );
      i++;
      continue;
    }

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      html.push(
        `<h1 style="font-size:24px;font-weight:900;line-height:1.38;margin:24px 0 18px;color:${THEME.wood};padding:18px 20px;background:${THEME.sandRaised};border:2px solid ${THEME.sandBorder};border-radius:24px;box-shadow:0 6px 0 ${THEME.sandBorder};">${inlineFormat(h1[1])}</h1>\n`
      );
      i++;
      continue;
    }

    const imgOnly = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgOnly) {
      const src = imgOnly[2].replace(/^\.\//, '');
      html.push(
        `<p style="margin:18px 0;"><img src="${src}" alt="${escapeHtml(imgOnly[1])}" style="max-width:100%;border-radius:20px;display:block;border:2px solid ${THEME.sandBorder};box-shadow:0 8px 24px rgba(61,52,40,0.14);" /></p>\n`
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      const lis = items
        .map((t) => `<li style="margin:4px 0;">${inlineFormat(t)}</li>`)
        .join('\n');
      html.push(
        `<ul style="margin:14px 0;padding:14px 18px 14px 30px;line-height:1.85;list-style:disc;background:${THEME.sandRaised};border:2px solid ${THEME.sandBorder};border-radius:18px;color:${THEME.woodSoft};box-shadow:0 3px 0 ${THEME.sandBorder};">${lis}</ul>\n`
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      const lis = items
        .map((t) => `<li style="margin:6px 0;padding-left:2px;">${inlineFormat(t)}</li>`)
        .join('\n');
      html.push(
        `<ol style="margin:14px 0;padding:14px 18px 14px 34px;line-height:1.85;background:${THEME.sandRaised};border:2px solid ${THEME.sandBorder};border-radius:18px;color:${THEME.woodSoft};box-shadow:0 3px 0 ${THEME.sandBorder};">${lis}</ol>\n`
      );
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('|') &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^!\[/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    // 兜底：未包在 ``` 里的框线图按等宽块渲染，避免挤成一行
    if (para.length > 0 && para.every((l) => BOX_CORNER.test(l) || l.trim() === '')) {
      html.push(renderCode(para.join('\n'), 'ascii-box'));
      continue;
    }
    html.push(
      `<p style="margin:12px 0;line-height:1.9;color:${THEME.woodSoft};">${inlineFormat(para.join(' '))}</p>\n`
    );
  }

  return html.join('');
}

const HTML_SHELL = (title, body, generatedAt) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Nunito", "HarmonyOS Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: ${THEME.woodSoft};
    max-width: 680px;
    margin: 0 auto;
    padding: 20px;
    background:
      radial-gradient(circle at 12% 8%, rgba(25,200,185,0.16), transparent 28%),
      radial-gradient(circle at 88% 18%, rgba(255,238,160,0.38), transparent 26%),
      ${THEME.sandPage};
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,253,247,0.96);
    backdrop-filter: blur(8px);
    border-bottom: 2px solid ${THEME.sandBorder};
    padding: 12px 20px;
    margin: -20px -20px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .toolbar button {
    background: ${THEME.teal};
    color: #fff;
    border: 2px solid ${THEME.tealDark};
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 800;
    box-shadow: 0 4px 0 ${THEME.tealDark};
  }
  .toolbar button:hover { background: ${THEME.tealDark}; }
  .toolbar button.secondary {
    background: ${THEME.sandRaised};
    color: ${THEME.wood};
    border: 2px solid ${THEME.sandBorder};
    box-shadow: 0 4px 0 ${THEME.sandBorder};
  }
  .toolbar .hint { font-size: 13px; color: ${THEME.woodLight}; flex: 1; min-width: 200px; }
  #article {
    background: rgba(255,253,247,0.72);
    border: 2px solid ${THEME.sandBorder};
    border-radius: 28px;
    padding: 18px;
    box-shadow: 0 8px 24px rgba(61,52,40,0.10);
  }
  .meta { font-size: 12px; color: ${THEME.woodLight}; margin-top: 24px; padding-top: 16px; border-top: 2px dashed ${THEME.sandBorder}; }
</style>
</head>
<body>
<div class="toolbar">
  <button type="button" onclick="copyArticle()">📋 一键复制正文</button>
  <button type="button" class="secondary" onclick="selectArticle()">选中正文</button>
  <span class="hint">复制后 → 公众号后台正文区粘贴。图片需在公众号里重新上传。</span>
</div>
<div id="article">
${body}
</div>
<p class="meta">由 md-to-wechat 自动生成 · ${generatedAt}</p>
<script>
function selectArticle() {
  const el = document.getElementById('article');
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
async function copyArticle() {
  selectArticle();
  try {
    const el = document.getElementById('article');
    const html = el.innerHTML;
    const text = el.innerText;
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        })
      ]);
    } else {
      document.execCommand('copy');
    }
    alert('✅ 已复制！请到微信公众号后台 → 正文编辑区 → Cmd+V 粘贴');
  } catch (e) {
    try {
      document.execCommand('copy');
      alert('✅ 已复制（兼容模式）！请到公众号后台粘贴');
    } catch (e2) {
      alert('复制失败：请点「选中正文」后手动 Cmd+C');
    }
  }
}
</script>
</body>
</html>`;

function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '文章预览';
}

function convertPost(postDir, options = {}) {
  const usePublished = options.usePublished;
  const publishedPath = join(postDir, 'index.published.md');
  const localPath = join(postDir, 'index.md');

  let mdPath = localPath;
  if (usePublished && existsSync(publishedPath)) {
    mdPath = publishedPath;
  } else if (usePublished) {
    console.warn(`⚠️  无 index.published.md，回退 index.md: ${relative(ROOT, postDir)}`);
  }

  if (!existsSync(mdPath)) {
    console.error(`跳过（无 index.md）: ${postDir}`);
    return false;
  }

  const mdRaw = readFileSync(mdPath, 'utf-8');
  const md = preprocessAsciiBoxes(mdRaw);
  const title = extractTitle(mdRaw);
  const body = markdownToHtml(md);
  const html = HTML_SHELL(
    title,
    body,
    new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  );

  const outPath = resolve(postDir, 'index.html');
  writeFileSync(outPath, html, 'utf-8');
  console.log(`✅ ${relative(ROOT, outPath)}`);
  return true;
}

function findAllPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  return readdirSync(POSTS_DIR)
    .map((name) => join(POSTS_DIR, name))
    .filter((p) => statSync(p).isDirectory() && existsSync(join(p, 'index.md')));
}

function resolveInput(arg) {
  if (!arg) return null;
  let p = resolve(ROOT, arg);
  if (existsSync(p) && statSync(p).isFile() && p.endsWith('.md')) {
    return dirname(p);
  }
  if (existsSync(join(p, 'index.md'))) return p;
  return null;
}

function printUsage() {
  console.log(`
技趣星球 · Markdown → 公众号 HTML（零依赖）

用法:
  node scripts/md-to-wechat.mjs <文章目录>
  node scripts/md-to-wechat.mjs <文章目录> --published
  node scripts/md-to-wechat.mjs --all

示例:
  node scripts/md-to-wechat.mjs content/posts/ai-for-ordinary-people
  node scripts/md-to-wechat.mjs content/posts/ai-for-ordinary-people --published

--published  读取 index.published.md（公网图链，适合公众号/HTML 预览）
`);
}

const args = process.argv.slice(2);
const usePublished = args.includes('--published');
const filteredArgs = args.filter((a) => a !== '--published');

if (filteredArgs.includes('--help') || filteredArgs.includes('-h')) {
  printUsage();
  process.exit(0);
}

if (filteredArgs.includes('--all')) {
  const posts = findAllPosts();
  if (!posts.length) {
    console.error('未找到 content/posts/*/index.md');
    process.exit(1);
  }
  let n = 0;
  for (const p of posts) if (convertPost(p, { usePublished })) n++;
  console.log(`\n共生成 ${n} 篇`);
  process.exit(0);
}

const input = filteredArgs[0];
if (!input) {
  printUsage();
  process.exit(1);
}

const postDir = resolveInput(input);
if (!postDir) {
  console.error(`找不到文章: ${input}`);
  process.exit(1);
}

convertPost(postDir, { usePublished });
