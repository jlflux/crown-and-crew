/* Crown & Crew canvas scene — original 2D procedural character art and effects. */
window.CC_DRAW = (() => {
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const pos=(u)=>u.side===0
    ? [{x:410,y:225},{x:410,y:391},{x:197,y:147},{x:197,y:301},{x:197,y:455}][u.slot] || {x:250,y:310}
    : [{x:689,y:225},{x:689,y:391},{x:906,y:147},{x:906,y:301},{x:906,y:455}][u.slot] || {x:858,y:310};
  const rgba=(hex,opacity)=>{
    const s=(hex||"#a9d4e4").replace("#","");
    if(s.length!==6)return "rgba(169,212,228,"+opacity+")";
    return "rgba("+parseInt(s.slice(0,2),16)+","+parseInt(s.slice(2,4),16)+","+parseInt(s.slice(4,6),16)+","+opacity+")";
  };
  function roundRect(ctx,x,y,w,h,r,fill,stroke,lw=1){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}
  }
  function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
  function line(ctx,x,y,xx,yy,color,w=2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.lineWidth=w;ctx.strokeStyle=color;ctx.stroke()}
  function polygon(ctx,pts,fill,stroke,lw=2){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
  const backgrounds={
    wood:{sky:"#405967",horizon:"#81927c",hill:"#45645b",floor:"#30473c",tree:"#172f34",glow:"#e0bb88"},
    mountain:{sky:"#5a5c6c",horizon:"#b78378",hill:"#534c58",floor:"#393d47",tree:"#282c3c",glow:"#edb38c"},
    marsh:{sky:"#41646b",horizon:"#73968d",hill:"#435e57",floor:"#2c4948",tree:"#213d42",glow:"#8de5c1"},
    spire:{sky:"#353d59",horizon:"#77728b",hill:"#3e3a57",floor:"#2d2c44",tree:"#202039",glow:"#c8adf8"}
  };
  function scenery(ctx,theme,time){
    const c=backgrounds[theme]||backgrounds.wood;
    const sky=ctx.createLinearGradient(0,0,0,560);
    sky.addColorStop(0,c.sky);sky.addColorStop(.55,c.horizon);sky.addColorStop(.75,c.hill);sky.addColorStop(1,c.floor);
    ctx.fillStyle=sky;ctx.fillRect(0,0,1100,560);
    const moonx=817,moony=116;
    const moonGlow=ctx.createRadialGradient(moonx,moony,4,moonx,moony,170);
    moonGlow.addColorStop(0,rgba(c.glow,.33));moonGlow.addColorStop(1,rgba(c.glow,0));
    ctx.fillStyle=moonGlow;ctx.fillRect(590,0,440,300);
    ellipse(ctx,moonx,moony,39,39,rgba(c.glow,.74));
    ctx.save();ctx.globalAlpha=.25;
    for(let i=0;i<9;i++){
      const x=i*155-80+(time*.8*(i%2?1:-1))%15;
      ellipse(ctx,x,113+i%3*34,90,12,"#e6ecdd");
    }ctx.restore();
    polygon(ctx,[[0,360],[80,262],[142,336],[245,213],[390,354],[501,247],[616,348],[725,235],[866,352],[940,228],[1100,361],[1100,560],[0,560]],c.hill);
    polygon(ctx,[[0,399],[85,354],[202,392],[315,310],[452,399],[575,334],[727,414],[854,310],[1012,382],[1100,334],[1100,560],[0,560]],rgba(c.tree,.78));
    if(theme==="spire"||theme==="mountain"){
      for(let i=0;i<6;i++){
        const x=85+i*178,y=278+(i%2)*28;
        polygon(ctx,[[x-25,410],[x-22,y],[x,y-38],[x+22,y],[x+30,410]],rgba(c.tree,.9));
        for(let z=0;z<3;z++){roundRect(ctx,x-27,y+24+z*22,54,9,2,rgba(c.glow,.11))}
      }
    }else{
      for(let i=0;i<17;i++){
        const x=18+i*69+(i%4)*12,y=351+(i%3)*22,scale=.55+(i%4)*.18;
        ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
        line(ctx,0,52,0,-50,c.tree,10);
        for(let j=0;j<3;j++)polygon(ctx,[[-35-j*8,0-j*28],[0,-105-j*22],[35+j*8,-j*28]],c.tree);
        ctx.restore();
      }
    }
    // Ground and an ornate duel ring.
    const ground=ctx.createLinearGradient(0,356,0,560);ground.addColorStop(0,rgba(c.floor,.56));ground.addColorStop(1,"#172c2d");
    ctx.fillStyle=ground;ctx.fillRect(0,369,1100,191);
    ctx.beginPath();ctx.ellipse(550,485,530,84,0,0,Math.PI*2);ctx.fillStyle="#0c1b2588";ctx.fill();ctx.strokeStyle=rgba(c.glow,.22);ctx.lineWidth=4;ctx.stroke();
    ctx.beginPath();ctx.ellipse(550,485,412,56,0,0,Math.PI*2);ctx.strokeStyle=rgba(c.glow,.14);ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<21;i++){const x=60+i*50,y=519+(i%2)*7;line(ctx,x,y,x+19,y,rgba(c.glow,.10),1)}
    for(const x of [50,1050]){
      ctx.save();ctx.translate(x,315);
      polygon(ctx,[[-15,55],[-15,-35],[15,-35],[15,55]],"#344850","#789287",2);
      ellipse(ctx,0,-38,10,13,rgba(c.glow,.9));
      ellipse(ctx,0,-38,20,29,rgba(c.glow,.17));ctx.restore();
    }
  }
  function sprite(ctx,u,t){
    const p=pos(u),breath=Math.sin(t*2.5+u.slot*1.9+u.side)*2.0;
    const lunge=u.lunge*33*(u.side===0?1:-1);
    const side=u.side===0?1:-1;
    const color=u.color||"#bfa88b";
    const dead=u.hp<=0;
    ctx.save();ctx.translate(p.x+lunge,p.y+breath);ctx.scale(side,1);
    if(dead){ctx.globalAlpha=.3;ctx.rotate(-.8);ctx.translate(-17,2)}
    ellipse(ctx,0,5,34,9,"#0010198e");
    if(!dead && u.energy>=100){
      ellipse(ctx,0,0,35,11,rgba("#f3d093",.2+Math.sin(t*8)*.12));
      ctx.beginPath();ctx.ellipse(0,0,35,11,0,0,Math.PI*2);ctx.strokeStyle="#eac785";ctx.lineWidth=2;ctx.stroke();
    }
    if(u.buff>0)ellipse(ctx,0,-40,39,50,rgba("#f4c76d",.12));
    if(u.shield>0){ellipse(ctx,0,-41,36,53,rgba("#98dffd",.14));ctx.beginPath();ctx.ellipse(0,-41,36,53,0,0,Math.PI*2);ctx.lineWidth=2;ctx.strokeStyle="#8adfff88";ctx.stroke();}
    // Capes, animated legs and feet.
    polygon(ctx,[[-18,-64],[-26,-16],[-10,-10],[0,-57]],rgba(color,.73),"#0d1e28",2);
    const gait=Math.sin(t*3+u.slot)*2.2;
    polygon(ctx,[[-14,-28],[-17,0],[-3,0],[0,-30]],"#273340","#081824",3);
    polygon(ctx,[[8,-28],[5,0],[19,0],[17,-29]],"#253643","#081824",3);
    roundRect(ctx,-20+gait,0,21,8,4,"#151f29","#40546a",1);
    roundRect(ctx,3-gait,0,21,8,4,"#151f29","#40546a",1);
    // Torso armor/robes depending on role.
    const caster=["mage","healer","support"].includes(u.role);
    if(caster){
      polygon(ctx,[[-18,-67],[17,-67],[22,-19],[-22,-19]],rgba(color,.94),"#1a2530",3);
      polygon(ctx,[[-7,-65],[8,-65],[12,-25],[-10,-25]],"#f1e0bb33");
    }else{
      roundRect(ctx,-19,-69,39,47,8,rgba(color,.95),"#1b2430",3);
      polygon(ctx,[[-9,-59],[7,-59],[14,-39],[2,-28],[-11,-41]],"#ffffff3d","#ffffff54",1.1);
      line(ctx,-16,-30,17,-30,"#bda883",4);
    }
    // Arms.
    line(ctx,-20,-62,-28,-38,"#475463",10);
    line(ctx,20,-62,29,-38,"#374558",10);
    ellipse(ctx,-28,-36,7,7,"#c59b79");
    ellipse(ctx,29,-37,7,7,"#c59b79");
    // Neck, face and hair / helmet.
    roundRect(ctx,-7,-81,14,14,4,"#b98b6d");
    ellipse(ctx,0,-91,17,20,["#cfa482","#9e7157","#dbad84","#b98b70"][u.slot%4]);
    if(u.role==="tank"){
      polygon(ctx,[[-21,-99],[-15,-112],[10,-111],[19,-98],[15,-83],[-18,-83]],"#526474","#b8c6c5",2.5);
      line(ctx,-15,-90,15,-90,"#161f2a",4);
      line(ctx,0,-110,0,-84,"#e4cb93",2);
    }else if(caster){
      polygon(ctx,[[-22,-81],[-22,-103],[-3,-117],[21,-102],[19,-80]],rgba(color,.94),"#283346",3);
      line(ctx,-15,-98,14,-97,"#f5ead052",2);
    }else{
      polygon(ctx,[[-17,-98],[-12,-111],[1,-117],[18,-103],[14,-96],[0,-105]],"#2c3039");
      line(ctx,-9,-91,-5,-91,"#352b2b",1.7);line(ctx,6,-91,10,-91,"#352b2b",1.7);
    }
    // Silhouetted weapons with distinct classes.
    if(u.role==="ranger"){
      ctx.beginPath();ctx.arc(36,-54,26,-Math.PI/2,Math.PI/2);ctx.strokeStyle="#e9cb92";ctx.lineWidth=4;ctx.stroke();
      line(ctx,36,-80,36,-28,"#fbf0d9",1.5);
      line(ctx,18,-57,58,-57,"#e7ebe1",2.4);
      polygon(ctx,[[58,-57],[52,-62],[52,-52]],"#b4e6da");
    }else if(u.role==="mage"||u.role==="healer"||u.role==="support"){
      line(ctx,32,-28,43,-107,"#aa8564",5);
      ellipse(ctx,44,-108,11,12,u.role==="healer"?"#f4e09a":u.role==="support"?"#90e4ba":"#ba9eff");
      ellipse(ctx,44,-108,21,21,rgba(color,.22));
    }else if(u.role==="tank"){
      polygon(ctx,[[29,-76],[47,-70],[46,-41],[30,-29],[18,-42],[18,-68]],"#4e6672","#cdded9",3);
      polygon(ctx,[[30,-70],[39,-58],[32,-38],[23,-54]],rgba(color,.9));
      line(ctx,-30,-36,-31,-107,"#887256",5);
      polygon(ctx,[[-38,-105],[-22,-105],[-27,-128],[-32,-128]],"#d0dbd9","#f1e9c4",2);
    }else if(u.role==="assassin"){
      line(ctx,26,-36,58,-80,"#e6d8c7",5);
      polygon(ctx,[[58,-80],[47,-78],[56,-96]],"#e7e3f7");
      line(ctx,-28,-37,-47,-73,"#ddd6cf",4);
    }else{
      line(ctx,29,-36,46,-114,"#bb9265",5);
      polygon(ctx,[[38,-111],[56,-111],[52,-139],[44,-143]],"#dbe4e3","#eef1e7",2);
      line(ctx,37,-111,57,-111,"#a68d5e",5);
    }
    if(u.casting>0){
      ctx.globalAlpha=clamp(u.casting*1.8,0,1);
      ellipse(ctx,0,-55,42,72,rgba(color,.19));
      ctx.beginPath();ctx.arc(35,-103,27*(1-u.casting*.35),0,Math.PI*2);
      ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();
      ctx.globalAlpha=dead?.3:1;
    }
    if(u.flash>0){ctx.globalAlpha=clamp(u.flash*1.8,0,.8);roundRect(ctx,-21,-113,73,118,16,"#ffffff");ctx.globalAlpha=dead?.3:1}
    ctx.restore();
    if(dead)return;
    // Label and clear bars are positioned in world space, not flipped.
    ctx.save();ctx.textAlign="center";ctx.shadowColor="#06101c";ctx.shadowBlur=4;
    ctx.font="900 11px system-ui";ctx.fillStyle=u.side===0?"#e6f8f8":"#ffe2df";
    ctx.fillText(u.name.length>15?u.name.slice(0,14)+"…":u.name,p.x+lunge,p.y-139+breath);
    ctx.shadowBlur=0;
    roundRect(ctx,p.x-32+lunge,p.y-132+breath,64,7,2,"#14202d","#5a7181",1);
    roundRect(ctx,p.x-31+lunge,p.y-131+breath,62*(u.hp/u.maxHp),5,1,u.side===0?"#77d8b4":"#f38d82");
    roundRect(ctx,p.x-32+lunge,p.y-121+breath,64,4,2,"#182c40");
    roundRect(ctx,p.x-32+lunge,p.y-121+breath,64*(u.energy/100),4,2,"#edc583");
    ctx.restore();
  }
  function effects(ctx,effects,dt){
    for(const e of effects){
      const alpha=clamp(1-e.age/e.duration,0,1);
      if(e.type==="float"){
        ctx.save();ctx.globalAlpha=alpha;ctx.font="900 20px system-ui";ctx.textAlign="center";
        ctx.lineWidth=3;ctx.strokeStyle="#14222c";ctx.strokeText(e.text,e.x,e.y-e.age*41);
        ctx.fillStyle=e.color||"#ffe3a4";ctx.fillText(e.text,e.x,e.y-e.age*41);ctx.restore();
      }else if(e.type==="line"){
        const t=clamp(e.age/e.duration,0,1);
        const x=e.x+(e.toX-e.x)*t,y=e.y+(e.toY-e.y)*t;
        ctx.save();ctx.globalAlpha=alpha;
        ctx.strokeStyle=e.color||"#b5e2db";ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x,y);ctx.stroke();
        ellipse(ctx,x,y,7,7,e.color||"#d3ebdb");ctx.restore();
      }else if(e.type==="ring"){
        ctx.save();ctx.globalAlpha=alpha;
        ctx.beginPath();ctx.arc(e.x,e.y,10+e.age*65,0,Math.PI*2);
        ctx.strokeStyle=e.color||"#e8c787";ctx.lineWidth=4;ctx.stroke();ctx.restore();
      }
    }
  }
  function draw(canvas,battle,effectList,time,stage){
    const ctx=canvas.getContext("2d"),theme=stage?.theme||"wood";
    ctx.clearRect(0,0,1100,560);
    scenery(ctx,theme,time);
    const units=[...battle.units].sort((a,b)=>{
      const ay=pos(a).y,by=pos(b).y;
      return ay-by;
    });
    for(const u of units)sprite(ctx,u,time);
    effects(ctx,effectList);
  }
  return {draw,pos,rgba};
})();