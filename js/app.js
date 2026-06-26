/* =====================================================
   JORNADA DA INFORMÁTICA BÁSICA
   Motor de Estado — app.js
   Gerencia o progresso do aluno, XP, níveis,
   notificações e persistência no localStorage
   ===================================================== */

'use strict';

// ===================================================
// CONFIGURAÇÃO DOS MÓDULOS
// ===================================================
const MODULES_CONFIG = [
  { id: 1, title: 'Conhecendo o Computador',  icon: '🖥️',  steps: 5, xpReward: 50,  unlockAt: 0   },
  { id: 2, title: 'Conhecendo o Teclado',      icon: '⌨️',  steps: 5, xpReward: 50,  unlockAt: 50  },
  { id: 3, title: 'Atalhos de Teclado',        icon: '⚡',  steps: 5, xpReward: 60,  unlockAt: 100 },
  { id: 4, title: 'Explorador de Arquivos',    icon: '📁',  steps: 5, xpReward: 70,  unlockAt: 150 },
  { id: 5, title: 'Internet',                  icon: '🌐',  steps: 5, xpReward: 70,  unlockAt: 220 },
  { id: 6, title: 'Segurança Digital',         icon: '🛡️',  steps: 5, xpReward: 80,  unlockAt: 290 },
  { id: 7, title: 'Windows Básico',            icon: '🪟',  steps: 5, xpReward: 80,  unlockAt: 370 },
  { id: 8, title: 'LibreOffice Writer',        icon: '✍️',  steps: 5, xpReward: 100, unlockAt: 450 },
];

// ===================================================
// CONFIGURAÇÃO DOS NÍVEIS
// ===================================================
const LEVELS = [
  { min: 0,    max: 99,   name: 'Iniciante',    icon: '🌱', color: '#10B981' },
  { min: 100,  max: 249,  name: 'Explorador',   icon: '🔭', color: '#3B82F6' },
  { min: 250,  max: 499,  name: 'Técnico',      icon: '⚙️', color: '#8B5CF6' },
  { min: 500,  max: 999,  name: 'Especialista', icon: '💡', color: '#F59E0B' },
  { min: 1000, max: 9999, name: 'Mestre',       icon: '🏆', color: '#EF4444' },
];

// ===================================================
// CONFIGURAÇÃO DE MEDALHAS
// ===================================================
const MEDALS_CONFIG = [
  {
    id: 'first_step',
    name: 'Primeiro Passo',
    icon: '👣',
    description: 'Completou sua primeira atividade!',
    color: 'bronze',
    condition: (state) => state.totalXP >= 10,
  },
  {
    id: 'keyboard_master',
    name: 'Mestre dos Atalhos',
    icon: '⚡',
    description: 'Completou o Módulo 3 — Atalhos de Teclado',
    color: 'gold',
    condition: (state) => state.modules[3]?.completed,
  },
  {
    id: 'file_explorer',
    name: 'Explorador de Arquivos',
    icon: '🗂️',
    description: 'Completou o Módulo 4 — Explorador de Arquivos',
    color: 'gold',
    condition: (state) => state.modules[4]?.completed,
  },
  {
    id: 'digital_guardian',
    name: 'Guardião Digital',
    icon: '🛡️',
    description: 'Completou o Módulo 6 — Segurança Digital',
    color: 'gold',
    condition: (state) => state.modules[6]?.completed,
  },
  {
    id: 'windows_expert',
    name: 'Especialista em Windows',
    icon: '🪟',
    description: 'Completou o Módulo 7 — Windows Básico',
    color: 'gold',
    condition: (state) => state.modules[7]?.completed,
  },
  {
    id: 'writer_pro',
    name: 'Escritor Pro',
    icon: '✍️',
    description: 'Completou o Módulo 8 — LibreOffice Writer',
    color: 'gold',
    condition: (state) => state.modules[8]?.completed,
  },
  {
    id: 'halfway',
    name: 'Na Metade do Caminho',
    icon: '🌟',
    description: 'Completou 4 módulos!',
    color: 'silver',
    condition: (state) => Object.values(state.modules).filter(m => m.completed).length >= 4,
  },
  {
    id: 'complete_master',
    name: 'Mestre Completo',
    icon: '🏆',
    description: 'Completou todos os módulos! Parabéns!',
    color: 'special',
    condition: (state) => Object.values(state.modules).filter(m => m.completed).length >= 8,
  },
];

// ===================================================
// CHAVE DO LOCALSTORAGE
// ===================================================
const STORAGE_KEY = 'informabas_state_v2';

// ===================================================
// ESTADO PADRÃO
// ===================================================
function createDefaultState(studentName) {
  return {
    student: {
      name: studentName || 'Aluno',
      startDate: new Date().toISOString(),
    },
    totalXP: 0,
    level: 0,  // índice no array LEVELS
    modules: {}, // { [moduleId]: { completed, currentStep, steps: {[idx]: done}, quizScore, xpEarned } }
    medals: [],  // array de IDs de medalhas conquistadas
    activities: [], // histórico de atividades
    lastActivity: null,
  };
}

// ===================================================
// FUNÇÕES DE PERSISTÊNCIA
// ===================================================

/**
 * Carrega o estado do localStorage.
 * @returns {Object|null} O estado salvo, ou null se não existir.
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('[App] Erro ao carregar estado:', e);
    return null;
  }
}

/**
 * Salva o estado no localStorage.
 * @param {Object} state - O estado a ser salvo.
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[App] Erro ao salvar estado:', e);
  }
}

/**
 * Retorna o estado atual. Se não existir, retorna null.
 * @returns {Object|null}
 */
function getState() {
  return loadState();
}

/**
 * Verifica se o aluno já está cadastrado.
 * @returns {boolean}
 */
function isStudentRegistered() {
  const state = loadState();
  return state !== null && state.student && state.student.name;
}

/**
 * Inicializa um novo estado para um aluno.
 * @param {string} name - Nome do aluno.
 */
function initStudent(name) {
  const state = createDefaultState(name);
  saveState(state);
  return state;
}

/**
 * Reseta completamente o progresso do aluno.
 */
function resetProgress() {
  const state = loadState();
  const name = state?.student?.name || 'Aluno';
  const newState = createDefaultState(name);
  saveState(newState);
  return newState;
}

// ===================================================
// FUNÇÕES DE NÍVEL E XP
// ===================================================

/**
 * Retorna a configuração do nível atual baseado no XP.
 * @param {number} xp - XP total do aluno.
 * @returns {Object} Configuração do nível.
 */
function getLevelInfo(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) {
      return { ...LEVELS[i], index: i };
    }
  }
  return { ...LEVELS[0], index: 0 };
}

/**
 * Calcula o progresso percentual dentro do nível atual.
 * @param {number} xp - XP total do aluno.
 * @returns {number} Percentual de 0 a 100.
 */
function getLevelProgress(xp) {
  const current = getLevelInfo(xp);
  const next = LEVELS[current.index + 1];
  if (!next) return 100; // Nível máximo
  const range = next.min - current.min;
  const gained = xp - current.min;
  return Math.min(100, Math.round((gained / range) * 100));
}

/**
 * Adiciona XP ao aluno e verifica level-up.
 * @param {number} amount - Quantidade de XP.
 * @param {string} reason - Motivo do XP (para toast).
 * @param {Event} [sourceEvent] - Evento DOM para posicionar o popup.
 */
function addXP(amount, reason = '', sourceEvent = null) {
  const state = loadState();
  if (!state) return;

  const oldLevel = getLevelInfo(state.totalXP);
  state.totalXP += amount;
  const newLevel = getLevelInfo(state.totalXP);

  // Registra atividade
  state.activities = state.activities || [];
  state.activities.unshift({
    type: 'xp',
    text: reason || `+${amount} XP`,
    xp: amount,
    timestamp: new Date().toISOString(),
  });
  // Mantém apenas as últimas 20 atividades
  if (state.activities.length > 20) state.activities.pop();

  state.lastActivity = new Date().toISOString();

  saveState(state);

  // Exibe popup de XP
  if (sourceEvent) {
    showXPPopup(amount, sourceEvent.clientX, sourceEvent.clientY);
  } else {
    // Posição padrão (canto superior direito)
    showXPPopup(amount, window.innerWidth - 80, 80);
  }

  // Verifica level-up
  if (newLevel.index > oldLevel.index) {
    setTimeout(() => {
      showLevelUpCelebration(newLevel);
    }, 800);
  }

  // Verifica novas medalhas
  checkAndAwardMedals(state);

  // Atualiza a barra de XP se existir na página
  updateXPDisplay();

  return state;
}

// ===================================================
// FUNÇÕES DE MÓDULOS
// ===================================================

/**
 * Verifica se um módulo está desbloqueado.
 * @param {number} moduleId - ID do módulo (1-8).
 * @returns {boolean}
 */
function isModuleUnlocked(moduleId) {
  const state = loadState();
  if (!state) return moduleId === 1;
  const config = MODULES_CONFIG.find(m => m.id === moduleId);
  if (!config) return false;
  return state.totalXP >= config.unlockAt;
}

/**
 * Retorna o progresso de um módulo.
 * @param {number} moduleId - ID do módulo.
 * @returns {Object}
 */
function getModuleProgress(moduleId) {
  const state = loadState();
  if (!state || !state.modules[moduleId]) {
    return { completed: false, currentStep: 0, steps: {}, quizScore: 0, xpEarned: 0 };
  }
  return state.modules[moduleId];
}

/**
 * Marca um passo do módulo como concluído.
 * @param {number} moduleId - ID do módulo.
 * @param {number} stepIndex - Índice do passo (0-4).
 * @param {number} [xp=10] - XP a ganhar.
 */
function completeStep(moduleId, stepIndex, xp = 10) {
  const state = loadState();
  if (!state) return;

  if (!state.modules[moduleId]) {
    state.modules[moduleId] = { completed: false, currentStep: 0, steps: {}, quizScore: 0, xpEarned: 0 };
  }

  const mod = state.modules[moduleId];

  // Só dá XP se este passo não foi feito antes
  if (!mod.steps[stepIndex]) {
    mod.steps[stepIndex] = true;
    mod.currentStep = Math.max(mod.currentStep, stepIndex + 1);
    mod.xpEarned = (mod.xpEarned || 0) + xp;
    saveState(state);
    addXP(xp, `Passo ${stepIndex + 1} do Módulo ${moduleId} concluído!`);
  } else {
    // Passo já concluído, apenas avança sem dar XP
    mod.currentStep = Math.max(mod.currentStep, stepIndex + 1);
    saveState(state);
  }
}

/**
 * Registra a pontuação do quiz de um módulo.
 * @param {number} moduleId - ID do módulo.
 * @param {number} score - Pontuação de 0 a 100.
 */
function saveQuizScore(moduleId, score) {
  const state = loadState();
  if (!state) return;

  if (!state.modules[moduleId]) {
    state.modules[moduleId] = { completed: false, currentStep: 0, steps: {}, quizScore: 0, xpEarned: 0 };
  }

  state.modules[moduleId].quizScore = Math.max(state.modules[moduleId].quizScore || 0, score);
  saveState(state);
}

/**
 * Marca um módulo como completamente concluído.
 * @param {number} moduleId - ID do módulo.
 * @param {number} quizScore - Pontuação final do quiz.
 */
function completeModule(moduleId, quizScore = 100) {
  const state = loadState();
  if (!state) return;

  if (!state.modules[moduleId]) {
    state.modules[moduleId] = { completed: false, currentStep: 0, steps: {}, quizScore: 0, xpEarned: 0 };
  }

  const mod = state.modules[moduleId];
  const config = MODULES_CONFIG.find(m => m.id === moduleId);

  if (!mod.completed) {
    mod.completed = true;
    mod.quizScore = quizScore;
    mod.completedAt = new Date().toISOString();

    // Adiciona atividade
    state.activities = state.activities || [];
    state.activities.unshift({
      type: 'module',
      text: `Módulo ${moduleId} — ${config?.title} concluído!`,
      xp: config?.xpReward || 50,
      timestamp: new Date().toISOString(),
    });

    saveState(state);

    // Dá XP do módulo
    const xpBonus = config ? config.xpReward : 50;
    addXP(xpBonus, `🎉 Módulo ${moduleId} concluído! +${xpBonus} XP`);

    // Verifica medalhas
    const freshState = loadState();
    checkAndAwardMedals(freshState);
  }
}

// ===================================================
// FUNÇÕES DE MEDALHAS
// ===================================================

/**
 * Verifica e concede novas medalhas baseado no estado.
 * @param {Object} state - Estado atual do aluno.
 */
function checkAndAwardMedals(state) {
  if (!state) return;

  const currentMedals = state.medals || [];
  const newMedals = [];

  MEDALS_CONFIG.forEach(medal => {
    if (!currentMedals.includes(medal.id) && medal.condition(state)) {
      newMedals.push(medal.id);
    }
  });

  if (newMedals.length > 0) {
    state.medals = [...currentMedals, ...newMedals];
    saveState(state);

    // Exibe notificação para cada nova medalha
    newMedals.forEach((medalId, i) => {
      const medal = MEDALS_CONFIG.find(m => m.id === medalId);
      if (medal) {
        setTimeout(() => {
          showToast('xp', `${medal.icon} Nova Conquista!`, medal.name);
        }, i * 800);
      }
    });
  }
}

/**
 * Retorna as medalhas conquistadas pelo aluno.
 * @returns {Array}
 */
function getEarnedMedals() {
  const state = loadState();
  if (!state || !state.medals) return [];
  return state.medals;
}

// ===================================================
// FUNÇÕES DE UI (TOAST, POPUP, MODAL)
// ===================================================

/**
 * Exibe uma notificação toast.
 * @param {string} type - 'info', 'success', 'warning', 'error', 'xp'
 * @param {string} title - Título da notificação.
 * @param {string} [message] - Mensagem adicional.
 * @param {number} [duration=3500] - Duração em ms.
 */
function showToast(type = 'info', title = '', message = '', duration = 3500) {
  // Garante que o container existe
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    xp: '⭐',
    medal: '🏅',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '📢'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  // Remove o toast após a duração
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Exibe um popup flutuante de XP.
 * @param {number} amount - Quantidade de XP.
 * @param {number} x - Posição X na tela.
 * @param {number} y - Posição Y na tela.
 */
function showXPPopup(amount, x, y) {
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.textContent = `+${amount} XP`;
  popup.style.left = `${x - 30}px`;
  popup.style.top  = `${y - 20}px`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1800);
}

/**
 * Exibe a celebração de level-up.
 * @param {Object} level - Objeto de configuração do nível.
 */
function showLevelUpCelebration(level) {
  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.innerHTML = `
    <div class="celebration-card">
      <span class="celebration-emoji">${level.icon}</span>
      <h2 style="font-size:26px; margin-bottom:8px;">Nível Alcançado!</h2>
      <div style="font-size:32px; font-weight:900; font-family:var(--font-heading); color:var(--primary); margin-bottom:12px;">
        ${level.name}
      </div>
      <p style="color:var(--text-secondary); margin-bottom:24px;">
        Parabéns! Você avançou para um novo nível.<br>Continue assim!
      </p>
      <div class="stars-row">
        <span class="star-item">⭐</span>
        <span class="star-item">⭐</span>
        <span class="star-item">⭐</span>
      </div>
      <button class="btn btn-primary btn-lg" style="margin-top:24px;" onclick="this.closest('.celebration-overlay').remove()">
        🚀 Continuar
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
  playSound('levelup');
  setTimeout(() => overlay.remove(), 8000);
}

/**
 * Exibe celebração de conclusão de módulo.
 * @param {number} moduleId - ID do módulo concluído.
 * @param {number} score - Pontuação do quiz.
 */
function showModuleComplete(moduleId, score) {
  const config = MODULES_CONFIG.find(m => m.id === moduleId);
  const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;
  const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.id = 'module-complete-overlay';
  overlay.innerHTML = `
    <div class="celebration-card">
      <span class="celebration-emoji">${config?.icon || '🎉'}</span>
      <h2 style="font-size:24px; margin-bottom:6px;">Módulo Concluído!</h2>
      <div style="font-size:18px; font-weight:700; color:var(--text-secondary); margin-bottom:16px;">
        ${config?.title || ''}
      </div>
      <div class="stars-row">
        ${Array.from({length: 3}, (_, i) => `<span class="star-item" style="color:${i < stars ? '#F59E0B' : '#E2E8F0'}">${i < stars ? '⭐' : '☆'}</span>`).join('')}
      </div>
      <div style="margin: 16px 0; padding: 12px 20px; background: var(--warning-light); border-radius: var(--radius); display:inline-block;">
        <span style="font-size:22px; font-weight:900; font-family:var(--font-heading); color:var(--warning);">
          +${config?.xpReward || 50} XP
        </span>
      </div>
      <p style="color:var(--text-secondary); margin-bottom:24px; font-size:15px;">
        Pontuação no Quiz: <strong>${score}%</strong><br>
        Você está indo muito bem! 🚀
      </p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <a href="../dashboard.html" class="btn btn-outline">
          🏠 Dashboard
        </a>
        ${moduleId < 8 ? `
        <a href="module${moduleId + 1}.html" class="btn btn-primary">
          Próximo Módulo →
        </a>
        ` : `
        <button class="btn btn-success" onclick="generateCertificate()">
          📜 Gerar Certificado
        </button>
        `}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  playSound('complete');
}

// ===================================================
// FUNÇÕES DE SOM (WEB AUDIO API)
// ===================================================

/** Contexto de áudio global */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Toca um som de feedback.
 * @param {string} type - 'correct', 'incorrect', 'xp', 'complete', 'levelup', 'click'
 */
function playSound(type) {
  try {
    const ctx = getAudioContext();

    // Verifica se está bloqueado (alguns navegadores exigem interação do usuário)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'correct': {
        // Som ascendente (correto!)
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.3);
        });
        break;
      }
      case 'incorrect': {
        // Som descendente (errado)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'xp': {
        // Som de moeda / XP
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'complete': {
        // Fanfarra de conclusão
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.5);
        });
        break;
      }
      case 'levelup': {
        // Som épico de level up
        const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        melody.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0.3, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        });
        break;
      }
      case 'click': {
        // Clique sutil
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
    }
  } catch (e) {
    // Som não disponível, ignora silenciosamente
  }
}

// ===================================================
// FUNÇÕES DE ATUALIZAÇÃO DE UI
// ===================================================

/**
 * Atualiza todos os elementos de XP na página atual.
 * Chamado após qualquer mudança de XP.
 */
function updateXPDisplay() {
  const state = loadState();
  if (!state) return;

  const xp = state.totalXP;
  const levelInfo = getLevelInfo(xp);
  const progress = getLevelProgress(xp);
  const nextLevel = LEVELS[levelInfo.index + 1];

  // Atualiza elementos com data-xp-display
  document.querySelectorAll('[data-xp-display]').forEach(el => {
    el.textContent = xp;
  });

  // Atualiza barras de XP
  document.querySelectorAll('[data-xp-bar]').forEach(el => {
    el.style.width = progress + '%';
  });

  // Atualiza nome do nível
  document.querySelectorAll('[data-level-name]').forEach(el => {
    el.textContent = `${levelInfo.icon} ${levelInfo.name}`;
  });

  // Atualiza XP para próximo nível
  document.querySelectorAll('[data-xp-next]').forEach(el => {
    if (nextLevel) {
      el.textContent = `${nextLevel.min - xp} XP para ${nextLevel.name}`;
    } else {
      el.textContent = 'Nível Máximo! 🏆';
    }
  });
}

/**
 * Formata a data/hora de forma amigável.
 * @param {string} isoString - String ISO de data.
 * @returns {string}
 */
function formatTimeAgo(isoString) {
  if (!isoString) return 'nunca';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffH < 24) return `${diffH}h atrás`;
  if (diffD < 7) return `${diffD} dia${diffD > 1 ? 's' : ''} atrás`;
  return date.toLocaleDateString('pt-BR');
}

/**
 * Calcula a carga horária total completada (estimativa).
 * @returns {number} Horas completadas.
 */
function calcHoursCompleted() {
  const state = loadState();
  if (!state) return 0;
  const completedModules = Object.values(state.modules).filter(m => m.completed).length;
  return completedModules * 5; // ~5h por módulo
}

// ===================================================
// PROTEÇÃO DE ROTA — Redireciona se não cadastrado
// ===================================================

/**
 * Verifica se o aluno está cadastrado.
 * Se não estiver, redireciona para index.html.
 */
function requireStudent() {
  if (!isStudentRegistered()) {
    window.location.href = getBasePath() + 'index.html';
  }
}

/**
 * Retorna o caminho base relativo ao arquivo atual.
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/modules/')) return '../';
  return '';
}

// ===================================================
// EXPORTAÇÃO GLOBAL
// ===================================================
window.App = {
  // Config
  MODULES_CONFIG,
  LEVELS,
  MEDALS_CONFIG,

  // Estado
  loadState,
  saveState,
  getState,
  isStudentRegistered,
  initStudent,
  resetProgress,
  requireStudent,

  // XP e Nível
  addXP,
  getLevelInfo,
  getLevelProgress,

  // Módulos
  isModuleUnlocked,
  getModuleProgress,
  completeStep,
  saveQuizScore,
  completeModule,

  // Medalhas
  checkAndAwardMedals,
  getEarnedMedals,
  MEDALS_CONFIG,

  // UI
  showToast,
  showXPPopup,
  showLevelUpCelebration,
  showModuleComplete,
  updateXPDisplay,
  formatTimeAgo,
  calcHoursCompleted,
  getBasePath,

  // Som
  playSound,
};
