(() => {
  const Q = window.CEE_QUESTIONS || [];
  const subjects = [
    ['All', 200, 'Every question'], ['Physics', 50, 'Questions 1–50'], ['Chemistry', 50, 'Questions 51–100'],
    ['Zoology', 40, 'Questions 101–140'], ['Botany', 40, 'Questions 141–180'], ['MAT', 20, 'Questions 181–200']
  ];
  const state = {subject:'All', status:'all', reviewed:new Set(JSON.parse(localStorage.getItem('cee-reviewed')||'[]')), difficult:new Set(JSON.parse(localStorage.getItem('cee-difficult')||'[]'))};
  let practiceIndex=0, practiceRevealed=false, practiceSelected=null;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const save=()=>{localStorage.setItem('cee-reviewed',JSON.stringify([...state.reviewed]));localStorage.setItem('cee-difficult',JSON.stringify([...state.difficult]));};
  function renderSubjects(){
    $('#subjectCards').innerHTML=subjects.slice(1).map(([name,count,desc],i)=>`<button class="subject-card" data-subject="${name}"><span class="num">0${i+1}</span><h3>${name}</h3><p>${count} questions · ${desc}</p></button>`).join('');
    $$('.subject-card').forEach(b=>b.onclick=()=>{state.subject=b.dataset.subject;renderAll();location.hash='questions';});
  }
  function renderFilters(){
    $('#filters').innerHTML=subjects.map(([name])=>`<button class="filter ${state.subject===name?'active':''}" data-filter="${name}">${name}</button>`).join('');
    $$('.filter').forEach(b=>b.onclick=()=>{state.subject=b.dataset.filter;renderAll();});
  }
  function filtered(){return Q.filter(q=>state.subject==='All'||q.subject===state.subject).filter(q=>state.status==='all'||(state.status==='reviewed'?state.reviewed.has(q.number):state.status==='unreviewed'?!state.reviewed.has(q.number):state.difficult.has(q.number)));}
  function visualFor(n){return n>=196&&n<=200?`<div class="visual"><img src="assets/q${n}.png" alt="Original exam visual for question ${n}"></div>`:''}
  function card(q){
    const reviewed=state.reviewed.has(q.number), difficult=state.difficult.has(q.number), answer=q.answer;
    const opts=q.options?.length?`<div class="options">${q.options.map(o=>`<div class="option ${answer===o.key?'correct':''}"><b>${o.key.toUpperCase()}</b>${esc(o.text)}</div>`).join('')}</div>`:'';
    const solution=answer?`<div class="solution"><div class="solution-head"><strong>Supplied solution</strong><span class="answer-chip">Correct option: ${answer.toUpperCase()}${q.answerText&&q.options.length?' — '+esc(q.answerText):''}</span></div>${q.explanation?`<p>${esc(q.explanation)}</p>`:`<p>The supplied solution file does not provide an explanation for this question.</p>`}</div>`:`<div class="solution"><div class="solution-head"><strong>Solution status</strong><span class="answer-chip">Not supplied</span></div><p>The hints and solutions PDF does not provide a usable answer for this question, so it is intentionally left unresolved.</p></div>`;
    return `<article class="question-card" id="q-${q.number}" data-number="${q.number}"><div class="q-top"><span class="q-number">${q.number}</span><span class="q-subject">${q.subject}</span></div><div class="q-stem">${esc(q.stem)}</div>${opts}${visualFor(q.number)}<div class="q-actions"><button class="small-btn reveal">Show solution</button><button class="small-btn review">${reviewed?'Reviewed':'Mark reviewed'}</button><button class="small-btn difficult">${difficult?'Needs review':'Flag'}</button></div>${solution}</article>`;
  }
  function renderQuestions(){
    const list=filtered(); $('#questionList').innerHTML=list.map(card).join('')||`<div class="question-card"><strong>No questions match this filter.</strong></div>`;
    $('#countLabel').textContent=`${list.length} question${list.length===1?'':'s'}`;
    $('#progressLabel').textContent=`${state.reviewed.size} reviewed`;
    $('#questionIndex').innerHTML=list.map(q=>`<button class="q-index ${state.reviewed.has(q.number)?'reviewed':''}" data-q="${q.number}">${q.number}</button>`).join('');
    $$('.q-index').forEach(b=>b.onclick=()=>document.getElementById('q-'+b.dataset.q)?.scrollIntoView({behavior:'smooth',block:'start'}));
    $$('.reveal').forEach(b=>b.onclick=()=>{const c=b.closest('.question-card');c.classList.toggle('open');b.textContent=c.classList.contains('open')?'Hide solution':'Show solution';});
    $$('.review').forEach(b=>b.onclick=()=>{const n=+b.closest('.question-card').dataset.number;if(state.reviewed.has(n))state.reviewed.delete(n);else state.reviewed.add(n);save();renderQuestions();});
    $$('.difficult').forEach(b=>b.onclick=()=>{const n=+b.closest('.question-card').dataset.number;if(state.difficult.has(n))state.difficult.delete(n);else state.difficult.add(n);save();renderQuestions();});
  }
  function renderAll(){renderFilters();renderQuestions();}
  function esc(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function openSearch(){ $('#searchOverlay').classList.remove('hidden');$('#searchInput').focus(); }
  function search(){const term=$('#searchInput').value.trim().toLowerCase();const out=$('#searchResults');if(!term){out.innerHTML='<div class="search-result"><small>Search</small><div>Type a subject, question, answer, or explanation.</div></div>';return}const res=Q.filter(q=>[q.stem,q.subject,q.answerText,q.explanation].join(' ').toLowerCase().includes(term)).slice(0,20);out.innerHTML=res.length?res.map(q=>`<div class="search-result" data-n="${q.number}"><small>${q.subject} · Question ${q.number}</small><div>${esc(q.stem.slice(0,180))}${q.stem.length>180?'…':''}</div></div>`).join(''):'<div class="search-result"><div>No matching questions.</div></div>';$$('.search-result[data-n]').forEach(x=>x.onclick=()=>{state.subject='All';renderAll();$('#searchOverlay').classList.add('hidden');setTimeout(()=>{const el=$('#q-'+x.dataset.n);el?.scrollIntoView({behavior:'smooth'});el?.classList.add('highlight');setTimeout(()=>el?.classList.remove('highlight'),1500)},50)});}
  function practiceItems(){return filtered().length?filtered():Q;}
  function renderPractice(){const arr=practiceItems();if(practiceIndex>=arr.length)practiceIndex=0;const q=arr[practiceIndex];$('#practiceSubject').textContent=q.subject;$('#practiceCounter').textContent=`${practiceIndex+1} / ${arr.length}`;$('#practiceContent').innerHTML=`<div class="practice-question"><div class="q-top"><span class="q-number">Question ${q.number}</span></div><div class="q-stem">${esc(q.stem)}</div>${q.options.length?`<div class="practice-options">${q.options.map(o=>`<button class="practice-option ${practiceSelected===o.key?'selected':''} ${practiceRevealed&&q.answer===o.key?'correct':''}" data-key="${o.key}"><b>${o.key.toUpperCase()}.</b> ${esc(o.text)}</button>`).join('')}</div>`:''}${practiceRevealed?`<div class="practice-solution"><strong>Answer: ${q.answer?q.answer.toUpperCase():'Not supplied'}</strong><p>${esc(q.explanation||'No explanation is supplied for this question.')}</p>${visualFor(q.number)}</div>`:''}</div>`;$$('.practice-option').forEach(b=>b.onclick=()=>{practiceSelected=b.dataset.key;renderPractice()});}
  function openPractice(){practiceIndex=0;practiceRevealed=false;practiceSelected=null;$('#practiceModal').classList.remove('hidden');renderPractice();}
  $('#startBtn').onclick=()=>{state.subject='All';renderAll();location.hash='questions';};$('#randomBtn').onclick=()=>{const arr=filtered();if(!arr.length)return;const q=arr[Math.floor(Math.random()*arr.length)];document.getElementById('q-'+q.number)?.scrollIntoView({behavior:'smooth'});};$('#practiceBtn').onclick=openPractice;$('#searchBtn').onclick=openSearch;$('#closeSearch').onclick=()=>$('#searchOverlay').classList.add('hidden');$('#searchInput').oninput=search;$('#statusFilter').onchange=e=>{state.status=e.target.value;renderQuestions()};$('#closePractice').onclick=()=>$('#practiceModal').classList.add('hidden');$('#revealPractice').onclick=()=>{practiceRevealed=!practiceRevealed;renderPractice()};$('#prevPractice').onclick=()=>{practiceIndex=(practiceIndex-1+practiceItems().length)%practiceItems().length;practiceRevealed=false;practiceSelected=null;renderPractice()};$('#nextPractice').onclick=()=>{practiceIndex=(practiceIndex+1)%practiceItems().length;practiceRevealed=false;practiceSelected=null;renderPractice()};$('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('cee-theme',document.body.classList.contains('dark')?'dark':'light')};if(localStorage.getItem('cee-theme')==='dark')document.body.classList.add('dark');document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape'){ $('#searchOverlay').classList.add('hidden');$('#practiceModal').classList.add('hidden')}});
  renderSubjects();renderAll();
})();
