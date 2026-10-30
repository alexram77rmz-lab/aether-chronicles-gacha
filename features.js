/* ============================================================================
   features.js — META-JUEGO (se carga DESPUÉS del script principal de index.html)
   Laboratorio + Gran Laboratorio, Festival Astral SSS (contador + invocación con
   garantía), Skins, Clanes (simulados offline), Habilidades activas compradas,
   Misiones diarias + login, Tutorial, y envoltorios (wrappers) del juego base.
   Guardado propio: localStorage 'duckPixelSurvivor_features_v1'.
   ============================================================================ */
(function () {
  'use strict';

  const frame = document.getElementById('phone-frame');
  const FKEY = 'duckPixelSurvivor_features_v1';
  const DAY = 86400000;
  const EVENT_DAYS = 7;
  const todayKey = () => new Date().toDateString();
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Math.round(n).toLocaleString();

  // ------------------------------------------------------------------ STATE
  const F = {
    data: 0,
    lab: {}, big: {},
    event: { points: 0, claimed: [], pulls: 0, pityPet: 0, pityWpn: 0, start: Date.now(), season: 1 },
    skills: { owned: { shield: 1, nova: 1 }, equipped: ['shield', 'nova'] },
    skins: { owned: {}, equipped: {} },
    clan: null,
    daily: { date: '', prog: {}, claimed: {}, chest: false },
    login: { streak: 0, last: '', claimed: false },
    tutorialDone: false,
    own: {}, lv: {}, equip: {}, runs: 0
  };

  // ------------------------------------------------------- EXCLUSIVE ITEMS
  EVENT_WEAPONS.push(
    { id: 'thunder', name: 'Martillo Trueno Pixel', tag: 'SSS EVENTO', icon: '🔨', level: 1, stars: 5,
      primaryColor: '#fde047', secondaryColor: '#38bdf8', fireRate: 0.30, dmgMult: 2.7, exclusive: true, owned: false,
      desc: 'Arma SSS: descarga martillazos de rayo perforantes. Garantizada en la Invocación Astral.' },
    { id: 'solar', name: 'Excálibur Estelar SSS+', tag: 'SSS+ ÚNICA', icon: '⚔️', level: 1, stars: 5,
      primaryColor: '#fde047', secondaryColor: '#ffffff', fireRate: 0.28, dmgMult: 3.4, exclusive: true, owned: false,
      desc: 'El arma definitiva (tres S+). Premio final del Festival Astral: 1500 puntos.' }
  );
  SSS_PETS.push(
    { id: 'nebula', name: 'Gato Nebulosa SSS', icon: '🐱', level: 1, stars: 5, bodyColor: '#a78bfa', wingColor: '#f0abfc',
      ultName: 'LLUVIA NEBULOSA', cooldown: 1.3, dmgMult: 3.0, exclusive: true, owned: false,
      desc: 'Gato cósmico con halo violeta. Premio del Festival Astral: 750 puntos.' },
    { id: 'galaxy', name: 'Wyrm Galáctico SSS+', icon: '🌌', level: 1, stars: 5, bodyColor: '#1e1b4b', wingColor: '#22d3ee',
      ultName: 'AGUJERO DE GUSANO', cooldown: 1.2, dmgMult: 3.5, exclusive: true, owned: false,
      desc: 'Dragón del vacío. Garantizado en la Invocación Astral.' }
  );
  const EXCL = () => [...EVENT_WEAPONS, ...SSS_PETS].filter((i) => i.exclusive);
  const findItem = (kind, id) => (kind === 'wpn' ? EVENT_WEAPONS : SSS_PETS).find((i) => i.id === id);

  // ------------------------------------------------------------------ SKINS
  const SKINS = [
    { id: 'duke_camo', hero: 'duke', name: 'Duke Selva', price: 250, colors: { featherColor: '#facc15', helmetColor: '#3f6212', capeColor: '#365314' } },
    { id: 'duke_gold', hero: 'duke', name: 'Duke Dorado', price: 400, spark: '#fde047', colors: { featherColor: '#fde68a', helmetColor: '#b45309', capeColor: '#f59e0b' } },
    { id: 'duke_galaxy', hero: 'duke', name: 'Duke Galaxia (Evento)', price: 0, spark: '#e879f9', colors: { featherColor: '#c4b5fd', helmetColor: '#312e81', capeColor: '#7c3aed' } },
    { id: 'ronin_blood', hero: 'ronin', name: 'Kurogane Carmesí', price: 450, colors: { featherColor: '#fecaca', helmetColor: '#450a0a', capeColor: '#dc2626' } },
    { id: 'ronin_sakura', hero: 'ronin', name: 'Kurogane Sakura', price: 600, spark: '#f9a8d4', colors: { featherColor: '#fbcfe8', helmetColor: '#9d174d', capeColor: '#f472b6' } },
    { id: 'cyber_toxic', hero: 'cyber', name: 'Nova-X Tóxico', price: 400, spark: '#bef264', colors: { featherColor: '#86efac', helmetColor: '#14532d', capeColor: '#a3e635' } },
    { id: 'cyber_gold', hero: 'cyber', name: 'Nova-X Oro', price: 800, colors: { featherColor: '#fef08a', helmetColor: '#713f12', capeColor: '#fbbf24' } },
    { id: 'mage_void', hero: 'mage', name: 'Astralix del Vacío', price: 700, spark: '#c084fc', colors: { featherColor: '#a78bfa', helmetColor: '#0f172a', capeColor: '#6d28d9' } },
    { id: 'mage_sun', hero: 'mage', name: 'Astralix Solar', price: 500, spark: '#fdba74', colors: { featherColor: '#fed7aa', helmetColor: '#c2410c', capeColor: '#facc15' } }
  ];
  window.skinned = function (h) {
    if (!h || h._skin) return h;
    const sk = SKINS.find((s) => s.id === F.skins.equipped[h.id]);
    return sk ? Object.assign({}, h, sk.colors) : h;
  };

  // -------------------------------------------------------------------- LAB
  const LAB = [
    { id: 'hp', icon: '❤️', name: 'Vitalidad', desc: '+6% vida máxima / nivel', max: 20, base: 6 },
    { id: 'dmg', icon: '💥', name: 'Poder de Fuego', desc: '+5% daño del arma / nivel', max: 20, base: 8 },
    { id: 'fire', icon: '⚡', name: 'Cadencia', desc: '+3% velocidad de disparo / nivel', max: 15, base: 8 },
    { id: 'magnet', icon: '🧲', name: 'Imán de Botín', desc: '+8% radio de absorción / nivel', max: 10, base: 5 },
    { id: 'startcash', icon: '💵', name: 'Fondo Inicial', desc: '+$15 al empezar la partida / nivel', max: 10, base: 5 },
    { id: 'regen', icon: '💚', name: 'Regeneración', desc: '+0.4% vida por segundo / nivel', max: 10, base: 6 },
    { id: 'disc', icon: '🏗️', name: 'Constructor', desc: '-3% coste de construcción / nivel', max: 10, base: 6 },
    { id: 'loot', icon: '🍀', name: 'Botín Doble', desc: '+6% prob. de billete extra / nivel', max: 10, base: 6 }
  ];
  const BIG = [
    { id: 'twin', icon: '🔫', name: 'Proyectil Gemelo', desc: '+1 proyectil por disparo', max: 3, data: 60, gems: 800 },
    { id: 'saw', icon: '⚙️', name: 'Sierra Orbital Extra', desc: '+1 sierra orbital al empezar', max: 3, data: 50, gems: 600 },
    { id: 'revive', icon: '💖', name: 'Segundo Aliento', desc: 'Revives una vez por partida al 50%', max: 2, data: 80, gems: 1200 },
    { id: 'fever', icon: '🔥', name: 'Reactor de Fiebre', desc: '+3 de fiebre extra por baja', max: 3, data: 55, gems: 700 },
    { id: 'builder', icon: '🧱', name: 'Maestro Constructor', desc: 'Empiezas con una torreta construida', max: 1, data: 100, gems: 1500 }
  ];
  const labLv = (id) => F.lab[id] || 0;
  const bigLv = (id) => F.big[id] || 0;
  const clanLv = () => (F.clan ? F.clan.level : 0);
  const labCost = (t) => Math.round(t.base * (1 + labLv(t.id) * 0.7));
  const bigUnlocked = () => state.bestCycle >= 1;

  function mods() {
    return {
      hp: 1 + labLv('hp') * 0.06 + clanLv() * 0.03,
      dmg: 1 + labLv('dmg') * 0.05 + clanLv() * 0.02,
      fire: 1 + labLv('fire') * 0.03,
      magnet: 1 + labLv('magnet') * 0.08,
      regen: labLv('regen') * 0.004,
      disc: Math.max(0.5, 1 - labLv('disc') * 0.03),
      loot: labLv('loot') * 0.06
    };
  }

  let magMult = 1;
  let runRevives = 0;
  function applyFire() {
    const m = mods();
    EVENT_WEAPONS.forEach((w) => { if (!w._fr) w._fr = w.fireRate; w.fireRate = w._fr / m.fire; });
  }
  function applyMagnet() {
    const m = mods();
    state.magnetRange = Math.round(state.magnetRange / magMult * m.magnet);
    magMult = m.magnet;
  }
  function applyRunStartMods() {
    const m = mods();
    magMult = 1;
    state.cash += labLv('startcash') * 15;
    state.extraShots += bigLv('twin');
    state.orbitalSaws += bigLv('saw');
    runRevives = bigLv('revive');
    applyMagnet();
    basePads.forEach((pd) => { pd.cost = Math.max(10, Math.round(pd.baseCost * m.disc)); });
    if (bigLv('builder')) { const pd = basePads.find((p) => !p.isPortal); if (pd) pd.level = 1; }
    skillCd = {};
    lastPad = padSum();
    applyFire();
    refreshTopHUD();
  }

  // ------------------------------------------------------------ PERSISTENCE
  let saveT = null;
  function doSave() {
    try {
      EXCL().forEach((i) => { F.own[i.id] = i.owned; F.lv[i.id] = i.level; });
      F.equip = { weapon: state.weaponData.id, pet: state.petData.id };
      localStorage.setItem(FKEY, JSON.stringify(F));
    } catch (e) { /* storage unavailable */ }
  }
  function save() { clearTimeout(saveT); saveT = setTimeout(doSave, 400); }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(FKEY) || 'null');
      if (!s) return;
      Object.keys(s).forEach((k) => {
        if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && F[k] && typeof F[k] === 'object') Object.assign(F[k], s[k]);
        else F[k] = s[k];
      });
      EXCL().forEach((i) => {
        if (F.own[i.id] !== undefined) i.owned = !!F.own[i.id];
        if (F.lv[i.id]) i.level = F.lv[i.id];
      });
      const w = findItem('wpn', F.equip.weapon);
      const p = findItem('pet', F.equip.pet);
      if (w && w.owned !== false) state.weaponData = w;
      if (p && p.owned !== false) state.petData = p;
    } catch (e) { /* corrupt save */ }
  }

  // ------------------------------------------------- DAILY / LOGIN / EVENT
  function ensureDaily() {
    const t = todayKey();
    if (F.daily.date !== t) { F.daily = { date: t, prog: {}, claimed: {}, chest: false }; }
    if (F.login.last !== t) {
      const y = new Date(Date.now() - DAY).toDateString();
      F.login.streak = F.login.last === y ? F.login.streak + 1 : 1;
      F.login.last = t;
      F.login.claimed = false;
    }
    if (Date.now() - F.event.start > EVENT_DAYS * DAY) {
      F.event = { points: 0, claimed: [], pulls: 0, pityPet: 0, pityWpn: 0, start: Date.now(), season: F.event.season + 1 };
      setTimeout(() => showToast('🌌 ¡Nuevo Festival Astral! Los puntos se reiniciaron.'), 1500);
    }
  }
  const addProg = (k, n) => { ensureDaily(); F.daily.prog[k] = (F.daily.prog[k] || 0) + n; save(); updateRail(); };
  const addEventPts = (n) => { F.event.points += n; save(); updateRail(); };

  const MISSIONS = [
    { id: 'kills', icon: '🧟', name: 'Elimina 120 enemigos', goal: 120, r: { gems: 100 } },
    { id: 'waves', icon: '🌙', name: 'Supera 6 oleadas', goal: 6, r: { gems: 100 } },
    { id: 'builds', icon: '🏗️', name: 'Construye o mejora 6 veces la base', goal: 6, r: { data: 10 } },
    { id: 'skills', icon: '✨', name: 'Usa 5 habilidades activas', goal: 5, r: { tickets: 15 } },
    { id: 'wins', icon: '🏆', name: 'Derrota al jefe de la oleada 5', goal: 1, r: { gems: 250, tickets: 10 } }
  ];
  const LOGIN_REWARDS = [
    { gems: 100 }, { tickets: 20 }, { data: 15 }, { gems: 250 }, { tickets: 40 }, { data: 30 }, { gems: 800, tickets: 60 }
  ];
  const MILESTONES = [
    { p: 50, r: { gems: 150 } }, { p: 150, r: { tickets: 30 } }, { p: 300, r: { data: 25 } },
    { p: 500, r: { gems: 400 } }, { p: 750, r: { pet: 'nebula' } },
    { p: 1000, r: { skin: 'duke_galaxy', tickets: 60 } }, { p: 1500, r: { wpn: 'solar' } }
  ];

  function grant(r) {
    const out = [];
    if (r.gems) { state.gems += r.gems; out.push('💎' + fmt(r.gems)); }
    if (r.tickets) { state.tickets += r.tickets; out.push('🎟️' + r.tickets); }
    if (r.data) { F.data += r.data; out.push('🧪' + r.data); }
    if (r.pet) { const it = findItem('pet', r.pet); out.push(giveItem(it)); }
    if (r.wpn) { const it = findItem('wpn', r.wpn); out.push(giveItem(it)); }
    if (r.skin) { F.skins.owned[r.skin] = true; out.push('🎨 Skin'); }
    refreshTopHUD(); save(); updateRail();
    return out.join(' ');
  }
  function giveItem(it) {
    if (!it) return '';
    if (!it.owned) { it.owned = true; return `${it.icon} ${it.name} (NUEVA)`; }
    it.level++;
    return `${it.icon} ${it.name} +1 NV`;
  }
  const rewardText = (r) => grantPreview(r);
  function grantPreview(r) {
    const o = [];
    if (r.gems) o.push('💎' + fmt(r.gems));
    if (r.tickets) o.push('🎟️' + r.tickets);
    if (r.data) o.push('🧪' + r.data);
    if (r.pet) o.push('🐱 ' + findItem('pet', r.pet).name);
    if (r.wpn) o.push('⚔️ ' + findItem('wpn', r.wpn).name);
    if (r.skin) o.push('🎨 ' + SKINS.find((s) => s.id === r.skin).name);
    return o.join(' + ');
  }

  // ----------------------------------------------------------------- SKILLS
  const SKILLS = [
    { id: 'shield', icon: '🛡️', name: 'Escudo Pixel', cd: 22, price: 0, desc: (L) => `Invulnerable ${(2.5 + L * 0.5).toFixed(1)}s.`,
      run: (L) => { state.player.hitCd = 2.5 + L * 0.5; addBurstParticles(state.player.x, state.player.y, '#38bdf8', 16); } },
    { id: 'nova', icon: '💣', name: 'Nova Explosiva', cd: 18, price: 0, desc: (L) => `Explosión: ${120 + L * 80} de daño en área.`,
      run: (L) => { aoe(300, 120 + L * 80); ring('#fb923c'); } },
    { id: 'heal', icon: '💊', name: 'Reparación', cd: 28, price: 250, desc: (L) => `Cura ${25 + L * 5}% de vida.`,
      run: (L) => { const p = state.player; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * (0.25 + L * 0.05)); updateHpBar(); ring('#4ade80'); } },
    { id: 'freeze', icon: '🧊', name: 'Cero Absoluto', cd: 24, price: 400, desc: (L) => `Congela a todos ${(3 + L * 0.5).toFixed(1)}s.`,
      run: (L) => { enemies.forEach((e) => { e.freezeTime = 3 + L * 0.5; }); ring('#7dd3fc'); } },
    { id: 'rage', icon: '😡', name: 'Furia Berserker', cd: 30, price: 500, desc: (L) => `Hiper-Pixel +${4 + L}s sin gastar fiebre.`,
      run: (L) => { state.overdriveTime = Math.max(state.overdriveTime, 0) + 4 + L; ring('#facc15'); } },
    { id: 'vacuum', icon: '🌀', name: 'Aspiradora Total', cd: 15, price: 300, desc: (L) => `Atrae todo el botín (+${L * 5} billetes).`,
      run: (L) => { lootDrops.forEach((d) => { d.x = state.player.x; d.y = state.player.y; }); state.cash += L * 5; refreshTopHUD(); ring('#a78bfa'); } }
  ];
  let skillCd = {};
  const skLv = (id) => F.skills.owned[id] || 0;

  function aoe(radius, dmg) {
    const p = state.player;
    enemies.forEach((e) => {
      if (Math.hypot(e.x - p.x, e.y - p.y) < radius) {
        e.hp -= dmg; e.hitFlash = 0.15;
        addFloatingText(e.x, e.y - 18, String(dmg), '#fb923c', 15);
      }
    });
    if (activeBoss) updateBossBar();
  }
  function ring(color) {
    const p = state.player;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * 280, vy: Math.sin(a) * 280, color, r: 6, life: 0.45 });
    }
  }
  function useSkill(slot) {
    if (isGamePaused() || state.over) return;
    const id = F.skills.equipped[slot];
    const sk = SKILLS.find((s) => s.id === id);
    if (!sk) return showToast('✨ Equipa una habilidad en el menú Habilidades.');
    if ((skillCd[id] || 0) > 0) return;
    sk.run(skLv(id) || 1);
    skillCd[id] = sk.cd;
    addProg('skills', 1);
    sfx('ult');
  }

  // ---------------------------------------------------------- WRAPPERS
  const _pm = window.playerMaxHp;
  window.playerMaxHp = () => Math.round(_pm() * mods().hp);

  const _rw = window.rollWeaponDamage;
  window.rollWeaponDamage = (w, o) => { const r = _rw(w, o); r.dmg *= mods().dmg; return r; };

  const _rr = window.resetRun;
  window.resetRun = function () { _rr(); applyRunStartMods(); };

  const _rt = window.refreshTopHUD;
  window.refreshTopHUD = function () { _rt(); save(); };

  const _ip = window.isGamePaused;
  window.isGamePaused = () => _ip() || ($('tutorial-modal') && $('tutorial-modal').classList.contains('open'));

  const _dp = window.damagePlayer;
  window.damagePlayer = function (n) {
    const p = state.player;
    if (p.hitCd > 0 || state.over) return _dp(n);
    const phoenixReady = state.petData.id === 'phoenix' && !state.reviveUsed;
    if (p.hp - n <= 0 && runRevives > 0 && !phoenixReady) {
      runRevives--;
      p.hp = p.maxHp * 0.5; p.hitCd = 2;
      enemies.forEach((e) => { e.hp -= 400; e.hitFlash = 0.2; });
      addBurstParticles(p.x, p.y, '#f472b6', 24);
      showToast('💖 ¡Segundo Aliento! Reviviste con el 50% de vida.');
      updateHpBar();
      return;
    }
    _dp(n);
  };

  function feverUi() {
    $('fever-fill').style.width = state.fever + '%';
    $('fever-txt').textContent = state.fever >= 100 ? '⚡ ¡TOCA PARA HIPER-PIXEL!' : `🔥 FIEBRE PIXEL ${state.fever}%`;
    if (state.fever >= 100) $('fever-bar-box').classList.add('ready');
  }
  const _hd = window.handleEnemyDeath;
  window.handleEnemyDeath = function (idx) {
    const en = enemies[idx];
    _hd(idx);
    if (!en) return;
    addEventPts(en.isBoss ? 100 : (en.isElite ? 20 : 1));
    ensureDaily(); F.daily.prog.kills = (F.daily.prog.kills || 0) + 1;
    if (Math.random() < mods().loot) lootDrops.push({ x: en.x + 8, y: en.y + 6, type: 'cash', val: 15 });
    if (bigLv('fever') && state.overdriveTime <= 0) { state.fever = Math.min(100, state.fever + 3 * bigLv('fever')); feverUi(); }
  };

  const _fw = window.finishWave;
  window.finishWave = function () {
    if (!state.over) {
      F.data += 3; addEventPts(15); addProg('waves', 1);
      showToast('🧪 +3 Datos de laboratorio');
    }
    _fw();
  };

  const _er = window.endRun;
  window.endRun = function (victory) {
    if (state.over) return;
    _er(victory);
    F.runs++;
    const dg = state.wave * 3 + Math.floor(state.kills / 10) + (victory ? 25 + state.cycle * 10 : 0);
    F.data += dg;
    addEventPts(victory ? 150 : 20);
    if (victory) addProg('wins', 1);
    const box = $('end-stats');
    if (box) box.insertAdjacentHTML('beforeend',
      `<div class="end-stat">Datos 🧪<b>+${dg}</b></div><div class="end-stat">Puntos Astral 🌟<b>+${victory ? 150 : 20}</b></div>`);
    doSave(); updateRail();
  };

  const _dwm = window.drawDetailedWeaponMesh;
  window.drawDetailedWeaponMesh = function (g, w) {
    if (w.id === 'solar') {
      g.strokeStyle = '#000'; g.lineWidth = 2;
      g.fillStyle = '#fde047'; g.fillRect(0, -6, 6, 12); g.strokeRect(0, -6, 6, 12);
      g.fillStyle = '#f8fafc'; g.beginPath(); g.moveTo(6, -4); g.lineTo(34, -2); g.lineTo(41, 0); g.lineTo(34, 2); g.lineTo(6, 4); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(253,224,71,0.5)'; g.beginPath(); g.arc(22, 0, 9, 0, Math.PI * 2); g.fill();
      return;
    }
    if (w.id === 'thunder') {
      g.strokeStyle = '#000'; g.lineWidth = 2;
      g.fillStyle = '#78350f'; g.fillRect(0, -2.5, 20, 5); g.strokeRect(0, -2.5, 20, 5);
      g.fillStyle = '#fde047'; g.fillRect(18, -9, 13, 18); g.strokeRect(18, -9, 13, 18);
      g.fillStyle = '#38bdf8'; g.fillRect(22, -5, 5, 10);
      return;
    }
    _dwm(g, w);
  };

  const _pdw = window.populateDrawers;
  window.populateDrawers = function () { _pdw(); decorateLocks(); };
  function decorateLocks() {
    const mark = (gridId, arr) => {
      document.querySelectorAll('#' + gridId + ' .item-card').forEach((c, i) => {
        const it = arr[i];
        if (it && it.owned === false) {
          c.style.filter = 'grayscale(0.85) brightness(0.8)';
          const b = c.querySelectorAll('.btn-action');
          b.forEach((x) => { x.disabled = true; });
          if (b[0]) b[0].textContent = '🔒 SOLO EN EVENTO';
          if (b[1]) b[1].style.display = 'none';
        }
      });
    };
    mark('weapons-grid', EVENT_WEAPONS);
    mark('pets-grid', SSS_PETS);
  }

  // ------------------------------------------------------------------- UI
  const css = document.createElement('style');
  css.textContent = `
    .fx-rail{position:absolute;left:8px;top:242px;z-index:11;display:flex;flex-direction:column;gap:6px}
    .fx-rbtn{width:46px;height:46px;border-radius:13px;border:2.5px solid #000;background:linear-gradient(180deg,#3a4375,#1d2243);color:#fff;font-size:1.2rem;position:relative;cursor:pointer;box-shadow:inset 0 2px 0 rgba(255,255,255,.2),0 3px 0 #000;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;font-family:inherit}
    .fx-rbtn small{font-size:.5rem;font-weight:800;margin-top:2px}
    .fx-rbtn:active{transform:translateY(2px)}
    .fx-dot{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;border-radius:9px;background:#ef4444;border:2px solid #000;font-size:.55rem;font-weight:800;display:none;align-items:center;justify-content:center;padding:0 3px}
    .fx-skills{position:absolute;left:12px;bottom:96px;z-index:11;display:flex;gap:8px}
    .fx-skill{width:56px;height:56px;border-radius:16px;border:3px solid #000;background:linear-gradient(180deg,#38bdf8,#1e40af);color:#fff;font-size:1.4rem;cursor:pointer;position:relative;box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 4px 0 #000;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;font-family:inherit}
    .fx-skill small{font-size:.55rem;font-weight:800}
    .fx-skill.cd{filter:grayscale(.8) brightness(.7)}
    .fx-cur{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;font-family:var(--font-num);font-weight:800;font-size:.76rem}
    .fx-cur span{background:#0d101d;border:2px solid #3b4266;border-radius:10px;padding:2px 8px}
    .fx-sec{font-weight:800;color:#fde047;margin:10px 0 6px;font-size:.88rem}
    .fx-note{font-size:.72rem;color:#cbd5e1;margin-bottom:8px}
    .fx-row{display:flex;align-items:center;gap:8px;background:#1d2243;border:2px solid #3b4266;border-radius:12px;padding:7px 9px;margin-bottom:6px}
    .fx-row.done{border-color:#4ade80}
    .fx-row .ic{font-size:1.5rem;width:36px;text-align:center}
    .fx-row .tx{flex:1;font-size:.72rem;color:#cbd5e1}
    .fx-row .tx b{display:block;color:#fef08a;font-size:.8rem}
    .fx-mini{padding:5px 9px;font-size:.7rem;border:2px solid #000;border-radius:9px;font-weight:800;cursor:pointer;background:linear-gradient(180deg,#4ade80,#16a34a);color:#052e16;box-shadow:0 3px 0 #000;font-family:inherit;white-space:nowrap}
    .fx-mini.gold{background:linear-gradient(180deg,#fde047,#ca8a04);color:#1c1917}
    .fx-mini.blue{background:linear-gradient(180deg,#38bdf8,#0369a1);color:#fff}
    .fx-mini:disabled{opacity:.45;filter:grayscale(.6);cursor:default}
    .fx-prog{height:10px;background:#0d101d;border:2px solid #000;border-radius:6px;overflow:hidden;margin-top:3px}
    .fx-prog i{display:block;height:100%;background:linear-gradient(90deg,#38bdf8,#a855f7)}
    .fx-hero{background:linear-gradient(180deg,#3b0764,#1e1b4b);border:2.5px solid #f472b6;border-radius:16px;padding:10px;text-align:center;margin-bottom:8px;box-shadow:0 5px 0 #000}
    .fx-hero .big{font-family:var(--font-num);font-size:1.7rem;font-weight:800;color:#fde047;text-shadow:0 2px 0 #000}
    .fx-input{width:100%;padding:7px;border-radius:10px;border:2px solid #475282;background:#0d101d;color:#fff;font-family:inherit;font-size:.8rem;margin-bottom:6px;user-select:text;-webkit-user-select:text}
    .fx-locked{filter:grayscale(.9) brightness(.75)}
    #tutorial-modal{position:absolute;inset:0;z-index:60;background:rgba(6,8,18,.9);display:none;justify-content:center;align-items:center;padding:20px}
    #tutorial-modal.open{display:flex}
  `;
  document.head.appendChild(css);

  function shell(id, title) {
    const d = document.createElement('div');
    d.className = 'modal-drawer';
    d.id = 'drawer-' + id;
    d.innerHTML = `<div class="drawer-top"><div class="drawer-heading">${title}</div><button class="btn-close" onclick="openTab('battle')">CERRAR ✕</button></div><div class="fx-cur" id="cur-${id}"></div><div id="body-${id}"></div>`;
    frame.appendChild(d);
  }
  [['event', '🌌 FESTIVAL ASTRAL SSS'], ['lab', '🧪 LABORATORIO'], ['skills', '✨ HABILIDADES'],
    ['skins', '🎨 SKINS'], ['clan', '🛡️ CLAN'], ['missions', '📜 MISIONES Y RECOMPENSAS']].forEach((a) => shell(a[0], a[1]));

  const rail = document.createElement('div');
  rail.className = 'fx-rail';
  [['event', '🌌', 'EVENTO'], ['lab', '🧪', 'LAB'], ['clan', '🛡️', 'CLAN'], ['missions', '📜', 'MISIÓN'], ['skins', '🎨', 'SKINS'], ['skills', '✨', 'HABIL.']]
    .forEach((a) => {
      const b = document.createElement('button');
      b.className = 'fx-rbtn';
      b.id = 'rail-' + a[0];
      b.innerHTML = `${a[1]}<small>${a[2]}</small><span class="fx-dot" id="dot-${a[0]}"></span>`;
      b.onclick = () => openTab(a[0]);
      rail.appendChild(b);
    });
  frame.appendChild(rail);

  const sk = document.createElement('div');
  sk.className = 'fx-skills';
  sk.innerHTML = '<button class="fx-skill" id="fxs-0"></button><button class="fx-skill" id="fxs-1"></button>';
  frame.appendChild(sk);
  $('fxs-0').onclick = () => useSkill(0);
  $('fxs-1').onclick = () => useSkill(1);
  window.addEventListener('keydown', (e) => { if (e.key === 'q') useSkill(0); if (e.key === 'e') useSkill(1); });

  const tut = document.createElement('div');
  tut.id = 'tutorial-modal';
  frame.appendChild(tut);

  function curBar(id) {
    $('cur-' + id).innerHTML = `<span>💎 ${fmt(state.gems)}</span><span>🎟️ ${fmt(state.tickets)}</span><span>🧪 ${fmt(F.data)}</span><span>🌟 ${fmt(F.event.points)}</span>`;
  }
  const setDot = (id, n) => { const d = $('dot-' + id); d.style.display = n ? 'flex' : 'none'; d.textContent = n > 9 ? '!' : n; };

  function updateRail() {
    ensureDaily();
    const evClaim = MILESTONES.filter((m) => F.event.points >= m.p && !F.event.claimed.includes(m.p)).length;
    setDot('event', evClaim);
    const done = MISSIONS.filter((m) => (F.daily.prog[m.id] || 0) >= m.goal && !F.daily.claimed[m.id]).length;
    setDot('missions', done + (F.login.claimed ? 0 : 1));
    setDot('lab', LAB.some((t) => labLv(t.id) < t.max && F.data >= labCost(t)) ? 1 : 0);
    setDot('clan', F.clan && F.clan.bossHp <= 0 ? 1 : 0);
    ['0', '1'].forEach((i) => {
      const s = SKILLS.find((x) => x.id === F.skills.equipped[i]);
      const el = $('fxs-' + i);
      if (!s) { el.innerHTML = '➕'; return; }
      const cd = Math.ceil(skillCd[s.id] || 0);
      el.className = 'fx-skill' + (cd > 0 ? ' cd' : '');
      el.innerHTML = `${s.icon}<small>${cd > 0 ? cd + 's' : (i === '0' ? 'Q' : 'E')}</small>`;
    });
  }

  // ---------------------------------------------------------- RENDERERS
  const R = {};
  const body = (id) => $('body-' + id);
  const power = () => 12500 + state.gearLevel * 240 + state.weaponData.level * 650 + state.petData.level * 800;

  // ---- EVENT
  R.event = function () {
    ensureDaily(); curBar('event');
    const left = Math.max(0, F.event.start + EVENT_DAYS * DAY - Date.now());
    const d = Math.floor(left / DAY), h = Math.floor((left % DAY) / 3600000);
    const E = F.event;
    let html = `<div class="fx-hero"><div style="font-weight:800">🌌 Festival Astral · Temporada ${E.season}</div>
      <div class="big">🌟 ${fmt(E.points)} puntos</div>
      <div class="fx-note">Termina en ${d}d ${h}h · Gana puntos matando enemigos, superando oleadas, derrotando jefes e invocando.</div></div>
      <div class="fx-sec">🎁 Camino de recompensas</div>`;
    MILESTONES.forEach((m) => {
      const ok = E.points >= m.p, got = E.claimed.includes(m.p);
      const big = m.r.wpn || m.r.pet || m.r.skin;
      html += `<div class="fx-row ${got ? 'done' : ''}"><div class="ic">${m.r.wpn ? '⚔️' : (m.r.pet ? '🐱' : (m.r.skin ? '🎨' : '🎁'))}</div>
        <div class="tx"><b>${fmt(m.p)} pts ${big ? '· PREMIO MAYOR' : ''}</b>${grantPreview(m.r)}<div class="fx-prog"><i style="width:${Math.min(100, E.points / m.p * 100)}%"></i></div></div>
        <button class="fx-mini ${big ? 'gold' : ''}" ${ok && !got ? '' : 'disabled'} onclick="FX.claimMilestone(${m.p})">${got ? '✓' : 'RECLAMAR'}</button></div>`;
    });
    html += `<div class="fx-sec">🔮 Invocación Astral (garantías)</div>
      <div class="fx-note">Garantía Mascota SSS+ en <b>${20 - E.pityPet}</b> tiradas · Garantía Arma SSS en <b>${50 - E.pityWpn}</b> tiradas. Cada tirada da +10 puntos.</div>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <button class="btn-action" onclick="FX.summon(1)">🎟️ x1 (20 fichas o 💎150)</button>
        <button class="btn-action upgrade" style="margin-top:0" onclick="FX.summon(10)">💎 x10 (1350)</button></div>
      <div id="astral-results" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px"></div>`;
    body('event').innerHTML = html;
  };
  function pullOnce() {
    const E = F.event;
    E.pityPet++; E.pityWpn++; E.points += 10;
    let item = null, label = '';
    if (E.pityWpn >= 50) { item = findItem('wpn', 'thunder'); E.pityWpn = 0; }
    else if (E.pityPet >= 20) { item = findItem('pet', 'galaxy'); E.pityPet = 0; }
    else {
      const r = Math.random();
      if (r < 0.012) { item = findItem('wpn', 'thunder'); E.pityWpn = 0; }
      else if (r < 0.035) { item = findItem('pet', 'galaxy'); E.pityPet = 0; }
      else if (r < 0.06) item = findItem('pet', 'nebula');
      else if (r < 0.45) { F.data += 5; return { icon: '🧪', label: '+5' }; }
      else if (r < 0.75) { state.tickets += 8; return { icon: '🎟️', label: '+8' }; }
      else { state.gems += 60; return { icon: '💎', label: '+60' }; }
    }
    label = giveItem(item);
    return { icon: item.icon, label: label.includes('NUEVA') ? 'NUEVA' : '+1 NV', rare: true };
  }
  const FX = window.FX = {};
  FX.summon = function (n) {
    if (n === 1) {
      if (state.tickets >= 20) state.tickets -= 20;
      else if (state.gems >= 150) state.gems -= 150;
      else return showToast('¡Necesitas 20 🎟️ o 150 💎!');
    } else {
      if (state.gems < 1350) return showToast('¡Necesitas 1350 💎!');
      state.gems -= 1350;
    }
    const res = [];
    for (let i = 0; i < n; i++) res.push(pullOnce());
    F.event.pulls += n;
    refreshTopHUD(); save(); updateRail();
    R.event();
    $('astral-results').innerHTML = res.map((r) =>
      `<div style="background:#252b48;border:2px solid ${r.rare ? '#fde047' : '#475282'};border-radius:10px;padding:5px;text-align:center"><div style="font-size:1.3rem">${r.icon}</div><div style="font-size:.6rem;font-weight:800;color:#fde047">${r.label}</div></div>`).join('');
    if (res.some((r) => r.rare)) { showToast('🌌 ¡Obtuviste un objeto SSS del Festival!'); sfx('win'); }
  };
  FX.claimMilestone = function (p) {
    const m = MILESTONES.find((x) => x.p === p);
    if (!m || F.event.claimed.includes(p) || F.event.points < p) return;
    F.event.claimed.push(p);
    showToast('🎁 ' + grant(m.r));
    sfx('level');
    R.event();
  };

  // ---- LAB
  R.lab = function () {
    curBar('lab');
    let html = `<div class="fx-note">Gana 🧪 Datos al superar oleadas y al terminar partidas. Las mejoras son permanentes.</div><div class="fx-sec">🔬 Laboratorio</div>`;
    LAB.forEach((t) => {
      const lv = labLv(t.id), c = labCost(t), maxed = lv >= t.max;
      html += `<div class="fx-row"><div class="ic">${t.icon}</div><div class="tx"><b>${t.name} · NV ${lv}/${t.max}</b>${t.desc}<div class="fx-prog"><i style="width:${lv / t.max * 100}%"></i></div></div>
        <button class="fx-mini blue" ${maxed || F.data < c ? 'disabled' : ''} onclick="FX.buyLab('${t.id}')">${maxed ? 'MAX' : '🧪 ' + c}</button></div>`;
    });
    html += `<div class="fx-sec">🏛️ Gran Laboratorio ${bigUnlocked() ? '' : '🔒'}</div>`;
    if (!bigUnlocked()) html += `<div class="fx-note">Se desbloquea al derrotar al jefe de la oleada 5 (ganar un ciclo).</div>`;
    BIG.forEach((t) => {
      const lv = bigLv(t.id), maxed = lv >= t.max, dc = t.data * (lv + 1), gc = t.gems * (lv + 1);
      html += `<div class="fx-row ${bigUnlocked() ? '' : 'fx-locked'}"><div class="ic">${t.icon}</div><div class="tx"><b>${t.name} · NV ${lv}/${t.max}</b>${t.desc}</div>
        <button class="fx-mini gold" ${!bigUnlocked() || maxed || F.data < dc || state.gems < gc ? 'disabled' : ''} onclick="FX.buyBig('${t.id}')">${maxed ? 'MAX' : `🧪${dc} 💎${gc}`}</button></div>`;
    });
    body('lab').innerHTML = html;
  };
  FX.buyLab = function (id) {
    const t = LAB.find((x) => x.id === id), c = labCost(t);
    if (labLv(id) >= t.max || F.data < c) return;
    F.data -= c; F.lab[id] = labLv(id) + 1;
    if (id === 'fire') applyFire();
    if (id === 'magnet') applyMagnet();
    refreshTopHUD(); sfx('build'); save(); updateRail(); R.lab();
  };
  FX.buyBig = function (id) {
    const t = BIG.find((x) => x.id === id), lv = bigLv(id);
    const dc = t.data * (lv + 1), gc = t.gems * (lv + 1);
    if (!bigUnlocked() || lv >= t.max || F.data < dc || state.gems < gc) return;
    F.data -= dc; state.gems -= gc; F.big[id] = lv + 1;
    showToast(`🏛️ ${t.name} mejorado (se aplica desde la próxima partida)`);
    refreshTopHUD(); sfx('level'); save(); R.lab();
  };

  // ---- SKILLS
  R.skills = function () {
    curBar('skills');
    let html = `<div class="fx-note">Compra habilidades activas, mejóralas y equipa 2 en tu pantalla de combate (teclas Q / E). Tienen tiempo de recarga.</div>`;
    SKILLS.forEach((s) => {
      const L = skLv(s.id), owned = L > 0, up = 100 * (L || 1);
      const slot = F.skills.equipped.indexOf(s.id);
      html += `<div class="fx-row ${owned ? '' : 'fx-locked'}"><div class="ic">${s.icon}</div><div class="tx"><b>${s.name} ${owned ? '· NV ' + L + '/5' : ''}</b>${s.desc(L || 1)} · Recarga ${s.cd}s${slot >= 0 ? ' · <span style="color:#4ade80">Slot ' + (slot + 1) + '</span>' : ''}</div>
        <div style="display:flex;flex-direction:column;gap:4px">
        ${owned ? `<button class="fx-mini" onclick="FX.equipSkill('${s.id}',0)">SLOT 1</button><button class="fx-mini" onclick="FX.equipSkill('${s.id}',1)">SLOT 2</button>
          <button class="fx-mini gold" ${L >= 5 || state.gems < up ? 'disabled' : ''} onclick="FX.upSkill('${s.id}')">${L >= 5 ? 'MAX' : '⬆️ 💎' + up}</button>`
          : `<button class="fx-mini gold" ${state.gems < s.price ? 'disabled' : ''} onclick="FX.buySkill('${s.id}')">COMPRAR 💎${s.price}</button>`}
        </div></div>`;
    });
    body('skills').innerHTML = html;
  };
  FX.buySkill = function (id) {
    const s = SKILLS.find((x) => x.id === id);
    if (skLv(id) || state.gems < s.price) return;
    state.gems -= s.price; F.skills.owned[id] = 1;
    showToast(`✨ Habilidad comprada: ${s.name}`);
    refreshTopHUD(); save(); updateRail(); R.skills();
  };
  FX.upSkill = function (id) {
    const L = skLv(id), c = 100 * (L || 1);
    if (!L || L >= 5 || state.gems < c) return;
    state.gems -= c; F.skills.owned[id] = L + 1;
    refreshTopHUD(); sfx('build'); save(); R.skills();
  };
  FX.equipSkill = function (id, slot) {
    const other = F.skills.equipped.indexOf(id);
    if (other >= 0) F.skills.equipped[other] = F.skills.equipped[slot];
    F.skills.equipped[slot] = id;
    save(); updateRail(); R.skills();
  };

  // ---- SKINS
  R.skins = function () {
    curBar('skins');
    let html = `<div class="fx-note">Cambia el aspecto de tus héroes. Algunas skins tienen partículas especiales.</div><div class="detailed-grid">`;
    SKINS.forEach((s) => {
      const owned = !!F.skins.owned[s.id], eq = F.skins.equipped[s.hero] === s.id;
      html += `<div class="item-card ${eq ? 'equipped' : ''}"><span class="card-ribbon">${s.hero.toUpperCase()}</span>
        <div class="portrait-stage"><canvas width="76" height="76" data-skin="${s.id}"></canvas></div>
        <div class="item-title" style="font-size:.78rem">${s.name}</div>
        ${owned ? `<button class="btn-action" onclick="FX.equipSkin('${s.id}')">${eq ? '✓ EQUIPADA' : 'EQUIPAR'}</button>`
          : (s.price ? `<button class="btn-action upgrade" ${state.gems < s.price ? 'disabled' : ''} onclick="FX.buySkin('${s.id}')">💎 ${s.price}</button>` : `<button class="btn-action" disabled>🌌 SOLO EVENTO</button>`)}</div>`;
    });
    html += '</div>';
    body('skins').innerHTML = html;
    document.querySelectorAll('#body-skins canvas').forEach((c) => {
      const s = SKINS.find((x) => x.id === c.dataset.skin);
      const hero = HEROES.find((h) => h.id === s.hero);
      drawDetailedHero(c.getContext('2d'), 38, 50, 1.1, Object.assign({}, hero, s.colors, { _skin: true }), state.weaponData, 20, 0, 0, 0, false);
    });
  };
  FX.buySkin = function (id) {
    const s = SKINS.find((x) => x.id === id);
    if (F.skins.owned[id] || !s.price || state.gems < s.price) return;
    state.gems -= s.price; F.skins.owned[id] = true; F.skins.equipped[s.hero] = id;
    showToast(`🎨 Skin desbloqueada: ${s.name}`);
    refreshTopHUD(); sfx('level'); save(); R.skins();
  };
  FX.equipSkin = function (id) {
    const s = SKINS.find((x) => x.id === id);
    F.skins.equipped[s.hero] = F.skins.equipped[s.hero] === id ? null : id;
    refreshTopHUD(); save(); R.skins();
  };

  // ---- CLAN (simulado offline con jugadores NPC)
  const CLANS = [['Patos Rebeldes', 'PTR', 8000], ['Pixel Legends', 'PXL', 14000], ['Zombie Hunters', 'ZMB', 20000], ['Neon Dragons', 'NDR', 26000]];
  const NPC = ['Kazuma', 'Lía', 'Dr.Quack', 'Mika', 'Rex', 'Nova', 'Bruno', 'Sakura', 'Pip', 'Orion', 'Zed', 'Tango', 'Luna', 'Max'];
  const bossMax = (c) => 3000000 * c.bossTier + 400000 * c.level;
  function makeMembers(seed, req) {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const r = ((i * 7919 + seed * 104729) % 1000) / 1000;
      out.push({ n: NPC[(i + seed * 3) % NPC.length] + (i > 10 ? '77' : ''), p: Math.round(req * (0.95 + r * 0.8)), role: i === 0 ? 'Líder' : (i < 3 ? 'Oficial' : 'Miembro') });
    }
    return out;
  }
  function newClan(name, tag, seed, req) {
    const c = { name, tag, level: 1, xp: 0, bossTier: 1, bossHp: 0, members: makeMembers(seed, req), lastSim: Date.now(),
      att: { date: '', left: 3 }, don: { date: '', n: 0 }, feed: ['Bienvenido al clan, ' + 'Duke' + '!', 'Lía: ¡Hoy matamos al jefe!', 'Rex: Recuerden donar para subir de nivel.'] };
    c.bossHp = bossMax(c);
    return c;
  }
  function simClan() {
    const c = F.clan;
    if (!c) return;
    const hours = Math.min(48, (Date.now() - c.lastSim) / 3600000);
    if (hours > 0.02 && c.bossHp > 0) {
      const npcPower = c.members.reduce((a, m) => a + m.p, 0);
      c.bossHp = Math.max(0, c.bossHp - npcPower * 0.9 * hours);
    }
    c.lastSim = Date.now();
    const t = todayKey();
    if (c.att.date !== t) c.att = { date: t, left: 3 };
    if (c.don.date !== t) c.don = { date: t, n: 0 };
  }
  R.clan = function () {
    curBar('clan');
    const c = F.clan;
    if (!c) {
      let html = `<div class="fx-note">Únete a un clan para ganar bonos de daño y vida, donar y derrotar jefes en equipo. Tu poder: <b>${fmt(power())}</b></div><div class="fx-sec">Clanes recomendados</div>`;
      CLANS.forEach((cl, i) => {
        const ok = power() >= cl[2];
        html += `<div class="fx-row ${ok ? '' : 'fx-locked'}"><div class="ic">🛡️</div><div class="tx"><b>[${cl[1]}] ${cl[0]}</b>12/20 miembros · Requiere ⚔️ ${fmt(cl[2])}</div>
          <button class="fx-mini" ${ok ? '' : 'disabled'} onclick="FX.joinClan(${i})">UNIRME</button></div>`;
      });
      html += `<div class="fx-sec">Crear mi propio clan (💎 500)</div>
        <input class="fx-input" id="clan-name" maxlength="16" placeholder="Nombre del clan">
        <button class="btn-action upgrade" onclick="FX.createClan()">🛡️ CREAR CLAN</button>`;
      body('clan').innerHTML = html;
      return;
    }
    simClan();
    const need = 400 * c.level;
    const me = { n: 'Tú (Duke)', p: power(), role: 'Miembro', me: true };
    const list = [...c.members, me].sort((a, b) => b.p - a.p);
    const dead = c.bossHp <= 0;
    let html = `<div class="fx-hero"><div style="font-weight:800">[${c.tag}] ${c.name} · Nivel ${c.level}</div>
      <div class="fx-note">Bonos: +${c.level * 2}% daño · +${c.level * 3}% vida</div>
      <div class="fx-prog"><i style="width:${c.level >= 10 ? 100 : c.xp / need * 100}%"></i></div>
      <div class="fx-note">${c.level >= 10 ? 'Nivel máximo' : `XP ${c.xp}/${need}`}</div>
      <div style="display:flex;gap:6px;justify-content:center">
        <button class="fx-mini gold" ${c.don.n >= 5 || state.gems < 100 || c.level >= 10 ? 'disabled' : ''} onclick="FX.donate('gems')">DONAR 💎100 (${5 - c.don.n}/5)</button>
        <button class="fx-mini" ${state.tickets < 10 || c.level >= 10 ? 'disabled' : ''} onclick="FX.donate('tickets')">DONAR 🎟️10</button></div></div>
      <div class="fx-sec">👹 Jefe del Clan · Tier ${c.bossTier}</div>
      <div class="fx-row"><div class="ic">👹</div><div class="tx"><b>${dead ? '¡Jefe derrotado!' : fmt(c.bossHp) + ' / ' + fmt(bossMax(c)) + ' HP'}</b>Intentos hoy: ${c.att.left}/3 · Tus compañeros atacan mientras no estás.
        <div class="fx-prog"><i style="width:${Math.max(0, c.bossHp / bossMax(c) * 100)}%"></i></div></div>
        ${dead ? '<button class="fx-mini gold" onclick="FX.clanReward()">RECLAMAR</button>' : `<button class="fx-mini" ${c.att.left <= 0 ? 'disabled' : ''} onclick="FX.clanAttack()">ATACAR</button>`}</div>
      <div class="fx-sec">👥 Miembros</div>`;
    list.forEach((m, i) => {
      html += `<div class="fx-row ${m.me ? 'done' : ''}"><div class="ic">${i + 1}</div><div class="tx"><b>${m.n}</b>${m.role} · ⚔️ ${fmt(m.p)}</div></div>`;
    });
    html += `<div class="fx-sec">💬 Mensajes</div>` + c.feed.map((f) => `<div class="fx-note">• ${f}</div>`).join('') +
      `<button class="btn-action" style="background:linear-gradient(180deg,#f87171,#dc2626);color:#fff;margin-top:8px" onclick="FX.leaveClan()">Salir del clan</button>`;
    body('clan').innerHTML = html;
  };
  FX.joinClan = function (i) {
    const cl = CLANS[i];
    if (power() < cl[2]) return;
    F.clan = newClan(cl[0], cl[1], i + 1, cl[2]);
    showToast(`🛡️ Te uniste a [${cl[1]}] ${cl[0]}`);
    refreshTopHUD(); save(); R.clan();
  };
  FX.createClan = function () {
    const name = ($('clan-name').value || '').trim();
    if (name.length < 3) return showToast('El nombre debe tener al menos 3 letras.');
    if (state.gems < 500) return showToast('¡Necesitas 500 💎!');
    state.gems -= 500;
    F.clan = newClan(name, name.slice(0, 3).toUpperCase(), 5, 6000);
    F.clan.members[0] = { n: 'Tú (Duke)', p: power(), role: 'Líder' };
    showToast(`🛡️ Clan "${name}" creado.`);
    refreshTopHUD(); save(); R.clan();
  };
  FX.leaveClan = function () { F.clan = null; save(); updateRail(); R.clan(); };
  FX.donate = function (kind) {
    const c = F.clan;
    if (!c || c.level >= 10) return;
    if (kind === 'gems') { if (c.don.n >= 5 || state.gems < 100) return; state.gems -= 100; c.don.n++; c.xp += 150; }
    else { if (state.tickets < 10) return; state.tickets -= 10; c.xp += 60; }
    while (c.level < 10 && c.xp >= 400 * c.level) { c.xp -= 400 * c.level; c.level++; showToast(`🛡️ ¡El clan subió a nivel ${c.level}!`); }
    refreshTopHUD(); sfx('build'); save(); R.clan();
  };
  FX.clanAttack = function () {
    const c = F.clan;
    if (!c || c.att.left <= 0 || c.bossHp <= 0) return;
    const dmg = Math.round(power() * (18 + Math.random() * 12));
    c.bossHp = Math.max(0, c.bossHp - dmg);
    c.att.left--;
    c.feed.unshift(`Tú infligiste ${fmt(dmg)} de daño al jefe.`);
    c.feed = c.feed.slice(0, 5);
    sfx('ult'); showToast('💥 ' + fmt(dmg) + ' de daño al jefe del clan');
    save(); updateRail(); R.clan();
  };
  FX.clanReward = function () {
    const c = F.clan;
    if (!c || c.bossHp > 0) return;
    showToast('🎁 ' + grant({ gems: 400 * c.bossTier, tickets: 40, data: 20 }));
    c.bossTier++; c.bossHp = bossMax(c);
    c.feed.unshift('¡Jefe derrotado! Aparece un jefe más fuerte.');
    sfx('win'); save(); updateRail(); R.clan();
  };

  // ---- MISSIONS + LOGIN
  R.missions = function () {
    ensureDaily(); curBar('missions');
    const li = (F.login.streak - 1) % 7;
    let html = `<div class="fx-sec">📅 Bono de inicio de sesión · Racha ${F.login.streak}</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px">`;
    LOGIN_REWARDS.forEach((r, i) => {
      const today = i === li, past = i < li || (today && F.login.claimed);
      html += `<div style="background:${today ? '#4c1d95' : '#1d2243'};border:2px solid ${today ? '#fde047' : '#3b4266'};border-radius:8px;padding:3px;text-align:center;font-size:.55rem;opacity:${past ? .5 : 1}"><b>D${i + 1}</b><br>${past ? '✓' : grantPreview(r).replace(/ \+ /g, '<br>')}</div>`;
    });
    html += `</div><button class="btn-action" ${F.login.claimed ? 'disabled' : ''} onclick="FX.claimLogin()">${F.login.claimed ? '✓ Ya reclamado hoy' : '🎁 RECLAMAR BONO DE HOY'}</button>
      <div class="fx-sec">📜 Misiones diarias</div>`;
    let all = true;
    MISSIONS.forEach((m) => {
      const v = Math.min(m.goal, F.daily.prog[m.id] || 0), ok = v >= m.goal, got = F.daily.claimed[m.id];
      if (!got) all = false;
      html += `<div class="fx-row ${got ? 'done' : ''}"><div class="ic">${m.icon}</div><div class="tx"><b>${m.name}</b>${grantPreview(m.r)} · ${v}/${m.goal}<div class="fx-prog"><i style="width:${v / m.goal * 100}%"></i></div></div>
        <button class="fx-mini" ${ok && !got ? '' : 'disabled'} onclick="FX.claimMission('${m.id}')">${got ? '✓' : 'RECLAMAR'}</button></div>`;
    });
    html += `<div class="fx-row ${F.daily.chest ? 'done' : ''}"><div class="ic">🎁</div><div class="tx"><b>Cofre diario</b>Completa y reclama las 5 misiones · 💎300 + 🎟️40</div>
      <button class="fx-mini gold" ${all && !F.daily.chest ? '' : 'disabled'} onclick="FX.claimChest()">${F.daily.chest ? '✓' : 'ABRIR'}</button></div>
      <button class="btn-action upgrade" style="margin-top:10px" onclick="FX.tutorial(0)">❓ VER TUTORIAL</button>`;
    body('missions').innerHTML = html;
  };
  FX.claimLogin = function () {
    if (F.login.claimed) return;
    F.login.claimed = true;
    showToast('🎁 ' + grant(LOGIN_REWARDS[(F.login.streak - 1) % 7]));
    sfx('level'); R.missions();
  };
  FX.claimMission = function (id) {
    const m = MISSIONS.find((x) => x.id === id);
    if ((F.daily.prog[id] || 0) < m.goal || F.daily.claimed[id]) return;
    F.daily.claimed[id] = true;
    showToast('🎁 ' + grant(m.r)); sfx('coin'); R.missions();
  };
  FX.claimChest = function () {
    if (F.daily.chest) return;
    F.daily.chest = true;
    showToast('🎁 ' + grant({ gems: 300, tickets: 40 })); sfx('win'); R.missions();
  };

  // ---- TUTORIAL
  const STEPS = [
    ['🕹️', 'Muévete', 'Usa el joystick (o WASD). Tu héroe dispara solo al enemigo más cercano. ¡No te quedes quieto!'],
    ['💵', 'Recoge el botín', 'Los enemigos sueltan billetes 💵 (se apilan en tu mochila), gemas de XP 💎 y fichas 🎟️. Acércate y el imán los absorbe.'],
    ['🏗️', 'Construye de día', 'Al terminar una oleada llega el DÍA. Párate sobre los círculos para gastar billetes y levantar torretas. El portal 🌀 invoca un élite con fichas.'],
    ['⚡', 'Sube de nivel', 'Al llenar la barra azul elige 1 de 4 mejoras. Mata enemigos para llenar la Fiebre 🔥 y activa HIPER ⚡; usa la ULTI de tu mascota SSS 🐉.'],
    ['✨', 'Habilidades', 'Los botones de abajo a la izquierda (Q / E) lanzan tus habilidades activas. Compra más y mejóralas en el menú ✨.'],
    ['🌌', 'Meta-juego', 'Laboratorio 🧪, Festival Astral 🌌 (armas y mascotas SSS), Clan 🛡️, Skins 🎨 y Misiones 📜 están en el panel izquierdo. ¡Derrota al jefe de la oleada 5!']
  ];
  FX.tutorial = function (i) {
    if (i >= STEPS.length) { F.tutorialDone = true; tut.classList.remove('open'); save(); return; }
    const s = STEPS[i];
    openTab('battle');
    tut.innerHTML = `<div class="end-card"><div style="font-size:3rem">${s[0]}</div><div class="end-title" style="font-size:1.3rem">${s[1]}</div>
      <div class="end-sub" style="font-size:.9rem;margin:10px 0 16px">${s[2]}</div>
      <div style="font-size:.7rem;color:#94a3b8;margin-bottom:10px">Paso ${i + 1} de ${STEPS.length}</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="fx-mini" style="background:#475282;color:#fff" onclick="FX.tutorial(${STEPS.length})">OMITIR</button>
        <button class="fx-mini gold" onclick="FX.tutorial(${i + 1})">${i === STEPS.length - 1 ? '¡A JUGAR!' : 'SIGUIENTE ➜'}</button></div></div>`;
    tut.classList.add('open');
  };

  // -------------------------------------------------------- OPENTAB HOOK
  const _ot = window.openTab;
  window.openTab = function (t) {
    _ot(t);
    if (R[t]) R[t]();
    updateRail();
  };

  // ----------------------------------------------------------------- TICK
  let lastPad = 0;
  function padSum() { return basePads.reduce((a, p) => a + (p.isPortal ? 0 : p.level), 0); }
  let sparkT = 0;
  setInterval(() => {
    if (isGamePaused()) return;
    const dt = 0.1;
    Object.keys(skillCd).forEach((k) => { skillCd[k] = Math.max(0, skillCd[k] - dt); });
    const m = mods();
    const p = state.player;
    if (m.regen > 0 && !state.over && p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * m.regen * dt); updateHpBar(); }
    const ps = padSum();
    if (ps > lastPad) addProg('builds', ps - lastPad);
    lastPad = ps;
    const skin = SKINS.find((s) => s.id === F.skins.equipped[state.heroData.id]);
    sparkT += dt;
    if (skin && skin.spark && sparkT > 0.3) { sparkT = 0; addBurstParticles(p.x + (Math.random() - 0.5) * 20, p.y + 10, skin.spark, 1); }
    updateRail();
  }, 100);

  // ----------------------------------------------------------------- INIT
  load();
  ensureDaily();
  applyFire();
  applyMagnet();
  state.cash += labLv('startcash') * 15;
  state.extraShots += bigLv('twin');
  state.orbitalSaws += bigLv('saw');
  runRevives = bigLv('revive');
  refreshTopHUD();
  state.player.hp = state.player.maxHp;
  updateHpBar();
  updateRail();
  if (!F.tutorialDone) setTimeout(() => FX.tutorial(0), 600);
  window.__FEATURES = F; // debug / handoff
})();
