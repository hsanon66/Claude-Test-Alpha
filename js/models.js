// ══════════════════════════════════════════════════════
//  models.js – Three.js 3-D model factories
// ══════════════════════════════════════════════════════
'use strict';

/* ── helpers ─────────────────────────────────────────── */
function mat(color, emissive=0x000000, emInt=0){
  return new THREE.MeshLambertMaterial({color, emissive, emissiveIntensity:emInt});
}
function box(w,h,d){ return new THREE.BoxGeometry(w,h,d); }
function cyl(rt,rb,h,s=8){ return new THREE.CylinderGeometry(rt,rb,h,s); }
function cone(r,h,s=8){ return new THREE.ConeGeometry(r,h,s); }
function sphere(r,s=8){ return new THREE.SphereGeometry(r,s,s); }
function plane(w,h){ return new THREE.PlaneGeometry(w,h); }
function oct(r){ return new THREE.OctahedronGeometry(r); }
function dod(r){ return new THREE.DodecahedronGeometry(r); }
function torus(r,t,rs=7,ts=14){ return new THREE.TorusGeometry(r,t,rs,ts); }
function mesh(geo,m){ const o=new THREE.Mesh(geo,m); o.castShadow=true; o.receiveShadow=true; return o; }
function ptLight(color,int,dist){ return new THREE.PointLight(color,int,dist); }

/* ══ Resource objects ══════════════════════════════════ */
function mkTree(s=1){
  const g=new THREE.Group();
  const trunk=mesh(cyl(.08*s,.12*s,.7*s,7), mat(0x5C3317));
  trunk.position.y=.35*s; g.add(trunk);
  const f1=mesh(cone(.48*s,.85*s,7), mat(0x256B25));
  f1.position.y=1.1*s; g.add(f1);
  const f2=mesh(cone(.34*s,.65*s,7), mat(0x3A9A3A));
  f2.position.y=1.55*s; g.add(f2);
  return g;
}

function mkRock(s=1){
  const g=new THREE.Group();
  const m1=mat(0x7A7A7A); const m2=mat(0x666060);
  const r1=mesh(dod(.33*s),m1); r1.position.y=.18*s; r1.rotation.y=Math.random()*Math.PI; g.add(r1);
  const r2=mesh(dod(.2*s),m2); r2.position.set(.28*s,.08*s,.14*s); r2.rotation.y=Math.random()*Math.PI; g.add(r2);
  return g;
}

function mkCrystal(s=1){
  const g=new THREE.Group();
  const cm=mat(0xB366FF,0x7700CC,.7);
  const c1=mesh(oct(.33*s),cm); c1.position.y=.38*s; c1.rotation.y=Math.PI/4; g.add(c1);
  const c2=mesh(oct(.2*s),cm);  c2.position.set(.22*s,.18*s,.1*s); c2.rotation.y=1.1; g.add(c2);
  const c3=mesh(oct(.14*s),cm); c3.position.set(-.14*s,.14*s,.2*s); c3.rotation.y=-.8; g.add(c3);
  const l=ptLight(0xAA44FF,.9,4.5*s); l.position.y=.5*s; g.add(l);
  return g;
}

/* ══ Buildings ════════════════════════════════════════ */
function mkWizardTower(){
  const g=new THREE.Group();
  const sm=mat(0x8B8070); const dm=mat(0x1A1040); const pm=mat(0x9B59B6,0x6B1F8A,.9);
  // shaft
  const shaft=mesh(cyl(.52,.68,2.0,8),sm); shaft.position.y=1.0; g.add(shaft);
  // battlement ring
  const br=mesh(cyl(.64,.64,.28,8),sm); br.position.y=2.14; g.add(br);
  // merlons
  for(let i=0;i<4;i++){
    const a=(i/4)*Math.PI*2+Math.PI/4;
    const mn=mesh(box(.22,.33,.18),sm);
    mn.position.set(Math.cos(a)*.54,2.42,Math.sin(a)*.54); g.add(mn);
  }
  // cone roof
  const cr=mesh(cone(.56,.95,8),dm); cr.position.y=3.05; g.add(cr);
  // tip crystal
  const tc=mesh(oct(.14),pm); tc.position.y=3.65; g.add(tc);
  const l=ptLight(0x8844FF,.7,5); l.position.y=3.65; g.add(l);
  return g;
}

function mkCannonTower(){
  const g=new THREE.Group();
  const sm=mat(0x696969); const bm=mat(0x2A2A2A);
  const base=mesh(cyl(.58,.76,1.55,8),sm); base.position.y=.78; g.add(base);
  const plat=mesh(cyl(.72,.68,.24,8),sm); plat.position.y=1.67; g.add(plat);
  // cannon
  const can=mesh(cyl(.1,.13,.95,8),bm); can.rotation.z=Math.PI/2; can.position.set(.72,1.67,0); g.add(can);
  // wheel pair
  for(let side of[.13,-.13]){
    const w=mesh(torus(.18,.04,6,12),bm); w.position.set(.38,1.45,side); w.rotation.y=Math.PI/2; g.add(w);
  }
  return g;
}

function mkWall(){
  const g=new THREE.Group();
  const sm=mat(0x888888);
  const w=mesh(box(2,.95,.38),sm); w.position.y=.47; g.add(w);
  for(let x of[-.68,0,.68]){
    const mn=mesh(box(.36,.36,.48),sm); mn.position.set(x,1.12,0); g.add(mn);
  }
  return g;
}

function mkBarracks(){
  const g=new THREE.Group();
  const wm=mat(0x8B4513); const rm=mat(0x8B1A1A); const dm=mat(0x3A1A05);
  const base=mesh(box(1.8,1.0,1.6),wm); base.position.y=.5; g.add(base);
  const found=mesh(box(2.0,.18,1.8),mat(0x9A9080)); found.position.y=.09; g.add(found);
  const roof=mesh(cone(1.3,.68,4),rm); roof.rotation.y=Math.PI/4; roof.position.y=1.34; g.add(roof);
  const door=mesh(box(.38,.58,.1),dm); door.position.set(0,.29,.85); g.add(door);
  return g;
}

function mkShipyard(){
  const g=new THREE.Group();
  const wm=mat(0x7B4A1A); const bm=mat(0x4A7ABB); const dm=mat(0x2A1008);
  const main=mesh(box(2.0,1.2,1.8),wm); main.position.y=.6; g.add(main);
  const roof=mesh(cone(1.5,.8,4),bm); roof.rotation.y=Math.PI/4; roof.position.y=1.6; g.add(roof);
  const dock=mesh(box(2.5,.1,1.2),dm); dock.position.set(0,.05,1.45); g.add(dock);
  // crane
  const arm=mesh(cyl(.045,.045,1.5,6),dm); arm.rotation.z=-Math.PI/4; arm.position.set(.5,1.8,0); g.add(arm);
  return g;
}

function mkCrystalForge(){
  const g=new THREE.Group();
  const sm=mat(0x5A4060); const cm=mat(0xCC88FF,0x8800CC,.8);
  const base=mesh(cyl(.68,.82,1.0,6),sm); base.position.y=.5; g.add(base);
  // crystal cluster
  for(let i=0;i<5;i++){
    const a=(i/5)*Math.PI*2;
    const c=mesh(oct(.18+Math.random()*.1),cm);
    c.position.set(Math.cos(a)*.28, 1.0+Math.random()*.38, Math.sin(a)*.28);
    c.rotation.y=Math.random()*Math.PI; g.add(c);
  }
  const center=mesh(oct(.32),cm); center.position.y=1.48; g.add(center);
  const l=ptLight(0xCC44FF,.9,6); l.position.y=1.5; g.add(l);
  return g;
}

function mkLighthouse(){
  const g=new THREE.Group();
  // base
  const base=mesh(cyl(0.4,0.6,0.8,8),mat(0xDDDDCC)); base.position.y=0.4; g.add(base);
  // tower shaft
  const shaft=mesh(cyl(0.28,0.38,3.0,8),mat(0xF5F5EE)); shaft.position.y=2.2; g.add(shaft);
  // lamp room
  const lamp=mesh(cyl(0.42,0.42,0.35,8),mat(0x888866)); lamp.position.y=3.55; g.add(lamp);
  // glass dome
  const dome=mesh(sphere(0.3,8),mat(0xFFEE88,0xFFAA00,1.2)); dome.position.y=3.85; g.add(dome);
  // beacon light
  const bl=ptLight(0xFFDD44,1.4,35); bl.position.y=3.85; g.add(bl);
  g._beaconLight=bl;
  // railing ring
  const rail=mesh(torus(0.44,0.04,6,14),mat(0x888866)); rail.position.y=3.38; rail.rotation.x=Math.PI/2; g.add(rail);
  return g;
}

function mkHarbor(){
  const g=new THREE.Group();
  // main building
  const main=mesh(box(2.0,1.1,1.5),mat(0x7B5A2A)); main.position.y=0.55; g.add(main);
  // blue roof
  const roof=mesh(cone(1.4,0.7,4),mat(0x2255AA)); roof.rotation.y=Math.PI/4; roof.position.y=1.55; g.add(roof);
  // dock platform
  const dock=mesh(box(2.8,0.1,0.9),mat(0x3A2A10)); dock.position.set(0,0.05,1.2); g.add(dock);
  // dock posts x4
  const pm=mat(0x2A1A08);
  const p1=mesh(cyl(0.06,0.06,0.7,5),pm); p1.position.set( 0.8,0.35,1.55); g.add(p1);
  const p2=mesh(cyl(0.06,0.06,0.7,5),pm); p2.position.set(-0.8,0.35,1.55); g.add(p2);
  const p3=mesh(cyl(0.06,0.06,0.7,5),pm); p3.position.set( 0.3,0.35,1.55); g.add(p3);
  const p4=mesh(cyl(0.06,0.06,0.7,5),pm); p4.position.set(-0.3,0.35,1.55); g.add(p4);
  // coin glow
  const l=ptLight(0xFFDD00,0.5,4); l.position.y=1.2; g.add(l);
  return g;
}

function mkBallista(){
  const g=new THREE.Group();
  // base
  const base=mesh(cyl(0.55,0.72,1.4,8),mat(0x7A6A50)); base.position.y=0.7; g.add(base);
  // pivot block
  const pivot=mesh(box(0.7,0.35,0.7),mat(0x5A4A38)); pivot.position.y=1.57; g.add(pivot);
  // bow left arm
  const larm=mesh(cyl(0.05,0.05,1.1,5),mat(0x8B6914));
  larm.rotation.z=Math.PI/6; larm.position.set(-0.48,1.7,0); g.add(larm);
  // bow right arm
  const rarm=mesh(cyl(0.05,0.05,1.1,5),mat(0x8B6914));
  rarm.rotation.z=-Math.PI/6; rarm.position.set(0.48,1.7,0); g.add(rarm);
  // stock
  const stock=mesh(cyl(0.07,0.07,1.2,5),mat(0x6B4A14));
  stock.rotation.z=Math.PI/2; stock.position.set(0.5,1.62,0); g.add(stock);
  // bolt
  const bolt=mesh(cyl(0.04,0.04,0.9,5),mat(0x2A1A08));
  bolt.rotation.z=Math.PI/2; bolt.position.set(0.2,1.7,0); g.add(bolt);
  // light
  const l=ptLight(0x884400,0.4,4); l.position.y=1.7; g.add(l);
  return g;
}

function mkGhostShip(enemy=true){
  const g=new THREE.Group();
  // hull — transparent
  const hullMat=new THREE.MeshLambertMaterial({color:0xCCDDEE,emissive:0x4488BB,emissiveIntensity:0.6,transparent:true,opacity:0.55});
  const hull=mesh(box(2.2,0.55,0.88),hullMat); hull.position.y=0.28; g.add(hull);
  // mast
  const mastMat=new THREE.MeshLambertMaterial({color:0xBBCCDD,emissive:0x3366AA,emissiveIntensity:0.4,transparent:true,opacity:1.0});
  const mast=mesh(cyl(0.05,0.05,2.6,5),mastMat); mast.position.y=1.6; g.add(mast);
  // sail
  const sailMat=new THREE.MeshLambertMaterial({color:0xDDEEFF,emissive:0x6699CC,emissiveIntensity:0.5,transparent:true,opacity:0.5,side:THREE.DoubleSide});
  const sail=mesh(plane(1.1,1.4),sailMat); sail.position.set(0,1.8,0); g.add(sail);
  // ghostly glow
  const l=ptLight(0x88AAFF,0.8,6); l.position.y=1.0; g.add(l);
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}

function mkBombSloop(enemy=true){
  const g=new THREE.Group();
  // hull
  const hull=mesh(box(1.6,0.45,0.68),mat(0xAA2200)); hull.position.y=0.23; g.add(hull);
  // deck trim
  const trim=mesh(box(1.7,0.08,0.75),mat(0x881800)); trim.position.y=0.5; g.add(trim);
  // mast
  const mast=mesh(cyl(0.05,0.05,1.8,5),mat(0x442200)); mast.position.y=1.2; g.add(mast);
  // skull flag
  const flagMat=new THREE.MeshLambertMaterial({color:0xFF0000,emissive:0xCC0000,emissiveIntensity:0.8,side:THREE.DoubleSide});
  const flag=mesh(plane(0.4,0.28),flagMat); flag.position.set(0,2.15,0); g.add(flag);
  // barrel
  const barrel=mesh(cyl(0.22,0.22,0.38,8),mat(0x3A2A10)); barrel.position.set(0.3,0.6,0); g.add(barrel);
  // fuse — slightly angled
  const fuseMat=mat(0xFF6600,0xFF3300,1.5);
  const fuse=mesh(cyl(0.02,0.02,0.4,4),fuseMat);
  fuse.rotation.z=0.2; fuse.position.set(0.3,0.82,0); g.add(fuse);
  // red glow
  const l=ptLight(0xFF3300,0.7,5); l.position.y=0.6; g.add(l);
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}

function mkUndeadGalleon(enemy=true){
  const g=new THREE.Group();
  // hull
  const hull=mesh(box(3.8,0.9,1.4),mat(0x1A2410,0x002200,0.3)); hull.position.y=0.45; g.add(hull);
  // top deck
  const deck=mesh(box(3.5,0.15,1.3),mat(0x0F1A0C)); deck.position.y=0.95; g.add(deck);
  // fore castle
  const fore=mesh(box(1.0,0.7,1.2),mat(0x1A2410)); fore.position.set(-1.5,1.3,0); g.add(fore);
  // aft castle
  const aft=mesh(box(1.1,0.8,1.2),mat(0x1A2410)); aft.position.set(1.5,1.35,0); g.add(aft);
  // mast 1
  const m1=mesh(cyl(0.1,0.1,3.8,6),mat(0x0A0F08)); m1.position.set(0.5,2.85,0); g.add(m1);
  // mast 2
  const m2=mesh(cyl(0.08,0.08,3.2,6),mat(0x0A0F08)); m2.position.set(-0.8,2.55,0); g.add(m2);
  // void sail
  const sailMat=new THREE.MeshLambertMaterial({color:0x001a00,emissive:0x00AA44,emissiveIntensity:0.7,transparent:true,opacity:0.85,side:THREE.DoubleSide});
  const sail=mesh(plane(1.8,2.0),sailMat); sail.position.set(0.5,2.8,0); g.add(sail);
  // void crystal on bow
  const crystal=mesh(oct(0.28),mat(0x00FF88,0x00BB44,2.0)); crystal.position.set(-2.1,1.1,0); g.add(crystal);
  // green glow
  const l=ptLight(0x00FF44,1.2,12); l.position.y=1.5; g.add(l);
  // cannons x6: z=±0.7 at x=-1,0,1 at y=0.75
  const cm=mat(0x1A1A10);
  for(let cx of[-1,0,1]){
    for(let cz of[0.7,-0.7]){
      const c=mesh(cyl(0.08,0.1,0.6,6),cm);
      c.rotation.z=Math.PI/2; c.position.set(cx,0.75,cz); g.add(c);
    }
  }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}

/* dispatch */
const BLDG_MAKERS = {
  wizard_tower: mkWizardTower,
  cannon_tower: mkCannonTower,
  wall:         mkWall,
  barracks:     mkBarracks,
  shipyard:     mkShipyard,
  crystal_forge:mkCrystalForge,
  lighthouse:   mkLighthouse,
  harbor:       mkHarbor,
  ballista_tower: mkBallista,
};
function mkBuilding(type){ return (BLDG_MAKERS[type]||mkWizardTower)(); }

/* ══ Units ════════════════════════════════════════════ */
function mkWizardUnit(enemy=false){
  const g=new THREE.Group();
  const robeMat=mat(enemy?0xCC2200:0x2244AA);
  const skinMat=mat(0xFFCCA0);
  const hatMat =mat(enemy?0x880000:0x111144);
  const stfMat =mat(0x8B6914);
  const cryMat =mat(enemy?0xFF4400:0x66AAFF, enemy?0xCC2200:0x3366AA, .6);
  // body
  const body=mesh(cyl(.19,.28,.78,8),robeMat); body.position.y=.39; g.add(body);
  // head
  const head=mesh(sphere(.19,8),skinMat); head.position.y=1.08; g.add(head);
  // hat brim+top
  const hb=mesh(cyl(.21,.21,.05,8),hatMat); hb.position.y=1.26; g.add(hb);
  const ht=mesh(cone(.16,.42,8),hatMat); ht.position.y=1.5; g.add(ht);
  // staff
  const st=mesh(cyl(.024,.024,1.28,6),stfMat); st.position.set(.26,.64,0); st.rotation.z=.1; g.add(st);
  const sc=mesh(oct(.075),cryMat); sc.position.set(.28,1.35,0); g.add(sc);
  return g;
}

function mkPirateUnit(){
  const g=new THREE.Group();
  const shMat=mat(0xCC3311); const ptMat=mat(0x222244);
  const skMat=mat(0xCCA070); const haMat=mat(0x111111); const swMat=mat(0xAAAAAA);
  const body=mesh(box(.33,.5,.28),shMat); body.position.y=.35; g.add(body);
  const legs=mesh(box(.33,.32,.28),ptMat); legs.position.y=.06; g.add(legs);
  const head=mesh(sphere(.17,8),skMat); head.position.y=.83; g.add(head);
  const hat=mesh(cyl(.19,.14,.19,3),haMat); hat.position.y=1.07; hat.rotation.y=Math.PI/6; g.add(hat);
  const sw=mesh(box(.055,.58,.038),swMat); sw.position.set(.27,.38,0); sw.rotation.z=.28; g.add(sw);
  return g;
}

function mkGolem(){
  const g=new THREE.Group();
  const sm=mat(0x8888AA,0x4444CC,.2);
  const body=mesh(box(.7,1.1,.5),sm); body.position.y=.55; g.add(body);
  const head=mesh(sphere(.28,8),sm); head.position.y=1.38; g.add(head);
  const larm=mesh(box(.22,.7,.22),sm); larm.position.set(-.46,.55,.0); g.add(larm);
  const rarm=mesh(box(.22,.7,.22),sm); rarm.position.set( .46,.55,.0); g.add(rarm);
  const l=ptLight(0x6666FF,.5,4); l.position.y=1; g.add(l);
  return g;
}

/* ══ Ships ════════════════════════════════════════════ */
function mkSloop(enemy=true){
  const g=new THREE.Group();
  const hm=mat(enemy?0x221005:0x5C3A1A);
  const dm=mat(enemy?0x3D2008:0x7A5230);
  const sm=mat(enemy?0xCC1111:0xEEEECC); sm.side=THREE.DoubleSide;
  const mm=mat(0x5C3A15);
  // hull
  const hull=mesh(box(1.38,.54,3.2),hm); g.add(hull);
  // deck
  const deck=mesh(box(1.28,.1,3.0),dm); deck.position.y=.32; g.add(deck);
  // mast
  const mast=mesh(cyl(.054,.054,3.4,7),mm); mast.position.set(0,2.04,.18); g.add(mast);
  // yard
  const yard=mesh(cyl(.038,.038,1.4,7),mm); yard.rotation.z=Math.PI/2; yard.position.set(0,3.18,.18); g.add(yard);
  // sail
  const sail=mesh(plane(1.18,1.75),sm); sail.position.set(0,2.38,.18); g.add(sail);
  // bowsprit
  const bow=mesh(cyl(.038,.038,1.45,6),mm); bow.rotation.x=Math.PI/5; bow.position.set(0,.68,-2.08); g.add(bow);
  // cannons
  const cm2=mat(0x333333);
  for(let sx of[.74,-.74]){
    const c=mesh(cyl(.07,.09,.58,7),cm2); c.rotation.z=Math.PI/2; c.position.set(sx,.24,.28); g.add(c);
  }
  if(enemy){ const fl=mesh(plane(.48,.33),mat(0x111111)); fl.material.side=THREE.DoubleSide; fl.position.set(.28,3.62,.18); g.add(fl); }
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; } });
  return g;
}

function mkFrigate(enemy=true){
  const g=new THREE.Group();
  const hm=mat(enemy?0x1A0A04:0x4A2C10);
  const dm=mat(enemy?0x2C1006:0x6A4A22);
  const sm=mat(enemy?0x991111:0xDDDDBB); sm.side=THREE.DoubleSide;
  const mm=mat(0x4A2A0A); const cm=mat(0x2A2A2A);
  // hull
  const hull=mesh(box(2.0,.8,5.0),hm); g.add(hull);
  const deck=mesh(box(1.8,.1,4.6),dm); deck.position.y=.45; g.add(deck);
  // two masts
  for(let mz of[-.5,1.2]){
    const ma=mesh(cyl(.068,.068,4.5,7),mm); ma.position.set(0,2.7,mz); g.add(ma);
    const ya=mesh(cyl(.048,.048,1.8,7),mm); ya.rotation.z=Math.PI/2; ya.position.set(0,3.98,mz); g.add(ya);
    const sa=mesh(plane(1.6,2.2),sm); sa.position.set(0,3.0,mz); g.add(sa);
  }
  // cannons
  for(let sx of[1.08,-1.08]){
    for(let cz of[-1.0,0,1.0]){
      const c=mesh(cyl(.08,.11,.68,7),cm); c.rotation.z=Math.PI/2; c.position.set(sx,.24,cz); g.add(c);
    }
  }
  if(enemy){ const fl=mesh(plane(.58,.38),mat(0x111111)); fl.material.side=THREE.DoubleSide; fl.position.set(.34,4.78,-.5); g.add(fl); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}

function mkGalleon(enemy=true){
  const g=new THREE.Group();
  const hm=mat(enemy?0x110404:0x3A1A08);
  const dm=mat(enemy?0x1C0A06:0x5A3018);
  const sm=mat(enemy?0x660000:0xCCCC88); sm.side=THREE.DoubleSide;
  const mm=mat(0x3A1E08); const cm=mat(0x1A1A1A); const gm=mat(0xDAA520);
  // hull
  const hull=mesh(box(3.0,1.2,7.0),hm); g.add(hull);
  const deck=mesh(box(2.8,.15,6.6),dm); deck.position.y=.68; g.add(deck);
  // fore/sterncastle
  const fc=mesh(box(2.4,.6,1.8),dm); fc.position.set(0,1.1,-2.2); g.add(fc);
  const sc=mesh(box(2.4,1.0,2.0),dm); sc.position.set(0,1.22,2.3); g.add(sc);
  // three masts
  for(let [mz,mh,sw] of[[-1.8,4.5,1.6],[.3,5.5,2.2],[2.0,4.5,1.6]]){
    const ma=mesh(cyl(.085,.085,mh,8),mm); ma.position.set(0,mh/2+.8,mz); g.add(ma);
    const ya=mesh(cyl(.058,.058,sw,7),mm); ya.rotation.z=Math.PI/2; ya.position.set(0,mh-.5+.8,mz); g.add(ya);
    const sa=mesh(plane(sw,2.5),sm); sa.position.set(0,mh/2+1.0,mz); g.add(sa);
  }
  // cannons
  for(let sx of[1.58,-1.58]){
    for(let cz of[-2.0,-.8,.4,1.6]){
      const c=mesh(cyl(.088,.12,.88,7),cm); c.rotation.z=Math.PI/2; c.position.set(sx,.3,cz); g.add(c);
    }
  }
  // gold trim
  const tr=mesh(box(3.05,.07,7.05),gm); tr.position.y=.54; g.add(tr);
  if(enemy){ const fl=mesh(plane(.8,.52),mat(0x990000,0x330000,.5)); fl.material.side=THREE.DoubleSide; fl.position.set(.4,6.2,.3); g.add(fl); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}

/* ══ Projectiles & FX ═════════════════════════════════ */
function mkProjectile(type){
  if(type==='magic'){
    const g=new THREE.Group();
    g.add(mesh(sphere(.11,8),mat(0x88AAFF,0x4466FF,1.0)));
    const l=ptLight(0x4466FF,.7,3.5); g.add(l);
    return g;
  }
  if(type==='cannon'){
    return mesh(sphere(.13,7),mat(0x1A1A1A));
  }
  if(type==='fire'){
    const g=new THREE.Group();
    g.add(mesh(sphere(.18,8),mat(0xFF6600,0xFF2200,1.0)));
    const l=ptLight(0xFF4400,.9,5); g.add(l);
    return g;
  }
  if(type==='lightning'){
    return mesh(sphere(.15,6),mat(0xFFFF00,0xFFEE00,1.0));
  }
  return mesh(sphere(.1,6),mat(0xFFFFFF));
}

/* ══ Enemy Island decorative models ══════════════════ */
function mkEnemyIsland(radius=8){
  const g=new THREE.Group();
  // terrain disc
  const geo=new THREE.CylinderGeometry(radius,.8*radius,1.2,24);
  const m=mesh(geo,mat(0x8B4513));
  m.position.y=-.6; g.add(m);
  // top surface
  const top=mesh(new THREE.CylinderGeometry(radius,.8*radius,.15,24),mat(0x5A3510));
  g.add(top);
  // fortifications: skull tower
  const t1=mesh(cyl(.8,1.0,3.5,8),mat(0x3A3030)); t1.position.set(0,1.75,0); g.add(t1);
  const tc=mesh(cone(.9,1.0,8),mat(0x1A0A0A)); tc.position.set(0,3.5,0); g.add(tc);
  // perimeter spikes
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2;
    const sp=mesh(cone(.25,.8,5),mat(0x2A2020));
    sp.position.set(Math.cos(a)*(radius-.8),0.8,Math.sin(a)*(radius-.8));
    g.add(sp);
  }
  return g;
}

function mkPlayerIslandBase(radius=8.5){
  const g=new THREE.Group();
  const disc=mesh(new THREE.CylinderGeometry(radius,.75*radius,1.4,32),mat(0x5C3A1A));
  disc.position.y=-.7; g.add(disc);
  return g;
}
