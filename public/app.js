(function () {
  'use strict';

  var EX = {
    hello: ['Assalamu Alaikum',
`adda shuru
  bolo "Assalamu Alaikum, adda-te shagotom!";
adda shesh`],
    variable: ['Variable',
`adda shuru
  dhoro naam = "Sarder";
  dhoro boyosh = 20 + 2;
  dhoro pass = thik;
  dhoro kichu = khali;
  boyosh += 1;
  bolo naam, boyosh, pass, kichu;
adda shesh`],
    output: ['Output',
`adda shuru
  // jog, gun, tulona
  bolo "Jog fol:", 5 + 7 * 2;
  bolo 10 > 3, 4 == 5;
adda shesh`],
    shorto: ['Shorto',
`adda shuru
  dhoro taka = 45;
  jodi (taka > 100) {
    bolo "Boro adda!";
  } nahole jodi (taka > 40 && taka < 60) {
    bolo "Cha ar singara hobe";
  } nahole {
    bolo "Sudhu cha";
  }
adda shesh`],
    loop: ['Loop',
`adda shuru
  dhoro i = 0;
  jotokkhon (i < 10) {
    i += 1;
    jodi (i == 3) { porerta; }
    jodi (i == 7) { thamo; }
    bolo "dhap", i;
  }
adda shesh`],
    cha: ['Cha-er hishab',
`adda shuru
  // prottek kap cha 12 taka
  dhoro kap = 1;
  dhoro dam = 0;
  jotokkhon (kap <= 5) {
    dam += 12;
    jodi (kap % 2 == 0) {
      bolo kap, "kap cha, total", dam, "taka";
    }
    kap += 1;
  }
  bolo "Mot dam:", dam, "taka";
adda shesh`],
    kaj: ['Kaj (function)',
`adda shuru
  kaj jog(a, b) {
    ferot a + b;
  }
  kaj fib(n) {
    jodi (n < 2) { ferot n; }
    ferot fib(n - 1) + fib(n - 2);
  }
  bolo jog(2, 3);
  bolo "fib(10) =", fib(10);
adda shesh`],
    talika: ['Talika (list)',
`adda shuru
  dhoro fol = ["aam", "jam"];
  jogkoro(fol, "kathal");
  fol[0] = "lichu";
  bolo fol, doirgho(fol);
  bolo "Prothom:", fol[0];
  bolo sajao([5, 2, 8, 1]);
adda shesh`],
    proti: ['Proti loop',
`adda shuru
  proti (dhoro i = 1; i <= 3; i += 1) {
    bolo "dhap", i;
  }
  proti (x moddhe porisima(1, 6)) {
    jodi (x % 2 == 0) { bolo x, "jor"; }
  }
  proti (okkhor moddhe "adda") {
    bolo okkhor;
  }
adda shesh`],
    lekha: ['Lekha-r kaj',
`adda shuru
  dhoro naam = "adda lang";
  bolo boro_hater(naam), doirgho(naam);
  dhoro tukro = bhango("cha,singara,jhalmuri", ",");
  bolo tukro;
  bolo jora(tukro, " + ");
  bolo sonkhya("40") + 2, dhoron(naam);
adda shesh`],
    bhul: ['Bhul dekho',
`adda shuru
  dhoro a = 10;
  bolo "shuru";
  bolo a + b;
adda shesh`],
  };

  var DOCS = [
    ['Shuru ar shesh', 'Prottek program <code>adda shuru</code> diye shuru hoy ar <code>adda shesh</code> diye shesh hoy. Er baire ja kichu thakbe ignore hobe.', 'hello'],
    ['Variable', '<code>dhoro</code> diye variable toiri hoy. Number, string, <code>thik</code>, <code>bhul</code> ar <code>khali</code> (null) cholbe. <code>+=</code>, <code>-=</code>, <code>*=</code>, <code>/=</code> diye shortcut-e value badlano jay.', 'variable'],
    ['Output', '<code>bolo</code> diye jekono kichu print koro. Comma diye ekadhik jinis dewa jay. <code>//</code> diye comment lekha jay.', 'output'],
    ['Shorto', '<code>jodi</code> sotti hole block chole. Na hole <code>nahole jodi</code> ba <code>nahole</code> block chole. <code>&amp;&amp;</code>, <code>||</code>, <code>!</code> bebohar kora jay.', 'shorto'],
    ['Loop', '<code>jotokkhon</code> shorto thik thakbe totokkhon loop cholbe. <code>thamo</code> loop bhange, <code>porerta</code> porer dhape jay.', 'loop'],
    ['Kaj (function)', '<code>kaj</code> diye nijer function banao, <code>ferot</code> diye value fire pao. Kaj nijeke nijei daktey pare (recursion), ar niche likhleo uporey dakha jay.', 'kaj'],
    ['Talika (list)', '<code>[1, 2, 3]</code> diye talika hoy. <code>talika[0]</code> diye dekho (position 0 theke shuru), <code>talika[0] = 5;</code> diye bodlao. <code>jogkoro</code>, <code>berkoro</code>, <code>doirgho</code>, <code>sajao</code>, <code>ulto</code>, <code>ache</code> cholbe.', 'talika'],
    ['Proti loop', '<code>proti (dhoro i = 0; i &lt; 5; i += 1)</code> diye gona loop, ar <code>proti (x moddhe talika)</code> diye talika ba lekha-r prottek ta dekha jay. <code>porisima(1, 6)</code> 1 theke 5 porjonto talika dey.', 'proti'],
    ['Lekha-r kaj', '<code>boro_hater</code>, <code>chhoto_hater</code>, <code>bhango</code>, <code>jora</code>, <code>sonkhya</code>, <code>lekha</code>, <code>dhoron</code> diye lekha ar type niye kaj kora jay. Sathe <code>borgomul</code>, <code>niche</code>, <code>upore</code>, <code>gol</code>, <code>porom</code>, <code>sorboccho</code>, <code>sornimno</code>, <code>random</code>.', 'lekha'],
    ['Bhul ar safety', 'Bhul hole output-er shathe line number dekha jay, editor-e oi line lal hoye jay. Loop kokhono shesh na hole interpreter nijei thame jay, tai browser hang hoy na.', 'bhul'],
  ];

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  /* ---------- syntax highlight ---------- */
  var KW = { dhoro: 1, bolo: 1, jodi: 1, nahole: 1, jotokkhon: 1, thamo: 1, porerta: 1, kaj: 1, ferot: 1, proti: 1, moddhe: 1 };
  var LIT = { thik: 1, bhul: 1, khali: 1 };
  var TOKEN = /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\badda[ \t]+(?:shuru|shesh)\b)|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(&&|\|\||[=!<>+\-*\/]=|[+\-*\/%<>=!])|([()\[\]{},;])/g;

  function highlight(src) {
    var out = '', last = 0, m, cls;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src))) {
      out += esc(src.slice(last, m.index));
      cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'a' : m[4] ? 'n' : m[5] ? (KW[m[0]] ? 'k' : LIT[m[0]] ? 'l' : '') : m[6] ? 'o' : 'p';
      out += cls ? '<span class="t-' + cls + '">' + esc(m[0]) + '</span>' : esc(m[0]);
      last = TOKEN.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('adda-theme', t); } catch (e) {}
    var m = document.getElementById('tc');
    if (m) m.setAttribute('content', t === 'dark' ? '#0F0D24' : '#EEF6F3');
  }
  $('theme').onclick = function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
  setTheme(root.getAttribute('data-theme'));

  /* ---------- editor ---------- */
  var src = $('src'), hl = $('hl'), gut = $('gut'), layer = $('layer'), editor = $('editor');
  var out = $('out'), stat = $('stat'), runBtn = $('run');
  var errLine = 0, lineCount = 0, trapTab = true;

  function drawGutter() {
    var n = src.value.split('\n').length, s = '';
    for (var i = 1; i <= n; i++) s += (i === errLine ? '<span class="err">' + i + '</span>' : i) + '\n';
    gut.innerHTML = s;
    lineCount = n;
  }
  function sync() {
    layer.style.transform = 'translate(' + (-src.scrollLeft) + 'px,' + (-src.scrollTop) + 'px)';
    gut.style.transform = 'translateY(' + (-src.scrollTop) + 'px)';
  }
  function redraw() {
    hl.innerHTML = highlight(src.value) + '\n';
    drawGutter();
    sync();
  }
  function setErr(line) {
    errLine = line || 0;
    if (errLine) { editor.setAttribute('data-err', ''); editor.style.setProperty('--el', errLine); }
    else { editor.removeAttribute('data-err'); }
    drawGutter();
  }
  src.addEventListener('input', function () { if (errLine) setErr(0); redraw(); });
  src.addEventListener('scroll', sync);
  src.addEventListener('focus', function () { trapTab = true; });
  src.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); return; }
    if (e.key === 'Escape') { trapTab = false; return; }
    if (e.key === 'Tab' && trapTab && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      var a = src.selectionStart, b = src.selectionEnd;
      src.value = src.value.slice(0, a) + '  ' + src.value.slice(b);
      src.selectionStart = src.selectionEnd = a + 2;
      src.dispatchEvent(new Event('input'));
    }
  });

  function setCode(code) { src.value = code; setErr(0); redraw(); src.scrollTop = 0; src.scrollLeft = 0; sync(); }

  /* ---------- run ---------- */
  function showOutput(res, ms) {
    var html = '';
    (res.output || []).forEach(function (l, i) {
      html += '<div class="ol" style="animation-delay:' + Math.min(i * 70, 1200) + 'ms">' + esc(l) + '</div>';
    });
    if (!res.ok && res.error) {
      var at = res.error.line ? ' (line ' + res.error.line + ')' : '';
      html += '<div class="errbox" role="alert"><span class="eb-ico" aria-hidden="true">!</span><div class="eb-body">' +
        '<div class="eb-title">Bhul' + (res.error.line ? '<span class="eb-line">line ' + res.error.line + '</span>' : '') + '</div>' +
        '<div class="eb-msg">' + esc(res.error.message) + '</div></div></div>';
      setErr(res.error.line);
      stat.textContent = 'Bhul hoyeche';
      stat.className = 'stat bad';
    } else {
      setErr(0);
      if (!html) html = '<p class="ph">(kichu print hoyni)</p>';
      stat.textContent = 'Shofol, ' + (ms < 1 ? '<1' : Math.round(ms)) + 'ms';
      stat.className = 'stat';
    }
    out.innerHTML = html;
  }

  var mode = 'browser', runId = 0;
  function localRun() {
    var t0 = performance.now(), res;
    try { res = window.AddaLang.run(src.value); }
    catch (e) { res = { ok: false, output: [], error: { message: 'Ekta ochena bhul hoyeche', line: null } }; }
    showOutput(res, performance.now() - t0);
  }
  function pulse() {
    runBtn.classList.remove('go');
    void runBtn.offsetWidth;
    runBtn.classList.add('go');
  }
  function run() {
    var id = ++runId;
    pulse();
    if (mode === 'server') {
      runBtn.disabled = true;
      stat.textContent = 'Server-e chalche...'; stat.className = 'stat';
      var t0 = performance.now();
      return fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: src.value }),
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (id === runId) showOutput(res, performance.now() - t0);
      }).catch(function () {
        if (id !== runId) return;
        out.innerHTML = '<div class="errbox">Server-er sathe jogajog hocche na. Browser-e chalao mode-e jete paro.</div>';
        stat.textContent = 'Bhul hoyeche'; stat.className = 'stat bad';
      }).then(function () { runBtn.disabled = false; });
    }
    if (!window.AddaLang) {
      out.innerHTML = '<div class="errbox">Interpreter load hoyni. Page reload koro.</div>';
      return;
    }
    localRun();
  }
  runBtn.onclick = run;
  $('clear').onclick = function () {
    out.innerHTML = '<p class="ph">Chalao chaple output ekhane dekha jabe.</p>';
    stat.textContent = '';
    setErr(0);
  };

  var seg = $('mode');
  seg.onclick = function (e) {
    var m = e.target.getAttribute && e.target.getAttribute('data-mode');
    if (!m) return;
    mode = m;
    Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false'); });
    run();
  };

  /* ---------- copy / share ---------- */
  function flash(btn, text) {
    var old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = text;
    setTimeout(function () { btn.textContent = old; }, 1600);
  }
  function copyText(text, btn, done) {
    var fallback = function () {
      var t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); flash(btn, done); } catch (e) { flash(btn, 'Hoyni'); }
      document.body.removeChild(t);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(btn, done); }, fallback);
    } else fallback();
  }
  function b64enc(s) {
    var bytes = new TextEncoder().encode(s), bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64dec(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  $('copy').onclick = function () { copyText(src.value, this, 'Copy hoyeche'); };
  $('share').onclick = function () {
    var url = location.origin + location.pathname + '#code=' + b64enc(src.value);
    copyText(url, this, 'Link copy hoyeche');
  };

  /* ---------- chips ---------- */
  var chips = $('chips'), active = null;
  function pick(id) {
    active = id;
    Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c.dataset.id === id ? 'true' : 'false'); });
    setCode(EX[id][1]);
  }
  Object.keys(EX).forEach(function (id) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.id = id; b.textContent = EX[id][0];
    b.setAttribute('aria-pressed', 'false');
    b.onclick = function () { pick(id); run(); };
    chips.appendChild(b);
  });

  /* ---------- docs ---------- */
  $('docs-list').innerHTML = DOCS.map(function (d) {
    return '<article class="doc"><div><h3>' + d[0] + '</h3><p>' + d[1] + '</p></div>' +
      '<div class="ex"><pre>' + highlight(EX[d[2]][1]) + '</pre><div class="foot-bar"><button type="button" data-ex="' + d[2] + '">Playground-e chalao</button></div></div></article>';
  }).join('');
  $('docs-list').onclick = function (e) {
    var id = e.target.getAttribute && e.target.getAttribute('data-ex');
    if (!id) return;
    pick(id); run();
    $('playground').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ---------- start ---------- */
  var loaded = false;
  if (location.hash.indexOf('#code=') === 0) {
    try { setCode(b64dec(location.hash.slice(6))); loaded = true; } catch (e) {}
  }
  if (!loaded) pick('hello');
  run();
})();
