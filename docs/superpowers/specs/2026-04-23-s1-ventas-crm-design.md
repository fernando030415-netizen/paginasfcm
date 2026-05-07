# S1 — Ventas & CRM · Q'Detalle
**Fecha:** 2026-04-23  
**Estado:** Aprobado  
**Proyecto:** Q'Detalle — FCM Producciones  

---

## 1. Objetivo

Sistema de ventas semi-automatizado vía WhatsApp que:
- Responde al instante con un bot vendedor en tono Q'Detalle
- Recolecta todos los datos del pedido
- Hace handoff al humano para confirmación de pago
- Registra cada venta en CRM (Google Sheets)

---

## 2. Stack

| Componente | Herramienta |
|---|---|
| Mensajería | WhatsApp Cloud API (Meta, tier gratuito) |
| Automatización | n8n (self-hosted o cloud) |
| IA conversacional | GPT-4o (OpenAI API) |
| Pagos | Bold (link de pago por orden) |
| CRM Fase 1 | Google Sheets |
| Notificación humano | Telegram bot |

---

## 3. Arquitectura

```
TikTok / Instagram Reels
        ↓ (link en bio o respuesta a comentario)
WhatsApp Cloud API
        ↓ webhook POST
n8n Workflow
        ↓
  [GPT-4o Node]
  Contexto: prompt Q'Detalle + catálogo + últimos 20 mensajes del hilo
        ↓
  ¿Intención de compra detectada?
  NO → sigue conversación
  SÍ → recolección completada?
       NO → solicita dato faltante
       SÍ → handoff
        ↓
  Telegram: notifica humano con resumen del pedido
        ↓
  Humano envía link Bold al cliente por WhatsApp
  Humano confirma pago
        ↓
  n8n registra fila en Google Sheets
```

---

## 4. Flujo conversacional del bot

### Etapa 1 — Saludo
Trigger: primer mensaje entrante de número nuevo.  
Bot: saludo cálido en tono Q'Detalle, pregunta qué detalle va a dar.

### Etapa 2 — Catálogo
Presenta máximo 3 opciones con descripción breve y precio `[TBD]`:
- Kit Pareja (producto estrella)
- Productos sueltos (peluche + loción, pulseras, etc.)
- Kit Premium

### Etapa 3 — Recolección de datos
El bot recolecta en conversación natural:
- Producto elegido
- Nombre de quien recibe
- Dedicatoria personalizada (opcional)
- Ciudad y barrio de entrega

### Etapa 4 — Confirmación de pedido
Bot repite resumen completo del pedido y pregunta confirmación.

### Etapa 5 — Handoff
Bot informa que pasa a confirmación de pago.  
n8n envía a Telegram del humano:
```
🛍 Nuevo pedido Q'Detalle
Producto: [X]
Para: [nombre]
Dedicatoria: [texto]
Entrega: [ciudad / barrio]
Cliente WA: +57XXXXXXXXXX
```

### Etapa 6 — Cierre humano
Humano envía link Bold al cliente.  
Humano confirma pago enviando `/pagado QD-001` al bot Telegram → n8n registra en Sheets.

---

## 5. CRM — Estructura Google Sheets

| Columna | Descripción |
|---|---|
| Fecha | Timestamp automático |
| Nombre cliente | Del perfil WA o recolectado |
| Teléfono | Número WA |
| Producto | Kit / suelto / premium |
| Dedicatoria | Texto personalizado |
| Ciudad | Destino de envío |
| Monto | `[TBD según precios]` |
| Estado | Pendiente / Pagado / Enviado |
| Código orden | Autogenerado (QD-001, QD-002…) |

---

## 6. Prompt del bot (directrices)

- Tono: cálido, íntimo, directo. Sin cursilerías. Como habla una pareja que se conoce bien.
- Nunca genérico, nunca formal.
- Máximo 2 líneas por mensaje.
- No menciona que es un bot a menos que le pregunten directamente.
- Si el cliente pregunta precio de algo no listado → escala a humano.
- Si el cliente está molesto → escala a humano inmediatamente.

---

## 7. Condiciones de handoff

El bot transfiere al humano cuando:
1. Cliente confirma pedido completo (happy path)
2. Cliente pregunta por precio/producto no catalogado
3. Cliente expresa molestia o queja
4. Conversación supera 10 turnos sin conversión

---

## 8. Lo que NO incluye S1

- Pasarela de pago automática (pago manual por Bold link)
- Seguimiento de envíos
- Sistema de premios / rifas (→ S2)
- E-commerce web (→ S3)
- Automatización post-compra (→ S4)

---

## 9. Pendientes antes de implementar

- [ ] Definir precios de todos los productos
- [ ] Número de teléfono dedicado para WhatsApp Business API
- [ ] Cuenta Meta Business verificada
- [ ] Cuenta Bold activa
- [ ] Número Telegram del humano que cierra ventas

---

## 10. Métricas de éxito S1

| Métrica | Meta Fase 1 |
|---|---|
| Tiempo de primera respuesta | < 30 segundos |
| Tasa conversión bot → pedido | > 40% |
| Ventas mes 1 | ≥ 30 unidades |
| Primera venta | ≤ 2 semanas post-lanzamiento |
