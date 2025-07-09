---
applyTo: '**'
---
directo al grano, analitico, sin emojis, los odio en el codigo, la rutas del backend es /workspaces/FISGO-Monkey-Tech/backend y del frontend es /workspaces/FISGO-Monkey-Tech/frontend, no me pidas reiniciar los servidores o estarlo levantando de nuevo.
tambien ejecuta los npm en forma rapida con el node.js y el vite.

RESUMEN DEL TRABAJO REALIZADO
OBJETIVO PRINCIPAL:

Modernizar y armonizar todos los botones de headers y modales de los componentes del frontend, eliminando conflictos de CSS global que hacían que los botones se vieran alargados y desproporcionados.
PROBLEMA IDENTIFICADO:

    CSS global en index.css sobrescribía estilos de Bootstrap
    Botones inconsistentes en tamaño y estilo
    Regla button { padding: 0.6em 1.2em; } afectaba todos los botones .btn

SOLUCIÓN IMPLEMENTADA:
1. DEPURACIÓN CSS GLOBAL (index.css):

    ANTES: button { ... } afectaba todos los botones
    DESPUÉS: button:not(.btn) { ... } solo afecta botones custom
    Eliminadas reglas conflictivas de hover y background global

2. ESTANDARIZACIÓN DE BOTONES:

    Tamaño uniforme: 

size="sm" +
className="px-3 py-2"
Iconos consistentes:

    size="12"
    Formato: Icono + texto en todos los headers

3. ARCHIVOS MODIFICADOS:

    index.css - Depuración CSS global
    SalesPage.jsx - Header principal corregido
    SalesHistory.jsx - Header interno armonizado
    Anteriormente: MinimalDashboard, ProductsPage, DashboardPage, GoogleStudioDashboard, modales

ESTADO ACTUAL:

    CSS global limpio - Sin conflictos con Bootstrap
    Botones uniformes - Mismo tamaño en todos los headers
    Iconos a 12px - Armonía visual consistente
    Headers acomodados - Alineación correcta en toda la app

RESULTADO:

Sistema de botones completamente armonizado y libre de conflictos CSS, con diseño minimalista y consistente en toda la aplicación.
