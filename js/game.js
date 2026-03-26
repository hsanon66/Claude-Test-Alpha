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
    case CT.BEACH:    return [0.86-h*.04, 0.74-h*.04, 0.52-h*.04];
    case CT.LAND:     return [0.22+h*.1,  0.54+h*.08, 0.18+h*.05];
    case CT.FOREST:   return [0.12+h*.05, 0.40+h*.06, 0.12+h*.03];
    case CT.ROCK:     return [0.44+h*.05, 0.40+h*.05, 0.36+h*.04];
    case CT.CRYSTAL:  return [0.35+h*.04, 0.18+h*.03, 0.60+h*.06];
    case CT.BUILDING: return [0.30, 0.24, 0.20];
    default:          return [0.05, 0.20, 0.44];   // water – mostly hidden
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
    this.scene.add(Object.assign(new THREE.DirectionalLight(0x3355aa, 0.32),
      { position: new THREE.Vector3(-16,20,-22) }));

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
    const geo = new THREE.PlaneGeometry(260, 260, 36, 36);
    geo.rotateX(-Math.PI/2);
    this._oceanBase = new Float32Array(geo.attributes.position.array);
    this.oceanMesh = new THREE.Mesh(geo,
      new THREE.MeshLambertMaterial({ color:0x0a3a6a, transparent:true, opacity:0.9 }));
    this.oceanMesh.receiveShadow = true;
    this.scene.add(this.oceanMesh);
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
          this.heights[gz][gx] = -0.55;
        } else if (dist > ISLAND_R-1.9){
          this.grid[gz][gx] = CT.BEACH;
          this.heights[gz][gx] = rng(0.08,0.22);
        } else {
          const r2 = Math.random();
          this.grid[gz][gx] = r2<0.17 ? CT.FOREST : r2<0.27 ? CT.ROCK : CT.LAND;
          this.heights[gz][gx] = rng(0.22,0.58) * ((ISLAND_R-dist)/ISLAND_R);
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
