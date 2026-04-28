/* ============================================================
   SEDUÇÃO LINGERIE — script.js
   Funcionalidades: navbar, scroll suave, reveal, filtros,
   máscara de telefone, validação, WhatsApp integration
   ============================================================ */

/* ---- Número do WhatsApp da loja (altere aqui) ---- */
const WHATSAPP_NUMBER = '5581999999999';

/* ============================================================
   1. NAVBAR — scroll effect & active link
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Adiciona classe "scrolled" ao rolar
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Fecha o menu mobile ao clicar em um link
  const navLinks = document.querySelectorAll('.nav-link');
  const navMenu  = document.getElementById('navMenu');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navMenu && navMenu.classList.contains('show')) {
        const toggler = document.querySelector('.navbar-toggler');
        if (toggler) toggler.click();
      }
    });
  });
})();

/* ============================================================
   2. SCROLL SUAVE — links de âncora
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Offset para compensar o navbar fixo
      const navbarHeight = document.getElementById('navbar')
        ? document.getElementById('navbar').offsetHeight
        : 70;

      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   3. ACTIVE NAV LINK — highlight baseado na seção visível
   ============================================================ */
(function initActiveLink() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');
  const navHeight = 80;

  function setActive() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - navHeight - 10;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

/* ============================================================
   4. SCROLL REVEAL — animação ao entrar na viewport
   ============================================================ */
(function initScrollReveal() {
  // Adiciona classes reveal nos elementos de interesse
  const selectors = [
    '.produto-card',
    '.depoimento-card',
    '.valor-item',
    '.section-header',
    '.sobre-text',
  ];

  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal');
      // Stagger delay para cards em grid
      if (i < 6) {
        el.classList.add('reveal-delay-' + (i + 1));
      }
    });
  });

  // Seção sobre — reveal direcional
  const sobreImg = document.querySelector('.sobre-image-wrap');
  const sobreTexts = document.querySelectorAll('.sobre-text, .sobre-valores');
  if (sobreImg)   sobreImg.classList.add('reveal-left');
  sobreTexts.forEach(function (el) { el.classList.add('reveal-right'); });

  // IntersectionObserver
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ============================================================
   5. FILTRO DE PRODUTOS
   ============================================================ */
(function initFiltros() {
  const btns  = document.querySelectorAll('.filtro-btn');
  const items = document.querySelectorAll('.produto-item');

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Atualiza botão ativo
      btns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      const filtro = this.getAttribute('data-filtro');

      items.forEach(function (item) {
        const cat = item.getAttribute('data-categoria');

        if (filtro === 'todos' || cat === filtro) {
          // Mostra com animação
          item.style.display = '';
          item.style.opacity  = '0';
          item.style.transform = 'translateY(20px)';
          // Força reflow
          void item.offsetWidth;
          item.style.transition = 'opacity .4s ease, transform .4s ease';
          item.style.opacity    = '1';
          item.style.transform  = 'translateY(0)';
        } else {
          // Esconde
          item.style.opacity   = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(function () {
            item.style.display = 'none';
          }, 350);
        }
      });
    });
  });
})();

/* ============================================================
   6. MÁSCARA DE TELEFONE — (XX) XXXXX-XXXX
   ============================================================ */
(function initPhoneMask() {
  const phoneInput = document.getElementById('telefone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, ''); // apenas dígitos

    if (v.length > 11) v = v.slice(0, 11);

    // Formata progressivamente
    let formatted = '';
    if (v.length > 0)  formatted  = '(' + v.slice(0, 2);
    if (v.length > 2)  formatted += ') ' + v.slice(2, 7);
    if (v.length > 7)  formatted += '-' + v.slice(7, 11);
    else if (v.length > 2) formatted += v.slice(7);

    e.target.value = formatted;
  });

  // Garante que só digits ao colar
  phoneInput.addEventListener('paste', function (e) {
    setTimeout(function () {
      phoneInput.dispatchEvent(new Event('input'));
    }, 0);
  });
})();

/* ============================================================
   7. VALIDAÇÃO DO FORMULÁRIO DE AGENDAMENTO
   ============================================================ */
function validarFormulario() {
  let valido = true;

  // Helper: mostra/limpa erro
  function setErro(id, msg) {
    const el = document.getElementById('erro-' + id);
    if (!el) return;
    el.textContent = msg;

    const input = document.getElementById(id);
    if (input) {
      if (msg) {
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    }
  }

  // Nome
  const nome = document.getElementById('nome');
  if (!nome || nome.value.trim().length < 3) {
    setErro('nome', 'Por favor, informe seu nome completo.');
    valido = false;
  } else {
    setErro('nome', '');
  }

  // Telefone — mínimo 14 chars: (XX) XXXXX-XXXX
  const tel = document.getElementById('telefone');
  if (!tel || tel.value.replace(/\D/g, '').length < 10) {
    setErro('telefone', 'Informe um telefone válido com DDD.');
    valido = false;
  } else {
    setErro('telefone', '');
  }

  // Produto
  const produto = document.getElementById('produto');
  if (!produto || !produto.value) {
    setErro('produto', 'Selecione o tipo de produto desejado.');
    valido = false;
  } else {
    setErro('produto', '');
  }

  // Data — não pode ser no passado
  const data = document.getElementById('data');
  if (!data || !data.value) {
    setErro('data', 'Selecione uma data.');
    valido = false;
  } else {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSel = new Date(data.value + 'T00:00:00');
    if (dataSel < hoje) {
      setErro('data', 'A data não pode ser no passado.');
      valido = false;
    } else {
      setErro('data', '');
    }
  }

  // Horário
  const horario = document.getElementById('horario');
  if (!horario || !horario.value) {
    setErro('horario', 'Selecione um horário.');
    valido = false;
  } else {
    setErro('horario', '');
  }

  return valido;
}

/* ============================================================
   8. ENVIO PARA WHATSAPP — Agendamento
   ============================================================ */
function enviarAgendamento() {
  if (!validarFormulario()) {
    // Rola até o primeiro erro
    const primeiroErro = document.querySelector('.input-custom.error');
    if (primeiroErro) {
      primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Coleta valores
  const nome       = document.getElementById('nome').value.trim();
  const telefone   = document.getElementById('telefone').value.trim();
  const produto    = document.getElementById('produto').value;
  const data       = document.getElementById('data').value;
  const horario    = document.getElementById('horario').value;
  const obs        = document.getElementById('observacoes').value.trim() || 'Nenhuma';

  // Formata a data para exibição
  const dataFormatada = formatarData(data);

  // Monta mensagem
  const mensagem =
    'Olá, gostaria de agendar um atendimento na Sedução Lingerie.\n\n' +
    '👤 *Nome:* ' + nome + '\n' +
    '📱 *Telefone:* ' + telefone + '\n' +
    '👗 *Produto de interesse:* ' + produto + '\n' +
    '📅 *Data:* ' + dataFormatada + '\n' +
    '🕐 *Horário:* ' + horario + '\n' +
    '📝 *Observações:* ' + obs;

  // Codifica a mensagem para URL
  const mensagemCodificada = encodeURIComponent(mensagem);

  // Abre WhatsApp
  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + mensagemCodificada;
  window.open(url, '_blank');
}

/* ============================================================
   9. COMPRAR VIA WHATSAPP — Produtos
   ============================================================ */
function comprarWhatsApp(nomeProduto, preco) {
  const mensagem =
    'Olá! Tenho interesse em comprar via Sedução Lingerie. 💕\n\n' +
    '🛍️ *Produto:* ' + nomeProduto + '\n' +
    '💰 *Preço:* ' + preco + '\n\n' +
    'Poderia me ajudar com mais informações e disponibilidade?';

  const mensagemCodificada = encodeURIComponent(mensagem);
  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + mensagemCodificada;
  window.open(url, '_blank');
}

/* ============================================================
   10. HELPERS
   ============================================================ */

/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY
 */
function formatarData(iso) {
  if (!iso) return '';
  const partes = iso.split('-');
  if (partes.length !== 3) return iso;
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

/**
 * Define data mínima do input de data (hoje)
 */
(function setDataMinima() {
  const dataInput = document.getElementById('data');
  if (!dataInput) return;

  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia  = String(hoje.getDate()).padStart(2, '0');

  dataInput.setAttribute('min', ano + '-' + mes + '-' + dia);
})();

/* ============================================================
   11. HERO — subtle parallax no scroll
   ============================================================ */
(function initParallax() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    // Move as pétalas decorativas levemente
    const petals = hero.querySelectorAll('.petal');
    petals.forEach(function (petal, i) {
      const speed = (i + 1) * 0.15;
      petal.style.transform = 'translateY(' + (scrollY * speed) + 'px) rotate(' + (45 + i * 15) + 'deg)';
    });
  }, { passive: true });
})();

/* ============================================================
   12. LIMPAR ERROS ao digitar
   ============================================================ */
(function initClearErrors() {
  const campos = ['nome', 'telefone', 'produto', 'data', 'horario'];
  campos.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      const erro = document.getElementById('erro-' + id);
      if (erro) erro.textContent = '';
      el.classList.remove('error');
    });
    el.addEventListener('change', function () {
      const erro = document.getElementById('erro-' + id);
      if (erro) erro.textContent = '';
      el.classList.remove('error');
    });
  });
})();

/* ============================================================
   Exposição global (usada nos onclick do HTML)
   ============================================================ */
window.comprarWhatsApp    = comprarWhatsApp;
window.enviarAgendamento  = enviarAgendamento;
