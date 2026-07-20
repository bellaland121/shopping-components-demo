const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');
const textDir = path.join(__dirname, 'content-text');
if (!fs.existsSync(textDir)) fs.mkdirSync(textDir);

function strip(html) {
  return html
    .replace(/<span class="ann[^"]*"[^>]*>[^<]*<\/span>/g, '')
    .replace(/<span class="cite">[^<]*<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPanel(html) {
  const out = [];

  const qm = html.match(/<div class="userq"><span>(.*?)<\/span>/);
  if (qm) out.push(`【问题】${strip(qm[1])}`, '');

  const rm = html.match(/<div class="ref">[\s\S]*?<\/span>\s*<\/div>/);
  if (rm) out.push(`【来源】${strip(rm[0])}`, '');

  const am = html.match(/<div class="answer">([\s\S]*)<div class="foot-info">/);
  if (!am) return out.join('\n');
  const body = am[1];

  // Collect all elements with positions
  const els = [];
  const add = (re, type) => {
    let m; while ((m = re.exec(body)) !== null) els.push({ type, pos: m.index, raw: m[0] });
  };

  add(/<div class="sec-label">([\s\S]*?)<\/div>/g, 'sec');
  add(/<div class="lead">([\s\S]*?)<\/div>/g, 'lead');
  add(/<ul class="blist">([\s\S]*?)<\/ul>/g, 'list');
  add(/<div class="iq"><div[^>]*><\/div>[^<]*<\/div>/g, 'iq');
  add(/<div class="scene">([\s\S]*?)<\/div>\s*<\/div>/g, 'scene');
  add(/<div class="follow">([\s\S]*?)<\/div>/g, 'follow');
  add(/<div class="ptitle"[^>]*>([\s\S]*?)<\/div>/g, 'ptitle');
  add(/<div class="pcard">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g, 'pcard');
  add(/<div class="pc">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g, 'pc');
  add(/<div class="voice">([\s\S]*?)<\/div>\s*<\/div>/g, 'voice');
  add(/<div class="ai-sum">([\s\S]*?)<\/div>\s*<\/div>/g, 'aisum');
  add(/<div class="pk-card">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g, 'pk');
  add(/<div class="pk-explain">([\s\S]*?)<\/div>/g, 'pkex');
  add(/<table class="comp-table">([\s\S]*?)<\/table>/g, 'table');
  add(/<div class="buzz">([\s\S]*?)<\/div>\s*<\/div>/g, 'buzz');

  // Remove iq that are nested inside list items (they'll be extracted with the list)
  const listRanges = els.filter(e => e.type === 'list').map(e => [e.pos, e.pos + e.raw.length]);
  const pcRanges = els.filter(e => e.type === 'pc').map(e => [e.pos, e.pos + e.raw.length]);
  const nested = [...listRanges, ...pcRanges];
  const filtered = els.filter(e => {
    if (e.type === 'iq') {
      return !nested.some(([s, end]) => e.pos >= s && e.pos < end);
    }
    return true;
  });

  filtered.sort((a, b) => a.pos - b.pos);

  for (const el of filtered) {
    switch (el.type) {
      case 'sec':
        out.push(`## ${strip(el.raw)}`);
        out.push('');
        break;
      case 'lead':
        out.push(strip(el.raw));
        out.push('');
        break;
      case 'list': {
        const items = [...el.raw.matchAll(/<li>([\s\S]*?)<\/li>/g)];
        for (const item of items) {
          let text = item[1].replace(/<div class="iq"><div[^>]*><\/div>[^<]*<\/div>/g, '');
          out.push(`· ${strip(text)}`);
        }
        const iqs = [...el.raw.matchAll(/<div class="iq"><div[^>]*><\/div>\s*"([^"]+)"\s*<\/div>/g)];
        for (const iq of iqs) out.push(`  💬 "${iq[1].trim()}"`);
        out.push('');
        break;
      }
      case 'iq': {
        const qm = el.raw.match(/<div class="iq"><div[^>]*><\/div>\s*"([^"]+)"\s*<\/div>/);
        if (qm) out.push(`💬 "${qm[1].trim()}"`, '');
        break;
      }
      case 'scene': {
        const rows = [...el.raw.matchAll(/<div class="scene-row">([\s\S]*?)<\/div>/g)];
        for (const r of rows) out.push(`→ ${strip(r[1])}`);
        out.push('');
        break;
      }
      case 'follow': {
        const btns = [...el.raw.matchAll(/<button class="fbtn">([\s\S]*?)<\/button>/g)];
        out.push(`【按钮】${btns.map(b => b[1].trim()).join(' | ')}`);
        out.push('');
        break;
      }
      case 'ptitle':
        out.push(`【产品】${strip(el.raw)}`);
        out.push('');
        break;
      case 'pcard': {
        const nm = el.raw.match(/<div class="nm">(.*?)<\/div>/);
        const ft = el.raw.match(/<div class="features">(.*?)<\/div>/);
        const pr = el.raw.match(/<div class="price">(.*?)<\/div>/);
        out.push(`【产品卡】${nm ? nm[1] : ''}`);
        if (ft) out.push(`  ${ft[1]}`);
        if (pr) out.push(`  ${pr[1]}`);
        out.push('');
        break;
      }
      case 'pc': {
        const conStart = el.raw.indexOf('pc-block con');
        const items = [...el.raw.matchAll(/<div class="pc-item">([\s\S]*?)<\/div>/g)];
        const iqs = [...el.raw.matchAll(/<div class="iq"><div[^>]*><\/div>\s*"([^"]+)"/g)];
        const proItems = items.filter(m => conStart < 0 || m.index < conStart);
        const proIqs = iqs.filter(m => conStart < 0 || m.index < conStart);
        const conItems = items.filter(m => conStart >= 0 && m.index > conStart);
        const conIqs = iqs.filter(m => conStart >= 0 && m.index > conStart);
        if (proItems.length || proIqs.length) {
          out.push('👍 好评：');
          for (const it of proItems) out.push(`  · ${strip(it[1])}`);
          for (const iq of proIqs) out.push(`  💬 "${iq[1].trim()}"`);
        }
        if (conItems.length || conIqs.length) {
          out.push('👎 差评：');
          for (const it of conItems) out.push(`  · ${strip(it[1])}`);
          for (const iq of conIqs) out.push(`  💬 "${iq[1].trim()}"`);
        }
        out.push('');
        break;
      }
      case 'voice': {
        const vs = [...el.raw.matchAll(/<div class="tx">[\s\S]*?<span class="q">"<\/span>([\s\S]*?)<span class="q">"<\/span>/g)];
        for (const v of vs) out.push(`💬 "${strip(v[1])}"`);
        if (vs.length) out.push('');
        break;
      }
      case 'aisum': {
        const t = el.raw.match(/<div class="text">([\s\S]*?)<\/div>/);
        if (t) out.push(`【AI总结】${strip(t[1])}`, '');
        break;
      }
      case 'pk': {
        const label = el.raw.match(/<div class="pk-label">([\s\S]*?)<\/div>/);
        if (label) out.push(`【PK】${strip(label[1])}`);
        const vals = [...el.raw.matchAll(/<div class="pk-val">([\s\S]*?)<\/div>/g)];
        for (const v of vals) out.push(`  ${strip(v[1])}`);
        out.push('');
        break;
      }
      case 'pkex':
        out.push(strip(el.raw));
        out.push('');
        break;
      case 'table':
      case 'buzz':
        break;
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.html'));
for (const f of files) {
  const html = fs.readFileSync(path.join(contentDir, f), 'utf8');
  const text = extractPanel(html);
  const txtFile = f.replace('.html', '.txt');
  fs.writeFileSync(path.join(textDir, txtFile), text + '\n');
  console.log(`✅ ${txtFile} (${text.split('\n').length} 行)`);
}
