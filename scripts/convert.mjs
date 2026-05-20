#!/usr/bin/env node
/**
 * 一键转换：Markdown → HTML + DOCX
 * 用法:
 *   node scripts/convert.mjs <文章目录>
 *   node scripts/convert.mjs --all
 */

import { execSync } from 'child_process';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function run(cmd, label) {
  console.log(`\n▶ ${label}...`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    console.log(`✅ ${label} 完成`);
    return true;
  } catch (e) {
    console.error(`❌ ${label} 失败: ${e.message}`);
    return false;
  }
}

const args = process.argv.slice(2);
const slug = args[0];

if (!slug) {
  console.log(`
技趣星球 · 一键转换 Markdown → HTML + DOCX

用法:
  node scripts/convert.mjs <文章目录>
  node scripts/convert.mjs --all

示例:
  node scripts/convert.mjs content/posts/ai-for-ordinary-people
  node scripts/convert.mjs content/posts/ai-for-ordinary-people --published

发布就绪（上传图 + 导出）:
  node scripts/publish-post.mjs content/posts/ai-for-ordinary-people
`);
  process.exit(0);
}

const usePublished = process.argv.includes('--published');
const htmlFlag = usePublished ? ' --published' : '';
const ok1 = run(`node scripts/md-to-wechat.mjs ${slug}${htmlFlag}`, usePublished ? '生成 HTML（公网图链）' : '生成 HTML');
const ok2 = run(`python3 scripts/md-to-docx.py ${slug}`, '生成 Word 文档（本地嵌图）');

console.log(ok1 && ok2 ? '\n🎉 全部完成！' : '\n⚠️  部分任务失败，请检查上方输出');
