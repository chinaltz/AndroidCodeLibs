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
    return `<img src="${clean}" alt="${escapeHtml(alt)}" style="max-width:100%;border-radius:8px;display:block;" />`;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#3B82F6;text-decoration:none;">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:bold;">$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;color:#6B7280;">$1</em>');
  s = s.replace(/`([^`]+)`/g, '<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:14px;font-family:Menlo,Consolas,monospace;color:#E53E3E;">$1</code>');
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
        `<th style="background:#3B82F6;color:#fff;padding:10px 12px;text-align:left;font-weight:bold;border:1px solid #3B82F6;">${inlineFormat(c)}</th>`
    )
    .join('');
  const trs = body
    .map((row, ri) => {
      const bg = ri % 2 === 1 ? 'background:#F9FAFB;' : '';
      const tds = row
        .map(
          (c) =>
            `<td style="padding:9px 12px;border:1px solid #E5E7EB;${bg}">${inlineFormat(c)}</td>`
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n');
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:15px;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>\n`;
}

function renderBlockquote(lines) {
  const raw = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
  const html = inlineFormat(raw).replace(/\n\n/g, '</p><p style="margin:4px 0;">').replace(/\n/g, '<br/>');
  const text = lines.join(' ');
  const cls = text.includes('⚠️') ? 'warning' : text.includes('💡') ? 'tip' : '';
  const bg = cls === 'warning' ? '#FFF8E6' : cls === 'tip' ? '#F0FFF4' : '#F0F7FF';
  const border = cls === 'warning' ? '#F59E0B' : cls === 'tip' ? '#10B981' : '#3B82F6';
  return `<blockquote style="margin:12px 0;padding:12px 16px;background:${bg};border-left:4px solid ${border};border-radius:0 6px 6px 0;color:#444;"><p style="margin:4px 0;">${html}</p></blockquote>\n`;
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
  let inner = `<p style="margin:0;padding:0;color:#1E40AF;font-size:15px;line-height:1.9;font-weight:500;letter-spacing:0.02em;">${row1}</p>`;
  if (row2) {
    inner += `<p style="margin:10px 0 0;padding:0;color:#374151;font-size:14px;line-height:1.9;">${row2}</p>`;
  }
  return `<section style="background-color:#EFF6FF;border:1px solid #93C5FD;border-radius:10px;padding:16px 12px;margin:12px 0;text-align:center;-webkit-text-fill-color:#1E40AF;">${inner}</section>\n`;
}

function renderAsciiBox(code) {
  const escaped = escapeHtml(code);
  const wide = code.split('\n').some((l) => l.length > 50);
  const align = wide ? 'left' : 'center';
  return `<pre style="font-family:Menlo,Consolas,'PingFang SC',monospace;background-color:#F8FAFC;color:#1E293B;border:1px solid #E2E8F0;padding:16px;border-radius:8px;text-align:${align};font-size:12px;line-height:1.45;margin:12px 0;overflow-x:auto;white-space:pre;">${escaped}</pre>\n`;
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
  return `<pre style="background-color:#F3F4F6;color:#1F2937;border:1px solid #E5E7EB;padding:16px;border-radius:8px;overflow-x:auto;font-size:14px;line-height:1.7;font-family:Menlo,Consolas,monospace;margin:12px 0;white-space:pre-wrap;"><code style="color:#1F2937;background-color:transparent;">${escaped}</code></pre>\n`;
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
      html.push('<hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />\n');
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
        `<h3 style="font-size:16px;font-weight:bold;margin:20px 0 8px;color:#333;">${inlineFormat(h3[1])}</h3>\n`
      );
      i++;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      html.push(
        `<h2 style="font-size:18px;font-weight:bold;margin:32px 0 12px;color:#111;border-left:4px solid #3B82F6;padding-left:10px;">${inlineFormat(h2[1])}</h2>\n`
      );
      i++;
      continue;
    }

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      html.push(
        `<h1 style="font-size:22px;font-weight:bold;line-height:1.4;margin:24px 0 16px;color:#111;">${inlineFormat(h1[1])}</h1>\n`
      );
      i++;
      continue;
    }

    const imgOnly = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgOnly) {
      const src = imgOnly[2].replace(/^\.\//, '');
      html.push(
        `<p style="margin:12px 0;"><img src="${src}" alt="${escapeHtml(imgOnly[1])}" style="max-width:100%;border-radius:8px;display:block;" /></p>\n`
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
        `<ul style="margin:10px 0;padding-left:24px;line-height:1.8;list-style:disc;">${lis}</ul>\n`
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
      `<p style="margin:10px 0;line-height:1.8;color:#333;">${inlineFormat(para.join(' '))}</p>\n`
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
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    max-width: 680px;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #E5E7EB;
    padding: 12px 20px;
    margin: -20px -20px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .toolbar button {
    background: #3B82F6;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
  }
  .toolbar button:hover { background: #2563EB; }
  .toolbar button.secondary {
    background: #fff;
    color: #3B82F6;
    border: 1px solid #3B82F6;
  }
  .toolbar .hint { font-size: 13px; color: #6B7280; flex: 1; min-width: 200px; }
  .meta { font-size: 12px; color: #9CA3AF; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
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

function convertPost(postDir) {
  const mdPath = join(postDir, 'index.md');
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
  node scripts/md-to-wechat.mjs --all

示例:
  node scripts/md-to-wechat.mjs content/posts/ai-for-ordinary-people

生成 index.html 后，用浏览器打开，点「一键复制正文」粘贴到公众号。
`);
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

if (args.includes('--all')) {
  const posts = findAllPosts();
  if (!posts.length) {
    console.error('未找到 content/posts/*/index.md');
    process.exit(1);
  }
  let n = 0;
  for (const p of posts) if (convertPost(p)) n++;
  console.log(`\n共生成 ${n} 篇`);
  process.exit(0);
}

const input = args[0];
if (!input) {
  printUsage();
  process.exit(1);
}

const postDir = resolveInput(input);
if (!postDir) {
  console.error(`找不到文章: ${input}`);
  process.exit(1);
}

convertPost(postDir);
