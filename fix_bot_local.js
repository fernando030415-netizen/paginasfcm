// Reads bot_current.json, fixes it, writes bot_v2.json
const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('bot_current.json', 'utf8'));

const JS_TEXTO = `const msg = $json.message || {};
const chatInput = msg.text || msg.caption || '';
const chatId = String(msg.chat?.id || '');
const nombre = msg.from?.first_name || 'Cliente';
const fechaHoy = new Date().toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'});
return [{ json: { chatInput, chat_id: chatId, nombre, fecha_hoy: fechaHoy } }];`;

const JS_AUDIO = `const chatInput = '[Audio]: ' + ($json.text || '');
const tgData = $('Telegram Trigger').first().json;
const chatId = String(tgData.message?.chat?.id || '');
const nombre = tgData.message?.from?.first_name || 'Cliente';
const fechaHoy = new Date().toLocaleDateString('es-CO', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/Bogota'});
return [{ json: { chatInput, chat_id: chatId, nombre, fecha_hoy: fechaHoy } }];`;

const PROMPT = `={{
'Eres la asistente de Kortesitos Kids | Peluquería & Spa, Cali, Cra 80 #10A-10 Local 21.\\n\\n' +
'SERVICIOS:\\n• Corte cabello $39,900\\n• Cepillado $29,000\\n• Peinado niña $39,900\\n• Corte+barba $46,900\\n• Trenzas sencillas $35,000\\n• Trenzas con extensión desde $55,000\\n• Moños/recogidos $25,000\\n• Spa capilar $45,000\\n• Maquillaje mamá $40,000\\n• Corte dama $35,000\\n\\n' +
'HORARIOS: Lun-Sab 9am-7pm | Dom 9am-5pm\\n\\n' +
'REGLAS:\\n- chat_id del cliente: ' + $json.chat_id + ' — ponlo SIEMPRE en gestor_citas, nunca se lo pidas al cliente\\n' +
'- Hoy es: ' + $json.fecha_hoy + '\\n' +
'- Español colombiano, tono cálido\\n' +
'- PROCESO: 1)pregunta servicio 2)pregunta fecha 3)verificar_disponibilidad 4)cliente elige hora 5)pide nombre 6)crear_cita 7)confirma\\n' +
'- NUNCA inventes horarios libres\\n' +
'- Para ver citas del cliente: listar_citas\\n' +
'- Para cancelar: lista primero para obtener event_id, luego cancelar_cita'
}}`;

wf.nodes = wf.nodes.map(n => {
  if (n.name === 'Extraer Texto') {
    n.parameters.jsCode = JS_TEXTO;
    console.log('✅ Extraer Texto');
  }
  if (n.name === 'Extraer Transcripción') {
    n.parameters.jsCode = JS_AUDIO;
    console.log('✅ Extraer Transcripción');
  }
  if (n.name === 'Asistente Kortesitos') {
    delete n.parameters.text;
    n.parameters.promptType = 'auto';
    n.parameters.options = n.parameters.options || {};
    n.parameters.options.systemMessage = PROMPT;
    console.log('✅ Asistente Kortesitos');
  }
  return n;
});

const s = wf.settings || {};
const out = {
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: { executionOrder: s.executionOrder },
  staticData: null
};

fs.writeFileSync('bot_v2.json', JSON.stringify(out));
console.log('✅ bot_v2.json guardado');
