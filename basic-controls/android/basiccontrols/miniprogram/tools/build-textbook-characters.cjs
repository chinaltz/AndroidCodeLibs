const fs = require('fs');
const https = require('https');
const path = require('path');

const SOURCE_URL = 'https://www.46.la/tool/primary-chinese-character-list';
const OUTPUT = path.resolve(__dirname, '../data/textbook-characters.full.json');
const GRADE_LABELS = ['一', '二', '三', '四', '五', '六'];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchText(response.headers.location).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`request failed: ${response.statusCode}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function parseBooks(html) {
  const blocks = Array.from(html.matchAll(
    /<legend[^>]*id="grade(\d)-([12])"[^>]*>[\s\S]*?生字：(\d+)个[\s\S]*?<\/legend><div class="ppi-hanzi-block-inner">([\s\S]*?)<\/fieldset>/g,
  ));

  return blocks.map((match) => {
    const grade = Number(match[1]);
    const volume = match[2] === '1' ? '上' : '下';
    const characters = Array.from(match[4].matchAll(/class="ppi-hanzi-char">([^<]+)<\/div>/g))
      .map((item) => item[1].trim())
      .filter(Boolean);
    return {
      id: `rj-yw-g${grade}${volume === '上' ? 'a' : 'b'}`,
      grade,
      volume,
      label: `${GRADE_LABELS[grade - 1]}年级${volume}`,
      declaredCount: Number(match[3]),
      count: characters.length,
      verified: false,
      sourceUrl: SOURCE_URL,
      characters,
    };
  });
}

async function main() {
  const html = await fetchText(SOURCE_URL);
  const books = parseBooks(html);
  if (books.length !== 12) {
    throw new Error(`expected 12 books, got ${books.length}`);
  }
  books.forEach((book) => {
    book.countMismatch = book.count !== book.declaredCount;
  });
  const output = {
    edition: '人教版公开汇总索引',
    scope: '小学语文一至六年级上下册',
    generatedAt: new Date().toISOString(),
    verified: false,
    verificationNote: '分册字符已按公开汇总抓取；不是教育部逐课结构化数据，正式发布前需按当前统编版教材逐课核验。',
    sourceUrl: SOURCE_URL,
    totalCount: books.reduce((sum, book) => sum + book.count, 0),
    uniqueCount: new Set(books.flatMap((book) => book.characters)).size,
    books,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`wrote ${books.length} books / ${output.totalCount} entries / ${output.uniqueCount} unique chars`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
