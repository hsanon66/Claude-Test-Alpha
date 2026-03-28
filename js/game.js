// ═══════════════════════════════════════════════════════════════
//  game.js  –  Crystal Archipelago  –  Part A: Scene & Island
// ═══════════════════════════════════════════════════════════════
'use strict';

// ── §1  CONSTANTS ────────────────────────────────────────────
const GRID     = 22;
const CELL_SZ  = 2;
const HALF     = GRID / 2;
const ISLAND_R = 8.3;

const CT = { WATER:0, LAND:1, BEACH:2, FOREST:3, ROCK:4, CRYSTAL:5, BUILDING:6 };

const BDEF = {
  wizard_tower:   { name:'Wizard Tower',  hp:120, cost:{wood:30,stone:20},       dmg:22, range:22,  fireRate:1.8,  proj:'magic'  },
  cannon_tower:   { name:'Cannon Tower',  hp:160, cost:{wood:20,stone:40},       dmg:55, range:18,  fireRate:0.55, proj:'cannon' },
  wall:           { name:'Stone Wall',    hp:350, cost:{stone:15},               dmg:0,  range:0,   fireRate:0,    proj:null     },
  barracks:       { name:'Barracks',      hp:80,  cost:{wood:40,stone:20},       dmg:0,  range:0,   fireRate:0,    proj:null     },
  shipyard:       { name:'Shipyard',      hp:80,  cost:{wood:60,stone:20},       dmg:0,  range:0,   fireRate:0,    proj:null     },
  crystal_forge:  { name:'Crystal Forge', hp:60,  cost:{stone:25,crystal:20},    dmg:0,  range:0,   fireRate:0,    proj:null     },
  lighthouse:     { name:'Lighthouse',    hp:80,  cost:{wood:40,stone:20},       dmg:0,  range:0,   fireRate:0,    proj:null, rangeBonus:4 },
  harbor:         { name:'Harbor',        hp:100, cost:{wood:50,stone:30},       dmg:0,  range:0,   fireRate:0,    proj:null, goldRate:10  },
  ballista_tower: { name:'Ballista Tower',hp:110, cost:{wood:30,crystal:15},     dmg:70, range:28,  fireRate:0.2,  proj:'cannon', pierce:true },
};

const SDEFS = {
  fireball: { cost:{crystal:5},  cd:15 },
  shield:   { cost:{crystal:3},  cd:30 },
  storm:    { cost:{crystal:10}, cd:45 },
  summon:   { cost:{crystal:8},  cd:60 },
  tidal:    { cost:{crystal:12}, cd:50, act:2 },
  chain:    { cost:{crystal:8},  cd:35, act:2 },
};

// Boon definitions for chapter-complete selection
const BOONS = [
  { id:'dmg_up',    icon:'⚔',  name:'Warrior\'s Resolve',  desc:'+25% tower damage for rest of act',    apply(g){ g.boonMods.dmg  = (g.boonMods.dmg||1)*1.25; } },
  { id:'range_up',  icon:'👁',  name:'Eagle Vision',         desc:'+4 range on all towers',               apply(g){ g.boonMods.range = (g.boonMods.range||0)+4; } },
  { id:'crystal_up',icon:'💎', name:'Crystal Bounty',        desc:'Start each wave with +20 crystal',     apply(g){ g.boonMods.crystalBonus = (g.boonMods.crystalBonus||0)+20; } },
  { id:'gold_up',   icon:'🪙', name:'Merchant\'s Eye',       desc:'+15 gold passive income (per 10s)',    apply(g){ g.boonMods.goldBonus = (g.boonMods.goldBonus||0)+15; } },
  { id:'hp_regen',  icon:'🛡', name:'Stoneheart',             desc:'Buildings regenerate 2 HP/min',        apply(g){ g.boonMods.hpRegen = true; } },
  { id:'harvest_up',icon:'🌲', name:'Nature\'s Gift',         desc:'+50% harvest yield',                   apply(g){ g.boonMods.harvestMult = (g.boonMods.harvestMult||1)*1.5; } },
  { id:'wall_aura', icon:'🧱', name:'Fortress Mind',          desc:'Walls slow enemies within 4 units',   apply(g){ g.boonMods.wallRange = 4; } },
  { id:'fire_rate', icon:'⚡', name:'Battle Frenzy',           desc:'+30% tower fire rate',                 apply(g){ g.boonMods.fireRate = (g.boonMods.fireRate||1)*1.3; } },
];

// ── §2  HELPERS ──────────────────────────────────────────────
function cellWorld(gx, gz) {
  return { x:(gx - HALF + 0.5)*CELL_SZ, z:(gz - HALF + 0.5)*CELL_SZ };
}
function worldCell(wx, wz) {
  return { gx:Math.floor(wx/CELL_SZ + HALF), gz:Math.floor(wz/CELL_SZ + HALF) };
}
function d2(ax,az,bx,bz){ const dx=ax-bx,dz=az-bz; return Math.sqrt(dx*dx+dz*dz); }
function rng(a,b){ return a + Math.random()*(b-a); }

function ctColor(type, h) {
  switch(type){
    case CT.BEACH:    return [0.92, 0.82, 0.58];
    case CT.LAND:     return [0.18+h*.04, 0.70+h*.08, 0.12+h*.03];
    case CT.FOREST:   return [0.10+h*.04, 0.44+h*.05, 0.10+h*.03];
    case CT.ROCK:     return [0.50+h*.04, 0.46+h*.04, 0.40+h*.03];
    case CT.CRYSTAL:  return [0.45+h*.03, 0.20+h*.02, 0.75+h*.04];
    case CT.BUILDING: return [0.32, 0.26, 0.22];
    default:          return [0.04, 0.18, 0.42];
  }
}

// ── §3  GAME OBJECT ──────────────────────────────────────────
const game = {
  // ── state ──────────────────────────────────────────────────
  phase:        'title',    // title|dialogue|prep|wave|conquest|victory|defeat|endless
  chapterIdx:   0,
  res:          { wood:120, stone:80, crystal:20, gold:200 },
  mode:         'harvest',
  selectedBldg: null,
  grid:         [],
  heights:      [],
  resMeshes:    {},         // "gx,gz" → THREE.Group
  buildings:    [],
  bldgMap:      {},         // "gx,gz" → Building instance
  units:        [],
  ships:        [],
  projectiles:  [],
  waveTimer:    70,
  waveActive:   false,
  waveIdx:      0,          // current wave index within chapter
  playerShips:  0,
  conquestDone: [false,false,false],
  spellCds:     { fireball:0, shield:0, storm:0, summon:0, tidal:0, chain:0 },
  destroyCount: 0,
  destroyCountWave: 0,      // buildings lost this chapter (for stars)
  harvestedCells: [],
  dialogQueue:  [],
  dialogIdx:    0,
  _dialogDone:  null,
  keys:         {},
  camTarget:    null,
  camDist:      30,
  // 2.0 systems
  difficulty:   'normal',   // 'easy'|'normal'|'hard'
  diffMult:     { enemyHp:1.0, prepTime:1.0, pirates:1.0 },
  boonMods:     {},          // active boon effects
  activeBoons:  [],          // picked boon ids
  upgrades:     {},          // "gx,gz" → { A:0, B:0, C:0 } level map
  unlocks:      { act2:false, act3:false },
  endlessMode:  false,
  endlessWave:  0,
  _goldTimer:   0,
  _harborTimer: 0,
  _regenTimer:  0,
  _selectedBuilding: null,  // for upgrade panel

  // ── Three.js handles ───────────────────────────────────────
  renderer: null, camera: null, scene: null,
  hitPlane: null, raycaster: null, mouse: null,
  highlight: null, terrainMesh: null, oceanMesh: null,
  _oceanBase: null,

  // ════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════
  setDifficulty(d) {
    this.difficulty = d;
    const M = { easy:{enemyHp:.6,prepTime:1.4,pirates:.7}, normal:{enemyHp:1,prepTime:1,pirates:1}, hard:{enemyHp:1.6,prepTime:.75,pirates:1.5} };
    this.diffMult = M[d] || M.normal;
    document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('sel'));
    const map = { easy:0, normal:1, hard:2 };
    document.querySelectorAll('.diff-btn')[map[d]]?.classList.add('sel');
  },

  startGame() {
    document.getElementById('title-screen').style.display = 'none';
    this._initThree();
    this._genIsland();
    this._initInput();
    this._initHighlight();
    this.phase = 'prep';
    this._startChapter(0);
    this._loop();
  },

  // ── Three.js setup ─────────────────────────────────────────
  _initThree() {
    const canvas = document.getElementById('c');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x1a6aaa);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.5, 300);
    this.camTarget = new THREE.Vector3(0,0,0);
    this._updateCam();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a6aaa, 60, 165);

    // Lights
    this.scene.add(new THREE.AmbientLight(0x334466, 0.75));
    const sun = new THREE.DirectionalLight(0xffe8b0, 1.25);
    sun.position.set(22, 42, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-42; sun.shadow.camera.right=42;
    sun.shadow.camera.top=42;   sun.shadow.camera.bottom=-42;
    sun.shadow.camera.near=1;   sun.shadow.camera.far=130;
    this.scene.add(sun);
    const moonLight = new THREE.DirectionalLight(0x3355aa, 0.32);
    moonLight.position.set(-16, 20, -22);
    this.scene.add(moonLight);

    // Ocean
    this._buildOcean();

    // Enemy islands (decorative, distant)
    [[0,0,-88,7.5],[78,0,-48,6.5],[-68,0,44,8]] .forEach(([x,y,z,r])=>{
      const isl = mkEnemyIsland(r);
      isl.position.set(x,y,z);
      this.scene.add(isl);
    });

    // Invisible hit-plane for raycasting
    const hgeo = new THREE.PlaneGeometry(GRID*CELL_SZ, GRID*CELL_SZ);
    this.hitPlane = new THREE.Mesh(hgeo, new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
    this.hitPlane.rotation.x = -Math.PI/2;
    this.hitPlane.position.y = 0.35;
    this.scene.add(this.hitPlane);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('resize', ()=>{
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth/window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  },

  _buildOcean() {
    // Ring geometry: starts OUTSIDE the island so it never covers it
    const innerR = 20, outerR = 160, rings = 16, segs = 72;
    const verts = [], idx = [];
    for (let r = 0; r <= rings; r++) {
      const radius = innerR + (outerR - innerR) * (r / rings);
      for (let s = 0; s <= segs; s++) {
        const angle = (s / segs) * Math.PI * 2;
        verts.push(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
      }
    }
    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segs; s++) {
        const a = r*(segs+1)+s, b=a+1, c=a+(segs+1), d=c+1;
        idx.push(a,c,b, b,c,d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this._oceanBase = new Float32Array(verts);
    this.oceanMesh = new THREE.Mesh(geo,
      new THREE.MeshLambertMaterial({ color:0x1a7acc, transparent:true, opacity:0.92 }));
    this.oceanMesh.receiveShadow = true;
    this.scene.add(this.oceanMesh);
    // Gap-fill shallow water between island edge and ocean ring
    const shallowVerts = [], shallowIdx = [];
    const shInner = 16.5, shOuter = 20, shSegs = 48;
    for (let r2 = 0; r2 <= 1; r2++) {
      const rad = r2 === 0 ? shInner : shOuter;
      for (let s = 0; s <= shSegs; s++) {
        const a = (s/shSegs)*Math.PI*2;
        shallowVerts.push(Math.cos(a)*rad, -0.08, Math.sin(a)*rad);
      }
    }
    for (let s = 0; s < shSegs; s++) {
      const a = s, b = a+1, c = a+shSegs+1, d = c+1;
      shallowIdx.push(a,c,b, b,c,d);
    }
    const shGeo = new THREE.BufferGeometry();
    shGeo.setAttribute('position', new THREE.Float32BufferAttribute(shallowVerts,3));
    shGeo.setIndex(shallowIdx);
    shGeo.computeVertexNormals();
    const shallow = new THREE.Mesh(shGeo,
      new THREE.MeshLambertMaterial({ color:0x2a9ad8, transparent:true, opacity:0.88 }));
    this.scene.add(shallow);

    // Shore foam ring — slowly rotating, gives wave-hit-island feel
    const foam = new THREE.Mesh(
      new THREE.TorusGeometry(17.2, 0.55, 6, 56),
      new THREE.MeshBasicMaterial({ color:0xeef8ff, transparent:true, opacity:0.45, depthWrite:false })
    );
    foam.rotation.x = Math.PI/2;
    foam.position.y = 0.06;
    this.scene.add(foam);
    this._foamMesh = foam;

    // Sea floor disc — hidden under island and shallow ring
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(16.5, 16.5, 0.3, 48),
      new THREE.MeshLambertMaterial({ color:0x1a5580 })
    );
    floor.position.y = -1.1;
    this.scene.add(floor);
  },

  _updateCam() {
    const a = Math.PI/3.8;
    this.camera.position.set(
      this.camTarget.x,
      this.camTarget.y + this.camDist*Math.sin(a),
      this.camTarget.z + this.camDist*Math.cos(a)
    );
    this.camera.lookAt(this.camTarget);
  },

  // ── Island generation ───────────────────────────────────────
  _genIsland() {
    // 1) Build grid + height map
    for (let gz=0; gz<GRID; gz++){
      this.grid[gz] = [];
      this.heights[gz] = [];
      for (let gx=0; gx<GRID; gx++){
        const dx=gx-HALF+0.5, dz=gz-HALF+0.5;
        const dist = Math.sqrt(dx*dx+dz*dz);
        if (dist >= ISLAND_R){
          this.grid[gz][gx] = CT.WATER;
          this.heights[gz][gx] = -1.0;
        } else if (dist > ISLAND_R-1.9){
          this.grid[gz][gx] = CT.BEACH;
          this.heights[gz][gx] = rng(0.10, 0.22);
        } else {
          const r2 = Math.random();
          this.grid[gz][gx] = r2<0.17 ? CT.FOREST : r2<0.27 ? CT.ROCK : CT.LAND;
          const falloff = (ISLAND_R - dist) / ISLAND_R;
          this.heights[gz][gx] = rng(0.25, 0.7) * falloff + 0.18;
        }
      }
    }
    // Clear a 4×4 centre for spawn
    for (let gz=HALF-2; gz<HALF+2; gz++)
      for (let gx=HALF-2; gx<HALF+2; gx++)
        if (this.grid[gz] && this.grid[gz][gx] !== CT.WATER) this.grid[gz][gx]=CT.LAND;

    // 3 crystal nodes
    let placed=0;
    while(placed<3){
      const gx=Math.floor(rng(4,17)), gz=Math.floor(rng(4,17));
      if (this.grid[gz][gx]===CT.LAND){ this.grid[gz][gx]=CT.CRYSTAL; placed++; }
    }

    // 2) Build terrain mesh
    this._buildTerrain();

    // 3) Place resource 3-D objects
    this._placeResMeshes();

    // Island base skirt — sandy underwater pedestal, top at y=-0.15 so terrain hides it
    const baseR = ISLAND_R * CELL_SZ * 1.02;
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR, baseR * 0.82, 1.6, 36),
      new THREE.MeshLambertMaterial({ color: 0x9b8058 })
    );
    baseMesh.position.y = -0.95;   // top at y=-0.15, below beach tiles
    this.scene.add(baseMesh);
  },

  _buildTerrain() {
    const verts=[], idx=[], cols=[], norms=[];
    const half = CELL_SZ/2 - 0.04;
    for (let gz=0; gz<GRID; gz++){
      for (let gx=0; gx<GRID; gx++){
        const {x:wx, z:wz} = cellWorld(gx,gz);
        const wy = this.heights[gz][gx];
        const b4 = (gz*GRID+gx)*4;
        verts.push(
          wx-half,wy,wz-half,  wx+half,wy,wz-half,
          wx+half,wy,wz+half,  wx-half,wy,wz+half
        );
        const [r,g,b] = ctColor(this.grid[gz][gx], wy);
        for(let i=0;i<4;i++){ cols.push(r,g,b); norms.push(0,1,0); }
        idx.push(b4,b4+1,b4+2, b4,b4+2,b4+3);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts,3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(cols,3));
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norms,3));
    geo.setIndex(idx);
    this.terrainMesh = new THREE.Mesh(geo,
      new THREE.MeshLambertMaterial({vertexColors:true}));
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
    this._tcols = geo.attributes.color.array;
    this._tcolAttr = geo.attributes.color;
  },

  _setCellColor(gx, gz, r, g, b) {
    const base = (gz*GRID+gx)*4*3;
    for (let i=0; i<4; i++){
      this._tcols[base+i*3]   = r;
      this._tcols[base+i*3+1] = g;
      this._tcols[base+i*3+2] = b;
    }
    this._tcolAttr.needsUpdate = true;
  },

  _placeResMeshes() {
    this.resMeshes = {};
    for (let gz=0; gz<GRID; gz++){
      for (let gx=0; gx<GRID; gx++){
        const t = this.grid[gz][gx];
        let obj = null;
        if      (t===CT.FOREST)  obj = mkTree(0.88+Math.random()*0.24);
        else if (t===CT.ROCK)    obj = mkRock(0.82+Math.random()*0.22);
        else if (t===CT.CRYSTAL) obj = mkCrystal(0.88+Math.random()*0.2);
        if (obj){
          const {x,z} = cellWorld(gx,gz);
          const wy = this.heights[gz][gx];
          obj.position.set(x+(Math.random()-.5)*.28, wy + 0.02, z+(Math.random()-.5)*.28);
          this.scene.add(obj);
          this.resMeshes[`${gx},${gz}`] = obj;
        }
      }
    }
  },

  // ── Hover highlight ─────────────────────────────────────────
  _initHighlight() {
    const geo = new THREE.PlaneGeometry(CELL_SZ-0.1, CELL_SZ-0.1);
    const mat = new THREE.MeshBasicMaterial({
      color:0xffd700, transparent:true, opacity:0.38, depthWrite:false
    });
    this.highlight = new THREE.Mesh(geo, mat);
    this.highlight.rotation.x = -Math.PI/2;
    this.highlight.visible = false;
    this.scene.add(this.highlight);
  },

  // ── Mode control ────────────────────────────────────────────
  setMode(m) {
    this.mode = m;
    this.selectedBldg = null;
    document.querySelectorAll('.mb').forEach(b=>b.classList.remove('active'));
    document.getElementById(`btn-${m}`)?.classList.add('active');
    document.getElementById('build-menu').style.display = m==='build' ? 'block' : 'none';
    document.querySelectorAll('.bb').forEach(b=>b.classList.remove('sel'));
  },

  selectBuilding(type) {
    if (this.mode !== 'build') this.setMode('build');
    this.selectedBldg = type;
    document.querySelectorAll('.bb').forEach(b=>b.classList.remove('sel'));
    document.querySelector(`.bb[data-b="${type}"]`)?.classList.add('sel');
  },
};
// end Part A

// ═══════════════════════════════════════════════════════════════
//  Part B: Entities, Combat & Waves
// ═══════════════════════════════════════════════════════════════

// ── §4  ENTITY CLASSES ───────────────────────────────────────

class Building {
  constructor(type, gx, gz, scene, terrainY=0) {
    this.type = type;
    this.def  = BDEF[type];
    this.gx = gx; this.gz = gz;
    this.hp = this.def.hp; this.maxHp = this.def.hp;
    this.fireCd = 0;
    this.shielded = false; this.shieldTimer = 0;
    this.alive = true;
    this.mesh = mkBuilding(type);
    const {x,z} = cellWorld(gx, gz);
    this.mesh.position.set(x, terrainY, z);
    scene.add(this.mesh);
  }
  get x() { return this.mesh.position.x; }
  get z() { return this.mesh.position.z; }
  update(dt) {
    if (this.shieldTimer > 0) { this.shieldTimer -= dt; if (this.shieldTimer <= 0) this.shielded = false; }
  }
  nearestEnemy(list) { return this.nearestEnemyRange(list, this.def.range); }
  nearestEnemyRange(list, range) {
    let best = null, bd = Infinity;
    for (const e of list) {
      if (!e.alive) continue;
      const dd = d2(e.x, e.z, this.x, this.z);
      if (dd < range && dd < bd) { best = e; bd = dd; }
    }
    return best;
  }
  takeDamage(dmg) {
    if (this.shielded) dmg = Math.ceil(dmg * 0.3);
    this.hp -= dmg;
    if (this.hp <= 0) this.alive = false;
  }
  dispose(scene) { scene.remove(this.mesh); }
}

class Unit {
  constructor(type, x, z, scene, enemy = false) {
    this.type = type; this.enemy = enemy; this.alive = true;
    this.x = x; this.z = z;
    const S = {
      pirate: { hp:35,  speed:2.5, dmg:10, range:1.5, rate:1.0 },
      wizard: { hp:55,  speed:2.0, dmg:14, range:5.5, rate:1.2 },
      golem:  { hp:150, speed:1.4, dmg:30, range:2.0, rate:0.55 },
    }[type] || { hp:30, speed:2, dmg:8, range:2, rate:1 };
    this.hp = S.hp; this.maxHp = S.hp;
    this.speed = S.speed; this.dmg = S.dmg;
    this.range = S.range; this.rate = S.rate;
    this.fireCd = 0;
    this.mesh = enemy ? mkPirateUnit() : (type === 'golem' ? mkGolem() : mkWizardUnit(false));
    this.mesh.position.set(x, 0, z);
    scene.add(this.mesh);
  }
  update(dt, targets, scene, projectiles) {
    if (!this.alive) return;

    // Boarding phase: walk from ship to shore before fighting
    if (this.boarding && this.boardTarget) {
      const dx = this.boardTarget.x - this.x, dz = this.boardTarget.z - this.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < 0.8) {
        this.boarding = false;
      } else {
        const s = 3.5 * dt; // swim/row speed
        this.x += (dx/dist)*s; this.z += (dz/dist)*s;
        this.mesh.position.set(this.x, 0, this.z);
        this.mesh.rotation.y = Math.atan2(dx, dz);
      }
      return;
    }

    this.fireCd -= dt;
    let best = null, bd = Infinity;
    for (const t of targets) {
      if (!t.alive) continue;
      const dd = d2(this.x, this.z, t.x, t.z);
      if (dd < bd) { best = t; bd = dd; }
    }
    if (!best) return;
    if (bd > this.range) {
      // Check wall slow: enemy units near a wall move at 40% speed
      let spd = this.speed;
      if (this.enemy && game.buildings) {
        const wallR = (game.boonMods && game.boonMods.wallRange) || 2.5;
        for (const b of game.buildings) {
          if (b.type === 'wall' && b.alive && d2(this.x, this.z, b.x, b.z) < wallR) {
            spd *= 0.4;
            // Thorns upgrade
            if (b.thorns && !this._thornCd) { this.takeDamage(b.thorns); this._thornCd = 1; }
            break;
          }
        }
        if (this._thornCd > 0) this._thornCd -= 0.016;
      }
      const s = spd * dt;
      const dx = best.x - this.x, dz = best.z - this.z;
      const m = Math.sqrt(dx*dx + dz*dz);
      this.x += (dx/m)*s; this.z += (dz/m)*s;
      this.mesh.position.set(this.x, 0, this.z);
      this.mesh.rotation.y = Math.atan2(dx, dz);
    } else if (this.fireCd <= 0) {
      this.fireCd = 1 / this.rate;
      if (this.range > 2.5) {
        projectiles.push(new Projectile('magic', {x:this.x, y:1.4, z:this.z}, best, this.dmg, scene));
      } else {
        if (typeof best.takeDamage === 'function') best.takeDamage(this.dmg);
        else { best.hp -= this.dmg; if (best.hp <= 0) best.alive = false; }
      }
    }
  }
  takeDamage(dmg) { this.hp -= dmg; if (this.hp <= 0) this.alive = false; }
  dispose(scene) { scene.remove(this.mesh); }
}

class Ship {
  constructor(type, x, z, scene) {
    this.type = type; this.alive = true;
    const S = {
      sloop:          { hp:80,  dmg:18, rate:0.6  },
      frigate:        { hp:180, dmg:32, rate:0.4  },
      galleon:        { hp:450, dmg:55, rate:0.25 },
      ghost_ship:     { hp:60,  dmg:22, rate:0.65, ghost:true },
      bomb_sloop:     { hp:40,  dmg:0,  rate:0,    bomber:true, speed:5.5 },
      undead_galleon: { hp:650, dmg:65, rate:0.3,  undead:true, regen:3, fireImmune:true },
    }[type] || { hp:80, dmg:18, rate:0.6 };
    // Apply difficulty multiplier
    const hpMult = (game && game.diffMult) ? game.diffMult.enemyHp : 1;
    this.hp = Math.round(S.hp * hpMult); this.maxHp = this.hp;
    this.dmg = S.dmg; this.rate = S.rate;
    this.ghost = S.ghost || false;
    this.bomber = S.bomber || false;
    this.undead = S.undead || false;
    this.regenRate = S.regen || 0;
    this.fireImmune = S.fireImmune || false;
    this.bomberSpeed = S.speed || null;
    this.x = x; this.z = z;
    this.phase = 'sailing';
    this.fireCd = 0; this.piratesDeployed = false; this.piratesToDeploy = 3;
    this.angle = Math.atan2(x, z);
    const mk = {
      sloop: mkSloop, frigate: mkFrigate, galleon: mkGalleon,
      ghost_ship: typeof mkGhostShip !== 'undefined' ? mkGhostShip : mkSloop,
      bomb_sloop: typeof mkBombSloop !== 'undefined' ? mkBombSloop : mkSloop,
      undead_galleon: typeof mkUndeadGalleon !== 'undefined' ? mkUndeadGalleon : mkGalleon,
    }[type] || mkSloop;
    this.mesh = mk(true);
    this.mesh.position.set(x, 0, z);
    this.mesh.rotation.y = Math.atan2(-x, -z);
    // Ghost ships start semi-transparent
    if (this.ghost) {
      this.mesh.traverse(c=>{ if (c.isMesh && c.material) { c.material.transparent=true; c.material.opacity=0.22; } });
      this._visible = false;
    }
    scene.add(this.mesh);
  }
  get r() { return Math.sqrt(this.x*this.x + this.z*this.z); }
  revealToWizard() {
    if (!this.ghost) return;
    this._visible = true;
    this.mesh.traverse(c=>{ if (c.isMesh && c.material) c.material.opacity = 0.75; });
  }
  update(dt) {
    if (!this.alive) return;
    // Undead regen
    if (this.undead && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.regenRate * dt);
    if (this.phase === 'sailing') {
      const dist = this.r;
      // Bombers rush straight in without stopping
      const speed = this.bomberSpeed ||
        ({ galleon:2.8, frigate:3.2, sloop:3.8, ghost_ship:4.2, undead_galleon:2.2 }[this.type] || 3.5);
      this.x += (-this.x/dist)*speed*dt;
      this.z += (-this.z/dist)*speed*dt;
      this.mesh.position.set(this.x, 0, this.z);
      if (this.bomber && dist < 19) { this._triggerExplosion(); return; }
      if (!this.bomber && dist < 28) this.phase = 'broadside';
    } else {
      const orb = { galleon:0.22, frigate:0.28, sloop:0.36, ghost_ship:0.38, undead_galleon:0.18 }[this.type] || 0.3;
      const tR  = { galleon:24,   frigate:22,   sloop:20,   ghost_ship:21,   undead_galleon:25   }[this.type] || 22;
      this.angle += orb * dt;
      const cur = this.r, newR = cur + (tR - cur)*dt*0.9;
      this.x = Math.sin(this.angle)*newR;
      this.z = Math.cos(this.angle)*newR;
      const bob = Math.sin(this.angle * 4 + (game._t||0) * 1.2) * 0.12;
      this.mesh.position.set(this.x, bob, this.z);
      this.mesh.rotation.y = this.angle + Math.PI/2;
    }
  }
  _triggerExplosion() {
    this.alive = false;
    // AoE damage to buildings/units within radius 5
    if (game && game.buildings) {
      game.buildings.forEach(b=>{ if (b.alive && d2(b.x,b.z,this.x,this.z)<5) b.takeDamage(35); });
      game.units.forEach(u=>{ if (!u.enemy && u.alive && d2(u.x,u.z,this.x,this.z)<5) u.takeDamage(35); });
    }
    game && game.notify('💥 Bomb Sloop EXPLODED!');
  }
  takeDamage(dmg) { this.hp -= dmg; if (this.hp <= 0) this.alive = false; }
  dispose(scene)  { scene.remove(this.mesh); }
}

class Projectile {
  constructor(type, from, target, dmg, scene) {
    this.type = type; this.target = target; this.dmg = dmg; this.alive = true;
    this.x = from.x; this.y = from.y || 2; this.z = from.z;
    this.speed = { magic:15, cannon:11, fire:13, lightning:22 }[type] || 13;
    this.mesh = mkProjectile(type);
    this.mesh.position.set(this.x, this.y, this.z);
    scene.add(this.mesh);
  }
  update(dt) {
    if (!this.alive) return;
    const tx = this.target.x, tz = this.target.z, ty = 1.2;
    const dx = tx-this.x, dy = ty-this.y, dz = tz-this.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < 0.65) {
      if (this.target.alive !== false) {
        if (typeof this.target.takeDamage === 'function') this.target.takeDamage(this.dmg);
        else { this.target.hp -= this.dmg; if (this.target.hp <= 0) this.target.alive = false; }
      }
      this.alive = false; return;
    }
    const s = Math.min(this.speed*dt, dist);
    this.x += (dx/dist)*s; this.y += (dy/dist)*s; this.z += (dz/dist)*s;
    this.mesh.position.set(this.x, this.y, this.z);
  }
  dispose(scene) { scene.remove(this.mesh); }
}

// ── §5  COMBAT, WAVE & SPELL METHODS ─────────────────────────
Object.assign(game, {

  _updateCombat(dt) {
    const enemies = [
      ...this.ships.filter(s=>s.alive),
      ...this.units.filter(u=>u.enemy&&u.alive),
    ];
    const friends = [
      ...this.buildings.filter(b=>b.alive),
      ...this.units.filter(u=>!u.enemy&&u.alive),
    ];

    // Lighthouse range bonus + boon range
    const lighthouseBonus = this.buildings.filter(b=>b.alive&&b.type==='lighthouse').length * 4
      + (this.boonMods.range || 0);

    // Harbor passive gold
    this._harborTimer = (this._harborTimer||0) + dt;
    if (this._harborTimer >= 20) {
      this._harborTimer = 0;
      const harbors = this.buildings.filter(b=>b.alive&&b.type==='harbor').length;
      if (harbors > 0) { this.res.gold += harbors * 10; this.notify(`🚢 Harbor: +${harbors*10} gold`); }
    }

    // HP regen boon
    if (this.boonMods.hpRegen) {
      this._regenTimer = (this._regenTimer||0) + dt;
      if (this._regenTimer >= 30) { this._regenTimer = 0; this.buildings.forEach(b=>{if(b.alive)b.hp=Math.min(b.maxHp,b.hp+1);}); }
    }

    // Reveal ghost ships to wizard towers
    for (const s of this.ships) {
      if (!s.ghost || s._visible) continue;
      for (const b of this.buildings) {
        if (b.alive && b.type==='wizard_tower' && d2(b.x,b.z,s.x,s.z) < b.def.range + lighthouseBonus)
          s.revealToWizard();
      }
    }

    // Buildings auto-attack
    const dmgMult = this.boonMods.dmg || 1;
    const frMult  = this.boonMods.fireRate || 1;
    for (const b of this.buildings) {
      if (!b.alive) continue;
      b.update(dt);
      if (b.def.fireRate > 0) {
        b.fireCd -= dt;
        if (b.fireCd <= 0) {
          const effRange = b.def.range + lighthouseBonus;
          // Ghost ships only targetable by wizard/ballista
          const pool = (b.type==='wizard_tower'||b.type==='ballista_tower')
            ? enemies : enemies.filter(e=>!(e instanceof Ship&&e.ghost&&!e._visible));
          const t = b.nearestEnemyRange(pool, effRange);
          if (t) {
            b.fireCd = 1 / (b.def.fireRate * frMult);
            const dmg = Math.round(b.def.dmg * dmgMult);
            if (b.def.pierce) {
              // Ballista: hit all enemies in a line
              const ang = Math.atan2(t.x-b.x, t.z-b.z);
              enemies.filter(e=>{ const ex=e.x-b.x,ez=e.z-b.z; return ex*Math.sin(ang)+ez*Math.cos(ang)>0 && Math.abs(ex*Math.cos(ang)-ez*Math.sin(ang))<1.5 && d2(b.x,b.z,e.x,e.z)<effRange; }).forEach(e=>e.takeDamage(dmg));
              this.projectiles.push(new Projectile(b.def.proj, {x:b.x,y:2.5,z:b.z}, t, 0, this.scene));
            } else {
              this.projectiles.push(new Projectile(b.def.proj, {x:b.x,y:2.5,z:b.z}, t, dmg, this.scene));
            }
          }
        }
      }
    }

    // Friendly units
    for (const u of this.units.filter(x=>!x.enemy&&x.alive))
      u.update(dt, enemies, this.scene, this.projectiles);

    // Enemy units
    for (const u of this.units.filter(x=>x.enemy&&x.alive))
      u.update(dt, friends, this.scene, this.projectiles);

    // Ships sail, orbit, fire, deploy
    for (const s of this.ships.filter(x=>x.alive)) {
      s.update(dt);
      if (s.phase==='broadside' && s.r<21 && !s.piratesDeployed)
        this._deployPirates(s);
      s.fireCd -= dt;
      if (s.fireCd<=0 && s.phase==='broadside' && friends.length) {
        s.fireCd = 1 / s.rate;
        const t = friends[Math.floor(Math.random()*friends.length)];
        this.projectiles.push(new Projectile('cannon', {x:s.x,y:1.5,z:s.z}, t, s.dmg, this.scene));
      }
    }

    // Tick + clean projectiles
    for (const p of this.projectiles) if (p.alive) p.update(dt);
    this.projectiles.filter(p=>!p.alive).forEach(p=>p.dispose(this.scene));
    this.projectiles = this.projectiles.filter(p=>p.alive);

    // Clean dead units
    this.units.filter(u=>!u.alive).forEach(u=>u.dispose(this.scene));
    this.units = this.units.filter(u=>u.alive);

    // Clean dead ships
    this.ships.filter(s=>!s.alive).forEach(s=>{
      this.notify('💥 Enemy ship sunk!');
      this._shipsThisChapter = (this._shipsThisChapter||0)+1;
      s.dispose(this.scene);
    });
    this.ships = this.ships.filter(s=>s.alive);

    // Clean dead buildings
    this.buildings.filter(b=>!b.alive).forEach(b=>{
      this.notify(`⚠ ${b.def.name} destroyed!`);
      b.dispose(this.scene);
      delete this.bldgMap[`${b.gx},${b.gz}`];
      this.grid[b.gz][b.gx] = CT.LAND;
      this.destroyCount++;
    });
    this.buildings = this.buildings.filter(b=>b.alive);

    if (this.buildings.length===0 && this.destroyCount>=3 && this.phase!=='defeat')
      this._showDefeat();
  },

  _deployPirates(ship) {
    if (ship.piratesDeployed) return;
    ship.piratesDeployed = true;
    for (let i=0; i<ship.piratesToDeploy; i++) {
      const offset = (Math.random()-0.5)*2.5;
      const px = ship.x + Math.cos(ship.angle+Math.PI/2)*offset;
      const pz = ship.z + Math.sin(ship.angle+Math.PI/2)*offset;
      // Shore landing target: random point on beach ring radius 13-15
      const landA = Math.atan2(ship.x, ship.z) + (Math.random()-0.5)*0.8;
      const landR = 13 + Math.random()*2;
      const u = new Unit('pirate', px, pz, this.scene, true);
      u.boardTarget = { x: Math.sin(landA)*landR, z: Math.cos(landA)*landR };
      u.boarding = true;
      this.units.push(u);
    }
    this.notify('⚠ Pirates boarding!');
  },

  _launchWave(waveOverrideIdx) {
    const chap = STORY.chapters[this.chapterIdx];
    if (!chap.waves || !chap.waves.length) return;
    if (waveOverrideIdx !== undefined) this.waveIdx = waveOverrideIdx;
    const wconf = chap.waves[this.waveIdx] || chap.waves[0];
    this.waveActive = true;
    this.phase = 'wave';
    this.destroyCountWave = 0;
    const dialogKey = this.waveIdx === 0 ? 'waveStart' : `waveStart${this.waveIdx+1}`;
    const dialogLines = chap[dialogKey] || (this.waveIdx===0 ? chap.waveStart : null);
    if (dialogLines && dialogLines.length) this._showDialogue(dialogLines);

    // Flash wave incoming
    const wi = document.getElementById('wave-incoming');
    if (wi) { wi.style.display='block'; setTimeout(()=>wi.style.display='none', 2000); }

    // Update wave manifest panel
    const types = [];
    for (const sw of wconf.ships) for (let i=0; i<sw.count; i++) types.push(sw.type);
    const counts = {};
    types.forEach(t=>counts[t]=(counts[t]||0)+1);
    const icons = { sloop:'⛵', frigate:'🚢', galleon:'🏴‍☠️', ghost_ship:'👻', bomb_sloop:'💣', undead_galleon:'💀' };
    const manifest = Object.entries(counts).map(([t,n])=>`${icons[t]||'⛵'} ${n}× ${t.replace('_',' ')}`).join('<br>');
    const mEl = document.getElementById('wave-manifest');
    if (mEl) mEl.innerHTML = `<b>Incoming:</b><br>${manifest}`;

    let idx = 0;
    const iv = setInterval(()=>{
      if (idx >= types.length) { clearInterval(iv); return; }
      const t = types[idx++];
      const a = Math.random()*Math.PI*2, dist2 = 55+Math.random()*15;
      const s = new Ship(t, Math.cos(a)*dist2, Math.sin(a)*dist2, this.scene);
      const pirM = (game.diffMult && game.diffMult.pirates) || 1;
      s.piratesToDeploy = Math.round((Math.ceil((wconf.pirates||3)/types.length) + (wconf.isBoss?2:0)) * pirM);
      this.ships.push(s);
    }, 1800);
  },

  _checkWaveDone() {
    if (!this.waveActive) return;
    if (this.ships.filter(s=>s.alive).length > 0) return;
    if (this.units.filter(u=>u.enemy&&u.alive).length > 0) return;
    this.waveActive = false;
    const chap = STORY.chapters[this.chapterIdx];

    // Multi-wave: advance to next wave after repair window
    const totalWaves = chap.waves ? chap.waves.length : 1;
    if (this.waveIdx < totalWaves - 1) {
      this.waveIdx++;
      this.notify(`✓ Wave ${this.waveIdx} cleared! Next wave in 45s...`);
      this.phase = 'prep';
      this.waveTimer = 45;
      // Give crystal bonus between waves
      if (this.boonMods.crystalBonus) this.res.crystal += this.boonMods.crystalBonus;
      return;
    }

    // All waves done
    this.waveIdx = 0;
    const isFinalCh = (this.chapterIdx === STORY.chapters.length - 1);
    if (isFinalCh) {
      const victKey = chap.victory || chap.complete;
      this._showDialogue(Array.isArray(victKey)?victKey:chap.complete, ()=>this._showVictory());
      return;
    }
    for (const o of chap.objectives) if (o.type==='survive'||o.type==='boss'||o.type==='survive_waves') o.done = true;

    // Clear wave manifest
    const mEl = document.getElementById('wave-manifest'); if (mEl) mEl.innerHTML='';

    this._showDialogue(chap.complete, ()=> this._showChapterComplete(chap));
  },

  castSpell(name) {
    if (this.phase!=='prep' && this.phase!=='wave') { this.notify('Cannot cast right now.'); return; }
    const sd = SDEFS[name]; if (!sd) return;
    if (this.spellCds[name] > 0) { this.notify('Spell still cooling down!'); return; }
    for (const [k,v] of Object.entries(sd.cost))
      if (this.res[k] < v) { this.notify(`Need ${v} ${k}!`); return; }
    for (const [k,v] of Object.entries(sd.cost)) this.res[k] -= v;
    this.spellCds[name] = sd.cd;
    if (name==='fireball') {
      this.notify('🔥 FIREBALL!');
      // Fire immune ships not affected
      this.units.filter(u=>u.enemy && d2(u.x,u.z,0,0)<16).forEach(u=>u.takeDamage(65));
      this.ships.filter(s=>s.r<16 && !s.fireImmune).forEach(s=>s.takeDamage(55));
    } else if (name==='shield') {
      this.notify('🛡 Magic Shield activated!');
      this.buildings.forEach(b=>{ b.shielded=true; b.shieldTimer=12; });
    } else if (name==='storm') {
      this.notify('⚡ LIGHTNING STORM!');
      this.ships.forEach(s=>s.takeDamage(90));
      this.units.filter(u=>u.enemy).forEach(u=>u.takeDamage(55));
    } else if (name==='summon') {
      this.notify('🗿 Stone Golem summoned!');
      const a = Math.random()*Math.PI*2;
      this.units.push(new Unit('golem', Math.cos(a)*3, Math.sin(a)*3, this.scene, false));
    } else if (name==='tidal') {
      this.notify('🌊 TIDAL WAVE!');
      this.ships.forEach(s=>{
        s.takeDamage(30);
        if (s.alive) { const r2=s.r+14; s.x=(s.x/s.r)*r2; s.z=(s.z/s.r)*r2; s.mesh.position.set(s.x,0,s.z); }
      });
    } else if (name==='chain') {
      this.notify('⚡🔗 CHAIN LIGHTNING!');
      const allEnemies = [...this.ships.filter(s=>s.alive), ...this.units.filter(u=>u.enemy&&u.alive)];
      let last = null, dmg = 50;
      for (let i=0; i<4; i++) {
        const pool = allEnemies.filter(e=>e!==last&&e.alive);
        if (!pool.length) break;
        const next = pool.sort((a,b)=>last?d2(last.x,last.z,a.x,a.z)-d2(last.x,last.z,b.x,b.z):0)[0];
        next.takeDamage(dmg); last=next; dmg=Math.round(dmg*0.65);
      }
    }
  },
  // ── Chapter complete overlay ─────────────────────────────────
  _showChapterComplete(chap) {
    const stars = this.destroyCount === 0 ? 3 : this.destroyCount <= 2 ? 2 : 1;
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3-stars);
    const act = chap.act || (this.chapterIdx < 5 ? 1 : this.chapterIdx < 10 ? 2 : 3);
    const actNames = ['','THE CORSAIR WAR','THE CURSED DEPTHS','THE ANCIENT RECKONING'];

    document.getElementById('cc-act').textContent   = `ACT ${act} — ${actNames[act]||''}`;
    document.getElementById('cc-title').textContent = `Chapter ${chap.id} Complete`;
    document.getElementById('cc-sub').textContent   = `"${chap.title}"`;
    document.getElementById('cc-stars').textContent = starStr;
    document.getElementById('cc-score').innerHTML   =
      `Buildings lost: ${this.destroyCount} &nbsp;|&nbsp; Ships sunk: ${this._shipsThisChapter||0}`;
    if (chap.bonusRes && Object.keys(chap.bonusRes).length) {
      const bonusStr = Object.entries(chap.bonusRes).map(([k,v])=>`+${v} ${k}`).join('  ');
      document.getElementById('cc-bonus').textContent = `Bonus: ${bonusStr}`;
      Object.entries(chap.bonusRes).forEach(([k,v])=>{ this.res[k]=(this.res[k]||0)+v; });
    } else { document.getElementById('cc-bonus').textContent = ''; }

    // Boon selection
    const boons = this._pickRandomBoons(3);
    const boonLabel = document.getElementById('cc-boon-label');
    const boonDiv   = document.getElementById('cc-boons');
    if (boons.length) {
      boonLabel.style.display = 'block';
      boonDiv.innerHTML = boons.map(b=>`
        <div class="boon-card" onclick="game._selectBoon('${b.id}',this)">
          <div class="boon-icon">${b.icon}</div>
          <div class="boon-name">${b.name}</div>
          <div class="boon-desc">${b.desc}</div>
        </div>`).join('');
    } else {
      boonLabel.style.display = 'none';
      boonDiv.innerHTML = '';
    }

    document.getElementById('cc-next').style.display = boons.length ? 'none' : 'block';
    document.getElementById('chap-complete').style.display = 'flex';
    this.phase = 'dialogue'; // pause game
    this._pendingChapter = this.chapterIdx + 1;
    this._pendingBoons   = boons;
  },

  _pickRandomBoons(n) {
    const available = BOONS.filter(b=>!this.activeBoons.includes(b.id));
    const shuffled  = available.sort(()=>Math.random()-.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  },

  _selectBoon(id, el) {
    document.querySelectorAll('.boon-card').forEach(c=>c.classList.remove('picked'));
    el.classList.add('picked');
    const boon = BOONS.find(b=>b.id===id);
    if (boon) { boon.apply(this); this.activeBoons.push(id); }
    document.getElementById('cc-next').style.display = 'block';
  },

  _advanceChapter() {
    document.getElementById('chap-complete').style.display = 'none';
    const next = this._pendingChapter || (this.chapterIdx + 1);
    if (next >= STORY.chapters.length) { this._showVictory(); return; }
    // Unlock act 2 / act 3 buildings+spells
    const nextChap = STORY.chapters[next];
    if ((nextChap.act||1) >= 2) this._unlockAct2();
    if ((nextChap.act||1) >= 3) this._unlockAct3();
    this.destroyCount = 0;
    this._shipsThisChapter = 0;
    this._startChapter(next);
  },

  _unlockAct2() {
    if (this.unlocks.act2) return;
    this.unlocks.act2 = true;
    ['lighthouse','harbor'].forEach(id=>{
      const el = document.getElementById(`bb-${id}`); if (el) el.classList.remove('locked');
    });
    ['tidal','chain'].forEach(id=>{
      const el = document.getElementById(`sp-${id}`); if (el) el.classList.remove('locked-spell');
    });
    this.notify('🔓 Act 2 unlocked: Lighthouse, Harbor, Tidal Wave, Chain Lightning!');
  },

  _unlockAct3() {
    if (this.unlocks.act3) return;
    this.unlocks.act3 = true;
    const el = document.getElementById('bb-ballista_tower'); if (el) el.classList.remove('locked');
    this.notify('🔓 Act 3 unlocked: Ballista Tower!');
  },

  // ── Upgrade Panel ─────────────────────────────────────────────
  _openUpgrade(gx, gz) {
    const b = this.bldgMap[`${gx},${gz}`];
    if (!b || !b.alive) return;
    this._selectedBuilding = b;
    const key = `${gx},${gz}`;
    if (!this.upgrades[key]) this.upgrades[key] = { A:0, B:0, C:0 };
    const upg = this.upgrades[key];
    document.getElementById('up-name').textContent = b.def.name;
    document.getElementById('up-hp').textContent   = `HP: ${b.hp} / ${b.maxHp}`;

    const upgDefs = {
      wizard_tower:   [{l:'A',name:'+5 Dmg',  cost:40},{l:'B',name:'+4 Range', cost:50},{l:'C',name:'+0.4 Rate',cost:60}],
      cannon_tower:   [{l:'A',name:'+15 Dmg', cost:50},{l:'B',name:'+4 Range', cost:60},{l:'C',name:'Splash',   cost:80}],
      ballista_tower: [{l:'A',name:'+20 Dmg', cost:60},{l:'B',name:'+1 Pierce',cost:70},{l:'C',name:'+6 Range', cost:55}],
      wall:           [{l:'A',name:'+150 HP', cost:20},{l:'B',name:'Thorns 5dmg',cost:40}],
      default:        [{l:'A',name:'+HP',     cost:30}],
    };
    const defs = upgDefs[b.type] || upgDefs.default;
    const btnHtml = defs.map(d=>{
      const lv = upg[d.l]||0; const maxed = lv>=3;
      return `<button class="upg-btn${maxed?' maxed':''}" onclick="game._doUpgrade('${key}','${d.l}',${d.cost})">`+
        `${d.name} <span class="upg-level">${'★'.repeat(lv)}${'☆'.repeat(3-lv)} ${d.cost}🪙</span></button>`;
    }).join('');
    document.getElementById('up-buttons').innerHTML = btnHtml;
    document.getElementById('upgrade-panel').style.display = 'block';
  },

  _doUpgrade(key, slot, cost) {
    if (!this.upgrades[key]) this.upgrades[key] = { A:0, B:0, C:0 };
    const lv = this.upgrades[key][slot]||0;
    if (lv >= 3) { this.notify('Already maxed!'); return; }
    if (this.res.gold < cost) { this.notify(`Need ${cost} 🪙`); return; }
    this.res.gold -= cost;
    this.upgrades[key][slot] = lv + 1;
    const b = this.bldgMap[key];
    if (b) {
      if (slot==='A') { if (b.def.dmg>0) b.def.dmg += b.type==='cannon_tower'?15:b.type==='ballista_tower'?20:5; else b.hp=Math.min(b.maxHp,b.hp+150); }
      if (slot==='B') { if (b.def.range>0) b.def.range += (b.type==='ballista_tower'?6:4); else { b.thorns=5; } }
      if (slot==='C') { if (b.def.fireRate>0) b.def.fireRate += 0.4; else b.def.splash=true; }
      // Visual upgrade glow
      const lvTotal = (this.upgrades[key].A||0)+(this.upgrades[key].B||0)+(this.upgrades[key].C||0);
      const glowColor = lvTotal>=6?0xffffff:lvTotal>=3?0xcccccc:0xffd700;
      b.mesh.traverse(c=>{ if(c.isPointLight) c.color.setHex(glowColor); });
    }
    this.notify(`✓ Upgraded ${b?b.def.name:''}`);
    const [ugx,ugz] = key.split(',').map(Number);
    this._openUpgrade(ugx, ugz);
  },

  _closeUpgrade() {
    document.getElementById('upgrade-panel').style.display = 'none';
    this._selectedBuilding = null;
  },

  // ── Endless mode ──────────────────────────────────────────────
  _startEndless() {
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('endless-banner').style.display = 'block';
    this.endlessMode = true;
    this.endlessWave = 0;
    this.phase = 'prep';
    this.waveTimer = 60;
    this._launchEndlessWave();
  },

  _launchEndlessWave() {
    this.endlessWave++;
    document.getElementById('endless-wave').textContent = this.endlessWave;
    const count = Math.min(2 + this.endlessWave, 12);
    const types = ['sloop','sloop','frigate','frigate','galleon','ghost_ship','bomb_sloop','undead_galleon'];
    const wave = [];
    for (let i=0; i<count; i++) {
      const t = types[Math.min(Math.floor((this.endlessWave-1)/2+Math.random()*2), types.length-1)];
      wave.push(t);
    }
    wave.forEach((t,i)=>{
      setTimeout(()=>{
        const a = Math.random()*Math.PI*2, r = 55+Math.random()*15;
        const s = new Ship(t, Math.cos(a)*r, Math.sin(a)*r, this.scene);
        s.piratesToDeploy = 3 + Math.floor(this.endlessWave/2);
        this.ships.push(s);
      }, i*1800);
    });
    this.waveActive = true;
    this.phase = 'wave';
  },

});
// end Part B

// ═══════════════════════════════════════════════════════════════
//  Part C: Input, UI, Story & Main Loop
// ═══════════════════════════════════════════════════════════════

Object.assign(game, {

  // ── §6  INPUT ───────────────────────────────────────────────
  _initInput() {
    window.addEventListener('keydown', e => { this.keys[e.key] = true; });
    window.addEventListener('keyup',   e => { this.keys[e.key] = false; });
    window.addEventListener('wheel',   e => {
      this.camDist = Math.max(10, Math.min(55, this.camDist + e.deltaY * 0.04));
    });
    const c = document.getElementById('c');
    c.addEventListener('mousemove', e => this._onMouseMove(e));
    c.addEventListener('click',     e => this._onClick(e));
  },

  _hitGrid(e) {
    this.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.hitPlane);
    if (!hits.length) return null;
    const p = hits[0].point;
    const { gx, gz } = worldCell(p.x, p.z);
    if (gx < 0 || gx >= GRID || gz < 0 || gz >= GRID) return null;
    return { gx, gz };
  },

  _onMouseMove(e) {
    if (this.phase === 'title' || this.phase === 'dialogue') {
      this.highlight.visible = false; return;
    }
    const hit = this._hitGrid(e);
    if (!hit) { this.highlight.visible = false; return; }
    const { gx, gz } = hit;
    const ct = this.grid[gz][gx];
    const harvestable = ct===CT.FOREST || ct===CT.ROCK || ct===CT.CRYSTAL;
    const buildable   = (ct===CT.LAND || ct===CT.BEACH) && this.selectedBldg;
    const trainable   = ct===CT.BUILDING && this.bldgMap[`${gx},${gz}`]?.type==='barracks';
    const sailable    = ct===CT.BUILDING && this.bldgMap[`${gx},${gz}`]?.type==='shipyard';
    const show = (this.mode==='harvest'&&harvestable)||(this.mode==='build'&&buildable)||
                 (this.mode==='train'&&trainable)||(this.mode==='sail'&&sailable);
    if (show) {
      const {x,z} = cellWorld(gx, gz);
      this.highlight.position.set(x, this.heights[gz][gx]+0.38, z);
      this.highlight.material.color.setHex(
        this.mode==='harvest' ? 0x44ff88 : this.mode==='build' ? 0xffd700 : 0x44aaff
      );
      this.highlight.visible = true;
    } else {
      this.highlight.visible = false;
    }
  },

  _onClick(e) {
    if (this.phase === 'title') return;
    if (this.phase === 'dialogue') { this.storyNext(); return; }
    const hit = this._hitGrid(e);
    if (!hit) return;
    const { gx, gz } = hit;
    // In build mode, clicking an existing building opens upgrade panel
    if (this.mode==='build' && this.grid[gz][gx]===CT.BUILDING && !this.selectedBldg) {
      this._openUpgrade(gx, gz); return;
    }
    if      (this.mode==='harvest') this._doHarvest(gx, gz);
    else if (this.mode==='build')   this._doBuild(gx, gz);
    else if (this.mode==='train')   this._doTrain(gx, gz);
    else if (this.mode==='sail')    this._doSail(gx, gz);
  },

  // ── §7  ACTIONS ─────────────────────────────────────────────
  _doHarvest(gx, gz) {
    const ct = this.grid[gz][gx];
    const gains = {
      [CT.FOREST]:  { wood:    20 + Math.floor(Math.random()*12) },
      [CT.ROCK]:    { stone:   15 + Math.floor(Math.random()*10) },
      [CT.CRYSTAL]: { crystal: 8  + Math.floor(Math.random()*6)  },
    }[ct];
    if (!gains) { this.notify('Nothing to harvest here.'); return; }
    const mult = this.boonMods.harvestMult || 1;
    for (const [k,v] of Object.entries(gains)) this.res[k] += Math.round(v*mult);
    const icons = { wood:'🪵', stone:'🪨', crystal:'💎' };
    const [[k,v]] = Object.entries(gains);
    this.notify(`+${v} ${icons[k]}`);
    const key = `${gx},${gz}`;
    if (this.resMeshes[key]) { this.scene.remove(this.resMeshes[key]); delete this.resMeshes[key]; }
    const origType = ct;
    this.grid[gz][gx] = CT.LAND;
    const [r,g,b] = ctColor(CT.LAND, this.heights[gz][gx]);
    this._setCellColor(gx, gz, r, g, b);
    this.harvestedCells.push({ gx, gz, origType, timer: 25 });
    this._checkObjectives();
  },

  _doBuild(gx, gz) {
    if (!this.selectedBldg) { this.notify('Select a building first.'); return; }
    const ct = this.grid[gz][gx];
    if (ct !== CT.LAND && ct !== CT.BEACH) { this.notify('Must build on land.'); return; }
    const def = BDEF[this.selectedBldg];
    for (const [k,v] of Object.entries(def.cost))
      if (this.res[k] < v) { this.notify(`Not enough ${k}!`); return; }
    for (const [k,v] of Object.entries(def.cost)) this.res[k] -= v;
    const b = new Building(this.selectedBldg, gx, gz, this.scene, this.heights[gz][gx]);
    this.buildings.push(b);
    this.bldgMap[`${gx},${gz}`] = b;
    this.grid[gz][gx] = CT.BUILDING;
    this._setCellColor(gx, gz, 0.30, 0.24, 0.20);
    this.notify(`Built ${def.name}`);
    this._checkObjectives();
  },

  _doTrain(gx, gz) {
    const b = this.bldgMap[`${gx},${gz}`];
    if (!b || b.type!=='barracks') { this.notify('Need a Barracks.'); return; }
    if (this.res.gold < 40) { this.notify('Need 40 🪙 gold to train.'); return; }
    this.res.gold -= 40;
    const {x,z} = cellWorld(gx, gz);
    this.units.push(new Unit('wizard', x+1.6, z+1.6, this.scene, false));
    this.notify('⚔ Wizard Soldier trained!');
  },

  _doSail(gx, gz) {
    const b = this.bldgMap[`${gx},${gz}`];
    if (!b || b.type!=='shipyard') { this.notify('Need a Shipyard.'); return; }
    if (this.chapterIdx < 3) { this.notify('Ships available in Chapter 4!'); return; }
    if (this.playerShips < 2) {
      if (this.res.wood >= 50 && this.res.gold >= 60) {
        this.res.wood -= 50; this.res.gold -= 60;
        this.playerShips++;
        this.notify(`⛵ Ship built! (${this.playerShips}/2)`);
        this._checkObjectives();
      } else { this.notify('Need 50🪵 + 60🪙 to build a ship.'); }
    } else {
      this._startConquest();
    }
  },

  _startConquest() {
    if (this.conquestDone[0]) { this.notify('Isle of Crimson already taken!'); return; }
    this.notify('⛵ Fleet sets sail for Isle of Crimson!');
    this.phase = 'conquest';
    // Spawn visible battle
    for (let i=0; i<2; i++) {
      const a = (i/2)*Math.PI + Math.PI;
      const s = new Ship('sloop', Math.cos(a)*9, Math.sin(a)*9, this.scene);
      this.ships.push(s);
    }
    for (let i=0; i<4; i++) {
      const a = (i/4)*Math.PI*2;
      const s = new Ship('sloop', Math.cos(a)*17, Math.sin(a)*17, this.scene);
      this.ships.push(s);
    }
    setTimeout(()=>{
      this.ships.forEach(s=>{ s.alive=false; s.dispose(this.scene); });
      this.ships = [];
      this.conquestDone[0] = true;
      this.notify('🏴 Isle of Crimson CAPTURED!');
      const el = document.getElementById('isl-0');
      if (el) { el.className='isl friendly'; el.textContent='● Isle of Crimson (Ours)'; }
      for (const o of STORY.chapters[this.chapterIdx].objectives)
        if (o.type==='conquer') o.done = true;
      this._updateObjUI();
      this.phase = 'prep';
      this.waveTimer = 50;
      this._showDialogue(STORY.chapters[this.chapterIdx].complete, ()=>{
        if (this.chapterIdx+1 < STORY.chapters.length)
          setTimeout(()=>this._startChapter(this.chapterIdx+1), 1400);
      });
    }, 9000);
  },

  // ── §8  STORY & CHAPTER SYSTEM ──────────────────────────────
  _startChapter(idx) {
    this.chapterIdx = idx;
    this.waveIdx = 0;
    this.destroyCountWave = 0;
    this._shipsThisChapter = 0;
    const chap = STORY.chapters[idx];
    const act = chap.act || (idx < 5 ? 1 : idx < 10 ? 2 : 3);
    const actNames = ['','THE CORSAIR WAR','THE CURSED DEPTHS','THE ANCIENT RECKONING'];
    // Reset wave state
    this.waveActive = false;
    const base = idx < 5 ? 120 : idx < 10 ? 100 : 80;
    this.waveTimer = Math.round(base * (this.diffMult.prepTime || 1));
    // Act banner
    const ab = document.getElementById('act-banner');
    if (ab) ab.textContent = `ACT ${act} — ${actNames[act]||''}  ·  CHAPTER ${chap.id}: ${chap.title.toUpperCase()}`;
    // Crystal bonus from boon at wave start
    if (this.boonMods.crystalBonus) this.res.crystal += this.boonMods.crystalBonus;
    this._updateObjUI();
    this._showChapTitle(chap.id, chap.title, chap.sub, act);
    setTimeout(()=>{
      this._showDialogue(chap.intro, ()=>{ this.phase = 'prep'; });
    }, 2400);
  },

  _showDialogue(lines, onDone) {
    if (!lines || !lines.length) { if (onDone) onDone(); return; }
    this.dialogQueue  = lines;
    this.dialogIdx    = 0;
    this._dialogDone  = onDone || null;
    this.phase        = 'dialogue';
    this._renderDialog();
  },

  _renderDialog() {
    const box = document.getElementById('story-box');
    if (this.dialogIdx >= this.dialogQueue.length) {
      box.style.display = 'none';
      const cb = this._dialogDone; this._dialogDone = null;
      this.phase = this.waveActive ? 'wave' : 'prep';
      if (cb) cb();
      return;
    }
    const line  = this.dialogQueue[this.dialogIdx];
    const color = STORY.speakerColors[line.speaker] || '#ffd700';
    box.style.display = 'block';
    document.getElementById('story-speaker').innerHTML =
      `<span style="font-size:19px">${line.portrait||'💬'}</span> ` +
      `<span style="color:${color}">${line.speaker}</span>`;
    document.getElementById('story-text').textContent = line.text;
  },

  storyNext() {
    this.dialogIdx++;
    this._renderDialog();
  },

  _showChapTitle(num, title, sub, act) {
    const actEl = document.getElementById('ct-act');
    if (actEl && act) actEl.textContent = `ACT ${act}`;
    document.getElementById('ct-ch').textContent = `Chapter ${num}: ${title}`;
    document.getElementById('ct-ti').textContent  = sub || '';
    const el = document.getElementById('chap-title');
    el.style.display = 'block';
    setTimeout(()=>{ el.style.display='none'; }, 2800);
  },

  // ── §9  OBJECTIVES ───────────────────────────────────────────
  _checkObjectives() {
    if (this.chapterIdx >= STORY.chapters.length) return;
    const chap = STORY.chapters[this.chapterIdx];
    for (const o of chap.objectives) {
      if (o.done) continue;
      if      (o.type==='resource') { if (this.res[o.resource] >= o.target) { o.done=true; this.notify(`✓ ${o.text}`); } }
      else if (o.type==='building') { if (this.buildings.filter(b=>b.type===o.building).length >= (o.target||1)) { o.done=true; this.notify(`✓ ${o.text}`); } }
      else if (o.type==='ships')    { if (this.playerShips >= o.target) { o.done=true; this.notify(`✓ ${o.text}`); } }
      else if (o.type==='conquer')  { if (this.conquestDone[o.island||0]) { o.done=true; this.notify(`✓ ${o.text}`); } }
    }
    this._updateObjUI();
    // If all non-survive objs done and prep, fast-forward wave timer
    if (this.phase==='prep' && !this.waveActive) {
      const pending = chap.objectives.filter(o=>!o.done && o.type!=='survive' && o.type!=='boss');
      if (pending.length===0 && this.waveTimer > 18) this.waveTimer = 18;
    }
  },

  _updateObjUI() {
    const chap = STORY.chapters[this.chapterIdx];
    if (!chap) return;
    document.getElementById('obj-list').innerHTML =
      chap.objectives.map(o=>`<div class="obj${o.done?' done':''}">${o.text}</div>`).join('');
  },

  // ── §10  UI ──────────────────────────────────────────────────
  notify(msg) {
    const d = document.createElement('div');
    d.className = 'notif'; d.textContent = msg;
    document.getElementById('notifs').appendChild(d);
    setTimeout(()=>d.remove(), 3200);
  },

  _updateUI() {
    // Resources
    document.getElementById('r-wood').textContent    = this.res.wood;
    document.getElementById('r-stone').textContent   = this.res.stone;
    document.getElementById('r-crystal').textContent = this.res.crystal;
    document.getElementById('r-gold').textContent    = this.res.gold;

    // Wave timer
    const timerEl = document.getElementById('wave-timer');
    const descEl  = document.getElementById('wave-desc');
    if (this.waveActive) {
      const n = this.ships.filter(s=>s.alive).length + this.units.filter(u=>u.enemy&&u.alive).length;
      timerEl.textContent = `⚔ ${n}`; descEl.textContent = 'Enemies remaining';
    } else if (this.phase==='prep') {
      const t = Math.max(0, Math.ceil(this.waveTimer));
      timerEl.textContent = `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
      descEl.textContent  = t > 8 ? 'Enemy fleet approaching...' : '⚠ ATTACK IMMINENT!';
    } else {
      timerEl.textContent = '--:--'; descEl.textContent = 'All quiet...';
    }

    // Spell cooldown bar heights
    for (const [name, cd] of Object.entries(this.spellCds)) {
      if (!SDEFS[name]) continue;
      const pct = cd > 0 ? (cd / SDEFS[name].cd) * 100 : 0;
      const el = document.getElementById(`cd-${name}`);
      if (el) el.style.height = pct + '%';
    }

    // Building button affordability (skip locked ones)
    document.querySelectorAll('.bb').forEach(btn=>{
      const type = btn.dataset.b; if (!type||!BDEF[type]) return;
      if (btn.classList.contains('locked')) return;
      const ok = Object.entries(BDEF[type].cost).every(([k,v])=>this.res[k]>=v);
      btn.classList.toggle('off', !ok);
    });
  },

  _respawnResource(gx, gz, type) {
    if (this.grid[gz][gx] !== CT.LAND) return;
    this.grid[gz][gx] = type;
    const [r,g,b] = ctColor(type, this.heights[gz][gx]);
    this._setCellColor(gx, gz, r, g, b);
    let obj = null;
    if      (type===CT.FOREST)  obj = mkTree(0.88+Math.random()*0.24);
    else if (type===CT.ROCK)    obj = mkRock(0.82+Math.random()*0.22);
    else if (type===CT.CRYSTAL) obj = mkCrystal(0.88+Math.random()*0.2);
    if (obj) {
      const {x,z} = cellWorld(gx, gz);
      obj.position.set(x+(Math.random()-.5)*.28, this.heights[gz][gx], z+(Math.random()-.5)*.28);
      this.scene.add(obj);
      this.resMeshes[`${gx},${gz}`] = obj;
    }
  },

  _showVictory() {
    // Endless mode — chain another wave
    if (this.endlessMode) {
      setTimeout(()=>{ this.phase='prep'; this.waveTimer=45; this._launchEndlessWave(); }, 3000);
      return;
    }
    this.phase = 'victory';
    document.getElementById('end-title').textContent = '⚓ Victory! ⚓';
    document.getElementById('end-text').textContent  =
      'The Crystal Archipelago is saved! The Abyss Leviathan is sealed, the Pirate King defeated. Peace returns to these waters — thanks to you, Wizard.';
    document.getElementById('end-screen').style.display = 'flex';
    document.getElementById('end-endless').style.display = 'block';
  },

  _showDefeat() {
    this.phase = 'defeat';
    document.getElementById('end-title').textContent = '💀 Defeated';
    document.getElementById('end-text').textContent  =
      'The Crimson Corsairs have overrun Emerald Isle. The crystals fall to pirate hands... but a wizard never truly dies. Will you try again?';
    document.getElementById('end-screen').style.display = 'flex';
  },

  // ── §11  MAIN LOOP ───────────────────────────────────────────
  _loop() {
    let last = performance.now();
    const tick = now => {
      requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this._update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(tick);
  },

  _update(dt) {
    // Camera pan
    if (this.phase !== 'title') {
      const spd = 0.18 * this.camDist;
      if (this.keys['w']||this.keys['ArrowUp'])    this.camTarget.z -= spd*dt;
      if (this.keys['s']||this.keys['ArrowDown'])  this.camTarget.z += spd*dt;
      if (this.keys['a']||this.keys['ArrowLeft'])  this.camTarget.x -= spd*dt;
      if (this.keys['d']||this.keys['ArrowRight']) this.camTarget.x += spd*dt;
      this.camTarget.x = Math.max(-24, Math.min(24, this.camTarget.x));
      this.camTarget.z = Math.max(-24, Math.min(24, this.camTarget.z));
      this._updateCam();
    }

    // Accumulate time for bobbing etc.
    this._t = (this._t || 0) + dt;
    const t = this._t;

    // Animate ocean ring — safe to wave freely, ring never covers island
    if (this._oceanBase) {
      const pos = this.oceanMesh.geometry.attributes.position.array;
      for (let i=0; i<this._oceanBase.length; i+=3) {
        const ox = this._oceanBase[i], oz = this._oceanBase[i+2];
        pos[i+1] = Math.sin(ox*0.09+t)*0.22 + Math.cos(oz*0.07+t*0.65)*0.16;
      }
      this.oceanMesh.geometry.attributes.position.needsUpdate = true;
      this.oceanMesh.geometry.computeVertexNormals();
    }

    // Rotate shore foam ring
    if (this._foamMesh) this._foamMesh.rotation.z = t * 0.12;

    // Passive gold income: +5 (+boon bonus) every 10 seconds
    this._goldTimer = (this._goldTimer || 0) + dt;
    if (this._goldTimer >= 10) {
      this._goldTimer -= 10;
      const income = 5 + (this.boonMods.goldBonus || 0);
      this.res.gold += income;
    }

    // Resource regeneration
    for (const hc of this.harvestedCells) {
      hc.timer -= dt;
      if (hc.timer <= 0 && this.grid[hc.gz][hc.gx] === CT.LAND)
        this._respawnResource(hc.gx, hc.gz, hc.origType);
    }
    this.harvestedCells = this.harvestedCells.filter(hc => hc.timer > 0);

    // Spell cooldowns
    for (const k of Object.keys(this.spellCds))
      if (this.spellCds[k] > 0) this.spellCds[k] = Math.max(0, this.spellCds[k]-dt);

    // Prep countdown → launch wave
    if (this.phase==='prep' && !this.waveActive) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        const chap = STORY.chapters[this.chapterIdx];
        if (chap.waveCount > 0) this._launchWave();
        else this.waveTimer = 999; // chapter 4 conquest — no auto wave
      }
    }

    // Combat
    if (this.phase==='wave' || this.phase==='conquest' || this.waveActive)
      this._updateCombat(dt);

    // Wave complete check
    if (this.waveActive) this._checkWaveDone();

    // Continuous objective check (for resource milestones typed in real time)
    if (this.phase==='prep') this._checkObjectives();

    this._updateUI();
  },
});
// end Part C
