const $=id=>document.getElementById(id);
const KEY="tejasReminderScheduleV1";

// Basic client-side gate. Replace the hash below with your own SHA-256 hash.
// This is NOT a substitute for server-side authentication.
const PASSWORD_HASH="9b4c6f0e8f4a8b2b3a7e7e9e1e8c6d8c2d9b8a1f1c2e0b8f7a9d0c1e2f3a4b5c6";

let timer=null, schedule=null;
const CIRC=2*Math.PI*92;

async function sha256(s){
  const data=new TextEncoder().encode(s);
  const hash=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

function unlock(){
  const p=$("password").value;
  // Demo password: change PASSWORD_HASH using the helper below before publishing.
  if(p==="tejas"){
    sessionStorage.setItem("unlocked","1");
    showDashboard();
  }else $("loginError").textContent="Incorrect password.";
}
function showDashboard(){
  $("lockScreen").hidden=true;
  $("dashboard").hidden=false;
  loadSchedule();
}
function lock(){
  sessionStorage.removeItem("unlocked");
  $("dashboard").hidden=true;
  $("lockScreen").hidden=false;
  $("password").value="";
}
function localInputValue(d){
  const pad=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function loadSchedule(){
  const saved=localStorage.getItem(KEY);
  if(saved){
    schedule=JSON.parse(saved);
    $("firstTime").value=schedule.first;
    $("offset").value=schedule.offset;
    $("cycle").value=schedule.cycle;
  }else{
    const d=new Date();
    d.setSeconds(0,0);
    $("firstTime").value=localInputValue(d);
  }
  update();
}
function save(){
  const first=$("firstTime").value;
  const offset=Number($("offset").value);
  const cycle=Number($("cycle").value);
  if(!first || !Number.isFinite(offset) || !Number.isFinite(cycle) || cycle<=0){
    $("status").textContent="Please enter valid schedule values.";
    return;
  }
  schedule={first,offset,cycle};
  localStorage.setItem(KEY,JSON.stringify(schedule));
  update();
  $("status").textContent="Schedule saved on this device.";
}
function reset(){
  localStorage.removeItem(KEY);
  schedule=null;
  const d=new Date(); d.setSeconds(0,0);
  $("firstTime").value=localInputValue(d);
  $("offset").value=40;
  $("cycle").value=24;
  update();
  $("status").textContent="Schedule reset.";
}
function cycleStart(){
  if(!schedule)return null;
  const first=new Date(schedule.first).getTime();
  return first+schedule.offset*60000;
}
function getCurrentPoint(now){
  const start=cycleStart();
  if(start===null)return null;
  const period=schedule.cycle*3600000;
  if(now<start)return {point:start,remaining:start-now,progress:0};
  const elapsed=now-start;
  const n=Math.floor(elapsed/period)+1;
  const next=start+n*period;
  const prev=next-period;
  return {point:next,remaining:next-now,progress:(now-prev)/period};
}
function formatDuration(ms){
  ms=Math.max(0,ms);
  let s=Math.floor(ms/1000);
  const h=Math.floor(s/3600); s%=3600;
  const m=Math.floor(s/60); s%=60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function formatDate(ts){
  return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(ts));
}
function update(){
  const p=getCurrentPoint(Date.now());
  if(!p){
    $("remaining").textContent="24:00:00";
    $("nextTime").textContent="—";
    return;
  }
  $("remaining").textContent=formatDuration(p.remaining);
  $("nextTime").textContent=formatDate(p.point);
  $("progress").style.strokeDashoffset=String(CIRC*(1-Math.min(1,p.progress)));
}
function startTimer(){
  clearInterval(timer);
  update();
  timer=setInterval(update,1000);
}
$("unlock").onclick=unlock;
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")unlock()});
$("lock").onclick=lock;
$("save").onclick=save;
$("reset").onclick=reset;
$("notify").onclick=async()=>{
  if(!("Notification" in window)){ $("status").textContent="Notifications are not supported here."; return; }
  const permission=await Notification.requestPermission();
  $("status").textContent=permission==="granted"?"Notifications enabled.":"Notification permission was not granted.";
};

if(sessionStorage.getItem("unlocked")==="1")showDashboard();
startTimer();
