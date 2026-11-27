<div align="center">

# AddaLang

**Banglish keyword-e lekha ekta chhoto programming language**

Code likhle mone hobe adda dichho.

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

| `adda shuru` / `adda shesh` | Program shuru ar shesh. Er baire ja thakbe ignore hobe |
| `dhoro` | Notun variable banano |
| `bolo` | Output dekhano. Comma diye onek kichu dewa jay |
| `jodi` / `nahole jodi` / `nahole` | Shorto mille ki hobe, na mille ki hobe |
| `jotokkhon` | Shorto thik thakle loop cholbe |
| `proti` / `moddhe` | Gona loop: `proti (dhoro i = 0; i < 5; i += 1)`, ba prottek ta dhore: `proti (x moddhe talika)` |
| `kaj` / `ferot` | Function banano ar value fera. Recursion cholbe, niche likhleo uporey dakha jay |
| `[ ]` | Talika (list): `[1, 2, 3]`, `a[0]`, `a[0] = 5;` |
| `thamo` / `porerta` | Loop bhango, ba ei dhap chhere porer dhape jao |
| `thik` / `bhul` / `khali` | Sotti, mittha, ar kichui na |

### Built-in function

| Dhoron | Function |
| --- | --- |
| Talika | `doirgho` `jogkoro` `berkoro` `ache` `ulto` `sajao` `porisima` |
| Lekha | `boro_hater` `chhoto_hater` `bhango` `jora` |
| Number | `borgomul` `niche` `upore` `gol` `porom` `sorboccho` `sornimno` `random` |
| Type | `sonkhya` `lekha` `dhoron` |

```
adda shuru
  kaj jog(a, b) { ferot a + b; }
  dhoro fol = ["aam", "jam"];
  jogkoro(fol, "kathal");
  proti (f moddhe fol) { bolo f, doirgho(f); }
  bolo jog(2, 3);
adda shesh
```

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
├── examples/     hello.adda, talika.adda
├── public/       index.html, style.css, app.js, adda.js (generated)
├── scripts/      build.js, serve.js
├── src/          preprocessor, mapping, lexer, parser, interpreter, errors, index
├── test/         adda.test.js, api.test.js
└── package.json
```

---

## Kibhabe kaj kore

1. **Preprocessor** source porishkar kore (BOM, CRLF) ar `adda shuru` / `adda shesh`-er bhetorer code ber kore
2. **Mapping** keyword, literal ar operator-er talika ek jayegay rakhe
3. **Lexer** (tokenization) code ke token-e bhange
4. **Parser** token theke syntax tree banay
5. **Interpreter** oi tree chalay
6. **Errors** kono bhul thakle line shoho message dey

CLI ar browser playground dutoi ek-i engine use kore.

---

<div align="center">

Developed by [**AL Amin Sarder**](https://github.com/alaminsarder)

© 2026 AddaLang. All rights reserved.

</div>
