// ══════════════════════════════════════════════════════════════
//  story.js – Crystal Archipelago 2.0 – Full 15-Chapter Campaign
// ══════════════════════════════════════════════════════════════
'use strict';

const STORY = {
  chapters: [

    // ═══════════════════════════════════════════════════════════
    //  ACT 1 — THE CORSAIR WAR  (Chapters 1–5, Emerald Isle)
    // ═══════════════════════════════════════════════════════════

    {
      id: 1, act: 1, island: 'emerald',
      title: 'The Awakening',
      sub:   'Peril strikes the Crystal Archipelago',
      objectives: [
        { id:'wood30',  text:'Harvest 30 Wood',      type:'resource', resource:'wood',   target:30 },
        { id:'stone20', text:'Harvest 20 Stone',      type:'resource', resource:'stone',  target:20 },
        { id:'tower1',  text:'Build a Wizard Tower',  type:'building', building:'wizard_tower', target:1 },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:2}], pirates:3 }
      ],
      intro: [
        { speaker:'Elder Meryn', portrait:'👴', text:'Wizard! Wake up! The Crimson Corsairs\' sails have been spotted on the northern horizon — three ships, moving fast. They\'ll reach Emerald Isle by dawn.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'The Crystal Archipelago has stood for a thousand years, but our defences lie in ruins. We need you to rebuild them — quickly. Every minute counts.' },
        { speaker:'You', portrait:'🧙', text:'What must I do, Elder?' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Harvest wood from the forests and stone from the cliffs. Build a Wizard Tower before they arrive. Click the trees and rocks to gather resources, then switch to Build Mode. Go — there is no time to waste!' },
      ],
      waveStart: [
        { speaker:'Elder Meryn', portrait:'👴', text:'Enemy sails on the horizon! To your posts, wizard — let the towers do the talking!' },
      ],
      complete: [
        { speaker:'Elder Meryn', portrait:'👴', text:'Well done! The first wave is broken. But this is only their vanguard. The main fleet is already massing at Skull Rock.' },
        { speaker:'You', portrait:'🧙', text:'How many ships do they have?' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Too many. But we have something they do not — the Crystal magic of these islands. Keep building, wizard. We are only just beginning.' },
      ],
      bonusRes: { wood:30, stone:20, crystal:5, gold:50 },
    },

    {
      id: 2, act: 1, island: 'emerald',
      title: 'Gathering Storm',
      sub:   'Reinforce before the fleet arrives',
      objectives: [
        { id:'cannon2', text:'Build 2 Cannon Towers', type:'building', building:'cannon_tower', target:2 },
        { id:'wall3',   text:'Build 3 Stone Walls',   type:'building', building:'wall',          target:3 },
        { id:'surv2',   text:'Survive the assault',   type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:3},{type:'frigate',count:1}], pirates:5 }
      ],
      intro: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'My lord! A scout eagle reports a fleet of seven ships departing Skull Rock. We have perhaps an hour — maybe less.' },
        { speaker:'You', portrait:'🧙', text:'Wizard towers alone will not be enough. We need cannons and walls to channel their pirates.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Correct. Construct cannon towers along the shore and stone walls to create kill-zones. And harvest more crystal — your spells will be essential this time.' },
      ],
      waveStart: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Seven sails spotted! Frigates with sloop escorts — they mean business! All towers, open fire!' },
        { speaker:'You', portrait:'🧙', text:'HOLD THE LINE!' },
      ],
      complete: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'They\'re retreating! Ha! That\'ll teach those corsairs to tangle with Emerald Isle!' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Good — but look to the distant horizon. Something larger stirs. The Pirate King himself is watching.' },
        { speaker:'You', portrait:'🧙', text:'Then we need more power. The Crystal Forge...' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Yes. And there is someone who may help us further. The Sea Witch of Coral Cove owes me a favour from long ago.' },
      ],
      bonusRes: { wood:40, stone:30, crystal:15, gold:80 },
    },

    {
      id: 3, act: 1, island: 'emerald',
      title: 'The Sea Witch\'s Gift',
      sub:   'An unexpected alliance',
      objectives: [
        { id:'forge1',    text:'Build Crystal Forge',      type:'building', building:'crystal_forge', target:1 },
        { id:'crystal25', text:'Harvest 25 Crystal',       type:'resource', resource:'crystal', target:25 },
        { id:'surv3',     text:'Survive the great assault', type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:4},{type:'frigate',count:2}], pirates:6 }
      ],
      intro: [
        { speaker:'Syrenna', portrait:'🧜', text:'Wizard of Emerald Isle. I am Syrenna — Warden of the Deep Tides. Elder Meryn calls in his debt to me, and so I come.' },
        { speaker:'You', portrait:'🧙', text:'We need your help. The Pirate King threatens every island in the Archipelago, including yours.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I know. I have watched their fleet grow for years. Build your Crystal Forge and I will teach you the Storm Calling — a great art not seen in three centuries. It will not disappoint.' },
        { speaker:'Syrenna', portrait:'🧜', text:'But be warned: the Pirate King sails a cursed galleon — the \'Void Tide\' — powered by stolen crystal magic. What you face today is merely its vanguard.' },
      ],
      waveStart: [
        { speaker:'Syrenna', portrait:'🧜', text:'The Void Tide sends its captains ahead! Ten ships approach! Use every spell at your disposal!' },
        { speaker:'You', portrait:'🧙', text:'STORM, HEAR ME!' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'Magnificent. The Storm Calling served you well. But the Void Tide itself escaped into the fog...' },
        { speaker:'You', portrait:'🧙', text:'Then we must go to them. We\'ll build ships and take the fight to Skull Rock.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Are you certain? Their fortress is heavily defended.' },
        { speaker:'You', portrait:'🧙', text:'If we don\'t end this now they\'ll keep coming back stronger. It ends at Skull Rock.' },
      ],
      bonusRes: { wood:50, stone:40, crystal:20, gold:100 },
    },

    {
      id: 4, act: 1, island: 'emerald',
      title: 'The Corsair\'s Lair',
      sub:   'Carry the battle to the enemy',
      objectives: [
        { id:'yard1',    text:'Build a Shipyard',        type:'building', building:'shipyard', target:1 },
        { id:'ships2',   text:'Build 2 Ships',           type:'ships',    target:2 },
        { id:'conquer1', text:'Capture Isle of Crimson', type:'conquer',  island:0 },
      ],
      waveCount: 0,
      waves: [],
      intro: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'The shipyard timbers are ready, my lord. We\'ve gathered enough lumber to build a proper assault fleet.' },
        { speaker:'You', portrait:'🧙', text:'What do you know of Skull Rock, Quinn?' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Their main anchorage. Three cannon towers on the cliffs, a garrison of two hundred pirates, and the Void Tide in the harbour. It won\'t be easy.' },
        { speaker:'You', portrait:'🧙', text:'Nothing worth doing ever is. Build the ships — we sail at high tide.' },
      ],
      conquestStart: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Skull Rock ahead! All hands to battle stations! Gunners — open fire on those cliff towers!' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'HAHAHA! The wizard comes to ME! How touching. Fire the Void Tide\'s cannons — SHOW THEM WHAT CURSED POWER FEELS LIKE!' },
      ],
      complete: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Their banner falls! Skull Rock is ours!' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'(escaping) You haven\'t seen the last of me, wizard! The Pirate King will hear of this!' },
        { speaker:'You', portrait:'🧙', text:'Let him hear. Let him come. We\'ll be ready.' },
        { speaker:'Syrenna', portrait:'🧜', text:'One island taken. But the Pirate King\'s fortress — the Dread Citadel — still stands. The final battle awaits, wizard.' },
      ],
      bonusRes: { wood:60, stone:50, crystal:30, gold:150 },
    },

    {
      id: 5, act: 1, island: 'emerald',
      title: 'The Final Reckoning',
      sub:   'End the Corsair threat forever',
      objectives: [
        { id:'boss', text:'Defeat the Pirate King', type:'boss' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:5},{type:'frigate',count:3},{type:'galleon',count:1}], pirates:8, isBoss:true }
      ],
      intro: [
        { speaker:'Elder Meryn', portrait:'👴', text:'The Pirate King himself sets sail. His armada — twenty ships — approaches from the west. Our scouts count the Void Tide at their head.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I sense the crystal power within it… it has been greatly amplified. This will be unlike anything we\'ve faced before.' },
        { speaker:'You', portrait:'🧙', text:'Then we make our final stand here, on Emerald Isle, where our power is greatest. Ready all defences — this ends today.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'All hands, battle ready! For the Crystal Archipelago!' },
      ],
      waveStart: [
        { speaker:'Pirate King Dread', portrait:'💀', text:'WIZARD! I am Malvaro Dread — Scourge of a Hundred Seas! Your islands will FALL, your crystals will be MINE, and your magic will serve ME!' },
        { speaker:'You', portrait:'🧙', text:'You have pillaged these waters long enough, Dread. This is where it ends.' },
        { speaker:'Pirate King Dread', portrait:'💀', text:'Bold words from someone about to become fish food! ATTACK! SINK THIS ISLAND INTO THE SEA!' },
      ],
      victory: [
        { speaker:'You', portrait:'🧙', text:'It\'s over, Dread. Your fleet is scattered. Surrender.' },
        { speaker:'Pirate King Dread', portrait:'💀', text:'…Impossible. My Void Tide… you destroyed it… Very well. The sea is yours, wizard.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'The Crystal Archipelago is saved. Peace returns to these waters — thanks to you.' },
        { speaker:'Syrenna', portrait:'🧜', text:'The crystals sing again, freely, without fear. This was well done, wizard. Very well done.' },
      ],
      complete: [
        { speaker:'Elder Meryn', portrait:'👴', text:'The first war is won. But Syrenna senses something deeper — the Void Tide was not truly destroyed. It transformed.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I felt it. The crystal energy dispersed but did not vanish. It went... somewhere else. Somewhere dark and deep.' },
        { speaker:'You', portrait:'🧙', text:'Then we follow it. Whatever it became, whatever corrupted these waters — we finish this.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'(appearing from shadows) I know where it went, wizard. I\'ve seen things in the volcanic vents south of here that would turn your beard white. Let me show you.' },
      ],
      bonusRes: { wood:0, stone:0, crystal:0, gold:0 },
    },

