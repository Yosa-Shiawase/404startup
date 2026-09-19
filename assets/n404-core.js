/* N404 CORE — game engine for 404STARTUP library. Single-game mount, no switcher. */
window.N404=(function(){
'use strict';
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const irand=(a,b)=>Math.floor(rand(a,b+1));
const TAU=Math.PI*2;
const fmt=n=>String(Math.max(0,Math.floor(n))).padStart(6,'0');
const MONO='ui-monospace,"SF Mono",Menlo,Consolas,monospace';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE=matchMedia('(pointer: coarse)');
const LS={get:(k,d)=>{try{return localStorage.getItem(k)??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
function mix(c1,c2,t){const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const a=p(c1),b=p(c2);return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';}
const AudioFX={ctx:null,master:null,muted:LS.get('n404_mute','0')==='1',
 ensure(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.16;this.master.connect(this.ctx.destination);}if(this.ctx.state==='suspended')this.ctx.resume();},
 tone(f0,f1,dur,type,vol,at){if(this.muted||!this.ctx)return;type=type||'square';vol=vol==null?1:vol;at=at||0;
  const t=this.ctx.currentTime+at,o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(Math.max(f0,1),t);o.frequency.exponentialRampToValueAtTime(Math.max(f1,1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.05);},
 noise(dur,vol){if(this.muted||!this.ctx)return;dur=dur||.2;vol=vol||.3;
  const n=this.ctx.sampleRate*dur|0,buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=this.ctx.createBufferSource();s.buffer=buf;const g=this.ctx.createGain();g.gain.value=vol;
  const f=this.ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=.6;
  s.connect(f);f.connect(g);g.connect(this.master);s.start();},
 jump(){this.tone(320,680,.13,'square',.5)},land(){this.tone(190,120,.06,'triangle',.3)},
 milestone(){this.tone(880,880,.06,'square',.32);this.tone(1245,1245,.09,'square',.32,.07)},
 pickup(){this.tone(660,990,.1,'square',.45)},near(){this.tone(1400,1900,.05,'sine',.2)},
 die(){this.tone(380,55,.45,'sawtooth',.5)},eat(){this.tone(520,780,.07,'square',.4)},
 golden(){this.tone(660,660,.07,'square',.4);this.tone(990,990,.12,'square',.4,.08)}};
const INFO={
 dunes:{name:'DUNES FOX RUN',meta:'#F2E2C4',hintC:'TAP TO RUN & JUMP · SWIPE ↓ TO DUCK',hintK:'SPACE TO RUN · ↑ JUMP · ↓ DUCK',over:'LOST IN THE DUNES'},
 orbit:{name:'ORBIT DRIFTER',meta:'#0A0E1B',hintC:'TAP TO LAUNCH · DRAG TO STEER',hintK:'SPACE TO LAUNCH · ↑ ↓ OR HOLD TO STEER',over:'SHIP LOST IN THE VOID'},
 terminal:{name:'TERMINAL SNAKE',meta:'#050805',hintC:'TAP TO START · SWIPE OR USE THE PAD',hintK:'SPACE TO START · ARROWS / WASD',over:'PROCESS TERMINATED'},
 sonar:{name:'SONAR CONTACT',meta:'#04101A',hintC:'TAP TO SCAN · TAP THE PINGS',hintK:'SPACE TO SCAN · CLICK THE PINGS',over:'SIGNAL FADED'},
 vapor:{name:'SUNSET DRIFT',meta:'#160B33',hintC:'TAP TO DRIVE · TAP LEFT / RIGHT FOR LANES',hintK:'SPACE TO DRIVE · ← → CHANGE LANES',over:'WIPEOUT'},
 matrix:{name:'WHITE RABBIT',meta:'#000306',hintC:'TAP TO JACK IN · TAP LEFT / RIGHT TO HOP',hintK:'SPACE TO JACK IN · ← → TO HOP',over:'CONNECTION LOST'},
 cab:{name:'ARCADE CABINET',meta:'#0B0B12',hintC:'TAP TO INSERT COIN · HOLD & DRAG PADDLE',hintK:'SPACE TO INSERT COIN · HOLD ARROWS OR DRAG',over:'GAME OVER — INSERT COIN'},
 deep:{name:'ABYSS DRIFT',meta:'#04202F',hintC:'TAP TO DIVE · HOLD TO RISE',hintK:'HOLD SPACE / ↑ TO RISE · RELEASE TO SINK',over:'CRUSH DEPTH'}};
const CSS='*{box-sizing:border-box;margin:0;padding:0}'+
':root{--mono:ui-monospace,"SF Mono","Cascadia Mono","Segoe UI Mono","Roboto Mono",Menlo,Consolas,"Liberation Mono",monospace}'+
'html,body{height:100%}html{overscroll-behavior:none}'+
'body{font-family:var(--mono);background:var(--bg);color:var(--ink);overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;transition:background-color .5s,color .5s}'+
'button{font-family:inherit;touch-action:manipulation}'+
'#app{position:absolute;inset:0;overflow:hidden}#stage{position:absolute;top:0;left:0;display:block;touch-action:none}'+
'body[data-theme="dunes"]{--bg:#F2E2C4;--ink:#3A2A18;--accent:#C75B26;--dim:#A08258;--panel:rgba(58,42,24,.09)}'+
'body[data-theme="dunes"].night{--bg:#232849;--ink:#EFE6CC;--accent:#F2A65A;--dim:#7E86B4;--panel:rgba(239,230,204,.1)}'+
'body[data-theme="orbit"]{--bg:#0A0E1B;--ink:#E9EDF6;--accent:#FFB454;--dim:#66738F;--panel:rgba(233,237,246,.08)}'+
'body[data-theme="terminal"]{--bg:#050805;--ink:#49E36F;--accent:#F2D258;--dim:#1E5B33;--panel:rgba(73,227,111,.08)}'+
'body[data-theme="sonar"]{--bg:#04101A;--ink:#9FE8DC;--accent:#5CF2D6;--dim:#2E6B63;--panel:rgba(92,242,214,.08)}'+
'body[data-theme="vapor"]{--bg:#160B33;--ink:#FFE8FB;--accent:#FF71CE;--dim:#8A6BB0;--panel:rgba(255,113,206,.1)}'+
'body[data-theme="matrix"]{--bg:#000306;--ink:#49E36F;--accent:#C8FFD9;--dim:#1E5B33;--panel:rgba(73,227,111,.08)}'+
'body[data-theme="cab"]{--bg:#0B0B12;--ink:#FFE8C9;--accent:#FFBD2E;--dim:#5A5470;--panel:rgba(255,189,46,.08)}'+
'body[data-theme="deep"]{--bg:#04202F;--ink:#BFE8FF;--accent:#7FE8D6;--dim:#3A6B84;--panel:rgba(127,232,214,.08)}'+
'.hud{position:absolute;top:0;left:0;right:0;z-index:25;display:flex;align-items:center;gap:.55rem;padding:max(.7rem,env(safe-area-inset-top)) .9rem .4rem}'+
'.hud .sp{flex:1}.chip{font-size:.62rem;letter-spacing:.08em;color:var(--dim);white-space:nowrap}'+
'.chip b{color:var(--ink);font-weight:600;min-width:5ch;display:inline-block;text-align:right}'+
'.icon-btn{display:inline-flex;align-items:center;justify-content:center;border:1.5px solid var(--dim);color:var(--ink);background:none;min-width:2.2rem;min-height:2.2rem;padding:.4rem;cursor:pointer;text-decoration:none}'+
'.icon-btn svg{width:.95rem;height:.95rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
'.title-chip{position:absolute;top:3.4rem;left:50%;transform:translateX(-50%);z-index:10;font-size:.62rem;font-weight:600;letter-spacing:.26em;color:var(--accent);pointer-events:none;white-space:nowrap}'+
'.hint{position:absolute;left:50%;transform:translateX(-50%);top:5.2rem;z-index:15;font-size:.6rem;letter-spacing:.14em;white-space:nowrap;max-width:94%;overflow:hidden;text-overflow:ellipsis;animation:nblink 1.6s steps(1) infinite;pointer-events:none}'+
'@keyframes nblink{50%{opacity:.25}}'+
'.gameover{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);z-index:30;text-align:center;background:var(--bg);border:2px solid var(--ink);padding:1.2rem 1.6rem;max-width:min(92%,26rem);max-height:70%;overflow-y:auto;display:none}'+
'.gameover.show{display:block;animation:nover .3s cubic-bezier(.2,1.4,.4,1)}'+
'@keyframes nover{from{transform:translate(-50%,-46%);opacity:0}}'+
'.over-label{font-weight:700;font-size:1rem;letter-spacing:.14em;color:var(--accent)}'+
'.over-score{margin-top:.6rem;font-size:.68rem;letter-spacing:.14em}'+
'.over-new{margin-top:.5rem;font-size:.58rem;letter-spacing:.28em;color:var(--accent);display:none}'+
'.over-new.show{display:block;animation:nblink .9s steps(1) infinite}'+
'.over-retry{margin-top:1rem;font-size:.64rem;letter-spacing:.16em;animation:nblink 1.3s steps(1) infinite}'+
'a.over-alt{display:inline-block;margin-top:.7rem;font-size:.56rem;letter-spacing:.12em;color:var(--dim)}'+
'.dpad{position:absolute;top:6.4rem;left:50%;transform:translateX(-50%);z-index:26;display:none;gap:.4rem}.dpad.show{display:flex}'+
'.dpad button{width:2.8rem;height:2.5rem;border:1.5px solid var(--dim);background:var(--panel);color:var(--ink);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:.25rem}'+
'.dpad button:active{background:var(--ink);color:var(--bg)}'+
'.dpad svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}'+
'.fx-scan{position:absolute;inset:0;z-index:40;pointer-events:none;opacity:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 1px,transparent 1px 3px)}'+
'.fx-scan::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 22vmin rgba(0,0,0,.6)}'+
'body[data-theme="terminal"] .fx-scan{opacity:.5}'+
'body.small .chip{font-size:.66rem}body.small .icon-btn{min-width:2rem;min-height:2rem;padding:.35rem}'+
'@media(prefers-reduced-motion:reduce){*{animation:none!important}}';
let W=0,H=0,DPR=1,remPx=16,game=null,gameId='',deadAt=0,dpadOn=false;
let els={},cv=null,ctx=null,titleEl=null,curScore=0;
function buildChrome(id,back){
  back=back||'../';
  document.body.dataset.theme=id;
  let m=document.querySelector('meta[name="theme-color"]');
  if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}
  m.content=INFO[id].meta;
  document.title=INFO[id].name+' — 404STARTUP';
  const app=document.createElement('div');app.id='app';
  app.innerHTML=
   '<canvas id="stage"></canvas><div class="fx-scan"></div>'+
   '<header class="hud">'+
   '<a class="icon-btn" href="'+back+'" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></a>'+
   '<div class="chip">SCORE&nbsp;<b id="nScore">000000</b></div>'+
   '<div class="chip">BEST&nbsp;<b id="nBest">000000</b></div><span class="sp"></span>'+
   '<button class="icon-btn" id="nSound" aria-label="Toggle sound">'+
   '<svg id="icoOn" viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>'+
   '<svg id="icoOff" viewBox="0 0 24 24" style="display:none"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg></button>'+
   '</header>'+
   '<div class="title-chip" id="nTitle">'+INFO[id].name+'</div>'+
   '<div class="hint" id="nHint"></div>'+
   '<div class="gameover" id="nOver"><div class="over-label" id="nOverL"></div>'+
   '<div class="over-score" id="nOverS"></div><div class="over-new" id="nOverN">— NEW BEST —</div>'+
   '<div class="over-retry">TAP OR PRESS SPACE TO RETRY</div>'+
   '<a class="over-alt" href="'+back+'">BROWSE MORE GAMES →</a></div>'+
   '<div class="dpad" id="nDpad">'+
   '<button data-k="ArrowLeft"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>'+
   '<button data-k="ArrowUp"><svg viewBox="0 0 24 24"><path d="M6 15l-6-6 6-6"/></svg></button>'+
   '<button data-k="ArrowDown"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>'+
   '<button data-k="ArrowRight"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></div>';
  document.body.appendChild(app);
  els={score:document.getElementById('nScore'),best:document.getElementById('nBest'),
   hint:document.getElementById('nHint'),over:document.getElementById('nOver'),
   overL:document.getElementById('nOverL'),overS:document.getElementById('nOverS'),
   overN:document.getElementById('nOverN')};
}
function setScore(n,flash){n=Math.floor(n);if(n===curScore)return;
 const mile=flash&&Math.floor(n/100)>Math.floor(curScore/100);
 curScore=n;els.score.textContent=fmt(n);
 if(mile){AudioFX.milestone();}}
function setBest(n){els.best.textContent=fmt(n)}
function bestKey(id){return 'n404_best_'+id}
function showHint(t){els.hint.textContent=t;els.hint.style.display='';posHint()}
function hideHint(){els.hint.style.display='none'}
function showOver(label,score,best,nb){if(!game||game.mode!=='dead')return;
 els.overL.textContent=label;els.overS.textContent='SCORE '+fmt(score)+' — BEST '+fmt(best);
 els.overN.classList.toggle('show',!!nb);els.over.classList.add('show');}
function hideOver(){els.over.classList.remove('show')}
function posHint(){if(els.hint)els.hint.style.top=Math.round(titleEl.getBoundingClientRect().bottom+8)+'px'}
function titleBottom(){return titleEl.getBoundingClientRect().bottom}
function canRestart(){const shown=els.over.classList.contains('show');return shown||performance.now()-deadAt>1200}
function syncViewport(){
 const vv=window.visualViewport,de=document.documentElement;
 let w=vv?vv.width:window.innerWidth,h=vv?vv.height:window.innerHeight;
 if(de&&de.clientWidth)w=Math.min(w,de.clientWidth);
 if(de&&de.clientHeight)h=Math.min(h,de.clientHeight);
 w=Math.max(200,Math.round(w));h=Math.max(240,Math.round(h));
 if(w===W&&h===H)return;
 W=w;H=h;
 remPx=Math.round(16*clamp(Math.min(W/460,H/800),.72,1.25)*100)/100;
 document.documentElement.style.fontSize=remPx+'px';
 document.body.classList.toggle('small',W<560);
 DPR=Math.min(window.devicePixelRatio||1,2);
 cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
 cv.style.width=W+'px';cv.style.height=H+'px';
 ctx.setTransform(DPR,0,0,DPR,0,0);
 if(game&&game.resize)game.resize();
 posHint();
}
function mount(id,opts){
 opts=opts||{};
 gameId=id;game=Games[id];if(!game)throw new Error('no game: '+id);
 if(!document.getElementById('n404css')){const st=document.createElement('style');st.id='n404css';st.textContent=CSS;document.head.appendChild(st);}
 buildChrome(id,opts.back);
 cv=document.getElementById('stage');ctx=cv.getContext('2d');
 titleEl=document.getElementById('nTitle');
 dpadOn=(id==='terminal')&&COARSE.matches;
 document.getElementById('nDpad').classList.toggle('show',dpadOn);
 setBest(+LS.get(bestKey(id),0));
 game.enter();
 if(dpadOn)hideHint();
 syncViewport();
 addEventListener('keydown',e=>{const k=e.key;
  if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(k)>-1)e.preventDefault();
  AudioFX.ensure();
  if(game.mode==='dead'){if((k===' '||k==='Enter')&&canRestart())game.restart();return;}
  if(game.mode==='ready'){
   const dirs=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'];
   if(k===' '||k==='Enter'||k==='ArrowUp'||(id==='terminal'&&dirs.indexOf(k)>-1)){
    game.start();if(id==='terminal'&&dirs.indexOf(k)>-1)game.key(k);}
   return;}
  game.key&&game.key(k);});
 addEventListener('keyup',e=>{game.release&&game.release(e.key)});
 cv.addEventListener('pointerdown',e=>{AudioFX.ensure();
  if(game.mode==='dead'){if(canRestart())game.restart();return;}
  if(game.mode==='ready'){game.start();return;}
  game.pointer&&game.pointer(e,'down');});
 addEventListener('pointermove',e=>{if(game.mode==='playing')game.pointer&&game.pointer(e,'move')});
 addEventListener('pointerup',e=>{game.pointer&&game.pointer(e,'up')});
 addEventListener('pointercancel',e=>{game.pointer&&game.pointer(e,'up')});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 els.over.addEventListener('pointerdown',e=>{e.stopPropagation();if(game.mode==='dead'&&canRestart())game.restart();});
 document.querySelectorAll('#nDpad button').forEach(b=>b.addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();AudioFX.ensure();
  if(game.mode==='ready')game.start();
  else if(game.mode==='dead'){if(canRestart())game.restart();return;}
  game.key&&game.key(b.dataset.k);}));
 const snd=document.getElementById('nSound');
 function renderMute(){document.getElementById('icoOn').style.display=AudioFX.muted?'none':'';
  document.getElementById('icoOff').style.display=AudioFX.muted?'':'none';}
 snd.addEventListener('click',()=>{AudioFX.ensure();AudioFX.muted=!AudioFX.muted;LS.set('n404_mute',AudioFX.muted?'1':'0');renderMute();});
 renderMute();
 let raf=null,last=performance.now();
 function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;game.update(dt);game.draw(ctx);raf=requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=null;}
  else if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}});
 addEventListener('resize',syncViewport);
 if(window.visualViewport)visualViewport.addEventListener('resize',syncViewport);
 addEventListener('orientationchange',()=>setTimeout(syncViewport,120));
 setInterval(syncViewport,400);
 raf=requestAnimationFrame(t=>{last=t;raf=requestAnimationFrame(frame);});
}
const Games={};
Games.dunes=(function(){
 const g={mode:'ready'};
 const DAY={bands:['#F7ECD2','#F4DFAE','#F1D093','#EDC183'],ground:'#DCA75E',top:'#3A2A18',duneFar:'#E6C795',duneNear:'#DEB26A',ink:'#3A2A18',accent:'#C75B26',cloud:'#FCF4E1'};
 const NIGHT={bands:['#161A31','#1D2240','#252B4F','#2E3560'],ground:'#45406A',top:'#EFE6CC',duneFar:'#333960',duneNear:'#3E4568',ink:'#EFE6CC',accent:'#F2A65A',cloud:'#3A4166'};
 const STAR='#FFF6D8';
 const CACTUS_S=["..##..","..##..","..##..","#.##..","#.##.#","#.####","######","..##..","..##..","..##.."];
 const CACTUS_T=["..##..","..##..","..##..","..##..","#.##..","#.##..","#.##.#","#.##.#","######","..##..","..##..","..##..","..##..","..##.."];
 const FOX_BODY=["..........#..#..","..........##.##.","..........#####.","##........######",".##......#######","..#.....########","..###########...","...#########...."];
 const FOX_A=FOX_BODY.concat(["...##...##..##..","...#....##...#..","..##....#...##.."]);
 const FOX_B=FOX_BODY.concat(["....##..##..##..","...##...#...#...","..#.....##..#..."]);
 let t=0,speed=0,dist=0,score=0,night=0,nightOn=false,shake=0;
 let U=1,groundY=0,foxX=0;
 const fox={y:0,vy:0,duck:false,ground:true,phase:0,buffer:0};
 let jumpHeld=false;
 let obs=[],dust=[],pebbles=[],clouds=[],mesas=[],bumps=[],stars=[];
 let nextIn=400,tumbleT=2,swipe=null;
 function layout(){
  U=clamp(Math.min(H/540,W/440),.55,1.4);
  groundY=Math.round(H*(H>W?.74:.70));
  foxX=Math.max(44,Math.round(W*.13));
  stars=[];for(let i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*groundY*.75,r:rand(.5,1.6),tw:rand(0,TAU)});
  pebbles=[];const n=Math.ceil(W/34)+4;
  for(let i=0;i<n;i++)pebbles.push({x:i*34+rand(0,24),y:rand(4,26),w:rand(3,8),h:rand(2,4)});
  clouds=[];for(let i=0;i<4;i++)clouds.push({x:rand(0,W),y:rand(H*.06,H*.32),s:rand(.7,1.25),v:rand(6,16)});
  mesas=[];let x=-60;while(x<W+240){const w=rand(90,240);mesas.push({x,w,h:rand(40,105)});x+=w+rand(70,340);}
  bumps=[];let bx=-100;while(bx<W+300){const r=rand(60,150);bumps.push({x:bx,r});bx+=r*rand(.9,1.6);}
 }
 function reset(){g.mode='ready';fox.y=0;fox.vy=0;fox.duck=false;fox.ground=true;
  obs=[];dust=[];dist=0;score=0;setScore(0);shake=0;
  showHint(COARSE.matches?INFO.dunes.hintC:INFO.dunes.hintK);hideOver();}
 function doJump(){fox.vy=-830*U;fox.ground=false;fox.buffer=0;spawnDust(5);AudioFX.jump();}
 function queueJump(){if(g.mode!=='playing')return;if(fox.ground)doJump();else fox.buffer=.13;}
 function spawnDust(n){for(let i=0;i<n;i++)dust.push({x:foxX-16*U+rand(-4,10),y:groundY-2,vx:rand(-70,-10)*U,vy:rand(-80,-10)*U,r:rand(1.5,3.5)*U,life:rand(.25,.5),t:0});}
 function start(){if(g.mode!=='ready')return;g.mode='playing';obs=[];hideHint();hideOver();doJump();}
 function die(){g.mode='dead';deadAt=performance.now();shake=10;AudioFX.die();hideHint();
  const best=+LS.get(bestKey('dunes'),0),nb=score>best,mx=Math.max(best,score);
  if(nb)LS.set(bestKey('dunes'),score);setBest(mx);
  setTimeout(function(){showOver(INFO.dunes.over,score,mx,nb);},500);}
 function spawnObs(){
  const r=Math.random(),bird=score>260;
  if(bird&&r<.24){const high=Math.random()<.42,by=high?groundY-95*U:groundY-30*U;
   obs.push({type:'bird',x:W+80,y:by,baseY:by,ph:rand(0,TAU)});}
  else if(score>110&&r>=.24&&r<.46){obs.push({type:'tumble',x:W+40,r:rand(9,15)*U,rot:0,v:rand(1.2,1.55)});}
  else{const k=Math.random();
   if(k<.42)obs.push({type:'cac',spr:CACTUS_S,n:1,x:W+40,sc:U*rand(.92,1.12)});
   else if(k<.72)obs.push({type:'cac',spr:CACTUS_T,n:1,x:W+40,sc:U*rand(.9,1.06)});
   else obs.push({type:'cac',spr:CACTUS_S,n:irand(2,3),x:W+40,sc:U*rand(.85,1)});}
 }
 function collide(){
  const duck=fox.duck&&fox.ground;
  const fw=(duck?44:26)*U,fh=(duck?22:38)*U;
  const fb={x:foxX-fw/2,y:groundY+fox.y-fh,w:fw,h:fh};
  for(const o of obs){let b;
   if(o.type==='cac'){const w=o.n*6*3.3*o.sc,h=10*3.3*o.sc;b={x:o.x,y:groundY-h,w,h};}
   else if(o.type==='tumble'){const s=o.r*1.5;b={x:o.x-s/2,y:groundY-o.r-s/2,w:s,h:s};}
   else b={x:o.x-17*U,y:o.y-6*U,w:34*U,h:12*U};
   if(fb.x+3<b.x+b.w&&fb.x+fb.w-3>b.x&&fb.y+3<b.y+b.h&&fb.y+fb.h-3>b.y){die();return;}}
 }
 const rightmost=(l,k)=>l.reduce((m,o)=>Math.max(m,k(o)),0);
 function mixP(A,B,k){const o={bands:A.bands.map((b,i)=>mix(b,B.bands[i],k))};
  ['ground','top','duneFar','duneNear','ink','accent','cloud'].forEach(key=>o[key]=mix(A[key],B[key],k));return o;}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};g.resize=layout;
 g.key=function(k){
  if(k===' '||k==='ArrowUp'||k==='w'||k==='W'){jumpHeld=true;queueJump();}
  else if(k==='ArrowDown'||k==='s'||k==='S'){fox.duck=true;}};
 g.release=function(k){if(k==='ArrowDown'||k==='s'||k==='S')fox.duck=false;else jumpHeld=false;};
 g.pointer=function(e,type){
  if(type==='down'){swipe={y:e.clientY};jumpHeld=true;queueJump();}
  else if(type==='move'){if(swipe&&e.clientY-swipe.y>34)fox.duck=true;}
  else{swipe=null;jumpHeld=false;fox.duck=false;}};
 g.update=function(dt){
  t+=dt;shake=Math.max(0,shake-dt*26);
  speed=g.mode==='playing'?Math.min((330+score*.16)*U,780*U):110*U;
  const nt=(Math.floor(score/600)%2===1)?1:0;
  if(nt!==nightOn){nightOn=nt;document.body.classList.toggle('night',nt===1);}
  night+=clamp(nt-night,-dt*.5,dt*.5);
  if(g.mode==='playing'){
   fox.phase+=dt*speed/24;fox.buffer=Math.max(0,fox.buffer-dt);
   if(!fox.ground){
    let grav=fox.vy<0&&jumpHeld?1650*U:2950*U;if(fox.duck)grav+=2600*U;
    fox.vy+=grav*dt;fox.y+=fox.vy*dt;
    if(fox.y>=0){fox.y=0;fox.vy=0;fox.ground=true;spawnDust(6);AudioFX.land();}
   }else if(fox.buffer>0)doJump();
   dist+=speed*dt;score=Math.floor(dist/12);setScore(score,true);
   nextIn-=speed*dt;
   if(nextIn<=0){spawnObs();nextIn=(speed*.62+260*U)*rand(1,1.75);}
  }else if(g.mode==='ready'){fox.phase+=dt*2;tumbleT-=dt;
   if(tumbleT<=0){obs.push({type:'tumble',x:W+40,r:rand(9,14)*U,rot:0,v:rand(.8,1.2)});tumbleT=rand(3,7);}}
  for(const o of obs){
   if(o.type==='tumble'){o.x-=speed*o.v*dt;o.rot+=o.v*6*dt;}
   else if(o.type==='bird'){o.x-=speed*1.12*dt;o.y=o.baseY+Math.sin(t*3+o.ph)*8*U;}
   else o.x-=speed*dt;}
  obs=obs.filter(o=>o.x>-140);
  for(const m of mesas){m.x-=speed*.22*dt;if(m.x+m.w<-40){m.x=rightmost(mesas,q=>q.x+q.w)+rand(80,360);m.w=rand(90,240);m.h=rand(40,105);}}
  for(const b of bumps){b.x-=speed*.5*dt;if(b.x+b.r<0){b.x=rightmost(bumps,q=>q.x+q.r)+rand(40,140);b.r=rand(60,150);}}
  for(const c of clouds){c.x-=(speed*.3+c.v)*dt;if(c.x<-160){c.x=W+80;c.y=rand(H*.06,H*.32);}}
  for(const p of pebbles){p.x-=speed*dt;if(p.x<-12){p.x=W+rand(0,30);p.y=rand(4,26);}}
  for(const d of dust){d.t+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=160*dt;}
  dust=dust.filter(d=>d.t<d.life);
  if(g.mode==='playing')collide();};
 function drawMat(gc,spr,x,footY,cell,color){gc.fillStyle=color;
  for(let r=0;r<spr.length;r++)for(let c=0;c<spr[r].length;c++)
   if(spr[r][c]==='#')gc.fillRect(Math.round(x+c*cell),Math.round(footY-(spr.length-r)*cell),Math.ceil(cell),Math.ceil(cell));}
 function drawFox(gc,x,footY,cell,frame,ink,accent,eyeBg,dead,blink){
  const spr=frame?FOX_B:FOX_A;
  const ox=Math.round(x-8*cell),oy=Math.round(footY-11*cell);
  const plot=(c,r,col)=>{gc.fillStyle=col;gc.fillRect(ox+c*cell,oy+r*cell,Math.ceil(cell),Math.ceil(cell));};
  gc.fillStyle=ink;
  for(let r=0;r<11;r++)for(let c=0;c<16;c++)if(spr[r]&&spr[r][c]==='#')gc.fillRect(ox+c*cell,oy+r*cell,Math.ceil(cell),Math.ceil(cell));
  plot(11,1,accent);plot(14,1,accent);plot(0,3,accent);
  if(dead)plot(13,3,accent);else if(!blink)plot(13,3,eyeBg);}
 function drawBird(gc,x,y,ink,accent){const flap=Math.sin(t*10);
  gc.save();gc.translate(x,y);gc.scale(U,U);gc.fillStyle=ink;
  gc.beginPath();gc.moveTo(-3,-2);gc.lineTo(-22,-8-11*flap);gc.lineTo(-7,3);gc.closePath();gc.fill();
  gc.beginPath();gc.moveTo(3,-2);gc.lineTo(22,-8-11*flap);gc.lineTo(7,3);gc.closePath();gc.fill();
  gc.beginPath();gc.ellipse(0,0,12,5.5,0,0,TAU);gc.fill();
  gc.beginPath();gc.arc(13,-4,4.5,0,TAU);gc.fill();
  gc.fillStyle=accent;gc.beginPath();gc.moveTo(16,-6);gc.lineTo(23,-3);gc.lineTo(16,-1);gc.closePath();gc.fill();gc.restore();}
 function drawTumble(gc,x,y,r,rot,ink){gc.save();gc.translate(x,y);gc.rotate(rot);
  gc.strokeStyle=ink;gc.globalAlpha=.85;gc.lineWidth=Math.max(1.5,r*.14);
  gc.beginPath();gc.arc(0,0,r,0,TAU);gc.stroke();
  for(let i=0;i<5;i++){const a=i/5*Math.PI;
   gc.beginPath();gc.moveTo(Math.cos(a)*r,Math.sin(a)*r);gc.lineTo(-Math.cos(a)*r,-Math.sin(a)*r);gc.stroke();}
  gc.globalAlpha=1;gc.restore();}
 g.draw=function(gc){
  const P=mixP(DAY,NIGHT,night);
  gc.save();
  const sh=RM?shake*.3:shake;
  if(sh>0)gc.translate(rand(-sh,sh),rand(-sh,sh));
  const fr=[0,.42,.62,.8,1];
  for(let i=0;i<4;i++){gc.fillStyle=P.bands[i];gc.fillRect(-10,groundY*fr[i],W+20,groundY*(fr[i+1]-fr[i])+2);}
  if(night>.02){
   for(const s of stars){gc.globalAlpha=night*(.35+.65*Math.abs(Math.sin(t*1.6+s.tw)));
    gc.fillStyle=STAR;gc.beginPath();gc.arc(s.x,s.y,s.r,0,TAU);gc.fill();}
   gc.globalAlpha=1;gc.globalAlpha=night;
   gc.fillStyle='#EFE6CC';gc.beginPath();gc.arc(W*.22,groundY*.24,26*U,0,TAU);gc.fill();
   gc.fillStyle=P.bands[0];gc.beginPath();gc.arc(W*.22+11*U,groundY*.24-7*U,22*U,0,TAU);gc.fill();
   gc.globalAlpha=1;}
  if(night<.98){gc.globalAlpha=1-night;gc.fillStyle=P.accent;
   gc.beginPath();gc.arc(W*.78,groundY*.3,36*U,0,TAU);gc.fill();gc.globalAlpha=1;}
  gc.fillStyle=P.duneFar;
  for(const m of mesas){gc.beginPath();gc.moveTo(m.x,groundY+2);gc.lineTo(m.x+m.w*.16,groundY-m.h);
   gc.lineTo(m.x+m.w*.84,groundY-m.h);gc.lineTo(m.x+m.w,groundY+2);gc.closePath();gc.fill();}
  gc.fillStyle=P.cloud;
  for(const c of clouds){gc.save();gc.translate(c.x,c.y);gc.scale(c.s*U,c.s*U);
   gc.beginPath();gc.ellipse(0,0,34,11,0,0,TAU);gc.ellipse(-16,-6,16,10,0,0,TAU);gc.ellipse(14,-7,14,9,0,0,TAU);gc.fill();gc.restore();}
  gc.fillStyle=P.duneNear;
  for(const b of bumps){gc.beginPath();gc.arc(b.x,groundY+b.r*.55,b.r,Math.PI,0);gc.fill();}
  gc.fillStyle=P.ground;gc.fillRect(-10,groundY,W+20,H-groundY+10);
  gc.fillStyle=P.top;gc.fillRect(-10,groundY,W+20,3);
  gc.globalAlpha=.5;for(const p of pebbles)gc.fillRect(p.x,groundY+p.y,p.w,p.h);gc.globalAlpha=1;
  for(const o of obs){
   if(o.type==='cac'){const cell=3.3*o.sc;for(let i=0;i<o.n;i++)drawMat(gc,o.spr,o.x+i*6*cell,groundY,cell,P.ink);}
   else if(o.type==='tumble')drawTumble(gc,o.x,groundY-o.r,o.r,o.rot,P.ink);
   else drawBird(gc,o.x,o.y,P.ink,P.accent);}
  const fy=groundY+fox.y,cell=3.4*U;
  const frame=Math.floor(fox.phase)%2,blink=(t%3.4)<.12;
  if(fox.duck&&fox.ground){gc.save();gc.translate(foxX,fy);gc.scale(1.28,.58);gc.translate(-foxX,-fy);
   drawFox(gc,foxX,fy,cell,frame,P.ink,P.accent,P.ground,g.mode==='dead',blink);gc.restore();}
  else drawFox(gc,foxX,fy,cell,frame,P.ink,P.accent,P.ground,g.mode==='dead',blink);
  gc.fillStyle=P.top;
  for(const d of dust){gc.globalAlpha=(1-d.t/d.life)*.6;gc.beginPath();gc.arc(d.x,d.y,d.r,0,TAU);gc.fill();}
  gc.globalAlpha=1;gc.restore();};
 return g;})();
Games.orbit=(function(){
 const g={mode:'ready'};
 const C={bg:'#0A0E1B',star:'#E9EDF6',ship:'#E9EDF6',fin:'#9AA3BC',accent:'#FFB454',flame:'#FFE2A8',cockpit:'#39436B',astA:'#8D899E',astB:'#6F6B80',crater:'#57536B',planet:'#20284A',band:'#2A3458',ring:'#66738F'};
 let t=0,score=0,scroll=0,timeScale=1,shake=0,U=1,shipX=0;
 const ship={y:0,vy:0};
 let asts=[],shards=[],parts=[],texts=[],stars=[],shoots=[];
 let spawnT=1.2,shardT=3,shootT=2;
 const keys={up:false,down:false};
 let pHeld=false,pY=0;
 function layout(){U=clamp(Math.min(H/540,W/470),.62,1.4);shipX=Math.max(56,Math.round(W*.13));
  stars=[];const n=Math.round(W*H/9000);
  for(let i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:rand(.12,.8),r:rand(.5,1.8),tw:rand(0,TAU)});}
 function reset(){g.mode='ready';score=0;setScore(0);asts=[];shards=[];parts=[];texts=[];
  ship.y=H*.5;ship.vy=0;timeScale=1;spawnT=1.4;shardT=3;
  showHint(COARSE.matches?INFO.orbit.hintC:INFO.orbit.hintK);hideOver();}
 function start(){if(g.mode!=='ready')return;g.mode='playing';hideHint();hideOver();AudioFX.tone(180,540,.35,'sawtooth',.3);}
 function addText(x,y,txt,col){texts.push({x,y,txt,col,t:0,life:.9});}
 function burst(x,y,col,n){for(let i=0;i<n;i++)parts.push({x,y,vx:rand(-160,160)*U,vy:rand(-160,160)*U,r:rand(1,2.6)*U,life:rand(.25,.5),t:0,col,circ:true});}
 function die(){g.mode='dead';deadAt=performance.now();shake=13;timeScale=.25;AudioFX.die();
  for(let i=0;i<34;i++)parts.push({x:shipX,y:ship.y,vx:rand(-280,280)*U,vy:rand(-280,280)*U,
   r:rand(1.5,4.2)*U,life:rand(.4,1),t:0,col:[C.ship,C.accent,'#FF7847'][irand(0,2)],tri:Math.random()<.45,rot:rand(0,TAU)});
  const best=+LS.get(bestKey('orbit'),0),nb=score>best,mx=Math.max(best,score);
  if(nb)LS.set(bestKey('orbit'),Math.floor(score));setBest(mx);
  setTimeout(function(){showOver(INFO.orbit.over,score,mx,nb);},750);}
 function spawnAst(){const r=rand(15,42)*U,verts=[],n=irand(8,11);
  for(let i=0;i<n;i++){const a=i/n*TAU,rr=r*rand(.72,1.08);verts.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  const craters=[];
  for(let i=0;i<irand(2,3);i++){const a=rand(0,TAU),d=rand(0,r*.5);craters.push([Math.cos(a)*d,Math.sin(a)*d,rand(2,4.5)*U]);}
  asts.push({x:W+70,y:rand(40,H-40),r,verts,craters,vx:-scroll*rand(.8,1.4),vy:rand(-50,50)*U,
   rot:rand(0,TAU),vr:rand(-1.7,1.7),tint:Math.random()<.5?C.astA:C.astB,minD:1e9,passed:false});}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};g.resize=layout;
 g.key=function(k){if(k==='ArrowUp'||k==='w'||k==='W')keys.up=true;else if(k==='ArrowDown'||k==='s'||k==='S')keys.down=true;};
 g.release=function(){keys.up=false;keys.down=false;};
 g.pointer=function(e,type){
  if(type==='down'){pHeld=true;pY=e.clientY;}
  else if(type==='move'){if(pHeld)pY=e.clientY;}
  else pHeld=false;};
 g.update=function(dt){
  t+=dt;timeScale+=(1-timeScale)*Math.min(1,dt*3);shake=Math.max(0,shake-dt*26);
  const dts=dt*timeScale;
  scroll=g.mode==='playing'?Math.min((300+score*.5)*U,840*U):70*U;
  if(g.mode==='playing'){
   const maxV=470*U;
   let tv=((keys.up?-1:0)+(keys.down?1:0))*maxV;
   if(pHeld)tv=clamp((pY-ship.y)*9,-maxV*1.4,maxV*1.4);
   ship.vy+=(tv-ship.vy)*Math.min(1,dts*9);ship.y+=ship.vy*dts;
   if(ship.y<26){ship.y=26;ship.vy=0;}
   if(ship.y>H-26){ship.y=H-26;ship.vy=0;}
  }else ship.y=H*.5+Math.sin(t*1.3)*9*U;
  if(g.mode!=='dead')parts.push({x:shipX-10*U,y:ship.y+rand(-3,3),vx:-scroll*rand(.4,.7)-rand(30,90)*U,vy:rand(-16,16)*U,r:rand(1,2.4)*U,life:rand(.2,.45),t:0,col:Math.random()<.5?C.accent:C.flame,circ:true});
  for(const s of stars){s.x-=scroll*s.z*dts;if(s.x<-3){s.x=W+3;s.y=Math.random()*H;}}
  shootT-=dt;
  if(shootT<=0){shootT=rand(3,8);shoots.push({x:rand(W*.3,W*1.05),y:rand(0,H*.35),vx:-rand(480,780)*U,vy:rand(140,260)*U,life:.7,t:0});}
  for(const s of shoots){s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;}
  shoots=shoots.filter(s=>s.t<s.life);
  if(g.mode==='playing'){
   spawnT-=dts;
   if(spawnT<=0){spawnT=rand(.5,.95)*clamp(1.15-score/1600,.45,1.15);spawnAst();}
   for(const a of asts){a.x+=a.vx*dts;a.y+=a.vy*dts;a.rot+=a.vr*dts;
    if(a.y<a.r||a.y>H-a.r)a.vy*=-1;
    const d=Math.hypot(a.x-shipX,a.y-ship.y);
    a.minD=Math.min(a.minD,d);
    if(d<a.r*.78+12*U&&g.mode==='playing'){die();break;}}
   asts=asts.filter(a=>a.x>-90);
   shardT-=dts;
   if(shardT<=0){shardT=rand(4,7);shards.push({x:W+40,baseY:rand(H*.15,H*.85),r:9*U,ph:rand(0,TAU)});}
   for(const s of shards){s.x-=scroll*1.05*dts;s.y=s.baseY+Math.sin(t*2.4+s.ph)*22*U;}
   shards=shards.filter(s=>{
    if(Math.hypot(s.x-shipX,s.y-ship.y)<s.r+20*U){
     score+=40;setScore(score,true);AudioFX.pickup();
     addText(s.x,s.y,'+40',C.accent);burst(s.x,s.y,C.accent,8);return false;}
    return s.x>-40;});
   if(g.mode==='playing'){score+=scroll*dts*.055;setScore(score,true);
    for(const a of asts){if(!a.passed&&a.x<shipX-14*U-a.r){a.passed=true;
     if(a.minD<a.r*.78+12*U+34*U){score+=8;AudioFX.near();addText(shipX+26*U,ship.y-20*U,'+8 CLOSE',C.star);}}}}}
  for(const p of parts){p.t+=dts;p.x+=p.vx*dts;p.y+=p.vy*dts;if(p.tri)p.rot+=6*dts;}
  parts=parts.filter(p=>p.t<p.life);
  for(const x of texts){x.t+=dt;x.y-=30*U*dt;}
  texts=texts.filter(x=>x.t<x.life);};
 function drawPlanet(gc){const px=W*.84,py=H*.2,r=64*Math.min(U,1.2);
  gc.fillStyle=C.planet;gc.beginPath();gc.arc(px,py,r,0,TAU);gc.fill();
  gc.save();gc.beginPath();gc.arc(px,py,r,0,TAU);gc.clip();
  gc.fillStyle=C.band;
  gc.fillRect(px-r,py-r*.55,r*2,r*.28);gc.fillRect(px-r,py+r*.05,r*2,r*.2);gc.fillRect(px-r,py+r*.5,r*2,r*.16);
  gc.restore();
  gc.strokeStyle=C.ring;gc.globalAlpha=.45;gc.lineWidth=5;
  gc.beginPath();gc.ellipse(px,py,r*1.7,r*.48,-.4,0,TAU);gc.stroke();gc.globalAlpha=1;}
 function drawShip(gc,x,y,tilt,thrust){gc.save();gc.translate(x,y);gc.rotate(tilt);gc.scale(U,U);
  const fl=10+thrust*16+Math.sin(t*42)*3;
  gc.fillStyle=C.accent;gc.beginPath();gc.moveTo(-8,-3.5);gc.lineTo(-9-fl,0);gc.lineTo(-8,3.5);gc.closePath();gc.fill();
  gc.fillStyle=C.flame;gc.beginPath();gc.moveTo(-8,-1.8);gc.lineTo(-9-fl*.55,0);gc.lineTo(-8,1.8);gc.closePath();gc.fill();
  gc.fillStyle=C.fin;
  gc.beginPath();gc.moveTo(-1,-6);gc.lineTo(-10,-13);gc.lineTo(-7,-3);gc.closePath();gc.fill();
  gc.beginPath();gc.moveTo(-1,6);gc.lineTo(-10,13);gc.lineTo(-7,3);gc.closePath();gc.fill();
  gc.fillStyle=C.ship;
  gc.beginPath();gc.moveTo(19,0);gc.lineTo(-3,-8);gc.lineTo(-9,-4);gc.lineTo(-9,4);gc.lineTo(-3,8);gc.closePath();gc.fill();
  gc.fillStyle=C.accent;gc.beginPath();gc.moveTo(19,0);gc.lineTo(9,-3.6);gc.lineTo(9,3.6);gc.closePath();gc.fill();
  gc.fillStyle=C.cockpit;gc.beginPath();gc.arc(2,0,2.8,0,TAU);gc.fill();gc.restore();}
 function drawShard(gc,s){gc.save();gc.translate(s.x,s.y);gc.rotate(t*2);
  const r=s.r*(1+.12*Math.sin(t*6+s.ph));
  gc.fillStyle=C.accent;gc.beginPath();
  gc.moveTo(0,-r);gc.lineTo(r*.28,-r*.28);gc.lineTo(r,0);gc.lineTo(r*.28,r*.28);
  gc.lineTo(0,r);gc.lineTo(-r*.28,r*.28);gc.lineTo(-r,0);gc.lineTo(-r*.28,-r*.28);
  gc.closePath();gc.fill();gc.restore();}
 g.draw=function(gc){gc.save();
  const sh=RM?shake*.3:shake;
  if(sh>0)gc.translate(rand(-sh,sh),rand(-sh,sh));
  gc.fillStyle=C.bg;gc.fillRect(-12,-12,W+24,H+24);
  drawPlanet(gc);
  for(const s of stars){gc.globalAlpha=(.25+.75*s.z)*(.65+.35*Math.sin(t*2+s.tw));
   gc.fillStyle=C.star;gc.beginPath();gc.arc(s.x,s.y,s.r,0,TAU);gc.fill();}
  gc.globalAlpha=1;
  for(const s of shoots){gc.globalAlpha=(1-s.t/s.life)*.8;gc.strokeStyle=C.star;gc.lineWidth=1.5;
   gc.beginPath();gc.moveTo(s.x,s.y);gc.lineTo(s.x-s.vx*.09,s.y-s.vy*.09);gc.stroke();}
  gc.globalAlpha=1;
  for(const s of shards)drawShard(gc,s);
  for(const a of asts){gc.save();gc.translate(a.x,a.y);gc.rotate(a.rot);
   gc.fillStyle=a.tint;gc.beginPath();
   a.verts.forEach((v,i)=>i?gc.lineTo(v[0],v[1]):gc.moveTo(v[0],v[1]));
   gc.closePath();gc.fill();
   gc.fillStyle=C.crater;
   for(const c of a.craters){gc.beginPath();gc.arc(c[0],c[1],c[2],0,TAU);gc.fill();}
   gc.restore();}
  for(const p of parts){gc.globalAlpha=1-p.t/p.life;gc.fillStyle=p.col;
   if(p.tri){gc.save();gc.translate(p.x,p.y);gc.rotate(p.rot);
    gc.beginPath();gc.moveTo(p.r*1.4,0);gc.lineTo(-p.r,p.r);gc.lineTo(-p.r,-p.r);gc.closePath();gc.fill();gc.restore();}
   else{gc.beginPath();gc.arc(p.x,p.y,p.r,0,TAU);gc.fill();}}
  gc.globalAlpha=1;
  if(g.mode!=='dead')drawShip(gc,shipX,ship.y,clamp(ship.vy/(500*U),-1,1)*.32,
   g.mode==='playing'?clamp(Math.abs(ship.vy)/(470*U),.25,1):.4);
  gc.font='600 '+Math.round(11+3*U)+'px '+MONO;gc.textAlign='left';
  for(const x of texts){gc.globalAlpha=1-x.t/x.life;gc.fillStyle=x.col;gc.fillText(x.txt,x.x,x.y);}
  gc.globalAlpha=1;gc.restore();};
 return g;})();
Games.terminal=(function(){
 const g={mode:'ready'};
 const C={bg:'#050805',frame:'#2E7B45',dim:'#1E5B33',snake:'#49E36F',head:'#A9F5C4',food:'#49E36F',gold:'#F2D258'};
 let t=0,cols=26,rows=11,cell=20,ox=0,oy=0;
 let snake=[],dir={x:1,y:0},queue=[],food=null,golden=false,goldT=0,eaten=0,score=0,stepMs=140,acc=0,deadT=0;
 let flecks=[],sw=null;
 function layout(){
  let top=titleBottom()+10;
  if(dpadOn){const r=document.getElementById('nDpad').getBoundingClientRect();top=Math.max(top,r.bottom+10);}
  top=clamp(top,90,H*.62);
  const reserve=2.4*remPx;
  const availH=Math.max(110,H-top-reserve),availW=Math.max(150,W-20);
  const portrait=H>W*1.05;
  let nc=portrait?15:40,nr=portrait?17:24;
  cell=clamp(Math.floor(Math.min(availW/nc,availH/nr)),7,46);
  nc=clamp(Math.floor(availW/cell),9,nc);
  nr=clamp(Math.floor(availH/cell),7,nr);
  cols=nc;rows=nr;
  ox=Math.round((W-cols*cell)/2);
  oy=Math.round(top+(availH-rows*cell)/2);}
 function reset(){const cx=Math.floor(cols/2),cy=Math.floor(rows/2);
  snake=[];for(let i=0;i<4;i++)snake.push({x:cx-i,y:cy});
  dir={x:1,y:0};queue=[];eaten=0;score=0;stepMs=140;golden=false;acc=0;
  setScore(0);placeFood();}
 function resetDemo(){snake=[];const len=Math.min(8,cols-2);
  for(let i=0;i<len;i++)snake.push({x:Math.max(len-1-i,0),y:0});
  dir={x:1,y:0};queue=[];food=null;golden=false;score=0;setScore(0);}
 function start(){if(g.mode!=='ready')return;reset();g.mode='playing';hideHint();hideOver();AudioFX.tone(440,660,.12,'square',.4);}
 function placeFood(){let p;do{p={x:irand(0,cols-1),y:irand(0,rows-1)};}while(snake.some(s=>s.x===p.x&&s.y===p.y));food=p;}
 function demoStep(){
  if(dir.x===1&&snake[0].x>=cols-2)dir={x:0,y:1};
  else if(dir.y===1&&snake[0].y>=rows-2)dir={x:-1,y:0};
  else if(dir.x===-1&&snake[0].x<=1)dir={x:0,y:-1};
  else if(dir.y===-1&&snake[0].y<=1)dir={x:1,y:0};
  snake.unshift({x:snake[0].x+dir.x,y:snake[0].y+dir.y});
  if(snake.length>Math.min(8,cols-2))snake.pop();}
 function step(){
  if(queue.length)dir=queue.shift();
  const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
  if(h.x<0||h.x>=cols||h.y<0||h.y>=rows||snake.some(s=>s.x===h.x&&s.y===h.y)){die();return;}
  snake.unshift(h);
  if(food&&h.x===food.x&&h.y===food.y){
   eaten++;score+=golden?30:10;setScore(score,true);
   golden?AudioFX.golden():AudioFX.eat();
   burstFleck(food.x,food.y,golden?C.gold:C.food);
   stepMs=Math.max(84,140-eaten*3);
   golden=(eaten%5===0);if(golden)goldT=7;
   placeFood();
  }else snake.pop();}
 function die(){g.mode='dead';deadAt=performance.now();deadT=0;AudioFX.die();
  const best=+LS.get(bestKey('terminal'),0),nb=score>best,mx=Math.max(best,score);
  if(nb)LS.set(bestKey('terminal'),score);setBest(mx);
  setTimeout(function(){showOver(INFO.terminal.over,score,mx,nb);},550);}
 function burstFleck(cx,cy,col){for(let i=0;i<9;i++)flecks.push({x:ox+(cx+.5)*cell,y:oy+(cy+.5)*cell,vx:rand(-90,90),vy:rand(-90,90),life:rand(.25,.5),t:0,col});}
 function pushDir(v){const last=queue.length?queue[queue.length-1]:dir;
  if(v.x===-last.x&&v.y===-last.y)return;
  if(v.x===last.x&&v.y===last.y)return;
  if(queue.length<3)queue.push(v);}
 g.enter=function(){layout();resetDemo();g.mode='ready';showHint(COARSE.matches?INFO.terminal.hintC:INFO.terminal.hintK);hideOver();};
 g.start=start;g.restart=function(){reset();g.mode='playing';hideHint();hideOver();AudioFX.eat();};
 g.key=function(k){const map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]};
  const v=map[k];if(!v)return;pushDir({x:v[0],y:v[1]});};
 g.pointer=function(e,type){
  if(type==='down')sw={x:e.clientX,y:e.clientY};
  else if(type==='up'&&sw){const dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;
   const th=Math.min(28,Math.max(20,W*.04));
   if(Math.hypot(dx,dy)>th)g.key(Math.abs(dx)>Math.abs(dy)?(dx>0?'ArrowRight':'ArrowLeft'):(dy>0?'ArrowDown':'ArrowUp'));}};
 g.resize=function(){const oc=cols,orr=rows;layout();
  if(g.mode==='playing'&&(oc!==cols||orr!==rows)){resetDemo();g.mode='ready';showHint(COARSE.matches?INFO.terminal.hintC:INFO.terminal.hintK);}
  else if(g.mode==='ready')resetDemo();};
 g.update=function(dt){t+=dt;
  if(g.mode==='dead')deadT+=dt;
  else{const ms=g.mode==='ready'?115:stepMs;
   acc+=dt*1000;let guard=0;
   while(acc>=ms&&guard++<8){acc-=ms;g.mode==='ready'?demoStep():step();if(g.mode==='dead')break;}
   if(golden&&g.mode==='playing'){goldT-=dt;if(goldT<=0)golden=false;}}
  for(const f of flecks){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;}
  flecks=flecks.filter(f=>f.t<f.life);};
 g.draw=function(gc){gc.fillStyle=C.bg;gc.fillRect(0,0,W,H);
  const fx=ox-14,fy=oy-16,fw=cols*cell+28,fh=rows*cell+32;
  gc.strokeStyle=C.frame;gc.lineWidth=1.5;gc.strokeRect(fx+.5,fy+.5,fw,fh);
  gc.strokeStyle=C.gold;gc.lineWidth=3;const tk=9;
  [[fx,fy,1,1],[fx+fw,fy,-1,1],[fx,fy+fh,1,-1],[fx+fw,fy+fh,-1,-1]].forEach(function(c){
   gc.beginPath();gc.moveTo(c[0]+c[2]*tk,c[1]);gc.lineTo(c[0],c[1]);gc.lineTo(c[0],c[1]+c[3]*tk);gc.stroke();});
  if(cell>=10){gc.font='16px '+MONO;gc.fillStyle=C.frame;gc.textBaseline='alphabetic';
   gc.textAlign='left';gc.fillText('MEM[0x404] :: SNAKE.SYS',fx,fy-6);
   gc.textAlign='right';gc.fillText(g.mode==='dead'?'// SEGFAULT':(golden?'!! GOLDEN !!':''),fx+fw,fy-6);}
  gc.fillStyle=C.dim;gc.globalAlpha=.55;
  for(let i=1;i<cols;i++)for(let j=1;j<rows;j++)gc.fillRect(ox+i*cell-1,oy+j*cell-1,1.6,1.6);
  gc.globalAlpha=1;
  if(food&&g.mode!=='ready'){
   const blink=golden&&goldT<2&&(t*8%1>.45);
   if(!blink){const r=cell*.3*(1+.15*Math.sin(t*7));
    gc.fillStyle=golden?C.gold:C.food;
    gc.save();gc.translate(ox+(food.x+.5)*cell,oy+(food.y+.5)*cell);gc.rotate(Math.PI/4);
    const s=r*.8;gc.fillRect(-s,-s,s*2,s*2);gc.restore();}}
  const vis=g.mode!=='dead'||Math.floor(deadT*6)%2===0;
  if(vis){
   for(let i=snake.length-1;i>=0;i--){const s=snake[i];
    gc.globalAlpha=.45+.55*(1-i/snake.length);
    gc.fillStyle=i===0?C.head:C.snake;
    if(i===0&&cell>=9){gc.shadowColor=C.snake;gc.shadowBlur=10;}
    gc.fillRect(ox+s.x*cell+1.5,oy+s.y*cell+1.5,cell-3,cell-3);gc.shadowBlur=0;}
   gc.globalAlpha=1;
   const h=snake[0];
   const ex=ox+(h.x+.5)*cell,ey=oy+(h.y+.5)*cell;
   const fxp=dir.x*cell*.14,fyp=dir.y*cell*.14;
   const oxp=dir.y!==0?cell*.16:0,oyp=dir.x!==0?cell*.16:0;
   gc.fillStyle=C.bg;
   gc.fillRect(ex+fxp-oxp-1.5,ey+fyp-oyp-1.5,3,3);
   gc.fillRect(ex+fxp+oxp-1.5,ey+fyp+oyp-1.5,3,3);}
  for(const f of flecks){gc.globalAlpha=1-f.t/f.life;gc.fillStyle=f.col;gc.beginPath();gc.arc(f.x,f.y,2,0,TAU);gc.fill();}
  gc.globalAlpha=1;
  if(g.mode==='ready'&&cell>=10){gc.fillStyle=C.dim;gc.font='16px '+MONO;gc.textAlign='center';
   gc.fillText('> awaiting input _',ox+cols*cell/2,oy+rows*cell/2+5);}};
 return g;})();
Games.sonar=(function(){
 const g={mode:'ready'};
 const C={bg:'#04101A',ring:'rgba(92,242,214,.16)',grid:'rgba(92,242,214,.08)',blip:'#5CF2D6',bad:'#FF5F56',txt:'#8FE8DC'};
 let t=0,score=0,U=1,cx=0,cy=0,R=0,sweep=0,contacts=[],rips=[],lives=3,spawnT=1,hurt=0;
 function layout(){U=clamp(Math.min(H/540,W/470),.55,1.4);cx=W/2;cy=H*.6;R=Math.min(W*.44,H*.34);}
 function spawn(gh){const a=rand(0,TAU),r=R*rand(.15,.95);
  contacts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,a:a,pinged:false,life:1,dead:false,ghost:!!gh});}
 function reset(){g.mode='ready';contacts=[];rips=[];lives=3;score=0;setScore(0);sweep=0;spawnT=.8;hurt=0;
  showHint(COARSE.matches?INFO.sonar.hintC:INFO.sonar.hintK);hideOver();}
 function start(){if(g.mode!=='ready')return;g.mode='playing';contacts=[];hideHint();hideOver();AudioFX.tone(240,520,.35,'sine',.35);}
 function die(){g.mode='dead';deadAt=performance.now();AudioFX.die();hideHint();
  const best=+LS.get(bestKey('sonar'),0),nb=score>best,mx=Math.max(best,score);
  if(nb)LS.set(bestKey('sonar'),score);setBest(mx);
  setTimeout(function(){showOver(INFO.sonar.over,score,mx,nb);},500);}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};
 g.resize=function(){layout();contacts=[];rips=[];};g.key=function(){};g.release=function(){};
 g.pointer=function(e,type){
  if(type!=='down'||g.mode!=='playing')return;
  const x=e.clientX,y=e.clientY;let got=false;
  for(const c of contacts){
   if(!c.dead&&Math.hypot(c.x-x,c.y-y)<Math.max(26,30*U)){
    got=true;c.dead=true;score+=Math.round(15+40*c.life);setScore(score,true);AudioFX.pickup();
    rips.push({x:c.x,y:c.y,t:0,col:C.blip});break;}}
  if(!got)rips.push({x:x,y:y,t:0,col:C.bad});};
 g.update=function(dt){t+=dt;sweep=(sweep+dt*(1.15+Math.min(score/800,.9)))%TAU;hurt=Math.max(0,hurt-dt*2);
  if(g.mode==='playing'){
   spawnT-=dt;
   if(spawnT<=0){spawn();spawnT=rand(.65,1.3)*clamp(1.2-score/900,.5,1.2);}
   for(const c of contacts){if(c.dead)continue;
    const da=Math.abs((((sweep-c.a)%TAU)+TAU)%TAU);
    if(da<.07||da>TAU-.07){
     if(!c.pinged){c.pinged=true;if(!c.ghost)AudioFX.near();}
     else if(!c.ghost){c.life-=dt/Math.max(1.5,3.4-score/200);
      if(c.life<=0){c.dead=true;lives--;hurt=1;AudioFX.tone(180,55,.3,'sawtooth',.5);
       if(lives<=0){die();return;}}}}}
   contacts=contacts.filter(c=>!c.dead);
  }else if(g.mode==='ready'&&Math.random()<dt*.8)spawn(true);
  rips.forEach(r=>r.t+=dt);rips=rips.filter(r=>r.t<.5);};
 g.draw=function(gc){gc.fillStyle=C.bg;gc.fillRect(0,0,W,H);
  if(hurt>0){gc.fillStyle='rgba(255,95,86,'+(hurt*.25)+')';gc.fillRect(0,0,W,H);}
  gc.save();gc.translate(cx,cy);
  gc.strokeStyle=C.ring;gc.lineWidth=1.5;
  for(let i=1;i<=4;i++){gc.beginPath();gc.arc(0,0,R*i/4,0,TAU);gc.stroke();}
  gc.strokeStyle=C.grid;
  gc.beginPath();gc.moveTo(-R,0);gc.lineTo(R,0);gc.moveTo(0,-R);gc.lineTo(0,R);gc.stroke();
  for(let i=0;i<26;i++){const a=sweep-i*.02;
   gc.strokeStyle='rgba(92,242,214,'+(.3*(1-i/26))+')';gc.lineWidth=i?2:3;
   gc.beginPath();gc.moveTo(0,0);gc.lineTo(Math.cos(a)*R,Math.sin(a)*R);gc.stroke();}
  for(const c of contacts){const al=c.pinged?clamp(c.life,.15,1):.22;
   gc.globalAlpha=al;gc.fillStyle=c.pinged?C.blip:'#2E8C80';
   gc.beginPath();gc.arc(c.x-cx,c.y-cy,4.5*U,0,TAU);gc.fill();
   if(c.pinged){gc.strokeStyle=C.blip;gc.globalAlpha=al*.5;
    gc.beginPath();gc.arc(c.x-cx,c.y-cy,(4.5+(1-c.life)*14)*U,0,TAU);gc.stroke();}
   gc.globalAlpha=1;}
  gc.restore();
  gc.fillStyle=C.txt;gc.font='600 '+Math.round(10+2*U)+'px '+MONO;gc.textAlign='left';
  gc.fillText('HULL',16,H-16);
  for(let i=0;i<3;i++){gc.beginPath();gc.arc(62+i*20,H-20,6,0,TAU);
   if(i<lives){gc.fillStyle=C.blip;gc.fill();}else{gc.strokeStyle=C.bad;gc.stroke();}}
  for(const r of rips){gc.strokeStyle=r.col;gc.globalAlpha=1-r.t/.5;
   gc.beginPath();gc.arc(r.x,r.y,6+r.t*70,0,TAU);gc.stroke();gc.globalAlpha=1;}
  if(g.mode==='dead'){gc.fillStyle='rgba(4,16,26,.6)';gc.fillRect(0,0,W,H);}};
 return g;})();
Games.vapor=(function(){
 const g={mode:'ready'};
 const C={skyT:'#12062B',skyM:'#2B0F4D',sunA:'#FFB86B',sunB:'#FF71CE',mtn:'#0B051F',obs:'#9FE8FF',rec:'#FF8AD8',car:'#01CDCD',glow:'#A0FFF2'};
 let t=0,U=1,hor=0,lane=2,laneX=0,dist=0,bonus=0,items=[],spawnT=1,shake=0;
 function layout(){U=clamp(Math.min(H/540,W/470),.55,1.4);hor=H*.5;}
 function laneC(l){return W/2+(l-2)*W*.085;}
 function py(z){return hor+(H*.84-hor)*(1-z);}
 function reset(){g.mode='ready';items=[];dist=0;bonus=0;setScore(0);lane=2;laneX=laneC(2);spawnT=1;
  showHint(COARSE.matches?INFO.vapor.hintC:INFO.vapor.hintK);hideOver();}
 function start(){if(g.mode!=='ready')return;g.mode='playing';hideHint();hideOver();AudioFX.tone(160,420,.4,'sawtooth',.25);}
 function die(){g.mode='dead';deadAt=performance.now();shake=10;AudioFX.die();hideHint();
  const sc=Math.floor(dist/40)+bonus;
  const best=+LS.get(bestKey('vapor'),0),nb=sc>best,mx=Math.max(best,sc);
  if(nb)LS.set(bestKey('vapor'),sc);setBest(mx);
  setTimeout(function(){showOver(INFO.vapor.over,sc,mx,nb);},500);}
 function mv(d){if(g.mode!=='playing')return;const n=clamp(lane+d,0,4);
  if(n!==lane){lane=n;AudioFX.tone(520,380,.05,'square',.15);}}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};g.resize=layout;
 g.key=function(k){if(k==='ArrowLeft'||k==='a'||k==='A')mv(-1);else if(k==='ArrowRight'||k==='d'||k==='D')mv(1);};
 g.release=function(){};
 g.pointer=function(e,type){if(type!=='down'||g.mode!=='playing')return;
  const x=e.clientX;if(x<W*.36)mv(-1);else if(x>W*.64)mv(1);};
 g.update=function(dt){t+=dt;shake=Math.max(0,shake-dt*26);
  const sp=(g.mode==='playing'?Math.min(360+dist*.02,860):120)*U;
  laneX+=(laneC(lane)-laneX)*Math.min(1,dt*9);
  if(g.mode==='playing'){
   dist+=sp*dt;setScore(Math.floor(dist/40)+bonus,true);
   spawnT-=dt;
   if(spawnT<=0){spawnT=rand(.55,.95)*clamp(1.2-dist/9000,.5,1.2);
    items.push({lane:irand(0,4),z:1,typ:Math.random()<.32?'rec':'obs'});}
   for(const it of items){it.z-=sp*dt/(H*.85);
    if(it.z<.09&&it.z>-.02&&it.lane===lane){
     if(it.typ==='obs'){die();break;}
     it.z=-1;bonus+=50;AudioFX.pickup();}}
   items=items.filter(it=>it.z>-.05);}};
 g.draw=function(gc){gc.save();
  if(shake>0)gc.translate(rand(-shake,shake),rand(-shake,shake));
  const sk=gc.createLinearGradient(0,0,0,hor);
  sk.addColorStop(0,C.skyT);sk.addColorStop(1,C.skyM);
  gc.fillStyle=sk;gc.fillRect(0,0,W,hor+1);
  const sx=W*.5,sy=hor-H*.09,sr=Math.min(W,H)*.16;
  const sg=gc.createLinearGradient(0,sy-sr,0,sy+sr);
  sg.addColorStop(0,C.sunA);sg.addColorStop(1,C.sunB);
  gc.fillStyle=sg;gc.beginPath();gc.arc(sx,sy,sr,0,TAU);gc.fill();
  gc.fillStyle=C.skyM;
  for(let i=0;i<6;i++)gc.fillRect(sx-sr,sy+sr*.05+i*sr*.14,sr*2,2+i*1.2);
  gc.fillStyle=C.mtn;
  gc.beginPath();gc.moveTo(0,hor);gc.lineTo(W*.08,hor-H*.09);gc.lineTo(W*.16,hor);
  gc.lineTo(W*.3,hor-H*.13);gc.lineTo(W*.44,hor);gc.lineTo(W*.6,hor-H*.1);
  gc.lineTo(W*.74,hor);gc.lineTo(W*.86,hor-H*.12);gc.lineTo(W,hor);gc.closePath();gc.fill();
  gc.fillStyle='#07021A';gc.fillRect(0,hor,W,H-hor);
  for(let j=0;j<14;j++){const zz=((j/14)+dist*.00004)%1,y=hor+(H-hor)*Math.pow(zz,2.6);
   gc.strokeStyle='rgba(1,205,205,.5)';gc.globalAlpha=.12+.5*zz;gc.lineWidth=1+zz*1.6;
   gc.beginPath();gc.moveTo(0,y);gc.lineTo(W,y);gc.stroke();}
  gc.globalAlpha=1;gc.strokeStyle='rgba(1,205,205,.18)';gc.lineWidth=1;
  for(let i=-9;i<=9;i++){gc.beginPath();gc.moveTo(W/2+i*W*.012,hor);gc.lineTo(W/2+i*W*.14,H);gc.stroke();}
  for(const it of items){const y=py(Math.max(it.z,0)),x=laneC(it.lane),s=(1-it.z)*26*U+2;
   if(it.typ==='obs'){gc.strokeStyle=C.obs;gc.lineWidth=2;
    gc.beginPath();gc.moveTo(x,y-s);gc.lineTo(x+s*.7,y);gc.lineTo(x-s*.7,y);gc.closePath();gc.stroke();}
   else{gc.fillStyle=C.rec;gc.beginPath();gc.arc(x,y,s*.42,0,TAU);gc.fill();
    gc.fillStyle='#16062B';gc.beginPath();gc.arc(x,y,s*.13,0,TAU);gc.fill();}}
  const cy2=H*.84,cx2=laneX;
  gc.globalAlpha=.35;gc.fillStyle=C.glow;
  gc.beginPath();gc.ellipse(cx2,cy2+8*U,34*U,7*U,0,0,TAU);gc.fill();gc.globalAlpha=1;
  gc.fillStyle=C.car;
  gc.beginPath();gc.moveTo(cx2-22*U,cy2);gc.lineTo(cx2-10*U,cy2-9*U);
  gc.lineTo(cx2+10*U,cy2-9*U);gc.lineTo(cx2+22*U,cy2);gc.closePath();gc.fill();
  gc.fillStyle='#FF71CE';gc.fillRect(cx2-20*U,cy2-3*U,5*U,2.5*U);gc.fillRect(cx2+15*U,cy2-3*U,5*U,2.5*U);
  if(g.mode==='dead'){gc.fillStyle='rgba(18,6,43,.55)';gc.fillRect(0,0,W,H);}
  gc.restore();};
 return g;})();
Games.matrix=(function(){
 const g={mode:'ready'};
 const CH='アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF$#%&@'.split('');
 const C={bg:'#000306',dim:'#0B3B1E',mid:'#1E8C4C',head:'#7DFFB0',bad:'#FF4D4D'};
 let t=0,score=0,U=1,cols=16,cw=40,px=8,items=[],lives=3,spawnT=.9,heads=[],flash=0;
 function layout(){cw=clamp(W/18,22,46);cols=Math.max(9,Math.floor(W/cw));cw=W/cols;
  px=clamp(px,0,cols-1);
  heads=[];for(let i=0;i<cols;i++)heads.push({y:rand(0,H),v:rand(60,160),len:irand(6,14)});}
 function catchY(){return H-64*U;}
 function reset(){g.mode='ready';items=[];lives=3;score=0;setScore(0);px=Math.floor(cols/2);spawnT=.9;flash=0;
  showHint(COARSE.matches?INFO.matrix.hintC:INFO.matrix.hintK);hideOver();}
 function start(){if(g.mode!=='ready')return;g.mode='playing';items=[];hideHint();hideOver();AudioFX.tone(200,700,.25,'square',.3);}
 function die(){g.mode='dead';deadAt=performance.now();AudioFX.die();hideHint();
  const best=+LS.get(bestKey('matrix'),0),nb=score>best,mx=Math.max(best,score);
  if(nb)LS.set(bestKey('matrix'),score);setBest(mx);
  setTimeout(function(){showOver(INFO.matrix.over,score,mx,nb);},500);}
 function mv(d){if(g.mode!=='playing')return;const n=clamp(px+d,0,cols-1);
  if(n!==px){px=n;AudioFX.tone(700,900,.03,'square',.1);}}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};g.resize=layout;
 g.key=function(k){if(k==='ArrowLeft'||k==='a'||k==='A')mv(-1);else if(k==='ArrowRight'||k==='d'||k==='D')mv(1);};
 g.release=function(){};
 g.pointer=function(e,type){if(type!=='down'||g.mode!=='playing')return;
  if(e.clientX<W/2)mv(-1);else mv(1);};
 g.update=function(dt){t+=dt;flash=Math.max(0,flash-dt*2);
  for(const h of heads)h.y=(h.y+h.v*dt)%(H+h.len*cw);
  if(g.mode==='playing'){
   spawnT-=dt;
   if(spawnT<=0){spawnT=rand(.45,.85)*clamp(1.25-score/700,.5,1.25);
    items.push({col:irand(0,cols-1),y:-cw,v:(130+score*1.1)*U*(0.8+Math.random()*.5),
     typ:Math.random()<.16?'r':'g',ch:CH[irand(0,CH.length-1)]});}
   for(const it of items){it.y+=it.v*dt;
    if(it.y>catchY()&&!it.done){it.done=true;
     if(it.col===px){
      if(it.typ==='g'){score+=10;setScore(score,true);AudioFX.eat();}
      else{lives--;flash=1;AudioFX.tone(160,50,.35,'sawtooth',.5);
       if(lives<=0){die();return;}}}}}
   items=items.filter(it=>!it.done&&it.y<H+40);}};
 g.draw=function(gc){gc.fillStyle=C.bg;gc.fillRect(0,0,W,H);
  if(flash>0){gc.fillStyle='rgba(255,77,77,'+(flash*.2)+')';gc.fillRect(0,0,W,H);}
  const fs=Math.floor(cw*.62);
  gc.font=fs+'px '+MONO;gc.textAlign='center';
  for(let i=0;i<cols;i++){const h=heads[i];
   for(let j=0;j<h.len;j++){const y=h.y-j*cw;if(y<-cw||y>H+cw)continue;
    gc.fillStyle=j===0?C.head:(j<3?C.mid:C.dim);
    gc.globalAlpha=j===0?1:Math.max(.06,.5-(j/h.len)*.5);
    gc.fillText(CH[(i*31+j*17+Math.floor(t*9))%CH.length],i*cw+cw/2,y);}}
  gc.globalAlpha=1;
  gc.strokeStyle='rgba(125,255,176,.25)';gc.setLineDash([6,8]);
  gc.beginPath();gc.moveTo(0,catchY());gc.lineTo(W,catchY());gc.stroke();gc.setLineDash([]);
  for(const it of items){const x=it.col*cw+cw/2;
   gc.font=fs+'px '+MONO;
   if(it.typ==='g'){gc.fillStyle=C.head;gc.shadowColor=C.head;gc.shadowBlur=8;gc.fillText(it.ch,x,it.y);gc.shadowBlur=0;}
   else{gc.fillStyle=C.bad;gc.shadowColor=C.bad;gc.shadowBlur=10;gc.fillText(it.ch,x,it.y);gc.shadowBlur=0;
    gc.strokeStyle=C.bad;gc.beginPath();gc.arc(x,it.y-4,cw*.42,0,TAU);gc.stroke();}}
  const rx=px*cw+cw/2,ry=catchY()+22*U;
  gc.fillStyle='#fff';gc.shadowColor='#fff';gc.shadowBlur=12;
  gc.fillRect(rx-9*U,ry-8*U,18*U,14*U);
  gc.fillRect(rx-8*U,ry-19*U,5*U,12*U);gc.fillRect(rx+3*U,ry-19*U,5*U,12*U);
  gc.shadowBlur=0;gc.fillStyle='#000';
  gc.fillRect(rx-5*U,ry-4*U,3*U,3*U);gc.fillRect(rx+2*U,ry-4*U,3*U,3*U);
  for(let i=0;i<3;i++){gc.beginPath();gc.arc(20+i*22,H-20,5,0,TAU);
   if(i<lives){gc.fillStyle=C.head;gc.fill();}else{gc.strokeStyle=C.bad;gc.stroke();}}
  if(g.mode==='dead'){gc.fillStyle='rgba(0,3,6,.6)';gc.fillRect(0,0,W,H);}};
 return g;})();
Games.cab=(function(){
 const g={mode:'ready'};
 const RC=['#FF5F56','#FFBD2E','#27C93F','#01CDCD','#FF71CE','#FFB454'];
 const C={bg:'#0B0B12',frame:'#2A2A3A',txt:'#FFE8C9',ball:'#FFFFFF'};
 let t=0,U=1,score=0,lives=3,level=1,bricks=[],ball={x:0,y:0,vx:0,vy:-1,stuck:true},
     pad={x:0,w:0},F={x:0,y:0,w:0,h:0},pHeld=false,tx=0,shake=0;
 function buildBricks(){bricks=[];
  const rows=Math.min(6,4+Math.floor(level/2)),bh=15*U,bw=(F.w-16*U)/10;
  for(let r=0;r<rows;r++)for(let c=0;c<10;c++)
   bricks.push({x:F.x+8*U+c*bw,y:F.y+34*U+r*bh,w:bw-3*U,h:bh-3*U,col:RC[r%RC.length]});}
 function stickBall(){ball.stuck=true;ball.x=pad.x;ball.y=F.y+F.h-26*U;}
 function layout(){U=clamp(Math.min(H/560,W/620),.55,1.4);
  F.w=Math.min(W-20,620*U);F.h=Math.min(H-170*U,430*U);
  F.x=(W-F.w)/2;F.y=Math.max(titleBottom()+46*U,H*.34);
  F.h=Math.min(F.h,H-F.y-70);
  pad.w=92*U;pad.x=F.x+F.w/2;buildBricks();stickBall();}
 function launch(){if(!ball.stuck)return;ball.stuck=false;
  const a=rand(-.5,.5),sp=(300+level*30)*U;
  ball.vx=Math.sin(a)*sp;ball.vy=-Math.cos(a)*sp;
  AudioFX.tone(500,760,.08,'square',.3);}
 function reset(){g.mode='ready';score=0;lives=3;level=1;setScore(0);layout();
  showHint(COARSE.matches?INFO.cab.hintC:INFO.cab.hintK);hideOver();}
 function start(){if(g.mode!=='ready')return;g.mode='playing';hideHint();hideOver();launch();}
 function die(){g.mode='dead';deadAt=performance.now();AudioFX.die();hideHint();
  const best=+LS.get(bestKey('cab'),0),nb=score>best,mx=Math.max(best,score);
  if(nb)LS.set(bestKey('cab'),score);setBest(mx);
  setTimeout(function(){showOver(INFO.cab.over,score,mx,nb);},500);}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};g.resize=layout;
 g.key=function(){};g.release=function(){};
 g.pointer=function(e,type){
  if(type==='down'){pHeld=true;tx=e.clientX;}
  else if(type==='move'){if(pHeld)tx=e.clientX;}
  else pHeld=false;};
 g.update=function(dt){t+=dt;shake=Math.max(0,shake-dt*26);
  if(g.mode!=='playing')return;
  if(pHeld)pad.x+=clamp(tx-pad.x,-900*U*dt,900*U*dt);
  pad.x=clamp(pad.x,F.x+pad.w/2,F.x+F.w-pad.w/2);
  if(ball.stuck){ball.x=pad.x;ball.y=F.y+F.h-26*U;return;}
  const steps=Math.ceil(Math.hypot(ball.vx,ball.vy)*dt/(6*U));
  for(let s=0;s<steps;s++){
   const d=dt/steps;
   ball.x+=ball.vx*d;ball.y+=ball.vy*d;
   if(ball.x<F.x+6*U){ball.x=F.x+6*U;ball.vx=Math.abs(ball.vx);AudioFX.tone(700,700,.03,'square',.12);}
   if(ball.x>F.x+F.w-6*U){ball.x=F.x+F.w-6*U;ball.vx=-Math.abs(ball.vx);AudioFX.tone(700,700,.03,'square',.12);}
   if(ball.y<F.y+6*U){ball.y=F.y+6*U;ball.vy=Math.abs(ball.vy);AudioFX.tone(700,700,.03,'square',.12);}
   if(ball.vy>0&&ball.y>F.y+F.h-18*U&&ball.y<F.y+F.h-4*U&&Math.abs(ball.x-pad.x)<pad.w/2+6*U){
    const rel=clamp((ball.x-pad.x)/(pad.w/2),-1,1),sp=Math.hypot(ball.vx,ball.vy);
    ball.vx=Math.sin(rel*1.05)*sp;ball.vy=-Math.abs(Math.cos(rel*1.05))*sp;
    ball.y=F.y+F.h-19*U;AudioFX.tone(300,500,.05,'square',.25);}
   for(const b of bricks){
    if(ball.x>b.x-5*U&&ball.x<b.x+b.w+5*U&&ball.y>b.y-5*U&&ball.y<b.y+b.h+5*U){
     b.dead=true;score+=10;
     const ox=Math.min(ball.x-(b.x-5*U),(b.x+b.w+5*U)-ball.x);
     const oy=Math.min(ball.y-(b.y-5*U),(b.y+b.h+5*U)-ball.y);
     if(ox<oy)ball.vx*=-1;else ball.vy*=-1;
     AudioFX.eat();shake=3;break;}}
   if(ball.y>F.y+F.h+30){lives--;AudioFX.tone(200,60,.3,'sawtooth',.5);
    if(lives<=0){die();return;}stickBall();return;}}
  bricks=bricks.filter(b=>!b.dead);
  setScore(score,true);
  if(!bricks.length){level++;buildBricks();stickBall();AudioFX.golden();}};
 g.draw=function(gc){gc.save();
  if(shake>0)gc.translate(rand(-shake,shake),rand(-shake,shake));
  gc.fillStyle=C.bg;gc.fillRect(0,0,W,H);
  gc.strokeStyle=C.frame;gc.lineWidth=10;
  gc.strokeRect(F.x-12,F.y-12,F.w+24,F.h+24);
  gc.fillStyle=C.txt;gc.font='700 '+Math.round(13*U)+'px '+MONO;gc.textAlign='center';
  gc.fillText('★ BREAKOUT — LEVEL '+level+' ★',F.x+F.w/2,F.y-22);
  for(const b of bricks){gc.fillStyle=b.col;gc.fillRect(b.x,b.y,b.w,b.h);
   gc.fillStyle='rgba(255,255,255,.25)';gc.fillRect(b.x,b.y,b.w,3);}
  gc.fillStyle=C.txt;gc.fillRect(pad.x-pad.w/2,F.y+F.h-14*U,pad.w,8*U);
  gc.fillStyle='#FF71CE';gc.fillRect(pad.x-pad.w/2,F.y+F.h-14*U,pad.w,2.5*U);
  gc.fillStyle=C.ball;gc.shadowColor='#fff';gc.shadowBlur=8;
  gc.beginPath();gc.arc(ball.x,ball.y,5.5*U,0,TAU);gc.fill();gc.shadowBlur=0;
  gc.textAlign='left';
  for(let i=0;i<3;i++){gc.beginPath();gc.arc(F.x+16+i*20,F.y+F.h+30,5,0,TAU);
   if(i<lives){gc.fillStyle=C.ball;gc.fill();}else{gc.strokeStyle=C.frame;gc.stroke();}}
  if(g.mode==='ready'){gc.fillStyle=(t%1<.5)?C.txt:'#5A5470';
   gc.font='700 '+Math.round(15*U)+'px '+MONO;gc.textAlign='center';
   gc.fillText('INSERT COIN',F.x+F.w/2,F.y+F.h*.45);}
  if(g.mode==='dead'){gc.fillStyle='rgba(11,11,18,.6)';gc.fillRect(0,0,W,H);}
  gc.restore();};
 return g;})();
Games.deep=(function(){
 const g={mode:'ready'};
 const C={rock:'#0A1B28',rockE:'#123246',sub:'#CFEFFF',fin:'#8FC3E8',jelly:'#FF9AD5',mine:'#FF6B6B'};
 let t=0,U=1,dist=0,bonus=0,sub={y:0,vy:0},thrust=false,segs=[],mins=[],jels=[],bubs=[],spawnX=0,gap=.5;
 function layout(){U=clamp(Math.min(H/540,W/470),.55,1.4);sub.y=H*.5;sub.vy=0;}
 function reset(){g.mode='ready';dist=0;bonus=0;segs=[];mins=[];jels=[];bubs=[];
  sub.y=H*.5;sub.vy=0;spawnX=0;gap=.5;
  showHint(COARSE.matches?INFO.deep.hintC:INFO.deep.hintK);hideOver();}
 function start(){if(g.mode!=='ready')return;g.mode='playing';hideHint();hideOver();AudioFX.tone(120,300,.5,'sine',.35);}
 function die(){g.mode='dead';deadAt=performance.now();AudioFX.die();hideHint();
  const sc=Math.floor(dist/12)+bonus;
  const best=+LS.get(bestKey('deep'),0),nb=sc>best,mx=Math.max(best,sc);
  if(nb)LS.set(bestKey('deep'),sc);setBest(mx);
  setTimeout(function(){showOver(INFO.deep.over,sc,mx,nb);},500);}
 g.enter=function(){layout();reset();};
 g.start=start;g.restart=function(){reset();start();};g.resize=layout;
 g.key=function(k){if(k===' '||k==='ArrowUp'||k==='w'||k==='W')thrust=true;};
 g.release=function(k){if(k===' '||k==='ArrowUp'||k==='w'||k==='W')thrust=false;};
 g.pointer=function(e,type){if(type==='down')thrust=true;else if(type!=='move')thrust=false;};
 g.update=function(dt){t+=dt;
  const sp=(g.mode==='playing'?Math.min(280+dist*.008,620):90)*U;
  if(g.mode==='playing'){
   dist+=sp*dt;
   sub.vy=clamp(sub.vy+(thrust?-1050:820)*U*dt,-380*U,380*U);
   sub.y+=sub.vy*dt;
   if(sub.y<40*U){sub.y=40*U;sub.vy=Math.max(sub.vy,0);}
   if(sub.y>H-40*U){sub.y=H-40*U;sub.vy=Math.min(sub.vy,0);}
   spawnX-=sp*dt;
   if(spawnX<=0){spawnX=150*U;
    const gapH=Math.max(.22,.44-dist/14000)*H;
    gap=clamp(gap+rand(-.14,.14),.22,.78);
    segs.push({x:W+60,top:Math.max(0,gap*H-gapH/2),bot:Math.max(0,H-(gap*H+gapH/2))});
    if(Math.random()<.4)mins.push({x:W+60+rand(40,90),y:clamp(gap*H+rand(-gapH/3,gapH/3),60,H-60),r:11*U,ph:rand(0,TAU)});
    if(Math.random()<.4)jels.push({x:W+90,y:rand(H*.2,H*.8),ph:rand(0,TAU)});}
   const sx=W*.24,sr=13*U;
   for(const s of segs){s.x-=sp*dt;
    if(Math.abs(s.x-sx)<26*U+sr&&(sub.y-sr<s.top||sub.y+sr>H-s.bot)){die();return;}}
   segs=segs.filter(s=>s.x>-80);
   for(const m of mins){m.x-=sp*dt;
    if(Math.hypot(m.x-sx,m.y-sub.y)<m.r+sr){die();return;}}
   mins=mins.filter(m=>m.x>-40);
   for(const j of jels){j.x-=sp*dt;
    if(!j.got&&Math.hypot(j.x-sx,j.y-sub.y)<20*U+sr){j.got=true;bonus+=40;AudioFX.pickup();}}
   jels=jels.filter(j=>!j.got&&j.x>-40);
   setScore(Math.floor(dist/12)+bonus,true);
  }else sub.y=H*.5+Math.sin(t*1.2)*10*U;
  if(Math.random()<dt*8)bubs.push({x:W+10,y:rand(0,H),r:rand(1,3.5)*U,v:rand(30,80)*U});
  bubs.forEach(b=>{b.y-=b.v*dt;b.x-=(g.mode==='playing'?sp*.6:40)*dt;});
  bubs=bubs.filter(b=>b.x>-6&&b.y>-6);};
 g.draw=function(gc){
  const d=Math.min(dist/9000,1);
  const bg=gc.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,mix('#0A3A56','#021019',d));bg.addColorStop(1,mix('#03141F','#010409',d));
  gc.fillStyle=bg;gc.fillRect(0,0,W,H);
  if(d<.7){gc.globalAlpha=(0.7-d)*.16;gc.fillStyle='#BFE8FF';
   for(let i=0;i<5;i++){const rx=W*(i*.22+.05)+Math.sin(t*.4+i)*30;
    gc.beginPath();gc.moveTo(rx,-20);gc.lineTo(rx+90,-20);gc.lineTo(rx+260,H);gc.lineTo(rx+120,H);gc.closePath();gc.fill();}
   gc.globalAlpha=1;}
  gc.strokeStyle='rgba(191,232,255,.35)';
  for(const b of bubs){gc.beginPath();gc.arc(b.x,b.y,b.r,0,TAU);gc.stroke();}
  for(const s of segs){gc.fillStyle=C.rock;
   gc.fillRect(s.x-26*U,0,52*U,s.top);gc.fillRect(s.x-26*U,H-s.bot,52*U,s.bot);
   gc.fillStyle=C.rockE;gc.fillRect(s.x+14*U,0,6*U,s.top);gc.fillRect(s.x+14*U,H-s.bot,6*U,s.bot);}
  for(const m of mins){const pu=1+Math.sin(t*4+m.ph)*.08;
   gc.strokeStyle=C.mine;gc.lineWidth=2;
   for(let i=0;i<6;i++){const a=i/6*TAU;
    gc.beginPath();gc.moveTo(m.x+Math.cos(a)*m.r*1.2*pu,m.y+Math.sin(a)*m.r*1.2*pu);
    gc.lineTo(m.x+Math.cos(a)*m.r*1.7*pu,m.y+Math.sin(a)*m.r*1.7*pu);gc.stroke();}
   gc.fillStyle=C.mine;gc.beginPath();gc.arc(m.x,m.y,m.r*pu,0,TAU);gc.fill();}
  for(const j of jels){const pu=Math.sin(t*3+j.ph)*.12;
   gc.save();gc.translate(j.x,j.y);gc.globalAlpha=.85;
   gc.fillStyle=C.jelly;gc.shadowColor=C.jelly;gc.shadowBlur=14;
   gc.beginPath();gc.arc(0,0,13*U*(1+pu),Math.PI,0);gc.closePath();gc.fill();
   gc.strokeStyle=C.jelly;gc.lineWidth=1.6;
   for(let i=-2;i<=2;i++){gc.beginPath();gc.moveTo(i*5*U,0);
    gc.quadraticCurveTo(i*5*U+Math.sin(t*5+i)*4*U,12*U,i*5*U+Math.sin(t*4+i*2)*6*U,22*U);gc.stroke();}
   gc.shadowBlur=0;gc.globalAlpha=1;gc.restore();}
  const sx=W*.24,sy=sub.y;
  gc.save();gc.translate(sx,sy);
  const cone=gc.createLinearGradient(0,0,130*U,0);
  cone.addColorStop(0,'rgba(191,232,255,.28)');cone.addColorStop(1,'rgba(191,232,255,0)');
  gc.fillStyle=cone;
  gc.beginPath();gc.moveTo(12*U,-4*U);gc.lineTo(130*U,-30*U);gc.lineTo(130*U,30*U);gc.lineTo(12*U,4*U);gc.closePath();gc.fill();
  gc.fillStyle=C.fin;
  gc.beginPath();gc.moveTo(-10*U,-3*U);gc.lineTo(-20*U,-11*U);gc.lineTo(-16*U,0);gc.closePath();gc.fill();
  gc.beginPath();gc.moveTo(-10*U,3*U);gc.lineTo(-20*U,11*U);gc.lineTo(-16*U,0);gc.closePath();gc.fill();
  gc.fillStyle=C.sub;gc.beginPath();gc.ellipse(0,0,17*U,10*U,0,0,TAU);gc.fill();
  gc.fillStyle='#0A3A56';gc.beginPath();gc.arc(7*U,-1*U,4.4*U,0,TAU);gc.fill();
  gc.fillStyle='#BFE8FF';gc.beginPath();gc.arc(8*U,-2*U,1.8*U,0,TAU);gc.fill();
  gc.restore();
  if(g.mode==='dead'){gc.fillStyle='rgba(2,10,16,.6)';gc.fillRect(0,0,W,H);}};
 return g;})();
return {mount:mount,Games:Games,INFO:INFO};
})();
