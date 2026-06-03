function words(a, b, c) {
  return [
    { text: a, tip: a + ' 里练目标音' },
    { text: b, tip: b + ' 里再听一次' },
    { text: c, tip: c + ' 放进单词读' },
  ];
}

const GROUPS = [
  { title: '短元音', items: [
    { id: 'i_short', symbol: '/ɪ/', groupTitle: '短元音', mouthTip: '嘴角轻轻向两边，声音短，不要拖长。', words: words('sit', 'pig', 'fish') },
    { id: 'e', symbol: '/e/', groupTitle: '短元音', mouthTip: '嘴巴自然咧开，像 pen 中间的短音。', words: words('pen', 'red', 'bed') },
    { id: 'ae', symbol: '/æ/', groupTitle: '短元音', mouthTip: '嘴巴张大一点，像“啊”和“诶”之间，声音短。', words: words('cat', 'bag', 'apple') },
    { id: 'v_short', symbol: '/ʌ/', groupTitle: '短元音', mouthTip: '嘴巴自然打开，声音短而有力。', words: words('cup', 'sun', 'bus') },
    { id: 'o_short', symbol: '/ɒ/', groupTitle: '短元音', mouthTip: '嘴巴圆一点，短促发出。', words: words('dog', 'box', 'hot') },
    { id: 'u_short', symbol: '/ʊ/', groupTitle: '短元音', mouthTip: '嘴唇微圆，声音短，不要读成长音。', words: words('book', 'good', 'look') },
    { id: 'schwa', symbol: '/ə/', groupTitle: '短元音', mouthTip: '最轻的弱读音，嘴巴放松。', words: words('about', 'teacher', 'sofa') },
  ]},
  { title: '长元音', items: [
    { id: 'i_long', symbol: '/iː/', groupTitle: '长元音', mouthTip: '嘴角向两边，声音拉长。', words: words('see', 'tree', 'green') },
    { id: 'a_long', symbol: '/ɑː/', groupTitle: '长元音', mouthTip: '嘴巴打开，声音拉长。', words: words('car', 'star', 'park') },
    { id: 'o_long', symbol: '/ɔː/', groupTitle: '长元音', mouthTip: '嘴唇圆，声音拉长。', words: words('ball', 'door', 'four') },
    { id: 'u_long', symbol: '/uː/', groupTitle: '长元音', mouthTip: '嘴唇收圆，声音拉长。', words: words('blue', 'food', 'moon') },
    { id: 'er_long', symbol: '/ɜː/', groupTitle: '长元音', mouthTip: '舌头放松，发长一点。', words: words('bird', 'girl', 'nurse') },
  ]},
  { title: '双元音', items: [
    { id: 'ei', symbol: '/eɪ/', groupTitle: '双元音', mouthTip: '从 /e/ 滑到 /ɪ/，声音会移动。', words: words('cake', 'name', 'rain') },
    { id: 'ai', symbol: '/aɪ/', groupTitle: '双元音', mouthTip: '从大口音滑到 /ɪ/。', words: words('bike', 'time', 'kite') },
    { id: 'oi', symbol: '/ɔɪ/', groupTitle: '双元音', mouthTip: '先圆嘴，再滑到 /ɪ/。', words: words('boy', 'toy', 'coin') },
    { id: 'ou', symbol: '/əʊ/', groupTitle: '双元音', mouthTip: '从放松音滑到圆嘴。', words: words('go', 'home', 'nose') },
    { id: 'au', symbol: '/aʊ/', groupTitle: '双元音', mouthTip: '从大口音滑到圆嘴。', words: words('cow', 'house', 'mouth') },
    { id: 'ia', symbol: '/ɪə/', groupTitle: '双元音', mouthTip: '先短 /ɪ/，再滑到弱音。', words: words('ear', 'near', 'dear') },
    { id: 'ea', symbol: '/eə/', groupTitle: '双元音', mouthTip: '先 /e/，再放松收尾。', words: words('air', 'chair', 'bear') },
    { id: 'ua', symbol: '/ʊə/', groupTitle: '双元音', mouthTip: '先短 /ʊ/，再滑到弱音。', words: words('tour', 'poor', 'sure') },
  ]},
  { title: '清辅音', items: [
    { id: 'p', symbol: '/p/', groupTitle: '清辅音', mouthTip: '双唇闭合后轻轻爆破，不震动声带。', words: words('pen', 'pig', 'map') },
    { id: 't', symbol: '/t/', groupTitle: '清辅音', mouthTip: '舌尖顶住上齿龈，轻轻弹开。', words: words('top', 'tea', 'cat') },
    { id: 'k', symbol: '/k/', groupTitle: '清辅音', mouthTip: '舌后部抬起，轻轻送气。', words: words('key', 'kite', 'book') },
    { id: 'f', symbol: '/f/', groupTitle: '清辅音', mouthTip: '上牙轻碰下唇，送气。', words: words('fish', 'face', 'leaf') },
    { id: 'th_clear', symbol: '/θ/', groupTitle: '清辅音', mouthTip: '舌尖轻放牙齿之间，送气。', words: words('three', 'think', 'mouth') },
    { id: 's', symbol: '/s/', groupTitle: '清辅音', mouthTip: '舌尖靠近上齿龈，像小蛇吐气。', words: words('sun', 'sit', 'bus') },
    { id: 'sh', symbol: '/ʃ/', groupTitle: '清辅音', mouthTip: '嘴唇稍圆，发 sh 的气音。', words: words('ship', 'she', 'fish') },
    { id: 'tsh', symbol: '/tʃ/', groupTitle: '清辅音', mouthTip: '像 ch，短促发出。', words: words('chair', 'chicken', 'watch') },
    { id: 'h', symbol: '/h/', groupTitle: '清辅音', mouthTip: '轻轻哈气，不要太重。', words: words('hat', 'home', 'hello') },
  ]},
  { title: '浊辅音', items: [
    { id: 'b', symbol: '/b/', groupTitle: '浊辅音', mouthTip: '双唇闭合后爆破，声带震动。', words: words('bag', 'boy', 'cab') },
    { id: 'd', symbol: '/d/', groupTitle: '浊辅音', mouthTip: '舌尖弹开，声带震动。', words: words('dog', 'desk', 'red') },
    { id: 'g', symbol: '/g/', groupTitle: '浊辅音', mouthTip: '舌后部抬起，声带震动。', words: words('girl', 'go', 'bag') },
    { id: 'v', symbol: '/v/', groupTitle: '浊辅音', mouthTip: '上牙轻碰下唇，声带震动。', words: words('van', 'very', 'five') },
    { id: 'th_voice', symbol: '/ð/', groupTitle: '浊辅音', mouthTip: '舌尖轻放牙齿之间，声带震动。', words: words('this', 'that', 'mother') },
    { id: 'z', symbol: '/z/', groupTitle: '浊辅音', mouthTip: '像 /s/，但声带震动。', words: words('zoo', 'zero', 'nose') },
    { id: 'zh', symbol: '/ʒ/', groupTitle: '浊辅音', mouthTip: '像 /ʃ/，但声带震动。', words: words('measure', 'vision', 'usual') },
    { id: 'dzh', symbol: '/dʒ/', groupTitle: '浊辅音', mouthTip: '像 j，短促发出。', words: words('jam', 'job', 'orange') },
    { id: 'r', symbol: '/r/', groupTitle: '浊辅音', mouthTip: '舌头卷起但不要碰到上颚。', words: words('red', 'rain', 'rabbit') },
  ]},
  { title: '其他辅音', items: [
    { id: 'm', symbol: '/m/', groupTitle: '其他辅音', mouthTip: '双唇闭合，鼻音出来。', words: words('map', 'milk', 'home') },
    { id: 'n', symbol: '/n/', groupTitle: '其他辅音', mouthTip: '舌尖顶住上齿龈，鼻音出来。', words: words('name', 'nine', 'sun') },
    { id: 'ng', symbol: '/ŋ/', groupTitle: '其他辅音', mouthTip: '舌后部抬起，鼻音出来。', words: words('sing', 'king', 'long') },
    { id: 'l', symbol: '/l/', groupTitle: '其他辅音', mouthTip: '舌尖顶住上齿龈，声音从两侧出来。', words: words('leg', 'like', 'ball') },
    { id: 'j', symbol: '/j/', groupTitle: '其他辅音', mouthTip: '像 yes 开头的轻音。', words: words('yes', 'yellow', 'you') },
    { id: 'w', symbol: '/w/', groupTitle: '其他辅音', mouthTip: '嘴唇先圆，再放开。', words: words('we', 'water', 'window') },
    { id: 'tr', symbol: '/tr/', groupTitle: '其他辅音', mouthTip: '先 /t/ 再快速滑到 /r/。', words: words('tree', 'train', 'try') },
    { id: 'dr', symbol: '/dr/', groupTitle: '其他辅音', mouthTip: '先 /d/ 再快速滑到 /r/。', words: words('dream', 'drive', 'dress') },
    { id: 'ts', symbol: '/ts/', groupTitle: '其他辅音', mouthTip: '先 /t/ 再接 /s/，短促。', words: words('cats', 'hats', 'boats') },
    { id: 'dz', symbol: '/dz/', groupTitle: '其他辅音', mouthTip: '先 /d/ 再接 /z/，声带震动。', words: words('beds', 'birds', 'cards') },
  ]},
];

const PHONEMES = GROUPS.reduce((acc, g) => acc.concat(g.items), []);

function findById(id) {
  return PHONEMES.find((p) => p.id === id) || PHONEMES[0];
}

function firstUnfinished(completedIds) {
  const done = new Set(completedIds || []);
  return PHONEMES.find((p) => !done.has(p.id)) || PHONEMES[0];
}

module.exports = { GROUPS, PHONEMES, findById, firstUnfinished };
