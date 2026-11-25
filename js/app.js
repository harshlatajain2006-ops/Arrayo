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

const sidebar=$('sidebar'),app=document.querySelector('.app'),menuButton=$('menuBtn');
const viewportMode=()=>window.innerWidth<=650?'mobile':window.innerWidth<=1000?'compact':'desktop';
let currentViewportMode=viewportMode();
function syncSidebarButton(){
 const expanded=currentViewportMode==='mobile'?sidebar.classList.contains('open'):currentViewportMode==='compact'?app.classList.contains('nav-expanded'):!app.classList.contains('nav-collapsed');
 menuButton.setAttribute('aria-expanded',String(expanded));
 menuButton.setAttribute('aria-label',expanded?'Collapse navigation':'Expand navigation');
 menuButton.title=expanded?'Collapse navigation':'Expand navigation';
 $('sidebarOverlay').setAttribute('aria-hidden',String(currentViewportMode!=='mobile'||!expanded));
}
function closeMobileSidebar(returnFocus=false){
 sidebar.classList.remove('open');syncSidebarButton();
 if(returnFocus)menuButton.focus();
}
function toggleSidebar(){
 if(currentViewportMode==='mobile')sidebar.classList.toggle('open');
 else if(currentViewportMode==='compact')app.classList.toggle('nav-expanded');
 else app.classList.toggle('nav-collapsed');
 syncSidebarButton();
}
menuButton.addEventListener('click',toggleSidebar);
$('sidebarOverlay').addEventListener('click',()=>closeMobileSidebar(true));
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&currentViewportMode==='mobile'&&sidebar.classList.contains('open'))closeMobileSidebar(true);
});
window.addEventListener('resize',()=>{
 const nextMode=viewportMode();
 if(nextMode!==currentViewportMode){
  currentViewportMode=nextMode;sidebar.classList.remove('open');app.classList.remove('nav-collapsed','nav-expanded');
 }
 syncSidebarButton();
});
document.querySelectorAll('.tab').forEach(b=>{
 const label=b.querySelector('.nav-text').textContent.trim();
 b.setAttribute('aria-label',label);b.title=label;
 if(b.classList.contains('active'))b.setAttribute('aria-current','page');
 b.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current')});
  document.querySelectorAll('.module').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');b.setAttribute('aria-current','page');$(b.dataset.tab).classList.add('active');
  if(currentViewportMode==='mobile')closeMobileSidebar();
 });
});
syncSidebarButton();

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

const sortDetails={
 selection:{title:'Selection sort',text:'Find the smallest remaining value and place it at the front.',complexity:'Time: O(n<sup>2</sup>) &middot; Space: O(1)'},
 bubble:{title:'Bubble sort',text:'Compare neighbors and swap them until the largest values bubble to the end.',complexity:'Time: O(n<sup>2</sup>) &middot; Space: O(1)'},
 insertion:{title:'Insertion sort',text:'Take the next value and shift larger values right to insert it in order.',complexity:'Time: O(n<sup>2</sup>) &middot; Space: O(1)'},
 quick:{title:'Quick sort',text:'Partition around a pivot, then recursively sort the values on either side.',complexity:'Average: O(n log n), worst: O(n<sup>2</sup>) &middot; Space: O(log n)'},
 merge:{title:'Merge sort',text:'Split the array into halves, then merge the sorted halves back together.',complexity:'Time: O(n log n) &middot; Space: O(n)'},
 shell:{title:'Shell sort',text:'Use progressively smaller gaps to move out-of-place values toward their positions.',complexity:'Worst: O(n<sup>2</sup>) &middot; Space: O(1)'},
 radix:{title:'Radix sort',text:'Distribute integers by digit, one place at a time; negative values are handled too.',complexity:'Time: O(d(n + b)) &middot; Space: O(n + b)'}
};
let sortState={frames:[],cursor:0,phase:'idle',token:0};
function sortSetInfo(){
 const info=sortDetails[$('sortAlgorithm').value];
 $('sortInfoTitle').textContent=info.title;$('sortInfoText').textContent=info.text;$('sortComplexity').innerHTML=info.complexity;
}
function sortMascotSay(message,pose='is-ready'){
 const mascot=$('sortMascot');
 mascot.classList.remove('is-ready','is-thinking','is-moving','is-cheering');
 mascot.classList.add(pose);$('sortMascotText').textContent=message;
}
function sortMascotForFrame(message){
 if(message.includes('Sorting complete'))sortMascotSay('All sorted! You did it. Try another algorithm?','is-cheering');
 else if(/digit pass/i.test(message))sortMascotSay('Sorting by digit—watch the values find their buckets.','is-thinking');
 else if(/compare/i.test(message))sortMascotSay('Let’s compare the highlighted values. What do you think happens next?','is-thinking');
 else if(/swap|shift|place|insert|move|merge|copy/i.test(message))sortMascotSay('Nice move! Watch how the values find their place.','is-moving');
 else sortMascotSay('One step at a time—follow the highlighted bars.','is-ready');
}
function sortMascotHint(){
 let message;
 if(sortState.phase==='idle')message='Choose a sorting method and press Prepare to get started.';
 else if(sortState.phase==='done')message='Great work! Pick another algorithm and compare how it sorts.';
 else if(sortState.phase==='playing')message='Follow the highlighted bars to see which values are being compared or moved.';
 else message='Use Step to inspect one operation, or Play to watch the full animation.';
 sortMascotSay(message,'is-thinking');
}
function sortRender(arr,meta={}){
 const bars=$('sortBars'),maxAbs=Math.max(1,...arr.map(v=>Math.abs(v)));
 bars.innerHTML=arr.map((value,index)=>{
  const classes=['sort-column'];
  if(meta.sorted&&meta.sorted.includes(index))classes.push('is-sorted');
  if(meta.compare&&meta.compare.includes(index))classes.push('is-compare');
  if(meta.move&&meta.move.includes(index))classes.push('is-move');
  const height=22+Math.round(Math.abs(value)/maxAbs*88);
  return `<div class="${classes.join(' ')}" aria-label="Index ${index}, value ${value}"><span class="sort-value">${value}</span><div class="sort-bar" style="height:${height}px"></div><span class="sort-index">${index}</span></div>`;
 }).join('');
 $('sortComparisons').textContent=meta.comparisons||0;
 $('sortWrites').textContent=meta.writes||0;
 $('sortStepNo').textContent=`${sortState.cursor} / ${Math.max(0,sortState.frames.length-1)}`;
}
function sortMakeFrames(input,algorithm){
 const arr=input.slice(),frames=[];
 let comparisons=0,writes=0,swaps=0;
 const record=(message,compare=[],move=[],sorted=[])=>frames.push({arr:arr.slice(),message,compare,move,sorted,comparisons,writes,swaps});
 const swap=(i,j)=>{
  if(i===j)return false;
  [arr[i],arr[j]]=[arr[j],arr[i]];swaps++;writes+=2;return true;
 };
 record(`Starting ${sortDetails[algorithm].title.toLowerCase()} with [${arr.join(', ')}].`);
 if(algorithm==='selection'){
  for(let i=0;i<arr.length-1;i++){
   let min=i;
   for(let j=i+1;j<arr.length;j++){
    comparisons++;record(`Compare ${arr[j]} at index ${j} with the current minimum ${arr[min]} at index ${min}.`,[j,min],[min],Array.from({length:i},(_,k)=>k));
    if(arr[j]<arr[min])min=j;
   }
   if(swap(i,min))record(`Swap ${arr[i]} with ${arr[min]} to place the next smallest value at index ${i}.`,[],[i,min],Array.from({length:i+1},(_,k)=>k));
   else record(`${arr[i]} is already the smallest remaining value.`,[],[i],Array.from({length:i+1},(_,k)=>k));
  }
 }else if(algorithm==='bubble'){
  for(let end=arr.length-1;end>0;end--){
   let changed=false;
   for(let j=0;j<end;j++){
    comparisons++;record(`Compare neighboring values ${arr[j]} and ${arr[j+1]}.`,[j,j+1]);
    if(arr[j]>arr[j+1]){swap(j,j+1);changed=true;record(`Swap them: ${arr[j]} and ${arr[j+1]} are now in ascending order.`,[],[j,j+1])}
   }
   if(!changed){record('No swaps in this pass; the array is already sorted.',[],[],Array.from({length:arr.length},(_,k)=>k));break}
   record(`Pass complete: index ${end} is now in its final position.`,[],[],Array.from({length:arr.length-end},(_,k)=>end+k));
  }
 }else if(algorithm==='insertion'){
  for(let i=1;i<arr.length;i++){
   const key=arr[i];let j=i-1;
   while(j>=0){
    comparisons++;record(`Compare ${arr[j]} at index ${j} with the held value ${key}.`,[j],[i]);
    if(arr[j]<=key)break;
    arr[j+1]=arr[j];writes++;record(`Shift ${arr[j]} one place right.`,[],[j,j+1]);j--;
   }
   arr[j+1]=key;writes++;record(`Insert ${key} at index ${j+1}.`,[],[j+1]);
  }
 }else if(algorithm==='quick'){
  const partition=(low,high)=>{
   const pivot=arr[high];let boundary=low;
   for(let j=low;j<high;j++){
    comparisons++;record(`Compare ${arr[j]} with pivot ${pivot} at index ${high}.`,[j],[high]);
    if(arr[j]<=pivot){
     if(boundary!==j){swap(boundary,j);record(`Move ${arr[boundary]} into the left partition.`,[],[boundary,j])}
     boundary++;
    }
   }
   if(swap(boundary,high))record(`Place pivot ${arr[boundary]} at its final index ${boundary}.`,[],[boundary]);
   else record(`Pivot ${pivot} is already at its final index ${boundary}.`,[],[boundary]);
   return boundary;
  };
  const quick=(low,high)=>{
   if(low>=high)return;
   const pivot=partition(low,high);quick(low,pivot-1);quick(pivot+1,high);
  };
  quick(0,arr.length-1);
 }else if(algorithm==='merge'){
  const mergeSort=(left,right)=>{
   if(left>=right)return;
   const mid=Math.floor((left+right)/2);mergeSort(left,mid);mergeSort(mid+1,right);
   const first=arr.slice(left,mid+1),second=arr.slice(mid+1,right+1);let i=0,j=0,k=left;
   while(i<first.length&&j<second.length){
    comparisons++;
    if(first[i]<=second[j])arr[k]=first[i++];
    else arr[k]=second[j++];
    writes++;record(`Merge into index ${k}; place ${arr[k]} from the two sorted halves.`,[],[k]);k++;
   }
   while(i<first.length){arr[k]=first[i++];writes++;record(`Copy ${arr[k]} from the left half into index ${k}.`,[],[k]);k++}
   while(j<second.length){arr[k]=second[j++];writes++;record(`Copy ${arr[k]} from the right half into index ${k}.`,[],[k]);k++}
   record(`Merged indices ${left} through ${right}.`);
  };
  mergeSort(0,arr.length-1);
 }else if(algorithm==='shell'){
  for(let gap=Math.floor(arr.length/2);gap>0;gap=Math.floor(gap/2)){
   for(let i=gap;i<arr.length;i++){
    const key=arr[i];let j=i;
    while(j>=gap){
     comparisons++;record(`Compare ${arr[j-gap]} at index ${j-gap} with ${key}, using gap ${gap}.`,[j-gap],[i]);
     if(arr[j-gap]<=key)break;
     arr[j]=arr[j-gap];writes++;record(`Shift ${arr[j]} from index ${j-gap} to ${j}.`,[],[j-gap,j]);j-=gap;
    }
    arr[j]=key;writes++;record(`Place ${key} at index ${j} for gap ${gap}.`,[],[j]);
   }
  }
 }else if(algorithm==='radix'){
  if(!arr.every(Number.isSafeInteger))return null;
  const negative=arr.filter(v=>v<0),positive=arr.filter(v=>v>=0);
  const maxAbs=Math.max(0,...arr.map(Math.abs));let place=1;
  do{
   const distribute=(values,descending)=>{
    const buckets=Array.from({length:10},()=>[]);
    values.forEach(value=>buckets[Math.floor(Math.abs(value)/place)%10].push(value));
    const order=descending?[9,8,7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7,8,9];
    return order.flatMap(digit=>buckets[digit]);
   };
   const sortedNegative=distribute(negative,true),sortedPositive=distribute(positive,false);
   arr.splice(0,arr.length,...sortedNegative,...sortedPositive);writes+=arr.length;
   record(`Stable digit pass at place ${place}: negatives use descending digit order, then non-negative values use ascending order.`,[],Array.from({length:arr.length},(_,k)=>k));
   place*=10;
  }while(Math.floor(maxAbs/place)>0);
 }
 record('Sorting complete. The array is in ascending order.',[],[],Array.from({length:arr.length},(_,k)=>k));
 return frames;
}
function sortPrepare(){
 const arr=parseArr($('sortArray').value),algorithm=$('sortAlgorithm').value;
 if(!validArr(arr)){status('sortStatus','Enter 1–15 finite numeric values separated by commas.','bad');return}
 if(algorithm==='radix'&&!arr.every(Number.isSafeInteger)){status('sortStatus','Radix sort requires whole numbers within the safe integer range.','bad');return}
 const frames=sortMakeFrames(arr,algorithm);
 if(!frames){status('sortStatus','Could not prepare this sort for the supplied values.','bad');return}
 sortState={frames,cursor:0,phase:'ready',token:sortState.token+1};
 clearLog('sortLog','');sortRender(frames[0].arr,frames[0]);
 $('sortExplain').textContent=frames[0].message;
 sortMascotSay('Ready! Tap Step or Play and I’ll follow along.','is-ready');
 $('sortPlay').textContent='Play';
 status('sortStatus',`${sortDetails[algorithm].title} prepared with ${frames.length-1} steps. Press Step or Play to begin.`,'info');
}
function sortStep(){
 if(sortState.phase==='idle'||sortState.cursor>=sortState.frames.length-1)return;
 sortState.cursor++;const frame=sortState.frames[sortState.cursor];
 sortRender(frame.arr,frame);$('sortExplain').textContent=frame.message;logTo('sortLog',frame.message);
 sortMascotForFrame(frame.message);
 if(sortState.cursor===sortState.frames.length-1){
  sortState.phase='done';$('sortPlay').textContent='Play';
  status('sortStatus',`Sorted ${frame.arr.length} values in ${sortState.cursor} steps (${frame.comparisons} comparisons, ${frame.writes} writes).`,'good');
 }
}
async function sortPlay(){
 if(sortState.phase==='playing'){
  sortState.phase='paused';sortState.token++;$('sortPlay').textContent='Play';status('sortStatus','Animation paused. Use Step or Play to continue.','info');return;
 }
 if(sortState.phase==='idle'){sortPrepare();if(sortState.phase==='idle')return}
 if(sortState.cursor>=sortState.frames.length-1)return;
 sortState.phase='playing';const token=++sortState.token;$('sortPlay').textContent='Pause';status('sortStatus','Animation playing. Use Pause, Step, or Reset to control playback.','info');sortMascotSay('Watch the bars—I’ll keep an eye on each step.','is-moving');
 while(sortState.phase==='playing'&&sortState.token===token&&sortState.cursor<sortState.frames.length-1){
  await sleep(speedMs($('sortSpeed').value));
  if(sortState.phase==='playing'&&sortState.token===token)sortStep();
 }
 if(sortState.phase==='playing'&&sortState.token===token){sortState.phase='ready';$('sortPlay').textContent='Play'}
}
function sortReset(){
 sortState={frames:[],cursor:0,phase:'idle',token:sortState.token+1};
 $('sortPlay').textContent='Play';$('sortExplain').innerHTML='Choose an algorithm and press <b>Prepare</b> to create its step-by-step trace.';
 clearLog('sortLog','No sort prepared.');sortRender(parseArr($('sortArray').value));status('sortStatus','');sortMascotSay('Ready when you are! Choose a sort and press Prepare.','is-ready');
}
function sortRandomize(){
 const values=Array.from({length:8},()=>Math.floor(Math.random()*91)-20);
 $('sortArray').value=values.join(',');sortReset();
}
$('sortStart').addEventListener('click',sortPrepare);
$('sortStep').addEventListener('click',sortStep);
$('sortPlay').addEventListener('click',sortPlay);
$('sortReset').addEventListener('click',sortReset);
$('sortRandom').addEventListener('click',sortRandomize);
$('sortMascot').addEventListener('click',sortMascotHint);
$('sortAlgorithm').addEventListener('change',()=>{sortSetInfo();sortReset()});
$('sortSpeed').addEventListener('input',()=>setSpeedText('sortSpeed','sortSpeedText'));
sortSetInfo();setSpeedText('sortSpeed','sortSpeedText');sortReset();
