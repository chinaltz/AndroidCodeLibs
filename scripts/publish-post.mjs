#!/usr/bin/env node
/**
 * 发布就绪：上传图片 → 生成 index.published.md → HTML(公网图) + DOCX(本地嵌图)
 *
 * 用法:
 *   node scripts/publish-post.mjs content/posts/<slug>
 *   node scripts/publish-post.mjs content/posts/<slug> --dry-run
 *   node scripts/publish-post.mjs content/posts/<slug> --skip-upload
 */

import { execSync } from 'child_process';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function run(cmd, label) {
  console.log(`\n▶ ${label}...`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

const args = process.argv.slice(2).filter((a) => a !== '--dry-run' && a !== '--skip-upload');
const flags = new Set(process.argv.slice(2));
const slug = args[0];

if (!slug) {
  console.log(`
技趣星球 · 文章发布就绪（图片上传 + 导出）

用法:
  node scripts/publish-post.mjs <文章目录> [--dry-run] [--skip-upload]

步骤:
  1. upload-images → index.published.md
  2. md-to-wechat --published → index.html（公网图链）
  3. md-to-docx → .docx（仍用本地图嵌入）

配置: cp image-upload.config.example.json image-upload.config.json
文档: docs/图片上传与多平台发布.md
`);
  process.exit(0);
}

const postDir = relative(ROOT, resolve(ROOT, slug));
if (!existsSync(resolve(ROOT, postDir, 'index.md'))) {
  console.error(`找不到: ${postDir}/index.md`);
  process.exit(1);
}

if (!flags.has('--skip-upload')) {
  const uploadFlags = flags.has('--dry-run') ? '--dry-run' : '';
  run(`node scripts/upload-images.mjs ${postDir} ${uploadFlags}`.trim(), '上传图片 / 生成 published MD');
}

if (!flags.has('--dry-run')) {
  run(`node scripts/md-to-wechat.mjs ${postDir} --published`, '生成公众号 HTML（公网图）');
  run(`python3 scripts/md-to-docx.py ${postDir}`, '生成 Word（本地嵌图）');
  console.log('\n🎉 发布包就绪');
  console.log('  知乎/掘金: 导入 index.published.md');
  console.log('  公众号: 打开 index.html 一键复制');
}
