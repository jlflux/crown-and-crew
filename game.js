/* Crown & Crew: browser-only campaign, guild, party, equipment and battle UI. */
(() => {
"use strict";
const D=window.CC_DATA, E=window.CC_ENGINE, DRAW=window.CC_DRAW;
if(!D||!E||!DRAW)throw new Error("Crown & Crew dependencies failed to load.");
const $=id=>document.getElementById(id);
const STORE="crown-and-crew-save-v1";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const integer=n=>Math.floor(Number(n)||0).toLocaleString("en-US");
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const COLORS=["#dfb974","#84b8df","#8cc9a3","#c9a0e2","#dc9083"];
const ICONS={tank:"♜",fighter:"⚔",ranger:"➶",mage:"✦",healer:"✚",support:"❈",assassin:"✥"};
const ROLE={tank:"Protector",fighter:"Warrior",ranger:"Marksman",mage:"Spellcaster",healer:"Healer",support:"Support",assassin:"Assassin"};
const homeIcons={gold:"✦",essence:"✧"};
let creatorClass="guardian",creatorColor=COLORS[0];
function newState(name="Wanderer",key="guardian",color=COLORS[0]){
 return {
  version:1,created:true,hero:{name:String(name).trim().slice(0,18)||"Wanderer",classKey:key,color},
  gold:310,essence:95,renown:0,stageUnlocked:1,cleared:[],battleWins:0,battles:0,
  companions:["brann","orin","lyra","kael"],lineup:key==="guardian"?["hero","brann","orin","lyra","kael"]:["brann","orin","hero","lyra","kael"],
  levels:{hero:1,brann:1,orin:1,lyra:1,kael:1},
  skills:{hero:1,brann:1,orin:1,lyra:1,kael:1},
  inventory:["rustblade","leather","charm"],gearLevels:{rustblade:1,leather:1,charm:1},
  equipped:{hero:"rustblade",brann:"leather",lyra:"charm"},hall:{training:1,infirmary:1,treasury:1},
  journal:["Your guild has been founded. The Old Road awaits."]
 };
}
function load(){
 try{
  const parsed=JSON.parse(localStorage.getItem(STORE));
  if(!parsed||parsed.version!==1||!parsed.created||!parsed.hero)return null;
  const fallback=newState(parsed.hero.name,parsed.hero.classKey,parsed.hero.color);
  const state={...fallback,...parsed};
  for(const k of ["levels","skills","gearLevels","equipped","hall"])state[k]={...fallback[k],...(parsed[k]||{})};
  state.companions=[...new Set((Array.isArray(parsed.companions)?parsed.companions:fallback.companions).filter(id=>!!D.unitData(id)))];
  state.inventory=[...new Set((Array.isArray(parsed.inventory)?parsed.inventory:fallback.inventory).filter(id=>!!D.gearData(id)))];
  state.cleared=[...new Set((Array.isArray(parsed.cleared)?parsed.cleared:[]).map(Number).filter(n=>n>=1&&n<=10))];
  state.lineup=Array.isArray(parsed.lineup)&&parsed.lineup.length===5&&new Set(parsed.lineup).size===5&&parsed.lineup.every(id=>id==="hero"||state.companions.includes(id))
   ?parsed.lineup.slice():fallback.lineup;
  state.stageUnlocked=clamp(Number(state.stageUnlocked)||1,1,10);
  state.gold=Math.max(0,Number(state.gold)||0);state.essence=Math.max(0,Number(state.essence)||0);
  state.journal=Array.isArray(parsed.journal)?parsed.journal.slice(0,7):fallback.journal;
  return state;
 }catch(_){return null}
}
let state=load(),page="campaign",selectedStage=state?.stageUnlocked||1,selectedUnit="hero",selectedGear="rustblade";
let battleSession=null,lastFrame=0,visualTime=0,toastTimeout=null;
const save=()=>{if(state)try{localStorage.setItem(STORE,JSON.stringify(state))}catch(_){toast("Unable to save in this browser.");}};
const gainJournal=entry=>{state.journal.unshift(entry);state.journal=state.journal.slice(0,7)};
function toast(s){const t=$("toast");t.textContent=s;t.classList.add("visible");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove("visible"),2600)}
function info(id){
 if(id==="hero"){
  const c=D.heroData(state.hero.classKey);
  return {...c,id:"hero",name:state.hero.name,title:"Guild Captain",bio:"The banner you raised. The legend you'll build.",color:state.hero.color};
 }
 return D.unitData(id);
}
function xpLevel(id){return clamp(Number(state.levels[id])||1,1,12)}
function abilityLevel(id){return clamp(Number(state.skills[id])||1,1,5)}
function getGear(id){return state.equipped[id] ? D.gearData(state.equipped[id]) : null}
function gearBonus(item,key){
 if(!item)return 0;
 const level=clamp(Number(state.gearLevels[item.id])||1,1,5);
 return Math.round((item.bonus[key]||0)*(1+(level-1)*.3));
}
function stats(id){
 const base=info(id),level=xpLevel(id),gear=getGear(id);
 const hp=Math.round((base.hp*(1+(level-1)*.115)+gearBonus(gear,"hp"))*(1+(state.hall.infirmary-1)*.07));
 const atk=Math.round((base.atk*(1+(level-1)*.12)+gearBonus(gear,"atk"))*(1+(state.hall.training-1)*.06));
 const def=Math.round(base.def*(1+(level-1)*.085)+gearBonus(gear,"def"));
 return {...base,id,level,hp,atk,def,skillLevel:abilityLevel(id),speed:base.speed+(level-1)*.008};
}
const power=ids=>Math.round(ids.reduce((s,id)=>{const u=stats(id);return s+u.hp*.34+u.atk*2.7+u.def*2.4},0));
const recruited=id=>id==="hero"||state.companions.includes(id);
const currentRank=()=>state.renown>=1600?"CROWNWARD":state.renown>=750?"BANNER LORD":state.renown>=300?"GUILD KNIGHT":"GUILD SQUIRE";
function renderHeader(){
 $("goldValue").textContent=integer(state.gold);$("essenceValue").textContent=integer(state.essence);
 $("topHeroName").textContent=state.hero.name;$("topHeroLevel").textContent="LV. "+xpLevel("hero");
 $("avatarGlyph").textContent=D.heroData(state.hero.classKey).glyph;
 $("topSection").textContent=page.replace(/\b\w/g,c=>c.toUpperCase()).toUpperCase();
 $("welcomeLabel").textContent="Welcome back, "+state.hero.name+". Your banner still flies.";
 $("navRenown").textContent=integer(state.renown);
 $("navProgress").textContent=state.cleared.length+" / 10";
 $("campaignNavMark").textContent=String(state.stageUnlocked).padStart(2,"0");
 $("rosterNavMark").textContent=String(state.companions.length+1).padStart(2,"0");
 document.querySelectorAll("[data-nav]").forEach(btn=>btn.classList.toggle("active",btn.dataset.nav===page));
}
function renderRail(){
 const hc=stats("hero"),stage=D.stageData(Math.min(state.stageUnlocked,10));
 const pct=Math.min(100,state.cleared.length/10*100);
 $("infoRail").innerHTML=
  '<div class="rail-card"><h3>GUILD CAPTAIN</h3><div class="rail-hero"><div class="rail-portrait" style="--hero:'+esc(hc.color)+'">'+esc(hc.glyph)+'</div><div><strong>'+esc(hc.name)+'</strong><small>'+esc(hc.name==="hero"?hc.title:D.heroData(state.hero.classKey).name)+' · LV. '+hc.level+'</small><small>'+esc(currentRank())+'</small></div></div><div class="quickstats"><div class="quickstat"><strong>'+integer(power(state.lineup))+'</strong><small>TEAM POWER</small></div><div class="quickstat"><strong>'+integer(state.battleWins)+'</strong><small>VICTORIES</small></div></div></div>'+
  '<div class="rail-card"><h3>CAMPAIGN PROGRESS</h3><div class="overline">NEXT UP</div><div style="font-weight:850;margin-top:6px">'+esc(stage.name)+'</div><div style="font-size:11px;color:#90aabb;margin-top:3px">'+esc(stage.region)+'</div><div class="progressbar"><div style="width:'+pct+'%"></div></div><div class="progress-label"><span>'+state.cleared.length+' STAGES CLEARED</span><span>'+Math.round(pct)+'%</span></div><button class="secondary-button rail-link" data-action="goCampaign">VIEW CAMPAIGN →</button></div>'+
  '<div class="rail-card"><h3>GUILD JOURNAL</h3>'+state.journal.slice(0,4).map(s=>'<p class="rail-journal">'+esc(s)+'</p>').join("")+'</div>'+
  '<div class="rail-card"><h3>FIELD NOTES</h3><p class="rail-tip">The best team is not always the highest-level team. Move defenders forward, protect your healer, and counter enemies with the right skills. Battles are automatic, but your formation is the strategy.</p></div>';
}
function intro(kicker,title,description,tag=""){
 return '<section class="section-intro"><div class="section-topline"><div><div class="overline">'+esc(kicker)+'</div><h1>'+esc(title)+'</h1><p>'+esc(description)+'</p></div>'+(tag?'<span class="tag">'+esc(tag)+'</span>':"")+'</div></section>';
}
function portrait(u,size=""){
 return '<div class="'+(size||"slot-portrait")+'" style="--hero:'+esc(u.color)+'">'+esc(u.glyph||ICONS[u.role])+'</div>';
}
function renderCampaign(){
 const stage=D.stageData(selectedStage),locked=selectedStage>state.stageUnlocked,cleared=state.cleared.includes(selectedStage);
 const stages=D.STAGES.map(s=>{
  const isLocked=s.id>state.stageUnlocked,active=s.id===selectedStage,done=state.cleared.includes(s.id);
  return '<button class="stage-node'+(isLocked?" locked":"")+(active?" current":"")+(done?" done":"")+(s.boss?" boss":"")+'" data-action="stage" data-id="'+s.id+'" '+(isLocked?"disabled":"")+'><span>'+(done?"✓":String(s.id).padStart(2,"0"))+'</span><small>'+(s.boss?"BOSS":done?"CLEAR":"STAGE")+'</small></button>';
 }).join("");
 const slots=state.lineup.map((id,i)=>{
  const u=stats(id),selected=id===selectedUnit;
  return '<button class="slot'+(i<2?" front":"")+(selected?" chosen":"")+'" data-action="slot" data-slot="'+i+'" title="Assign your selected hero to this position">'+portrait(u)+'<div class="slot-name">'+esc(u.name)+'</div><div class="slot-sub">LV '+u.level+' · '+(i<2?"FRONT":"REAR")+'</div></button>';
 });
 const bench=["hero",...state.companions].map(id=>{
  const u=stats(id);
  return '<button class="bench-hero'+(selectedUnit===id?" active":"")+'" data-action="selectUnit" data-id="'+esc(id)+'" title="Select '+esc(u.name)+'">'+portrait(u,"bench-glyph")+'<strong>'+esc(u.name)+'</strong><small>LV '+u.level+'</small></button>';
 }).join("");
 const enemyPower=Math.round(stage.enemy.reduce((sum,id)=>{const e=D.FOES[id],scale=1+(stage.id-1)*.18+(stage.boss?.16:0);return sum+(e.hp*.34+e.atk*2.7+e.def*2.4)*scale},0));
 return intro("THE TEN-STAGE CAMPAIGN","The Ashen Realms","Build your five-person crew, choose who stands in harm's way, and fight your way to the Ashen Crown.",cleared?"STAGE CLEARED":"CHAPTER "+String(stage.id).padStart(2,"0"))+
 '<div class="overline" style="margin:13px 0 3px">CHOOSE YOUR ENCOUNTER</div><div class="stage-carousel">'+stages+'</div>'+
 '<div class="campaign-columns"><div class="panel"><div class="panel-title"><h2>YOUR BATTLE FORMATION</h2><small>POWER '+integer(power(state.lineup))+'</small></div>'+
 '<div class="formation-board"><div class="formation-label">BACKLINE · PROTECTED</div><div class="formation-line backline">'+slots.slice(2).join("")+'</div><div class="formation-label">FRONTLINE · TAKES FIRST HITS</div><div class="formation-line">'+slots.slice(0,2).join("")+'</div></div>'+
 '<div class="panel-title" style="margin-top:17px;margin-bottom:7px"><h2>SELECT A HERO</h2><small>'+state.companions.length+' COMPANIONS</small></div><div class="bench">'+bench+'</div><p class="formation-hint">Select a hero below, then click a formation slot to swap them in. Frontline units are targeted before the backline.</p>'+
 '<button class="secondary-button full" style="margin-top:12px" data-action="autoFormation">AUTO ARRANGE FORMATION</button></div>'+
 '<div class="panel stage-card"><div class="panel-title"><h2>ENCOUNTER BRIEFING</h2><small>'+(stage.boss?"BOSS BATTLE":"STAGE "+stage.id)+'</small></div>'+
 '<div class="stage-art '+esc(stage.theme)+'"><div class="overline">'+esc(stage.region.toUpperCase())+'</div><h3>'+esc(stage.name)+'</h3><p>'+esc(stage.subtitle)+'</p></div>'+
 '<p>'+esc(stage.story)+'</p><div class="panel-title" style="margin:14px 0 8px"><h2>ENEMY FORMATION</h2><small>POWER '+integer(enemyPower)+'</small></div>'+
 '<div class="enemy-list">'+stage.enemy.map((id,i)=>{const e=D.FOES[id];return '<div class="enemy-row"><span class="enemy-icon" style="--hero:'+esc(e.color)+'">'+esc(e.glyph)+'</span><div><strong>'+esc(e.name)+'</strong><small>'+esc(ROLE[e.role]||e.role)+' · '+(i<2?"Front":"Back")+' line</small></div><b>LV '+stage.id+'</b></div>'}).join("")+'</div>'+
 '<div class="panel-title" style="margin:15px 0 4px"><h2>VICTORY REWARDS</h2><small>'+(cleared?"REPLAY REWARDS":"FIRST CLEAR")+'</small></div><div class="loot-row"><span class="loot">✦ '+integer(cleared?Math.round(stage.gold*.32):stage.gold)+' GOLD</span><span class="loot essence">✧ '+integer(cleared?Math.round(stage.essence*.4):stage.essence)+' ESSENCE</span>'+(stage.drop&&!cleared?'<span class="loot">◆ RARE LOOT</span>':"")+'</div>'+
 '<button data-action="fight" class="primary-button full" '+(locked?"disabled":"")+'>⚔ '+(cleared?"REPLAY ENCOUNTER":"BEGIN BATTLE")+' →</button></div></div>';
}
function tile(id){
 const u=info(id),owned=recruited(id),level=xpLevel(id);
 const status=owned?(state.lineup.includes(id)?"ACTIVE":"RESERVE"):(state.stageUnlocked<(u.unlock||1)?"LOCKED":"RECRUIT");
 return '<button class="roster-chip'+(selectedUnit===id?" selected":"")+(owned?"":" unrecruited")+'" data-action="inspect" data-id="'+esc(id)+'" aria-pressed="'+(selectedUnit===id?"true":"false")+'" title="Inspect '+esc(u.name)+'">'+
 '<span class="roster-chip-icon" style="--hero:'+esc(u.color)+'">'+esc(u.glyph)+'</span>'+
 '<span class="roster-chip-copy"><strong>'+esc(u.name)+'</strong><small>'+esc(ROLE[u.role])+' · '+esc(u.faction)+'</small></span>'+
 '<span class="roster-chip-status">'+(owned?"LV "+level:status)+'</span></button>';
}
function renderRoster(){
 const u=info(selectedUnit),owned=recruited(selectedUnit),lvl=xpLevel(selectedUnit),st=stats(selectedUnit);
 const levelCap=12,skillCap=5,skill=abilityLevel(selectedUnit);
 const levelCost={gold:55+lvl*35,essence:8+lvl*6},skillCost={gold:85+skill*55,essence:18+skill*14};
 const levelReady=state.gold>=levelCost.gold&&state.essence>=levelCost.essence;
 const skillReady=state.gold>=skillCost.gold&&state.essence>=skillCost.essence;
 const equipped=getGear(selectedUnit);
 const gearLevel=equipped?(state.gearLevels[equipped.id]||1):0;
 const gearCost=equipped?{gold:95+gearLevel*65,essence:10+gearLevel*10}:null;
 const inLineup=owned&&state.lineup.includes(selectedUnit);
 const gearOptions=['<option value="">No equipment</option>',...state.inventory.map(id=>{
  const item=D.gearData(id),holder=Object.keys(state.equipped).find(k=>state.equipped[k]===id),heldBy=holder&&holder!==selectedUnit?" · on "+info(holder).name:"";
  return '<option value="'+esc(id)+'" '+(equipped?.id===id?"selected":"")+'>'+esc(item.name+heldBy)+'</option>';
 })].join("");
 const roster=["hero",...D.COMPANIONS.map(c=>c.id)];
 const levelButton='<button class="primary-button roster-upgrade-btn" data-action="levelHero" '+(lvl>=levelCap||!levelReady?"disabled":"")+'>'+(lvl>=levelCap?"MAX LEVEL":"LEVEL UP →")+'</button>';
 const skillButton='<button class="secondary-button roster-upgrade-btn" data-action="skillHero" '+(skill>=skillCap||!skillReady?"disabled":"")+'>'+(skill>=skillCap?"MAX RANK":"UPGRADE SKILL →")+'</button>';
 const recruitButton='<button class="primary-button roster-upgrade-btn" data-action="recruit" data-id="'+esc(selectedUnit)+'" '+(state.stageUnlocked<(u.unlock||1)||state.gold<u.cost?"disabled":"")+'>RECRUIT · ✦ '+integer(u.cost)+'</button>';
 const note=!owned?(state.stageUnlocked<(u.unlock||1)?"Unlock recruitment after completing stage "+(u.unlock-1)+".":"Recruit this hero with gold earned from battles."):
  "In "+(inLineup?"your active five":"reserves")+". You can change formation positions from Campaign.";
 const inspector=
 '<div class="roster-inspector-head"><div><div class="overline">HERO DEVELOPMENT</div><h2>CHARACTER INSPECTOR</h2></div><span class="inspector-status">'+(owned?(inLineup?"● ACTIVE":"○ RESERVE"):"✧ UNRECRUITED")+'</span></div>'+
 '<div class="inspector-identity">'+portrait(u,"inspector-portrait")+'<div class="inspector-name"><div class="overline">'+esc(ROLE[u.role])+' · '+esc(u.faction)+'</div><h3>'+esc(u.name)+'</h3><p>'+esc(u.title)+'</p><span>LEVEL '+lvl+' · '+esc(u.ult)+'</span></div></div>'+
 '<div class="inspector-stats"><div><strong>'+integer(st.hp)+'</strong><span>HEALTH</span></div><div><strong>'+integer(st.atk)+'</strong><span>ATTACK</span></div><div><strong>'+integer(st.def)+'</strong><span>DEFENSE</span></div><div><strong>'+((st.speed||1)*100).toFixed(0)+'</strong><span>SPEED</span></div></div>'+
 (owned?
  '<div class="inspector-upgrades"><div class="inspector-upgrade"><div class="upgrade-copy"><strong>Character Level <b>'+lvl+' / '+levelCap+'</b></strong><p>More health, attack and defense.</p><small>'+(lvl>=levelCap?"MAXED OUT":'✦ '+levelCost.gold+' GOLD · ✧ '+levelCost.essence+' ESSENCE')+'</small></div>'+levelButton+'</div>'+
  '<div class="inspector-upgrade"><div class="upgrade-copy"><strong>Ultimate Power <b>'+skill+' / '+skillCap+'</b></strong><p>'+esc(u.ult)+' · '+esc(abilityText(u.ability))+'</p><small>'+(skill>=skillCap?"MAXED OUT":'✦ '+skillCost.gold+' GOLD · ✧ '+skillCost.essence+' ESSENCE')+'</small></div>'+skillButton+'</div></div>'+
  '<div class="inspector-equipment"><div class="inspector-mini-heading"><strong>EQUIPMENT</strong><small>'+(equipped?esc(equipped.rarity.toUpperCase())+" · LV "+gearLevel:"EMPTY SLOT")+'</small></div>'+
  '<div class="inspector-gear-row"><label for="quickEquipSelect">EQUIPPED ITEM</label><select id="quickEquipSelect" data-quick-equip aria-label="Equip an item for '+esc(u.name)+'">'+gearOptions+'</select></div>'+
  '<div class="inspector-gear-bottom"><span>'+esc(equipped?Object.entries(equipped.bonus).map(([k])=>k.toUpperCase()+' +'+gearBonus(equipped,k)).join(" · "):"Choose an item to improve this hero in battle.")+'</span>'+
  '<button class="ghost-button" data-action="quickUpgradeGear" '+(!equipped||gearLevel>=5||state.gold<gearCost?.gold||state.essence<gearCost?.essence?"disabled":"")+'>'+(equipped&&gearLevel<5?"↑ UPGRADE · ✦ "+gearCost.gold+" / ✧ "+gearCost.essence:equipped?"MAX LEVEL":"NO ITEM")+'</button></div></div>'
 :
 '<div class="inspector-unrecruited"><p>'+esc(u.bio||u.description)+'</p>'+recruitButton+'<small>'+esc(note)+'</small></div>')+
 '<div class="inspector-footer"><span>'+esc(note)+'</span><button class="ghost-button" data-action="goCampaign">EDIT FORMATION ↗</button></div>';
 return intro("HERO MANAGEMENT","Build your crew","Select a hero and improve them instantly. Levels, ultimate skills and equipment are all in one place.",roster.filter(recruited).length+" IN GUILD")+
 '<div class="roster-workbench"><section class="panel roster-catalog"><div class="panel-title"><h2>YOUR HERO COLLECTION</h2><small>'+roster.filter(recruited).length+' / '+roster.length+' RECRUITED</small></div>'+
 '<div class="roster-list">'+roster.map(tile).join("")+'</div>'+
 '<div class="roster-collection-hint">Earn gold and essence in Campaign. Recruitment is direct—no random summons.</div></section>'+
 '<section class="panel roster-inspector" aria-label="Selected hero upgrades">'+inspector+'</section></div>';
}
function abilityText(type){
 return ({taunt:"Protects the crew with a shield and draws enemy attacks",heal:"Heals the entire party",volley:"Fires a volley at several injured enemies",meteor:"Deals magical damage across the enemy formation",cleave:"Strikes multiple frontline enemies",shadow:"Punishes a vulnerable backline enemy",ward:"Grants barriers to the entire party",rally:"Increases every ally's attack for several seconds"})[type]||"Attacks an enemy";
}
function hallVisual(){
 const level=state.hall.training+state.hall.infirmary+state.hall.treasury;
 const banners=Array.from({length:Math.min(7,level)},(_,i)=>'<path d="M'+(300+i*60)+' 105 l0 75 l20 -13 l-20 -7" fill="'+(i%2?"#cba86d":"#839db0")+'" stroke="#e1cfaa" stroke-width="2"/>').join("");
 return '<div class="hall-scene"><svg viewBox="0 0 900 245" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of your growing fantasy guild hall"><defs><linearGradient id="hallSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6e8591"/><stop offset="1" stop-color="#c8ae86"/></linearGradient></defs><rect width="900" height="245" fill="url(#hallSky)"/><circle cx="738" cy="57" r="37" fill="#f7d9a0" opacity=".8"/><path d="M0 178 Q150 104 290 158 Q410 80 535 150 Q710 95 900 175 V245 H0Z" fill="#64796c"/><path d="M0 195 Q170 152 338 185 Q500 140 700 190 Q805 166 900 195 V245 H0Z" fill="#334c48"/><rect x="205" y="111" width="477" height="111" rx="4" fill="#69717a" stroke="#c3ad87" stroke-width="6"/><rect x="273" y="65" width="342" height="156" fill="#586975" stroke="#b7a583" stroke-width="6"/><path d="M247 66 L444 1 L643 66Z" fill="#384b61" stroke="#c6a372" stroke-width="7"/><path d="M190 112 L240 50 L295 112Z M609 112 L664 50 L710 112Z" fill="#384b61" stroke="#c6a372" stroke-width="5"/><rect x="191" y="108" width="97" height="115" fill="#566775" stroke="#b5a585" stroke-width="6"/><rect x="615" y="108" width="97" height="115" fill="#566775" stroke="#b5a585" stroke-width="6"/><rect x="405" y="139" width="84" height="83" rx="34" fill="#1b2930" stroke="#c6ae7e" stroke-width="6"/><path d="M445 10 L445 50" stroke="#ebc77f" stroke-width="5"/>'+banners+'<path d="M0 224 L900 224" stroke="#b9a87e" stroke-width="6"/><path d="M428 225 L354 245 M470 225 L538 245" stroke="#e3d0a3" stroke-width="5" opacity=".6"/></svg></div>';
}
function renderHall(){
 return intro("YOUR HOME BETWEEN BATTLES","The Guild Hall","Invest your spoils into lasting advantages. Each hall facility improves a different part of your guild.","GUILD RANK "+currentRank())+
 '<div class="panel">'+hallVisual()+'<div class="panel-title"><h2>PERMANENT GUILD UPGRADES</h2><small>FACILITY LEVELS 1–5</small></div><div class="facility-grid">'+D.HALL.map(f=>{
  const level=state.hall[f.id],gold=130*level,essence=16*level;
  return '<div class="panel facility"><div class="facility-icon">'+esc(f.icon)+'</div><div class="overline">FACILITY · LV '+level+'</div><h3>'+esc(f.name)+'</h3><p>'+esc(f.desc)+'</p><span class="level">CURRENT BONUS +'+(level-1)*f.per+'%</span><button class="secondary-button" data-action="hallUpgrade" data-id="'+esc(f.id)+'" '+(level>=5?"disabled":"")+'>'+(level>=5?"MAX LEVEL":"UPGRADE · ✦ "+gold+" / ✧ "+essence)+'</button></div>';
 }).join("")+'</div></div>';
}
function itemIcon(item){
 return ({Sword:"⚔",Blade:"⚔",Armor:"▣",Shield:"♜",Bow:"➶",Charm:"✧",Focus:"✦",Relic:"♛"})[item.type]||"◆";
}
function renderForge(){
 if(!state.inventory.includes(selectedGear))selectedGear=state.inventory[0]||null;
 const item=D.gearData(selectedGear);
 const equippedBy=item?Object.entries(state.equipped).find(([id,gear])=>gear===item.id)?.[0]:null;
 const cards=state.inventory.map(id=>{
  const g=D.gearData(id),owner=Object.entries(state.equipped).find(([k,v])=>v===id)?.[0],lev=state.gearLevels[id]||1;
  return '<button class="item-card'+(selectedGear===id?" selected":"")+'" data-action="selectGear" data-id="'+esc(id)+'"><span class="item-glyph" style="--item:'+esc(g.color)+'">'+itemIcon(g)+'</span><div><span class="rarity">'+esc(g.rarity)+' · LV '+lev+'</span><strong>'+esc(g.name)+'</strong><small>'+esc(owner?("Equipped: "+info(owner).name):"In inventory")+'</small></div></button>';
 }).join("");
 const detail=item?(()=>{
  const level=state.gearLevels[item.id]||1,gold=95+level*65,essence=10+level*10;
  const bonuses=Object.entries(item.bonus).map(([key,v])=>key.toUpperCase()+" +"+gearBonus(item,key)).join(" · ");
  return '<div class="panel item-detail"><div class="panel-title"><h2>ITEM DETAILS</h2><small>'+esc(item.rarity.toUpperCase())+'</small></div><div class="detail-header"><div class="detail-portrait" style="--hero:'+esc(item.color)+'">'+itemIcon(item)+'</div><div><div class="overline">LEVEL '+level+' · '+esc(item.type)+'</div><h2>'+esc(item.name)+'</h2><p>'+esc(item.desc)+'</p></div></div><p class="ability-info">'+esc(bonuses)+'</p><button class="secondary-button" data-action="upgradeGear" '+(level>=5?"disabled":"")+'>'+(level>=5?"MAX LEVEL":"↑ UPGRADE ITEM · ✦ "+gold+" / ✧ "+essence)+'</button><div class="panel-title" style="margin:21px 0 10px"><h2>EQUIP TO A HERO</h2><small>ONE ITEM PER HERO</small></div><div class="equip-list">'+["hero",...state.companions].map(id=>'<button class="equip-button'+(equippedBy===id?" equipped":"")+'" data-action="equip" data-id="'+esc(id)+'">'+esc(info(id).name)+(equippedBy===id?" ✓":"")+'</button>').join("")+'</div></div>';
 })():"<div class='empty'>No equipment discovered yet.</div>";
 return intro("LOOT & EQUIPMENT","The Forge","Equipment changes real combat stats. Earn named gear through the campaign, improve it, and choose who carries it.",""+state.inventory.length+" ITEMS")+
 '<div class="panel"><div class="panel-title"><h2>GUILD ARMORY</h2><small>OWNED EQUIPMENT</small></div><div class="forge-grid">'+cards+'</div></div>'+detail;
}
function render(){
 if(!state)return;
 document.querySelector?.(".workspace-main")?.classList.toggle("roster-mode",page==="roster");
 renderHeader();renderRail();
 const pages={campaign:renderCampaign,roster:renderRoster,hall:renderHall,forge:renderForge};
 $("pageHost").innerHTML=(pages[page]||renderCampaign)();
}
function autoArrange(){
 const owned=["hero",...state.companions],tanks=owned.filter(id=>["tank","fighter"].includes(info(id).role)),back=owned.filter(id=>!tanks.includes(id));
 const chosen=[...tanks,...back].slice(0,5);
 if(chosen.length!==5)return;
 state.lineup=[...chosen.slice(0,2),...chosen.slice(2)];
 save();render();toast("Frontline defenders, backline damage and support.");
}
function setSlot(index){
 if(!recruited(selectedUnit)||index<0||index>4)return;
 const before=state.lineup.indexOf(selectedUnit),old=state.lineup[index];
 if(before===index)return;
 state.lineup[index]=selectedUnit;
 if(before>=0)state.lineup[before]=old;
 save();render();
 toast(info(selectedUnit).name+" assigned to "+(index<2?"frontline":"backline")+".");
}
function pay(gold,essence){
 if(state.gold<gold||state.essence<essence){toast("Not enough "+(state.gold<gold?"gold":"essence")+". Win battles for resources.");return false}
 state.gold-=gold;state.essence-=essence;return true;
}
function recruit(id){
 const u=D.unitData(id);
 if(!u||recruited(id)||state.stageUnlocked<(u.unlock||1))return;
 if(!pay(u.cost,0))return;
 state.companions.push(id);state.levels[id]=1;state.skills[id]=1;
 gainJournal(u.name+" joined the guild.");save();render();toast("Recruited "+u.name+"! Assign them to a formation slot.");
}
function levelHero(){
 if(!recruited(selectedUnit))return;
 const lv=xpLevel(selectedUnit);if(lv>=12)return;
 if(!pay(55+lv*35,8+lv*6))return;
 state.levels[selectedUnit]=lv+1;
 gainJournal(info(selectedUnit).name+" reached level "+(lv+1)+".");save();render();toast("Level up! Attack, defense and health increased.");
}
function skillHero(){
 if(!recruited(selectedUnit))return;
 const lvl=abilityLevel(selectedUnit);if(lvl>=5)return;
 if(!pay(85+lvl*55,18+lvl*14))return;
 state.skills[selectedUnit]=lvl+1;save();render();toast(info(selectedUnit).name+"'s ultimate upgraded.");
}
function hallUpgrade(id){
 const f=D.HALL.find(x=>x.id===id);if(!f)return;
 const lvl=state.hall[id];if(lvl>=5||!pay(130*lvl,16*lvl))return;
 state.hall[id]=lvl+1;gainJournal(f.name+" upgraded to level "+(lvl+1)+".");save();render();toast("Permanent guild bonus upgraded.");
}
function upgradeGear(){
 const g=D.gearData(selectedGear);if(!g||!state.inventory.includes(g.id))return;
 const lvl=clamp(Number(state.gearLevels[g.id])||1,1,5);
 if(lvl>=5||!pay(95+lvl*65,10+lvl*10))return;
 state.gearLevels[g.id]=lvl+1;save();render();toast(g.name+" improved to level "+(lvl+1)+".");
}
function equip(id){
 if(!recruited(id)||!state.inventory.includes(selectedGear))return;
 const occupant=Object.keys(state.equipped).find(k=>state.equipped[k]===selectedGear);
 if(occupant===id){delete state.equipped[id];toast("Item unequipped.");}
 else{
  if(occupant)delete state.equipped[occupant];
  state.equipped[id]=selectedGear;
  toast(info(id).name+" equipped "+D.gearData(selectedGear).name+".");
 }
 save();render();
}
function quickEquip(itemId){
 if(!recruited(selectedUnit))return;
 if(!itemId){delete state.equipped[selectedUnit];save();render();toast(info(selectedUnit).name+" unequipped.");return}
 if(!state.inventory.includes(itemId)||!D.gearData(itemId))return;
 const previousHolder=Object.keys(state.equipped).find(id=>state.equipped[id]===itemId);
 if(previousHolder&&previousHolder!==selectedUnit)delete state.equipped[previousHolder];
 state.equipped[selectedUnit]=itemId;
 save();render();toast(info(selectedUnit).name+" equipped "+D.gearData(itemId).name+".");
}
function quickUpgradeGear(){
 const itemId=state.equipped[selectedUnit];
 if(!itemId)return;
 selectedGear=itemId;
 upgradeGear();
}
function renderCreate(){
 $("creatorClasses").innerHTML=Object.entries(D.CLASSES).map(([key,c])=>'<button class="class-option'+(creatorClass===key?" selected":"")+'" data-create-class="'+esc(key)+'"><span class="class-glyph" style="color:'+esc(c.color)+'">'+esc(c.glyph)+'</span><strong>'+esc(c.name)+'</strong><small>'+esc(c.role==="tank"?"Defend your crew":c.role==="ranger"?"Precision damage":"Area magic")+'</small></button>').join("");
 $("creatorColors").innerHTML=COLORS.map(c=>'<button class="color-swatch'+(creatorColor===c?" active":"")+'" style="--swatch:'+c+'" data-create-color="'+c+'" aria-label="Select '+c+' banner color"></button>').join("");
}
function createHero(){
 const name=$("heroNameInput").value.trim().replace(/\s+/g," ").slice(0,18);
 if(!name){toast("Give your hero a name.");return}
 state=newState(name,creatorClass,creatorColor);
 selectedUnit="hero";selectedStage=1;page="campaign";save();$("creatorOverlay").classList.add("hidden");
 render();toast("Welcome to the guild, "+name+".");
}
function battleUnit(id){
 const u=stats(id);
 return {id:"p-"+id,name:u.name,role:u.role,range:u.range,color:u.color,atk:u.atk,def:u.def,hp:u.hp,speed:u.speed,ult:u.ult,ability:u.ability,skillLevel:u.skillLevel};
}
function enemyUnit(id,i,stage){
 const u=D.FOES[id],scalar=1+(stage.id-1)*.18+(stage.boss?.17:0);
 return {id:"e-"+i,name:u.name,role:u.role,range:u.range,color:u.color,
  atk:Math.round(u.atk*scalar),def:Math.round(u.def*(1+(stage.id-1)*.095)),
  hp:Math.round(u.hp*scalar),speed:u.speed+Math.min(.1,(stage.id-1)*.009),ult:u.ult,ability:u.ability,skillLevel:1};
}
function launchBattle(){
 if(!state||battleSession||selectedStage>state.stageUnlocked)return;
 const stage=D.stageData(selectedStage),player=state.lineup.map(battleUnit),enemy=stage.enemy.map((id,i)=>enemyUnit(id,i,stage));
 const combat=E.createBattle(player,enemy,{stage:stage.id,autoUlt:true});
 battleSession={stage,combat,speed:1,effects:[],logs:["Your crew takes the field."],finished:false,uiClock:0,simTime:0};
 $("battleStageNumber").textContent=String(stage.id).padStart(2,"0");
 $("battleStageName").textContent=stage.name;
 $("battleResult").classList.add("hidden");
 $("battleOverlay").classList.remove("hidden");
 $("autoUltBtn").textContent="✧ Auto Ult: ON";$("autoUltBtn").classList.add("active");
 renderBattleControls();renderBattleHUD();renderUltButtons();
 toast("Battle started! Ultimates will cast automatically.");
}
function renderBattleControls(){
 if(!battleSession)return;
 document.querySelectorAll("[data-speed]").forEach(b=>b.classList.toggle("active",Number(b.dataset.speed)===battleSession.speed));
 $("ultModeHint").textContent=battleSession.combat.autoUlt?"AUTO-CAST ENABLED":"CLICK AN ULTIMATE WHEN READY";
}
function renderBattleHUD(){
 const b=battleSession?.combat;if(!b)return;
 for(const side of [0,1]){
  const list=b.units.filter(u=>u.side===side),living=list.filter(u=>u.hp>0);
  const max=list.reduce((s,u)=>s+u.maxHp,0),hp=list.reduce((s,u)=>s+u.hp,0);
  $(side===0?"hudPlayerBar":"hudEnemyBar").style.width=(hp/max*100)+"%";
  $(side===0?"hudPlayerCount":"hudEnemyCount").textContent=living.length+" / "+list.length+" · "+Math.round(hp/max*100)+"% HP";
 }
 const sec=Math.floor(b.time);
 $("battleClock").textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
}
function renderUltButtons(){
 const session=battleSession;if(!session)return;
 const units=session.combat.units.filter(u=>u.side===0),root=$("ultimateButtons");
 // Keep button elements stable while energy changes, so clicking an ultimate never loses
 // its target to an automatic DOM replacement during the mouse-down / mouse-up sequence.
 let existing=root.querySelectorAll?.("[data-cast]")||[];
 if(existing.length!==units.length){
  root.innerHTML=units.map(u=>
   '<button class="ultimate" data-cast="'+esc(u.id)+'" title="'+esc(u.ult)+'">'+
   '<span class="ability-glyph" style="color:'+esc(u.color)+'">'+esc(ICONS[u.role]||"✦")+'</span><small>'+esc(u.name)+'</small><div class="energy-track"><div></div></div></button>'
  ).join("");
  existing=root.querySelectorAll?.("[data-cast]")||[];
  if(existing.length!==units.length)return;
 }
 units.forEach((u,i)=>{
  const b=existing[i],ready=u.energy>=100&&u.hp>0;
  b.disabled=!ready||session.combat.autoUlt||session.finished;
  b.classList.toggle("ready",ready);
  const meter=b.querySelector(".energy-track > div");
  if(meter)meter.style.width=Math.round(u.energy)+"%";
 });
}
function processEvents(events){
 const s=battleSession;if(!s)return;
 const ids=Object.fromEntries(s.combat.units.map(u=>[u.id,u]));
 for(const evt of events){
  const from=ids[evt.from],to=ids[evt.to]||ids[evt.target],fp=from?DRAW.pos(from):null,tp=to?DRAW.pos(to):null;
  if(evt.type==="damage"&&tp){
   s.effects.push({type:"float",x:tp.x+(Math.random()-.5)*15,y:tp.y-138,text:(evt.amount?("-"+evt.amount):"BLOCK"),color:evt.crit?"#f7d484":"#ffa49d",age:0,duration:1.1});
   if(evt.crit)s.logs.unshift((from?.name||"Unit")+" lands a critical hit!");
  }else if(evt.type==="heal"&&tp){
   s.effects.push({type:"float",x:tp.x,y:tp.y-145,text:"+"+evt.amount,color:"#8ff4bd",age:0,duration:1.3});
  }else if(evt.type==="shield"&&tp){
   s.effects.push({type:"ring",x:tp.x,y:tp.y-48,color:"#83d9e8",age:0,duration:.6});
  }else if(evt.type==="attack"&&fp&&tp){
   s.effects.push({type:"line",x:fp.x,y:fp.y-60,toX:tp.x,toY:tp.y-64,color:evt.kind==="projectile"?(from?.color||"#d2c18f"):"#e7e3ce",age:0,duration:evt.kind==="projectile"?.26:.16});
  }else if(evt.type==="cast"&&fp){
   s.effects.push({type:"ring",x:fp.x,y:fp.y-52,color:from?.color||"#edcf8f",age:0,duration:.75});
   s.logs.unshift((from?.name||"Hero")+" used "+evt.name+"!");
  }else if(evt.type==="death"){
   s.logs.unshift(evt.name+" was defeated.");
   if(to)s.effects.push({type:"float",x:tp.x,y:tp.y-160,text:"K.O.",color:"#ffb69b",age:0,duration:1.6});
  }
 }
 s.logs=s.logs.slice(0,9);
 $("combatLogItems").innerHTML=s.logs.slice(0,6).map(t=>"<p>"+esc(t)+"</p>").join("");
 s.effects=s.effects.slice(-110);
}
function finishBattle(){
 const s=battleSession;if(!s||s.finished)return;
 s.finished=true;
 const winner=s.combat.winner,win=winner===0,draw=winner===-1;
 state.battles++;
 const first=win&&!state.cleared.includes(s.stage.id);
 let gold=0,essence=0,drop=null;
 if(win){
  state.battleWins++;gold=Math.round(s.stage.gold*(first?1:.32)*(1+(state.hall.treasury-1)*.10));
  essence=Math.round(s.stage.essence*(first?1:.4));
  state.renown+=first?75+s.stage.id*20:14;
  if(first){
   state.cleared.push(s.stage.id);
   state.stageUnlocked=Math.min(10,Math.max(state.stageUnlocked,s.stage.id+1));
   if(s.stage.drop&&!state.inventory.includes(s.stage.drop)){
    state.inventory.push(s.stage.drop);state.gearLevels[s.stage.drop]=1;drop=D.gearData(s.stage.drop);
   }
  }
  gainJournal("Victory at "+s.stage.name+". Earned "+gold+" gold.");
 }else if(draw){
  gold=24;gainJournal("The battle at "+s.stage.name+" ended in a draw.");
 }else{
  gold=20;gainJournal("The guild retreated from "+s.stage.name+". Reconsider your formation.");
 }
 state.gold+=gold;state.essence+=essence;save();render();
 $("resultEyebrow").textContent=win?(first?"FIRST CLEAR COMPLETE":"REPLAY VICTORY"):"BATTLE COMPLETE";
 $("resultTitle").textContent=win?"VICTORY":draw?"DRAW":"DEFEAT";
 $("resultTitle").style.color=win?"#f4d28f":draw?"#eef2f0":"#f3a69e";
 $("resultDescription").textContent=win?"Your crew prevailed. Upgrade your heroes and change your formation before the next encounter.":draw?"Neither side could claim the field. Reinforce your crew and try again.":"Your guild was overwhelmed. Try protecting the healer, recruiting new companions, or improving your gear.";
 $("resultReward").textContent="✦ "+gold+" GOLD"+(essence?"  ·  ✧ "+essence+" ESSENCE":"")+(drop?"  ·  ◆ "+drop.name:"");
 $("battleResult").classList.remove("hidden");renderBattleHUD();renderUltButtons();
}
function closeBattle(){
 if(!battleSession)return;
 $("battleOverlay").classList.add("hidden");
 battleSession=null;render();
}
function playFrame(ms){
 const dt=Math.min(.06,Math.max(0,(ms-lastFrame)/1000||.016));lastFrame=ms;visualTime+=dt;
 const s=battleSession;
 if(s){
  if(!s.finished){
   E.advance(s.combat,dt*s.speed);
   processEvents(E.consumeEvents(s.combat));
   if(s.combat.ended)finishBattle();
  }
  for(const v of s.effects)v.age+=dt;
  s.effects=s.effects.filter(v=>v.age<v.duration);
  DRAW.draw($("battleCanvas"),s.combat,s.effects,visualTime,s.stage);
  s.uiClock+=dt;
  if(s.uiClock>.13){s.uiClock=0;renderBattleHUD();renderUltButtons();}
 }
 requestAnimationFrame(playFrame);
}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-nav]");
 if(nav&&state&&!battleSession){page=nav.dataset.nav;render();return}
 const a=e.target.closest("[data-action]");if(!a||!state||battleSession)return;
 const action=a.dataset.action,id=a.dataset.id;
 if(action==="stage"){const n=Number(id);if(n<=state.stageUnlocked){selectedStage=n;render()}}
 else if(action==="selectUnit"){selectedUnit=id;render()}
 else if(action==="slot"){setSlot(Number(a.dataset.slot))}
 else if(action==="inspect"){selectedUnit=id;render()}
 else if(action==="autoFormation"){autoArrange()}
 else if(action==="fight"){launchBattle()}
 else if(action==="recruit"){recruit(id)}
 else if(action==="levelHero"){levelHero()}
 else if(action==="skillHero"){skillHero()}
 else if(action==="hallUpgrade"){hallUpgrade(id)}
 else if(action==="selectGear"){selectedGear=id;render()}
 else if(action==="upgradeGear"){upgradeGear()}
 else if(action==="quickUpgradeGear"){quickUpgradeGear()}
 else if(action==="equip"){equip(id)}
 else if(action==="goCampaign"){page="campaign";render()}
});
document.addEventListener("change",e=>{
 if(!state||battleSession)return;
 if(e.target?.matches?.("[data-quick-equip]"))quickEquip(e.target.value);
});
$("profileButton").addEventListener("click",()=>{if(!state||battleSession)return;page="roster";selectedUnit="hero";render()});
$("creatorOverlay").addEventListener("click",e=>{
 const cls=e.target.closest("[data-create-class]"),col=e.target.closest("[data-create-color]");
 if(cls){creatorClass=cls.dataset.createClass;renderCreate()}
 else if(col){creatorColor=col.dataset.createColor;renderCreate()}
});
$("createHeroBtn").addEventListener("click",createHero);
$("heroNameInput").addEventListener("keydown",e=>{if(e.key==="Enter")createHero()});
document.querySelectorAll("[data-speed]").forEach(btn=>btn.addEventListener("click",()=>{
 if(!battleSession)return;
 battleSession.speed=Number(btn.dataset.speed);renderBattleControls();
}));
$("autoUltBtn").addEventListener("click",()=>{
 const b=battleSession?.combat;if(!b||battleSession.finished)return;
 b.autoUlt=!b.autoUlt;$("autoUltBtn").textContent="✧ Auto Ult: "+(b.autoUlt?"ON":"OFF");
 $("autoUltBtn").classList.toggle("active",b.autoUlt);
 renderBattleControls();renderUltButtons();
});
$("ultimateButtons").addEventListener("click",e=>{
 const btn=e.target.closest("[data-cast]");if(!btn||!battleSession||battleSession.finished)return;
 if(battleSession.combat.autoUlt)return;
 if(E.cast(battleSession.combat,btn.dataset.cast)){processEvents(E.consumeEvents(battleSession.combat));renderUltButtons()}
});
$("retreatBtn").addEventListener("click",()=>{
 if(!battleSession)return;
 if(!battleSession.finished&&!window.confirm("Retreat from battle? You won't receive rewards."))return;
 closeBattle();
});
$("resultBtn").addEventListener("click",closeBattle);
// Start screen: current users can resume without any account; new users get one hero creation.
if(state)render();
else{const preview=newState("Wanderer");state=preview;render();state=null;renderCreate();$("creatorOverlay").classList.remove("hidden");}
requestAnimationFrame(playFrame);
})();