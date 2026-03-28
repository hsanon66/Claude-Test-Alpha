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

    // ═══════════════════════════════════════════════════════════
    //  ACT 2 — THE CURSED DEPTHS  (Chapters 6–10, Ashfall Isle)
    // ═══════════════════════════════════════════════════════════

    {
      id: 6, act: 2, island: 'volcanic',
      title: 'Ashes of Skull Rock',
      sub:   'A new shore, a new threat',
      objectives: [
        { id:'wood40',   text:'Harvest 40 Wood',      type:'resource', resource:'wood',  target:40 },
        { id:'stone30',  text:'Harvest 30 Stone',      type:'resource', resource:'stone', target:30 },
        { id:'towers2',  text:'Build 2 Wizard Towers', type:'building', building:'wizard_tower', target:2 },
        { id:'surv6',    text:'Survive the assault',   type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:3},{type:'frigate',count:1}], pirates:4 }
      ],
      intro: [
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Welcome to Ashfall Isle, wizard. I know these volcanic shores better than any man alive — or dead. I watched the Void Tide sail into the central vent three nights ago.' },
        { speaker:'You', portrait:'🧙', text:'You switched sides rather quickly, Ironhook. Why should I trust you?' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Because my crew is down there. Every one of them. Whatever the Void Tide became, it took them with it. I want them back — or I want revenge. Either way, our goals align.' },
        { speaker:'Syrenna', portrait:'🧜', text:'He speaks truth, wizard. I sense no deception — only grief. The dark energy from the Void Tide has already begun corrupting the undead pirates that patrol these shores. Be on your guard.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Build your defences quickly. Ashfall Isle is strange terrain — the rock is harder but the forest thinner. And I\'ve heard reports of... unusual ships in the mist.' },
      ],
      waveStart: [
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'There! Those aren\'t living pirates — they\'re the crew of ships lost in these waters years ago, risen again! Void-touched, every one of them!' },
        { speaker:'You', portrait:'🧙', text:'Towers, open fire! Show these undead what crystal magic can do!' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'The scout wave is broken. But I sense something far larger stirring beneath the volcano. There is a cache of crystal deep in the rock — ancient, powerful, and very wrong.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'That\'ll be what the Void Tide was after. The volcano has been feeding it. We need to cut off that supply before more undead rise.' },
        { speaker:'You', portrait:'🧙', text:'Then we fortify and push deeper. Whatever is down there — we pull it out by the roots.' },
      ],
      bonusRes: { wood:45, stone:35, crystal:20, gold:120 },
    },

    {
      id: 7, act: 2, island: 'volcanic',
      title: 'The Lava Channels',
      sub:   'The volcano awakens',
      objectives: [
        { id:'cannon3',  text:'Build 3 Cannon Towers', type:'building', building:'cannon_tower', target:3 },
        { id:'barracks1',text:'Build a Barracks',       type:'building', building:'barracks',     target:1 },
        { id:'crystal30',text:'Harvest 30 Crystal',     type:'resource', resource:'crystal',      target:30 },
        { id:'surv7',    text:'Survive the assault',    type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:2},{type:'frigate',count:2},{type:'bomb_sloop',count:2}], pirates:5 }
      ],
      intro: [
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Word of warning — the lava channels run close to the surface here. Some parts of the island are more... unstable than others. Build on solid rock where you can.' },
        { speaker:'Syrenna', portrait:'🧜', text:'The Void energy is flowing outward through the channels. It\'s animating more dead ships. And something new — I sense vessels packed with explosive material heading this way.' },
        { speaker:'You', portrait:'🧙', text:'Explosive ships? What do you mean?' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Bomb Sloops. Old trick of the corsairs — fill a ship with black powder barrels, light the fuse, point it at a port and run. Except these ones have nobody left to run. They sail straight in and explode.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'If one of those reaches our buildings... the damage would be catastrophic. We need cannon towers along every approach. Shoot them before they get close.' },
      ],
      waveStart: [
        { speaker:'Commodore Rotgut', portrait:'💀🦴', text:'FLESH AND BONE. You dare claim our volcanic sanctum?! The deep has given us purpose — given us power! SEND IN THE POWDER SHIPS! LET THE ISLAND BURN!' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Rotgut... my old first mate. What did they do to you... FIRE ON THOSE BOMB SLOOPS BEFORE THEY REACH SHORE!' },
      ],
      complete: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'All bomb sloops destroyed before impact! Cannons performed brilliantly.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'That was Rotgut. My first mate — best sailor I ever knew. He died in a storm off the Shattered Cape two years back. Whatever the Void did to him... that wasn\'t him anymore.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I found something. Carved in the basalt near the eastern shore — ancient markings. It is a map. And it points to something called... the Crystal Nexus.' },
        { speaker:'You', portrait:'🧙', text:'What is the Crystal Nexus?' },
        { speaker:'Syrenna', portrait:'🧜', text:'I don\'t know. But whatever is corrupting these waters — the map points to it as the answer. We need to go there.' },
      ],
      bonusRes: { wood:50, stone:45, crystal:30, gold:140 },
    },

    {
      id: 8, act: 2, island: 'volcanic',
      title: 'The Ghost Armada',
      sub:   'Enemies you cannot see',
      objectives: [
        { id:'light2',   text:'Build 2 Lighthouses',   type:'building', building:'lighthouse',    target:2 },
        { id:'wtower3',  text:'Build 3 Wizard Towers', type:'building', building:'wizard_tower',  target:3 },
        { id:'surv8',    text:'Survive both waves',    type:'survive_waves' },
      ],
      waveCount: 2,
      waves: [
        { ships:[{type:'ghost_ship',count:4},{type:'sloop',count:2}], pirates:5 },
        { ships:[{type:'ghost_ship',count:3},{type:'frigate',count:2}], pirates:6 },
      ],
      intro: [
        { speaker:'Syrenna', portrait:'🧜', text:'I need to warn you about what is coming. Ghost ships — vessels crewed by the void-touched, cloaked in a veil of dark crystal energy. Your cannon towers cannot see them. Your eyes cannot see them.' },
        { speaker:'You', portrait:'🧙', text:'Then how do we fight them?' },
        { speaker:'Syrenna', portrait:'🧜', text:'Crystal magic cuts through the veil. Wizard towers can detect them within range. And lighthouses — their beams are infused with ambient crystal energy from the island. Build both, and the ghosts lose their advantage.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Rotgut is sending them in two waves. First wave tests your defences. Second is the real assault. Don\'t let your guard down when the first is beaten — the second will be worse.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'This is unlike anything we have faced before. But you have faced the impossible before and won. Trust your towers. Trust the crystal.' },
      ],
      waveStart: [
        { speaker:'Commodore Rotgut', portrait:'💀🦴', text:'You cannot fight what you cannot see, wizard. My phantom fleet sails THROUGH your walls! Your towers fire at empty air! TAKE THE ISLAND!' },
        { speaker:'You', portrait:'🧙', text:'Light them up! Wizard towers — reveal everything in range!' },
      ],
      waveStart2: [
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'First wave broken! But I see more sails forming in the mist — the second fleet is already moving. Hold your positions!' },
        { speaker:'Commodore Rotgut', portrait:'💀🦴', text:'Impressive. But I have an ENDLESS supply of the dead. How long can you hold, wizard? How long before your crystal runs dry?' },
      ],
      complete: [
        { speaker:'You', portrait:'🧙', text:'Both waves down. Rotgut — wherever you are — your armada is broken.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'He\'ll pull back to the deep vent. That\'s where his power comes from — a crystal down there, old and dark, feeding the void energy up through the rock. We cut that off, we cut HIM off.' },
        { speaker:'Syrenna', portrait:'🧜', text:'Then we go in. I can guide your ships through the underwater channels. But wizard — what we find inside that volcano will not be pleasant.' },
        { speaker:'You', portrait:'🧙', text:'I stopped being pleasant three chapters ago. Let\'s move.' },
      ],
      bonusRes: { wood:55, stone:50, crystal:35, gold:160 },
    },

    {
      id: 9, act: 2, island: 'volcanic',
      title: 'The Heart of the Volcano',
      sub:   'Strike at the source',
      objectives: [
        { id:'yard2',    text:'Build a Shipyard',        type:'building', building:'shipyard', target:1 },
        { id:'ships9',   text:'Build 2 Ships',           type:'ships',    target:2 },
        { id:'conquer9', text:'Breach Ashfall Depths',   type:'conquer',  island:1 },
      ],
      waveCount: 0,
      waves: [],
      intro: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'The underwater route is treacherous — narrow channels, thermal vents, jagged obsidian ridges. But Syrenna says she can get our ships through.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I will guide us. The void crystal at the volcano\'s heart is what sustains Rotgut. Destroy it and the undead army loses its anchor. They\'ll fade back into the deep.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'(quietly) And my crew. They\'ll finally rest. That\'s all I want. Just... let them rest.' },
        { speaker:'You', portrait:'🧙', text:'We\'ll get them there, Ironhook. Build the ships. We sail at nightfall.' },
      ],
      conquestStart: [
        { speaker:'Commodore Rotgut', portrait:'💀🦴', text:'Ironhook. You dare bring the enemy to my door. AFTER EVERYTHING WE SAILED TOGETHER.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'You\'re not my first mate anymore, Rotgut. My first mate knew when a fight was over. Let them go. LET THEM ALL GO.' },
        { speaker:'Commodore Rotgut', portrait:'💀🦴', text:'NEVER. The void gave me purpose. It gave us ALL purpose. You\'ll join us, Ironhook — one way or another!' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'The void crystal is shattered. I can feel the energy dissolving — the undead are fading. It\'s working.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'(long silence) ...They\'re gone. All of them. Back to wherever the dead go when they\'re finally free. (quietly) Rest well, lads.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Rotgut?' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Gone too. He was my best man once. Before the storm. Before all of this. (straightens) Right. What\'s next?' },
        { speaker:'Syrenna', portrait:'🧜', text:'The Crystal Nexus. The map leads there. And the Leviathan — I can feel it stirring, even now. It is old, wizard. Older than the Pirate King. Older than us all. And it is very, very awake.' },
      ],
      bonusRes: { wood:60, stone:55, crystal:40, gold:180 },
    },

    {
      id: 10, act: 2, island: 'volcanic',
      title: 'Return of the Void Tide',
      sub:   'The undead armada rises',
      objectives: [
        { id:'boss10', text:'Destroy the Void Tide', type:'boss' },
        { id:'surv10', text:'Survive both waves',    type:'survive_waves' },
      ],
      waveCount: 2,
      waves: [
        { ships:[{type:'sloop',count:3},{type:'frigate',count:2},{type:'undead_galleon',count:1}], pirates:8, isBoss:true },
        { ships:[{type:'frigate',count:2},{type:'ghost_ship',count:3}], pirates:6 },
      ],
      intro: [
        { speaker:'Elder Meryn', portrait:'👴', text:'Urgent news from the northern scouts — the Void Tide has been sighted again. It is not the same ship. It has been... rebuilt by the void energy. Larger. Darker. Crewed by something that isn\'t pirate or ghost.' },
        { speaker:'Syrenna', portrait:'🧜', text:'It has three phases of attack. First it will orbit and bombard from range. Then it will call things up from the deep — void-touched creatures that attack the shore directly. Then it charges.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Look for the black crystal on the bow. That\'s the void anchor — its source of power. Destroy that and the ship falls apart. Focus your fire.' },
        { speaker:'You', portrait:'🧙', text:'Three phases, one target. Understood. Ironhook — I want you on the shore cannons. Syrenna — keep our buildings shielded. Quinn — hold the perimeter. Let\'s end this.' },
      ],
      waveStart: [
        { speaker:'Commodore Rotgut', portrait:'💀🦴', text:'(voice from everywhere at once) The Void Tide cannot die, wizard. It IS the void. Your island will be unmade, your crystals consumed, your name forgotten by the sea. ATTACK.' },
        { speaker:'You', portrait:'🧙', text:'AIM FOR THE BOW CRYSTAL! EVERYTHING YOU HAVE!' },
      ],
      waveStart2: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Void Tide damaged but still sailing! Second wave incoming — ghost ships covering its retreat! Don\'t let them regroup!' },
        { speaker:'Syrenna', portrait:'🧜', text:'The void anchor is cracking — I can feel it! Keep firing! WE\'RE CLOSE!' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'The Void Tide is destroyed. The void anchor shattered. Rotgut\'s voice... is silent.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Good. Stay silent.' },
        { speaker:'You', portrait:'🧙', text:'What did you mean earlier, Syrenna — something older than all of this?' },
        { speaker:'Syrenna', portrait:'🧜', text:'The Leviathan. It has been awake and watching for centuries. The Pirate King, the Void Tide, Rotgut — they were all its instruments. Tools to harvest crystal energy and feed it. We have starved it twice now.' },
        { speaker:'You', portrait:'🧙', text:'And the third time?' },
        { speaker:'Syrenna', portrait:'🧜', text:'The third time, we go to its home. The Crystal Nexus is not just an ancient ruin — it is a cage. One that has been rotting for three thousand years. We need to rebuild it. And seal the Leviathan inside.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Then go, wizard. All of you. Seal it. Whatever the cost.' },
      ],
      bonusRes: { wood:70, stone:60, crystal:50, gold:200 },
    },

    // ═══════════════════════════════════════════════════════════
    //  ACT 3 — THE ANCIENT RECKONING  (Chapters 11–15, Crystal Nexus)
    // ═══════════════════════════════════════════════════════════

    {
      id: 11, act: 3, island: 'nexus',
      title: 'Ruins of the Ancients',
      sub:   'A forgotten civilization',
      objectives: [
        { id:'wood50',    text:'Harvest 50 Wood',     type:'resource', resource:'wood',    target:50 },
        { id:'stone40',   text:'Harvest 40 Stone',    type:'resource', resource:'stone',   target:40 },
        { id:'crystal30', text:'Harvest 30 Crystal',  type:'resource', resource:'crystal', target:30 },
        { id:'forge11',   text:'Build Crystal Forge', type:'building', building:'crystal_forge', target:1 },
        { id:'surv11',    text:'Survive the assault', type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:4},{type:'frigate',count:2}], pirates:6 }
      ],
      intro: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'I have waited three thousand years for someone to find this place. Welcome, wizard, to the Crystal Nexus — last great work of the Architects.' },
        { speaker:'You', portrait:'🧙', text:'Who are you?' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'I am what remains of the last Architect. A spirit bound to these ruins, keeper of what was built here. The Nexus was designed to contain the Abyss Leviathan — a creature older than the islands themselves, which feeds on crystal energy.' },
        { speaker:'Syrenna', portrait:'🧜', text:'The cage you mentioned. Three thousand years ago they sealed it here?' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Yes. But the seal weakens. Every crystal the pirates harvested, every ship powered by void energy — it fed the Leviathan. Now it stirs beneath us. You must rebuild the five Crystal Pillars of the Nexus. They are the lock. The Leviathan is what lies behind the door.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'So everything. The Pirate King, Rotgut, the Void Tide — all of it was this creature feeding?' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Pieces on a board. It cannot act directly — not yet. But it can whisper. And pirates are very good at listening to whispers that promise power.' },
        { speaker:'You', portrait:'🧙', text:'Five pillars. We build them, we seal it. That\'s the plan.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'That is the plan. But the Leviathan knows you are here. Its servants will come.' },
      ],
      waveStart: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'Ancient pirate wraiths — servants bound to the Leviathan before the seal. They come to prevent restoration of the Nexus. Do not let them reach the Crystal Pillars!' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'All towers, engage! Protect the Chronicler!' },
      ],
      complete: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'The first wave is repelled. You have secured enough ground to begin the work. But do not mistake this for victory — the Leviathan has only begun to test you.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'(via message) How are conditions at the Nexus?' },
        { speaker:'Syrenna', portrait:'🧜', text:'Strange. Magnificent. The crystal formations here are unlike anything in the Archipelago — they sing, Elder Meryn. Literally sing. Like the whole island is alive.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'It is. Or it was. The Leviathan\'s corruption silenced it three thousand years ago. As you rebuild the pillars, the song returns. That is how you will know the seal is holding.' },
      ],
      bonusRes: { wood:70, stone:60, crystal:45, gold:200 },
    },

    {
      id: 12, act: 3, island: 'nexus',
      title: 'The Fractured Shore',
      sub:   'The island tears itself apart',
      objectives: [
        { id:'ballista2', text:'Build 2 Ballista Towers', type:'building', building:'ballista_tower', target:2 },
        { id:'wall5',     text:'Build 5 Stone Walls',     type:'building', building:'wall',           target:5 },
        { id:'surv12',    text:'Survive the assault',     type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'sloop',count:3},{type:'frigate',count:3},{type:'bomb_sloop',count:2}], pirates:8 }
      ],
      intro: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'The Leviathan has begun to act. It cannot reach the surface yet — but it can press against the seafloor beneath us. Some sections of the shore will flood.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'Flood? How much of the island are we talking about?' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'The southern channels first. Then the eastern approach. The Leviathan will try to create waterways for its bomb ships to exploit — routes that bypass your walls. Build the walls now, before the water rises.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'I\'ve sailed enough volcanic coasts to know what a seafloor fracture looks like. We have maybe an hour before the first crack opens. Build fast.' },
        { speaker:'Syrenna', portrait:'🧜', text:'The Architects built something here — I found it in the ruins. A Ballista Tower design. Their weapon against large creatures. Against things like the Leviathan. Study the plans and build them.' },
        { speaker:'You', portrait:'🧙', text:'Ballista Towers. Piercing bolts that hit everything in a line. That could tear through an entire column of ships.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Or through the hide of a Leviathan. Build them, wizard. You will need them before this is done.' },
      ],
      waveStart: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'The ground is shaking — fracture lines opening in the south! And enemy sails on the horizon — bomb sloops in the vanguard! CANNONS AND BALLISTAS, OPEN FIRE!' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Hold the line! Every moment you hold is another moment the Crystal Pillars grow stronger!' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'Shore stabilized. The cracks have stopped spreading — the pillar energy is reinforcing the rock.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'My scouts report something in the deep water north of the island. Something... enormous. Moving slowly. Circling.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'The Leviathan. It surfaces when it believes the seal is weak enough. What your Admiral sees is its shadow at a thousand fathoms. When it rises fully — and it will — every ballista on this island must be ready.' },
        { speaker:'You', portrait:'🧙', text:'Then we keep building. More towers. More walls. More pillars. We don\'t give it a crack to squeeze through.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'I like this wizard. Very practical.' },
      ],
      bonusRes: { wood:75, stone:70, crystal:50, gold:220 },
    },

    {
      id: 13, act: 3, island: 'nexus',
      title: 'The Leviathan Stirs',
      sub:   'From the deep it rises',
      objectives: [
        { id:'ballista3',  text:'Build 3 Ballista Towers', type:'building', building:'ballista_tower', target:3 },
        { id:'lighthouse2',text:'Build 2 Lighthouses',     type:'building', building:'lighthouse',     target:2 },
        { id:'surv13',     text:'Survive the assault',     type:'survive' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'frigate',count:3},{type:'ghost_ship',count:3},{type:'undead_galleon',count:1}], pirates:10 }
      ],
      intro: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'The Leviathan is testing the seal actively now. It sends tendrils — extensions of itself — up through the fractures to probe for weakness. You will see them at the shore. They are not ships. They are part of it.' },
        { speaker:'You', portrait:'🧙', text:'Tentacles.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Yes. The Architects called them tide-arms. They move quickly, they reach far onto land, and ordinary weapons barely scratch them. The Ballista Towers were designed specifically for this — the piercing bolt disrupts the void-flesh binding them together.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I can feel the crystal pillars resonating. We\'re close to full restoration — maybe two more major battles. If we can hold the Leviathan back until the fifth pillar is complete, the seal fires automatically.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Define \'automatically\'.' },
        { speaker:'Syrenna', portrait:'🧜', text:'All five pillars discharge simultaneously. A ring of pure crystal energy that drives the Leviathan back to the abyss and seals it there for another ten thousand years.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'And if it breaks the seal before we finish?' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Then the Crystal Archipelago ceases to exist. So let us make certain that does not happen.' },
      ],
      waveStart: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'CONTACT! Tentacles emerging from the northern shallows — and ships behind them! Ghost ships and a black galleon! BALLISTAS — TARGET THE GALLEON\'S VOID CRYSTAL!' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'*A sound like a thousand ships breaking at once echoes across the water. The Leviathan\'s voice. It knows we are close.*' },
        { speaker:'You', portrait:'🧙', text:'HOLD. EVERYTHING. Let\'s show this thing what three thousand years of waiting gets you.' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'Wave repelled. The Leviathan has retreated — for now. I can feel the fourth pillar beginning to resonate.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'One more. One more battle, and the fifth pillar completes the circuit. Then Syrenna guides the discharge and it ends.' },
        { speaker:'You', portrait:'🧙', text:'It won\'t make it easy. It\'ll send everything it has.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Yes. The final battle will be unlike anything the Archipelago has ever seen. Every fleet it controls, every ghost, every corrupted thing it has spent centuries building — it will send them all.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'Good. I\'m tired of this. Let\'s end it.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'We are with you, wizard. All of us. Whatever comes next — you do not face it alone.' },
      ],
      bonusRes: { wood:80, stone:75, crystal:60, gold:250 },
    },

    {
      id: 14, act: 3, island: 'nexus',
      title: 'All Fleets Converge',
      sub:   'The final armada',
      objectives: [
        { id:'surv14', text:'Survive all three waves', type:'survive_waves' },
      ],
      waveCount: 3,
      waves: [
        { ships:[{type:'sloop',count:5},{type:'frigate',count:2}], pirates:8 },
        { ships:[{type:'frigate',count:3},{type:'ghost_ship',count:3},{type:'bomb_sloop',count:2}], pirates:10 },
        { ships:[{type:'galleon',count:2},{type:'undead_galleon',count:1},{type:'ghost_ship',count:2}], pirates:12 },
      ],
      intro: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'The fifth pillar is almost complete. But the Leviathan has felt it. Every fleet it controls — every corsair ghost, every void-ship, every creature bound to its will — it has called them here. Three waves. All at once, from all directions.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'My lord — I count at least thirty sails on the horizon. Coming from the west, north, and south simultaneously. If they hit us all at once—' },
        { speaker:'You', portrait:'🧙', text:'They won\'t. We\'ll hold each wave until it breaks. Then the next. Then the next.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I\'ll reinforce the crystal pillars between waves. Just keep them away from me long enough to complete the final resonance ritual.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'All my guns. All my cannons. Everything I have. FOR THE ARCHIPELAGO. For every sailor who was ever lost in these waters.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'This is what we built toward. Every tower, every wall, every crystal harvested — it was all for this moment. Make it count, wizard.' },
      ],
      waveStart: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'FIRST FLEET — WEST APPROACH! Sloops and frigates! All towers, concentrate on the western shore — FIRE!' },
      ],
      waveStart2: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'First wave broken! But the second is already moving — GHOST SHIPS in the vanguard, bomb sloops behind them! Wizard towers — reveal them! CANNONS — TARGET ANYTHING THAT GLOWS RED!' },
        { speaker:'Syrenna', portrait:'🧜', text:'Fifth pillar is at seventy percent! HOLD THEM BACK JUST A LITTLE LONGER!' },
      ],
      waveStart3: [
        { speaker:'Admiral Quinn', portrait:'⚓', text:'GALLEONS! The flagships! Two black galleons and an undead behemoth — this is everything they have! THIS IS EVERYTHING! HOLD — THE — LINE!' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'The fifth pillar resonates! Syrenna — begin the final sequence! Just a few more minutes — just hold them a few more minutes!' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'YOU HEARD THEM! NOBODY GETS PAST THIS SHORE! FIRE EVERYTHING!' },
      ],
      complete: [
        { speaker:'Syrenna', portrait:'🧜', text:'THREE WAVES BROKEN! The fifth pillar — it\'s complete! All five are resonating! I can feel it — the circuit is closing—' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'NOT YET. The Leviathan itself is rising. It will not let the seal close without a fight. This is it, wizard. The final confrontation.' },
        { speaker:'You', portrait:'🧙', text:'Then let it come. We\'re ready.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'The sea... the sea is rising around the island. Something enormous is coming up from underneath—' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'The Abyss Leviathan. Three thousand years imprisoned. Three thousand years of hunger. It will throw everything it has left at us. Do not waver.' },
      ],
      bonusRes: { wood:90, stone:85, crystal:70, gold:300 },
    },

    {
      id: 15, act: 3, island: 'nexus',
      title: 'The Final Reckoning',
      sub:   'Seal the Leviathan forever',
      objectives: [
        { id:'leviathan', text:'Defeat the Abyss Leviathan', type:'boss' },
      ],
      waveCount: 1,
      waves: [
        { ships:[{type:'galleon',count:3},{type:'undead_galleon',count:2},{type:'ghost_ship',count:4}], pirates:15, isBoss:true }
      ],
      intro: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'The Crystal Pillars are ready. When the Leviathan is sufficiently weakened, all five will discharge simultaneously. It will be the most powerful crystal event in three thousand years.' },
        { speaker:'You', portrait:'🧙', text:'And if the discharge doesn\'t finish it?' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'It will. I have seen this moment in the crystal patterns since I was bound here. This is the convergence. This has always been the convergence.' },
        { speaker:'Syrenna', portrait:'🧜', text:'I will guide the discharge. The energy flows through me — it always has. This is what I was born for, wizard. Trust me.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'(to his crew) This is the one, lads. The last one. Make it count. For everyone we lost out there.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'All hands — battle ready! Towers charged! Spells prepared! For the Crystal Archipelago — FOR EVERYONE WHO EVER SAILED THESE WATERS!' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Go well, wizard. Whatever happens — you have already saved us all. Everything else is just... making sure.' },
        { speaker:'You', portrait:'🧙', text:'Then let\'s make sure.' },
      ],
      waveStart: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'*The ocean splits. The Abyss Leviathan rises — ancient, vast, its body threaded with stolen crystal light. A voice felt in bone, not heard with ears:*' },
        { speaker:'Abyss Leviathan', portrait:'🌊💀', text:'SMALL THING. YOU CANNOT SEAL WHAT HAS ALWAYS BEEN FREE. I AM OLDER THAN YOUR ISLANDS. OLDER THAN YOUR MAGIC. I WILL OUTLAST YOU AS I OUTLASTED ALL THE OTHERS.' },
        { speaker:'You', portrait:'🧙', text:'The others didn\'t have five crystal pillars, three island campaigns, a reformed pirate, a sea witch, an ancient spirit, and a very angry admiral. Watch me.' },
      ],
      victory: [
        { speaker:'Syrenna', portrait:'🧜', text:'NOW! THE PILLARS — ALL FIVE — NOW!' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'*Five beams of pure crystal light converge. The Leviathan screams — a sound like the ocean tearing — and is driven down, down, down into the abyss. The seal closes. The crystal sings.*' },
        { speaker:'Abyss Leviathan', portrait:'🌊💀', text:'...impossible. After three thousand years... IMPOSSIBLE.' },
        { speaker:'Syrenna', portrait:'🧜', text:'The seal holds. I can feel it — strong, whole, complete. It will hold for ten thousand years.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'It is done. The Leviathan is sealed. The Nexus is restored. Three thousand years of waiting... and it only took you fifteen chapters.' },
        { speaker:'Captain Ironhook', portrait:'🏴‍☠️', text:'(quietly, looking at the sea) It\'s quiet. The sea is actually quiet.' },
        { speaker:'Elder Meryn', portrait:'👴', text:'Come home, wizard. All of you. You\'ve earned it.' },
        { speaker:'Admiral Quinn', portrait:'⚓', text:'The Crystal Archipelago lives. Every island, every shore, every sailor — free.' },
        { speaker:'You', portrait:'🧙', text:'(pause, watching the sun rise over a calm sea) Not yet. I want to watch the sun rise over a free ocean. Just for a moment.' },
        { speaker:'Syrenna', portrait:'🧜', text:'(smiling) Take all the time you need, wizard. The sea isn\'t going anywhere. Not tonight.' },
      ],
      complete: [
        { speaker:'The Chronicler', portrait:'✨📜', text:'The Crystal Archipelago is saved. The seal will hold for ten thousand years. What you have done today will be remembered as long as these islands stand.' },
        { speaker:'You', portrait:'🧙', text:'We all did it.' },
        { speaker:'The Chronicler', portrait:'✨📜', text:'Yes. All of you. Every wall, every tower, every crystal harvested, every wave survived. All of it led here. Well done, wizard. Extraordinarily well done.' },
      ],
      bonusRes: {},
    },

  ],

  // ── Speaker colors ───────────────────────────────────────────
  speakerColors: {
    'You':                '#88aaff',
    'Elder Meryn':        '#ffd700',
    'Admiral Quinn':      '#44cccc',
    'Syrenna':            '#cc88ff',
    'Captain Ironhook':   '#ff6644',
    'Pirate King Dread':  '#ff3333',
    'Commodore Rotgut':   '#88ff44',
    'The Chronicler':     '#c8f0ff',
    'Abyss Leviathan':    '#4466ff',
  },
};
