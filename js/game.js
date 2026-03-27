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
  wizard_tower:  { name:'Wizard Tower',  hp:120, cost:{wood:30,stone:20},        dmg:18, range:8,   fireRate:1.2, proj:'magic'  },
  cannon_tower:  { name:'Cannon Tower',  hp:160, cost:{wood:20,stone:40},        dmg:40, range:6,   fireRate:0.4, proj:'cannon' },
  wall:          { name:'Stone Wall',    hp:350, cost:{stone:15},                dmg:0,  range:0,   fireRate:0,   proj:null     },
  barracks:      { name:'Barracks',      hp:80,  cost:{wood:40,stone:20},        dmg:0,  range:0,   fireRate:0,   proj:null     },
  shipyard:      { name:'Shipyard',      hp:80,  cost:{wood:60,stone:20},        dmg:0,  range:0,   fireRate:0,   proj:null     },
  crystal_forge: { name:'Crystal Forge', hp:60,  cost:{stone:25,crystal:20},     dmg:0,  range:0,   fireRate:0,   proj:null     },
};

const SDEFS = {
  fireball: { cost:{crystal:5},  cd:15 },
  shield:   { cost:{crystal:3},  cd:30 },
  storm:    { cost:{crystal:10}, cd:45 },
  summon:   { cost:{crystal:8},  cd:60 },
};

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
    case CT.LAND:     return [0.28+h*.06, 0.62+h*.06, 0.20+h*.04];
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
  phase:        'title',    // title|dialogue|prep|wave|conquest|victory|defeat
  chapterIdx:   0,
  res:          { wood:50, stone:30, crystal:10, gold:100 },
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
  playerShips:  0,
  conquestDone: [false,false,false],
  spellCds:     { fireball:0, shield:0, storm:0, summon:0 },
  destroyCount: 0,
  harvestedCells: [],
  dialogQueue:  [],
  dialogIdx:    0,
  _dialogDone:  null,
  keys:         {},
  camTarget:    null,      // THREE.Vector3 – set in init
  camDist:      30,

  // ── Three.js handles ───────────────────────────────────────
  renderer: null, camera: null, scene: null,
  hitPlane: null, raycaster: null, mouse: null,
  highlight: null, terrainMesh: null, oceanMesh: null,
  _oceanBase: null,

  // ════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════
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
    this.renderer.setClearColor(0x080c18);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.5, 300);
    this.camTarget = new THREE.Vector3(0,0,0);
    this._updateCam();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a1828, 48, 145);

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
      new THREE.MeshLambertMaterial({ color:0x0d4a7a, transparent:true, opacity:0.94 }));
    this.oceanMesh.receiveShadow = true;
    this.scene.add(this.oceanMesh);
    // Dark sea floor disc filling the gap under the island
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 20, 0.5, 48),
      new THREE.MeshLambertMaterial({ color:0x071e38 })
    );
    floor.position.y = -1.0;
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
          this.heights[gz][gx] = rng(0.55, 0.85);
        } else {
          const r2 = Math.random();
          this.grid[gz][gx] = r2<0.17 ? CT.FOREST : r2<0.27 ? CT.ROCK : CT.LAND;
          const peak = rng(1.5, 3.2) * ((ISLAND_R-dist)/ISLAND_R);
          this.heights[gz][gx] = Math.max(0.6, peak);
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

    // Island base skirt
    const base = mkPlayerIslandBase(ISLAND_R * CELL_SZ * 0.97);
    this.scene.add(base);
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
          obj.position.set(x+(Math.random()-.5)*.28, wy, z+(Math.random()-.5)*.28);
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
  constructor(type, gx, gz, scene) {
    this.type = type;
    this.def  = BDEF[type];
    this.gx = gx; this.gz = gz;
    this.hp = this.def.hp; this.maxHp = this.def.hp;
    this.fireCd = 0;
    this.shielded = false; this.shieldTimer = 0;
    this.alive = true;
    this.mesh = mkBuilding(type);
    const {x,z} = cellWorld(gx, gz);
    this.mesh.position.set(x, 0, z);
    scene.add(this.mesh);
  }
  get x() { return this.mesh.position.x; }
  get z() { return this.mesh.position.z; }
  update(dt) {
    if (this.shieldTimer > 0) { this.shieldTimer -= dt; if (this.shieldTimer <= 0) this.shielded = false; }
  }
  nearestEnemy(list) {
    let best = null, bd = Infinity;
    for (const e of list) {
      if (!e.alive) continue;
      const dd = d2(e.x, e.z, this.x, this.z);
      if (dd < this.def.range && dd < bd) { best = e; bd = dd; }
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
    this.fireCd -= dt;
    let best = null, bd = Infinity;
    for (const t of targets) {
      if (!t.alive) continue;
      const dd = d2(this.x, this.z, t.x, t.z);
      if (dd < bd) { best = t; bd = dd; }
    }
    if (!best) return;
    if (bd > this.range) {
      const s = this.speed * dt;
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
      sloop:   { hp:80,  dmg:18, rate:0.6 },
      frigate: { hp:180, dmg:32, rate:0.4 },
      galleon: { hp:450, dmg:55, rate:0.25 },
    }[type] || { hp:80, dmg:18, rate:0.6 };
    this.hp = S.hp; this.maxHp = S.hp; this.dmg = S.dmg; this.rate = S.rate;
    this.x = x; this.z = z;
    this.phase = 'sailing';
    this.fireCd = 0; this.piratesDeployed = false; this.piratesToDeploy = 3;
    this.angle = Math.atan2(x, z);
    const mk = { sloop:mkSloop, frigate:mkFrigate, galleon:mkGalleon }[type] || mkSloop;
    this.mesh = mk(true);
    this.mesh.position.set(x, 0, z);
    this.mesh.rotation.y = Math.atan2(-x, -z);
    scene.add(this.mesh);
  }
  get r() { return Math.sqrt(this.x*this.x + this.z*this.z); }
  update(dt) {
    if (!this.alive) return;
    if (this.phase === 'sailing') {
      const dist = this.r;
      const speed = { galleon:2.8, frigate:3.2, sloop:3.8 }[this.type] || 3.5;
      this.x += (-this.x/dist)*speed*dt;
      this.z += (-this.z/dist)*speed*dt;
      this.mesh.position.set(this.x, 0, this.z);
      if (dist < 28) this.phase = 'broadside';
    } else {
      const orb = { galleon:0.22, frigate:0.28, sloop:0.36 }[this.type] || 0.3;
      const tR  = { galleon:24,   frigate:22,   sloop:20   }[this.type] || 22;
      this.angle += orb * dt;
      const cur = this.r, newR = cur + (tR - cur)*dt*0.9;
      this.x = Math.sin(this.angle)*newR;
      this.z = Math.cos(this.angle)*newR;
      this.mesh.position.set(this.x, 0, this.z);
      this.mesh.rotation.y = this.angle + Math.PI/2;
    }
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

    // Buildings auto-attack
    for (const b of this.buildings) {
      if (!b.alive) continue;
      b.update(dt);
      if (b.def.fireRate > 0) {
        b.fireCd -= dt;
        if (b.fireCd <= 0) {
          const t = b.nearestEnemy(enemies);
          if (t) {
            b.fireCd = 1 / b.def.fireRate;
            this.projectiles.push(new Projectile(b.def.proj, {x:b.x,y:2.5,z:b.z}, t, b.def.dmg, this.scene));
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
    this.ships.filter(s=>!s.alive).forEach(s=>{ this.notify('💥 Enemy ship sunk!'); s.dispose(this.scene); });
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
      const a = Math.random()*Math.PI*2, r2 = 9+Math.random()*2;
      this.units.push(new Unit('pirate', Math.cos(a)*r2, Math.sin(a)*r2, this.scene, true));
    }
    this.notify('⚠ Pirates landing!');
  },

  _launchWave() {
    const chap = STORY.chapters[this.chapterIdx];
    if (!chap.waves || !chap.waves.length) return;
    const wconf = chap.waves[0];
    this.waveActive = true;
    this.phase = 'wave';
    if (chap.waveStart && chap.waveStart.length) this._showDialogue(chap.waveStart);
    const types = [];
    for (const sw of wconf.ships) for (let i=0; i<sw.count; i++) types.push(sw.type);
    let idx = 0;
    const iv = setInterval(()=>{
      if (idx >= types.length) { clearInterval(iv); return; }
      const t = types[idx++];
      const a = Math.random()*Math.PI*2, dist2 = 55+Math.random()*15;
      const s = new Ship(t, Math.cos(a)*dist2, Math.sin(a)*dist2, this.scene);
      s.piratesToDeploy = Math.ceil((wconf.pirates||3)/types.length) + (wconf.isBoss?2:0);
      this.ships.push(s);
    }, 1800);
  },

  _checkWaveDone() {
    if (!this.waveActive) return;
    if (this.ships.filter(s=>s.alive).length > 0) return;
    if (this.units.filter(u=>u.enemy&&u.alive).length > 0) return;
    this.waveActive = false;
    const chap = STORY.chapters[this.chapterIdx];
    if (chap.id === 5) { this._showDialogue(chap.victory, ()=>this._showVictory()); return; }
    for (const o of chap.objectives) if (o.type==='survive'||o.type==='boss') o.done = true;
    this._showDialogue(chap.complete, ()=>{
      if (chap.bonusRes)
        Object.entries(chap.bonusRes).forEach(([k,v])=>{ this.res[k]=(this.res[k]||0)+v; });
      this.notify('Chapter complete! Bonus resources granted.');
      this._updateObjUI();
      if (this.chapterIdx+1 < STORY.chapters.length)
        setTimeout(()=>this._startChapter(this.chapterIdx+1), 1600);
    });
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
      this.units.filter(u=>u.enemy && d2(u.x,u.z,0,0)<16).forEach(u=>u.takeDamage(65));
      this.ships.filter(s=>s.r<16).forEach(s=>s.takeDamage(45));
    } else if (name==='shield') {
      this.notify('🛡 Magic Shield activated!');
      this.buildings.forEach(b=>{ b.shielded=true; b.shieldTimer=10; });
    } else if (name==='storm') {
      this.notify('⚡ LIGHTNING STORM!');
      this.ships.forEach(s=>s.takeDamage(85));
      this.units.filter(u=>u.enemy).forEach(u=>u.takeDamage(50));
    } else if (name==='summon') {
      this.notify('🗿 Stone Golem summoned!');
      const a = Math.random()*Math.PI*2;
      this.units.push(new Unit('golem', Math.cos(a)*3, Math.sin(a)*3, this.scene, false));
    }
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
    if      (this.mode==='harvest') this._doHarvest(gx, gz);
    else if (this.mode==='build')   this._doBuild(gx, gz);
    else if (this.mode==='train')   this._doTrain(gx, gz);
    else if (this.mode==='sail')    this._doSail(gx, gz);
  },

  // ── §7  ACTIONS ─────────────────────────────────────────────
  _doHarvest(gx, gz) {
    const ct = this.grid[gz][gx];
    const gains = {
      [CT.FOREST]:  { wood:    11 + Math.floor(Math.random()*7) },
      [CT.ROCK]:    { stone:   8  + Math.floor(Math.random()*6) },
      [CT.CRYSTAL]: { crystal: 5  + Math.floor(Math.random()*4) },
    }[ct];
    if (!gains) { this.notify('Nothing to harvest here.'); return; }
    for (const [k,v] of Object.entries(gains)) this.res[k] += v;
    const icons = { wood:'🪵', stone:'🪨', crystal:'💎' };
    const [[k,v]] = Object.entries(gains);
    this.notify(`+${v} ${icons[k]}`);
    const key = `${gx},${gz}`;
    if (this.resMeshes[key]) { this.scene.remove(this.resMeshes[key]); delete this.resMeshes[key]; }
    const origType = ct;
    this.grid[gz][gx] = CT.LAND;
    const [r,g,b] = ctColor(CT.LAND, this.heights[gz][gx]);
    this._setCellColor(gx, gz, r, g, b);
    this.harvestedCells.push({ gx, gz, origType, timer: 45 });
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
    const b = new Building(this.selectedBldg, gx, gz, this.scene);
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
      const el = document.getElementById('isl-1');
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
    const chap = STORY.chapters[idx];
    // Reset per-chapter state
    this.waveActive = false;
    this.waveTimer = idx < 2 ? 70 : idx < 4 ? 55 : 45;
    this._updateObjUI();
    this._showChapTitle(chap.id, chap.title, chap.sub);
    setTimeout(()=>{
      this._showDialogue(chap.intro, ()=>{
        this.phase = 'prep';
      });
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

  _showChapTitle(num, title, sub) {
    document.getElementById('ct-ch').textContent = `Chapter ${num}`;
    document.getElementById('ct-ti').textContent  = title;
    const el = document.getElementById('chap-title');
    el.style.display = 'block';
    setTimeout(()=>{ el.style.display='none'; }, 2200);
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
      const pct = cd > 0 ? (cd / SDEFS[name].cd) * 100 : 0;
      const el = document.getElementById(`cd-${name}`);
      if (el) el.style.height = pct + '%';
    }

    // Building button affordability
    document.querySelectorAll('.bb').forEach(btn=>{
      const type = btn.dataset.b; if (!type||!BDEF[type]) return;
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
    this.phase = 'victory';
    document.getElementById('end-title').textContent = '⚓ Victory! ⚓';
    document.getElementById('end-text').textContent  =
      'The Crystal Archipelago is saved! The Pirate King is defeated, his fleet scattered to the winds. Peace returns to these waters — thanks to you, Wizard.';
    document.getElementById('end-screen').style.display = 'flex';
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

    // Animate ocean ring — safe to wave freely, ring never covers island
    if (this._oceanBase) {
      const t = performance.now() * 0.001;
      const pos = this.oceanMesh.geometry.attributes.position.array;
      for (let i=0; i<this._oceanBase.length; i+=3) {
        const ox = this._oceanBase[i], oz = this._oceanBase[i+2];
        pos[i+1] = Math.sin(ox*0.1+t)*0.26 + Math.cos(oz*0.08+t*0.72)*0.18;
      }
      this.oceanMesh.geometry.attributes.position.needsUpdate = true;
      this.oceanMesh.geometry.computeVertexNormals();
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
