// ============================================================
// SUPABASE SETUP (for DB only — auth is name+password)
// ============================================================
const SUPABASE_URL = 'https://pxhuoiizmqnonskovecf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4aHVvaWl6bXFub25za292ZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTg5MzYsImV4cCI6MjA4OTMzNDkzNn0.r_jMC9z5p-xeOeUvu7H9D8FW33oaEHPqdu6ATXBZTd4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// TEAM ROSTER — edit here to add/remove members or change passwords
// Password format: firstname + 123  (e.g. william123)
// ============================================================
const TEAM_USERS = [
  { name: 'William',  password: 'william123',  role: 'admin',  person: 'estrategista' },
  { name: 'Fabrício', password: 'fabricio123', role: 'member', person: 'fabricio' },
  { name: 'Lucas',    password: 'lucas123',    role: 'member', person: 'lucas' },
  { name: 'Gabriel',  password: 'gabriel123',  role: 'member', person: 'gabriel' },
];

// ============================================================
// DATA: Tasks for Week 1
// ============================================================
const TASKS = [
  // @ITALORICKES
  {id:"it-seg",profile:"italo",profileLabel:"@italorickes",day:"seg",dayLabel:"Segunda",
   format:"Reels (corte)",papel:"ATRAÇÃO",person:"lucas",personLabel:"Lucas",
   title:"Reels — \"O problema nunca foi o teu time\"",
   tagColor:"red",
   brief:"Buscar no acervo trecho do Ítalo falando sobre liderança ou empresário que centraliza tudo. Ref livro p.6: \"resistência do colaborador é sinal de falta de empatia\".",
   edição:"9:16 vertical. Texto 1,5s: \"O PROBLEMA NUNCA FOI O TEU TIME\". Subtítulos automáticos. Música lo-fi vol 15-20% entra no seg 3. Tela final: logo GI + @italorickes.",
   legenda:"O problema nunca foi o teu time.\n\nÉ duro de ouvir, mas precisa ser dito: se tu não sabe liderar cada perfil de pessoa de um jeito diferente, tu vai continuar perdendo gente boa e achando que \"ninguém presta\".\n\nLobo precisa de estrutura. Gato precisa de conexão. Tubarão precisa de autonomia. Águia precisa de liberdade.\n\nLiderar todo mundo igual é o erro mais caro que um empresário comete.\n\nSalva esse vídeo. Manda pro teu sócio.\n\nAmanhã eu explico os 4 perfis em detalhe. 🐺🐱🦈🦅"},

  {id:"it-ter",profile:"italo",profileLabel:"@italorickes",day:"ter",dayLabel:"Terça",
   format:"Carrossel 8 slides",papel:"AUTORIDADE",person:"fabricio",personLabel:"Fabrício",
   title:"Carrossel — Perfis Comportamentais (Diagnóstico Real)",
   tagColor:"blue",
   brief:"8 slides. Fundo escuro, tipografia branca bold. Slide 1: capa \"DESCUBRA SE VOCÊ É LOBO, GATO, TUBARÃO OU ÁGUIA\". Slides 3-6: um perfil por slide. Slide 8: CTA.",
   legenda:"Esse é o conhecimento que mudou a liderança de centenas de empresários.\n\n4 perfis. 4 formas de liderar. Nenhuma igual.\n\n🐺 Lobo — estrutura e consistência\n🐱 Gato — conexão e pertencimento\n🦈 Tubarão — resultado e velocidade\n🦅 Águia — visão e liberdade\n\nQual perfil tu é? Comenta aqui 👇"},

  {id:"it-qua",profile:"italo",profileLabel:"@italorickes",day:"qua",dayLabel:"Quarta",
   format:"Reels (corte)",papel:"AUTORIDADE",person:"lucas",personLabel:"Lucas",
   title:"Reels — Ferramenta: PNL aplicada à liderança",
   tagColor:"orange",
   brief:"Buscar corte do Ítalo ensinando PNL: \"o mapa não é o território\", \"não existe fracasso, apenas resultado\". Trecho prático 30-45s.",
   legenda:"Ferramenta da Semana: PNL APLICADA À LIDERANÇA\n\nUm dos pressupostos mais poderosos:\n\n\"A responsabilidade da comunicação é SEMPRE do comunicador.\"\n\nSe o teu funcionário não entendeu, o problema não é ele. É a forma como tu comunicou.\n\n💾 Salva. Toda quarta tem ferramenta nova aqui."},

  {id:"it-qui",profile:"italo",profileLabel:"@italorickes",day:"qui",dayLabel:"Quinta",
   format:"Fotos + legenda",papel:"CONEXÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Post storytelling — Bastidores do Ítalo",
   tagColor:"pink",
   brief:"3-4 fotos reais do Ítalo em bastidor. Fabrício ajusta crop, cor quente/desaturada, logo GI discreto."},

  {id:"it-sex",profile:"italo",profileLabel:"@italorickes",day:"sex",dayLabel:"Sexta",
   format:"Reels (depoimento)",papel:"COMUNIDADE",person:"lucas",personLabel:"Lucas",
   title:"Reels — Caso de Impacto (depoimento aluno)",
   tagColor:"purple",
   brief:"Buscar depoimento de aluno sobre TRANSFORMAÇÃO PESSOAL ou LIDERANÇA. Priorizar quem fala com emoção e cita resultados."},

  {id:"it-sab",profile:"italo",profileLabel:"@italorickes",day:"sab",dayLabel:"Sábado",
   format:"Post de frase",papel:"RETENÇÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Frase — \"Se a tua empresa para quando tu sai...\"",
   tagColor:"cyan",
   brief:"Fundo preto. Texto branco bold centralizado. FRASE: \"Se a tua empresa para quando tu sai, tu não tem uma empresa. Tu tem um emprego que tu mesmo criou.\""},

  {id:"it-dom",profile:"italo",profileLabel:"@italorickes",day:"dom",dayLabel:"Domingo",
   format:"Carrossel 5 slides",papel:"CONVERSÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Carrossel — Mini-LP da Imersão GI",
   tagColor:"green",
   brief:"5 slides. Mini-página de vendas. S1: provocação. S2: 4 pilares. S3: o que leva em 2 dias. S4: 3 depoimentos. S5: CTA com data/cidade/link."},

  // @LEONARDOLLO
  {id:"le-seg",profile:"leonardo",profileLabel:"@leonardollo",day:"seg",dayLabel:"Segunda",
   format:"Reels (corte)",papel:"ATRAÇÃO",person:"lucas",personLabel:"Lucas",
   title:"Reels — \"Empresa sem processo = emprego disfarçado\"",
   tagColor:"red",
   brief:"Buscar corte do Leonardo sobre PROCESSOS ou caos operacional. Ref livro p.41."},

  {id:"le-ter",profile:"leonardo",profileLabel:"@leonardollo",day:"ter",dayLabel:"Terça",
   format:"Carrossel 8 slides",papel:"AUTORIDADE",person:"fabricio",personLabel:"Fabrício",
   title:"Carrossel — 8 Desperdícios Lean (Diagnóstico Real)",
   tagColor:"blue",
   brief:"8 slides sobre os 8 desperdícios do Lean. Ref livro p.42-50."},

  {id:"le-qua",profile:"leonardo",profileLabel:"@leonardollo",day:"qua",dayLabel:"Quarta",
   format:"Reels (corte)",papel:"AUTORIDADE",person:"lucas",personLabel:"Lucas",
   title:"Reels — Ferramenta: OKR",
   tagColor:"orange",
   brief:"Buscar corte do Leonardo ensinando OKR. Ref livro p.73: \"Eu vou [objetivo] medido por [resultado-chave]\"."},

  {id:"le-qui",profile:"leonardo",profileLabel:"@leonardollo",day:"qui",dayLabel:"Quinta",
   format:"Fotos + legenda",papel:"CONEXÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Post storytelling — Bastidores do Leonardo",
   tagColor:"pink",
   brief:"3-4 fotos reais do Leonardo. Bastidor, com equipe, com Ítalo, momento espontâneo."},

  {id:"le-sex",profile:"leonardo",profileLabel:"@leonardollo",day:"sex",dayLabel:"Sexta",
   format:"Reels (depoimento)",papel:"COMUNIDADE",person:"lucas",personLabel:"Lucas",
   title:"Reels — Caso de Impacto (depoimento aluno)",
   tagColor:"purple",
   brief:"Buscar depoimento sobre PROCESSOS, VENDAS ou RESULTADO FINANCEIRO. Priorizar quem cita números."},

  {id:"le-sab",profile:"leonardo",profileLabel:"@leonardollo",day:"sab",dayLabel:"Sábado",
   format:"Post de frase",papel:"RETENÇÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Frase — Citação do livro GI sobre processos",
   tagColor:"cyan",
   brief:"Fundo preto. FRASE: \"Nenhuma organização se desenvolve sem lastro firme. Ter processos claros e enxutos é um símbolo de respeito com o cliente.\" (Livro GI, p.41)"},

  {id:"le-dom",profile:"leonardo",profileLabel:"@leonardollo",day:"dom",dayLabel:"Domingo",
   format:"Reels (cinematográfico)",papel:"CONVERSÃO",person:"gabriel",personLabel:"Gabriel",
   title:"Reels — Trailer cinematográfico da Imersão",
   tagColor:"green",
   brief:"Montagem 20-30s com cenas épicas: plateia, palco, networking, aplausos. Zero narração — só imagem + música + texto na tela."},

  // @GESTAO.IMPACTO
  {id:"gi-seg",profile:"gi",profileLabel:"@gestao.impacto",day:"seg",dayLabel:"Segunda",
   format:"Reels (montagem)",papel:"ATRAÇÃO",person:"gabriel",personLabel:"Gabriel",
   title:"Reels — Trailer cinematográfico GI (25-30s)",
   tagColor:"red",
   brief:"\"Trailer de filme\" do GI. 6-8 cenas de 3-4s. Ordem: pergunta provocativa → cenas crescendo → dados de impacto → CTA."},

  {id:"gi-ter",profile:"gi",profileLabel:"@gestao.impacto",day:"ter",dayLabel:"Terça",
   format:"Carrossel 10 slides",papel:"AUTORIDADE",person:"fabricio",personLabel:"Fabrício",
   title:"Carrossel — Os 4 Pilares do Método GI",
   tagColor:"blue",
   brief:"10 slides. O carrossel mais importante do perfil institucional. Apresentação oficial da metodologia."},

  {id:"gi-qua",profile:"gi",profileLabel:"@gestao.impacto",day:"qua",dayLabel:"Quarta",
   format:"Reels (corte mentor)",papel:"AUTORIDADE",person:"gabriel",personLabel:"Gabriel",
   title:"Reels — Corte do Ítalo sobre comunicação/PNL",
   tagColor:"orange",
   brief:"Corte do ÍTALO. Buscar trecho ensinando comunicação, PNL ou liderança. Ref livro p.6."},

  {id:"gi-qui",profile:"gi",profileLabel:"@gestao.impacto",day:"qui",dayLabel:"Quinta",
   format:"Fotos + legenda",papel:"CONEXÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Post — Time GI nos bastidores",
   tagColor:"pink",
   brief:"4-5 fotos do time GI: equipe reunida, montagem de evento, momentos espontâneos."},

  {id:"gi-sex",profile:"gi",profileLabel:"@gestao.impacto",day:"sex",dayLabel:"Sexta",
   format:"Reels (compilado)",papel:"COMUNIDADE",person:"gabriel",personLabel:"Gabriel",
   title:"Reels — Mural de Impacto (6-8 depoimentos)",
   tagColor:"purple",
   brief:"Compilado de 6-8 depoimentos curtos de alunos diferentes. 5-8s por pessoa."},

  {id:"gi-sab",profile:"gi",profileLabel:"@gestao.impacto",day:"sab",dayLabel:"Sábado",
   format:"Post de frase",papel:"RETENÇÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Frase — \"A mudança começa quando o dono muda primeiro\"",
   tagColor:"cyan",
   brief:"Fundo preto. Logo GI sutil. FRASE: \"A mudança começa quando o dono muda primeiro.\""},

  {id:"gi-dom",profile:"gi",profileLabel:"@gestao.impacto",day:"dom",dayLabel:"Domingo",
   format:"Carrossel 6 slides",papel:"CONVERSÃO",person:"fabricio",personLabel:"Fabrício",
   title:"Carrossel — Mini Landing Page da Imersão",
   tagColor:"green",
   brief:"6 slides = mini-página de vendas."}
];

const STATUSES = ['Não iniciado','Em produção','Em revisão','Aprovado','Postado'];
const DAYS_ORDER = ['seg','ter','qua','qui','sex','sab','dom'];
const DAYS_FULL = {seg:'Segunda',ter:'Terça',qua:'Quarta',qui:'Quinta',sex:'Sexta',sab:'Sábado',dom:'Domingo'};
const PROFILE_COLORS = {italo:'var(--purple)',leonardo:'var(--accent)',gi:'var(--green)',ads:'var(--orange)'};

let state = { statuses:{}, driveUrls:{}, customTasks:[], comments:[], activity:[] };
let currentOpenedTaskId = null;
let currentUser = null;

// ============================================================
// AUTH — simple name + password (no email needed)
// ============================================================
function initAuth() {
  // Check if already logged in via localStorage
  const saved = localStorage.getItem('gi-user');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      // Validate saved user still exists in roster
      const valid = TEAM_USERS.find(u => u.name === user.name && u.password === user.password);
      if (valid) { handleLoggedIn(valid); return; }
    } catch(e) {}
  }
  showLogin();
}

function handleLoggedIn(member) {
  currentUser = member;
  localStorage.setItem('gi-user', JSON.stringify(member));

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';

  const userBadge = document.getElementById('user-badge');
  if (userBadge) userBadge.textContent = `👤 ${member.name}`;

  loadData();
}

function showLogin() {
  currentUser = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function doLogin() {
  const nameInput = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  // Case-insensitive name match
  const member = TEAM_USERS.find(
    u => u.name.toLowerCase() === nameInput.toLowerCase() && u.password === password
  );

  if (member) {
    handleLoggedIn(member);
  } else {
    errEl.textContent = 'Nome ou senha incorretos.';
    document.getElementById('login-password').value = '';
  }
}

function doLogout() {
  localStorage.removeItem('gi-user');
  showLogin();
}

// ============================================================
// STORAGE — Supabase first, localStorage fallback
// ============================================================
async function loadData() {
  try {
    // Load statuses from Supabase tasks table
    const { data: rows, error } = await supabase.from('tasks').select('*');
    if (!error && rows) {
      rows.forEach(row => {
        state.statuses[row.id] = row.status || 0;
        if (row.drive_url) state.driveUrls[row.id] = row.drive_url;
        // If it's a custom task (uuid format from DB), add to customTasks
        if (!TASKS.find(t => t.id === row.id)) {
          const existing = state.customTasks.find(t => t.id === row.id);
          if (!existing) {
            state.customTasks.push({
              id: row.id,
              title: row.title,
              profile: row.profile,
              profileLabel: row.profileLabel,
              person: row.person,
              personLabel: row.personLabel,
              day: row.day,
              dayLabel: row.dayLabel,
              format: row.format,
              brief: row.brief,
              legenda: row.legenda || '',
              edição: row.edição || '',
              papel: 'EXTRA',
              tagColor: 'gray',
            });
          }
        }
      });
    }
  } catch(e) {
    // Fallback to localStorage
    const saved = localStorage.getItem('gi-dashboard');
    if (saved) state = JSON.parse(saved);
  }
  render();
}

function saveLocal() {
  localStorage.setItem('gi-dashboard', JSON.stringify(state));
}

async function syncData() {
  await loadData();
  showToast('✅ Dados sincronizados!');
}

function getStatus(id) { return state.statuses[id] ?? 0; }
function getDriveUrl(id) { return state.driveUrls?.[id] ?? ''; }

async function setStatus(taskId, status) {
  const s = parseInt(status);
  state.statuses[taskId] = s;
  saveLocal();

  // Log activity
  addActivity(taskId, `Status alterado para "${STATUSES[s]}"`);

  // Persist to Supabase
  try {
    await supabase.from('tasks').upsert({ id: taskId, title: '[static]', profile: 'static', person: 'static', day: 'seg', status: s }, { onConflict: 'id', ignoreDuplicates: false });
  } catch(e) {}

  render();
}

async function saveDriveUrl() {
  if (!currentOpenedTaskId) return;
  const url = document.getElementById('task-drive-url').value.trim();
  state.driveUrls[currentOpenedTaskId] = url;
  saveLocal();

  addActivity(currentOpenedTaskId, url ? 'Link do Drive adicionado' : 'Link do Drive removido');
  showToast('☁️ Link do Drive salvo!');

  try {
    await supabase.from('tasks').upsert({ id: currentOpenedTaskId, title: '[ref]', profile: 'static', person: 'static', day: 'seg', drive_url: url }, { onConflict: 'id' });
  } catch(e) {}

  openTask(currentOpenedTaskId);
}

// ============================================================
// ACTIVITY FEED
// ============================================================
function addActivity(taskId, action) {
  const allTasks = [...TASKS, ...(state.customTasks || [])];
  const task = allTasks.find(t => t.id === taskId);
  const entry = {
    taskId,
    taskTitle: task?.title || taskId,
    action,
    who: currentUser?.teamInfo?.name || 'Alguém',
    at: new Date().toISOString()
  };
  if (!state.activity) state.activity = [];
  state.activity.unshift(entry);
  if (state.activity.length > 50) state.activity.length = 50;
  saveLocal();
  renderActivity();
}

function renderActivity() {
  const el = document.getElementById('activity-feed');
  if (!el) return;
  const feed = (state.activity || []).slice(0, 20);
  if (!feed.length) {
    el.innerHTML = '<p style="color:var(--text3);font-size:.85rem">Nenhuma ação ainda.</p>';
    return;
  }
  el.innerHTML = feed.map(e => {
    const dt = new Date(e.at);
    const timeStr = dt.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    const dateStr = dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
    return `<div style="display:flex;gap:.75rem;padding:.75rem;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02);margin-bottom:.5rem">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:5px"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.8rem;font-weight:600;color:var(--text)">${e.who}</div>
        <div style="font-size:.8rem;color:var(--text2)">${e.action}</div>
        <div style="font-size:.75rem;color:var(--text3);margin-top:.15rem">${e.taskTitle}</div>
      </div>
      <div style="font-size:.7rem;color:var(--text3);flex-shrink:0;text-align:right">${dateStr}<br>${timeStr}</div>
    </div>`;
  }).join('');
}

// ============================================================
// RENDER
// ============================================================
function render() {
  renderStats();
  renderOverview();
  renderCalendar();
  renderPersonTasks();
  renderProfileTasks();
  renderAdsTasks();
  renderStories();
  renderBriefs();
  renderComments();
  renderActivity();
}

function renderStats() {
  const all = [...TASKS, ...(state.customTasks || [])];
  const total = all.length;
  const done = all.filter(t => getStatus(t.id) >= 4).length;
  const inProd = all.filter(t => getStatus(t.id) === 1).length;
  const review = all.filter(t => getStatus(t.id) === 2).length;
  const approved = all.filter(t => getStatus(t.id) === 3).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('stats-area').innerHTML = `
    <div class="stat"><div class="stat-value">${total}</div><div class="stat-label">Total tarefas</div></div>
    <div class="stat"><div class="stat-value" style="color:var(--yellow)">${inProd}</div><div class="stat-label">Em produção</div></div>
    <div class="stat"><div class="stat-value" style="color:var(--orange)">${review}</div><div class="stat-label">Em revisão</div></div>
    <div class="stat"><div class="stat-value" style="color:var(--accent)">${approved}</div><div class="stat-label">Aprovados</div></div>
    <div class="stat"><div class="stat-value" style="color:var(--green)">${done}</div><div class="stat-label">Postados</div></div>
    <div class="stat">
      <div class="stat-value" style="color:var(--accent)">${pct}%</div>
      <div class="stat-label">Progresso</div>
      <div style="margin-top:.75rem;height:4px;background:var(--s3);border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--purple));border-radius:2px;transition:width .6s ease"></div>
      </div>
    </div>`;
}

function taskHTML(t) {
  const s = getStatus(t.id);
  const hasDrive = !!getDriveUrl(t.id);
  return `<div class="task" onclick="openTask('${t.id}')"
    draggable="true"
    ondragstart="dragStart(event,'${t.id}')"
    ondragover="dragOver(event)"
    ondrop="dragDrop(event,'${t.id}')"
    ondragleave="dragLeave(event)">
    <div class="task-status" style="background:${['var(--text3)','var(--yellow)','var(--orange)','var(--accent)','var(--green)'][s]}"></div>
    <div class="task-content">
      <div class="task-name">${t.title}</div>
      <div class="task-meta">
        <span class="tag tag-${t.tagColor||'gray'}">${t.papel||'TAREFA'}</span>
        <span class="tag tag-gray">${t.format}</span>
        <span class="tag tag-gray">${t.dayLabel||t.day}</span>
        <span class="tag tag-blue">${t.personLabel||t.person}</span>
        ${hasDrive ? '<span class="tag tag-green">☁️ Drive</span>' : ''}
      </div>
    </div>
    <select class="status-select status-${s}" onclick="event.stopPropagation()" onchange="setStatus('${t.id}',this.value)">
      ${STATUSES.map((st,i) => `<option value="${i}" ${i===s?'selected':''}>${st}</option>`).join('')}
    </select>
  </div>`;
}

function renderOverview() {
  const profiles = [
    {key:'italo',label:'@italorickes',color:'var(--purple)'},
    {key:'leonardo',label:'@leonardollo',color:'var(--accent)'},
    {key:'gi',label:'@gestao.impacto',color:'var(--green)'}
  ];
  const all = [...TASKS, ...(state.customTasks || [])];
  let html = '';
  profiles.forEach(p => {
    const tasks = all.filter(t => t.profile === p.key);
    const posted = tasks.filter(t => getStatus(t.id) >= 4).length;
    const pct = tasks.length ? Math.round(posted/tasks.length*100) : 0;
    html += `<div class="card">
      <div class="card-header" style="border-left:3px solid ${p.color}">
        <span class="card-title">${p.label}</span>
        <div style="text-align:right">
          <span style="font-size:.7rem;color:var(--text3)">${posted}/${tasks.length} postados</span>
          <div style="height:3px;width:80px;background:var(--s3);border-radius:2px;margin-top:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${p.color};border-radius:2px;transition:width .6s ease"></div>
          </div>
        </div>
      </div>
      <div class="card-body">${tasks.sort((a,b)=>DAYS_ORDER.indexOf(a.day)-DAYS_ORDER.indexOf(b.day)).map(taskHTML).join('')}</div>
    </div>`;
  });
  document.getElementById('overview-tasks').innerHTML = html;
}

function renderCalendar() {
  const all = [...TASKS, ...(state.customTasks || [])];
  let html = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(d => `<div class="cal-h">${d}</div>`).join('');
  DAYS_ORDER.forEach(day => {
    const tasks = all.filter(t => t.day === day);
    html += `<div class="cal-c"><div class="day-num">${DAYS_FULL[day]}</div>`;
    tasks.forEach(t => {
      const colors = {italo:'background:rgba(139,92,246,0.2);color:var(--purple)',leonardo:'background:rgba(37,99,235,0.2);color:var(--accent)',gi:'background:rgba(16,185,129,0.2);color:var(--green)',ads:'background:rgba(249,115,22,0.2);color:var(--orange)'};
      const s = getStatus(t.id);
      const done = s >= 4 ? 'opacity:.5;text-decoration:line-through' : '';
      html += `<div class="cal-item" style="${colors[t.profile]||''};${done}" onclick="openTask('${t.id}')" title="${t.title}">${t.profileLabel}: ${t.format}</div>`;
    });
    html += '</div>';
  });
  document.getElementById('calendar-grid').innerHTML = html;
}

function renderPersonTasks() {
  const all = [...TASKS, ...(state.customTasks || [])];
  ['estrategista','fabricio','lucas','gabriel'].forEach(p => {
    const el = document.getElementById('tasks-'+p);
    if (!el) return;
    const tasks = all.filter(t => t.person === p);
    const byDay = {};
    tasks.forEach(t => { if (!byDay[t.day]) byDay[t.day]=[]; byDay[t.day].push(t); });
    let html = '';

    // Kanban by status
    const cols = [
      { label: '⬜ Não iniciado', statuses: [0], color: 'var(--text3)' },
      { label: '🟡 Em produção', statuses: [1], color: 'var(--yellow)' },
      { label: '🟠 Em revisão', statuses: [2], color: 'var(--orange)' },
      { label: '🔵 Aprovado', statuses: [3], color: 'var(--accent)' },
      { label: '✅ Postado', statuses: [4], color: 'var(--green)' },
    ];
    html += `<div class="kanban-board">`;
    cols.forEach(col => {
      const colTasks = tasks.filter(t => col.statuses.includes(getStatus(t.id)));
      html += `<div class="kanban-col" data-statuses="${col.statuses.join(',')}"
        ondragover="event.preventDefault()"
        ondrop="kanbanDrop(event,${col.statuses[0]})">
        <div class="kanban-col-header" style="border-top:3px solid ${col.color}">
          <span>${col.label}</span>
          <span class="sidebar-badge">${colTasks.length}</span>
        </div>
        <div class="kanban-col-body">
          ${colTasks.length ? colTasks.map(t => taskHTML(t)).join('') : '<p style="color:var(--text3);font-size:.8rem;text-align:center;padding:1rem 0">Vazio</p>'}
        </div>
      </div>`;
    });
    html += `</div>`;
    el.innerHTML = html;
  });
}

function renderProfileTasks() {
  const all = [...TASKS, ...(state.customTasks || [])];
  ['italo','leonardo','gi'].forEach(p => {
    const el = document.getElementById('tasks-'+p);
    if (!el) return;
    const tasks = all.filter(t => t.profile === p).sort((a,b) => DAYS_ORDER.indexOf(a.day)-DAYS_ORDER.indexOf(b.day));
    el.innerHTML = `<div class="grid grid-3">${tasks.map(taskHTML).join('')}</div>`;
  });
}

function renderAdsTasks() {
  const el = document.getElementById('tasks-ads');
  if (!el) return;
  const all = [...TASKS, ...(state.customTasks || [])];
  const tasks = all.filter(t => t.profile === 'ads').sort((a,b) => DAYS_ORDER.indexOf(a.day)-DAYS_ORDER.indexOf(b.day));
  el.innerHTML = tasks.length > 0
    ? `<div class="grid grid-3">${tasks.map(taskHTML).join('')}</div>`
    : `<div style="text-align:center;padding:4rem;color:var(--text3)">
        <div style="font-size:3rem;margin-bottom:1rem">🎯</div>
        <h3 style="font-size:1rem;font-weight:600;color:var(--text2);margin-bottom:.5rem">Nenhum anúncio ainda</h3>
        <p style="font-size:.85rem">Clique em "+ Nova Tarefa" e selecione "Anúncios (ADS)" como perfil.</p>
      </div>`;
}

function renderStories() {
  const el = document.getElementById('stories-content');
  if (!el) return;
  el.innerHTML = `
    <div class="card" style="margin-bottom:1.5rem"><div class="card-header"><span class="card-title">📱 Templates de Stories — Fabrício cria, Tu posta</span></div><div class="card-body">
    <p style="color:var(--text2);margin-bottom:1rem">6 templates base que o Fabrício cria UMA VEZ e depois só troca o texto diariamente.</p>
    <div class="grid grid-3">
      <div style="padding:.75rem;background:var(--s2);border-radius:10px"><strong style="color:var(--green);font-size:.75rem">8h — BOM DIA</strong><p style="font-size:.8rem;color:var(--text2);margin-top:.3rem">Fundo escuro + enquete do dia.</p></div>
      <div style="padding:.75rem;background:var(--s2);border-radius:10px"><strong style="color:var(--accent);font-size:.75rem">9h-10h — CORTE DO DIA</strong><p style="font-size:.8rem;color:var(--text2);margin-top:.3rem">Lucas entrega 1 mini-corte 15s/dia/perfil.</p></div>
      <div style="padding:.75rem;background:var(--s2);border-radius:10px"><strong style="color:var(--orange);font-size:.75rem">11h-12h — EDUCATIVO</strong><p style="font-size:.8rem;color:var(--text2);margin-top:.3rem">2-3 stories sequenciais rotacionando por pilar.</p></div>
      <div style="padding:.75rem;background:var(--s2);border-radius:10px"><strong style="color:var(--pink);font-size:.75rem">14h — BASTIDOR</strong><p style="font-size:.8rem;color:var(--text2);margin-top:.3rem">Ítalo/Leonardo mandam 1 foto/vídeo rápido.</p></div>
      <div style="padding:.75rem;background:var(--s2);border-radius:10px"><strong style="color:var(--purple);font-size:.75rem">17h-18h — PROVA SOCIAL</strong><p style="font-size:.8rem;color:var(--text2);margin-top:.3rem">Print de resultado de aluno + enquete segmentadora.</p></div>
      <div style="padding:.75rem;background:var(--s2);border-radius:10px"><strong style="color:var(--red);font-size:.75rem">20h-21h — CTA</strong><p style="font-size:.8rem;color:var(--text2);margin-top:.3rem">CTA com link/direct + frase reflexiva de encerramento.</p></div>
    </div></div></div>`;
}

function renderBriefs() {
  const el = document.getElementById('all-briefs');
  if (!el) return;
  el.innerHTML = TASKS.map(t => `<div class="card" style="cursor:pointer" onclick="openTask('${t.id}')">
    <div class="card-header" style="border-left:3px solid ${PROFILE_COLORS[t.profile]||'var(--s3)'}">
      <span class="card-title" style="font-size:.85rem">${t.profileLabel} — ${t.dayLabel}</span>
    </div>
    <div class="card-body">
      <p style="font-size:.85rem;font-weight:500;margin-bottom:.35rem">${t.title}</p>
      <span class="tag tag-${t.tagColor||'gray'}">${t.papel}</span> <span class="tag tag-gray">${t.format}</span>
    </div>
  </div>`).join('');
}

function renderComments() {
  const el = document.getElementById('comments-list');
  if (!el) return;
  const comments = state.comments || [];
  el.innerHTML = comments.slice().reverse().map(c => `<div class="card" style="margin-bottom:.5rem">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <strong style="color:var(--accent);font-size:.85rem">${c.name}</strong>
        <span style="font-size:.7rem;color:var(--text3)">${c.createdAt ? new Date(c.createdAt).toLocaleString('pt-BR') : ''}</span>
      </div>
      <p style="font-size:.85rem;color:var(--text2)">${c.text}</p>
    </div>
  </div>`).join('') || '<p style="color:var(--text3)">Nenhum comentário ainda.</p>';
}

// ============================================================
// KANBAN DRAG AND DROP
// ============================================================
let draggingTaskId = null;

function dragStart(event, taskId) {
  draggingTaskId = taskId;
  event.dataTransfer.effectAllowed = 'move';
  event.currentTarget.style.opacity = '0.5';
}

function dragOver(event) {
  event.preventDefault();
  event.currentTarget.style.borderColor = 'var(--accent)';
}

function dragLeave(event) {
  event.currentTarget.style.borderColor = '';
}

function dragDrop(event, targetTaskId) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.style.borderColor = '';
  event.currentTarget.style.opacity = '1';
}

async function kanbanDrop(event, newStatus) {
  event.preventDefault();
  if (draggingTaskId === null) return;
  await setStatus(draggingTaskId, newStatus);
  draggingTaskId = null;
}

// ============================================================
// MODAL
// ============================================================
function openTask(id) {
  const t = [...TASKS, ...(state.customTasks||[])].find(x => x.id === id);
  if (!t) return;
  currentOpenedTaskId = id;
  document.getElementById('modal-title').textContent = t.title;
  const s = getStatus(id);
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">
      <span class="tag tag-${t.tagColor||'gray'}">${t.papel||'TAREFA'}</span>
      <span class="tag tag-gray">${t.format}</span>
      <span class="tag tag-gray">${t.dayLabel||t.day}</span>
      <span class="tag tag-blue">${t.personLabel||t.person}</span>
      <span class="tag tag-${['gray','yellow','orange','blue','green'][s]}">${STATUSES[s]}</span>
    </div>
    ${t.brief ? `<h4>📋 Briefing</h4><div class="brief-block">${t.brief.replace(/\n/g,'<br>')}</div>` : ''}
    ${t.edição ? `<h4>🎬 Edição / Design</h4><div class="brief-block" style="border-left-color:var(--yellow)">${t.edição.replace(/\n/g,'<br>')}</div>` : ''}
    ${t.legenda ? `<h4>📝 Legenda (copiar e colar)</h4><div class="legend-block">${t.legenda.replace(/\n/g,'<br>')}</div><button class="btn btn-outline btn-sm" onclick="copyLegend(this)" style="margin-bottom:1rem">📋 Copiar legenda</button>` : ''}
  `;

  const driveInput = document.getElementById('task-drive-url');
  const driveBtnContainer = document.getElementById('task-current-drive-btn');
  const currentUrl = getDriveUrl(id);
  driveInput.value = currentUrl;
  if (currentUrl) {
    driveBtnContainer.style.display = 'block';
    driveBtnContainer.innerHTML = `<a href="${currentUrl}" target="_blank" class="btn btn-primary" style="width:100%;justify-content:center;background:var(--green);border-color:var(--green);box-shadow:0 4px 15px rgba(16,185,129,0.3)">☁️ Acessar / Baixar Material</a>`;
  } else {
    driveBtnContainer.style.display = 'none';
  }
  document.getElementById('taskModal').classList.add('open');
}

function closeModal() {
  document.getElementById('taskModal').classList.remove('open');
}

function copyLegend(btn) {
  const legendBlock = btn.previousElementSibling;
  navigator.clipboard.writeText(legendBlock.innerText).then(() => showToast('📋 Legenda copiada!'));
}

// ============================================================
// NAVIGATION
// ============================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.mobile-nav button').forEach(b => b.classList.remove('active'));
  const page = document.getElementById('page-'+id);
  if (page) page.classList.add('active');
  event?.target?.classList?.add('active');
  window.scrollTo(0, 0);
}

// ============================================================
// CUSTOM TASKS
// ============================================================
async function addCustomTask() {
  const title = document.getElementById('new-title').value.trim();
  if (!title) return showToast('Preenche o título!');

  const profile = document.getElementById('new-profile').value;
  const person = document.getElementById('new-person').value;
  const day = document.getElementById('new-day').value;
  const format = document.getElementById('new-format').selectedOptions[0].text;
  const brief = document.getElementById('new-brief').value;
  const personLabel = {fabricio:'Fabrício',lucas:'Lucas',gabriel:'Gabriel',estrategista:'William'}[person];
  const profileLabel = document.getElementById('new-profile').selectedOptions[0].text;

  const task = {
    id: crypto.randomUUID(),
    title, profile, profileLabel, person, personLabel,
    day, dayLabel: DAYS_FULL[day], format,
    papel: 'EXTRA', tagColor: 'gray', brief, legenda: '', edição: ''
  };

  // Save to Supabase
  try {
    await supabase.from('tasks').insert({
      id: task.id, title, profile, profileLabel, person, personLabel,
      day, dayLabel: DAYS_FULL[day], format, brief, status: 0
    });
  } catch(e) {}

  if (!state.customTasks) state.customTasks = [];
  state.customTasks.push(task);
  saveLocal();
  addActivity(task.id, 'Nova tarefa criada');
  render();
  document.getElementById('new-title').value = '';
  document.getElementById('new-brief').value = '';
  showToast('✅ Tarefa criada!');
}

// ============================================================
// COMMENTS
// ============================================================
function addComment() {
  const name = document.getElementById('comment-name').value.trim();
  const text = document.getElementById('comment-text').value.trim();
  if (!name || !text) return showToast('Preenche nome e comentário!');
  if (!state.comments) state.comments = [];
  state.comments.push({ name, text, createdAt: new Date().toISOString() });
  saveLocal();
  render();
  document.getElementById('comment-text').value = '';
  showToast('💬 Comentário adicionado!');
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2500);
}

// ============================================================
// INIT
// ============================================================
document.getElementById('taskModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

initAuth();
