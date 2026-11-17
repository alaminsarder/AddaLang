# AddaLang

Banglish keyword-er toy programming language. JavaScript diye lekha, interpreter browser-ei chole.

## Chalano
    npm start                              # build + http://localhost:3000
    node bin/adda.js examples/hello.adda   # CLI
    npm test

## Vercel-e deploy
1. Project-ta GitHub-e push koro (ba `vercel` CLI use koro).
2. Vercel-e "Add New Project" -> repo bachho -> **Deploy**. Kono setting badlate hobe na (`vercel.json` shob thik kore dey).

## Folder
- src/              lexer -> parser -> interpreter (language-er mul code)
- scripts/build.js  src/ theke browser bundle `public/adda.js` banay (Vercel-e auto cholbe)
- scripts/serve.js  local preview server (kono dependency nai)
- public/           website: index.html, style.css, app.js, favicon.svg
- api/run.js, api/health.js  Vercel serverless backend (POST /api/run)
- bin/adda.js       CLI

Keyword badlate chaile `src/lexer.js`, `src/parser.js`, `src/index.js` ar `public/app.js`-er highlight list-e ek-i naam badlao.
