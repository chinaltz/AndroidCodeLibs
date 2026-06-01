# 音标音频审计报告

## 结论

- 清单音标数：48 / 48
- 已检查资源目录：4 个
- 机器校验错误：0 个
- 需人工听辨项：11 个

机器校验覆盖：id 唯一性、48 个文件存在性、Android/小程序/Kuikly 四端 hash 一致性、来源映射、时长和大小读取。

## 需人工听辨项

- `v_short` /ʌ/：Piper IPA `[[ʌ]]`，0.290s，needs-listen: synthetic IPA
- `o_short` /ɒ/：Piper IPA `[[ɒ]]`，0.267s，needs-listen: synthetic IPA
- `er_long` /ɜː/：Piper IPA `[[ɜː]]`，0.348s，needs-listen: synthetic IPA
- `ou` /əʊ/：Piper IPA `[[əʊ]]`，0.372s，needs-listen: synthetic IPA
- `ia` /ɪə/：Piper IPA `[[ɪə]]`，0.325s，needs-listen: synthetic IPA
- `ea` /eə/：Piper IPA `[[eə]]`，0.325s，needs-listen: synthetic IPA
- `ua` /ʊə/：Piper IPA `[[ʊə]]`，0.360s，needs-listen: synthetic IPA
- `zh` /ʒ/：Manual replacement `ybmp3.rar/n3.mp3` (`对应文件.doc`: `ʒ=n3`)，1.156s，needs-license-record: manual source
- `l` /l/：Piper IPA `[[lː]]`，0.325s，needs-listen: synthetic IPA
- `ts` /ts/：Piper IPA `[[ts]]`，0.174s，needs-listen: synthetic IPA
- `dz` /dz/：Piper IPA `[[dz]]`，0.395s，needs-listen: synthetic IPA

## 全量表

| id | IPA | 时长 | 大小 | 来源 | 状态 |
| --- | --- | ---: | ---: | --- | --- |
| `i_short` | /ɪ/ | 0.444s | 7639 | MIT isolated `ɪ.mp3` | pass |
| `e` | /e/ | 0.444s | 8501 | MIT isolated `ɛ.mp3` | pass |
| `ae` | /æ/ | 0.444s | 10486 | MIT isolated `æ.mp3` | pass |
| `v_short` | /ʌ/ | 0.290s | 2961 | Piper IPA `[[ʌ]]` | needs-listen: synthetic IPA |
| `o_short` | /ɒ/ | 0.267s | 2464 | Piper IPA `[[ɒ]]` | needs-listen: synthetic IPA |
| `u_short` | /ʊ/ | 0.549s | 8242 | MIT isolated `ʊ.mp3` | pass |
| `schwa` | /ə/ | 0.444s | 7665 | MIT isolated `ə.mp3` | pass |
| `i_long` | /iː/ | 0.888s | 16223 | MIT isolated `i.mp3` | pass |
| `a_long` | /ɑː/ | 0.627s | 12181 | MIT isolated `ɑ.mp3` | pass |
| `o_long` | /ɔː/ | 0.549s | 8841 | MIT isolated `ɔ.mp3` | pass |
| `u_long` | /uː/ | 0.914s | 15645 | MIT isolated `u.mp3` | pass |
| `er_long` | /ɜː/ | 0.348s | 2803 | Piper IPA `[[ɜː]]` | needs-listen: synthetic IPA |
| `ei` | /eɪ/ | 0.679s | 12936 | MIT isolated `eɪ.mp3` | pass |
| `ai` | /aɪ/ | 0.888s | 15488 | MIT isolated `aɪ.mp3` | pass |
| `oi` | /ɔɪ/ | 0.549s | 8083 | MIT isolated `ɔɪ.mp3` | pass |
| `ou` | /əʊ/ | 0.372s | 3272 | Piper IPA `[[əʊ]]` | needs-listen: synthetic IPA |
| `au` | /aʊ/ | 0.758s | 14814 | MIT isolated `aʊ.mp3` | pass |
| `ia` | /ɪə/ | 0.325s | 3326 | Piper IPA `[[ɪə]]` | needs-listen: synthetic IPA |
| `ea` | /eə/ | 0.325s | 3247 | Piper IPA `[[eə]]` | needs-listen: synthetic IPA |
| `ua` | /ʊə/ | 0.360s | 3194 | Piper IPA `[[ʊə]]` | needs-listen: synthetic IPA |
| `p` | /p/ | 0.157s | 3755 | MIT isolated `p.mp3` | pass |
| `t` | /t/ | 0.157s | 5323 | MIT isolated `t.mp3` | pass |
| `k` | /k/ | 0.157s | 3860 | MIT isolated `k.mp3` | pass |
| `f` | /f/ | 0.549s | 12887 | MIT isolated `f.mp3` | pass |
| `th_clear` | /θ/ | 0.392s | 9916 | MIT isolated `θ.mp3` | pass |
| `s` | /s/ | 0.549s | 14195 | MIT isolated `s.mp3` | pass |
| `sh` | /ʃ/ | 0.679s | 19412 | MIT isolated `ʃ.mp3` | pass |
| `tsh` | /tʃ/ | 0.496s | 14716 | MIT isolated `tʃ.mp3` | pass |
| `h` | /h/ | 0.444s | 9600 | MIT isolated `h.mp3` | pass |
| `b` | /b/ | 0.444s | 8501 | MIT isolated `b.mp3` | pass |
| `d` | /d/ | 0.444s | 8240 | MIT isolated `d.mp3` | pass |
| `g` | /g/ | 0.522s | 10537 | MIT isolated `ɡ.mp3` | pass |
| `v` | /v/ | 0.679s | 14661 | MIT isolated `v.mp3` | pass |
| `th_voice` | /ð/ | 0.627s | 12337 | MIT isolated `ð.mp3` | pass |
| `z` | /z/ | 0.522s | 12574 | MIT isolated `z.mp3` | pass |
| `zh` | /ʒ/ | 1.156s | 6408 | Manual replacement `ybmp3.rar/n3.mp3` (`对应文件.doc`: `ʒ=n3`) | needs-license-record: manual source |
| `dzh` | /dʒ/ | 0.444s | 8503 | MIT isolated `dʒ.mp3` | pass |
| `r` | /r/ | 0.653s | 11315 | MIT isolated `ɹ.mp3` | pass |
| `m` | /m/ | 0.549s | 10901 | MIT isolated `m.mp3` | pass |
| `n` | /n/ | 0.627s | 12021 | MIT isolated `n.mp3` | pass |
| `ng` | /ŋ/ | 0.758s | 11940 | MIT isolated `ŋ.mp3` | pass |
| `l` | /l/ | 0.325s | 3116 | Piper IPA `[[lː]]` | needs-listen: synthetic IPA |
| `j` | /j/ | 0.287s | 6991 | MIT isolated `j.mp3` | pass |
| `w` | /w/ | 0.522s | 9649 | MIT isolated `w.mp3` | pass |
| `tr` | /tr/ | 0.392s | 7876 | MIT isolated `tɹ.mp3` | pass |
| `dr` | /dr/ | 0.549s | 10747 | MIT isolated `dɹ.mp3` | pass |
| `ts` | /ts/ | 0.174s | 2572 | Piper IPA `[[ts]]` | needs-listen: synthetic IPA |
| `dz` | /dz/ | 0.395s | 3586 | Piper IPA `[[dz]]` | needs-listen: synthetic IPA |
