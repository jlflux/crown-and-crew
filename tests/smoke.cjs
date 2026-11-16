/* Crown & Crew smoke test. Node.js 20+; no dependencies. Run: node tests/smoke.cjs */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const env={window:{},console,Math};vm.createContext(env);
for(const file of ["data.js","engine.js"])vm.runInContext(read(file),env,{filename:file});
const {CC_DATA:D,CC_ENGINE:E}=env.window;
assert.equal(D.STAGES.length,10);
assert.equal(D.COMPANIONS.length,8);
assert.equal(D.COMPANIONS.filter(c=>c.starter).length,4);
assert.deepEqual([...D.STAGES.map(s=>s.id)],Array.from({length:10},(_,i)=>i+1));
assert.ok(D.STAGES.every(s=>s.enemy.length>=4&&s.enemy.length<=5));
assert.ok(D.COMPANIONS.every(c=>c.hp>0&&c.atk>0&&c.ability));
function player(heroClass="guardian",lv=1){
 return ["brann","orin","hero","lyra","kael"].map(id=>{
  const x=id==="hero"?D.CLASSES[heroClass]:D.COMPANIONS.find(c=>c.id===id);
  return{id:"p-"+id,name:x.name,role:x.role,hp:Math.round(x.hp*(1+(lv-1)*.115)),atk:Math.round(x.atk*(1+(lv-1)*.12)),def:x.def,
   speed:x.speed,range:x.range,ability:x.ability,ult:x.ult,color:x.color,skillLevel:1};
 });
}
function enemy(stage){
 const scale=1+(stage.id-1)*.18+(stage.boss?.17:0);
 return stage.enemy.map((id,i)=>{
  const x=D.FOES[id];
  return{id:"e-"+i,name:x.name,role:x.role,hp:Math.round(x.hp*scale),atk:Math.round(x.atk*scale),
   def:Math.round(x.def*(1+(stage.id-1)*.095)),speed:x.speed,range:x.range,ability:x.ability,ult:x.ult,color:x.color};
 });
}
let victories=0;
for(const cls of Object.keys(D.CLASSES))for(const stage of D.STAGES){
 const battle=E.createBattle(player(cls,Math.max(1,Math.floor(stage.id*.9))),enemy(stage),{seed:stage.id*101,stage:stage.id});
 let max=0;
 while(!battle.ended&&max++<750){E.advance(battle,.15);E.consumeEvents(battle);}
 assert.ok(battle.ended,"battle must end: "+cls+" stage "+stage.id);
 assert.ok([-1,0,1].includes(battle.winner));
 assert.ok(battle.time<=65.1,"overtime resolution should end in 65 seconds");
 assert.ok(battle.units.every(u=>u.hp>=0&&u.hp<=u.maxHp));
 if(battle.winner===0)victories++;
}
assert.ok(victories>0,"at least one battle should be winnable");
const mkSkillBattle=skill=>{
 const mage={id:"p",name:"Mage",role:"mage",hp:200,atk:30,def:4,speed:.8,range:"ranged",ability:"meteor",ult:"Meteor",color:"#abcdef",skillLevel:skill};
 const foe={id:"e",name:"Dummy",role:"tank",hp:600,atk:1,def:5,speed:.6,range:"melee",ability:"taunt",ult:"Ward",color:"#dcba98"};
 const b=E.createBattle([mage],[foe],{seed:123,autoUlt:false});
 b.units[0].energy=100;assert.equal(E.cast(b,"p"),true);
 return b.units[1].hp;
};
assert.ok(mkSkillBattle(3)<mkSkillBattle(1),"upgraded skill must deal more damage");
const html=read("index.html");
for(const ref of ["styles.css","data.js","engine.js","battle-view.js","game.js"])assert.ok(html.includes(ref),"missing HTML reference: "+ref);
for(const script of ["data.js","engine.js","battle-view.js","game.js"])new Function(read(script));
console.log("PASS: 8 companions, 10 stages, 30 complete combats, skill scaling, script references.");
