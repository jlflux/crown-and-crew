/* Crown & Crew — static game definitions. No external dependencies. */
window.CC_DATA = (() => {
  const CLASSES = {
    guardian: { name:"Guardian", title:"The Iron Oath", role:"tank", faction:"Dawn", hp:184, atk:19, def:17, speed:.78, range:"melee", ult:"Bulwark Oath", ability:"taunt", color:"#75b7d9", accent:"#c9e9fb", glyph:"♜", description:"A frontline protector who absorbs punishment and turns the tide with an oath of protection." },
    ranger:   { name:"Ranger", title:"The Farstrider", role:"ranger", faction:"Wild", hp:119, atk:30, def:7, speed:1.17, range:"ranged", ult:"Rain of Arrows", ability:"volley", color:"#72b887", accent:"#d6f4b7", glyph:"➶", description:"A precision attacker that punishes exposed enemies and unleashes rapid volleys." },
    arcanist: { name:"Arcanist", title:"The Starborn", role:"mage", faction:"Arcane", hp:110, atk:34, def:6, speed:.91, range:"ranged", ult:"Starfall", ability:"meteor", color:"#b38de1", accent:"#e8cbff", glyph:"✦", description:"A spellcaster capable of devastating multiple enemies with powerful magic." }
  };
  const COMPANIONS = [
    {id:"brann", name:"Brann", title:"Shield of Stonehaven", role:"tank", faction:"Dawn", hp:175, atk:19, def:16, speed:.77, range:"melee", ult:"Hold the Line", ability:"taunt", color:"#d9ac70", accent:"#fff0c0", glyph:"♜", starter:true, bio:"A veteran captain who would sooner break his shield than abandon a friend."},
    {id:"lyra", name:"Lyra", title:"Light of the Vale", role:"healer", faction:"Dawn", hp:120, atk:22, def:8, speed:.93, range:"ranged", ult:"Dawn's Embrace", ability:"heal", color:"#efb1b2", accent:"#ffe7d8", glyph:"✚", starter:true, bio:"Her healing songs kept the border villages alive through three winters."},
    {id:"kael", name:"Kael", title:"Hawkeye of the North", role:"ranger", faction:"Wild", hp:117, atk:29, def:7, speed:1.20, range:"ranged", ult:"Piercing Volley", ability:"volley", color:"#86c09d", accent:"#e1ffd3", glyph:"➶", starter:true, bio:"A scout who reads movement before an enemy has decided to move."},
    {id:"niva", name:"Niva", title:"Ashwood Seer", role:"mage", faction:"Arcane", hp:106, atk:33, def:6, speed:.90, range:"ranged", ult:"Astral Tempest", ability:"meteor", color:"#bda1f1", accent:"#e6dcff", glyph:"✧", unlock:2, cost:155, bio:"An apprentice who hears the language of the stars."},
    {id:"sable", name:"Sable", title:"The Hidden Dagger", role:"assassin", faction:"Shade", hp:113, atk:38, def:6, speed:1.30, range:"melee", ult:"Shadowstep", ability:"shadow", color:"#93a4d4", accent:"#f6d5ff", glyph:"✥", unlock:3, cost:175, bio:"Her name is spoken quietly in places that deserve to be afraid."},
    {id:"orin", name:"Orin", title:"Ember of the Forge", role:"fighter", faction:"Ember", hp:158, atk:29, def:11, speed:.97, range:"melee", ult:"Sundering Strike", ability:"cleave", color:"#e5a06d", accent:"#ffdbac", glyph:"⚔", starter:true, bio:"A wandering smith whose hammer is as fearsome in battle as it is at the anvil."},
    {id:"mira", name:"Mira", title:"Keeper of the Grove", role:"support", faction:"Wild", hp:138, atk:23, def:10, speed:.98, range:"ranged", ult:"Grove's Shelter", ability:"ward", color:"#8fd5b5", accent:"#e2ffcb", glyph:"❈", unlock:5, cost:270, bio:"The forest's old magic answers her before she finishes the question."},
    {id:"rook", name:"Rook", title:"The Last Standard", role:"fighter", faction:"Dawn", hp:165, atk:34, def:12, speed:.94, range:"melee", ult:"Rallying Cry", ability:"rally", color:"#d8b580", accent:"#fff0c8", glyph:"⚑", unlock:7, cost:340, bio:"He carried a defeated army's banner home—and returned with an army of his own."}
  ];
  const FOES = {
    raider:  {name:"Marauder",role:"fighter",hp:94,atk:17,def:5,speed:.92,ability:"cleave",ult:"Wild Swing",range:"melee",color:"#ba6a65",glyph:"⚔"},
    brute:   {name:"Iron Brute",role:"tank",hp:160,atk:18,def:13,speed:.68,ability:"taunt",ult:"Iron Guard",range:"melee",color:"#9f6c64",glyph:"♜"},
    archer:  {name:"Poacher",role:"ranger",hp:86,atk:22,def:4,speed:1.05,ability:"volley",ult:"Volley",range:"ranged",color:"#b77c54",glyph:"➶"},
    cultist: {name:"Ash Cultist",role:"mage",hp:81,atk:27,def:4,speed:.88,ability:"meteor",ult:"Ashstorm",range:"ranged",color:"#ab7cc4",glyph:"✦"},
    hexer:   {name:"Hexweaver",role:"support",hp:90,atk:18,def:6,speed:.89,ability:"ward",ult:"Dark Veil",range:"ranged",color:"#9d78af",glyph:"✧"},
    assassin:{name:"Cutthroat",role:"assassin",hp:90,atk:26,def:5,speed:1.19,ability:"shadow",ult:"Ambush",range:"melee",color:"#a36b85",glyph:"✥"},
    healer:  {name:"Dark Acolyte",role:"healer",hp:99,atk:19,def:7,speed:.85,ability:"heal",ult:"Twisted Grace",range:"ranged",color:"#a2778e",glyph:"✚"},
    knight:  {name:"Fallen Knight",role:"fighter",hp:135,atk:25,def:10,speed:.89,ability:"cleave",ult:"Riven Blade",range:"melee",color:"#a98473",glyph:"⚔"},
    warden:  {name:"Gate Warden",role:"tank",hp:230,atk:28,def:17,speed:.78,ability:"taunt",ult:"Gatebreaker",range:"melee",color:"#ad7465",glyph:"♜"},
    reaper:  {name:"Ash Reaper",role:"assassin",hp:162,atk:44,def:10,speed:1.08,ability:"shadow",ult:"Last Breath",range:"melee",color:"#af5f7c",glyph:"✥"}
  };
  const STAGES = [
    {id:1,name:"The Old Road",region:"Hollowwood",subtitle:"A warning at the crossroads",story:"Local raiders are blocking the passage into Hollowwood. Put your guild to the test.",enemy:["raider","raider","archer","cultist"],gold:130,essence:24,theme:"wood"},
    {id:2,name:"Whispering Pines",region:"Hollowwood",subtitle:"A scout never came home",story:"Poachers have made their camp beneath the silver trees. Break their line.",enemy:["brute","raider","archer","archer","healer"],gold:150,essence:30,theme:"wood"},
    {id:3,name:"Broken Watch",region:"Hollowwood",subtitle:"The watchtower has fallen",story:"A cult has seized the old watchtower. Their spellcasters need protection to be stopped.",enemy:["brute","raider","cultist","healer","archer"],gold:175,essence:34,theme:"wood",drop:"oakbow"},
    {id:4,name:"The Ember Pass",region:"Redstone",subtitle:"The mountain road burns",story:"Ambushers guard the pass. They favor your unprotected backline.",enemy:["knight","brute","assassin","cultist","archer"],gold:190,essence:38,theme:"mountain"},
    {id:5,name:"Ashfall Bastion",region:"Redstone",subtitle:"A champion waits",story:"The bastion's fallen captain commands a disciplined garrison.",enemy:["warden","knight","cultist","healer","assassin"],gold:240,essence:52,theme:"mountain",boss:true,drop:"dawnshield"},
    {id:6,name:"The Drowned Trail",region:"Mirefen",subtitle:"Dark water, darker company",story:"Mirefen's coven draws strength from the marsh and turns healing against you.",enemy:["brute","knight","hexer","healer","cultist"],gold:220,essence:48,theme:"marsh"},
    {id:7,name:"Lanterns Below",region:"Mirefen",subtitle:"Follow the blue flame",story:"The path disappears into the drowned crypts. Hold the line while the casters work.",enemy:["warden","raider","hexer","cultist","assassin"],gold:245,essence:54,theme:"marsh",drop:"starfocus"},
    {id:8,name:"Obsidian Steps",region:"Blackspire",subtitle:"The city of hollow kings",story:"The enemy forms a tight spearhead. Bring a balanced crew.",enemy:["warden","knight","reaper","archer","healer"],gold:275,essence:64,theme:"spire"},
    {id:9,name:"Crownless Hall",region:"Blackspire",subtitle:"Only ashes on the throne",story:"The palace guard refuses to surrender, and its mages are nearly unstoppable.",enemy:["warden","knight","hexer","cultist","reaper"],gold:310,essence:70,theme:"spire",drop:"emberbrand"},
    {id:10,name:"The Ashen Crown",region:"Blackspire",subtitle:"The final stand",story:"An ancient oath has curdled into ruin. Defeat the last crowned warden.",enemy:["warden","knight","reaper","reaper","healer"],gold:420,essence:100,theme:"spire",boss:true,drop:"crownrelic"}
  ];
  const GEAR = [
    {id:"rustblade",name:"Old Guard Blade",type:"Sword",bonus:{atk:5},rarity:"common",color:"#b0c1ce",desc:"A well-used sword from a veteran's pack."},
    {id:"leather",name:"Wayfarer's Mail",type:"Armor",bonus:{hp:26,def:2},rarity:"common",color:"#bd9a72",desc:"Practical protection for the front line."},
    {id:"charm",name:"Dawn Talisman",type:"Charm",bonus:{atk:3,hp:15},rarity:"common",color:"#f0d596",desc:"Warm light still clings to this charm."},
    {id:"oakbow",name:"Whisperwood Bow",type:"Bow",bonus:{atk:11},rarity:"rare",color:"#9ed5a0",desc:"Each shot is guided by the old forest."},
    {id:"dawnshield",name:"Bastion Aegis",type:"Shield",bonus:{hp:48,def:5},rarity:"epic",color:"#f2ca87",desc:"Recovered from the captain of Ashfall."},
    {id:"starfocus",name:"Star-Seer's Focus",type:"Focus",bonus:{atk:15,hp:17},rarity:"rare",color:"#c5b1fd",desc:"A fragment of the night sky trapped in glass."},
    {id:"emberbrand",name:"Emberbrand",type:"Blade",bonus:{atk:21},rarity:"epic",color:"#f3a46e",desc:"Hotter in battle than in the forge."},
    {id:"crownrelic",name:"The Unbroken Crown",type:"Relic",bonus:{atk:19,hp:58,def:4},rarity:"legendary",color:"#f8dc9a",desc:"Proof that the guild defeated the last crowned warden."}
  ];
  const HALL = [
    {id:"training",name:"Training Yard",icon:"⚔",desc:"Every level grants your crew +6% attack.",effect:"attack",per:6},
    {id:"infirmary",name:"Sanctuary",icon:"✚",desc:"Every level grants your crew +7% maximum health.",effect:"health",per:7},
    {id:"treasury",name:"Guild Treasury",icon:"✦",desc:"Every level grants +10% gold from victories.",effect:"gold",per:10}
  ];
  const heroData=key=>CLASSES[key]||CLASSES.guardian;
  const unitData=id=>id==="hero"?null:COMPANIONS.find(c=>c.id===id);
  const gearData=id=>GEAR.find(g=>g.id===id);
  const stageData=id=>STAGES.find(s=>s.id===id)||STAGES[0];
  return {CLASSES,COMPANIONS,FOES,STAGES,GEAR,HALL,heroData,unitData,gearData,stageData};
})();