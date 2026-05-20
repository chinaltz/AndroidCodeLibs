#!/usr/bin/env node
/**
 * 上传文章 images/ 到图床，生成 index.published.md（公网 HTTPS 图链）
 *
 * 用法:
 *   node scripts/upload-images.mjs content/posts/<slug>           # 读取配置并上传
 *   node scripts/upload-images.mjs content/posts/<slug> --dry-run
 *   node scripts/upload-images.mjs content/posts/<slug> --provider base-url
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  copyFileSync,
} from 'fs';
import { resolve, dirname, join, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONFIG_PATH = join(ROOT, 'image-upload.config.json');
const EXAMPLE_CONFIG = join(ROOT, 'image-upload.config.example.json');

const IMAGE_MD_RE = /!\[([^\]]*)\]\((\.\/images\/[^)]+)\)/g;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

function md5File(path) {
  const buf = readFileSync(path);
  return createHash('md5').update(buf).digest('hex');
}

function loadConfig(cliProvider, dryRunFlag) {
  if (!existsSync(CONFIG_PATH)) {
    if (dryRunFlag || cliProvider === 'dry-run') {
      return { provider: 'dry-run' };
    }
    if (existsSync(EXAMPLE_CONFIG)) {
      console.error(`❌ 请先复制配置:\n   cp image-upload.config.example.json image-upload.config.json`);
    } else {
      console.error('❌ 缺少 image-upload.config.json');
    }
    process.exit(1);
  }
  const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  const provider = cliProvider || cfg.provider || 'dry-run';
  return { ...cfg, provider };
}

function loadManifest(manifestPath) {
  if (!existsSync(manifestPath)) return { version: 1, uploads: {} };
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function saveManifest(manifestPath, data) {
  writeFileSync(manifestPath, JSON.stringify(data, null, 2), 'utf8');
}

function collectImagesFromMd(md, postDir) {
  const refs = new Set();
  let m;
  const re = new RegExp(IMAGE_MD_RE.source, 'g');
  while ((m = re.exec(md)) !== null) {
    const rel = m[2].replace(/^\.\//, '');
    const abs = join(postDir, rel);
    if (existsSync(abs)) refs.add(rel);
  }
  const imagesDir = join(postDir, 'images');
  if (existsSync(imagesDir)) {
    for (const f of readdirSync(imagesDir)) {
      if (IMAGE_EXT.test(f) && f !== 'upload-manifest.json') {
        refs.add(`images/${f}`);
      }
    }
  }
  return [...refs].sort();
}

async function uploadSmms(filePath, token) {
  const buf = readFileSync(filePath);
  const form = new FormData();
  const blob = new Blob([buf]);
  form.append('smfile', blob, basename(filePath));

  const res = await fetch('https://sm.ms/api/v2/upload', {
    method: 'POST',
    headers: { Authorization: token },
    body: form,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || JSON.stringify(json));
  }
  return json.data.url;
}

async function uploadGithub(filePath, relFromRepoRoot, cfg) {
  const token = process.env[cfg.tokenEnv || 'GITHUB_TOKEN'];
  if (!token) throw new Error(`缺少环境变量 ${cfg.tokenEnv || 'GITHUB_TOKEN'}`);

  const content = readFileSync(filePath).toString('base64');
  const apiPath = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${relFromRepoRoot}`;

  let sha;
  const check = await fetch(`${apiPath}?ref=${cfg.branch || 'main'}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (check.status === 200) {
    const existing = await check.json();
    sha = existing.sha;
  }

  const putRes = await fetch(apiPath, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `upload image: ${relFromRepoRoot}`,
      content,
      branch: cfg.branch || 'main',
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub API ${putRes.status}: ${err}`);
  }

  const branch = cfg.branch || 'main';
  return `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${branch}/${relFromRepoRoot}`;
}

function resolveBaseUrl(relPath, imagesRel, cfg, postSlug) {
  let prefix = cfg.baseUrl?.prefix || cfg.prefix;
  if (!prefix) {
    throw new Error('base-url 模式需要配置 baseUrl.prefix');
  }
  prefix = prefix.replace(/\/$/, '');
  const fileName = basename(relPath);
  return `${prefix}/${fileName}`;
}

async function resolveRemoteUrl(relPath, postDir, postSlug, cfg, manifest, dryRun) {
  const abs = join(postDir, relPath);
  const hash = md5File(abs);
  const cached = manifest.uploads[relPath];
  if (cached && cached.hash === hash && cached.url) {
    console.log(`  ⏭  跳过（未变化）: ${relPath}`);
    return cached.url;
  }

  if (dryRun) {
    const fake = `https://example.cdn/${postSlug}/${relPath}`;
    console.log(`  🔍 [dry-run] ${relPath} → ${fake}`);
    return fake;
  }

  let url;
  const relFromRoot = relative(ROOT, abs).replace(/\\/g, '/');

  switch (cfg.provider) {
    case 'smms':
      url = await uploadSmms(abs, cfg.smms?.token || process.env.SM_MS_TOKEN);
      break;
    case 'github':
      url = await uploadGithub(abs, relFromRoot, cfg.github);
      break;
    case 'base-url':
      url = resolveBaseUrl(relPath, relFromRoot, cfg, postSlug);
      console.log(`  🔗 base-url: ${url}`);
      break;
    default:
      throw new Error(`未知 provider: ${cfg.provider}`);
  }

  console.log(`  ✅ ${relPath}\n     → ${url}`);
  manifest.uploads[relPath] = { url, hash, uploadedAt: new Date().toISOString() };
  return url;
}

function replaceImagesInMd(md, urlMap) {
  return md.replace(IMAGE_MD_RE, (full, alt, localPath) => {
    const rel = localPath.replace(/^\.\//, '');
    const remote = urlMap[rel];
    if (!remote) return full;
    return `![${alt}](${remote})`;
  });
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
  const postDir = resolve(ROOT, args[0] || '');

  if (!postDir || !existsSync(join(postDir, 'index.md'))) {
    console.log(`
技趣星球 · 图片上传 → index.published.md

用法:
  node scripts/upload-images.mjs <文章目录> [选项]

选项:
  --dry-run              只预览，不上传
  --provider <name>      覆盖配置: smms | github | base-url | dry-run
  --use-published        若已有 published 且图未变，可跳过

示例:
  cp image-upload.config.example.json image-upload.config.json
  node scripts/upload-images.mjs content/posts/ai-terms-plain-language --dry-run
  node scripts/upload-images.mjs content/posts/ai-terms-plain-language

详见: docs/图片上传与多平台发布.md
`);
    process.exit(args.length ? 1 : 0);
  }

  const cliProvider = [...flags].includes('--provider')
    ? process.argv[process.argv.indexOf('--provider') + 1]
    : null;
  const dryRun = flags.has('--dry-run') || cliProvider === 'dry-run';

  const cfg = loadConfig(cliProvider, dryRun);
  if (dryRun) cfg.provider = 'dry-run';

  const postSlug = basename(postDir);
  const indexPath = join(postDir, 'index.md');
  const publishedPath = join(postDir, 'index.published.md');
  const manifestPath = join(postDir, 'images', 'upload-manifest.json');

  const md = readFileSync(indexPath, 'utf8');
  const imageRefs = collectImagesFromMd(md, postDir);

  if (imageRefs.length === 0) {
    console.log('⚠️  未找到 images/ 下图片或 MD 中的 ./images/ 引用');
    process.exit(0);
  }

  console.log(`\n📁 ${relative(ROOT, postDir)}`);
  console.log(`📷 共 ${imageRefs.length} 张图 | provider: ${dryRun ? 'dry-run' : cfg.provider}\n`);

  const manifest = loadManifest(manifestPath);
  const urlMap = {};

  for (const rel of imageRefs) {
    try {
      if (dryRun) {
        urlMap[rel] = await resolveRemoteUrl(rel, postDir, postSlug, cfg, manifest, true);
      } else {
        urlMap[rel] = await resolveRemoteUrl(rel, postDir, postSlug, cfg, manifest, false);
      }
    } catch (e) {
      console.error(`  ❌ ${rel}: ${e.message}`);
      process.exit(1);
    }
  }

  const publishedMd = replaceImagesInMd(md, urlMap);
  writeFileSync(publishedPath, publishedMd, 'utf8');
  console.log(`\n📝 已生成: ${relative(ROOT, publishedPath)}`);

  if (!dryRun) {
    saveManifest(manifestPath, manifest);
    console.log(`📋 已更新: ${relative(ROOT, manifestPath)}`);
  }

  console.log(`
下一步:
  npm run convert:published -- ${relative(ROOT, postDir)}
  知乎/掘金: 导入 index.published.md
  公众号: 打开 index.html，外链图失败则在后台补传素材库
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
