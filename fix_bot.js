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
      res.on('end', () => {
        try { const p = JSON.parse(buf); res.statusCode >= 400 ? reject(new Error(buf.slice(0,400))) : resolve(p); }
        catch(e) { reject(new Error(buf.slice(0,200))); }
      });
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

// Correct code for Extraer Texto (outputs chatInput field)
const JS_EXTRAER_TEXTO = `const msg = $json.message || {};
const chatInput = msg.text || msg.caption || '';
const chatId = String(msg.chat?.id || '');
const nombre = msg.from?.first_name || 'Cliente';
const fechaHoy = new Date().toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'});
return [{ json: { chatInput, chat_id: chatId, nombre, fecha_hoy: fechaHoy } }];`;

// Correct code for Extraer Transcripción (outputs chatInput field)
const JS_EXTRAER_TRANSCRIPCION = `const chatInput = '[Audio]: ' + ($json.text || '');
const tgData = $('Telegram Trigger').first().json;
const chatId = String(tgData.message?.chat?.id || '');
const nombre = tgData.message?.from?.first_name || 'Cliente';
const fechaHoy = new Date().toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'});
return [{ json: { chatInput, chat_id: chatId, nombre, fecha_hoy: fechaHoy } }];`;

// System prompt referencing chat_id and fecha_hoy from input
const SYSTEM_PROMPT = `={{
'Eres la asistente virtual de Kortesitos Kids | Peluquería & Spa, en Cali, Cra 80 #10A-10 Local 21.\\n\\n' +
'SERVICIOS:\\n• Corte cabello $39,900 (30min)\\n• Cepillado $29,000 (45min)\\n• Peinado niña $39,900 (45min)\\n• Corte+barba $46,900 (45min)\\n• Trenzas sencillas $35,000 (60min)\\n• Trenzas con extensión desde $55,000 (90min)\\n• Moños/recogidos $25,000 (30min)\\n• Spa capilar $45,000 (60min)\\n• Maquillaje mamá $40,000 (45min)\\n• Corte dama $35,000 (45min)\\n\\n' +
'HORARIOS: Lun-Sab 9am-7pm | Dom 9am-5pm\\n\\n' +
'PROCESO PARA AGENDAR:\\n1. Pregunta el servicio\\n2. Pregunta la fecha\\n3. Llama gestor_citas con operation=verificar_disponibilidad\\n4. Muestra horarios libres\\n5. Pide nombre del cliente\\n6. Llama gestor_citas con operation=crear_cita\\n7. Confirma la cita\\n\\n' +
'REGLAS:\\n- chat_id del cliente: ' + $json.chat_id + ' — ponlo SIEMPRE en gestor_citas, nunca se lo pidas al cliente\\n' +
'- Hoy es: ' + $json.fecha_hoy + '\\n' +
'- Habla español colombiano, tono cálido\\n' +
'- NUNCA inventes horarios, siempre consulta verificar_disponibilidad primero\\n' +
'- Para ver citas: operation=listar_citas\\n' +
'- Para cancelar: lista primero para obtener el ID, luego cancelar_cita con event_id\\n' +
'- Si algo falla, pide al cliente que llame directamente'
}}`;

async function main() {
  const wf = await api('GET', '/workflows/6b0QdYNoUa4VIoVc');

  wf.nodes = wf.nodes.map(n => {
    if (n.name === 'Extraer Texto') {
      n.parameters.jsCode = JS_EXTRAER_TEXTO;
      console.log('✅ Extraer Texto actualizado');
    }
    if (n.name === 'Extraer Transcripción') {
      n.parameters.jsCode = JS_EXTRAER_TRANSCRIPCION;
      console.log('✅ Extraer Transcripción actualizado');
    }
    if (n.name === 'Asistente Kortesitos') {
      // Remove explicit text param — agent uses chatInput automatically
      delete n.parameters.text;
      // Set promptType to auto (uses chatInput field)
      n.parameters.promptType = 'auto';
      // Fix system message
      n.parameters.options = n.parameters.options || {};
      n.parameters.options.systemMessage = SYSTEM_PROMPT;
      console.log('✅ Asistente Kortesitos actualizado');
    }
    return n;
  });

  // Also fix Responder al Cliente — reference chat_id from the right node
  wf.nodes = wf.nodes.map(n => {
    if (n.name === 'Responder al Cliente') {
      n.parameters.chatId = "={{ $('Extraer Texto').first()?.json?.chat_id || $('Extraer Transcripción').first()?.json?.chat_id }}";
    }
    return n;
  });

  const s = wf.settings || {};
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: s.executionOrder },
    staticData: null
  };

  await api('PUT', '/workflows/6b0QdYNoUa4VIoVc', payload);
  console.log('✅ Workflow actualizado');

  // Deactivate and reactivate to apply changes
  await api('POST', '/workflows/6b0QdYNoUa4VIoVc/deactivate', {});
  await api('POST', '/workflows/6b0QdYNoUa4VIoVc/activate', {});
  console.log('✅ Bot reactivado');
}

main().catch(e => console.error('ERROR:', e.message.slice(0, 300)));
