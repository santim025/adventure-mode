# Puntos de Cortejo · Santiago & Ella

SPA minimalista en **React + Vite + Tailwind CSS** para llevar un sistema de
puntos de cortejo entre dos personas. Paleta **Pastel Dark** (fondos oscuros
con acentos rosa y violeta suave), mobile-first y con persistencia en
`localStorage`.

## Características

- **Dos columnas claras**: Santiago (violeta) y Ella (rosa), cada una con su
  puntaje en grande y sus propios botones de acción.
- **Acciones**: Buenos días/noches (+2), Meme/Canción (+5), Tema de charla
  (+10), Propuesta de cita (+25), Cita realizada (+50).
- **Catálogo de premios** con tarjetas elegantes y costos 100, 200, 400, 600,
  800 y 1000 (Glamping). Cada tarjeta tiene barra de progreso basada en el
  mejor saldo.
- **Modal de canje** que pregunta quién está canjeando, muestra el saldo de
  cada uno y deshabilita a quien no pueda pagarlo.
- **Historial** global con últimos 80 movimientos (suma o canje).
- **Persistencia** en `localStorage` (puntos, historial).
- **Mobile-first**: columnas apiladas en pantallas pequeñas, botones con área
  mínima de toque de 44-52 px, tipografía responsive.
- **Animaciones suaves**: pop del contador, delta flotante `+5` / `-100`,
  fadeIn en paneles, scaleIn en modal.

## Correr

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  App.jsx                    # layout + lógica principal
  hooks/useLocalStorage.js   # persistencia
  data/actions.js            # 5 acciones
  data/prizes.js             # 6 premios (100–1000)
  components/
    UserColumn.jsx           # columna por usuario con puntaje + acciones
    PrizesCatalog.jsx        # grid de premios
    RedeemModal.jsx          # confirmación de canje con selección de usuario
    HistoryPanel.jsx         # historial combinado
```

Edita `src/data/actions.js` o `src/data/prizes.js` para ajustar puntos o
premios sin tocar la UI.
