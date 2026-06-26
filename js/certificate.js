/* =====================================================
   JORNADA DA INFORMÁTICA BÁSICA
   Geração de Certificado — certificate.js
   Gera certificado em PDF usando html2canvas + jsPDF
   ===================================================== */

'use strict';

/**
 * Gera o certificado PDF do aluno.
 * Requer html2canvas e jsPDF via CDN.
 */
async function generateCertificate() {
  const state = App.loadState();
  if (!state) {
    App.showToast('error', 'Erro', 'Dados do aluno não encontrados.');
    return;
  }

  // Verifica se todos os módulos foram concluídos
  const completedCount = Object.values(state.modules || {}).filter(m => m.completed).length;
  if (completedCount < 8) {
    App.showToast('warning', 'Atenção',
      `Você concluiu ${completedCount}/8 módulos. Complete todos os módulos para gerar o certificado.`);
    return;
  }

  App.showToast('info', '📜 Gerando Certificado...', 'Aguarde um momento.');

  const studentName = state.student?.name || 'Aluno';
  const completionDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  // Cria elemento HTML temporário do certificado
  const certEl = document.createElement('div');
  certEl.id = 'cert-render';
  certEl.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 1122px;
    height: 793px;
    background: white;
    font-family: 'Georgia', serif;
    overflow: hidden;
  `;

  certEl.innerHTML = `
    <div style="
      width:100%; height:100%;
      background: linear-gradient(135deg, #F8F9FF 0%, #EEF2FF 100%);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      box-sizing: border-box;
    ">
      <!-- Borda decorativa -->
      <div style="
        position:absolute; inset:20px;
        border: 3px solid #4F46E5;
        border-radius: 16px;
        pointer-events:none;
      "></div>
      <div style="
        position:absolute; inset:26px;
        border: 1px solid #818CF8;
        border-radius: 12px;
        pointer-events:none;
      "></div>

      <!-- Brasão / Logo -->
      <div style="
        width:90px; height:90px;
        background: linear-gradient(135deg, #4F46E5, #7C3AED);
        border-radius: 50%;
        display:flex; align-items:center; justify-content:center;
        font-size:42px;
        box-shadow: 0 8px 30px rgba(79,70,229,0.35);
        margin-bottom: 24px;
      ">🖥️</div>

      <!-- Título -->
      <div style="font-size:14px; font-weight:600; letter-spacing:4px; text-transform:uppercase; color:#6366F1; margin-bottom:8px;">
        CERTIFICADO DE CONCLUSÃO
      </div>

      <div style="font-size:28px; font-weight:800; font-family:'Georgia',serif; color:#1E293B; margin-bottom:4px;">
        Jornada da Informática Básica
      </div>

      <!-- Linha decorativa -->
      <div style="width:200px; height:3px; background:linear-gradient(90deg,#4F46E5,#7C3AED); border-radius:3px; margin:20px 0;"></div>

      <!-- Texto principal -->
      <div style="font-size:15px; color:#475569; margin-bottom:8px; text-align:center; line-height:1.6;">
        Certificamos que
      </div>

      <!-- Nome do aluno -->
      <div style="
        font-size:38px;
        font-family:'Georgia', serif;
        font-weight:700;
        color:#1E293B;
        margin-bottom:8px;
        text-align:center;
        border-bottom: 2px solid #C7D2FE;
        padding-bottom: 8px;
        min-width: 400px;
        text-align: center;
      ">
        ${studentName}
      </div>

      <!-- Texto de conclusão -->
      <div style="font-size:15px; color:#475569; margin: 16px 0 24px; text-align:center; line-height:1.7; max-width:600px;">
        concluiu com êxito o curso de <strong>Informática Básica</strong>,<br>
        completando os <strong>8 módulos</strong> com carga horária total de <strong>40 horas</strong>,<br>
        abrangendo: Computador, Teclado, Atalhos, Explorador de Arquivos,<br>
        Internet, Segurança Digital, Windows e LibreOffice Writer.
      </div>

      <!-- Módulos -->
      <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-bottom:24px;">
        ${['🖥️','⌨️','⚡','📁','🌐','🛡️','🪟','✍️'].map(icon =>
          `<div style="
            width:40px; height:40px;
            background:linear-gradient(135deg,#4F46E5,#7C3AED);
            border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            font-size:18px;
          ">${icon}</div>`
        ).join('')}
      </div>

      <!-- Rodapé -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; width:100%; margin-top:auto; padding-top:20px;">
        <div style="text-align:center;">
          <div style="width:200px; height:2px; background:#CBD5E1; margin-bottom:8px;"></div>
          <div style="font-size:14px; font-weight:700; color:#1E293B;">Prof. Anderson Andrade</div>
          <div style="font-size:12px; color:#64748B;">Instrutor</div>
        </div>

        <!-- QR Code placeholder -->
        <div style="text-align:center;">
          <div style="
            width:70px; height:70px;
            background:#F1F5F9;
            border:2px solid #CBD5E1;
            border-radius:8px;
            display:flex; align-items:center; justify-content:center;
            font-size:10px; color:#94A3B8;
            margin-bottom:4px;
          ">QR Code</div>
          <div style="font-size:10px; color:#94A3B8;">Verificação</div>
        </div>

        <div style="text-align:center;">
          <div style="width:200px; height:2px; background:#CBD5E1; margin-bottom:8px;"></div>
          <div style="font-size:14px; font-weight:700; color:#1E293B;">${completionDate}</div>
          <div style="font-size:12px; color:#64748B;">Data de Conclusão</div>
        </div>
      </div>

      <!-- Marca d'água XP -->
      <div style="
        position:absolute; bottom:36px; right:50px;
        font-size:13px; color:#6366F1; font-weight:700;
        letter-spacing:2px;
      ">XP TOTAL: ${state.totalXP} ⭐</div>
    </div>
  `;

  document.body.appendChild(certEl);

  try {
    // Verifica se as bibliotecas estão disponíveis
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
      // Carrega dinamicamente se não estiver disponível
      await loadCertLibraries();
    }

    const canvas = await html2canvas(certEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
    pdf.save(`Certificado_${studentName.replace(/\s+/g, '_')}_InformaticaBasica.pdf`);

    App.showToast('success', '🎉 Certificado Gerado!', 'Seu certificado foi baixado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar certificado:', err);
    // Fallback: abre o canvas em nova aba
    App.showToast('error', 'Erro ao gerar PDF', 'Tente novamente. Verifique sua conexão.');
  } finally {
    document.body.removeChild(certEl);
  }
}

/**
 * Carrega as bibliotecas de certificado dinamicamente.
 */
function loadCertLibraries() {
  return new Promise((resolve, reject) => {
    let loaded = 0;
    const total = 2;

    function check() {
      loaded++;
      if (loaded === total) resolve();
    }

    const html2canvasScript = document.createElement('script');
    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    html2canvasScript.onload = check;
    html2canvasScript.onerror = reject;
    document.head.appendChild(html2canvasScript);

    const jspdfScript = document.createElement('script');
    jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jspdfScript.onload = check;
    jspdfScript.onerror = reject;
    document.head.appendChild(jspdfScript);
  });
}

/**
 * Mostra uma prévia do certificado em modal.
 */
function previewCertificate() {
  const state = App.loadState();
  if (!state) return;

  const modal = document.createElement('div');
  modal.className = 'modal-custom active';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:700px;">
      <div class="modal-box-header">
        <h3>📜 Prévia do Certificado</h3>
        <button class="modal-close" onclick="this.closest('.modal-custom').remove()">✕</button>
      </div>
      <div class="modal-box-body">
        <p style="color:var(--text-secondary); margin-bottom:16px;">
          Ao concluir todos os 8 módulos, você receberá este certificado.
        </p>
        <div style="
          background: linear-gradient(135deg, #EEF2FF, #F8F9FF);
          border: 2px solid #4F46E5;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          position: relative;
        ">
          <div style="font-size:48px; margin-bottom:12px;">🏆</div>
          <div style="font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#6366F1; margin-bottom:8px;">CERTIFICADO DE CONCLUSÃO</div>
          <div style="font-size:20px; font-weight:800; color:#1E293B; margin-bottom:4px;">Jornada da Informática Básica</div>
          <div style="width:100px; height:3px; background:linear-gradient(90deg,#4F46E5,#7C3AED); border-radius:3px; margin:16px auto;"></div>
          <div style="font-size:14px; color:#64748B; margin-bottom:4px;">Concedido a</div>
          <div style="font-size:28px; font-weight:700; color:#1E293B; border-bottom:2px solid #C7D2FE; padding-bottom:8px; display:inline-block; min-width:200px;">
            ${state.student?.name || 'Seu Nome'}
          </div>
          <div style="margin-top:16px; font-size:13px; color:#64748B; line-height:1.6;">
            Pela conclusão do curso de Informática Básica<br>
            com carga horária de <strong>40 horas</strong>
          </div>
        </div>
      </div>
      <div class="modal-box-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-custom').remove()">Fechar</button>
        <button class="btn btn-primary" onclick="generateCertificate(); this.closest('.modal-custom').remove()">
          📥 Gerar PDF
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Exporta globalmente
window.generateCertificate = generateCertificate;
window.previewCertificate = previewCertificate;
