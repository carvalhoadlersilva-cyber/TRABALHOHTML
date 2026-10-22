/**
 * app.js - Módulo Único de Navegação e Estado (Visão do Gerente)
 * Hotel Pet - Programação Web II
 */

// 1. DADOS SIMULADOS DA SESSÃO DO GERENTE
const USUARIO_LOGADO = {
  id: 1,
  nome: 'João da Silva',
  cargo: 'Gerente',
  avatar: 'perfil_gerente.png'
};

// 2. EXECUTADO QUANDO O DOM ESTIVER PRONTO
document.addEventListener('DOMContentLoaded', () => {
  renderizarCabecalho();
  destacarMenuAtivo();
  configurarEventosNavegacao();
});

/**
 * Preenche a foto e nome do Gerente no cabeçalho superior
 */
function renderizarCabecalho() {
  const headerUser = document.querySelector('.header-user');
  if (headerUser) {
    headerUser.innerHTML = `
      <a href="editar_perfil.html" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit;">
        <img src="${USUARIO_LOGADO.avatar}" alt="Foto do Gerente" class="avatar" style="width: 40px; height: 40px; border-radius: 50%;">
        <span>${USUARIO_LOGADO.nome} (${USUARIO_LOGADO.cargo})</span>
      </a>
    `;
  }
}

/**
 * Identifica a página atual e marca a classe '.active' no menu correto
 */
function destacarMenuAtivo() {
  // Pega o nome do arquivo atual (ex: 'listagem_usuarios.html')
  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
  const linksMenu = document.querySelectorAll('.app-sidebar a, nav a');

  linksMenu.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('active');

    // Regra de correspondência para páginas principais e telas de ação/filhas
    if (paginaAtual === href) {
      link.classList.add('active');
    } else if ((href === 'index.html' || href === 'pets.html') && paginaAtual.includes('pet')) {
      link.classList.add('active');
    } else if (href === 'listagem_reservas.html' && paginaAtual.includes('reserva')) {
      link.classList.add('active');
    } else if (href === 'listagem_usuarios.html' && paginaAtual.includes('usuario')) {
      link.classList.add('active');
    } else if (href === 'configuracoes.html' && paginaAtual.includes('configuracoes')) {
      link.classList.add('active');
    }
  });
}

/**
 * Intercepta ou configura botões de voltar e cancelamento
 */
function configurarEventosNavegacao() {
  // Configura ação para botões que possuem a classe '.btn-voltar'
  const botoesVoltar = document.querySelectorAll('.btn-voltar');
  botoesVoltar.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });
  });
}

/**
 * Função global para redirecionar passando ID via Query String
 * Exemplo de uso em tabela: irPara('ver_reserva.html', 1234)
 */
function irPara(pagina, id = null) {
  if (id) {
    window.location.href = `${pagina}?id=${id}`;
  } else {
    window.location.href = pagina;
  }
}

/**
 * Função utilitária para capturar parâmetros da URL na tela de destino
 * Exemplo: na tela ver_reserva.html?id=1234 -> obterParametroUrl('id') retorna "1234"
 */
function obterParametroUrl(chave) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(chave);
}