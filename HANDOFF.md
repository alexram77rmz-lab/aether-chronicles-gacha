# HANDOFF — Duck & Pixel Survivor (para continuar con otro modelo)

Juego móvil 9:16 en **HTML5 Canvas 2D puro, sin build ni dependencias** (solo fuentes de Google).
Probar: `python -m http.server 8090` dentro de esta carpeta → http://localhost:8090
Publicado: https://alexram77rmz-lab.github.io/aether-chronicles-gacha/ (GitHub Pages, rama `main`; basta `git push`).

## Archivos
| Archivo | Qué contiene |
|---|---|
| `index.html` | Juego base: CSS/HUD, catálogos (HEROES, EVENT_WEAPONS, SSS_PETS), bucle `gameLoop`, combate, oleadas día/noche, jefe oleada 5, daño al jugador, derrota/victoria/ciclos, guardado `duckPixelSurvivor_save_v2`, SFX WebAudio. |
| `features.js` | **Meta-juego** (se carga al final): Laboratorio + Gran Laboratorio, Festival Astral (contador, camino de hitos, invocación con garantía), Skins, Clan simulado, Habilidades activas, Misiones diarias + login, Tutorial. Guardado `duckPixelSurvivor_features_v1`. |
| `cpp_engine/` | Simulación C++20 de referencia (no se usa en el juego web). |
| `../AetherIdleRPG_Unity/` | Andamiaje Unity C# (opcional). |

## Cómo se engancha `features.js` (importante)
No modifica el flujo del juego base: **envuelve funciones globales** (`window.fn = wrapper(original)`):
`playerMaxHp`, `rollWeaponDamage`, `resetRun`, `refreshTopHUD`, `isGamePaused`, `damagePlayer`,
`handleEnemyDeath`, `finishWave`, `endRun`, `drawDetailedWeaponMesh`, `populateDrawers`, `openTab`.
Los paneles nuevos son `div.modal-drawer#drawer-<id>` creados por JS; se abren con `openTab('<id>')`
(`event`, `lab`, `skills`, `skins`, `clan`, `missions`). Cada uno tiene un renderer `R.<id>()`.
`index.html` solo tiene 3 ganchos: `window.skinned(hero)` en `drawDetailedHero`, el filtro `!x.exclusive`
en el pool de `pullGacha`, y la etiqueta `<script src="features.js">`.

Objetos con `exclusive:true, owned:false` (Martillo Trueno SSS, Excálibur SSS+, Gato Nebulosa SSS,
Wyrm Galáctico SSS+) solo salen del Festival Astral. Estado de depuración: `window.__FEATURES`.

## Reglas para no romper nada
1. Tras editar: `node --check features.js` y extraer el `<script>` de index.html para `node --check`.
2. Probar en headless: `msedge --headless --dump-dom --virtual-time-budget=...` con un script de prueba (ver historial).
3. Al sumar un arma/mascota: añadir al catálogo + rama en `drawDetailedWeaponMesh` (o wrapper) + estilo de bala en el bucle de balas.
4. Balance actual: bot pasivo muere en el jefe (oleada 5); bot activo con torretas gana. Revisar tras tocar daños.

## Pendiente / ideas (prioridad sugerida)
1. **Arte**: sustituir dibujos de canvas por spritesheets/atlas (PNG) para héroes, mascotas, armas y 3 mapas con temas.
2. **Más contenido de combate**: 2–3 mapas (bosque, desierto, ciudad), 4 jefes con patrones propios, proyectiles únicos para las armas SSS (cadena de rayos, espada solar en arco).
3. **Economía y retención**: pase de batalla, tienda con ofertas por tiempo, recompensas offline (idle), cofres con rarezas, fusión de gemas en equipo.
4. **Clanes reales**: backend (Firebase/Supabase) para clanes, chat, ranking global y jefe compartido; hoy es simulación local con NPC.
5. **Publicación móvil**: empaquetar con Capacitor (Android/iOS), AdMob (anuncios recompensados), IAP real (tienda), analítica, icono/splash, PWA offline.
6. **Pulido**: música, más SFX, vibración, ajustes (volumen, calidad, idioma ES/EN), accesibilidad.
7. Meta de lanzamiento (20 000 descargas): ASO, trailer de 15 s, soft-launch en 2–3 países, ciclo de eventos semanales.

## PROMPT LISTO PARA PEGAR EN GEMINI ARGON
> Eres el desarrollador principal de un juego móvil HTML5 en la carpeta del workspace (`aether-chronicles-gacha`).
> Lee primero `HANDOFF.md`, luego `features.js` y `index.html`. No reescribas desde cero: extiende lo existente
> usando el patrón de wrappers de `features.js`. Tareas, en orden: (1) añade 3 mapas temáticos y selector de mapa;
> (2) añade 4 jefes con patrones propios y proyectiles únicos para las armas SSS; (3) implementa pase de batalla,
> tienda con ofertas por tiempo y recompensas offline; (4) añade música y ajustes; (5) empaqueta con Capacitor.
> Tras cada tarea ejecuta `node --check`, prueba en Edge headless, mantén el balance (bot pasivo pierde en la oleada 5,
> bot activo gana) y haz `git commit` + `git push origin main`.

## ACTUALIZACIÓN — `features2.js` (se carga después de `features.js`)
Usa la API pública `window.FXI` (exportada por features.js) y envuelve más funciones globales
(`drawDetailedHero`, `spawnEnemy`, `contactDamage`, `resetRun`, `startNextWave`, `finishWave`,
`handleEnemyDeath`, `endRun`, `refreshWaveTimeline`, `populateDrawers`, `pullGacha`, `openTab`).
Estado extra en `F.x2` (se guarda junto al resto en `duckPixelSurvivor_features_v1`).

| Sistema | Dónde |
|---|---|
| Héroes gato (Siamés, Calicó): `species:'cat'`, dibujo propio `drawCatHero`, skins de gato, pasivas | features2.js «GATOS» |
| Elección de héroe tras el tutorial (`FX2.pickHero`) | «MENÚ DE INICIO / FLUJO» |
| Nivel de estrellas (1-5) en armas/mascotas con fragmentos (+20% daño base) y en skins con gemas (+3% daño/estrella) | «ESTRELLAS» |
| Niveles (`STAGES`): 1 Campamento, 2 Bosque Neón (más difícil, tema morado, jefe Treant), 3 bloqueado | «NIVELES» |
| Menú de inicio (`showTitle`), botón ☰ MENÚ, selector de niveles para saltar del 1 al 2 | «MENÚ DE INICIO» |
| Subida de nivel «caracterizada»: draft gratis al terminar cada oleada, XP por bolita crece con la oleada, `STAGE_XP_GROWTH` por nivel | wrappers de `finishWave`/`handleEnemyDeath` |
| AFK por progreso (máx. 8 h), ritmo según oleadas/niveles superados | «AFK» |
| Tienda: paquetes 0,99 / 4,99 / 9,99 / 19,99 / 49,99 / **99,99 €** + pase mensual + regalo diario. **Compras SIMULADAS (demo)** | «TIENDA» (`PACKS`) |
| Torretas con habilidad (NV.3, NV.5 más rápida) + evolución con 🔩 Núcleos + Torreta Tesla | «TORRETAS CON HABILIDAD» |
| Eventos de Héroe (Cacería Felina) y Base (Fortaleza Tesla) junto al Astral (pestañas) | «EVENTOS HÉROE Y BASE» |

Ganchos añadidos en `index.html`: `window.THEME`/`window.EC` (colores por nivel), `window.STAGE_XP_GROWTH`,
y la etiqueta `<script src="features2.js">`.

### Pendiente específico de esta ronda
1. **Cobros reales**: `FX2.buyPack` solo simula; conectar Google Play Billing / App Store (Capacitor + RevenueCat) y validar recibos en servidor.
2. Nivel 3 «Ciudad Zombi Neón» está bloqueado (placeholder): crear tema, enemigos y jefe.
3. Nivel 2 se desbloquea desde el inicio por petición del usuario; si se quiere progresión, exigir ganar el nivel 1.
4. Más armas SSS con proyectil propio, más héroes (con estrellas), más skins de torreta (el evento Base ya da 🔩 Núcleos).
5. AFK/eventos usan la hora del dispositivo; para producción validar en servidor.
