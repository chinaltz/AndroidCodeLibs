export default class Yan {
    /**
     * convert through the pinyin library
     * TODO: add to set different modes, default to tone2
     *
     * @param {String} hans
     * @param {Number} options
     * @returns {String[][]}
     */
    private convert;
    /**
     * concat audio files
     *
     * @param {String[]} fileArr
     * @returns {String}
     */
    private concatAudioMp3;
    /**
     * generate an audio file of the input characters
     * @param {String} hans - the words/sentences
     * @param {String} path - output path
     * @param {Number | null} options - for Py lib
     * @returns {String}
     */
    synthesis(hans: string, path?: string, options?: number): string;
    recognition(): void;
}
//# sourceMappingURL=index.d.ts.map