/* ==========================================================================
   navegacao.js  -  Semana 1: Navegação e Controle de Fluxo (Visão do Gerente)
   --------------------------------------------------------------------------
   Responsabilidades:
   1. Sessão simulada (localStorage / sessionStorage)
   2. Proteção de páginas (precisa estar logado / só gerente)
   3. Menu lateral: marcar item ativo e tratar o "Sair"
   4. Navegação genérica via atributo data-navegar="pagina.html"
   5. Preencher o nome do usuário no cabeçalho
   6. Tratar o formulário de login (#form-login)

   Uso: <script src="js/navegacao.js"></script> no <head> de TODAS as páginas.
   (Sem ES Modules de propósito: <script type="module"> não funciona abrindo
   o HTML direto do disco, via file://.)
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Configuração ---------- */
  const CHAVE_SESSAO = 'hotelpet:sessao';

  const PAGINAS_PUBLICAS = ['login.html', 'criar_conta.html'];

  // Páginas que só o Gerente pode abrir
  const PAGINAS_SO_GERENTE = [
    'configuracoes.html',
    'listagem_usuarios.html',
    'ver_usuario.html',
    'editar_usuario.html',
    'novo_usuario.html'
  ];

  // Qual item do menu fica "ativo" em cada página
  const SECOES = {
    pets: ['index.html', 'novo_pet.html', 'editar_pet.html', 'ver_pet.html'],
    reservas: ['listagem_reservas.html', 'nova_reserva.html', 'editar_reserva.html', 'ver_reserva.html'],
    usuarios: ['listagem_usuarios.html', 'ver_usuario.html', 'editar_usuario.html', 'novo_usuario.html'],
    configuracoes: ['configuracoes.html']
  };

  // Menu -> página "raiz" da seção (o href do link do menu)
  const RAIZ_DA_SECAO = {
    pets: 'index.html',
    reservas: 'listagem_reservas.html',
    usuarios: 'listagem_usuarios.html',
    configuracoes: 'configuracoes.html'
  };

  const paginaAtual = () => decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';

  /* ---------- 1. Sessão ---------- */
  const Sessao = {
    // lembrar = true  -> localStorage   (sobrevive ao fechar o navegador)
    // lembrar = false -> sessionStorage (some ao fechar a aba)
    entrar(dados, lembrar) {
      this.sair();
      const armazenamento = lembrar ? localStorage : sessionStorage;
      armazenamento.setItem(CHAVE_SESSAO, JSON.stringify(dados));
    },

    obter() {
      try {
        const bruto = localStorage.getItem(CHAVE_SESSAO) ?? sessionStorage.getItem(CHAVE_SESSAO);
        return bruto ? JSON.parse(bruto) : null;
      } catch (erro) {
        return null; // JSON corrompido ou storage bloqueado
      }
    },

    sair() {
      localStorage.removeItem(CHAVE_SESSAO);
      sessionStorage.removeItem(CHAVE_SESSAO);
    },

    estaLogado() { return this.obter() !== null; },

    ehGerente() {
      const s = this.obter();
      return s !== null && s.perfil === 'Gerente';
    }
  };

  /* ---------- 2. Navegação ---------- */
  const Navegacao = {
    ir(pagina) { location.href = pagina; },

    // Retorna false se redirecionou (aí o resto do script não precisa rodar)
    proteger() {
      const pagina = paginaAtual();
      const publica = PAGINAS_PUBLICAS.includes(pagina);

      if (!Sessao.estaLogado() && !publica) {
        location.replace('login.html');
        return false;
      }
      if (Sessao.estaLogado() && pagina === 'login.html') {
        location.replace('index.html');
        return false;
      }
      if (PAGINAS_SO_GERENTE.includes(pagina) && !Sessao.ehGerente()) {
        location.replace('index.html');
        return false;
      }
      return true;
    },

    marcarMenuAtivo() {
      const pagina = paginaAtual();
      const secao = Object.keys(SECOES).find((chave) => SECOES[chave].includes(pagina));

      document.querySelectorAll('.sidebar-nav a').forEach((link) => link.classList.remove('active'));
      if (!secao) return; // ex.: editor_perfil.html não pertence a nenhuma seção

      const link = document.querySelector(`.sidebar-nav a[href="${RAIZ_DA_SECAO[secao]}"]`);
      if (link) link.classList.add('active');
    },

    // Esconde itens só-gerente do menu para quem não é gerente
    aplicarPermissoesNoMenu() {
      if (Sessao.ehGerente()) return;
      PAGINAS_SO_GERENTE.forEach((pagina) => {
        document.querySelectorAll(`.sidebar-nav a[href="${pagina}"]`).forEach((a) => {
          a.parentElement.style.display = 'none';
        });
      });
    },

    preencherCabecalho() {
      const sessao = Sessao.obter();
      if (!sessao) return;
      const span = document.querySelector('.header-user span');
      if (span) { span.textContent = sessao.nome; span.title = sessao.perfil; }
    },

    // Delegação de eventos: UM listener no document cobre todos os cliques
    ligarEventosDeClique() {
      document.addEventListener('click', (evento) => {
        // Qualquer elemento com data-navegar="pagina.html"
        const alvo = evento.target.closest('[data-navegar]');
        if (alvo) {
          evento.preventDefault();
          Navegacao.ir(alvo.dataset.navegar);
          return;
        }
        // Link "Sair" do menu (ou qualquer elemento com data-sair)
        const sair = evento.target.closest('[data-sair], .sidebar-nav a[href="login.html"]');
        if (sair) Sessao.sair(); // depois o link segue normalmente para login.html
      });
    },

    ligarFormularioDeLogin() {
      const form = document.getElementById('form-login');
      if (!form) return;

      form.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const usuario = form.elements['login'].value.trim();
        if (!usuario) return;

        // Simulação (não há backend): qualquer login entra como o gerente do protótipo
        Sessao.entrar(
          { nome: 'João da Silva', login: usuario, perfil: 'Gerente' },
          document.getElementById('lembrar')?.checked ?? false
        );
        Navegacao.ir('index.html');
      });
    }
  };

  /* ---------- Inicialização ---------- */
  // O guarda roda imediatamente (antes de desenhar a página)
  if (!Navegacao.proteger()) return;

  document.addEventListener('DOMContentLoaded', () => {
    Navegacao.marcarMenuAtivo();
    Navegacao.aplicarPermissoesNoMenu();
    Navegacao.preencherCabecalho();
    Navegacao.ligarEventosDeClique();
    Navegacao.ligarFormularioDeLogin();
  });

  // Exposto para uso em outros scripts: HotelPet.Sessao.obter() etc.
  window.HotelPet = { Sessao, Navegacao };
})();
