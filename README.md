# 🚆 Cercanías Madrid C-4 — Tiempos en Directo

Aplicación web personal desarrollada en **React** y **Tailwind CSS** para consultar en tiempo real las salidas y tiempos de espera de la **Línea C-4 de Cercanías Madrid**, optimizada específicamente para el trayecto diario entre **Las Margaritas (Universidad)** y las estaciones de trabajo en **Madrid - Sol** y **Madrid - Nuevos Ministerios**.

Desplegada en producción en **GitHub Pages**:
👉 **[https://aandreasiles.github.io/cercanias-madrid-c4/](https://aandreasiles.github.io/cercanias-madrid-c4/)**

---

## 🎯 Objetivo y Funcionalidades

- **De un vistazo en 1 segundo**:
  - Cuenta atrás gigante en minutos y segundos hacia el **próximo tren**.
  - Destino (`Alcobendas-S.S. Reyes`, `Colmenar Viejo` o `Parla`), ramal (`C-4a` o `C-4b`) y número de andén/vía (`VÍA 1` o `VÍA 2`).
  - Estado de puntualidad en tiempo real (**A tiempo** o **+X min retraso**).
  - Estimación de hora de llegada al destino (Sol o Nuevos Ministerios: ~20-25 min de trayecto).
- **Siguientes salidas**:
  - Lista completa de los siguientes 8 trenes ordenados cronológicamente con minutos restantes, horas de salida y andenes.
- **Selector de estaciones preferidas**:
  - 🏠 **Las Margaritas** (Casa)
  - 💼 **Sol** (Trabajo)
  - 💼 **Nuevos Ministerios** (Trabajo)
- **Filtro inteligente de dirección**:
  - *Hacia Madrid / Trabajo* (sentido norte: Chamartín, Alcobendas, Colmenar).
  - *Hacia Parla / Casa* (sentido sur: Getafe, Parla).
  - Botón de alternancia rápida con 1 clic: *"Voy al trabajo"* ↔ *"Vuelvo a casa"*.
- **Esquema de la Línea C-4**:
  - Visualización interactiva de todas las estaciones de la línea C-4 con los puntos clave destacados y cálculo de tiempos.
- **Avisos de Renfe en vivo**:
  - Banner informativo con incidencias, obras o estado de ascensores.

---

## 🛰️ Integración con la API de Renfe

La aplicación consume los endpoints oficiales de Renfe Cercanías:

1. **Panel de Salidas por Estación**:
   - `https://tiempo-real.renfe.com/renfe-json-cutter/write/salidas/estacion/<código>.json`
   - Códigos integrados:
     - Las Margaritas: `37010`
     - Nuevos Ministerios: `18002`
     - Sol: `18101`
2. **Avisos y Alertas**:
   - `https://tiempo-real.renfe.com/renfe-visor/alerts.json`
3. **Flota y Posiciones de convoyes**:
   - `https://tiempo-real.renfe.com/renfe-visor/flota.json`

### Resiliencia y estrategia de conexión (CORS):
Debido a que los servidores de Renfe no envían cabeceras CORS permisivas a los navegadores web estándar, la aplicación implementa una arquitectura multicapa:
1. **Petición directa**: Si el navegador cuenta con una extensión CORS o se ejecuta en entorno permisivo.
2. **Proxy personalizado opcional**: Configurable en los ajustes de la web (por ejemplo, un Cloudflare Worker gratuito).
3. **Instantánea reciente en GitHub Pages**: Un script en el repositorio mantiene datos frescos procedentes de la API oficial.
4. **Motor de Horarios Oficiales C-4**: Si falla la red, simula fielmente las frecuencias reales de Renfe C-4 (cada 6-8 min en punta, 12-15 min en valle).

---

## 💻 Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/aandreasiles/cercanias-madrid-c4.git
cd cercanias-madrid-c4

# Instalar dependencias
npm install

# Descargar las últimas salidas reales de Renfe
npm run fetch-live-data

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🚀 Despliegue en GitHub Pages

El proyecto incluye un flujo de trabajo automatizado con **GitHub Actions** (`.github/workflows/deploy.yml`) que:
- Se ejecuta automáticamente ante cada `push` a la rama `main`.
- Se puede disparar manualmente mediante `workflow_dispatch`.
- Se ejecuta periódicamente en horas punta para refrescar datos.
- Compila la app con Vite y la publica en GitHub Pages.

---

Desarrollado con ❤️ para los usuarios de la Línea C-4 de Cercanías Madrid.
