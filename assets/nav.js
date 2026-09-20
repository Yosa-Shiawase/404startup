/*! 404STARTUP (c) 2025 Yosa-Shiawase. All rights reserved. */
(function(){
'use strict';
if(document.getElementById('n4menu'))return;
var ITEMS=[
 {m:'/',l:'HOME'},
 {m:'/library/',l:'LIBRARY'},
 {m:'dashboard.html',l:'DASHBOARD'},
 {m:'/work/',l:'THE WORK'},
 {m:'about.html',l:'ABOUT'},{m:'/404.html',l:'PLAY THE ARCADE →'}
];
function isActive(m){
 var p=location.pathname;
 if(m==='/')return p==='/'||(p.indexOf('/index.html')>-1&&p.indexOf('/library/')<0&&p.indexOf('/work/')<0);
 return p.indexOf(m)>-1;
}
function hrefFor(m){return m==='/'?'index.html':m;}
var CSS=''
+'.n4-scrim{position:fixed;inset:0;z-index:64;background:rgba(10,8,14,.55);opacity:0;pointer-events:none;transition:opacity .3s}'
+'.n4-scrim.open{opacity:1;pointer-events:auto}'
+'.n4-menu{position:fixed;inset:0;z-index:70;background:#141019;color:#EFE6CC;display:flex;flex-direction:column;justify-content:center;padding:0 clamp(24px,8vw,80px);clip-path:inset(0 0 100% 0);transition:clip-path .45s cubic-bezier(.7,0,.3,1);font-family:ui-monospace,Menlo,Consolas,monospace}'
+'.n4-menu.open{clip-path:inset(0 0 0% 0)}'
+'.n4-menu a{color:#EFE6CC;text-decoration:none;font-size:clamp(22px,5.5vw,46px);font-weight:700;padding:10px 0;border-bottom:1px solid rgba(239,230,204,.12);display:flex;align-items:baseline;gap:16px;opacity:0;transform:translateY(18px);transition:opacity .4s,transform .4s,color .2s}'
+'.n4-menu.open a{opacity:1;transform:none}'
+'.n4-menu a i{font-style:normal;font-size:11px;letter-spacing:.3em;color:#F2A65A}'
+'.n4-menu a:hover,.n4-menu a.on{color:#F2A65A}'
+'.n4-menu a.on i::after{content:" ●"}'
+'.n4-x{position:absolute;top:18px;right:20px;background:none;border:1.5px solid rgba(239,230,204,.3);color:#EFE6CC;font-size:16px;width:42px;height:42px;border-radius:50%;cursor:pointer}'
+'.n4-soc{margin-top:26px;font-size:11px;letter-spacing:.16em;opacity:.65;color:#EFE6CC}'
+'.n4-soc a{font-size:12px;border:none;display:inline;padding:0;opacity:1;transform:none;color:#F2A65A;font-weight:400}'
+'.n4-burger{display:flex;flex-direction:column;gap:4px;background:none;border:2px solid currentColor;border-radius:4px;padding:8px;cursor:pointer;margin-left:8px;flex:none}'
+'.n4-burger span{display:block;width:18px;height:2px;background:currentColor;transition:transform .25s,opacity .25s}'
+'.n4-burger.open span:nth-child(1){transform:translateY(6px) rotate(45deg)}'
+'.n4-burger.open span:nth-child(2){opacity:0}'
+'.n4-burger.open span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}'
+'.n4-fixed{position:fixed;top:max(14px,env(safe-area-inset-top));right:14px;z-index:80;color:#EFE6CC;background:rgba(20,16,25,.75)}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
var scrim=document.createElement('div');scrim.className='n4-scrim';
var nav=document.createElement('nav');nav.className='n4-menu';nav.id='n4menu';
var links=ITEMS.map(function(it,i){
 var on=isActive(it.m)?' class="on"':'';
 return '<a href="'+hrefFor(it.m)+'"'+on+'><i>0'+(i+1)+'</i>'+it.l+'</a>';
}).join('');
nav.innerHTML='<button class="n4-x" aria-label="Close menu">✕</button>'+links+
 '<div class="n4-soc">GITHUB <a href="https://github.com/Yosa-Shiawase/404startup" target="_blank" rel="noopener">@YOSA-SHIAWASE</a> · INSTAGRAM <a href="https://www.instagram.com/yosashiawase/" target="_blank" rel="noopener">@YOSASHIAWASE</a> · <a href="https://www.linkedin.com/yosa-shiawase" target="_blank" rel="noopener">LINKEDIN</a></div>';
document.body.appendChild(scrim);document.body.appendChild(nav);
var burger=document.createElement('button');
burger.className='n4-burger';burger.setAttribute('aria-label','Menu');
burger.innerHTML='<span></span><span></span><span></span>';
var hd=document.querySelector('header');
if(hd)hd.appendChild(burger);
else{burger.classList.add('n4-fixed');document.body.appendChild(burger);}
function open(){nav.classList.add('open');scrim.classList.add('open');burger.classList.add('open');
 var as=nav.querySelectorAll('a');for(var i=0;i<as.length;i++)as[i].style.transitionDelay=(0.05*i)+'s';}
function close(){nav.classList.remove('open');scrim.classList.remove('open');burger.classList.remove('open');
 var as=nav.querySelectorAll('a');for(var i=0;i<as.length;i++)as[i].style.transitionDelay='0s';}
burger.addEventListener('click',function(){nav.classList.contains('open')?close():open();});
scrim.addEventListener('click',close);
nav.querySelector('.n4-x').addEventListener('click',close);
nav.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('a'))close();});
addEventListener('keydown',function(e){if(e.key==='Escape')close();});
if(localStorage.getItem('n404_site_theme')==='orbit')document.body.classList.add('orbit');
if(typeof window.toggleTheme!=='function'){
 window.toggleTheme=function(){
  if(localStorage.getItem('n404_orbit')!=='1')return;
  var on=!document.body.classList.contains('orbit');
  document.body.classList.toggle('orbit',on);
  localStorage.setItem('n404_site_theme',on?'orbit':'sand');
  var t=document.getElementById('themeToggle');
  if(t)t.textContent=on?'THEME: ORBIT ●':'THEME: SAND ●';
 };}
var tt=document.getElementById('themeToggle');
if(tt&&localStorage.getItem('n404_orbit')==='1'){
 tt.style.display='inline-block';
 tt.textContent=localStorage.getItem('n404_site_theme')==='orbit'?'THEME: ORBIT ●':'THEME: SAND ●';}
})();
