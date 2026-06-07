"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pinyin_1 = __importDefault(require("pinyin"));
const crypto_1 = require("crypto");
const audiosprite_1 = __importDefault(require("audiosprite"));
class Yan {
    /**
     * convert through the pinyin library
     * TODO: add to set different modes, default to tone2
     *
     * @param {String} hans
     * @param {Number} options
     * @returns {String[][]}
     */
    convert(hans, options) {
        const pyStyle = options || pinyin_1.default.STYLE_TONE2;
        return (0, pinyin_1.default)(hans, { style: pyStyle });
    }
    /**
     * concat audio files
     *
     * @param {String[]} fileArr
     * @returns {String}
     */
    concatAudioMp3(fileArr) {
        const opts = {
            export: 'mp3',
            output: `${(0, crypto_1.randomBytes)(7).toString('hex')}.mp3`,
            gap: 0,
            ignorerounding: true,
        };
        (0, audiosprite_1.default)(fileArr, opts, (err, obj) => {
            if (err)
                return console.error(err);
            console.info(JSON.stringify(obj, null, 2));
        });
        return opts.output;
    }
    /**
     * generate an audio file of the input characters
     * @param {String} hans - the words/sentences
     * @param {String} path - output path
     * @param {Number | null} options - for Py lib
     * @returns {String}
     */
    synthesis(hans, path = 'pinyin-syllables', options) {
        const pyArr = this.convert(hans, options);
        // TODO: compress the audio library
        const dirPath = pyArr.map((elem) => {
            if (elem[0]?.trim()) {
                return `./${path}/${elem[0]}.mp3`;
            }
            return `./${path}/1000.mp3`;
        });
        return this.concatAudioMp3(dirPath);
    }
    recognition() {
        console.error(`Not implemented`);
    }
}
exports.default = Yan;
//# sourceMappingURL=index.js.map