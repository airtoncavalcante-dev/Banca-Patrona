const BICHOS = [
  {id:1,nome:'AVESTRUZ',dezenas:'01-04',img:'01.jpg'},
  {id:2,nome:'ÁGUIA',dezenas:'05-08',img:'02.jpg'},
  {id:3,nome:'BURRO',dezenas:'09-12',img:'03.jpg'},
  {id:4,nome:'BORBOLETA',dezenas:'13-16',img:'04.jpg'},
  {id:5,nome:'CACHORRO',dezenas:'17-20',img:'05.jpg'},
  {id:6,nome:'CABRA',dezenas:'21-24',img:'06.jpg'},
  {id:7,nome:'CARNEIRO',dezenas:'25-28',img:'07.jpg'},
  {id:8,nome:'CAMELO',dezenas:'29-32',img:'08.jpg'},
  {id:9,nome:'COBRA',dezenas:'33-36',img:'09.jpg'},
  {id:10,nome:'COELHO',dezenas:'37-40',img:'10.jpg'},
  {id:11,nome:'CAVALO',dezenas:'41-44',img:'11.jpg'},
  {id:12,nome:'ELEFANTE',dezenas:'45-48',img:'12.jpg'},
  {id:13,nome:'GALO',dezenas:'49-52',img:'13.jpg'},
  {id:14,nome:'GATO',dezenas:'53-56',img:'14.jpg'},
  {id:15,nome:'JACARÉ',dezenas:'57-60',img:'15.jpg'},
  {id:16,nome:'LEÃO',dezenas:'61-64',img:'16.jpg'},
  {id:17,nome:'MACACO',dezenas:'65-68',img:'17.jpg'},
  {id:18,nome:'PORCO',dezenas:'69-72',img:'18.jpg'},
  {id:19,nome:'PAVÃO',dezenas:'73-76',img:'19.jpg'},
  {id:20,nome:'PERU',dezenas:'77-80',img:'20.jpg'},
  {id:21,nome:'TOURO',dezenas:'81-84',img:'21.jpg'},
  {id:22,nome:'TIGRE',dezenas:'85-88',img:'22.jpg'},
  {id:23,nome:'URSO',dezenas:'89-92',img:'23.jpg'},
  {id:24,nome:'VEADO',dezenas:'93-96',img:'24.jpg'},
  {id:25,nome:'VACA',dezenas:'97-00',img:'25.jpg'},
];

const MODOS = [
  {nome:'GRUPO',sub:'Bicho Simples',desc:'Escolha 1 animal. Cada bicho vale 4 dezenas. Ganha se o grupo for sorteado do 1º ao 5º prêmio.',paga:18,placeholder:''},
  {nome:'DEZENA',sub:'00-99',desc:'Digite uma dezena de 00 a 99. Ganha se os 2 últimos dígitos do 1º prêmio baterem.',paga:60,placeholder:'Ex: 32'},
  {nome:'CENTENA',sub:'000-999',desc:'3 dígitos exatos. Pagamento maior pela dificuldade.',paga:600,placeholder:'Ex: 432'},
  {nome:'MILHAR',sub:'0000-9999',desc:'4 dígitos exatos do 1º prêmio. Maior pagamento.',paga:4000,placeholder:'Ex: 2432'},
  {nome:'DUQUE DE GRUPO',sub:'2 Grupos',desc:'Escolha 2 animais diferentes. Ganha se ambos forem sorteados do 1º ao 5º prêmio.',paga:180,placeholder:''},
];

// HORARIOS LOTEP PARAIBA
const HORARIOS = [
  {id:'10:45',label:'10:45',hora:10,min:45},
  {id:'12:45',label:'12:45',hora:12,min:45},
  {id:'15:45',label:'15:45',hora:15,min:45},
  {id:'18:05',label:'18:05',hora:18,min:5},
  {id:'20:40',label:'20:40',hora:20,min:40},
];

function getHoraBrasil(){
  const now = new Date();
  // Brasilia UTC-3
  const brasil = new Date(now.toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));
  return brasil;
}

function horarioPassou(h){
  const agora = getHoraBrasil();
  const agMin = agora.getHours()*60 + agora.getMinutes();
  const hMin = h.hora*60 + h.min;
  return agMin >= hMin;
}

let selectedBicho = null;
let selectedMode = 0;
let valor = 5;
let segundoBicho = null;
let horarioSelecionado = null;

// Render grid
const grid = document.getElementById('grid');
function renderGrid(){
  grid.innerHTML='';
  BICHOS.forEach(b=>{
    const card = document.createElement('div');
    card.className='card';
    const imgPath = `img/25-animais-do-jogo/${String(b.id).padStart(2,'0')}.jpg`;
    card.innerHTML = `
      <div class="card-badge">${String(b.id).padStart(2,'0')}</div>
      <img src="${imgPath}" alt="${b.nome}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200/1a1a1a/ffcc00?text=${b.nome}'">
      <div class="card-info"><strong>${b.nome}</strong><small>${b.dezenas}</small></div>
    `;
    card.onclick=()=>openModal(b);
    grid.appendChild(card);
  });
}
renderGrid();

// HORARIOS BOX
function renderHorarios(){
  const list = document.getElementById('horariosList');
  const info = document.getElementById('horariosInfo');
  list.innerHTML='';
  const agora = getHoraBrasil();
  let disponiveis = 0;
  HORARIOS.forEach(h=>{
    const passou = horarioPassou(h);
    if(!passou) disponiveis++;
    const btn = document.createElement('button');
    btn.className = 'horario-chip' + (passou ? ' disabled' : '');
    btn.textContent = h.label;
    if(!passou && !horarioSelecionado) horarioSelecionado = h.id;
    if(h.id===horarioSelecionado) btn.classList.add('active');
    btn.onclick=()=>{
      if(passou) return;
      horarioSelecionado = h.id;
      renderHorarios();
    };
    list.appendChild(btn);
  });
  info.textContent = `Agora em Brasília: ${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')} • ${disponiveis} horários disponíveis hoje. Após as 20:40 as apostas encerram.`;
}
renderHorarios();
setInterval(renderHorarios, 60000); // atualiza a cada minuto

// JACKPOT
let target = 237927.92;
let display = target;
const jackpotEl = document.getElementById('jackpotValue');
const barEl = document.getElementById('jackpotBar');
function formatBRL(v){ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) }
function animate(from,to){
  const start = performance.now();
  const dur = 1600;
  function step(now){
    const p = Math.min((now-start)/dur,1);
    const eased = 1 - Math.pow(1-p,3);
    const cur = from + (to-from)*eased;
    jackpotEl.textContent = formatBRL(cur);
    const pct = ((cur-231000)/(242000-231000))*100;
    barEl.style.width = Math.max(5,Math.min(100,pct))+'%';
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
setInterval(()=>{
  const delta = Math.floor(Math.random()*(1400-500+1))+500;
  const sign = Math.random()>0.5?1:-1;
  let next = target + sign*delta;
  if(next<231000) next = 231000 + Math.random()*900;
  if(next>242000) next = 242000 - Math.random()*900;
  const prev = target;
  target = Math.round(next*100)/100;
  animate(prev,target);
},30000);
animate(display,target);

// MODAL LOGIC
const overlay = document.getElementById('modalOverlay');
const modalTabs = document.getElementById('modalTabs');
const modalBody = document.getElementById('modalBody');
const modalBichoInfo = document.getElementById('modalBichoInfo');
const betBtn = document.getElementById('betBtn');

function openModal(bicho){
  selectedBicho = bicho;
  selectedMode = 0;
  segundoBicho = null;
  // se horarioSelecionado já passou, pega o próximo disponível
  const disponiveis = HORARIOS.filter(h=>!horarioPassou(h));
  if(disponiveis.length>0 && (!horarioSelecionado || horarioPassou(HORARIOS.find(h=>h.id===horarioSelecionado)))) {
    horarioSelecionado = disponiveis[0].id;
  }
  overlay.classList.add('open');
  modalBichoInfo.innerHTML = `<img src="img/25-animais-do-jogo/${String(bicho.id).padStart(2,'0')}.jpg" onerror="this.src='https://via.placeholder.com/100x100/1a1a1a/ffcc00?text=${bicho.nome}'"><div><b>${String(bicho.id).padStart(2,'0')} - ${bicho.nome}</b><br><small>Dezenas: ${bicho.dezenas}</small></div>`;
  renderModal();
}

function renderModal(){
  modalTabs.innerHTML='';
  MODOS.forEach((m,i)=>{
    const btn=document.createElement('button');
    btn.textContent = `${m.nome} • ${m.paga}x`;
    if(i===selectedMode) btn.className='active';
    btn.onclick=()=>{selectedMode=i;renderModal()};
    modalTabs.appendChild(btn);
  });

  const modo = MODOS[selectedMode];
  let html = `<div class="field"><label>${modo.nome} - ${modo.sub}</label><p style="font-size:11px;color:rgba(255,255,255,.5);margin-top:4px;line-height:1.4">${modo.desc}</p></div>`;

  // HORARIO DENTRO DA APOSTA
  html += `<div class="field"><label>ESCOLHA O HORÁRIO (LOTEP PB)</label><div class="horario-select">`;
  HORARIOS.forEach(h=>{
    const passou = horarioPassou(h);
    html += `<button class="${horarioSelecionado===h.id?'active':''} ${passou?'disabled':''}" onclick="window.setHorario('${h.id}')">${h.label}</button>`;
  });
  html += `</div></div>`;

  if(selectedMode>=1 && selectedMode<=3){
    html += `<div class="field"><label>DIGITE SEU NÚMERO</label><input id="numeroInput" maxlength="${selectedMode===1?2:selectedMode===2?3:4}" placeholder="${modo.placeholder}" inputmode="numeric"></div>`;
  }

  if(selectedMode===4){
    html += `<div class="field"><label>ESCOLHA O 2º BICHO (DUQUE)</label><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px;max-height:140px;overflow-y:auto">`;
    BICHOS.filter(b=>b.id!==selectedBicho.id).forEach(b=>{
      const active = segundoBicho && segundoBicho.id===b.id;
      html+=`<button onclick="window.pickSecond(${b.id})" style="padding:7px;border-radius:10px;border:1px solid ${active ? '#ffcc00' : 'rgba(255,255,255,.1)'};background:${active ? '#ffcc00' : '#1f1f1f'};color:${active ? '#000' : '#fff'};font-size:10px;font-weight:800">${b.nome}</button>`;
    });
    html+=`</div></div>`;
  }

  html += `
    <div class="field"><label>VALOR DA APOSTA</label>
    <div class="chips">
      ${[2,5,10,20,50].map(v=>`<button class="${valor===v?'active':''}" onclick="window.setValor(${v})">R$${v}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
      <button onclick="window.setValor(Math.max(1,valor-1))" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#fff;font-weight:800">-</button>
      <div style="flex:1;height:40px;border-radius:20px;background:#1f1f1f;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900">${formatBRL(valor)}</div>
      <button onclick="window.setValor(valor+1)" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#fff;font-weight:800">+</button>
    </div>
    </div>
    <div class="odds-box"><div><div style="font-size:10px;color:rgba(255,255,255,.4);font-weight:800">RETORNO POSSÍVEL</div><div class="ret">${formatBRL(valor*modo.paga)}</div></div><div style="text-align:right"><div style="font-size:10px;color:rgba(255,255,255,.3)">PAGA</div><div style="font-size:14px;font-weight:800;color:#fff">${modo.paga}x</div></div></div>
  `;
  modalBody.innerHTML = html;
  betBtn.textContent = `Apostar ${formatBRL(valor)} • ${horarioSelecionado||''}`;
  const numInput = document.getElementById('numeroInput');
  if(numInput){
    numInput.addEventListener('input', e=>{ e.target.value = e.target.value.replace(/\D/g,''); });
  }
}

window.setValor = (v)=>{ valor=v; renderModal(); }
window.pickSecond = (id)=>{ segundoBicho = BICHOS.find(b=>b.id===id); renderModal(); }
window.setHorario = (id)=>{ horarioSelecionado = id; renderModal(); renderHorarios(); }

document.getElementById('closeModal').onclick = ()=>overlay.classList.remove('open');
document.getElementById('cancelBtn').onclick = ()=>overlay.classList.remove('open');
overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.classList.remove('open'); });

betBtn.onclick = ()=>{
  const modo = MODOS[selectedMode];
  const numInput = document.getElementById('numeroInput');
  if(!horarioSelecionado){
    alert('Escolha um horário');
    return;
  }
  const hObj = HORARIOS.find(h=>h.id===horarioSelecionado);
  if(horarioPassou(hObj)){
    alert('Esse horário já passou! Escolha outro.');
    renderHorarios(); renderModal();
    return;
  }
  if(selectedMode>=1 && selectedMode<=3 && (!numInput || !numInput.value)){
    alert('Digite o número da aposta');
    return;
  }
  if(selectedMode===4 && !segundoBicho){
    alert('Escolha o 2º bicho para o Duque');
    return;
  }
  const aposta = {
    bicho: selectedBicho.nome,
    dezenas: selectedBicho.dezenas,
    modo: modo.nome,
    valor,
    horario: horarioSelecionado,
    numero: numInput ? numInput.value : '',
    segundo: segundoBicho ? segundoBicho.nome : null,
    data: new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})
  };
  const apostas = JSON.parse(localStorage.getItem('apostas_banca_patrona')||'[]');
  apostas.push(aposta);
  localStorage.setItem('apostas_banca_patrona', JSON.stringify(apostas));

  const toast = document.getElementById('toast');
  toast.textContent = `✅ Bilhete criado: ${modo.nome} - ${selectedBicho.nome} ${horarioSelecionado} - ${formatBRL(valor)}`;
  toast.classList.add('show');
  setTimeout(()=>{ toast.classList.remove('show'); overlay.classList.remove('open'); },2500);
};

// Bottom Nav
document.getElementById('btnInicio').onclick = ()=>window.scrollTo({top:0,behavior:'smooth'});

document.getElementById('btnMinhasApostas').onclick = ()=>{
  const overlayA = document.getElementById('apostasOverlay');
  const body = document.getElementById('apostasBody');
  const apostas = JSON.parse(localStorage.getItem('apostas_banca_patrona')||'[]');
  if(apostas.length===0){
    body.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,.5)">Nenhuma aposta hoje.<br><small>Faça sua primeira aposta!</small></div>`;
  } else {
    body.innerHTML = apostas.reverse().map(a=>`
      <div class="aposta-item">
        <b>${a.modo} - ${a.bicho} ${a.segundo?'+ '+a.segundo:''}</b>
        <small>Horário: ${a.horario} • Valor: ${formatBRL(a.valor)} • ${a.numero? 'Nº: '+a.numero+' • ' : ''}${a.data}</small>
      </div>
    `).join('') + `<button onclick="if(confirm('Limpar apostas?')){localStorage.removeItem('apostas_banca_patrona');document.getElementById('apostasBody').innerHTML='<div style=text-align:center;padding:20px;color:rgba(255,255,255,.5)>Limpas!</div>'} " style="width:100%;margin-top:8px;height:40px;border-radius:10px;background:rgba(255,0,0,.1);border:1px solid rgba(255,0,0,.2);color:#ff6b6b;font-weight:800;font-size:11px">🗑️ Limpar apostas (teste - simula 20h)</button>`;
  }
  overlayA.classList.add('open');
};
document.getElementById('closeApostas').onclick = ()=>document.getElementById('apostasOverlay').classList.remove('open');
document.getElementById('closeApostas2').onclick = ()=>document.getElementById('apostasOverlay').classList.remove('open');
document.getElementById('apostasOverlay').addEventListener('click', e=>{ if(e.target===e.currentTarget) e.currentTarget.classList.remove('open'); });

document.getElementById('btnResultados').onclick = ()=>{
  window.open('https://lotep.net/loteria-da-paraiba-ao-vivo/','_blank');
};
