# Tocadiscos para TIDAL (plugin de Luna)

Convierte la carátula de la vista Now Playing en un tocadiscos: chasis negro, plato con aro estroboscópico,
brazo con contrapeso que baja al dar play y avanza según el progreso de la canción, LED, disco que gira
con arranque e inercia al frenar, surcos y reflejos.

## Instalar

En TIDAL con Luna: Luna Settings > Plugin Store > "Install from URL" y pega:

    https://github.com/TU_USUARIO/tocadiscos-tidal-luna/releases/download/latest/store.json

## Ajustes

Al inicio de `plugins/tocadiscos-luna/src/index.ts`: `VUELTA` (1.8 = 33 rpm, 1.333 = 45 rpm), `TAU_ARRANQUE`,
`TAU_FRENADO`, `BRAZO_INI`, `BRAZO_FIN`. El aspecto está en `plugins/tocadiscos-luna/src/styles.css`.

## Desarrollo local

    pnpm install
    pnpm run watch
