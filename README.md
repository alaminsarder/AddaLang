<div align="center">

# AddaLang

**Banglish keyword-e lekha ekta chhoto programming language**

Code likhle mone hobe adda dichho.

![Language](https://img.shields.io/badge/language-Banglish-0A9CA8?style=for-the-badge)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-066B8A?style=for-the-badge&logo=node.js&logoColor=white)
![Version](https://img.shields.io/badge/version-2.0.0-27B5C4?style=for-the-badge)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-addalang.vercel.app-0A9CA8?style=for-the-badge&logo=vercel&logoColor=white)](https://addalang.vercel.app/)

[Live site](https://addalang.vercel.app/) · [Source code](https://github.com/alaminsarder/AddaLang) · [Developer](https://github.com/alaminsarder)

</div>

---

## Live demo

Install chhara browser-ei code likhe chalao: **https://addalang.vercel.app/**

---

## Ki ki ache

- **Banglish keyword:** `dhoro`, `bolo`, `jodi`, `jotokkhon` ityadi
- **CLI:** terminal theke `.adda` file chalano
- **Web playground:** syntax highlight, line number, error line highlight
- **Example chip:** ek click-e example load
- **Copy ar Share:** code copy ba link share
- **Light ar Dark theme:** ek click-e bodlano jay

---

## Keywords

| Keyword | Kaj |
| --- | --- |
| `adda shuru` / `adda shesh` | Program shuru ar shesh. Er baire ja thakbe ignore hobe |
| `dhoro` | Notun variable banano |
| `bolo` | Output dekhano. Comma diye onek kichu dewa jay |
| `jodi` / `nahole jodi` / `nahole` | Shorto mille ki hobe, na mille ki hobe |
| `jotokkhon` | Shorto thik thakle loop cholbe |
| `thamo` / `porerta` | Loop bhango, ba ei dhap chhere porer dhape jao |
| `thik` / `bhul` / `khali` | Sotti, mittha, ar kichui na |

### Operator

| Dhoron | Operator |
| --- | --- |
| Hishab | `+` `-` `*` `/` `%` |
| Tulona | `==` `!=` `<` `>` `<=` `>=` |
| Jukti | `&&` `\|\|` `!` |
| Shortcut | `+=` `-=` `*=` `/=` |

---

## Shuru kora

Node.js install thakte hobe.

```
git clone https://github.com/alaminsarder/AddaLang.git
cd AddaLang
npm install
```

## Project structure

```
addalang/
├── api/          health.js, run.js
├── bin/          adda.js (CLI)
├── examples/     hello.adda
├── public/       index.html, style.css, app.js, adda.js (generated)
├── scripts/      build.js, serve.js
├── src/          lexer, parser, interpreter, errors, index
├── test/         adda.test.js, api.test.js
└── package.json
```

---

## Kibhabe kaj kore

1. **Lexer** source code ke token-e bhange
2. **Parser** token theke syntax tree banay
3. **Interpreter** oi tree chalay
4. **Errors** kono bhul thakle line shoho message dey

CLI ar browser playground dutoi ek-i engine use kore.

---

<div align="center">

Developed by [**AL Amin Sarder**](https://github.com/alaminsarder)

© 2026 AddaLang. All rights reserved.

</div>
