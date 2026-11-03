/* ============================================================================
   features2.js — Gatos jugables, nivel de estrellas, niveles + menú de inicio,
   AFK, tienda (compras SIMULADAS), torretas con habilidad, eventos de Héroe y Base.
   Se carga DESPUÉS de features.js y usa su API pública `window.FXI`.
   ============================================================================ */
(function () {
  'use strict';

  const X = window.FXI;
  const F = X.F, $ = X.$, fmt = X.fmt;
  const DAY = 86400000;
  const frame = document.getElementById('phone-frame');
  const toast = (m) => showToast(m);

  F.x2 = Object.assign({
    starterChosen: false, stage: 1, best: {}, afk: { last: Date.now() }, evo: {}, tesla: false, cores: 0,
    skinStars: {}, ev: {}, shop: { bought: {}, passUntil: 0, passClaim: '', freeClaim: '' }, spent: 0
  }, F.x2 || {});
  F.x2.shop = Object.assign({ bought: {}, passUntil: 0, passClaim: '', freeClaim: '' }, F.x2.shop);
  const todayKey = () => new Date().toDateString();

  // =================================================================== GATOS
  HEROES.push(
    { id: 'siames', name: 'Mishi Siamés (Gato)', badge: 'FELINO S+', species: 'cat', fur: '#f3e3c3', point: '#4a3426', patch: null, eye: '#38bdf8',
      featherColor: '#f3e3c3', helmetColor: '#0ea5e9', capeColor: '#6366f1', atkMult: 1.18,
      desc: 'Ágil y letal: +12% daño y +10% de prob. de crítico. Antifaz oscuro y ojos azules.' },
    { id: 'calico', name: 'Mochi Calicó (Gato)', badge: 'FELINO S+', species: 'cat', fur: '#fafafa', point: '#1f2937', patch: '#f59e0b', eye: '#4ade80',
      featherColor: '#fafafa', helmetColor: '#16a34a', capeColor: '#f43f5e', atkMult: 1.12,
      desc: 'Gato de la suerte: +12% de botín (billetes extra) y +10% de vida. Pelaje tricolor.' }
  );
  X.SKINS.push(
    { id: 'siames_ink', hero: 'siames', name: 'Mishi Tinta', price: 500, colors: { fur: '#d9d2c3', point: '#0f172a', eye: '#60a5fa', helmetColor: '#0f172a', capeColor: '#334155' } },
    { id: 'siames_royal', hero: 'siames', name: 'Mishi Real (Evento)', price: 0, spark: '#fde047', colors: { fur: '#fff7ed', point: '#7c2d12', eye: '#facc15', helmetColor: '#a16207', capeColor: '#7c3aed' } },
    { id: 'calico_gold', hero: 'calico', name: 'Mochi Dorado', price: 600, spark: '#fde047', colors: { fur: '#fffbeb', patch: '#facc15', point: '#78350f', eye: '#f59e0b', helmetColor: '#b45309', capeColor: '#f59e0b' } },
    { id: 'calico_galaxy', hero: 'calico', name: 'Mochi Galaxia (Evento)', price: 0, spark: '#e879f9', colors: { fur: '#e0e7ff', patch: '#a855f7', point: '#1e1b4b', eye: '#22d3ee', helmetColor: '#312e81', capeColor: '#7c3aed' } }
  );

  function drawCatHero(g, x, y, scale, hero, weapon, cashCount, aimAngle, walkTime, recoil, isOverdrive) {
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);
    g.lineCap = 'round';
    const hop = Math.abs(Math.sin(walkTime * 9)) * 4;
    const point = hero.point || hero.fur;
    const ell = (ex, ey, rx, ry, rot) => { g.beginPath(); g.ellipse(ex, ey, rx, ry, rot || 0, 0, Math.PI * 2); };

    g.fillStyle = 'rgba(0,0,0,0.45)'; ell(0, 22, 20, 8); g.fill();
    if (isOverdrive) { g.strokeStyle = '#fde047'; g.lineWidth = 3; ell(0, 20, 28 + Math.sin(walkTime * 15) * 3, 12); g.stroke(); }

    const bills = Math.min(14, Math.floor(cashCount / 15));
    for (let i = 0; i < bills; i++) {
      const by = -4 - hop - i * 4.2;
      g.fillStyle = '#052e16'; g.fillRect(-24, by - 1, 18, 7);
      g.fillStyle = '#22c55e'; g.fillRect(-23, by, 16, 5);
      g.fillStyle = '#dcfce7'; g.fillRect(-17, by, 4, 5);
    }

    // cola ondulante
    const sw = Math.sin(walkTime * 7) * 5;
    g.strokeStyle = '#000'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(-12, 8 - hop); g.quadraticCurveTo(-32, -2 + sw, -24, -24 + sw); g.stroke();
    g.strokeStyle = hero.patch || point; g.lineWidth = 5.5;
    g.beginPath(); g.moveTo(-12, 8 - hop); g.quadraticCurveTo(-32, -2 + sw, -24, -24 + sw); g.stroke();
    g.strokeStyle = '#000'; g.lineWidth = 2.4;

    // capa
    const cw = Math.sin(walkTime * 8) * 4;
    g.fillStyle = hero.capeColor;
    g.beginPath(); g.moveTo(-9, -8 - hop); g.quadraticCurveTo(-22 + cw, 6 - hop, -17 + cw, 18 - hop); g.lineTo(-4, 15 - hop); g.closePath(); g.fill(); g.stroke();

    // patitas
    const lf = 17 + Math.sin(walkTime * 10) * 4, rf = 17 - Math.sin(walkTime * 10) * 4;
    g.fillStyle = point;
    g.beginPath(); g.roundRect(-12, lf, 9, 6, 3); g.roundRect(3, rf, 9, 6, 3); g.fill(); g.stroke();

    // cuerpo + chaleco
    g.fillStyle = hero.fur; ell(0, 4 - hop, 15, 15); g.fill(); g.stroke();
    if (hero.patch) { g.fillStyle = hero.patch; ell(-6, 9 - hop, 6, 6, 0.4); g.fill(); }
    g.fillStyle = '#1e293b'; g.beginPath(); g.roundRect(-13, -3 - hop, 26, 15, 6); g.fill(); g.stroke();
    g.fillStyle = '#fbbf24'; g.fillRect(-12, 8 - hop, 24, 4); g.strokeRect(-12, 8 - hop, 24, 4);

    // orejas
    const hy = -14 - hop;
    [-1, 1].forEach((s) => {
      g.fillStyle = hero.patch ? (s < 0 ? hero.patch : point) : point;
      g.beginPath(); g.moveTo(s * 4, hy - 12); g.lineTo(s * 14, hy - 28); g.lineTo(s * 16, hy - 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#f9a8d4';
      g.beginPath(); g.moveTo(s * 7, hy - 12); g.lineTo(s * 13, hy - 22); g.lineTo(s * 13, hy - 9); g.closePath(); g.fill();
    });

    // cabeza
    g.fillStyle = hero.fur; g.beginPath(); g.arc(0, hy, 15.5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.arc(0, hy, 15.2, 0, Math.PI * 2); g.clip();
    if (hero.patch) {
      g.fillStyle = hero.patch; ell(-9, hy - 6, 8, 9, 0.3); g.fill();
      g.fillStyle = point; ell(10, hy - 8, 6, 7, -0.3); g.fill();
    } else {
      g.globalAlpha = 0.85; g.fillStyle = point; ell(0, hy + 4, 9, 8); g.fill(); g.globalAlpha = 1;
    }
    g.restore();

    // ojos
    [-5.5, 5.5].forEach((ex) => {
      g.fillStyle = '#fff'; ell(ex, hy - 1, 3.9, 4.5); g.fill();
      g.fillStyle = isOverdrive ? '#00f2fe' : hero.eye; ell(ex, hy - 1, 3, 3.9); g.fill();
      g.fillStyle = '#000'; ell(ex, hy - 1, 1.1, 3.6); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 1, hy - 3, 1, 0, Math.PI * 2); g.fill();
    });
    // nariz, boca, bigotes
    g.fillStyle = '#f472b6'; g.beginPath(); g.moveTo(-2, hy + 4); g.lineTo(2, hy + 4); g.lineTo(0, hy + 6.5); g.closePath(); g.fill();
    g.strokeStyle = '#000'; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(0, hy + 6.5); g.lineTo(0, hy + 8); g.moveTo(-4, hy + 9.5); g.quadraticCurveTo(-2, hy + 8, 0, hy + 8); g.quadraticCurveTo(2, hy + 8, 4, hy + 9.5); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.75)'; g.lineWidth = 1;
    [-1, 1].forEach((s) => {
      g.beginPath(); g.moveTo(s * 9, hy + 5); g.lineTo(s * 21, hy + 2); g.moveTo(s * 9, hy + 7.5); g.lineTo(s * 21, hy + 8.5); g.stroke();
    });
    // cinta táctica con gema
    g.strokeStyle = '#000'; g.lineWidth = 2.2;
    g.fillStyle = hero.helmetColor; g.fillRect(-14.5, hy - 12, 29, 5); g.strokeRect(-14.5, hy - 12, 29, 5);
    g.fillStyle = '#38bdf8'; g.fillRect(-3, hy - 12, 6, 5);

    // arma
    g.save();
    g.translate(4, 3 - hop);
    g.rotate(aimAngle);
    g.translate(-recoil, 0);
    drawDetailedWeaponMesh(g, weapon);
    g.restore();
    g.restore();
  }
  const _dh = window.drawDetailedHero;
  window.drawDetailedHero = function (g, x, y, scale, hero, ...rest) {
    if (window.skinned) hero = window.skinned(hero);
    if (hero && hero.species === 'cat') return drawCatHero(g, x, y, scale, hero, ...rest);
    return _dh(g, x, y, scale, hero, ...rest);
  };

  // pasivas de héroe + estrellas de skin (se suman a mods() de features.js)
  window.extraMods = function (m) {
    const hid = state.heroData.id;
    if (hid === 'calico') { m.loot += 0.12; m.hp += 0.10; }
    if (hid === 'siames') { m.dmg += 0.12; }
    const sk = X.SKINS.find((s) => s.id === F.skins.equipped[hid]);
    if (sk) m.dmg += 0.03 * (F.x2.skinStars[sk.id] || 1);
  };
  const _rw = window.rollWeaponDamage;
  window.rollWeaponDamage = (w, o) => {
    const r = _rw(w, o);
    if (state.heroData.id === 'siames' && !r.crit && Math.random() < 0.10) { r.crit = true; r.dmg *= 2.1; }
    return r;
  };

  // ============================================================ ESTRELLAS
  const STAR_COST = [10, 20, 40, 80];
  const allItems = () => [...EVENT_WEAPONS, ...SSS_PETS];
  const starOf = (it) => it.star || 1;
  function applyStars() {
    allItems().forEach((it) => {
      if (F.stars[it.id]) it.star = F.stars[it.id];
      if (it._dm === undefined) it._dm = it.dmgMult;
      it.dmgMult = it._dm * (1 + 0.2 * (starOf(it) - 1));
    });
  }
  const FX2 = window.FX2 = {};
  FX2.starUp = function (kind, id) {
    const it = X.findItem(kind, id);
    if (!it || it.owned === false) return;
    const s = starOf(it);
    if (s >= 5) return;
    const need = STAR_COST[s - 1], have = F.shards[id] || 0;
    if (have < need) return toast(`⭐ Faltan fragmentos (${have}/${need}). Consíguelos en la ruleta, el AFK y los eventos.`);
    F.shards[id] = have - need;
    it.star = F.stars[id] = s + 1;
    applyStars();
    toast(`⭐ ¡${it.name} subió a ${s + 1} estrellas! (+20% daño base)`);
    sfx('level'); X.save(); populateDrawers();
  };
  function decorateStars() {
    const mark = (gridId, arr, kind) => {
      document.querySelectorAll('#' + gridId + ' .item-card').forEach((c, i) => {
        const it = arr[i];
        if (!it || it.owned === false) return;
        const s = starOf(it);
        const st = c.querySelector('.item-stars');
        if (st) st.textContent = '★'.repeat(s) + '☆'.repeat(5 - s);
        const b = document.createElement('button');
        b.className = 'btn-action upgrade';
        b.style.marginTop = '5px';
        b.textContent = s >= 5 ? '⭐ ESTRELLAS MAX' : `⭐ SUBIR ESTRELLA (${F.shards[it.id] || 0}/${STAR_COST[s - 1]} frag.)`;
        b.disabled = s >= 5;
        b.onclick = () => FX2.starUp(kind, it.id);
        c.appendChild(b);
      });
    };
    mark('weapons-grid', EVENT_WEAPONS, 'wpn');
    mark('pets-grid', SSS_PETS, 'pet');
  }
  const _pd = window.populateDrawers;
  window.populateDrawers = function () { _pd(); decorateStars(); };

  // estrellas de skin (cuestan gemas)
  const skStar = (id) => F.x2.skinStars[id] || 1;
  window.skinStarHtml = function (s, owned) {
    if (!owned) return '<div class="item-stars">☆☆☆☆☆</div>';
    const n = skStar(s.id);
    return `<div class="item-stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)} <small>(+${n * 3}% daño)</small></div>` +
      (n < 5 ? `<button class="btn-action upgrade" style="margin-bottom:5px;font-size:.66rem" ${F.skins.owned[s.id] && state.gems >= 200 * n ? '' : 'disabled'} onclick="FX2.skinStar('${s.id}')">⭐ 💎${200 * n}</button>` : '');
  };
  FX2.skinStar = function (id) {
    const n = skStar(id), c = 200 * n;
    if (n >= 5 || !F.skins.owned[id] || state.gems < c) return;
    state.gems -= c; F.x2.skinStars[id] = n + 1;
    refreshTopHUD(); sfx('level'); X.save(); X.R.skins();
    toast(`⭐ Skin a ${n + 1} estrellas: +${(n + 1) * 3}% de daño`);
  };

  // ruleta normal: ahora da fragmentos
  window.pullGacha = function (count) {
    if (count === 1 && state.tickets < 20) return toast('¡Necesitas 20 🎟️ Fichas de Evento!');
    if (count === 10 && state.gems < 300) return toast('¡Necesitas 300 💎 Gemas!');
    if (count === 1) state.tickets -= 20; else state.gems -= 300;
    const grid = $('gacha-drops-grid');
    grid.innerHTML = '';
    const pool = allItems().filter((x) => !x.exclusive);
    for (let i = 0; i < count; i++) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      r.level++;
      F.shards[r.id] = (F.shards[r.id] || 0) + 4;
      const box = document.createElement('div');
      box.style.cssText = 'background:#252b48;border:2px solid #fbbf24;border-radius:10px;padding:6px;text-align:center;';
      box.innerHTML = `<div style="font-size:1.35rem">${r.icon}</div><div style="font-size:.58rem;font-weight:800;color:#fde047">+1 NV<br>+4 ⭐frag.</div>`;
      grid.appendChild(box);
    }
    refreshTopHUD();
    toast(`🎰 ¡${count} mejoras y fragmentos de estrella!`);
  };

  // ================================================================ NIVELES
  const STAGES = [
    { id: 1, icon: '🏕️', name: 'Campamento Pixel', hp: 1, dmg: 1, speed: 1, count: 1, reward: 1, xp: 1.2, rec: 0,
      boss: '👹 REY DEMONIO ABISAL', theme: null, ec: null,
      desc: 'El campamento clásico. Ideal para empezar y farmear.' },
    { id: 2, icon: '🌲', name: 'Bosque Neón Encantado', hp: 1.7, dmg: 1.35, speed: 1.1, count: 1.25, reward: 1.6, xp: 1.16, rec: 18000,
      boss: '🌳 TREANT CORRUPTO',
      theme: { day: ['#3b2a5c', '#47336e', '#c084fc'], night: ['#1a1230', '#21173c', '#7c3aed'], fence: '#22d3ee' },
      ec: { head: '#67e8f9', body: '#0e7490', boss: '#16a34a' },
      desc: 'Más enemigos, más rápidos y más fuertes. Mejores recompensas.' },
    { id: 3, icon: '🌆', name: 'Ciudad Zombi Neón', hp: 2.6, dmg: 1.8, speed: 1.2, count: 1.5, reward: 2.4, xp: 1.14, rec: 40000, locked: true,
      boss: '🤖 MECHA-ZOMBI', theme: null, ec: null, desc: 'Próximamente en la siguiente actualización.' }
  ];
  const curStage = () => STAGES.find((s) => s.id === F.x2.stage) || STAGES[0];
  let runStage = 0;

  function applyTheme() {
    const st = curStage();
    window.THEME = st.theme; window.EC = st.ec; window.STAGE_XP_GROWTH = st.xp;
  }
  function bossLabel() {
    const e = document.querySelector('#boss-hud .boss-top span');
    if (e) e.textContent = `${curStage().boss} (JEFE OLEADA 5)`;
  }

  const _se = window.spawnEnemy;
  window.spawnEnemy = function (isBoss, isElite) {
    const n = enemies.length;
    _se(isBoss, isElite);
    const st = curStage();
    for (let i = n; i < enemies.length; i++) {
      const e = enemies[i];
      e.hp = e.maxHp = Math.round(e.maxHp * st.hp);
      e.speed *= st.speed;
    }
    if (isBoss && activeBoss) updateBossBar();
  };
  const _cd = window.contactDamage;
  window.contactDamage = (en) => Math.round(_cd(en) * curStage().dmg);

  const _rr = window.resetRun;
  window.resetRun = function () {
    applyTheme();
    _rr();
    waveToSpawn = Math.round(25 * curStage().count);
    bossLabel();
    X.save();
  };
  const _snw = window.startNextWave;
  window.startNextWave = function () {
    const was = state.phase;
    _snw();
    if (was === 'DAY') {
      waveToSpawn = Math.round(waveToSpawn * curStage().count);
      if (state.wave === 5) bossLabel();
    }
  };
  const _rwt = window.refreshWaveTimeline;
  window.refreshWaveTimeline = function () {
    _rwt();
    const st = curStage();
    $('wave-title-txt').textContent = `${st.icon} NIVEL ${st.id} · CICLO ${state.cycle} — OLEADA ${state.wave}/5`;
  };

  // un draft gratis al terminar cada oleada (subida por niveles caracterizados)
  const _fw = window.finishWave;
  window.finishWave = function () {
    _fw();
    if (!state.over && state.phase === 'DAY') setTimeout(() => { if (!state.over) openSkillDraftModal(); }, 450);
  };
  // las bolitas de XP valen más con el avance (menos "lento" a niveles altos)
  const _hd = window.handleEnemyDeath;
  window.handleEnemyDeath = function (idx) {
    _hd(idx);
    for (let i = lootDrops.length - 1; i >= 0 && i >= lootDrops.length - 8; i--) {
      const d = lootDrops[i];
      if (d.type === 'xp' && !d._s) { d.val = Math.round(28 * (1 + (state.wave - 1) * 0.35) * (1 + (state.cycle - 1) * 0.2)); d._s = 1; break; }
    }
  };

  const _er = window.endRun;
  window.endRun = function (victory) {
    if (state.over) return;
    _er(victory);
    const st = curStage();
    const b = F.x2.best[st.id] || { wave: 0, cleared: false };
    b.wave = Math.max(b.wave, state.wave);
    if (victory) b.cleared = true;
    F.x2.best[st.id] = b;
    const extra = Math.round((state.kills * 2 + state.wave * 40 + (victory ? 400 + state.cycle * 100 : 0)) * (st.reward - 1));
    if (extra > 0) {
      state.gems += extra;
      $('end-stats').insertAdjacentHTML('beforeend', `<div class="end-stat">Bono Nivel ${st.id} 💎<b>+${extra}</b></div>`);
    }
    refreshTopHUD(); X.doSave();
  };

  function startStage(id) {
    const st = STAGES.find((s) => s.id === id);
    if (!st || st.locked) return;
    F.x2.stage = id; runStage = id;
    hideTitle();
    openTab('battle');
    resetRun();
    toast(`${st.icon} Nivel ${st.id}: ${st.name}`);
  }
  FX2.startStage = startStage;

  // ============================================================ ESTILOS UI
  const css = document.createElement('style');
  css.textContent = `
    #day-cta-box{top:236px!important;width:74%!important}
    .fx-rail2{position:absolute;right:8px;top:242px;z-index:11;display:flex;flex-direction:column;gap:6px}
    body.in-title .modal-drawer{z-index:80}
    #title-screen,#hero-choice{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;padding:22px 18px;overflow-y:auto}
    #title-screen{z-index:70;justify-content:center;background:radial-gradient(circle at 50% 18%,#3b1f7a 0%,#141227 55%,#07060f 100%)}
    #title-screen.open,#hero-choice.open{display:flex}
    #hero-choice{z-index:65;justify-content:center;background:rgba(6,8,18,.95)}
    .ts-logo{font-size:1.9rem;font-weight:800;line-height:1.05;text-align:center;color:#fde047;text-shadow:0 4px 0 #000,0 0 22px #a855f7;margin-bottom:4px}
    .ts-sub{font-size:.75rem;color:#c4b5fd;margin-bottom:6px;text-align:center}
    .ts-info{font-size:.78rem;color:#e2e8f0;margin:4px 0 10px;text-align:center}
    .ts-btn{width:100%;max-width:320px;padding:12px;margin-bottom:8px;border:3px solid #000;border-radius:16px;font-family:inherit;font-size:1.05rem;font-weight:800;cursor:pointer;color:#1c1917;background:linear-gradient(180deg,#fde047,#eab308 55%,#ca8a04);box-shadow:inset 0 2px 0 #fef9c3,0 5px 0 #000}
    .ts-btn:active{transform:translateY(2px)}
    .ts-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:320px}
    .ts-grid .ts-btn{font-size:.82rem;padding:9px;margin:0;background:linear-gradient(180deg,#4a5599,#272e5e);color:#fff;position:relative}
    .ts-afk{width:100%;max-width:320px;background:rgba(6,78,59,.9);border:2px solid #34d399;border-radius:12px;padding:6px 10px;font-size:.74rem;text-align:center;margin-bottom:8px;font-weight:700}
    .hc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:380px}
    .hc-grid .item-card:last-child{grid-column:1 / span 2}
    .fx-dot2{position:absolute;top:-6px;right:-6px;min-width:17px;height:17px;border-radius:9px;background:#ef4444;border:2px solid #000;font-size:.55rem;font-weight:800;display:none;align-items:center;justify-content:center;padding:0 3px;color:#fff}
    .fx-tabs{display:flex;gap:6px;margin-bottom:8px}
    .fx-tabs button{flex:1;padding:6px 2px;border:2px solid #000;border-radius:10px;font-family:inherit;font-weight:800;font-size:.68rem;cursor:pointer;background:#272e5e;color:#cbd5e1}
    .fx-tabs button.on{background:linear-gradient(180deg,#fde047,#ca8a04);color:#1c1917}
    .fx-price{font-family:var(--font-num);font-size:1.15rem;font-weight:800;color:#4ade80;margin:2px 0 6px}
    @media (max-height:780px){.fx-rail2{top:236px;gap:4px}.fx-rbtn{width:40px;height:40px;font-size:1rem}.fx-rbtn small{display:none}.fx-rail{top:236px;gap:4px}}
  `;
  document.head.appendChild(css);

  [['stages', '🗺️ NIVELES'], ['afk', '⏳ RECOMPENSA AFK'], ['shop', '🛒 TIENDA'], ['turrets', '🗼 BASE · TORRETAS']].forEach((a) => X.shell(a[0], a[1]));

  const title = document.createElement('div'); title.id = 'title-screen'; frame.appendChild(title);
  const hc = document.createElement('div'); hc.id = 'hero-choice'; frame.appendChild(hc);

  const rail2 = document.createElement('div');
  rail2.className = 'fx-rail2';
  [['shop', '🛒', 'TIENDA'], ['afk', '⏳', 'AFK'], ['stages', '🗺️', 'NIVEL'], ['turrets', '🗼', 'BASE']].forEach((a) => {
    const b = document.createElement('button');
    b.className = 'fx-rbtn';
    b.innerHTML = `${a[1]}<small>${a[2]}</small><span class="fx-dot2" id="dot2-${a[0]}"></span>`;
    b.onclick = () => openTab(a[0]);
    rail2.appendChild(b);
  });
  const menuBtn = document.createElement('button');
  menuBtn.className = 'fx-rbtn';
  menuBtn.innerHTML = '☰<small>MENÚ</small>';
  menuBtn.onclick = () => showTitle();
  rail2.appendChild(menuBtn);
  frame.appendChild(rail2);
  const dot2 = (id, n) => { const d = $('dot2-' + id); if (d) { d.style.display = n ? 'flex' : 'none'; d.textContent = n > 9 ? '!' : n; } };

  // ==================================================== MENÚ DE INICIO / FLUJO
  const _ip = window.isGamePaused;
  window.isGamePaused = () => _ip() || title.classList.contains('open') || hc.classList.contains('open');

  let titleT = null, titleAnim = 0;
  function showTitle() {
    openTab('battle');
    const st = curStage();
    const active = runStage === F.x2.stage && !state.over && (state.kills > 0 || state.wave > 1);
    const p = afkPending();
    title.innerHTML = `
      <div class="ts-logo">🦆 DUCK &amp; PIXEL<br>SURVIVOR</div>
      <div class="ts-sub">Defiende el campamento · Construye · Sobrevive</div>
      <canvas id="ts-hero" width="220" height="190"></canvas>
      <div class="ts-info">⚔️ Poder ${fmt(X.power())} · ${st.icon} Nivel ${st.id}: ${st.name}</div>
      ${p.hrs >= 0.1 ? `<div class="ts-afk">⏳ Recompensa AFK lista: 💎${fmt(p.gems)} 🎟️${p.tickets} 🧪${p.data} <button class="fx-mini gold" onclick="FX2.claimAfk(true)">RECLAMAR</button></div>` : ''}
      <button class="ts-btn" onclick="FX2.play()">${active ? '▶ CONTINUAR PARTIDA' : '▶ JUGAR'} — NIVEL ${st.id}</button>
      <div class="ts-grid">
        <button class="ts-btn" onclick="openTab('stages')">🗺️ NIVELES</button>
        <button class="ts-btn" onclick="openTab('afk')">⏳ AFK</button>
        <button class="ts-btn" onclick="openTab('shop')">🛒 TIENDA</button>
        <button class="ts-btn" onclick="FX2.replayTutorial()">❓ TUTORIAL</button>
      </div>
      <div class="ts-sub" style="margin-top:10px;font-size:.62rem">Beta 1.0 (build 20261102-1922) · Las compras de la tienda son una demostración (no se cobra nada)</div>`;
    title.classList.add('open');
    document.body.classList.add('in-title');
    clearInterval(titleT);
    titleT = setInterval(() => {
      const c = $('ts-hero');
      if (!c) return;
      const g = c.getContext('2d');
      g.clearRect(0, 0, 220, 190);
      titleAnim += 0.05;
      drawDetailedHero(g, 110, 140, 2.3, state.heroData, state.weaponData, 150, Math.sin(titleAnim) * 0.4, titleAnim, 0, false);
      drawDetailedSSSPet(g, 175 + Math.cos(titleAnim) * 8, 60, 1.3, state.petData, titleAnim);
    }, 50);
  }
  function hideTitle() {
    title.classList.remove('open');
    document.body.classList.remove('in-title');
    clearInterval(titleT);
  }
  FX2.play = function () {
    hideTitle();
    if (!F.tutorialDone) { FX.tutorial(0); return; }
    if (!F.x2.starterChosen) { showHeroChoice(); return; }
    if (runStage !== F.x2.stage || state.over) startStage(F.x2.stage);
  };
  FX2.replayTutorial = function () { hideTitle(); FX.tutorial(0); };

  const _tut = FX.tutorial;
  FX.tutorial = function (i) {
    _tut(i);
    if (i >= 6 && !F.x2.starterChosen) showHeroChoice();
  };

  function showHeroChoice() {
    const opts = ['siames', 'calico', 'duke'].map((id) => HEROES.find((h) => h.id === id));
    hc.innerHTML = `<div class="end-title" style="font-size:1.4rem;margin-bottom:4px">ELIGE A TU HÉROE</div>
      <div class="end-sub" style="margin-bottom:12px">Podrás cambiarlo cuando quieras en 🎒 HÉROE/EQ</div>
      <div class="hc-grid">${opts.map((h) => `<div class="item-card">
        <span class="card-ribbon">${h.badge}</span>
        <div class="portrait-stage"><canvas width="76" height="76" data-h="${h.id}"></canvas></div>
        <div class="item-title">${h.name}</div><div class="item-desc">${h.desc}</div>
        <button class="btn-action" onclick="FX2.pickHero('${h.id}')">ELEGIR</button></div>`).join('')}</div>`;
    hc.classList.add('open');
    hc.querySelectorAll('canvas').forEach((c) => {
      drawDetailedHero(c.getContext('2d'), 38, 50, 1.2, HEROES.find((h) => h.id === c.dataset.h), state.weaponData, 30, 0, 0, 0, false);
    });
  }
  FX2.pickHero = function (id) {
    state.heroData = HEROES.find((h) => h.id === id) || state.heroData;
    F.x2.starterChosen = true;
    hc.classList.remove('open');
    refreshTopHUD(); X.save();
    startStage(F.x2.stage || 1);
    toast(`¡Bienvenido, ${state.heroData.name.split(' ')[0]}!`);
  };

  // ==================================================================== AFK
  const stageScore = () => { let s = 1; Object.keys(F.x2.best).forEach((k) => { const b = F.x2.best[k]; s += (b.wave || 0) + (b.cleared ? 5 : 0); }); return s; };
  function afkRates() { const s = stageScore(); return { gems: 40 + s * 12, tickets: 1 + s * 0.35, data: 0.5 + s * 0.25, cores: 0.15 + s * 0.05, shards: 2 + s * 0.5 }; }
  function afkPending() {
    const hrs = Math.min(8, (Date.now() - F.x2.afk.last) / 3600000), r = afkRates();
    return { hrs, gems: Math.floor(r.gems * hrs), tickets: Math.floor(r.tickets * hrs), data: Math.floor(r.data * hrs), cores: Math.floor(r.cores * hrs), shardW: Math.floor(r.shards * hrs) };
  }
  FX2.claimAfk = function (fromTitle) {
    const p = afkPending();
    if (p.hrs < 0.05) return toast('⏳ Aún no hay recompensa AFK. Vuelve en un rato.');
    toast('🎁 AFK: ' + X.grant({ gems: p.gems, tickets: p.tickets, data: p.data, cores: p.cores, shardW: p.shardW }));
    F.x2.afk.last = Date.now(); X.save(); sfx('win');
    if (fromTitle) showTitle(); else openTab('afk');
  };
  FX2.boostAfk = function () {
    if (state.gems < 60) return toast('¡Necesitas 60 💎!');
    state.gems -= 60; F.x2.afk.last -= 2 * 3600000; refreshTopHUD(); X.save(); openTab('afk');
  };

  // ================================================================== TIENDA
  const PACKS = [
    { id: 'starter', price: 0.99, once: true, name: 'Pack Pionero', icon: '🎁', r: { gems: 300, tickets: 10, shardW: 20 } },
    { id: 'p5', price: 4.99, name: 'Cofre de Plata', icon: '📦', r: { gems: 1600, tickets: 40, data: 20 } },
    { id: 'p10', price: 9.99, name: 'Cofre de Oro', icon: '💰', r: { gems: 3500, tickets: 90, data: 40, shardW: 40, shardP: 20 } },
    { id: 'p20', price: 19.99, tag: 'POPULAR', name: 'Tesoro Épico', icon: '👑', r: { gems: 7500, tickets: 200, data: 100, shardW: 100, shardP: 60, cores: 40 } },
    { id: 'p50', price: 49.99, name: 'Arsenal Legendario', icon: '⚔️', r: { gems: 20000, tickets: 500, data: 300, shardW: 250, shardP: 150, cores: 120, skin: 'cyber_gold' } },
    { id: 'p100', price: 99.99, tag: 'MÁXIMO', name: 'Emperador Astral', icon: '🌌', r: { gems: 45000, tickets: 1200, data: 800, shardW: 600, shardP: 400, cores: 300, wpn: 'thunder', skin: 'duke_gold' } }
  ];
  const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
  const passActive = () => F.x2.shop.passUntil > Date.now();
  const R2 = {};
  R2.shop = function () {
    X.curBar('shop');
    const S = F.x2.shop, t = todayKey();
    let html = `<div class="fx-note" style="background:#3b0764;border:2px solid #f472b6;border-radius:10px;padding:6px">🧪 <b>MODO DEMO:</b> las compras son simuladas y <b>no se cobra nada</b>. Para cobros reales hay que conectar Google Play Billing / App Store.</div>
      <div class="fx-row"><div class="ic">🎁</div><div class="tx"><b>Regalo diario gratis</b>💎50 + 🎟️3</div>
        <button class="fx-mini" ${S.freeClaim === t ? 'disabled' : ''} onclick="FX2.freeDaily()">${S.freeClaim === t ? '✓' : 'RECLAMAR'}</button></div>
      <div class="fx-row"><div class="ic">📅</div><div class="tx"><b>Pase Mensual · ${eur(4.99)}</b>${passActive() ? 'Activo · ' + Math.ceil((S.passUntil - Date.now()) / DAY) + ' días' : '30 días: cada día 💎150 + 🎟️8 + 🧪5'}</div>
        ${passActive() ? `<button class="fx-mini gold" ${S.passClaim === t ? 'disabled' : ''} onclick="FX2.claimPass()">${S.passClaim === t ? '✓' : 'RECLAMAR HOY'}</button>` : `<button class="fx-mini gold" onclick="FX2.buyPass()">${eur(4.99)}</button>`}</div>
      <div class="fx-sec">💎 Paquetes</div><div class="detailed-grid">`;
    PACKS.forEach((p) => {
      const sold = p.once && S.bought[p.id];
      html += `<div class="item-card ${p.price >= 49 ? 'sss' : 'event'}">${p.tag ? `<span class="card-ribbon">${p.tag}</span>` : ''}
        <div class="portrait-stage" style="font-size:2.4rem">${p.icon}</div><div class="item-title">${p.name}</div>
        <div class="item-desc" style="font-size:.66rem">${X.grantPreview(p.r)}</div><div class="fx-price">${eur(p.price)}</div>
        <button class="btn-action ${p.price >= 49 ? 'upgrade' : ''}" ${sold ? 'disabled' : ''} onclick="FX2.buyPack('${p.id}')">${sold ? '✓ COMPRADO' : 'COMPRAR'}</button></div>`;
    });
    X.body('shop').innerHTML = html + '</div>';
  };
  FX2.freeDaily = function () { const t = todayKey(); if (F.x2.shop.freeClaim === t) return; F.x2.shop.freeClaim = t; toast('🎁 ' + X.grant({ gems: 50, tickets: 3 })); R2.shop(); };
  FX2.buyPack = function (id) {
    const p = PACKS.find((x) => x.id === id);
    if (!p || (p.once && F.x2.shop.bought[id])) return;
    if (!confirm(`COMPRA SIMULADA (modo demo)\n\n${p.name} — ${eur(p.price)}\n\nNo se realizará ningún cobro.`)) return;
    F.x2.shop.bought[id] = true; F.x2.spent += p.price;
    toast('🛒 ' + X.grant(p.r)); sfx('win'); R2.shop();
  };
  FX2.buyPass = function () {
    if (!confirm(`COMPRA SIMULADA (modo demo)\n\nPase Mensual — ${eur(4.99)}\n\nNo se realizará ningún cobro.`)) return;
    F.x2.shop.passUntil = Date.now() + 30 * DAY; F.x2.spent += 4.99; X.save(); sfx('win'); R2.shop();
  };
  FX2.claimPass = function () { const t = todayKey(); if (!passActive() || F.x2.shop.passClaim === t) return; F.x2.shop.passClaim = t; toast('📅 ' + X.grant({ gems: 150, tickets: 8, data: 5 })); R2.shop(); };

  // ============================================================== NIVELES UI
  R2.stages = function () {
    X.curBar('stages');
    let html = '<div class="fx-note">Elige un nivel. Puedes salir al menú (☰) en cualquier momento y saltar a otro nivel.</div>';
    STAGES.forEach((st) => {
      const b = F.x2.best[st.id] || { wave: 0, cleared: false };
      html += `<div class="fx-row ${st.locked ? 'fx-locked' : ''}"><div class="ic" style="font-size:2rem">${st.icon}</div>
        <div class="tx"><b>NIVEL ${st.id} · ${st.name}${F.x2.stage === st.id ? ' · ACTUAL' : ''}</b>${st.desc}<br>
        Vida x${st.hp} · Daño x${st.dmg} · Recompensas x${st.reward}<br>Mejor: oleada ${b.wave}/5 ${b.cleared ? '🏆' : ''} · Poder rec. ${fmt(st.rec)}</div>
        <button class="fx-mini gold" ${st.locked ? 'disabled' : ''} onclick="FX2.startStage(${st.id})">${st.locked ? '🔒' : 'JUGAR'}</button></div>`;
    });
    X.body('stages').innerHTML = html;
  };

  R2.afk = function () {
    X.curBar('afk');
    const p = afkPending(), r = afkRates();
    X.body('afk').innerHTML = `<div class="fx-hero"><div style="font-weight:800">⏳ Recompensa AFK</div>
      <div class="big">${p.hrs.toFixed(1)} h / 8 h</div>
      <div class="fx-note">Acumulas recursos aunque no juegues. Tu ritmo depende de los niveles y oleadas que has superado (puntuación ${stageScore()}).</div>
      <div class="fx-note" style="font-size:.8rem;color:#fff">💎${fmt(p.gems)} · 🎟️${p.tickets} · 🧪${p.data} · 🔩${p.cores} · ⭐${p.shardW} frag.</div></div>
      <button class="btn-action" onclick="FX2.claimAfk()">🎁 RECLAMAR AFK</button>
      <button class="btn-action upgrade" onclick="FX2.boostAfk()">⏩ +2 HORAS (💎60)</button>
      <div class="fx-sec">📈 Ritmo por hora</div>
      <div class="fx-note">💎${Math.round(r.gems)} · 🎟️${r.tickets.toFixed(1)} · 🧪${r.data.toFixed(1)} · 🔩${r.cores.toFixed(2)} · ⭐${r.shards.toFixed(1)} frag. de arma. Supera más oleadas y gana niveles para subirlo.</div>`;
  };

  // ======================================================= TORRETAS CON HABILIDAD
  const TUR = {
    turret_nw: { n: 'Ráfaga Gatling', cd: 6, desc: 'Dispara 10 balas en abanico.' },
    turret_ne: { n: 'Pulso de Plasma', cd: 7, desc: 'Explosión de plasma en área sobre un enemigo.' },
    turret_sw: { n: 'Ventisca Crio', cd: 8, desc: 'Congela y daña a todos los enemigos cercanos.' }
  };
  const turT = {};
  function aoeAt(x, y, r, dmg, color) {
    enemies.forEach((e) => {
      if (Math.hypot(e.x - x, e.y - y) < r) { e.hp -= dmg; e.hitFlash = 0.15; addFloatingText(e.x, e.y - 18, String(Math.round(dmg)), color, 14); }
    });
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; particles.push({ x, y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, color, r: 5, life: 0.4 }); }
    if (activeBoss) updateBossBar();
  }
  function fireTurret(pd, mult) {
    const evo = F.x2.evo[pd.id] || 0;
    let near = enemies[0], bd = 1e9;
    enemies.forEach((e) => { const d = Math.hypot(e.x - pd.x, e.y - pd.y); if (d < bd) { bd = d; near = e; } });
    if (pd.id === 'turret_nw') {
      const base = Math.atan2(near.y - pd.y, near.x - pd.x);
      for (let i = 0; i < 10; i++) {
        const a = base + (i - 4.5) * 0.14;
        bullets.push({ x: pd.x, y: pd.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, angle: a, style: 'turret', color: pd.color, subColor: '#fff', dmg: 26 * pd.level * mult, pierce: 2, radius: 10, life: 1 });
      }
    } else if (pd.id === 'turret_ne') {
      const t = enemies[Math.floor(Math.random() * enemies.length)];
      aoeAt(t.x, t.y, 150, 70 * pd.level * mult, pd.color);
    } else {
      enemies.forEach((e) => {
        if (Math.hypot(e.x - pd.x, e.y - pd.y) < 300) { e.freezeTime = 2.5 + 0.5 * evo; e.hp -= 35 * pd.level * mult; e.hitFlash = 0.12; }
      });
      aoeAt(pd.x, pd.y, 300, 0, '#7dd3fc');
    }
    addFloatingText(pd.x, pd.y - 60, TUR[pd.id].n, pd.color, 14);
  }
  function tickTurrets(dt) {
    if (!enemies.length || state.over) return;
    basePads.forEach((pd) => {
      const T = TUR[pd.id];
      if (!T || pd.level < 3) return;
      turT[pd.id] = (turT[pd.id] === undefined ? T.cd * 0.5 : turT[pd.id]) - dt;
      if (turT[pd.id] > 0) return;
      const evo = F.x2.evo[pd.id] || 0, tesla = F.x2.tesla;
      turT[pd.id] = T.cd * (1 - 0.12 * evo) * (tesla ? 0.75 : 1) * (pd.level >= 5 ? 0.8 : 1);
      fireTurret(pd, (1 + 0.25 * evo) * (tesla ? 1.3 : 1));
    });
  }
  setInterval(() => { if (!isGamePaused()) tickTurrets(0.1); }, 100);

  R2.turrets = function () {
    X.curBar('turrets');
    let html = `<div class="fx-note">Al subir una torreta a <b>NV.3</b> se activa su habilidad (NV.5 la acelera). Evoluciónala con 🔩 Núcleos (evento Fortaleza, AFK y paquetes). Núcleos: <b>${F.x2.cores || 0}</b> ${F.x2.tesla ? '· ⚡ Torreta Tesla activa (+30% poder, -25% recarga)' : ''}</div>`;
    Object.keys(TUR).forEach((id) => {
      const T = TUR[id], pd = basePads.find((p) => p.id === id), evo = F.x2.evo[id] || 0;
      const cost = 5 * (evo + 1), dc = 10 * (evo + 1);
      html += `<div class="fx-row"><div class="ic">🗼</div><div class="tx"><b>${T.n} · Evo ${evo}/3</b>${T.desc} Recarga ${(T.cd * (1 - 0.12 * evo)).toFixed(1)}s · Torreta NV.${pd.level}${pd.level < 3 ? ' (activa en NV.3)' : ' ✓'}</div>
        <button class="fx-mini gold" ${evo >= 3 || (F.x2.cores || 0) < cost || F.data < dc ? 'disabled' : ''} onclick="FX2.evoTurret('${id}')">${evo >= 3 ? 'MAX' : `🔩${cost} 🧪${dc}`}</button></div>`;
    });
    X.body('turrets').innerHTML = html;
  };
  FX2.evoTurret = function (id) {
    const evo = F.x2.evo[id] || 0, cost = 5 * (evo + 1), dc = 10 * (evo + 1);
    if (evo >= 3 || (F.x2.cores || 0) < cost || F.data < dc) return;
    F.x2.cores -= cost; F.data -= dc; F.x2.evo[id] = evo + 1;
    refreshTopHUD(); sfx('build'); X.save(); R2.turrets();
  };

  // ======================================================== EVENTOS HÉROE Y BASE
  const EVS = {
    hero: { days: 5, name: '🐾 Cacería Felina', desc: 'Evento de Héroes: gana skins exclusivas para los gatos y fragmentos de estrella.',
      ms: [{ p: 60, r: { gems: 200 } }, { p: 180, r: { data: 30 } }, { p: 350, r: { skin: 'siames_royal' } }, { p: 600, r: { shardW: 40, tickets: 40 } },
        { p: 900, r: { skin: 'calico_galaxy' } }, { p: 1300, r: { gems: 800, shardP: 60 } }] },
    base: { days: 6, name: '🔩 Fortaleza Tesla', desc: 'Evento de Bases: gana 🔩 Núcleos para evolucionar torretas y la Torreta Tesla mejorada.',
      ms: [{ p: 80, r: { cores: 10 } }, { p: 200, r: { gems: 300 } }, { p: 350, r: { cores: 20 } }, { p: 600, r: { tickets: 60 } },
        { p: 900, r: { cores: 40, shardW: 30 } }, { p: 1300, r: { tesla: true } }] }
  };
  function ensureEv() {
    const now = Date.now();
    Object.keys(EVS).forEach((k) => {
      const e = F.x2.ev[k];
      if (!e || now - e.start > EVS[k].days * DAY) F.x2.ev[k] = { points: 0, claimed: [], start: now, season: e ? e.season + 1 : 1 };
    });
  }
  ensureEv();
  window.addEvent2 = function (n) { ensureEv(); Object.keys(EVS).forEach((k) => { F.x2.ev[k].points += n; }); };
  window.EVTAB = 'astral';
  const tabsHtml = () => `<div class="fx-tabs">${[['astral', '🌌 ASTRAL'], ['hero', '🐾 HÉROE'], ['base', '🔩 BASE']].map((t) =>
    `<button class="${window.EVTAB === t[0] ? 'on' : ''}" onclick="FX2.evTab('${t[0]}')">${t[1]}</button>`).join('')}</div>`;
  window.decorateEventTabs = function () { const b = X.body('event'); b.innerHTML = tabsHtml() + b.innerHTML; };
  FX2.evTab = function (t) { window.EVTAB = t; X.R.event(); };
  window.renderEvent2 = function () {
    ensureEv();
    const k = window.EVTAB, ev = EVS[k], e = F.x2.ev[k];
    const left = Math.max(0, e.start + ev.days * DAY - Date.now());
    let html = tabsHtml() + `<div class="fx-hero"><div style="font-weight:800">${ev.name} · Temporada ${e.season}</div>
      <div class="big">${fmt(e.points)} puntos</div>
      <div class="fx-note">Termina en ${Math.floor(left / DAY)}d ${Math.floor((left % DAY) / 3600000)}h · ${ev.desc} Ganas puntos jugando (matando, superando oleadas y partidas).</div></div>`;
    ev.ms.forEach((m) => {
      const ok = e.points >= m.p, got = e.claimed.includes(m.p), big = m.r.skin || m.r.tesla;
      html += `<div class="fx-row ${got ? 'done' : ''}"><div class="ic">${m.r.skin ? '🎨' : (m.r.tesla ? '⚡' : '🎁')}</div>
        <div class="tx"><b>${fmt(m.p)} pts ${big ? '· PREMIO MAYOR' : ''}</b>${X.grantPreview(m.r)}<div class="fx-prog"><i style="width:${Math.min(100, e.points / m.p * 100)}%"></i></div></div>
        <button class="fx-mini ${big ? 'gold' : ''}" ${ok && !got ? '' : 'disabled'} onclick="FX2.claimEv('${k}',${m.p})">${got ? '✓' : 'RECLAMAR'}</button></div>`;
    });
    X.body('event').innerHTML = html;
  };
  FX2.claimEv = function (k, p) {
    const e = F.x2.ev[k], m = EVS[k].ms.find((x) => x.p === p);
    if (!m || e.claimed.includes(p) || e.points < p) return;
    e.claimed.push(p);
    toast('🎁 ' + X.grant(m.r)); sfx('level'); X.R.event();
  };

  // ================================================================== RAIL / HOOKS
  function updateRail2() {
    const p = afkPending(), t = todayKey(), S = F.x2.shop;
    dot2('afk', p.hrs >= 1 ? 1 : 0);
    dot2('shop', (S.freeClaim !== t ? 1 : 0) + (passActive() && S.passClaim !== t ? 1 : 0));
  }
  const _ot = window.openTab;
  window.openTab = function (t) {
    _ot(t);
    if (R2[t]) R2[t]();
    updateRail2();
  };
  setInterval(updateRail2, 1500);

  // ========================================================================= INIT
  applyStars();
  applyTheme();
  refreshTopHUD();
  updateRail2();
  showTitle();
  window.__F2 = { STAGES, PACKS, EVS, startStage, showTitle };
})();
