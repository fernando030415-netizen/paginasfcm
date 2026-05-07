const https = require('https');
const fs = require('fs');

const HOST = 'primary-production-be6ac.up.railway.app';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjhmNGJkOC05ZDY1LTRkYWEtYTBlMi1iOGY4NDA4NWQxYWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZmE2YTYwY2MtN2UzNi00NDhiLWJlNWMtY2IxOWU3M2JiOWY4IiwiaWF0IjoxNzc2NjQ5MjQ4fQ.4Bq9um5koYCSkbRl4KMn3PPtDG35-PIez19Sr0YMF6w';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: HOST, path: '/api/v1' + path, method,
      headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json', ...(data ? {'Content-Length': Buffer.byteLength(data)} : {}) }
    }, res => {
      let buf = ''; res.on('data', d => buf += d);
      res.on('end', () => { try { const p = JSON.parse(buf); res.statusCode >= 400 ? reject(new Error(buf.slice(0,400))) : resolve(p); } catch(e) { reject(new Error(buf.slice(0,200))); } });
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

function fixGCal(nodes) {
  return nodes.map(n => {
    if (n.type !== 'n8n-nodes-base.googleCalendar') return n;
    const p = { ...n.parameters };
    // Fix calendarId → calendar resource locator
    if (typeof p.calendarId === 'string') {
      p.calendar = { __rl: true, value: p.calendarId, mode: 'id' };
      delete p.calendarId;
    }
    return { ...n, parameters: p };
  });
}

function clean(wf) {
  // Only include settings properties allowed by the API
  const { executionOrder, callerPolicy, errorWorkflow } = wf.settings || {};
  const settings = {};
  if (executionOrder) settings.executionOrder = executionOrder;
  if (callerPolicy) settings.callerPolicy = callerPolicy;
  if (errorWorkflow) settings.errorWorkflow = errorWorkflow;
  return { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings, staticData: null };
}

async function main() {
  const calRaw = JSON.parse(fs.readFileSync('cal_wf_raw.json', 'utf8'));
  const remRaw = JSON.parse(fs.readFileSync('rem_wf_raw.json', 'utf8'));

  calRaw.nodes = fixGCal(calRaw.nodes);
  remRaw.nodes = fixGCal(remRaw.nodes);

  await api('PUT', '/workflows/FD9R8RCfxi1G0AYp', clean(calRaw));
  console.log('✅ Calendario actualizado');

  await api('PUT', '/workflows/WLbNPtKK0UkxfinI', clean(remRaw));
  console.log('✅ Recordatorios actualizado');

  for (const [id, name] of [['FD9R8RCfxi1G0AYp','Calendario'],['WLbNPtKK0UkxfinI','Recordatorios']]) {
    try {
      const r = await api('POST', '/workflows/'+id+'/activate', {});
      console.log(name+':', r.active ? '✅ activo' : '⚠️ '+JSON.stringify(r).slice(0,200));
    } catch(e) { console.error(name+' activar error:', e.message.slice(0,300)); }
  }
}

main().catch(e => console.error('FATAL:', e.message));
