const { CompositionStage, useComposition, Easing } = window;

const AS = 1, AX = 80, AY = 100;
const BP = { bg: '#FFFFFF', line: '#0B8FC2', fill: '#2ACCFF14', grid: '#2ACCFF1F', text: '#E8EEF2', mute: '#8FA6B8', accent: '#FFB547' };
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const M = { enter: Easing.easeOutCubic, move: Easing.easeInOutCubic, draw: Easing.easeInOutQuad };
const cl = (v) => Math.max(0, Math.min(1, v));
const tw = (t, a, b, ease) => (ease || M.move)(cl((t - a) / (b - a)));
const lerp = (a, b, p) => a + (b - a) * p;
const LR = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });

const K = 1.4;
function phases(T, start, dur, c1) {
  const t = (T - start) / K;
  return {
    t,
    focus: tw(t, 0, 0.4, M.enter) * (1 - tw(t, dur - 0.6, dur, M.enter)),
    hl: tw(t, 0.1, 0.7, M.draw),
    call: tw(t, 0.2, 0.6, M.enter) * (1 - tw(t, dur - 0.5, dur - 0.1, M.enter)),
    bp: tw(t, 0.9, 0.95, M.enter) * (1 - tw(t, c1 + 0.85, c1 + 0.9, M.enter)),
    wipe: tw(t, 0.95, 1.75, M.move),
    rev: tw(t, c1 + 0.05, c1 + 0.85, M.move),
    cdim: tw(t, 1.75, 2.2, M.move) * (1 - tw(t, c1 - 0.4, c1 - 0.05, M.move)),
    lines: tw(t, 1.2, 2.0, M.draw),
    p: tw(t, 1.9, c1, M.move),
    before: 1 - tw(t, 1.75, 1.8, M.enter),
    after: tw(t, c1 - 0.05, c1, M.enter),
    fix: tw(t, c1 + 0.45, c1 + 1.05, M.enter)
  };
}

// ---------- small UI atoms (Amplifidor tokens) ----------
const ICON = {
  mail: 'M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6', note: 'M6 4h9l3 3v13H6zM9 10h6M9 13.5h6M9 17h4',
  doc: 'M7 3.5h7l4 4V20.5H7zM14 3.5v4h4', deal: 'M4 12l8-8h7v7l-8 8zM15.5 8.5h.01',
  sys: 'M12 8v4l2.5 1.5M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0', reply: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v5',
  chev: 'M9 6l6 6-6 6', down: 'M6 9l6 6 6-6', star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  share: 'M12 15V4M8 8l4-4 4 4M5 13v6h14v-6', close: 'M6 6l12 12M18 6L6 18'
};
const Ic = ({ k, s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICON[k]} /></svg>;
const abs = (x, y, w, h, extra) => ({ position: 'absolute', left: 0, top: 0, width: w, height: h, boxSizing: 'border-box', transform: `translate(${x}px, ${y}px)`, ...extra });
const pill = (w, extra) => ({ width: w, height: 36, borderRadius: 999, background: 'var(--amp-gray-2)', color: 'var(--amp-gray-7)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 'none', ...extra });
const Tag = ({ tone, children, dot }) => {
  const t = { error: ['var(--amp-error-bg)', 'var(--amp-error)'], pending: ['#ff7d331f', 'var(--amp-pending)'], gray: ['var(--amp-gray-2)', 'var(--amp-gray-7)'], success: ['var(--amp-success-bg)', 'var(--amp-success)'] }[tone];
  return <span style={{ height: 22, padding: '0 8px', borderRadius: 999, background: t[0], color: t[1], fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, flex: 'none' }}>{dot ? <span style={{ width: 6, height: 6, borderRadius: 9, background: dot }} /> : null}{children}</span>;
};

const B_BTNS = [['Add to list', 104], ['Edit', 60], ['Run workflow', 124], ['Compose email', 136], ['star', 36], ['share', 36], ['⋯', 36]];
const btnRects = (right) => { let x = right - 580; return B_BTNS.map(([l, w]) => { const r = { x, y: 78, w, h: 36, l }; x += w + 8; return r; }); };
const rowR = (i) => ({ x: 96, y: 172 + i * 30, w: 284, h: 26 });
const FILLED = [['Industry', 'B2B SaaS'], ['Employees', '240'], ['HQ', 'Berlin'], ['Customer since', 'Mar 2024'], ['ARR', '$48k'], ['Owner', 'Alex'], ['Domain', 'northwind.io'], ['Stage', 'Customer']];
const EMPTY = ['Description', 'AngelList', 'Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'Founded', 'Funding', 'Revenue range', 'Parent company', 'Phone', 'Address', 'Timezone', 'Tags'];
const ID_PARTS = [['B2B SaaS', 72], ['240 people', 84], ['Berlin', 50], ['Customer since Mar 2024', 188], ['$48k ARR', 76]];
const idRects = (x0) => { let x = x0; const out = ID_PARTS.map(([l, w]) => { const r = { x, y: 148, w, h: 22 }; x += w + 20; return r; }); return { parts: out, details: { x, y: 148, w: 92, h: 22 } }; };
const TABS = [['Activity', 70], ['Emails (12)', 100], ['Notes (3)', 76], ['Tasks (2)', 78], ['Files', 44], ['Deals', 52]];
const tabRects = (x0, y) => { let x = x0; return TABS.map(([l, w]) => { const r = { x, y: y + 10, w, h: 24, l }; x += w + 16; return r; }); };
const SYS = [['Alex', 'viewed this record', 'Today'], ['Enrichment', 'updated 3 attributes', 'Tue'], ['HubSpot sync', 'completed', 'Mon'], ['Reminder', 'task “Send proposal” passed its due date', 'Sep 23'], ['Alex', 'changed Domains and 1 other attribute', 'Sep 17'], ['Workflow', '“Customer health” ran', 'Sep 15'], ['System', 'created this record', 'Mar 4, 2024']];
const REL = [['mail', 'Mia Chen', '“Re: Renewal pricing”', 'Tue'], ['note', 'Alex', '“Mia wants 3-year pricing before the QBR”', 'Mon'], ['doc', '', 'Northwind_Renewal_Proposal_v2.pdf', 'Mon'], ['mail', 'Alex → Mia', '“Renewal next steps”', 'Sep 19'], ['deal', 'Renewal 2027', 'moved to Proposal · $52k', 'Sep 18'], ['note', 'Alex', '“Call notes: expanding to 2 new teams”', 'Sep 12'], ['mail', 'Mia → Alex', '“Intro to our CFO”', 'Sep 10']];

// ---------- real UI layers ----------
function Chrome() {
  return <>
    <div style={abs(0, 0, 56, 900, { borderRight: '1px solid var(--amp-gray-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 14, color: 'var(--amp-gray-6)' })}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--amp-gray-7)', marginBottom: 6 }} />
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: i === 2 ? 'var(--amp-gray-3)' : 'var(--amp-gray-2)' }} />)}
    </div>
    <div style={abs(56, 0, 1384, 48, { borderBottom: '1px solid var(--amp-gray-2)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 32px', fontSize: 14 })}>
      <span style={{ color: 'var(--amp-gray-5)' }}>Companies</span><span style={{ color: 'var(--amp-gray-5)' }}>/</span><span>Northwind</span>
    </div>
  </>;
}

function NameBlock({ x, pillOp }) {
  return <>
    <div style={abs(x, 76, 40, 40, { borderRadius: 10, background: 'var(--amp-gray-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
      <svg width="22" height="22" viewBox="0 0 22 22"><path d="M4 17 11 4l7 13" fill="none" stroke="#000" strokeWidth="2.2" strokeLinejoin="round" /><circle cx="11" cy="14" r="2.2" fill="#000" /></svg>
    </div>
    <div style={abs(x + 52, 76, 180, 40, { display: 'flex', alignItems: 'center', fontFamily: 'var(--amp-font-display)', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' })}>Northwind</div>
    <div style={abs(x + 52 + 184, 84, 110, 24, { opacity: pillOp })}><Tag tone="success" dot="var(--amp-success)">Customer</Tag></div>
  </>;
}

function BeforeActions({ right, op }) {
  return <div style={abs(right - 580, 78, 580, 36, { display: 'flex', gap: 8, opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible' })}>
    {B_BTNS.map(([l, w]) => <div key={l} style={pill(w)}>{l === 'star' ? <Ic k="star" s={16} /> : l === 'share' ? <Ic k="share" s={16} /> : l}</div>)}
  </div>;
}
function AfterActions({ right, op }) {
  return <div style={abs(right - 188, 76, 188, 40, { display: 'flex', gap: 8, opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible' })}>
    <div style={pill(140, { height: 40, fontSize: 15 })}>Compose email</div>
    <div style={pill(40, { height: 40, fontSize: 18 })}>⋯</div>
  </div>;
}

function Sidebar({ op }) {
  return <div style={abs(88, 136, 300, 720, { opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible', borderRight: '1px solid var(--amp-gray-2)', fontSize: 14 })}>
    <div style={{ height: 36, display: 'flex', alignItems: 'center', fontWeight: 600 }}>Details</div>
    {FILLED.map(([l, v]) => <div key={l} style={{ height: 30, display: 'flex', alignItems: 'center' }}><span style={{ width: 124, flex: 'none', color: 'var(--amp-gray-6)' }}>{l}</span><span style={{ whiteSpace: 'nowrap' }}>{v}</span></div>)}
    {EMPTY.map(l => <div key={l} style={{ height: 30, display: 'flex', alignItems: 'center' }}><span style={{ width: 124, color: 'var(--amp-gray-6)' }}>{l}</span><span style={{ color: 'var(--amp-gray-5)' }}>Set {l}…</span></div>)}
  </div>;
}

function Identity({ x, op }) {
  const r = idRects(x);
  return <div style={{ opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible' }}>
    <div style={abs(x, 120, 400, 20, { fontSize: 14, color: 'var(--amp-gray-6)', display: 'flex', gap: 6, whiteSpace: 'nowrap' })}>northwind.io <span style={{ color: 'var(--amp-gray-4)' }}>·</span> Owner Alex</div>
    {r.parts.map((p, i) => <React.Fragment key={i}>
      {i > 0 ? <span style={abs(p.x - 13, 148, 8, 22, { fontSize: 16, color: 'var(--amp-gray-4)' })}>·</span> : null}
      <span style={abs(p.x, 148, p.w + 20, 22, { fontSize: 16, whiteSpace: 'nowrap' })}>{ID_PARTS[i][0]}</span>
    </React.Fragment>)}
    <span style={abs(r.details.x - 13, 148, 8, 22, { fontSize: 16, color: 'var(--amp-gray-4)' })}>·</span>
    <span style={abs(r.details.x, 148, 110, 22, { fontSize: 16, color: 'var(--amp-gray-5)', display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' })}>All details <Ic k="chev" /></span>
  </div>;
}

const TASKS = [
  ['Send renewal proposal', 'Due Sep 23 · v2 draft ready', <Tag tone="error">Overdue</Tag>, 'Send proposal', true],
  ['Reply to Mia', '“Re: Renewal pricing” · Tue', <Tag tone="gray" dot="#2ACCFF">Unanswered</Tag>, 'Reply', false],
  ['Schedule QBR', 'With Mia Chen', <Tag tone="pending">Due Fri</Tag>, 'Schedule', false]
];
function NeedsYou({ x, op }) {
  return <div style={abs(x, 204, 760, 244, { opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible', borderRadius: 16, background: '#fff', boxShadow: '0 0 0 1px var(--amp-gray-3)', overflow: 'hidden' })}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
      <span style={{ fontFamily: 'var(--amp-font-display)', fontSize: 18 }}>Needs you</span><span style={{ color: 'var(--amp-gray-5)', fontSize: 14 }}>3</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 14, color: 'var(--amp-gray-6)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><span style={{ color: 'var(--amp-gray-7)' }}>Renewal 2027</span>·<span>$52k</span>·<span>Proposal</span><Ic k="chev" /></span>
    </div>
    {TASKS.map(([t, s, tag, b, prim]) => <div key={t} style={{ height: 64, borderTop: '1px solid var(--amp-gray-2)', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 15 }}>{t}</span><span style={{ fontSize: 13, color: 'var(--amp-gray-5)' }}>{s}</span></div>
      {tag}
      <div style={{ minWidth: 112, height: 32, padding: '0 14px', borderRadius: 999, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: prim ? 'var(--amp-gray-7)' : '#fff', color: prim ? '#fff' : 'var(--amp-gray-7)', boxShadow: prim ? 'none' : 'inset 0 0 0 1px var(--amp-gray-3)' }}>{b}</div>
    </div>)}
  </div>;
}

function BeforeTimeline({ x, y, w, op, dimRow }) {
  let tx = 0;
  return <div style={abs(x, y, w, 900 - y, { opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible', overflow: 'hidden' })}>
    <div style={{ height: 44, borderBottom: '1px solid var(--amp-gray-2)', position: 'relative' }}>
      {TABS.map(([l, tw_], i) => { const left = tx; tx += tw_ + 16; return <span key={l} style={abs(left, 10, tw_ + 10, 24, { fontSize: 15, color: i === 0 ? 'var(--amp-gray-7)' : 'var(--amp-gray-6)', whiteSpace: 'nowrap' })}>{l}{i === 0 ? <span style={abs(0, 33, tw_ - 6, 2, { background: '#000', borderRadius: 2 })} /> : null}</span>; })}
    </div>
    <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--amp-gray-5)' }}>
      Showing
      <span style={{ height: 28, padding: '0 10px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--amp-gray-3)', color: 'var(--amp-gray-7)', display: 'flex', alignItems: 'center', gap: 4 }}>All activity <Ic k="down" s={12} /></span>
      <span style={{ height: 28, padding: '0 10px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--amp-gray-3)', color: 'var(--amp-gray-6)', display: 'flex', alignItems: 'center', gap: 4 }}>All users <Ic k="down" s={12} /></span>
      <span style={{ flex: 1 }} />Sort: Last modified
    </div>
    {SYS.map(([a, b, d], i) => <div key={i} style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--amp-gray-2)', fontSize: 15, opacity: i === 3 ? 1 - 0.65 * dimRow : 1 }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--amp-gray-2)', color: 'var(--amp-gray-6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic k="sys" /></span>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--amp-gray-6)' }}><span style={{ color: 'var(--amp-gray-7)' }}>{a}</span> {b}</span>
      <span style={{ fontSize: 14, color: 'var(--amp-gray-5)' }}>{d}</span>
    </div>)}
  </div>;
}

function AfterTimeline({ x, y, op }) {
  return <div style={abs(x, y, 760, 900 - y, { opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible', overflow: 'hidden' })}>
    <div style={{ height: 44, borderBottom: '1px solid var(--amp-gray-2)', display: 'flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--amp-font-display)', fontSize: 18 }}>Timeline</span><span style={{ flex: 1 }} />
      <span style={{ height: 32, width: 150, boxSizing: 'border-box', padding: '0 10px 0 12px', borderRadius: 999, background: 'var(--amp-gray-2)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Relationship <Ic k="down" /></span>
    </div>
    {REL.map(([ic, a, b, d], i) => <div key={i} style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--amp-gray-2)', fontSize: 15 }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--amp-gray-2)', color: 'var(--amp-gray-6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic k={ic} /></span>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a} {b}</span>
      <span style={{ fontSize: 14, color: 'var(--amp-gray-5)' }}>{d}</span><span style={{ color: 'var(--amp-gray-4)', display: 'flex' }}><Ic k="chev" /></span>
    </div>)}
  </div>;
}

function Panel({ x, op }) {
  return <div style={abs(x, 48, 440, 852, { opacity: op, visibility: op < 0.001 ? 'hidden' : 'visible', background: '#fff', boxShadow: '-1px 0 0 var(--amp-gray-3)', display: 'flex', flexDirection: 'column' })}>
    <div style={{ height: 72, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 0 24px', borderBottom: '1px solid var(--amp-gray-2)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--amp-gray-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic k="reply" s={16} /></span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontFamily: 'var(--amp-font-display)', fontSize: 18 }}>Reply to Mia Chen</span><span style={{ fontSize: 13, color: 'var(--amp-gray-5)' }}>Re: Renewal pricing · Renewal 2027</span></div>
      <Ic k="close" s={18} />
    </div>
    <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--amp-gray-2)', fontSize: 12, color: 'var(--amp-gray-6)' }}>Task · Reply to Mia · Assigned to you (Alex)</div>
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <div style={{ padding: 16, borderRadius: 16, background: 'var(--amp-gray-1)', border: '1px solid var(--amp-gray-2)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
        <div style={{ display: 'flex', fontSize: 13, color: 'var(--amp-gray-5)' }}><span style={{ color: 'var(--amp-gray-7)', fontSize: 14 }}>Mia Chen</span><span style={{ flex: 1 }} />Tue, Sep 22</div>
        <span style={{ lineHeight: '21px', fontWeight: 400 }}>Hi Alex, could you share 3-year pricing before the QBR? Our CFO wants to compare it with the annual option.</span>
      </div>
      <div style={{ height: 44, borderRadius: 12, boxShadow: 'inset 0 0 0 1px var(--amp-gray-3)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 0 12px', fontSize: 14 }}><span style={{ fontSize: 13, color: 'var(--amp-gray-5)', width: 36 }}>File</span><span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Northwind_Renewal_Proposal_v2.pdf</span><span style={{ height: 32, padding: '0 12px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--amp-gray-3)', display: 'flex', alignItems: 'center' }}>Attach</span></div>
      <div style={{ height: 150, borderRadius: 24, background: 'var(--amp-gray-2)', padding: 16, boxSizing: 'border-box', fontSize: 15, fontWeight: 400, lineHeight: '22px' }}>Hi Mia, here is the 3-year pricing ahead of the QBR.</div>
    </div>
    <div style={{ height: 72, borderTop: '1px solid var(--amp-gray-2)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}><span style={{ flex: 1, fontSize: 13, color: 'var(--amp-gray-5)' }}>Draft saved. It stays here if you close the panel.</span><span style={{ height: 40, padding: '0 16px', borderRadius: 999, background: '#000', color: '#fff', fontSize: 15, display: 'flex', alignItems: 'center' }}>Send reply</span></div>
  </div>;
}

// ---------- blueprint primitives (app coords, drawn in an svg over the app) ----------
const Wire = ({ r, op = 1, label, dashed, handles, text, round, ts = 12, center, dot, q }) => (r.w < 0.5 || op < 0.01) ? null : <g opacity={op}>
  <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={round ? r.h / 2 : 3} fill={dashed ? 'none' : BP.fill} stroke={BP.line} strokeWidth="1" strokeDasharray={dashed ? '5 4' : null} />
  {text && (q == null || q < 0.15 || q > 0.85) ? <g opacity={q == null ? 1 : Math.max(0, Math.min(1, (Math.abs(q - 0.5) - 0.35) / 0.15))}>
    {dot ? <circle cx={r.x + r.h / 2} cy={r.y + r.h / 2} r={r.h / 2 - 5} fill="none" stroke={BP.line} strokeWidth="1" /> : null}
    <text x={r.x + (center ? r.w / 2 : (dot ? r.h + 4 : (round ? 12 : 8)))} y={r.y + r.h / 2 + ts * 0.36} textAnchor={center ? 'middle' : 'start'} fill={BP.line} fontFamily="Inter, system-ui, sans-serif" fontWeight="500" fontSize={ts}>{text}</text>
  </g> : null}
  {handles ? [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].map(([x, y], i) => <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill="#FFFFFF" stroke={BP.line} strokeWidth="1" />) : null}
  {label ? <text x={r.x + 8} y={r.y + r.h / 2 + 4} fill={BP.line} fontFamily={MONO} fontSize="11" letterSpacing="0.06em">{label}</text> : null}
</g>;
const LogoWire = ({ x, op = 1, name = true }) => op < 0.01 ? null : <g opacity={op}>
  <rect x={x} y={76} width="40" height="40" rx="10" fill={BP.fill} stroke={BP.line} strokeWidth="1" />
  <path d={`M${x + 9} ${76 + 29}L${x + 20} ${76 + 9}L${x + 31} ${76 + 29}`} fill="none" stroke={BP.line} strokeWidth="1.4" strokeLinejoin="round" />
  <circle cx={x + 20} cy={76 + 24} r="3" fill="none" stroke={BP.line} strokeWidth="1.2" />
  <path d={`M${x - 6} 96H${x + 46}M${x + 20} 70V122`} stroke={BP.line} strokeWidth="0.6" strokeDasharray="2 3" />
  {name ? <text x={x + 52} y={107} fill="none" stroke={BP.line} strokeWidth="0.9" fontFamily="var(--amp-font-display), Inter, sans-serif" fontWeight="500" fontSize="32" letterSpacing="-0.6">Northwind</text> : null}
  {name ? <path d={`M${x + 52} 118H${x + 216}`} stroke={BP.line} strokeWidth="0.6" strokeDasharray="2 3" /> : null}
</g>;
const Guide = ({ x, y, x2, y2, op }) => <line x1={x} y1={y} x2={x2} y2={y2} stroke={BP.line} strokeWidth="1" strokeDasharray="2 4" opacity={op * 0.7} />;
const Line = ({ d, draw, op = 1, arrow, color }) => <path d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} fill="none" stroke={color || BP.line} strokeWidth="1.3" opacity={op} markerEnd={arrow && draw > 0.95 ? 'url(#bpArrow)' : null} />;
const Label = ({ x, y, children, op = 1, anchor = 'start', color }) => <text x={x} y={y} fill={color || BP.line} fontFamily={MONO} fontSize="12" letterSpacing="0.06em" textAnchor={anchor} opacity={op}>{children}</text>;
const DimH = ({ x1, x2, y, label, draw, op = 1 }) => <g opacity={op}>
  <Line d={`M${x1} ${y}H${x2}`} draw={draw} />
  <path d={`M${x1} ${y - 6}V${y + 6}M${x2} ${y - 6}V${y + 6}`} stroke={BP.line} strokeWidth="1.3" opacity={draw} />
  <Label x={(x1 + x2) / 2} y={y - 10} anchor="middle" op={draw}>{label}</Label>
</g>;
const Num = ({ x, y, n, op }) => <g opacity={op}><circle cx={x} cy={y} r="11" fill={BP.bg} stroke={BP.accent} strokeWidth="1.3" /><text x={x} y={y + 4} fill={BP.accent} fontFamily={MONO} fontSize="11" textAnchor="middle">{n}</text></g>;
const curve = (a, b) => `M${a.x} ${a.y}C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
const ctr = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

function Focus({ ph, rect, children, bpAll = 0 }) {
  if (ph.focus <= 0.001) return null;
  const { x, y, w, h } = rect;
  return <g>
    <path d={`M0 0H1440V900H0Z M${x} ${y}h${w}v${h}h${-w}Z`} fillRule="evenodd" fill="#FFFFFF" opacity={0.78 * ph.focus * (1 - ph.wipe)} />
    <rect x={x} y={y} width={w} height={h} rx="8" fill="none" stroke="#999999" strokeWidth="1.2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ph.hl} opacity={ph.focus * (1 - ph.wipe)} />
    <path d={`M${x} ${y + 14}V${y}H${x + 14}M${x + w - 14} ${y}H${x + w}V${y + 14}M${x + w} ${y + h - 14}V${y + h}H${x + w - 14}M${x + 14} ${y + h}H${x}V${y + h - 14}`} fill="none" stroke={BP.line} strokeWidth="2" opacity={ph.wipe * (1 - ph.rev)} />
    <g opacity={ph.wipe * (1 - ph.rev)} clipPath="url(#bpClip)">{children}</g>
  </g>;
}

const StaticBP = React.memo(function StaticBP({ act, s1p, s2p, s3p, s4p, s5p, out, logoX, hdrRight, colX, colW, tlY, panelX }) {
  return <>
              <line x1="56" y1="0" x2="56" y2="900" stroke={BP.line} strokeWidth="1" />
              <line x1="56" y1="48" x2="1440" y2="48" stroke={BP.line} strokeWidth="1" />
              <Wire r={{ x: 14, y: 12, w: 28, h: 28 }} />
              {[0, 1, 2, 3, 4].map(i => <Wire key={i} r={{ x: 17, y: 60 + i * 36, w: 22, h: 22 }} />)}
              <Wire r={{ x: 88, y: 14, w: 168, h: 20 }} text="Companies / Northwind" ts={13} />
              <LogoWire x={logoX} />
              {act !== 0 ? (s1p < 0.5
                ? btnRects(hdrRight).map((r, i) => <Wire key={'b' + i} r={r} round center text={['Add to list', 'Edit', 'Run workflow', 'Compose email', '★', '↑', '⋯'][i]} ts={13} />)
                : <><Wire r={{ x: hdrRight - 188, y: 76, w: 140, h: 40 }} round center text="Compose email" ts={14} /><Wire r={{ x: hdrRight - 40, y: 76, w: 40, h: 40 }} round center text="⋯" ts={16} /></>) : null}
              {act !== 1 && s2p < 0.5 ? <>
                <line x1="388" y1="136" x2="388" y2="856" stroke={BP.line} strokeWidth="1" />
                <Wire r={{ x: 88, y: 140, w: 80, h: 24 }} text="Details" ts={13} />
                {[...FILLED.map(x => `${x[0]} · ${x[1]}`), ...EMPTY.map(e => `Set ${e}…`)].map((t, i) => <Wire key={'sb' + i} r={rowR(i)} text={t} ts={12} />)}
              </> : null}
              {act !== 1 && s2p >= 0.5 ? (() => { const ix = logoX + 52, ir = idRects(ix); return <>
                <Wire r={{ x: ix + 184, y: 84, w: 104, h: 24 }} round center text="CUSTOMER" ts={10} />
                <Wire r={{ x: ix, y: 120, w: 90, h: 20 }} text="northwind.io" ts={12} />
                <Wire r={{ x: ix + 100, y: 120, w: 84, h: 20 }} text="Owner Alex" ts={12} />
                {ir.parts.map((r, i) => <Wire key={'id' + i} r={r} text={ID_PARTS[i][0]} ts={13} />)}
                <Wire r={ir.details} text="All details ›" ts={13} />
              </>; })() : null}
              {act !== 2 && s3p >= 0.5 ? <>
                <rect x={colX} y="204" width="760" height="244" rx="16" fill="none" stroke={BP.line} strokeWidth="1" />
                <Wire r={{ x: colX + 12, y: 214, w: 110, h: 30 }} text="Needs you · 3" ts={13} />
                <Wire r={{ x: colX + 528, y: 215, w: 220, h: 28 }} round center text="Renewal 2027 · $52k · Proposal" ts={12} />
                {['Send renewal proposal', 'Reply to Mia', 'Schedule QBR'].map((t, i) => { const y = 264 + i * 64; return <React.Fragment key={'ny' + i}>
                  <Wire r={{ x: colX + 12, y, w: 736, h: 48 }} text={t} ts={13} />
                  <Wire r={{ x: colX + 504, y: y + 13, w: 100, h: 22 }} round center text={['OVERDUE', 'UNANSWERED', 'DUE FRI'][i]} ts={10} />
                  <Wire r={{ x: colX + 624, y: y + 8, w: 112, h: 32 }} round center text={['Send proposal', 'Reply', 'Schedule'][i]} ts={13} />
                </React.Fragment>; })}
              </> : null}
              {act !== 3 && s4p < 0.5 ? <>
                {tabRects(colX, tlY).map((r, i) => (act === 2 && (i === 1 || i === 3)) ? null : <Wire key={'t' + i} r={r} text={TABS[i][0]} ts={13} />)}
                <Wire r={{ x: colX + 64, y: tlY + 52, w: 104, h: 28 }} round text="All activity ▾" ts={12} />
                <Wire r={{ x: colX + 176, y: tlY + 52, w: 92, h: 28 }} round text="All users ▾" ts={12} />
                {SYS.map((s_, i) => { const y = tlY + 88 + i * 52 + 8; return (y > 890 || (act === 2 && i === 3)) ? null : <Wire key={'sy' + i} r={{ x: colX, y, w: colW, h: 36 }} dot text={`${s_[0]} ${s_[1]}`} ts={13} />; })}
              </> : null}
              {act !== 3 && s4p >= 0.5 ? <>
                <Wire r={{ x: colX, y: tlY + 10, w: 90, h: 24 }} text="Timeline" ts={14} />
                <Wire r={{ x: colX + 610, y: tlY + 6, w: 150, h: 32 }} round text="Relationship ▾" ts={13} />
                {REL.map((r_, i) => { const y = tlY + 44 + i * 52 + 8; return y > 890 ? null : <Wire key={'rl' + i} r={{ x: colX, y, w: 760, h: 36 }} dot text={`${r_[1] ? r_[1] + ' ' : ''}${r_[2]}`} ts={13} />; })}
              </> : null}
              {act !== 4 && s5p >= 0.5 && out < 0.5 ? <>
                <Wire r={{ x: panelX, y: 48, w: 440, h: 852 }} />
                <Wire r={{ x: panelX + 68, y: 62, w: 220, h: 36 }} text="Reply to Mia Chen" ts={15} />
                <Wire r={{ x: panelX + 24, y: 172, w: 392, h: 116 }} text="Mia’s email · Tue, Sep 22" ts={12} />
                <Wire r={{ x: panelX + 24, y: 364, w: 392, h: 150 }} text="Draft" ts={12} />
              </> : null}
</>;
});

// ---------- the piece ----------
const STEPS = [
  { key: 'Actions', n: '01', name: 'One primary action', prob: 'Six buttons with the same weight. You mostly send email.', fix: 'Compose stays. The rest move into ⋯.', side: 'right' },
  { key: 'Details', n: '02', name: 'Hide absence', prob: '22 detail rows. 14 of them only say “Set…”.', fix: 'Eight facts become one line. The rest is one click away.', side: 'left' },
  { key: 'Open work', n: '03', name: 'Open work first', prob: 'An overdue task sits in a tab and a system log.', fix: 'Three tasks, one primary action, on top.', side: 'left' },
  { key: 'Timeline', n: '04', name: 'One timeline', prob: 'Six tabs and two filters. The default feed is a system log.', fix: 'People and deals by default. Filters live in one menu.', side: 'right' },
  { key: 'Panel', n: '05', name: 'Act in context', prob: 'Every action leaves the record.', fix: 'A side panel opens next to the page and keeps the draft.', side: 'right' }
];

const MChrome = React.memo(Chrome), MName = React.memo(NameBlock), MBA = React.memo(BeforeActions), MAA = React.memo(AfterActions), MSide = React.memo(Sidebar), MId = React.memo(Identity), MNY = React.memo(NeedsYou), MBT = React.memo(BeforeTimeline), MAT = React.memo(AfterTimeline), MPanel = React.memo(Panel);
const q2 = (v) => Math.round(v * 2) / 2, o3 = (v) => Math.round(v * 100) / 100;

function Piece() {
  const { T, CUES, authoredTotal } = useComposition();
  const s1 = phases(T, CUES.Actions, 5, 3.2), s2 = phases(T, CUES.Details, 6, 3.9), s3 = phases(T, CUES['Open work'], 5, 3.2), s4 = phases(T, CUES.Timeline, 5, 3.2), s5 = phases(T, CUES.Panel, 5, 3.2);
  const PH = [s1, s2, s3, s4, s5];
  const out = tw(T, CUES.After, CUES.After + 0.8 * K);
  const P5 = s5.p * (1 - out);
  const bpAll = Math.max(s1.bp, s2.bp, s3.bp, s4.bp, s5.bp);
  const act = PH.findIndex(p => p.bp > 0.001);
  const wipe = act >= 0 ? PH[act].wipe : 0, rev = act >= 0 ? PH[act].rev : 0;
  const clipTop = rev > 0 ? 900 * rev : -20, clipBot = wipe >= 1 ? 920 : 900 * wipe;
  const scanY = wipe > 0 && wipe < 1 ? 900 * wipe : (rev > 0 && rev < 1 ? 900 * rev : -1);
  const endFade = 1 - tw(T, authoredTotal - 1.1, authoredTotal - 0.05, M.move);
  const colXc = lerp(368, 104, P5);
  const colX = lerp(420, colXc, s2.p), colW = lerp(988, 760, s2.p);
  const hdrRight = lerp(1408, colXc + 760, s2.p);
  const logoX = lerp(88, colXc, s2.p);
  const s3push = tw(s3.t, 1.9, 2.5), s3rise = (i) => tw(s3.t, 2.4 + i * 0.12, 3.1 + i * 0.12);
  const s2push = tw(s2.t, 1.7, 2.2);
  const tlY = 144 + 60 * s2push + 284 * s3push;
  const panelX = 1000 + 440 * out;
  const appIn = tw(T, 0, 0.5 * K, M.enter);
  const zoom = lerp(1, 0.96, tw(T, CUES.After + 0.5 * K, CUES.After + 3 * K, M.move));
  
  // wire geometry
  const bb = btnRects(1408);
  const afterBtn = { c: { x: 1408 - 188, y: 76, w: 140, h: 40 }, m: { x: 1368, y: 76, w: 40, h: 40 } };
  const ids = idRects(420);
  const fTargets = [...ids.parts, { x: 520, y: 120, w: 84, h: 20 }, { x: 420, y: 120, w: 90, h: 20 }, { x: 604, y: 84, w: 104, h: 24 }];
  const tabsB3 = tabRects(368, 204);
  const remB = { x: 368, y: 204 + 88 + 3 * 52 + 6, w: 760, h: 40 };
  const nyRows = [0, 1, 2].map(i => ({ x: 380, y: 204 + 52 + i * 64 + 8, w: 736, h: 48 }));
  const tabs4 = tabRects(368, 488);
  const dd = { x: 368 + 760 - 150, y: 494, w: 150, h: 32 };
  const titleR = { x: 368, y: 498, w: 90, h: 24 };

  return <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: 'var(--amp-gray-2)', overflow: 'hidden', fontFamily: 'var(--amp-font-ui)' }}>
    {/* app */}
    <div style={{ position: 'absolute', left: AX + 720 * AS - 720, top: AY + 450 * AS - 450, width: 1440, height: 900, transform: `scale(${AS * zoom})`, transformOrigin: '720px 450px', opacity: appIn * endFade }}>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 0 0 1px #E0E0E0', color: 'var(--amp-gray-7)', fontWeight: 500, letterSpacing: '-0.005em' }}>
        <MChrome />
        <MName x={q2(logoX)} pillOp={o3(s2.after)} />
        <MBA right={q2(hdrRight)} op={o3(s1.before)} />
        <MAA right={q2(hdrRight)} op={o3(s1.after)} />
        <MSide op={o3(s2.before)} />
        <MId x={q2(logoX + 52)} op={o3(s2.after)} />
        <MNY x={q2(colX)} op={o3(s3.after)} />
        <MBT x={q2(colX)} y={q2(tlY)} w={q2(colW)} op={o3(s4.before)} dimRow={o3(s3.after)} />
        <MAT x={q2(colX)} y={q2(tlY)} op={o3(s4.after)} />
        <MPanel x={q2(panelX)} op={o3(out > 0.999 ? 0 : s5.after)} />

        <svg width="1440" height="900" viewBox="0 0 1440 900" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <pattern id="bpGrid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke={BP.grid} strokeWidth="1" /></pattern>
            <clipPath id="bpClip"><rect x="-20" y={clipTop} width="1480" height={Math.max(0, clipBot - clipTop)} /></clipPath>
            <linearGradient id="bpScan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2ACCFF" stopOpacity="0" /><stop offset="1" stopColor="#2ACCFF" stopOpacity="0.16" /></linearGradient>
            <marker id="bpArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={BP.line} /></marker>
          </defs>

          <g clipPath="url(#bpClip)" style={{ visibility: bpAll > 0.001 ? 'visible' : 'hidden' }}>
            <rect x="0" y="0" width="1440" height="900" fill="#FFFFFF" opacity={bpAll} />
            <g opacity={bpAll * (act >= 0 ? lerp(0.7, 0.3, PH[act].cdim) : 0.7)}>
              <StaticBP act={act} s1p={s1.p < 0.5 ? 0 : 1} s2p={s2.p < 0.5 ? 0 : 1} s3p={s3.p < 0.5 ? 0 : 1} s4p={s4.p < 0.5 ? 0 : 1} s5p={s5.p < 0.5 ? 0 : 1} out={out < 0.5 ? 0 : 1} logoX={Math.round(logoX)} hdrRight={Math.round(hdrRight)} colX={Math.round(colX)} colW={Math.round(colW)} tlY={Math.round(tlY)} panelX={Math.round(panelX)} />
            </g>
          </g>

          {scanY >= 0 ? <g opacity={Math.sin(Math.PI * Math.max(0, Math.min(1, scanY / 900)))}>
            <rect x="0" y={scanY - 40} width="1440" height="40" fill="url(#bpScan)" />
            <line x1="0" y1={scanY} x2="1440" y2={scanY} stroke={BP.line} strokeWidth="1.5" />
          </g> : null}

          {/* 01 actions */}
          {s1.focus > 0.001 ? <Focus bpAll={bpAll} ph={s1} rect={{ x: 800, y: 50, w: 624, h: 112 }}>
            {bb.map((r, i) => {
              const tgt = i === 3 ? afterBtn.c : i === 6 ? afterBtn.m : { x: afterBtn.m.x + 20, y: 96, w: 0, h: 0 };
              const keep = i === 3 || i === 6;
              const tx = ['Add to list', 'Edit', 'Run workflow', 'Compose email', '★', '↑', '⋯'][i];
              return <Wire key={i} r={LR(r, tgt, s1.p)} q={s1.p} op={keep ? 1 : 1 - s1.p} handles={keep} round text={tx} center ts={13} />;
            })}
            <Label x={bb[0].x} y={66} op={s1.lines * (1 - s1.p)}>6 ACTIONS · SAME WEIGHT</Label>
            {[0, 1, 2, 4, 5].map(i => <Line key={i} d={curve({ x: bb[i].x + bb[i].w / 2, y: 118 }, { x: 1386, y: 118 })} draw={s1.lines} op={(1 - s1.p) * 0.8} />)}
            <Guide x={afterBtn.c.x} y={56} x2={afterBtn.c.x} y2={158} op={tw(s1.t, 2.5, 3.0)} />
            <Guide x={1408} y={56} x2={1408} y2={158} op={s1.lines} />
            <DimH x1={afterBtn.c.x} x2={1408} y={146} label="1 ACTION + OVERFLOW" draw={tw(s1.t, 2.7, 3.3, M.draw)} />
          </Focus> : null}

          {/* 02 details */}
          {s2.focus > 0.001 ? <Focus bpAll={bpAll} ph={s2} rect={{ x: 72, y: 60, w: 1348, h: 800 }}>
            <Wire r={{ x: 88, y: 136, w: lerp(300, 0, s2.p), h: 700 }} dashed op={1 - s2.p * 0.6} />
            <Label x={96} y={128} op={s2.lines * (1 - s2.p)}>SIDEBAR · 22 ROWS · 14 EMPTY</Label>
            {FILLED.map((f, i) => { const q = tw(s2.t, 2.2 + i * 0.1, 3.3 + i * 0.1); const txt = i < 5 ? ID_PARTS[i][0] : i === 5 ? 'Owner Alex' : i === 6 ? 'northwind.io' : 'Customer'; return <Wire key={f[0]} r={LR(rowR(i), fTargets[i], q)} q={q} text={q < 0.5 ? `${f[0]} · ${f[1]}` : txt} round={i === 7 && q > 0.5} ts={q < 0.5 ? 12 : 13} />; })}
            {EMPTY.map((e, i) => { const q = tw(s2.t, 1.9 + (13 - i) * 0.03, 2.6 + (13 - i) * 0.03); const r0 = rowR(8 + i); return <Wire key={e} r={{ x: r0.x, y: r0.y + 13 * q, w: r0.w, h: r0.h * (1 - q) }} q={q} op={1 - q} text={`Set ${e}…`} ts={11} />; })}
            <Wire r={ids.details} op={tw(s2.t, 3.2, 3.8)} text="All details ›" ts={13} handles />
            <Guide x={80} y={159} x2={1410} y2={159} op={tw(s2.t, 2.6, 3.2)} />
            <Guide x={420} y={70} x2={420} y2={850} op={tw(s2.t, 2.6, 3.2)} />
            <Wire r={{ x: colX, y: 204, w: colW, h: 620 }} dashed op={s2.lines} />
            <DimH x1={colX} x2={colX + colW} y={860} label={s2.p < 0.5 ? 'CONTENT · 988' : 'CENTERED COLUMN · 760'} draw={s2.lines} />
            <Line d="M748 206V840" draw={tw(s2.t, 2.9, 3.6, M.draw)} op={0.6} />
            <Label x={756} y={200} op={tw(s2.t, 3.2, 3.7)}>CENTER</Label>
            
          </Focus> : null}

          {/* 03 open work */}
          {s3.focus > 0.001 ? <Focus bpAll={bpAll} ph={s3} rect={{ x: 352, y: 176, w: 808, h: 494 }}>
            <Wire handles q={s3rise(0)} r={LR(remB, nyRows[0], s3rise(0))} text={s3rise(0) < 0.5 ? 'Reminder · task “Send proposal” passed its due date' : 'Send renewal proposal'} ts={13} />
            <Wire handles q={s3rise(1)} r={LR({ ...tabsB3[1], h: 24 }, nyRows[1], s3rise(1))} text={s3rise(1) < 0.5 ? 'Emails (12)' : 'Reply to Mia'} ts={13} />
            <Wire handles q={s3rise(2)} r={LR({ ...tabsB3[3], h: 24 }, nyRows[2], s3rise(2))} text={s3rise(2) < 0.5 ? 'Tasks (2)' : 'Schedule QBR'} ts={13} />
            <Wire r={{ x: 380, y: 214, w: 110, h: 30 }} op={tw(s3.t, 2.4, 2.9)} text="Needs you · 3" ts={13} />
            <Wire r={{ x: 896, y: 215, w: 220, h: 28 }} op={tw(s3.t, 2.5, 3.0)} round text="Renewal 2027 · $52k · Proposal" ts={12} center />
            {nyRows.map((r, i) => { const o = tw(s3.t, 2.7 + i * 0.08, 3.2 + i * 0.08); return <React.Fragment key={i}>
              <Wire r={{ x: r.x + r.w - 244, y: r.y + 13, w: 100, h: 22 }} op={o} round text={['OVERDUE', 'UNANSWERED', 'DUE FRI'][i]} ts={10} center />
              <Wire r={{ x: r.x + r.w - 124, y: r.y + 8, w: 112, h: 32 }} op={o} round text={['Send proposal', 'Reply', 'Schedule'][i]} ts={13} center handles={i === 0} />
            </React.Fragment>; })}
            <rect x="368" y="204" width="760" height="244" rx="16" fill="none" stroke={BP.line} strokeWidth="1" strokeDasharray="5 4" opacity={s3.lines} />
            {[256, 320, 384].map(y => <Guide key={y} x={360} y={y} x2={1136} y2={y} op={s3.lines} />)}
            <Guide x={368} y={186} x2={368} y2={660} op={s3.lines} />
            <Guide x={1128} y={186} x2={1128} y2={660} op={s3.lines} />
            <Label x={368} y={200} op={s3.lines}>NEEDS YOU · 3 TASKS · 1 PRIMARY ACTION</Label>
            
            <Line d="M1148 212V440" draw={s3.lines} arrow />
            <Label x={1140} y={200} op={s3.lines} anchor="end">TIMELINE MOVES DOWN ↓</Label>
          </Focus> : null}

          {/* 04 timeline */}
          {s4.focus > 0.001 ? <Focus bpAll={bpAll} ph={s4} rect={{ x: 352, y: 474, w: 792, h: 420 }}>
            {tabs4.map((r, i) => <Wire key={i} q={s4.p} r={LR(r, i === 0 ? titleR : dd, s4.p)} op={i === 0 ? 1 : 1 - s4.p * 0.9} text={i === 0 ? (s4.p < 0.5 ? 'Activity' : 'Timeline') : TABS[i][0]} ts={13} />)}
            <Wire r={dd} op={tw(s4.t, 2.6, 3.1)} round text="Relationship ▾" ts={13} handles />
            <Wire q={s4.p} r={LR({ x: 432, y: 540, w: 104, h: 28 }, dd, s4.p)} op={1 - s4.p} round text="All activity ▾" ts={12} />
            <Wire q={s4.p} r={LR({ x: 544, y: 540, w: 92, h: 28 }, dd, s4.p)} op={1 - s4.p} round text="All users ▾" ts={12} />
            {SYS.slice(0, 5).map((s_, i) => <Wire key={i} r={LR({ x: 368, y: 576 + i * 52 + 8, w: 760, h: 36 }, { x: dd.x + 75, y: 510, w: 0, h: 0 }, s4.p)} q={s4.p} op={1 - Math.min(1, s4.p * 2)} text={`${s_[0]} ${s_[1]}`} dot ts={13} />)}
            {REL.map((r_, i) => <Wire key={'r' + i} r={{ x: 368, y: 532 + i * 52 + 8, w: 760 * tw(s4.t, 2.3 + i * 0.07, 3.0 + i * 0.07), h: 36 }} op={tw(s4.t, 2.3 + i * 0.07, 2.7 + i * 0.07)} text={`${r_[1] ? r_[1] + ' ' : ''}${r_[2]}`} dot ts={13} />)}
            <Label x={368} y={490} op={s4.lines * (1 - s4.p)}>6 TABS + 2 FILTERS</Label>
            <Guide x={368} y={480} x2={368} y2={892} op={s4.lines} />
            <Guide x={360} y={532} x2={1136} y2={532} op={tw(s4.t, 2.3, 2.8)} />
            <Label x={1128} y={490} anchor="end" op={tw(s4.t, 2.7, 3.3)}>1 VIEW MENU · RELATIONSHIP BY DEFAULT</Label>
            {[1, 2, 3, 4, 5].map(i => <Line key={i} d={curve(ctr(tabs4[i]), ctr(dd))} draw={s4.lines} op={(1 - s4.p) * 0.7} />)}
            
          </Focus> : null}

          {/* 05 panel */}
          {s5.focus > 0.001 ? <Focus bpAll={bpAll} ph={s5} rect={{ x: 60, y: 52, w: 1376, h: 844 }}>
            <Wire r={{ x: lerp(1440, 1000, s5.p), y: 48, w: 440, h: 852 }} dashed />
            <Guide x={1000} y={56} x2={1000} y2={892} op={s5.lines} />
            {(() => { const px = lerp(1440, 1000, s5.p); return <>
              <Wire r={{ x: px + 24, y: 64, w: 32, h: 32 }} round />
              <Wire r={{ x: px + 68, y: 62, w: 220, h: 36 }} text="Reply to Mia Chen" ts={15} />
              <Wire r={{ x: px + 24, y: 128, w: 392, h: 26 }} text="Task · Reply to Mia · Assigned to you" ts={11} />
              <Wire r={{ x: px + 24, y: 172, w: 392, h: 116 }} text="Mia’s email · Tue, Sep 22" ts={12} />
              <Wire r={{ x: px + 24, y: 304, w: 392, h: 44 }} text="Northwind_Renewal_Proposal_v2.pdf" ts={12} />
              <Wire r={{ x: px + 24, y: 364, w: 392, h: 150 }} text="Draft · kept when you close the panel" ts={12} handles />
              <Wire r={{ x: px + 300, y: 844, w: 116, h: 40 }} round text="Send reply" ts={13} center />
            </>; })()}

            <Wire r={{ x: colX, y: 204, w: 760, h: 640 }} dashed op={0.8} />
            <DimH x1={104} x2={368} y={186} label="COLUMN SHIFTS LEFT" draw={s5.lines} />
            <Label x={1024} y={84} op={tw(s5.t, 2.7, 3.3)}>CONTEXTUAL PANEL · 440</Label>
            <Line d={`M1428 ${450}H${lerp(1440, 1000, s5.p) + 12}`} draw={s5.lines} arrow op={1 - s5.p} />
            
          </Focus> : null}
        </svg>
      </div>
    </div>

    {/* callout band, one at a time */}
    {STEPS.map((st, i) => {
      const ph = PH[i];
      if (ph.call <= 0.001) return null;
      return <div key={st.key} style={{ position: 'absolute', left: AX, top: AY + 900 + 40, width: 1440, opacity: ph.call * endFade, transform: `translateY(${(1 - ph.call) * 12}px)`, display: 'grid', gridTemplateColumns: '240px minmax(0,1fr) minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--amp-gray-6)', paddingTop: 4 }}><span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--amp-gray-7)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{st.n}</span>{st.name.toUpperCase()}</span>
        <span style={{ fontSize: 24, lineHeight: '32px', color: 'var(--amp-gray-7)' }}>{st.prob}</span>
        <span style={{ fontSize: 24, lineHeight: '32px', color: BP.line, opacity: ph.fix, transform: `translateX(${(1 - ph.fix) * -8}px)` }}>{st.fix}</span>
      </div>;
    })}
  </div>;
}

function NorthwindBlueprintApp() {
  return <CompositionStage width={1600} height={1200} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#F2F2F2"><Piece /></CompositionStage>;
}
window.NorthwindBlueprintApp = NorthwindBlueprintApp;
