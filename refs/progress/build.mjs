// Regenerates refs/progress/index.html from refs/progress/state.json.
//   node refs/progress/build.mjs
// The HTML is published as an Artifact, so it must be fully self-contained:
// fonts are inlined as data URIs, no external requests.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..', '..')
const state = JSON.parse(readFileSync(join(here, 'state.json'), 'utf8'))

function font(path) {
  return readFileSync(join(repo, 'node_modules/@fontsource', path)).toString('base64')
}
const faces = {
  display: font('bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff2'),
  body: font('bricolage-grotesque/files/bricolage-grotesque-latin-400-normal.woff2'),
  bodyMed: font('bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff2'),
  mono: font('geist-mono/files/geist-mono-latin-400-normal.woff2'),
  monoMed: font('geist-mono/files/geist-mono-latin-500-normal.woff2'),
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const VERDICT = {
  ours: { label: 'ours', cls: 'win' },
  reference: { label: 'ref', cls: 'loss' },
  pending: { label: '—', cls: 'idle' },
}

function scoreboard() {
  const rows = state.references.map((ref) => {
    const judged = state.pieces.flatMap((p) =>
      (p.rounds ?? []).filter((r) => r.reference === ref.id && r.verdict),
    )
    const wins = judged.filter((r) => r.verdict === 'ours').length
    const total = judged.length
    const pct = total ? Math.round((wins / total) * 100) : 0
    return `
      <div class="score">
        <div class="score-head">
          <span class="score-name">${esc(ref.name)}</span>
          <span class="score-count">${wins}<span class="of">/${total}</span></span>
        </div>
        <div class="meter" role="img" aria-label="${wins} of ${total} comparisons won against ${esc(ref.name)}">
          <span style="width:${pct}%"></span>
        </div>
        <p class="score-note">${esc(ref.note)}</p>
      </div>`
  })
  return rows.join('')
}

function pieceRow(piece) {
  const rounds = piece.rounds ?? []
  const cells = rounds
    .map((r) => {
      const v = VERDICT[r.verdict ?? 'pending'] ?? VERDICT.pending
      const ref = state.references.find((x) => x.id === r.reference)
      return `<span class="cell ${v.cls}" title="R${esc(r.round)} vs ${esc(ref?.name ?? r.reference)}: ${esc(
        r.why ?? 'not yet judged',
      )}">
        <b>${esc(ref?.name?.slice(0, 2).toUpperCase() ?? '??')}</b>${v.label}
      </span>`
    })
    .join('')

  const gap = piece.gap
    ? `<p class="gap"><span class="gap-tag">next gap</span>${esc(piece.gap)}</p>`
    : ''
  const latest = rounds.filter((r) => r.why).slice(-2)
  const whys = latest.length
    ? `<ul class="whys">${latest
        .map((r) => {
          const ref = state.references.find((x) => x.id === r.reference)
          return `<li><span class="why-ref">${esc(ref?.name ?? r.reference)}</span>${esc(r.why)}</li>`
        })
        .join('')}</ul>`
    : ''

  return `
    <article class="piece" data-status="${esc(piece.status ?? 'pending')}">
      <header class="piece-head">
        <span class="piece-key">${esc(piece.key)}</span>
        <h3>${esc(piece.name)}</h3>
        <span class="status status-${esc(piece.status ?? 'pending')}">${esc(piece.statusLabel ?? piece.status ?? 'pending')}</span>
      </header>
      <p class="scope">${esc(piece.scope ?? '')}</p>
      <div class="track">${cells || '<span class="cell idle">not judged yet</span>'}</div>
      ${whys}
      ${gap}
    </article>`
}

const html = `<title>${esc(state.title)}</title>
<style>
  @font-face{font-family:Bricolage;src:url(data:font/woff2;base64,${faces.body}) format('woff2');font-weight:400;font-display:swap}
  @font-face{font-family:Bricolage;src:url(data:font/woff2;base64,${faces.bodyMed}) format('woff2');font-weight:500;font-display:swap}
  @font-face{font-family:Bricolage;src:url(data:font/woff2;base64,${faces.display}) format('woff2');font-weight:600;font-display:swap}
  @font-face{font-family:GeistMono;src:url(data:font/woff2;base64,${faces.mono}) format('woff2');font-weight:400;font-display:swap}
  @font-face{font-family:GeistMono;src:url(data:font/woff2;base64,${faces.monoMed}) format('woff2');font-weight:500;font-display:swap}

  :root{
    --ground:#F2F2EF; --panel:#FBFBF9; --ink:#15181A; --ink-2:#4E585E; --ink-3:#7E8990;
    --rule:#DFE0DB; --rule-2:#EBEBE6;
    --signal:#B35A0A; --win:#1C7A46; --loss:#AE3527; --idle:#A7AFB3;
    --shadow:0 1px 0 rgba(21,24,26,.04), 0 8px 24px -18px rgba(21,24,26,.5);
  }
  @media (prefers-color-scheme: dark){
    :root{
      --ground:#0D1012; --panel:#15191B; --ink:#E9EBEA; --ink-2:#9BA5AA; --ink-3:#6B767C;
      --rule:#242A2D; --rule-2:#1C2124;
      --signal:#E39149; --win:#4FBE84; --loss:#E2695A; --idle:#4A5257;
      --shadow:0 1px 0 rgba(0,0,0,.4), 0 10px 30px -22px #000;
    }
  }
  :root[data-theme="light"]{
    --ground:#F2F2EF; --panel:#FBFBF9; --ink:#15181A; --ink-2:#4E585E; --ink-3:#7E8990;
    --rule:#DFE0DB; --rule-2:#EBEBE6;
    --signal:#B35A0A; --win:#1C7A46; --loss:#AE3527; --idle:#A7AFB3;
    --shadow:0 1px 0 rgba(21,24,26,.04), 0 8px 24px -18px rgba(21,24,26,.5);
  }
  :root[data-theme="dark"]{
    --ground:#0D1012; --panel:#15191B; --ink:#E9EBEA; --ink-2:#9BA5AA; --ink-3:#6B767C;
    --rule:#242A2D; --rule-2:#1C2124;
    --signal:#E39149; --win:#4FBE84; --loss:#E2695A; --idle:#4A5257;
    --shadow:0 1px 0 rgba(0,0,0,.4), 0 10px 30px -22px #000;
  }

  body{background:var(--ground);color:var(--ink);font-family:Bricolage,ui-sans-serif,system-ui,sans-serif;
    -webkit-font-smoothing:antialiased;line-height:1.5}
  .wrap{max-width:78rem;margin:0 auto;padding:clamp(1.75rem,4vw,3.5rem) clamp(1.1rem,3.5vw,2.75rem) 5rem}

  .mast{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1.25rem 2rem;
    padding-bottom:1.5rem;border-bottom:1px solid var(--rule)}
  .mast h1{font-weight:600;font-size:clamp(1.7rem,3.6vw,2.65rem);line-height:1.02;letter-spacing:-.03em;text-wrap:balance;max-width:20ch}
  .mast p{color:var(--ink-2);margin-top:.55rem;max-width:52ch;font-size:.95rem}
  .stamp{font-family:GeistMono,ui-monospace,monospace;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;
    color:var(--ink-3);text-align:right;display:grid;gap:.3rem}
  .stamp b{color:var(--signal);font-weight:500;font-size:.78rem;letter-spacing:.08em}

  .scores{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.9rem;margin-top:1.6rem}
  .score{background:var(--panel);border:1px solid var(--rule);border-radius:2px;padding:.95rem 1.05rem 1.05rem;box-shadow:var(--shadow)}
  .score-head{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem}
  .score-name{font-weight:600;letter-spacing:-.01em}
  .score-count{font-family:GeistMono,ui-monospace,monospace;font-variant-numeric:tabular-nums;font-size:1.15rem;font-weight:500}
  .score-count .of{color:var(--ink-3);font-size:.85rem}
  .meter{display:block;height:3px;background:var(--rule-2);margin:.7rem 0 .6rem;overflow:hidden}
  .meter span{display:block;height:100%;background:var(--win);transition:width .5s cubic-bezier(.22,1,.36,1)}
  .score-note{font-size:.78rem;color:var(--ink-3);font-family:GeistMono,ui-monospace,monospace;letter-spacing:-.01em}

  .section-label{font-family:GeistMono,ui-monospace,monospace;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;
    color:var(--ink-3);margin:2.6rem 0 .85rem;display:flex;align-items:center;gap:.75rem}
  .section-label::after{content:"";flex:1;height:1px;background:var(--rule)}

  .pieces{display:grid;grid-template-columns:repeat(auto-fill,minmax(20.5rem,1fr));gap:.9rem}
  .piece{background:var(--panel);border:1px solid var(--rule);border-radius:2px;padding:1rem 1.1rem 1.15rem;
    box-shadow:var(--shadow);display:flex;flex-direction:column;gap:.6rem}
  .piece[data-status="building"]{border-color:color-mix(in oklab,var(--signal) 45%,var(--rule))}
  .piece-head{display:flex;align-items:center;gap:.6rem}
  .piece-key{font-family:GeistMono,ui-monospace,monospace;font-size:.72rem;font-weight:500;color:var(--ink-3);
    border:1px solid var(--rule);padding:.1rem .35rem;border-radius:2px}
  .piece-head h3{font-weight:600;font-size:1.02rem;letter-spacing:-.015em;flex:1;min-width:0}
  .status{font-family:GeistMono,ui-monospace,monospace;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
  .status-building{color:var(--signal)}
  .status-judging{color:var(--signal)}
  .status-passing{color:var(--win)}
  .scope{font-size:.83rem;color:var(--ink-2)}
  .track{display:flex;flex-wrap:wrap;gap:.3rem}
  .cell{font-family:GeistMono,ui-monospace,monospace;font-size:.68rem;letter-spacing:.02em;
    border:1px solid var(--rule);padding:.18rem .4rem;border-radius:2px;color:var(--ink-3);display:inline-flex;gap:.3rem}
  .cell b{font-weight:500;color:var(--ink-2)}
  .cell.win{border-color:color-mix(in oklab,var(--win) 55%,transparent);color:var(--win)}
  .cell.loss{border-color:color-mix(in oklab,var(--loss) 55%,transparent);color:var(--loss)}
  .whys{display:grid;gap:.35rem;font-size:.8rem;color:var(--ink-2)}
  .whys li{list-style:none;padding-left:.1rem;text-wrap:pretty}
  .why-ref{font-family:GeistMono,ui-monospace,monospace;font-size:.66rem;text-transform:uppercase;letter-spacing:.08em;
    color:var(--ink-3);margin-right:.45rem}
  .gap{font-size:.83rem;color:var(--ink);border-top:1px dashed var(--rule);padding-top:.6rem;margin-top:auto;text-wrap:pretty}
  .gap-tag{font-family:GeistMono,ui-monospace,monospace;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;
    color:var(--signal);display:block;margin-bottom:.2rem}

  .log{display:grid;gap:.5rem;font-size:.85rem;color:var(--ink-2)}
  .log li{list-style:none;display:grid;grid-template-columns:auto 1fr;gap:.75rem;align-items:baseline;
    border-bottom:1px solid var(--rule-2);padding-bottom:.5rem;text-wrap:pretty}
  .log time{font-family:GeistMono,ui-monospace,monospace;font-size:.7rem;color:var(--ink-3);white-space:nowrap}
  .empty{color:var(--ink-3);font-size:.85rem}

  @media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
</style>

<div class="wrap">
  <header class="mast">
    <div>
      <h1>${esc(state.title)}</h1>
      <p>${esc(state.subtitle)}</p>
    </div>
    <div class="stamp">
      <span>Round ${esc(state.round)}</span>
      <b>${esc(state.phase)}</b>
      <span>${esc(state.updated)}</span>
    </div>
  </header>

  <div class="scores">${scoreboard()}</div>

  <p class="section-label">Pieces</p>
  <div class="pieces">
    ${state.pieces.length ? state.pieces.map(pieceRow).join('') : '<p class="empty">No pieces in flight yet.</p>'}
  </div>

  <p class="section-label">Log</p>
  <ul class="log">
    ${
      state.notes.length
        ? state.notes
            .slice()
            .reverse()
            .map((n) => `<li><time>${esc(n.at)}</time><span>${esc(n.text)}</span></li>`)
            .join('')
        : '<li class="empty">Nothing logged yet.</li>'
    }
  </ul>
</div>
`

writeFileSync(join(here, 'index.html'), html)
console.log(`wrote index.html (${(html.length / 1024).toFixed(0)}kb)`)
