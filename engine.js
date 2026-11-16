/* Crown & Crew — independent deterministic-ish autobattle engine.
   This module has no DOM dependencies and can be smoke-tested in isolation. */
window.CC_ENGINE = (() => {
  const round = n => Math.round(n);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const alive = (b, side) => b.units.filter(u => u.side === side && u.hp > 0);
  const allAlive = b => b.units.filter(u => u.hp > 0);
  function seeded(seed) {
    let v = (Number(seed) || 987654321) >>> 0;
    return () => ((v = (v * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function createBattle(player, enemy, settings = {}) {
    const units = [...player.map((u,i) => ({...u, side:0, slot:i})), ...enemy.map((u,i) => ({...u, side:1, slot:i}))].map((unit,i) => ({
      ...unit, id: String(unit.id || "unit-"+i), hp:Math.max(1,round(unit.hp)), maxHp:Math.max(1,round(unit.hp)),
      atk:Math.max(1,round(unit.atk)), def:Math.max(0,round(unit.def)), speed:Math.max(.45,Number(unit.speed)||.9),
      energy:18, shield:0, cooldown:.25 + i*.075, casting:0, lunge:0, flash:0, taunt:0, buff:0, casts:0, dealt:0, healed:0
    }));
    return {
      units, time:0, elapsed:0, accumulator:0, duration:65, autoUlt:settings.autoUlt !== false,
      winner:null, ended:false, events:[], rng:seeded(settings.seed || (Math.random()*2**32)>>>0),
      stage:settings.stage || 1, stats:{attacks:0, casts:0, deaths:0}
    };
  }
  const emit = (b,type,payload={}) => {
    b.events.push({type, t:b.time,...payload});
    if(b.events.length>350)b.events.splice(0,b.events.length-350);
  };
  const other = (b,u) => alive(b,1-u.side);
  const allies = (b,u) => alive(b,u.side);
  function pickEnemy(b,u,choice="standard") {
    const list=other(b,u);if(!list.length)return null;
    const taunts=list.filter(x=>x.taunt>0);
    if(taunts.length)return taunts.sort((a,z)=>z.hp-a.hp)[0];
    if(choice==="backline"||u.role==="assassin"){
      const backs=list.filter(x=>x.slot>=2);
      if(backs.length)return backs.sort((a,z)=>(a.hp/a.maxHp)-(z.hp/z.maxHp))[0];
    }
    if(choice==="weak" || (b.time>25&&b.rng()>.4))return list.sort((a,z)=>(a.hp/a.maxHp)-(z.hp/z.maxHp))[0];
    const fronts=list.filter(x=>x.slot<2);
    const pool=fronts.length?fronts:list;
    if(u.role==="ranger"&&b.rng()<.25)return pickEnemy(b,{...u,role:"mage"},"weak");
    return pool[Math.floor(b.rng()*pool.length)];
  }
  function mitigate(atk,def) {return atk * .76 * (100/(100+def*3.1));}
  function damage(b,from,to,power=1,kind="hit") {
    if(!to || to.hp<=0)return 0;
    const crit=b.rng()<.115;
    // Overtime pressure prevents healer-heavy formations from stalemating indefinitely.
    const frenzy=1+Math.max(0,b.time-22)*.085;
    let amount=Math.max(2,round(mitigate(from.atk*power*frenzy*(from.buff>0?1.25:1)*(crit?1.5:1)*(0.89+b.rng()*.20),to.def)));
    const absorbed=Math.min(to.shield,amount);to.shield-=absorbed;amount-=absorbed;
    const actual=Math.min(to.hp,amount);to.hp-=actual;from.dealt+=actual;
    to.flash=.32;to.energy=clamp(to.energy + 6,0,100);
    emit(b,"damage",{from:from.id,to:to.id,amount:actual,absorbed,crit,kind});
    if(to.hp===0) {b.stats.deaths++;emit(b,"death",{target:to.id,name:to.name,side:to.side});}
    return actual;
  }
  function heal(b,from,to,amount) {
    if(!to || to.hp<=0)return 0;
    const fatigue=Math.max(.25,1-Math.max(0,b.time-18)*.030);
    const actual=Math.min(to.maxHp-to.hp,Math.max(0,round(amount*fatigue)));
    to.hp+=actual;from.healed+=actual;
    if(actual>0)emit(b,"heal",{from:from.id,to:to.id,amount:actual});
    return actual;
  }
  function attack(b,u) {
    const friends=allies(b,u);
    if(u.role==="healer" || u.role==="support"){
      const injured=friends.filter(x=>x.hp<x.maxHp*.89).sort((a,z)=>a.hp/a.maxHp-z.hp/z.maxHp);
      if(injured.length){
        heal(b,u,injured[0],u.atk*.73+(u.role==="healer"?11:5));
        u.energy=clamp(u.energy+19,0,100);u.cooldown=1.25/u.speed;u.lunge=.22;b.stats.attacks++;return;
      }
    }
    const target=pickEnemy(b,u);if(!target)return;
    damage(b,u,target,1,"basic");
    u.energy=clamp(u.energy+20,0,100);
    u.cooldown=(u.range==="melee"?1.15:1.3)/u.speed;
    u.lunge=.25;b.stats.attacks++;
    emit(b,"attack",{from:u.id,to:target.id,kind:u.range==="ranged"?"projectile":"slash",color:u.color});
  }
  function cast(b,unitId){
    if(b.ended)return false;
    const u=b.units.find(x=>x.id===unitId);
    if(!u||u.hp<=0||u.energy<100)return false;
    u.energy=0;u.casts++;b.stats.casts++;u.casting=.55;u.cooldown=Math.max(u.cooldown,.48);
    const boost=1+(Math.max(1,u.skillLevel||1)-1)*.22;
    emit(b,"cast",{from:u.id,ability:u.ability,name:u.ult,side:u.side});
    const foe=other(b,u),friends=allies(b,u);
    switch(u.ability){
      case "taunt":
        u.taunt=5.4;u.shield+=round((u.maxHp*.28+u.atk*.5)*boost);
        emit(b,"shield",{from:u.id,to:u.id,amount:round((u.maxHp*.28+u.atk*.5)*boost)});break;
      case "cleave":{
        const targets=foe.filter(x=>x.slot<2).slice(0,2);
        if(!targets.length&&foe.length)targets.push(foe[0]);
        for(const t of targets)damage(b,u,t,1.85*boost,"ultimate");break;
      }
      case "volley":{
        const targets=[...foe].sort((a,z)=>a.hp/a.maxHp-z.hp/z.maxHp).slice(0,3);
        for(const t of targets)damage(b,u,t,1.38*boost,"ultimate");break;
      }
      case "meteor":
        for(const t of [...foe])damage(b,u,t,.96*boost,"ultimate");break;
      case "shadow":{
        const t=pickEnemy(b,u,"backline");if(t)damage(b,u,t,2.7*boost,"ultimate");break;
      }
      case "heal":
        for(const f of friends)heal(b,u,f,(u.atk*1.65+19)*boost);break;
      case "ward":
        for(const f of friends){const amount=round((u.atk*.72+15)*boost);f.shield+=amount;emit(b,"shield",{from:u.id,to:f.id,amount});}break;
      case "rally":
        for(const f of friends)f.buff=Math.max(f.buff,7.5*boost);break;
      default:
        if(foe[0])damage(b,u,foe[0],2*boost,"ultimate");
    }
    return true;
  }
  function resolveEnd(b){
    if(b.ended)return;
    const p=alive(b,0),e=alive(b,1);
    if(p.length&&e.length&&b.time<b.duration)return;
    b.ended=true;
    const pHp=p.reduce((a,u)=>a+u.hp/u.maxHp,0);
    const eHp=e.reduce((a,u)=>a+u.hp/u.maxHp,0);
    b.winner=p.length&&!e.length?0:e.length&&!p.length?1:pHp>eHp?0:eHp>pHp?1:-1;
    emit(b,"end",{winner:b.winner,time:b.time,hp:[p.reduce((a,u)=>a+u.hp,0),e.reduce((a,u)=>a+u.hp,0)]});
  }
  function tick(b,dt) {
    if(b.ended)return;
    b.time+=dt;
    for(const u of b.units){
      u.lunge=Math.max(0,u.lunge-dt*2.4);u.flash=Math.max(0,u.flash-dt*3.5);
      u.casting=Math.max(0,u.casting-dt*2.1);
      u.buff=Math.max(0,u.buff-dt);u.taunt=Math.max(0,u.taunt-dt);
      if(u.hp<=0)continue;
      u.energy=clamp(u.energy+dt*.8,0,100);
      u.cooldown-=dt;
      if(u.energy>=100&&(u.side===1||b.autoUlt))cast(b,u.id);
      if(u.cooldown<=0)attack(b,u);
    }
    resolveEnd(b);
  }
  function advance(b,seconds){
    let dt=clamp(Number(seconds)||0,0,3);
    b.accumulator+=dt;
    let guard=0;
    while(b.accumulator>=.05&&!b.ended&&guard++<70){
      b.accumulator-=.05;tick(b,.05);
    }
    return b;
  }
  function consumeEvents(b){const events=b.events.slice();b.events.length=0;return events;}
  return {createBattle,advance,cast,consumeEvents,alive,mitigate};
})();