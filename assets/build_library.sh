#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
echo ">> generating library pages"
mkdir -p library
while IFS='|' read -r dir id name num; do
  [ -z "$dir" ] && continue
  mkdir -p "library/$dir"

  # ---- game shell (no switcher — mounts ONE game) ----
  cat > "library/$dir/.tmp" << 'GEOF'
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>__NAME__ — 404STARTUP</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
</head><body>
<script src="/assets/n404-core.js"></script>
<script>N404.mount('__ID__',{back:'../'});</script>
</body></html>
GEOF
  sed -e "s/__ID__/$id/g" -e "s/__NAME__/$name/g" "library/$dir/.tmp" > "library/$dir/$dir.html"
  rm "library/$dir/.tmp"

  # ---- description page ----
  cat > "library/$dir/.tmp" << 'PEOF'
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>__NAME__ — 404STARTUP</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:ui-monospace,Menlo,Consolas,monospace;background:#F2E2C4;color:#3A2A18;-webkit-tap-highlight-color:transparent;min-height:100vh}
body.orbit{background:#0A0E1B;color:#E9EDF6}
.wrap{max-width:860px;margin:0 auto;padding:0 20px 60px}
header{display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:2px solid currentColor}
header b{letter-spacing:.2em;font-size:12px}
header .sp{flex:1}
.lnk{font-size:11px;letter-spacing:.12em;color:#C75B26;text-decoration:none;border:1.5px solid #C75B26;padding:8px 12px}
.kick{font-size:10px;letter-spacing:.3em;color:#C75B26;margin:30px 0 8px}
h1{font-size:clamp(30px,6vw,52px);letter-spacing:.03em;line-height:1.05}
.tag{display:inline-block;margin-top:8px;font-size:11px;letter-spacing:.24em;color:#C75B26}
.art{margin:24px 0;border:3px solid currentColor;border-radius:6px;overflow:hidden;box-shadow:10px 10px 0 #C75B26;max-width:640px;line-height:0}
.art svg{width:100%;height:auto;display:block}
.art [class^="a-"]{animation-play-state:paused;transform-box:view-box}
.art:hover [class^="a-"]{animation-play-state:running}
@media(pointer:coarse){.art [class^="a-"]{animation-play-state:running}}
.a-run{animation:kRun 1.1s steps(2) infinite}.a-spin{animation:kSpin 5s linear infinite}
.a-fall{animation:kFall 3s linear infinite}.a-flick{animation:kFlick 1.4s steps(1) infinite}
.a-ping{animation:kPing 1.8s ease-in-out infinite}.a-grid{animation:kGrid 1.1s linear infinite}
.a-roll{animation:kRoll 3.4s linear infinite}.a-pad{animation:kPad 2.4s ease-in-out infinite}
.a-rise{animation:kRise 3.4s linear infinite}.a-bob{animation:kBob 2.6s ease-in-out infinite}
@keyframes kRun{0%,100%{transform:translateX(0)}50%{transform:translateX(22px)}}
@keyframes kSpin{to{transform:rotate(360deg)}}
@keyframes kFall{from{transform:translateY(-30px)}to{transform:translateY(250px)}}
@keyframes kFlick{50%{opacity:.4}}
@keyframes kPing{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes kGrid{from{transform:translateY(0)}to{transform:translateY(18px)}}
@keyframes kRoll{0%{transform:translate(0,0)}30%{transform:translate(90px,-46px)}60%{transform:translate(180px,10px)}80%{transform:translate(60px,-20px)}100%{transform:translate(0,0)}}
@keyframes kPad{0%,100%{transform:translateX(-46px)}50%{transform:translateX(46px)}}
@keyframes kRise{from{transform:translateY(40px)}to{transform:translateY(-250px)}}
@keyframes kBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.desc{font-size:14px;line-height:1.8;opacity:.85;max-width:58ch}
ul.feats{margin:16px 0 26px;padding-left:20px;line-height:2;font-size:13px;opacity:.8}
.btn{display:inline-block;background:#C75B26;color:#fff;text-decoration:none;font-size:13px;letter-spacing:.15em;padding:13px 26px;border-radius:4px;box-shadow:4px 4px 0 rgba(0,0,0,.5)}
.btn.ghost{background:transparent;color:inherit;border:2px solid currentColor;box-shadow:none}
.pn{margin-top:30px;font-size:12px;letter-spacing:.08em}
.pn a{color:#C75B26}
</style></head><body>
<div class="wrap">
<header>
<svg viewBox="0 0 32 32" width="30"><polygon points="8,6 13,12 8,13" fill="#C75B26"/><polygon points="24,6 19,12 24,13" fill="#C75B26"/><polygon points="8,12 24,12 16,24" fill="#C75B26"/><polygon points="12,17 20,17 16,22" fill="#3A2A18"/></svg>
<b>404STARTUP</b><span class="sp"></span>
<a class="lnk" href="../">&#8592; LIBRARY</a>
</header>
<div class="kick">// LIBRARY ENTRY __NUM__</div>
<h1>__NAME__</h1>
<span class="tag" id="tag"></span>
<div class="art" id="art"></div>
<p class="desc" id="desc"></p>
<ul class="feats" id="feats"></ul>
<a class="btn" href="__DIR__.html">&#9654; PLAY __NAME__</a>
<a class="btn ghost" href="../" style="margin-left:10px">ALL GAMES</a>
<p class="pn" id="pn"></p>
</div>
<script src="/assets/library-manifest.js"></script>
<script src="/assets/game-art.js"></script>
<script>
if(localStorage.getItem('n404_site_theme')==='orbit')document.body.classList.add('orbit');
var id='__ID__',g=N404_GAMES.find(function(x){return x.id===id});
document.getElementById('tag').textContent=g.tag;
document.getElementById('desc').textContent=g.long;
document.getElementById('feats').innerHTML=g.feats.map(function(f){return '<li>'+f+'</li>'}).join('');
document.getElementById('art').innerHTML=N404_ART[id]();
var i=N404_GAMES.indexOf(g),p=N404_GAMES[(i+N404_GAMES.length-1)%N404_GAMES.length],n=N404_GAMES[(i+1)%N404_GAMES.length];
document.getElementById('pn').innerHTML='<a href="../'+p.dir+'/'+p.dir+'_page.html">&#8592; '+p.title+'</a> &middot; <a href="../'+n.dir+'/'+n.dir+'_page.html">'+n.title+' &#8594;</a>';
</script>
</body></html>
PEOF
  sed -e "s/__ID__/$id/g" -e "s/__DIR__/$dir/g" -e "s/__NAME__/$name/g" -e "s/__NUM__/$num/g" "library/$dir/.tmp" > "library/$dir/${dir}_page.html"
  rm "library/$dir/.tmp"
  echo "   library/$dir/$dir.html + ${dir}_page.html"
done << 'PAIRS'
fox|dunes|DUNES FOX RUN|01
orbit|orbit|ORBIT DRIFTER|02
snake|terminal|TERMINAL SNAKE|03
sonar|sonar|SONAR CONTACT|04
vapor|vapor|SUNSET DRIFT|05
matrix|matrix|WHITE RABBIT|06
cab|cab|ARCADE CABINET|07
deep|deep|ABYSS DRIFT|08
PAIRS

# ---- library index ----
cat > library/index.html << 'LIB_EOF'
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Library — 404STARTUP</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:ui-monospace,Menlo,Consolas,monospace;background:#F2E2C4;color:#3A2A18;
 -webkit-tap-highlight-color:transparent;transition:background-color .8s,color .8s}
body.orbit{background:#0A0E1B;color:#E9EDF6}
.wrap{max-width:1180px;margin:0 auto;padding:0 clamp(16px,4vw,44px) 60px}
header{display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:2px solid currentColor}
header b{letter-spacing:.2em;font-size:12px}
header .sp{flex:1}
.lnk{font-size:11px;letter-spacing:.12em;color:#C75B26;text-decoration:none;border:1.5px solid #C75B26;padding:8px 12px}
h1{font-size:clamp(26px,4.5vw,44px);margin:34px 0 6px}
.lead{opacity:.75;font-size:14px;line-height:1.7;max-width:56ch}
.bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:22px 0 6px}
.search{flex:1 1 220px;max-width:340px}
.search input{width:100%;background:transparent;border:2px solid currentColor;color:inherit;
 font-family:inherit;font-size:13px;padding:10px 14px;border-radius:4px;outline:none}
.search input:focus{border-color:#C75B26}
button.chip,button.shuf{background:transparent;border:2px solid rgba(128,128,128,.55);color:inherit;
 font-family:inherit;font-size:11px;letter-spacing:.1em;padding:9px 14px;border-radius:999px;cursor:pointer;
 transition:all .15s;white-space:nowrap}
button.chip:hover{border-color:#C75B26;color:#C75B26}
button.chip.on{background:#C75B26;border-color:#C75B26;color:#fff}
button.shuf{border-color:#C75B26;color:#C75B26;font-weight:700}
button.shuf:hover{background:#C75B26;color:#fff}
.count{font-size:10.5px;letter-spacing:.18em;opacity:.55;margin:10px 0 4px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:clamp(14px,2vw,22px);margin-top:14px}
.card{background:#fff;border:2px solid currentColor;border-radius:6px;text-decoration:none;color:inherit;display:block;
 overflow:hidden;position:relative;transition:transform .22s,box-shadow .22s;animation:pop .3s backwards}
body.orbit .card{background:#121A33;border-color:#2A3458}
@keyframes pop{from{opacity:0;transform:translateY(14px)}}
.card:hover{transform:translateY(-7px) rotate(-.8deg);box-shadow:8px 8px 0 #C75B26}
.badge{position:absolute;top:10px;right:10px;font-size:8.5px;letter-spacing:.18em;background:#3A2A18;
 color:#F2E2C4;padding:3px 8px;border-radius:2px;z-index:2}
body.orbit .badge{background:#FFB454;color:#0A0E1B}
.card h3{font-size:14px;letter-spacing:.12em;margin:10px 14px 6px}
.card p{font-size:12.5px;line-height:1.6;opacity:.7;margin:0 14px 10px}
.tags{margin:0 14px 12px;display:flex;gap:5px;flex-wrap:wrap}
.tags i{font-style:normal;font-size:9px;letter-spacing:.1em;border:1px solid rgba(128,128,128,.45);
 border-radius:999px;padding:2px 8px;opacity:.75}
.card .go{display:inline-block;margin:0 14px 14px;font-size:11.5px;color:#C75B26}
.art{line-height:0;border-bottom:2px solid currentColor}
body.orbit .art{border-color:#2A3458}
.art svg{width:100%;height:auto;display:block}
.art [class^="a-"]{animation-play-state:paused;transform-box:view-box}
.card:hover .art [class^="a-"],.art:hover [class^="a-"]{animation-play-state:running}
@media(pointer:coarse){.art [class^="a-"]{animation-play-state:running}}
.a-run{animation:kRun 1.1s steps(2) infinite}.a-spin{animation:kSpin 5s linear infinite}
.a-fall{animation:kFall 3s linear infinite}.a-flick{animation:kFlick 1.4s steps(1) infinite}
.a-ping{animation:kPing 1.8s ease-in-out infinite}.a-grid{animation:kGrid 1.1s linear infinite}
.a-roll{animation:kRoll 3.4s linear infinite}.a-pad{animation:kPad 2.4s ease-in-out infinite}
.a-rise{animation:kRise 3.4s linear infinite}.a-bob{animation:kBob 2.6s ease-in-out infinite}
@keyframes kRun{0%,100%{transform:translateX(0)}50%{transform:translateX(22px)}}
@keyframes kSpin{to{transform:rotate(360deg)}}
@keyframes kFall{from{transform:translateY(-30px)}to{transform:translateY(250px)}}
@keyframes kFlick{50%{opacity:.4}}
@keyframes kPing{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes kGrid{from{transform:translateY(0)}to{transform:translateY(18px)}}
@keyframes kRoll{0%{transform:translate(0,0)}30%{transform:translate(90px,-46px)}60%{transform:translate(180px,10px)}80%{transform:translate(60px,-20px)}100%{transform:translate(0,0)}}
@keyframes kPad{0%,100%{transform:translateX(-46px)}50%{transform:translateX(46px)}}
@keyframes kRise{from{transform:translateY(40px)}to{transform:translateY(-250px)}}
@keyframes kBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.soon-card{border:2px dashed rgba(128,128,128,.6);border-radius:6px;display:flex;flex-direction:column;
 align-items:center;justify-content:center;min-height:260px;text-align:center;padding:24px;gap:10px}
.soon-card .em{font-size:34px;opacity:.8}
.soon-card b{font-size:13px;letter-spacing:.16em}
.soon-card p{font-size:11.5px;opacity:.6;max-width:26ch;line-height:1.7}
footer{border-top:2px solid currentColor;margin-top:50px;padding:22px 0;text-align:center;font-size:11px;opacity:.75;line-height:2.1}
footer a{color:#C75B26}
#themeToggle{background:none;border:1px dashed #C75B26;color:#C75B26;font-family:inherit;font-size:10px;letter-spacing:.15em;padding:6px 13px;border-radius:3px;cursor:pointer;margin-left:8px}
.empty{text-align:center;padding:50px 0;opacity:.6;font-size:13px;letter-spacing:.1em;display:none}
</style></head><body>
<div class="wrap">
<header>
<svg viewBox="0 0 32 32" width="30"><polygon points="8,6 13,12 8,13" fill="#C75B26"/><polygon points="24,6 19,12 24,13" fill="#C75B26"/><polygon points="8,12 24,12 16,24" fill="#C75B26"/><polygon points="12,17 20,17 16,22" fill="#3A2A18"/></svg>
<b>404STARTUP</b><span class="sp"></span>
<a class="lnk" href="/index.html">&#8592; HOME</a>
<a class="lnk" href="/work/index.html">THE WORK</a>
<a class="lnk" href="/404.html">ARCADE &#9654;</a>
</header>
<h1>THE LIBRARY</h1>
<p class="lead">Every 404, a different world. Filter by mood, search by name, or shuffle and let the fox decide.</p>
<div class="bar">
 <div class="search"><input id="q" type="text" placeholder="search worlds..." autocomplete="off"></div>
 <button class="shuf" id="shuf">SHUFFLE &#127922;</button>
</div>
<div class="bar" id="chips" style="margin-top:0"></div>
<div class="count" id="count"></div>
<div class="cards" id="cards"></div>
<div class="empty" id="empty">NOTHING MATCHES. THE FOX SUGGESTS SHUFFLING.</div>
</div>
<footer>
<a href="/index.html">home</a> &#183; <a href="/dashboard.html">dashboard</a> &#183; <a href="/404.html">the arcade</a>
<button id="themeToggle" onclick="toggleTheme()"></button>
</footer>
<script src="/assets/library-manifest.js"></script>
<script src="/assets/game-art.js"></script>
<script src="/assets/nav.js"></script>
<script>
if(localStorage.getItem('n404_site_theme')==='orbit')document.body.classList.add('orbit');
var ALL=N404_GAMES;
var CHIPSETS=[
 ['ALL',null,''],['GAMES','type:game',''],['WAITING','type:waiting',''],
 ['RUNNER','runner',''],['PUZZLE','','puzzle'],['MEMORY','memory',''],
 ['TIMING','timing',''],['STEERING','steering',''],['ARCADE','arcade',''],
 ['REFLEX','reflex',''],['FLOW','flow',''],['CLASSIC','classic',''],
 ['VERSUS','versus',''],['AIM','aim',''],['PRECISION','precision','']
];
function chipMatches(g,c){
 var key=c[1]||c[2];
 if(!key)return true;
 if(key.indexOf('type:')===0)return g.type===key.split(':')[1];
 return (g.tags||[]).indexOf(key)>-1;
}
var CHIPS=CHIPSETS.filter(function(c){
 if(c[0]==='ALL')return true;
 if(c[1]==='type:game')return true;
 if(c[1]==='type:waiting')return ALL.some(function(g){return g.type==='waiting';});
 var key=c[1]||c[2];
 return ALL.some(function(g){return (g.tags||[]).indexOf(key)>-1;});
});
var cur='ALL',q='';
function renderChips(){
 document.getElementById('chips').innerHTML=CHIPS.map(function(c){
  var on=(cur===c[0])?' on':'';
  return '<button class="chip'+on+'" data-c="'+c[0]+'">'+c[0]+'</button>';
 }).join('');
 document.querySelectorAll('#chips .chip').forEach(function(b){
  b.addEventListener('click',function(){cur=b.dataset.c;renderChips();renderCards();});
 });
}
function matches(g){
 if(cur!=='ALL'){
  var c=null;
  for(var i=0;i<CHIPS.length;i++)if(CHIPS[i][0]===cur)c=CHIPS[i];
  if(c&&!chipMatches(g,c))return false;
 }
 if(q){
  var t=q.toLowerCase();
  var hay=(g.title+' '+g.tag+' '+g.short+' '+(g.tags||[]).join(' ')).toLowerCase();
  if(hay.indexOf(t)<0)return false;
 }
 return true;
}
function cardHTML(g,i){
 var t=(g.tags||[]).slice(0,3).map(function(x){return '<i>'+x+'</i>';}).join('');
 return '<a class="card" style="animation-delay:'+(i*40)+'ms" href="'+g.dir+'/'+g.dir+'_page.html">'+
  '<span class="badge">'+g.num+'</span><div class="art">'+N404_ART[g.id]()+'</div>'+
  '<h3>'+g.title+'</h3><p>'+g.short+'</p><div class="tags">'+t+'</div>'+
  '<span class="go">VIEW &#38; PLAY &#8594;</span></a>';
}
var SOON='<div class="soon-card"><div class="em">&#129418;</div><b>MORE TO COME</b>'+
 '<p>The shelf keeps growing. New worlds ship in waves &#8212; the fox is already sketching.</p></div>';
function renderCards(){
 var list=ALL.filter(matches);
 document.getElementById('cards').innerHTML=list.map(cardHTML).join('')+SOON;
 document.getElementById('count').textContent=list.length+' OF '+ALL.length+' WORLDS SHOWN';
 document.getElementById('empty').style.display=list.length?'none':'block';
}
document.getElementById('q').addEventListener('input',function(e){
 q=e.target.value.trim();renderCards();
});
document.getElementById('shuf').addEventListener('click',function(){
 var vis=ALL.filter(matches);
 for(var i=vis.length-1;i>0;i--){
  var j=Math.floor(Math.random()*(i+1));
  var tmp=vis[i];vis[i]=vis[j];vis[j]=tmp;
 }
 document.getElementById('cards').innerHTML=vis.map(cardHTML).join('')+SOON;
});
renderChips();renderCards();
</script>
</body></html>

LIB_EOF

# ---- bump sw cache version (PRECACHE is maintained by hand) ----
python - << 'BUMP'
import io
s=io.open('sw.js',encoding='utf-8').read()
i=s.find("n404-v")
old=s[i+6:].split("'")[0]
n=int(old)+1
s=s[:i+6]+str(n)+s[i+6+len(old):]
io.open('sw.js','w',encoding='utf-8').write(s)
print('sw cache -> n404-v'+str(n))
BUMP
echo ">> sw.js version bumped (update PRECACHE by hand when files change)"
echo ">> done."

# ---- v2 post-pass: inject "waiting page" buttons + final sw.js ----
python - << 'PP_EOF'
import io,os
def patch(path,btn):
    if not os.path.exists(path): return
    s=io.open(path,encoding='utf-8').read()
    if 'WAITING PAGE' in s: return
    s=s.replace('<a class="btn ghost" href="../" style="margin-left:10px">ALL GAMES</a>',
        btn+'\n<a class="btn ghost" href="../" style="margin-left:10px">ALL GAMES</a>',1)
    io.open(path,'w',encoding='utf-8').write(s)
amb='<a class="btn ghost" style="margin-left:10px" href="{f}">&#9707; {l} WAITING PAGE</a>'
patch('library/matrix/matrix_page.html',amb.format(f='rain.html',l='OPEN THE'))
patch('library/sonar/sonar_page.html',amb.format(f='idle.html',l='OPEN THE'))
patch('library/vapor/vapor_page.html',amb.format(f='radio.html',l='OPEN THE'))
print('ambient buttons injected')
PP_EOF
