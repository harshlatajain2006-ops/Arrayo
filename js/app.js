const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const speedMs=v=>[900,650,450,280,140][Number(v)-1];
function parseArr(s){return s.split(',').map(x=>x.trim()).filter(x=>x!=='').map(x=>Number(x));}
function validArr(a){return a.length>0&&a.length<=15&&a.every(Number.isFinite)}
function addrFor(base,w,lb,i){return base+(i-lb)*w}
function logTo(id,text){const box=$(id);if(box.querySelector('.empty'))box.innerHTML='';const n=box.children.length+1;box.insertAdjacentHTML('beforeend',`<div class="log-item"><span class="log-num">${n}</span><span>${text}</span></div>`);box.scrollTop=box.scrollHeight}
function clearLog(id,msg){$(id).innerHTML=`<div class="empty">${msg}</div>`}
function status(id,msg,type='info'){const e=$(id);e.textContent=msg;e.className='status show '+type}
function cells(id,arr,meta={}) {
  const base=meta.base??1000,w=meta.w??4,lb=meta.lb??0,active=meta.active;
  const low=meta.low,mid=meta.mid,high=meta.high,target=meta.target,compare=meta.compare;
  $(id).innerHTML=`<div class="array"><div style="width:8px"></div>${arr.map((v,i)=>{
    let cls='cell';
    if(i===active)cls+=' active'; if(i===target)cls+=' target'; if(i===compare)cls+=' compare';
    if(i===low)cls+=' low'; if(i===mid)cls+=' mid'; if(i===high)cls+=' high';
    return `<div class="${cls}" data-i="${i}"><span class="idx">${lb+i}</span><span class="value">${v}</span><span class="addr">addr ${addrFor(base,w,lb,lb+i)}</span></div>`
  }).join('')}</div>`;
}
function setSpeedText(inputId,textId){const v=$(inputId).value;$(textId).textContent=['Slow','Low','Medium','Fast','Very fast'][v-1]}
['op','lin','bin'].forEach(p=>{ $(p+'Speed').addEventListener('input',()=>setSpeedText(p+'Speed',p+'SpeedText')); });

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open')}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.module').forEach(x=>x.classList.remove('active'));
 b.classList.add('active');$(b.dataset.tab).classList.add('active');
 if(window.innerWidth<=650)document.getElementById('sidebar').classList.remove('open');
});

function addressRender(){
 const base=Number($('aBase').value),w=Number($('aW').value),lb=Number($('aLB').value),idx=Number($('aIndex').value),len=Number($('aLen').value);
 const a=Array.from({length:Math.min(15,Math.max(1,len))},(_,i)=>lb+i);
 cells('aArray',a,{base,w,lb,target:(idx>=lb&&idx<lb+a.length)?idx-lb:undefined});
}
function addressStart(){
 const base=Number($('aBase').value),w=Number($('aW').value),lb=Number($('aLB').value),i=Number($('aIndex').value),len=Number($('aLen').value);
 if(![base,w,lb,i,len].every(Number.isFinite)||w<=0||len<1||len>15){status('aStatus','Please enter valid values. Array length must be 1–15 and element size must be positive.','bad');return}
 if(i<lb||i>lb+len-1){status('aStatus',`Index ${i} is outside the valid range ${lb} to ${lb+len-1}.`,'bad');$('aResult').textContent='—';return}
 const offset=i-lb,product=offset*w,result=base+product;
 $('aTarget').textContent=i;$('aResult').textContent=result;
 $('aFormula').innerHTML=`Address = Base + (i − LB) × w<br><span class="hl">= ${base} + (${i} − ${lb}) × ${w}</span><br><span class="hl">= ${base} + ${offset} × ${w}</span><br><span class="hl">= ${base} + ${product}</span><br><span class="ans">= ${result}</span>`;
 clearLog('aLog','');[['Formula','Address = Base + (i − LB) × w'],['Substitute',`${base} + (${i} − ${lb}) × ${w}`],['Offset',`i − LB = ${offset}`],['Byte offset',`${offset} × ${w} = ${product} bytes`],['Final address',`${base} + ${product} = ${result}`]].forEach(x=>logTo('aLog',`<b>${x[0]}:</b> ${x[1]}`));
 addressRender();status('aStatus',`Element at index ${i} is located at memory address ${result}.`,'good');
}
function addressReset(){['aBase','aW','aLB','aIndex','aLen'].forEach((id,i)=>$(id).value=[1000,4,0,3,7][i]);$('aTarget').textContent='—';$('aResult').textContent='—';$('aFormula').innerHTML='Address = Base + (i − LB) × w<br><span class="hl">Enter values and calculate to see the substitution.</span>';clearLog('aLog','No calculation yet.');status('aStatus','');addressRender()}
addressRender();

let op={arr:[],pos:0,value:null,type:'insert',phase:'idle',cursor:null,shifts:0,step:0};
function opRender(meta={}){cells('opArrayView',op.arr,{active:meta.active,compare:meta.compare});$('opShifts').textContent=op.shifts;$('opStepNo').textContent=op.step}
function opStart(){
 const a=parseArr($('opArray').value),type=$('opType').value,pos=Number($('opPos').value),value=Number($('opValue').value);
 if(!validArr(a)){status('opStatus','Enter 1–15 numeric elements separated by commas.','bad');return}
 if(!Number.isInteger(pos)){status('opStatus','Position must be an integer.','bad');return}
 if(type==='insert'&&(pos<0||pos>a.length||a.length>=15)){status('opStatus',a.length>=15?'Overflow: the array already has 15 elements.':'Invalid insertion position. Use 0 through '+a.length+'.','bad');return}
 if(type==='delete'&&(pos<0||pos>=a.length)){status('opStatus','Invalid deletion position. Use 0 through '+(a.length-1)+'.','bad');return}
 if(type==='insert'&&!Number.isFinite(value)){status('opStatus','Enter a numeric value to insert.','bad');return}
 op={arr:a.slice(),pos,value,type,phase:type==='insert'?'shift':'shift',cursor:type==='insert'?a.length-1:pos+1,shifts:0,step:0};
 clearLog('opLog','');opRender();status('opStatus',type==='insert'?'Insertion prepared. Press Step or let Start animate the shifts.':'Deletion prepared. Press Step or let Start animate the shifts.','info');
 $('opExplain').innerHTML=type==='insert'?`To insert <b>${value}</b> at position ${pos}, elements from the end down to position ${pos} move one place right.`:`To delete the element at position ${pos}, elements after it move one place left.`;
 autoOp();
}
async function autoOp(){while(op.phase!=='done'&&op.phase!=='idle'){await sleep(speedMs($('opSpeed').value));if(op.phase!=='done')opStep(true)}}
function opStep(fromAuto=false){
 if(op.phase==='idle'||op.phase==='done')return;
 if(op.type==='insert'){
   if(op.cursor>=op.pos){op.arr[op.cursor+1]=op.arr[op.cursor];op.shifts++;op.step++;logTo('opLog',`Shift: index ${op.cursor} → ${op.cursor+1}.`);opRender({active:op.cursor+1});op.cursor--;return}
   op.arr[op.pos]=op.value;op.step++;logTo('opLog',`Place ${op.value} at index ${op.pos}. Insertion complete.`);opRender({active:op.pos});op.phase='done';status('opStatus',`Insertion complete with ${op.shifts} shift${op.shifts===1?'':'s'}.`,'good');
 }else{
   if(op.cursor<op.arr.length){op.arr[op.cursor-1]=op.arr[op.cursor];op.shifts++;op.step++;logTo('opLog',`Shift: index ${op.cursor} → ${op.cursor-1}.`);opRender({active:op.cursor-1});op.cursor++;return}
   op.arr.pop();op.step++;logTo('opLog',`Remove the duplicate last slot. Deletion complete.`);opRender({active:op.pos});op.phase='done';status('opStatus',`Deletion complete with ${op.shifts} shift${op.shifts===1?'':'s'}.`,'good')
 }
}
function opReset(){op={arr:parseArr($('opArray').value),pos:0,value:null,type:'insert',phase:'idle',cursor:null,shifts:0,step:0};opRender();clearLog('opLog','No operation started.');$('opExplain').textContent='Configure the operation and press Start.';status('opStatus','')}
opReset();

let lin={arr:[],key:0,i:0,comp:0,phase:'idle'};
function linRender(active){cells('linArrayView',lin.arr,{active});$('linComp').textContent=lin.comp}
function linStart(){
 const a=parseArr($('linArray').value),key=Number($('linKey').value);
 if(!validArr(a)||!Number.isFinite(key)){status('linStatus','Enter 1–15 numeric elements and a numeric key.','bad');return}
 lin={arr:a,key,i:0,comp:0,phase:'run'};clearLog('linLog','');linRender();$('linResult').textContent='—';$('linExplain').textContent='Scan starts at index 0.';status('linStatus','Search prepared. Press Step or Start will scan automatically.','info');autoLin()
}
async function autoLin(){while(lin.phase==='run'){await sleep(speedMs($('linSpeed').value));linStep(true)}}
function linStep(){
 if(lin.phase!=='run')return;
 const v=lin.arr[lin.i];lin.comp++;linRender(lin.i);
 if(v===lin.key){lin.phase='done';$('linResult').textContent=`Found @ ${lin.i}`;$('linExplain').innerHTML=`<b>${lin.key}</b> equals the current element. Search successful.`;logTo('linLog',`Compare index ${lin.i}: ${v} = ${lin.key} → found.`);status('linStatus',`Found ${lin.key} at index ${lin.i} after ${lin.comp} comparison${lin.comp===1?'':'s'}.`,'good')}
 else {logTo('linLog',`Compare index ${lin.i}: ${v} ≠ ${lin.key} → continue.`);$('linExplain').innerHTML=`Compare <b>${v}</b> with <b>${lin.key}</b>: not equal, so move to the next index.`;lin.i++;if(lin.i>=lin.arr.length){lin.phase='done';$('linResult').textContent='Not found';status('linStatus',`Key ${lin.key} was not found after ${lin.comp} comparisons.`,'warn')}}
}
function linReset(){lin={arr:parseArr($('linArray').value),key:Number($('linKey').value),i:0,comp:0,phase:'idle'};linRender();$('linResult').textContent='—';$('linExplain').textContent='Press Start to prepare the scan.';clearLog('linLog','No search started.');status('linStatus','')}

let bin={arr:[],key:0,low:0,high:-1,mid:-1,comp:0,phase:'idle'};
function isSorted(a){return a.every((v,i)=>i===0||a[i-1]<=v)}
function binRender(){cells('binArrayView',bin.arr,{low:bin.low,mid:bin.mid,high:bin.high});$('binComp').textContent=bin.comp}
function binStart(){
 const raw=parseArr($('binArray').value),key=Number($('binKey').value);
 if(!validArr(raw)||!Number.isFinite(key)){status('binStatus','Enter 1–15 numeric elements and a numeric key.','bad');return}
 if(!isSorted(raw)&&$('binMode').value==='warn'){status('binStatus','The array is unsorted. Enable auto-sort or provide an ascending array.','bad');return}
 let a=raw.slice(),sorted=!isSorted(a);if(sorted)a.sort((x,y)=>x-y);
 bin={arr:a,key,low:0,high:a.length-1,mid:-1,comp:0,phase:'run'};
 clearLog('binLog','');binRender();$('binResult').textContent='—';
 $('binExplain').innerHTML=sorted?`Array auto-sorted: <b>${a.join(', ')}</b>`:'Array is already sorted.';
 status('binStatus',sorted?'Input was unsorted, so it was automatically sorted before searching.':'Sorted array ready.','info');autoBin()
}
async function autoBin(){while(bin.phase==='run'){await sleep(speedMs($('binSpeed').value));binStep(true)}}
function binStep(){
 if(bin.phase!=='run')return;
 if(bin.low>bin.high){bin.phase='done';$('binResult').textContent='Not found';status('binStatus',`Key ${bin.key} was not found after ${bin.comp} comparisons.`,'warn');return}
 bin.mid=Math.floor((bin.low+bin.high)/2);const v=bin.arr[bin.mid];bin.comp++;binRender();
 if(v===bin.key){bin.phase='done';$('binResult').textContent=`Found @ ${bin.mid}`;$('binExplain').innerHTML=`<b>mid = ${bin.mid}</b>: ${v} equals ${bin.key}, so the key is found.`;logTo('binLog',`low=${bin.low}, mid=${bin.mid}, high=${bin.high}: ${v} = ${bin.key} → found.`);status('binStatus',`Found ${bin.key} at index ${bin.mid} after ${bin.comp} comparison${bin.comp===1?'':'s'}.`,'good')}
 else if(v<bin.key){logTo('binLog',`low=${bin.low}, mid=${bin.mid}, high=${bin.high}: ${v} < ${bin.key} → discard left half.`);$('binExplain').innerHTML=`<b>${v} &lt; ${bin.key}</b>, so set <b>low = mid + 1</b>.`;bin.low=bin.mid+1;binRender()}
 else {logTo('binLog',`low=${bin.low}, mid=${bin.mid}, high=${bin.high}: ${v} > ${bin.key} → discard right half.`);$('binExplain').innerHTML=`<b>${v} &gt; ${bin.key}</b>, so set <b>high = mid − 1</b>.`;bin.high=bin.mid-1;binRender()}
}
function binReset(){bin={arr:parseArr($('binArray').value).slice().sort((a,b)=>a-b),key:Number($('binKey').value),low:0,high:-1,mid:-1,comp:0,phase:'idle'};binRender();$('binResult').textContent='—';$('binExplain').textContent='Press Start to prepare binary search.';clearLog('binLog','No search started.');status('binStatus','')}
binReset();

$('opType').addEventListener('change',()=>{$('valueField').style.display=$('opType').value==='insert'?'block':'none'});
