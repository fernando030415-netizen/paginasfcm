const https = require('https');

const HOST = 'primary-production-be6ac.up.railway.app';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjhmNGJkOC05ZDY1LTRkYWEtYTBlMi1iOGY4NDA4NWQxYWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZmE2YTYwY2MtN2UzNi00NDhiLWJlNWMtY2IxOWU3M2JiOWY4IiwiaWF0IjoxNzc2NjQ5MjQ4fQ.4Bq9um5koYCSkbRl4KMn3PPtDG35-PIez19Sr0YMF6w';
const CRED_GCAL = '75YMYfjSChZlaKFH';
const CRED_OPENAI = 'yP40pwSI3QNYuEib';
const CRED_TELEGRAM = '5TDadkfQPVQyb5Jq';
const TG_TOKEN = '8778235150:AAFCccwNq9tSxSApCgqj48EK8r8D05BwI3w';
const CAL_WF_ID = 'FD9R8RCfxi1G0AYp';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: HOST,
      path: `/api/v1${path}`,
      method,
      headers: {
        'X-N8N-API-KEY': KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => {
        try {
          const p = JSON.parse(buf);
          if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${buf.slice(0, 500)}`));
          else resolve(p);
        } catch (e) { reject(new Error('Parse: ' + buf.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const JS_CALCULAR_DISPONIBILIDAD = `
const input = $('When Called by Tool').first().json;
const fecha = input.fecha;
const servicio = (input.servicio || '').toLowerCase();
const durMap = {
  'corte cabello': 30, 'cepillado': 45, 'peinado niña': 45, 'corte + barba': 45,
  'trenzas sencillas': 60, 'trenzas con extensión': 90, 'moños': 30,
  'recogidos': 30, 'spa capilar': 60, 'maquillaje': 45, 'corte dama': 45
};
let duracion = 45;
for (const [k, v] of Object.entries(durMap)) {
  if (servicio.includes(k)) { duracion = v; break; }
}
const fechaObj = new Date(fecha + 'T12:00:00-05:00');
const dow = fechaObj.getDay();
const horaFin = dow === 0 ? 17 : 19;
const allItems = $input.all();
const eventos = allItems
  .filter(item => item.json && item.json.id)
  .map(item => ({
    start: new Date(item.json.start?.dateTime || (item.json.start?.date + 'T00:00:00-05:00')),
    end:   new Date(item.json.end?.dateTime   || (item.json.end?.date   + 'T23:59:59-05:00'))
  }));
const slots = [];
for (let m = 9 * 60; m + duracion <= horaFin * 60; m += 30) {
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  const sS = new Date(fecha + 'T' + hh + ':' + mm + ':00-05:00');
  const sE = new Date(sS.getTime() + duracion * 60000);
  if (!eventos.some(e => sS < e.end && sE > e.start)) slots.push(hh + ':' + mm);
}
const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
if (!slots.length) {
  return [{ json: { resultado: 'No hay horarios disponibles el ' + fecha + ' (' + dias[dow] + '). Elige otra fecha.' } }];
}
return [{ json: { resultado: '📅 Horarios libres el ' + fecha + ' (' + dias[dow] + ') para *' + (input.servicio || 'el servicio') + '*:\\n' + slots.map(s => '• ' + s).join('\\n') + '\\n_(duración aprox. ' + duracion + ' min)_', slots, duracion } }];
`.trim();

const JS_CONFIRMAR_CITA = `
const e = $input.first().json;
const i = $('When Called by Tool').first().json;
const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const diaStr = dias[new Date(i.fecha + 'T12:00:00-05:00').getDay()];
return [{ json: { resultado: '✅ *¡Cita confirmada!*\\n\\n📅 ' + diaStr + ' ' + i.fecha + '\\n⏰ ' + i.hora + '\\n✂️ ' + i.servicio + '\\n👤 ' + i.cliente_nombre + '\\n\\n📍 Cra 80 #10A-10 Local 21, Cali\\n\\nTe avisamos 24h y 2h antes. ¡Nos vemos! 💙', event_id: e.id || '' } }];
`.trim();

const JS_FORMATEAR_LISTA = `
const i = $('When Called by Tool').first().json;
const cid = String(i.chat_id || '');
const misEventos = $input.all()
  .filter(item => item.json?.id && (item.json.description || '').includes('chat_id:' + cid))
  .map(item => {
    const ev = item.json;
    const startStr = ev.start?.dateTime || ev.start?.date;
    const fecha = startStr ? new Date(startStr).toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'}) : '?';
    const hora = ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',timeZone:'America/Bogota'}) : '';
    return { fecha, hora, titulo: ev.summary || 'Cita', eventId: ev.id };
  });
if (!misEventos.length) return [{ json: { resultado: 'No tienes citas próximas agendadas. ¿Deseas agendar una?' } }];
const lista = misEventos.map((e,idx) => (idx+1) + '. 📅 ' + e.fecha + ' ⏰ ' + e.hora + '\\n   ✂️ ' + e.titulo + '\\n   🔑 ID: ' + e.eventId).join('\\n\\n');
return [{ json: { resultado: '📋 *Tus próximas citas:*\\n\\n' + lista, citas: misEventos } }];
`.trim();

const JS_CANCELACION = `return [{ json: { resultado: '✅ Tu cita ha sido cancelada. ¡Cuando quieras volver a agendar, aquí estamos! 💙' } }];`.trim();

const JS_EXTRAER_TEXTO = `
const msg = $json.message || {};
const texto = msg.text || msg.caption || '';
const chatId = String(msg.chat?.id || '');
const nombre = msg.from?.first_name || 'Cliente';
const fechaHoy = new Date().toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'});
return [{ json: { texto, chat_id: chatId, nombre, fecha_hoy: fechaHoy } }];
`.trim();

const JS_EXTRAER_TRANSCRIPCION = `
const texto = $json.text || '';
const tgData = $('Telegram Trigger').first().json;
const chatId = String(tgData.message?.chat?.id || '');
const nombre = tgData.message?.from?.first_name || 'Cliente';
const fechaHoy = new Date().toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'});
return [{ json: { texto: '[Audio transcrito]: ' + texto, chat_id: chatId, nombre, fecha_hoy: fechaHoy } }];
`.trim();

const JS_RECORDATORIOS = `
const now = new Date();
const recordatorios = [];
for (const item of $input.all()) {
  const ev = item.json;
  if (!ev?.id || !ev.description?.includes('chat_id:')) continue;
  const startMs = new Date(ev.start?.dateTime || ev.start?.date).getTime();
  const diffMin = (startMs - now.getTime()) / 60000;
  const desc = ev.description || '';
  const chatIdMatch = desc.match(/chat_id:(\\d+)/);
  if (!chatIdMatch) continue;
  const chatId = chatIdMatch[1];
  if (diffMin >= 23*60 && diffMin < 25*60 && !desc.includes('rem24h:ok')) {
    const f = new Date(ev.start?.dateTime).toLocaleString('es-CO', {weekday:'long',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'America/Bogota'});
    recordatorios.push({ chatId, eventId: ev.id, mensaje: '⏰ *Recordatorio Kortesitos Kids*\\n\\nTienes una cita mañana:\\n' + ev.summary + '\\n📅 ' + f + '\\n📍 Cra 80 #10A-10 Local 21, Cali\\n\\n¡Te esperamos! 💙', tipo: '24h' });
  }
  if (diffMin >= 110 && diffMin < 130 && !desc.includes('rem2h:ok')) {
    const h = new Date(ev.start?.dateTime).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',timeZone:'America/Bogota'});
    recordatorios.push({ chatId, eventId: ev.id, mensaje: '⏰ *¡Tu cita es hoy!*\\n\\n' + ev.summary + '\\nA las ' + h + '\\n📍 Cra 80 #10A-10 Local 21, Cali\\n\\n¡Ya casi, te esperamos! 💙', tipo: '2h' });
  }
}
return recordatorios.length ? recordatorios.map(r => ({ json: r })) : [{ json: { skip: true } }];
`.trim();

const SYSTEM_PROMPT = `={{
'Eres la asistente virtual de Kortesitos Kids | Peluquería & Spa, en Cali, Cra 80 #10A-10 Local 21.\\n\\n' +
'SERVICIOS:\\n• Corte cabello $39,900 (30min)\\n• Cepillado $29,000 (45min)\\n• Peinado niña $39,900 (45min)\\n• Corte+barba $46,900 (45min)\\n• Trenzas sencillas $35,000 (60min)\\n• Trenzas con extensión desde $55,000 (90min)\\n• Moños/recogidos $25,000 (30min)\\n• Spa capilar $45,000 (60min)\\n• Maquillaje mamá $40,000 (45min)\\n• Corte dama $35,000 (45min)\\n\\n' +
'HORARIOS: Lun-Sab 9am-7pm | Dom 9am-5pm\\n\\n' +
'PROCESO PARA AGENDAR:\\n1. Pregunta el servicio\\n2. Pregunta la fecha\\n3. Llama gestor_citas con operation=verificar_disponibilidad (incluye fecha y servicio)\\n4. Muestra horarios disponibles\\n5. Pide el nombre si no lo sabes\\n6. Llama gestor_citas con operation=crear_cita\\n7. Confirma la cita al cliente\\n\\n' +
'REGLAS CRÍTICAS:\\n- chat_id del cliente: ' + $json.chat_id + ' — inclúyelo SIEMPRE en gestor_citas, nunca se lo pidas al cliente\\n' +
'- Hoy es: ' + $json.fecha_hoy + '\\n' +
'- Habla en español colombiano, tono cálido y amigable\\n' +
'- NUNCA inventes horarios, siempre consulta verificar_disponibilidad primero\\n' +
'- Para ver citas: operation=listar_citas\\n' +
'- Para cancelar: primero listar_citas para obtener el ID, luego cancelar_cita con event_id\\n' +
'- Si algo falla, pide al cliente que llame directamente a la peluquería'
}}`;

// ─── SUB-WORKFLOW ─────────────────────────────────────────────────────────────
const calendarWorkflow = {
  name: 'Kortesitos Kids - Herramienta Calendario',
  nodes: [
    { id: 'n1', name: 'When Called by Tool', type: 'n8n-nodes-base.executeWorkflowTrigger', typeVersion: 1, position: [240, 400], parameters: {} },
    {
      id: 'n2', name: 'Router', type: 'n8n-nodes-base.switch', typeVersion: 3, position: [460, 400],
      parameters: {
        mode: 'rules',
        rules: { values: [
          { conditions: { conditions: [{ leftValue: '={{ $json.operation }}', rightValue: 'verificar_disponibilidad', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' } } },
          { conditions: { conditions: [{ leftValue: '={{ $json.operation }}', rightValue: 'crear_cita', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' } } },
          { conditions: { conditions: [{ leftValue: '={{ $json.operation }}', rightValue: 'listar_citas', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' } } },
          { conditions: { conditions: [{ leftValue: '={{ $json.operation }}', rightValue: 'cancelar_cita', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' } } }
        ] },
        options: {}
      }
    },
    { id: 'n3', name: 'Eventos del Día', type: 'n8n-nodes-base.googleCalendar', typeVersion: 1, position: [700, 150], continueOnFail: true,
      credentials: { googleCalendarOAuth2Api: { id: CRED_GCAL, name: 'Google Calendar account' } },
      parameters: { resource: 'event', operation: 'getAll', calendarId: 'primary', returnAll: true,
        timeMin: "={{ new Date($json.fecha + 'T00:00:00-05:00').toISOString() }}",
        timeMax: "={{ new Date($json.fecha + 'T23:59:59-05:00').toISOString() }}",
        options: { singleEvents: true, orderBy: 'startTime' } }
    },
    { id: 'n4', name: 'Calcular Disponibilidad', type: 'n8n-nodes-base.code', typeVersion: 2, position: [940, 150], parameters: { mode: 'runOnceForAllItems', jsCode: JS_CALCULAR_DISPONIBILIDAD } },
    { id: 'n5', name: 'Crear Evento', type: 'n8n-nodes-base.googleCalendar', typeVersion: 1, position: [700, 350],
      credentials: { googleCalendarOAuth2Api: { id: CRED_GCAL, name: 'Google Calendar account' } },
      parameters: { resource: 'event', operation: 'create', calendarId: 'primary',
        start: "={{ new Date($json.fecha + 'T' + $json.hora + ':00-05:00').toISOString() }}",
        end:   "={{ new Date(new Date($json.fecha + 'T' + $json.hora + ':00-05:00').getTime() + ($json.duracion_minutos || 45) * 60000).toISOString() }}",
        additionalFields: {
          summary: "={{ '✂️ ' + $json.servicio + ' - ' + $json.cliente_nombre }}",
          description: "={{ 'chat_id:' + $json.chat_id + '\\nServicio: ' + $json.servicio + '\\nCliente: ' + $json.cliente_nombre + '\\nAgendado via bot' }}"
        } }
    },
    { id: 'n6', name: 'Confirmar Cita', type: 'n8n-nodes-base.code', typeVersion: 2, position: [940, 350], parameters: { mode: 'runOnceForAllItems', jsCode: JS_CONFIRMAR_CITA } },
    { id: 'n7', name: 'Próximas Citas', type: 'n8n-nodes-base.googleCalendar', typeVersion: 1, position: [700, 550], continueOnFail: true,
      credentials: { googleCalendarOAuth2Api: { id: CRED_GCAL, name: 'Google Calendar account' } },
      parameters: { resource: 'event', operation: 'getAll', calendarId: 'primary', returnAll: false, limit: 20,
        timeMin: '={{ new Date().toISOString() }}',
        timeMax: '={{ new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }}',
        options: { singleEvents: true, orderBy: 'startTime' } }
    },
    { id: 'n8', name: 'Formatear Lista', type: 'n8n-nodes-base.code', typeVersion: 2, position: [940, 550], parameters: { mode: 'runOnceForAllItems', jsCode: JS_FORMATEAR_LISTA } },
    { id: 'n9', name: 'Eliminar Cita', type: 'n8n-nodes-base.googleCalendar', typeVersion: 1, position: [700, 750],
      credentials: { googleCalendarOAuth2Api: { id: CRED_GCAL, name: 'Google Calendar account' } },
      parameters: { resource: 'event', operation: 'delete', calendarId: 'primary', eventId: '={{ $json.event_id }}' }
    },
    { id: 'n10', name: 'Cita Cancelada', type: 'n8n-nodes-base.code', typeVersion: 2, position: [940, 750], parameters: { mode: 'runOnceForAllItems', jsCode: JS_CANCELACION } }
  ],
  connections: {
    'When Called by Tool': { main: [[{ node: 'Router', type: 'main', index: 0 }]] },
    'Router': { main: [
      [{ node: 'Eventos del Día', type: 'main', index: 0 }],
      [{ node: 'Crear Evento', type: 'main', index: 0 }],
      [{ node: 'Próximas Citas', type: 'main', index: 0 }],
      [{ node: 'Eliminar Cita', type: 'main', index: 0 }]
    ] },
    'Eventos del Día': { main: [[{ node: 'Calcular Disponibilidad', type: 'main', index: 0 }]] },
    'Crear Evento':    { main: [[{ node: 'Confirmar Cita', type: 'main', index: 0 }]] },
    'Próximas Citas': { main: [[{ node: 'Formatear Lista', type: 'main', index: 0 }]] },
    'Eliminar Cita':   { main: [[{ node: 'Cita Cancelada', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }
};

// ─── BOT WORKFLOW ─────────────────────────────────────────────────────────────
const botWorkflow = {
  name: 'Kortesitos Kids - Bot Reservas',
  nodes: [
    { id: 'b1', name: 'Telegram Trigger', type: 'n8n-nodes-base.telegramTrigger', typeVersion: 1.1, position: [240, 300],
      webhookId: 'kortesitos-reservas-001',
      credentials: { telegramApi: { id: CRED_TELEGRAM, name: 'Telegram account' } },
      parameters: { updates: ['message'], additionalFields: {} }
    },
    { id: 'b2', name: '¿Es Voz?', type: 'n8n-nodes-base.if', typeVersion: 2, position: [460, 300],
      parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' }, conditions: [{ id: 'cv', leftValue: '={{ $json.message.voice }}', rightValue: '', operator: { type: 'object', operation: 'exists', singleValue: true } }], combinator: 'and' } }
    },
    // Rama texto (false = index 1)
    { id: 'b3', name: 'Extraer Texto', type: 'n8n-nodes-base.code', typeVersion: 2, position: [680, 460], parameters: { mode: 'runOnceForAllItems', jsCode: JS_EXTRAER_TEXTO } },
    // Rama voz (true = index 0)
    { id: 'b4', name: 'Obtener URL Audio', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [680, 140],
      parameters: { method: 'GET', url: `https://api.telegram.org/bot${TG_TOKEN}/getFile`, sendQuery: true, queryParameters: { parameters: [{ name: 'file_id', value: '={{ $json.message.voice.file_id }}' }] }, options: {} }
    },
    { id: 'b5', name: 'Descargar Audio', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [920, 140],
      parameters: { method: 'GET', url: `={{ 'https://api.telegram.org/file/bot${TG_TOKEN}/' + $json.result.file_path }}`, options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } } } }
    },
    { id: 'b6', name: 'Transcribir Audio', type: 'n8n-nodes-base.openAi', typeVersion: 1, position: [1160, 140],
      credentials: { openAiApi: { id: CRED_OPENAI, name: 'OpenAI account' } },
      parameters: { resource: 'audio', operation: 'transcribe', model: 'whisper-1', binaryPropertyName: 'data', options: { language: 'es' } }
    },
    { id: 'b7', name: 'Extraer Transcripción', type: 'n8n-nodes-base.code', typeVersion: 2, position: [1400, 140], parameters: { mode: 'runOnceForAllItems', jsCode: JS_EXTRAER_TRANSCRIPCION } },
    // AI Agent
    { id: 'b8', name: 'Asistente Kortesitos', type: '@n8n/n8n-nodes-langchain.agent', typeVersion: 1.7, position: [1640, 300],
      parameters: { agentType: 'toolsAgent', text: '={{ $json.texto }}', options: { systemMessage: SYSTEM_PROMPT } }
    },
    { id: 'b9', name: 'GPT-4o', type: '@n8n/n8n-nodes-langchain.lmChatOpenAi', typeVersion: 1, position: [1640, 520],
      credentials: { openAiApi: { id: CRED_OPENAI, name: 'OpenAI account' } },
      parameters: { model: 'gpt-4o', options: { temperature: 0.3 } }
    },
    { id: 'b10', name: 'Memoria Chat', type: '@n8n/n8n-nodes-langchain.memoryBufferWindow', typeVersion: 1.3, position: [1860, 520],
      parameters: { sessionKey: '={{ $json.chat_id }}', sessionIdType: 'customKey', contextWindowLength: 12 }
    },
    { id: 'b11', name: 'Herramienta Calendario', type: '@n8n/n8n-nodes-langchain.toolWorkflow', typeVersion: 1.3, position: [2080, 520],
      parameters: {
        name: 'gestor_citas',
        description: 'Gestiona citas en Kortesitos Kids. Usa operation: verificar_disponibilidad (horarios libres para fecha+servicio), crear_cita (agenda una cita), listar_citas (citas próximas del cliente), cancelar_cita (cancela por event_id). Siempre incluye chat_id.',
        workflowId: { __rl: true, value: CAL_WF_ID, mode: 'id' },
        workflowInputs: {
          mappingMode: 'defineBelow', value: {},
          schema: [
            { id: 'operation', displayName: 'operation', required: true, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
            { id: 'fecha', displayName: 'fecha', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            { id: 'hora', displayName: 'hora', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            { id: 'cliente_nombre', displayName: 'cliente_nombre', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            { id: 'servicio', displayName: 'servicio', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            { id: 'duracion_minutos', displayName: 'duracion_minutos', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
            { id: 'chat_id', displayName: 'chat_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            { id: 'event_id', displayName: 'event_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false }
          ]
        },
        fields: { values: [
          { name: 'operation',        type: 'string', stringValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('operation', 'Operacion a realizar', 'string') }}" },
          { name: 'fecha',            type: 'string', stringValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('fecha', 'Fecha YYYY-MM-DD', 'string') }}" },
          { name: 'hora',             type: 'string', stringValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('hora', 'Hora HH:MM formato 24h', 'string') }}" },
          { name: 'cliente_nombre',   type: 'string', stringValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('cliente_nombre', 'Nombre del cliente', 'string') }}" },
          { name: 'servicio',         type: 'string', stringValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('servicio', 'Nombre del servicio', 'string') }}" },
          { name: 'duracion_minutos', type: 'number', numberValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('duracion_minutos', 'Duracion en minutos', 'number') }}" },
          { name: 'chat_id',          type: 'string', stringValue: '={{ $json.chat_id }}' },
          { name: 'event_id',         type: 'string', stringValue: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('event_id', 'ID del evento Google Calendar', 'string') }}" }
        ] }
      }
    },
    { id: 'b12', name: 'Responder al Cliente', type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position: [1940, 300],
      credentials: { telegramApi: { id: CRED_TELEGRAM, name: 'Telegram account' } },
      parameters: {
        resource: 'message', operation: 'sendMessage',
        chatId: "={{ $('Extraer Texto').first()?.json?.chat_id || $('Extraer Transcripción').first()?.json?.chat_id }}",
        text: '={{ $json.output }}',
        additionalFields: { parse_mode: 'Markdown' }
      }
    }
  ],
  connections: {
    'Telegram Trigger': { main: [[{ node: '¿Es Voz?', type: 'main', index: 0 }]] },
    '¿Es Voz?': { main: [
      [{ node: 'Obtener URL Audio', type: 'main', index: 0 }],
      [{ node: 'Extraer Texto',     type: 'main', index: 0 }]
    ] },
    'Obtener URL Audio':     { main: [[{ node: 'Descargar Audio',       type: 'main', index: 0 }]] },
    'Descargar Audio':       { main: [[{ node: 'Transcribir Audio',     type: 'main', index: 0 }]] },
    'Transcribir Audio':     { main: [[{ node: 'Extraer Transcripción', type: 'main', index: 0 }]] },
    'Extraer Texto':         { main: [[{ node: 'Asistente Kortesitos',  type: 'main', index: 0 }]] },
    'Extraer Transcripción': { main: [[{ node: 'Asistente Kortesitos',  type: 'main', index: 0 }]] },
    'Asistente Kortesitos':  { main: [[{ node: 'Responder al Cliente',  type: 'main', index: 0 }]] },
    'GPT-4o':                { ai_languageModel: [[{ node: 'Asistente Kortesitos', type: 'ai_languageModel', index: 0 }]] },
    'Memoria Chat':          { ai_memory:        [[{ node: 'Asistente Kortesitos', type: 'ai_memory',        index: 0 }]] },
    'Herramienta Calendario':{ ai_tool:           [[{ node: 'Asistente Kortesitos', type: 'ai_tool',          index: 0 }]] }
  },
  settings: { executionOrder: 'v1', saveManualExecutions: true }
};

// ─── RECORDATORIOS WORKFLOW ───────────────────────────────────────────────────
const JS_RECORDATORIOS_STR = JS_RECORDATORIOS;
const remindersWorkflow = {
  name: 'Kortesitos Kids - Recordatorios',
  nodes: [
    { id: 'r1', name: 'Cada 30 Minutos', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.1, position: [240, 300],
      parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 30 }] } }
    },
    { id: 'r2', name: 'Obtener Citas Próximas', type: 'n8n-nodes-base.googleCalendar', typeVersion: 1, position: [460, 300], continueOnFail: true,
      credentials: { googleCalendarOAuth2Api: { id: CRED_GCAL, name: 'Google Calendar account' } },
      parameters: { resource: 'event', operation: 'getAll', calendarId: 'primary', returnAll: false, limit: 50,
        timeMin: '={{ new Date().toISOString() }}',
        timeMax: '={{ new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString() }}',
        options: { singleEvents: true, orderBy: 'startTime' } }
    },
    { id: 'r3', name: 'Filtrar Recordatorios', type: 'n8n-nodes-base.code', typeVersion: 2, position: [700, 300],
      parameters: { mode: 'runOnceForAllItems', jsCode: JS_RECORDATORIOS_STR }
    },
    { id: 'r4', name: '¿Hay recordatorios?', type: 'n8n-nodes-base.if', typeVersion: 2, position: [940, 300],
      parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' }, conditions: [{ id: 'cs', leftValue: '={{ $json.skip }}', rightValue: true, operator: { type: 'boolean', operation: 'notEquals' } }], combinator: 'and' } }
    },
    { id: 'r5', name: 'Enviar Recordatorio', type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position: [1180, 200],
      credentials: { telegramApi: { id: CRED_TELEGRAM, name: 'Telegram account' } },
      parameters: { resource: 'message', operation: 'sendMessage', chatId: '={{ $json.chatId }}', text: '={{ $json.mensaje }}', additionalFields: { parse_mode: 'Markdown' } }
    },
    { id: 'r6', name: 'Marcar Recordatorio Enviado', type: 'n8n-nodes-base.googleCalendar', typeVersion: 1, position: [1420, 200],
      credentials: { googleCalendarOAuth2Api: { id: CRED_GCAL, name: 'Google Calendar account' } },
      parameters: { resource: 'event', operation: 'update', calendarId: 'primary', eventId: '={{ $json.eventId }}',
        updateFields: { description: "={{ $('Obtener Citas Próximas').all().find(i => i.json.id === $json.eventId)?.json?.description + ($json.tipo === '24h' ? '\\nrem24h:ok' : '\\nrem2h:ok') }}" }
      }
    }
  ],
  connections: {
    'Cada 30 Minutos':        { main: [[{ node: 'Obtener Citas Próximas', type: 'main', index: 0 }]] },
    'Obtener Citas Próximas': { main: [[{ node: 'Filtrar Recordatorios',  type: 'main', index: 0 }]] },
    'Filtrar Recordatorios':  { main: [[{ node: '¿Hay recordatorios?',    type: 'main', index: 0 }]] },
    '¿Hay recordatorios?': { main: [
      [{ node: 'Enviar Recordatorio', type: 'main', index: 0 }],
      []
    ] },
    'Enviar Recordatorio': { main: [[{ node: 'Marcar Recordatorio Enviado', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('1️⃣  Actualizando Herramienta Calendario...');
  try {
    await api('PUT', `/workflows/${CAL_WF_ID}`, calendarWorkflow);
    console.log('   ✅ OK:', CAL_WF_ID);
  } catch(e) { console.error('   ❌', e.message.slice(0, 200)); }

  console.log('2️⃣  Creando Bot de Reservas...');
  let botId = null;
  try {
    const r = await api('POST', '/workflows', botWorkflow);
    botId = r.id;
    console.log('   ✅ OK:', botId);
  } catch(e) { console.error('   ❌', e.message.slice(0, 200)); }

  console.log('3️⃣  Creando Recordatorios...');
  let remId = null;
  try {
    const r = await api('POST', '/workflows', remindersWorkflow);
    remId = r.id;
    console.log('   ✅ OK:', remId);
  } catch(e) { console.error('   ❌', e.message.slice(0, 200)); }

  console.log('4️⃣  Activando workflows...');
  for (const [id, name] of [[CAL_WF_ID,'Calendario'],[botId,'Bot'],[remId,'Recordatorios']]) {
    if (!id) continue;
    try {
      await api('PATCH', `/workflows/${id}`, { active: true });
      console.log('   ✅', name, 'activado');
    } catch(e) { console.error('   ⚠️', name, ':', e.message.slice(0, 150)); }
  }

  console.log('\n📋 IDs finales:');
  console.log('   Herramienta Calendario:', CAL_WF_ID);
  console.log('   Bot de Reservas:', botId);
  console.log('   Recordatorios:', remId);
}

main().catch(console.error);
