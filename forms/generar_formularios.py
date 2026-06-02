#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generador de formularios de arrendamiento - Inmobiliaria DSE S.A.S."""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, PageBreak)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import KeepTogether
import os

# ── COLORES INSTITUCIONALES ───────────────────────────────────────
NAVY   = colors.HexColor('#0C1B2E')
GOLD   = colors.HexColor('#C4962A')
GOLD_L = colors.HexColor('#F0D98A')
LIGHT  = colors.HexColor('#F7F5F0')
GRAY   = colors.HexColor('#7A6E5E')
WHITE  = colors.white
BLACK  = colors.HexColor('#0A0A0A')

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── ESTILOS BASE ──────────────────────────────────────────────────
def get_styles():
    s = getSampleStyleSheet()
    base = dict(fontName='Helvetica', fontSize=9, leading=13,
                textColor=BLACK, spaceAfter=2)
    return {
        'h_title': ParagraphStyle('ht', **{**base, 'fontName':'Helvetica-Bold',
            'fontSize':16, 'textColor':NAVY, 'alignment':TA_CENTER, 'spaceAfter':4}),
        'h_sub':   ParagraphStyle('hs', **{**base, 'fontName':'Helvetica',
            'fontSize':10, 'textColor':GRAY, 'alignment':TA_CENTER, 'spaceAfter':12}),
        'section': ParagraphStyle('sec', **{**base, 'fontName':'Helvetica-Bold',
            'fontSize':9, 'textColor':WHITE, 'backColor':NAVY,
            'leftIndent':6, 'rightIndent':6, 'spaceBefore':10, 'spaceAfter':6,
            'borderPad':4}),
        'label':   ParagraphStyle('lbl', **{**base, 'fontName':'Helvetica-Bold',
            'fontSize':7.5, 'textColor':GRAY, 'spaceAfter':0}),
        'body':    ParagraphStyle('bod', **{**base, 'fontName':'Helvetica',
            'fontSize':8.5, 'textColor':BLACK, 'alignment':TA_JUSTIFY, 'spaceAfter':4}),
        'clause':  ParagraphStyle('cla', **{**base, 'fontName':'Helvetica',
            'fontSize':8, 'textColor':BLACK, 'alignment':TA_JUSTIFY,
            'leftIndent':10, 'spaceAfter':5}),
        'note':    ParagraphStyle('not', **{**base, 'fontName':'Helvetica-Oblique',
            'fontSize':7.5, 'textColor':GRAY, 'spaceAfter':3}),
        'footer':  ParagraphStyle('ft', **{**base, 'fontName':'Helvetica',
            'fontSize':7, 'textColor':GRAY, 'alignment':TA_CENTER}),
        'sign_lbl':ParagraphStyle('sl', **{**base, 'fontName':'Helvetica',
            'fontSize':8, 'textColor':GRAY, 'alignment':TA_CENTER, 'spaceAfter':0}),
    }

# ── HELPERS ───────────────────────────────────────────────────────
def header_table(title, subtitle, doc_code):
    """Logo + título institucional."""
    data = [[
        Paragraph(f'<b>DSE</b>', ParagraphStyle('log', fontName='Helvetica-Bold',
            fontSize=22, textColor=GOLD, alignment=TA_CENTER)),
        Paragraph(f'<b>Inmobiliaria DSE S.A.S.</b><br/>'
                  f'NIT: 900.XXX.XXX-X | dsesas@gmail.com<br/>'
                  f'Cra. 4 N&#176; 12-41 Of. 503, Cali | 321 746 7970',
                  ParagraphStyle('info', fontName='Helvetica', fontSize=8,
                      textColor=NAVY, leading=11)),
        Paragraph(f'<b>{doc_code}</b><br/>'
                  f'Fecha: ___/___/______<br/>Expediente: _________',
                  ParagraphStyle('cod', fontName='Helvetica', fontSize=8,
                      textColor=GRAY, alignment=TA_RIGHT, leading=11)),
    ]]
    t = Table(data, colWidths=[2.8*cm, 11*cm, 4.2*cm])
    t.setStyle(TableStyle([
        ('VALIGN',    (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [LIGHT]),
        ('BOX',       (0,0), (-1,-1), 1.5, GOLD),
        ('LINEBELOW', (0,0), (-1,0),  2,   GOLD),
        ('LEFTPADDING',  (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING',   (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0), (-1,-1), 8),
    ]))
    return t

def sec_title(text, styles):
    return Paragraph(f'  {text}', styles['section'])

def field_row(labels_widths, styles, height=0.65*cm):
    """Genera una fila de campos con línea de escritura."""
    cells = []
    widths = []
    for lbl, w in labels_widths:
        cells.append(
            Paragraph(f'{lbl}:<br/><font size="9">__________________________</font>',
                      styles['body'])
        )
        widths.append(w * cm)
    t = Table([cells], colWidths=widths)
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    return t

def field_table(rows_data, styles, col_widths=None):
    """Tabla de campos con bordes sutiles."""
    table_data = []
    for row in rows_data:
        cells = []
        for lbl in row:
            cells.append(Paragraph(
                f'<b><font size="7" color="#{GRAY.hexval()[2:].upper()}">{lbl}</font></b><br/>'
                f'<font size="9"> </font>',
                styles['body']))
        table_data.append(cells)
    ncols = len(rows_data[0]) if rows_data else 1
    cw = col_widths or [18*cm / ncols] * ncols
    t = Table(table_data, colWidths=cw, rowHeights=[1.1*cm]*len(rows_data))
    t.setStyle(TableStyle([
        ('BOX',         (0,0), (-1,-1), 0.5, colors.HexColor('#DDD5C8')),
        ('INNERGRID',   (0,0), (-1,-1), 0.5, colors.HexColor('#DDD5C8')),
        ('VALIGN',      (0,0), (-1,-1), 'BOTTOM'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING',(0,0), (-1,-1), 6),
        ('TOPPADDING',  (0,0), (-1,-1), 4),
        ('BOTTOMPADDING',(0,0)(-1,-1), 4),
        ('ROWBACKGROUNDS',(0,0),(-1,-1),[WHITE, LIGHT]),
    ]))
    return t

def sign_table(signers, styles):
    """Tabla de firmas."""
    line = '________________________________'
    cells = []
    for s in signers:
        cells.append(Paragraph(
            f'{line}<br/>'
            f'<b><font size="8">{s}</font></b><br/>'
            f'<font size="7" color="#7A6E5E">C.C. / NIT: ________________</font>',
            styles['sign_lbl']))
    t = Table([cells], colWidths=[18*cm / len(signers)] * len(signers))
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('TOPPADDING', (0,0), (-1,-1), 30),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    return t

def gold_line():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=6, spaceBefore=4)

def footer_note(styles):
    return Paragraph(
        'Inmobiliaria DSE S.A.S. | Cra. 4 N° 12-41 Of. 503, Edificio Seguros Bolívar, Cali | '
        'Tel. 321 746 7970 | dsesas@gmail.com',
        styles['footer'])


# ═══════════════════════════════════════════════════════════════════
# 1. CONTRATO DE ARRENDAMIENTO RESIDENCIAL
# ═══════════════════════════════════════════════════════════════════
def contrato_residencial():
    path = os.path.join(OUTPUT_DIR, 'contrato-arrendamiento-residencial.pdf')
    doc = SimpleDocTemplate(path, pagesize=letter,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    st = get_styles()
    story = []

    story.append(header_table('CONTRATO DE ARRENDAMIENTO RESIDENCIAL',
                               'Inmobiliaria DSE S.A.S.', 'CAR-001'))
    story.append(Spacer(1, 10))
    story.append(Paragraph('CONTRATO DE ARRENDAMIENTO DE INMUEBLE RESIDENCIAL', st['h_title']))
    story.append(Paragraph('Ley 820 de 2003 — República de Colombia', st['h_sub']))
    story.append(gold_line())

    # ARRENDADOR
    story.append(sec_title('1. DATOS DEL ARRENDADOR', st))
    for row in [
        [('Nombre completo / Razón social', 12), ('C.C. / NIT', 6)],
        [('Dirección de residencia / domicilio', 11), ('Ciudad', 4), ('Depto.', 3)],
        [('Teléfono', 6), ('Correo electrónico', 12)],
    ]:
        story.append(field_row(row, st))
        story.append(Spacer(1, 4))

    # ARRENDATARIO
    story.append(sec_title('2. DATOS DEL ARRENDATARIO', st))
    for row in [
        [('Nombre completo', 12), ('C.C.', 6)],
        [('Dirección actual', 11), ('Ciudad', 4), ('Depto.', 3)],
        [('Teléfono', 6), ('Correo electrónico', 12)],
        [('Actividad / Profesión', 9), ('Empleador / Empresa', 9)],
    ]:
        story.append(field_row(row, st))
        story.append(Spacer(1, 4))

    # CODEUDOR
    story.append(sec_title('3. DATOS DEL CODEUDOR / FIADOR (si aplica)', st))
    for row in [
        [('Nombre completo', 12), ('C.C.', 6)],
        [('Teléfono', 6), ('Correo electrónico', 12)],
        [('Actividad / Profesión', 9), ('Empleador / Empresa', 9)],
    ]:
        story.append(field_row(row, st))
        story.append(Spacer(1, 4))

    # INMUEBLE
    story.append(sec_title('4. DESCRIPCIÓN DEL INMUEBLE', st))
    for row in [
        [('Dirección del inmueble', 12), ('Apto / Apto int.', 6)],
        [('Barrio', 6), ('Ciudad', 6), ('Estrato', 3), ('Piso', 3)],
        [('Hab.', 3), ('Baños', 3), ('Área m²', 4), ('Garajes', 3), ('Parqueadero N°', 5)],
        [('Descripción adicional (acabados, equipos, etc.)', 18)],
    ]:
        story.append(field_row(row, st))
        story.append(Spacer(1, 4))

    # CONDICIONES
    story.append(sec_title('5. CONDICIONES ECONÓMICAS', st))
    for row in [
        [('Canon mensual (COP)', 9), ('Fecha de pago (día del mes)', 9)],
        [('Depósito / Garantía (COP)', 9), ('Forma de pago del depósito', 9)],
        [('Fecha de inicio', 6), ('Fecha de terminación', 6), ('Duración (meses)', 6)],
        [('Inclusión de servicios públicos: ☐ Sí  ☐ No', 9),
         ('¿Cuáles? _________________________', 9)],
    ]:
        story.append(field_row(row, st))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 6))
    story.append(gold_line())

    # CLÁUSULAS
    story.append(sec_title('6. CLÁUSULAS Y CONDICIONES (Ley 820 de 2003)', st))
    clausulas = [
        ('PRIMERA — DESTINACIÓN:', 'El inmueble objeto del presente contrato será '
         'destinado única y exclusivamente para uso de vivienda urbana del arrendatario '
         'y su grupo familiar. Queda expresamente prohibida cualquier actividad comercial, '
         'industrial o de otra índole.'),
        ('SEGUNDA — INCREMENTO DEL CANON:', 'El canon de arrendamiento será incrementado '
         'anualmente en un porcentaje no superior al ciento por ciento (100%) del índice de '
         'Precios al Consumidor (IPC) del año calendario anterior, conforme al Art. 20 de la '
         'Ley 820 de 2003.'),
        ('TERCERA — RESTITUCIÓN DEL INMUEBLE:', 'Vencido el término del contrato, el '
         'arrendatario deberá restituir el inmueble al arrendador en las mismas condiciones '
         'en que lo recibió, salvo el deterioro natural por el uso normal.'),
        ('CUARTA — REPARACIONES:', 'Las reparaciones locativas serán a cargo del arrendatario. '
         'Las reparaciones necesarias y/o de obra serán a cargo del arrendador, salvo pacto '
         'en contrario debidamente suscrito por las partes.'),
        ('QUINTA — SERVICIOS PÚBLICOS:', 'El pago de los servicios públicos domiciliarios '
         '(energía, agua, gas, teléfono, internet) estará a cargo del arrendatario, '
         'salvo estipulación en contrario indicada en la cláusula 5.'),
        ('SEXTA — SUBLETO Y CESIÓN:', 'El arrendatario no podrá subarrendar ni ceder total '
         'ni parcialmente el inmueble ni el presente contrato, sin autorización escrita '
         'previa del arrendador.'),
        ('SÉPTIMA — INCUMPLIMIENTO:', 'El incumplimiento de cualquiera de las obligaciones '
         'pactadas dará derecho a la parte afectada a solicitar la terminación del contrato '
         'y la indemnización de perjuicios de acuerdo con la ley.'),
        ('OCTAVA — INTERVENTOR INMOBILIARIO:', 'Las partes acuerdan que Inmobiliaria DSE S.A.S. '
         'actuará como administrador e intermediario del presente contrato, quedando facultada '
         'para recibir pagos, realizar cobros y gestionar comunicaciones entre las partes.'),
    ]
    for titulo, texto in clausulas:
        story.append(Paragraph(f'<b>{titulo}</b> {texto}', st['clause']))

    # OBSERVACIONES
    story.append(sec_title('7. OBSERVACIONES ESPECIALES', st))
    for _ in range(4):
        story.append(HRFlowable(width='100%', thickness=0.5,
                                color=colors.HexColor('#DDD5C8'), spaceAfter=14))

    story.append(Spacer(1, 12))
    story.append(gold_line())
    story.append(Paragraph('En constancia de lo anterior, las partes firman el presente contrato '
                            'a los ___ días del mes de ____________ del año _______.', st['body']))
    story.append(Spacer(1, 6))
    story.append(sign_table(['ARRENDADOR', 'ARRENDATARIO', 'CODEUDOR / FIADOR'], st))
    story.append(Spacer(1, 12))
    story.append(sign_table(['REPRESENTANTE INMOBILIARIA DSE S.A.S.', 'TESTIGO'], st))
    story.append(Spacer(1, 20))
    story.append(gold_line())
    story.append(footer_note(st))

    doc.build(story)
    print(f'  ✓  {path}')


# ═══════════════════════════════════════════════════════════════════
# 2. CONTRATO DE ARRENDAMIENTO COMERCIAL
# ═══════════════════════════════════════════════════════════════════
def contrato_comercial():
    path = os.path.join(OUTPUT_DIR, 'contrato-arrendamiento-comercial.pdf')
    doc = SimpleDocTemplate(path, pagesize=letter,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    st = get_styles()
    story = []

    story.append(header_table('CONTRATO DE ARRENDAMIENTO COMERCIAL',
                               'Inmobiliaria DSE S.A.S.', 'CAC-001'))
    story.append(Spacer(1, 10))
    story.append(Paragraph('CONTRATO DE ARRENDAMIENTO COMERCIAL', st['h_title']))
    story.append(Paragraph('Código de Comercio — República de Colombia', st['h_sub']))
    story.append(gold_line())

    story.append(sec_title('1. DATOS DEL ARRENDADOR', st))
    for row in [
        [('Razón social / Nombre', 10), ('NIT / C.C.', 4), ('Rep. Legal', 4)],
        [('Dirección', 11), ('Ciudad', 4), ('Teléfono', 3)],
        [('Correo electrónico', 9), ('Matrícula mercantil', 9)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('2. DATOS DEL ARRENDATARIO', st))
    for row in [
        [('Razón social / Nombre', 10), ('NIT / C.C.', 4), ('Rep. Legal', 4)],
        [('Dirección comercial', 10), ('Ciudad', 4), ('Teléfono', 4)],
        [('Correo electrónico', 9), ('Actividad comercial (CIIU)', 9)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('3. DESCRIPCIÓN DEL INMUEBLE COMERCIAL', st))
    for row in [
        [('Dirección del inmueble', 12), ('Local / Oficina N°', 6)],
        [('Centro comercial / Edificio', 9), ('Piso', 3), ('Torre', 3), ('Módulo', 3)],
        [('Área total m²', 5), ('Área oficinas m²', 5), ('Bod. m²', 4), ('Parq.', 4)],
        [('Descripción de instalaciones (electricidad, plomeria, A/C, etc.)', 18)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('4. CONDICIONES ECONÓMICAS', st))
    for row in [
        [('Canon mensual (COP)', 9), ('Forma de pago', 9)],
        [('Depósito / Garantía (COP)', 9), ('Póliza de cumplimiento: ☐ Sí  ☐ No', 9)],
        [('Fecha de inicio', 6), ('Fecha de terminación', 6), ('Duración', 6)],
        [('Destinación del inmueble (actividad autorizada)', 18)],
        [('Servicios incluidos en el canon', 9), ('Administración mensual (COP)', 9)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('5. CLÁUSULAS COMERCIALES', st))
    clausulas = [
        ('PRIMERA — DESTINACIÓN:', 'El inmueble será destinado exclusivamente para el '
         'ejercicio de la actividad comercial señalada en el numeral 4. Cualquier cambio '
         'de destinación requerirá autorización escrita previa del arrendador.'),
        ('SEGUNDA — MEJORAS:', 'El arrendatario no podrá realizar modificaciones, obras '
         'ni instalaciones sin autorización escrita del arrendador. Las mejoras que se '
         'realicen con autorización quedarán en beneficio del inmueble sin derecho a '
         'indemnización, salvo pacto en contrario.'),
        ('TERCERA — PRORROGA AUTOMÁTICA:', 'Si ninguna de las partes manifiesta por '
         'escrito con 3 meses de antelación su deseo de no prorrogar, el contrato se '
         'entenderá prorrogado automáticamente por un período igual al inicial.'),
        ('CUARTA — DERECHOS DE PREFERENCIA:', 'El arrendatario tendrá derecho de '
         'preferencia para la renovación del contrato en igualdad de condiciones '
         'frente a terceros, siempre que haya cumplido sus obligaciones.'),
        ('QUINTA — CLAUSULA PENAL:', 'El incumplimiento de cualquier obligación '
         'generará una penalidad equivalente al valor de tres (3) cánones mensuales '
         'de arrendamiento, sin perjuicio de los perjuicios adicionales.'),
    ]
    for titulo, texto in clausulas:
        story.append(Paragraph(f'<b>{titulo}</b> {texto}', st['clause']))

    story.append(sec_title('6. OBSERVACIONES', st))
    for _ in range(3):
        story.append(HRFlowable(width='100%', thickness=0.5,
                                color=colors.HexColor('#DDD5C8'), spaceAfter=14))

    story.append(Spacer(1, 10))
    story.append(gold_line())
    story.append(Paragraph('En constancia de lo anterior, las partes firman a los ___ días '
                            'del mes de ____________ del año _______.', st['body']))
    story.append(Spacer(1, 6))
    story.append(sign_table(['ARRENDADOR / REP. LEGAL', 'ARRENDATARIO / REP. LEGAL'], st))
    story.append(Spacer(1, 12))
    story.append(sign_table(['REPRESENTANTE INMOBILIARIA DSE S.A.S.', 'TESTIGO'], st))
    story.append(Spacer(1, 20))
    story.append(gold_line())
    story.append(footer_note(st))

    doc.build(story)
    print(f'  ✓  {path}')


# ═══════════════════════════════════════════════════════════════════
# 3. SOLICITUD Y ESTUDIO SOCIOECONÓMICO
# ═══════════════════════════════════════════════════════════════════
def solicitud_estudio():
    path = os.path.join(OUTPUT_DIR, 'solicitud-estudio-socioeconomico.pdf')
    doc = SimpleDocTemplate(path, pagesize=letter,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    st = get_styles()
    story = []

    story.append(header_table('SOLICITUD Y ESTUDIO SOCIOECONÓMICO',
                               'Inmobiliaria DSE S.A.S.', 'ESE-001'))
    story.append(Spacer(1, 10))
    story.append(Paragraph('SOLICITUD DE ARRENDAMIENTO Y ESTUDIO SOCIOECONÓMICO', st['h_title']))
    story.append(Paragraph('Inmueble de interés: ___________________________________  '
                            'Canon aprox.: $_______________', st['h_sub']))
    story.append(gold_line())

    story.append(sec_title('1. INFORMACIÓN PERSONAL DEL SOLICITANTE', st))
    for row in [
        [('Primer nombre', 6), ('Segundo nombre', 6), ('Primer apellido', 6)],
        [('Cédula de ciudadanía N°', 7), ('Expedida en', 5), ('Fecha expedición', 6)],
        [('Fecha de nacimiento', 6), ('Lugar de nacimiento', 6), ('Estado civil', 6)],
        [('Teléfono celular', 6), ('Teléfono fijo', 6), ('Correo electrónico', 6)],
        [('Dirección actual', 11), ('Ciudad', 4), ('Estrato', 3)],
        [('Tipo de vivienda actual: ☐ Propia  ☐ Arriendo  ☐ Familiar  ☐ Otro', 18)],
        [('Número de personas que habitaran el inmueble', 6),
         ('Mascotas: ☐ Sí  ☐ No  | Tipo y raza: ____________', 12)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('2. INFORMACIÓN LABORAL E INGRESOS', st))
    for row in [
        [('Actividad: ☐ Empleado  ☐ Independiente  ☐ Pensionado  ☐ Otro', 18)],
        [('Empresa / Empleador', 10), ('Cargo', 8)],
        [('Dirección empresa', 11), ('Teléfono empresa', 7)],
        [('Fecha de ingreso', 6), ('Tipo contrato', 6), ('Ingresos mensuales (COP)', 6)],
        [('Otros ingresos (COP)', 7), ('Fuente de otros ingresos', 11)],
        [('Total ingresos familiares (COP)', 9), ('Total egresos mensuales (COP)', 9)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('3. REFERENCIAS PERSONALES', st))
    for i in range(1, 3):
        story.append(Paragraph(f'<b>Referencia {i}:</b>', st['body']))
        for row in [
            [('Nombre completo', 10), ('Teléfono', 5), ('Parentesco', 3)],
        ]:
            story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('4. REFERENCIAS COMERCIALES / BANCARIAS', st))
    for i in range(1, 3):
        story.append(Paragraph(f'<b>Referencia {i}:</b>', st['body']))
        for row in [
            [('Entidad / Empresa', 9), ('Tipo de crédito / cuenta', 5), ('Teléfono', 4)],
        ]:
            story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('5. AUTORIZACIÓN CONSULTA EN CENTRALES DE RIESGO', st))
    auth_text = (
        'Yo, __________________________, identificado(a) con C.C. N° ___________________, '
        'en pleno uso de mis facultades legales, autorizo de manera libre, voluntaria, expresa '
        'e informada a <b>Inmobiliaria DSE S.A.S.</b> para que consulte, reporte, procese y '
        'verifique toda la información que me concierne, almacenada en las bases de datos '
        'de las centrales de información crediticia y financiera (DataCrédito / Transunión), '
        'así como en el Registro Nacional de Medidas Correctivas (RNMC) y demás fuentes '
        'de información comercial. Esta autorización se extiende por el tiempo que dure '
        'la relación contractual y hasta cinco (5) años después de su terminación, '
        'de conformidad con la Ley 1266 de 2008 y demás normas aplicables.'
    )
    story.append(Paragraph(auth_text, st['clause']))
    story.append(Spacer(1, 8))
    story.append(sign_table(['FIRMA DEL SOLICITANTE', 'FIRMA CODEUDOR (si aplica)'], st))
    story.append(Spacer(1, 8))
    for row in [
        [('Fecha', 6), ('Ciudad', 6), ('Huella dactilar', 6)],
    ]:
        story.append(field_row(row, st))

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        '<b>PARA USO INTERNO DSE:</b>', st['body']))
    data_int = [
        ['Resultado estudio:', '☐ APROBADO', '☐ APROBADO CON CONDICIONES', '☐ RECHAZADO'],
        ['Analista:', '', 'Fecha:', ''],
        ['Observaciones:', '', '', ''],
    ]
    t_int = Table(data_int, colWidths=[4*cm, 4.5*cm, 4.5*cm, 4*cm])
    t_int.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#DDD5C8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#DDD5C8')),
        ('BACKGROUND', (0,0), (-1,-1), LIGHT),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_int)
    story.append(Spacer(1, 20))
    story.append(gold_line())
    story.append(footer_note(st))

    doc.build(story)
    print(f'  ✓  {path}')


# ═══════════════════════════════════════════════════════════════════
# 4. INVENTARIO Y ESTADO DEL INMUEBLE
# ═══════════════════════════════════════════════════════════════════
def inventario_inmueble():
    path = os.path.join(OUTPUT_DIR, 'inventario-estado-inmueble.pdf')
    doc = SimpleDocTemplate(path, pagesize=letter,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    st = get_styles()
    story = []

    story.append(header_table('ACTA DE INVENTARIO Y ESTADO DEL INMUEBLE',
                               'Inmobiliaria DSE S.A.S.', 'INV-001'))
    story.append(Spacer(1, 10))
    story.append(Paragraph('ACTA DE INVENTARIO Y ESTADO DEL INMUEBLE', st['h_title']))
    story.append(Paragraph('☐ Entrega al arrendatario  ☐ Restitución al arrendador  '
                            '☐ Verificación intermedia', st['h_sub']))
    story.append(gold_line())

    story.append(sec_title('1. DATOS GENERALES', st))
    for row in [
        [('Dirección del inmueble', 12), ('Apto / Local', 6)],
        [('Arrendador', 9), ('C.C. / NIT', 9)],
        [('Arrendatario', 9), ('C.C.', 9)],
        [('Fecha del acta', 6), ('Hora', 3), ('Agente DSE responsable', 9)],
    ]:
        story.append(field_row(row, st)); story.append(Spacer(1, 4))

    story.append(sec_title('2. INVENTARIO POR ESPACIO', st))
    header_inv = ['Espacio / Elemento', 'Estado\n(E/B/R/M)', 'Cantidad', 'Observaciones']
    espacios = [
        'SALA', '- Piso', '- Paredes / pintura', '- Techo', '- Ventanas / vidrios',
        'COMEDOR', '- Piso', '- Paredes', 'COCINA', '- Piso', '- Paredes',
        '- Mesones / lavaplatos', '- Alacena / gabinetes',
        'HABITACIÓN 1', '- Piso', '- Paredes', '- Closet', '- Ventana',
        'HABITACIÓN 2', '- Piso', '- Paredes', '- Closet', '- Ventana',
        'HABITACIÓN 3', '- Piso', '- Paredes',
        'BAÑO 1', '- Piso / paredes', '- Sanitario', '- Ducha / bañera', '- Lavamanos',
        'BAÑO 2', '- Piso / paredes', '- Sanitario', '- Ducha',
        'PATIO / ZONA DE ROPAS', '- Piso', '- Paredes', '- Lavadero',
        'GARAJE', '- Piso', '- Puerta / reja',
        'ZONAS COMUNES / OTROS',
    ]

    inv_data = [header_inv]
    for e in espacios:
        inv_data.append([e, '', '', ''])

    t_inv = Table(inv_data,
                  colWidths=[6.5*cm, 2.5*cm, 2*cm, 7*cm],
                  rowHeights=[0.7*cm] + [0.65*cm]*len(espacios))
    t_inv.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0), NAVY),
        ('TEXTCOLOR',    (0,0), (-1,0), WHITE),
        ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',     (0,0), (-1,-1), 7.5),
        ('ALIGN',        (1,0), (2,-1), 'CENTER'),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('BOX',          (0,0), (-1,-1), 0.8, colors.HexColor('#DDD5C8')),
        ('INNERGRID',    (0,0), (-1,-1), 0.4, colors.HexColor('#DDD5C8')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [WHITE, LIGHT]),
        ('LEFTPADDING',  (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING',   (0,0), (-1,-1), 3),
        ('BOTTOMPADDING',(0,0), (-1,-1), 3),
        # Filas de sección principal (SALA, COCINA, etc.)
        *[('FONTNAME', (0, i+1), (0, i+1), 'Helvetica-Bold')
          for i, e in enumerate(espacios) if not e.startswith('-')],
        *[('BACKGROUND', (0, i+1), (-1, i+1), colors.HexColor('#EDE8E1'))
          for i, e in enumerate(espacios) if not e.startswith('-')],
    ]))
    story.append(t_inv)

    story.append(Spacer(1, 4))
    story.append(Paragraph('<b>Estado:</b> E = Excelente · B = Bueno · R = Regular · M = Malo',
                           st['note']))

    story.append(sec_title('3. LLAVES ENTREGADAS', st))
    llaves_data = [
        ['Tipo de llave', 'Cantidad entregada', 'Cantidad devuelta', 'Observaciones'],
        ['Puerta principal', '', '', ''],
        ['Puerta trasera / servicio', '', '', ''],
        ['Garaje / parqueadero', '', '', ''],
        ['Habitaciones', '', '', ''],
        ['Otras', '', '', ''],
    ]
    t_ll = Table(llaves_data, colWidths=[5*cm, 4*cm, 4*cm, 5*cm], rowHeights=0.7*cm)
    t_ll.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0), NAVY),
        ('TEXTCOLOR',    (0,0), (-1,0), WHITE),
        ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',     (0,0), (-1,-1), 8),
        ('ALIGN',        (1,0), (2,-1), 'CENTER'),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('BOX',          (0,0), (-1,-1), 0.8, colors.HexColor('#DDD5C8')),
        ('INNERGRID',    (0,0), (-1,-1), 0.4, colors.HexColor('#DDD5C8')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [WHITE, LIGHT]),
        ('LEFTPADDING',  (0,0), (-1,-1), 5),
    ]))
    story.append(t_ll)

    story.append(sec_title('4. SERVICIOS PÚBLICOS AL MOMENTO DE ENTREGA', st))
    servicios_data = [
        ['Servicio', 'Empresa', 'N° Cuenta / Medidor', 'Lectura inicial', 'Estado'],
        ['Energía eléctrica', '', '', '', '☐ Al día'],
        ['Acueducto / Alcantarillado', '', '', '', '☐ Al día'],
        ['Gas natural', '', '', '', '☐ Al día'],
        ['Internet / TV Cable', '', '', '', '☐ Al día'],
        ['Administración P.H.', '', '', '', '☐ Al día'],
    ]
    t_sv = Table(servicios_data, colWidths=[4.5*cm, 4*cm, 4*cm, 2.5*cm, 3*cm], rowHeights=0.7*cm)
    t_sv.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0), NAVY),
        ('TEXTCOLOR',    (0,0), (-1,0), WHITE),
        ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',     (0,0), (-1,-1), 7.5),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('BOX',          (0,0), (-1,-1), 0.8, colors.HexColor('#DDD5C8')),
        ('INNERGRID',    (0,0), (-1,-1), 0.4, colors.HexColor('#DDD5C8')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [WHITE, LIGHT]),
        ('LEFTPADDING',  (0,0), (-1,-1), 5),
    ]))
    story.append(t_sv)

    story.append(sec_title('5. OBSERVACIONES GENERALES', st))
    for _ in range(4):
        story.append(HRFlowable(width='100%', thickness=0.5,
                                color=colors.HexColor('#DDD5C8'), spaceAfter=14))

    story.append(Spacer(1, 8))
    story.append(gold_line())
    story.append(Paragraph('Las partes declaran haber revisado el inmueble y estar conformes '
                            'con el inventario y el estado aquí consignados.', st['body']))
    story.append(Spacer(1, 4))
    story.append(sign_table(['ARRENDADOR', 'ARRENDATARIO'], st))
    story.append(Spacer(1, 12))
    story.append(sign_table(['AGENTE DSE INMOBILIARIA', 'TESTIGO'], st))
    story.append(Spacer(1, 20))
    story.append(gold_line())
    story.append(footer_note(st))

    doc.build(story)
    print(f'  ✓  {path}')


# ═══════════════════════════════════════════════════════════════════
if __name__ == '__main__':
    print('\nGenerando formularios de arrendamiento DSE...\n')
    contrato_residencial()
    contrato_comercial()
    solicitud_estudio()
    inventario_inmueble()
    print('\n¡Listo! 4 formularios generados en /forms/')
