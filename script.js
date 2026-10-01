// Vídeo manifesto no topo
const video = document.querySelector('.capa-video');
const controles = document.querySelector('.capa-controles');

if (video) {
  const botaoPausa = document.querySelector('[data-video="pausa"]');
  const botaoSom = document.querySelector('[data-video="som"]');
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const celular = window.matchMedia('(max-width: 700px)').matches;

  const fontes = [video.dataset.srcDesktop];
  if (celular && video.dataset.srcCelular) fontes.unshift(video.dataset.srcCelular);

  let tentativa = 0;
  const carregar = () => {
    if (tentativa >= fontes.length) {
      // sem vídeo disponível: fica a foto de capa
      video.remove();
      return;
    }
    video.src = fontes[tentativa++];
    video.load();
  };

  video.addEventListener('error', carregar);
  video.addEventListener('loadeddata', () => {
    if (controles) controles.hidden = false;
    if (!reduzirMovimento) video.play().catch(() => {});
    atualizar();
  });

  const atualizar = () => {
    if (botaoPausa) {
      const pausado = video.paused;
      botaoPausa.setAttribute('aria-pressed', String(pausado));
      botaoPausa.querySelector('.rotulo-botao').textContent = pausado ? 'Reproduzir' : 'Pausar';
      botaoPausa.querySelector('.icone-pausa').hidden = pausado;
      botaoPausa.querySelector('.icone-play').hidden = !pausado;
    }
    if (botaoSom) {
      botaoSom.setAttribute('aria-pressed', String(!video.muted));
      botaoSom.querySelector('.rotulo-botao').textContent = video.muted ? 'Ativar som' : 'Sem som';
    }
  };

  botaoPausa?.addEventListener('click', () => {
    video.paused ? video.play() : video.pause();
  });

  botaoSom?.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted && video.paused) video.play();
    atualizar();
  });

  video.addEventListener('play', atualizar);
  video.addEventListener('pause', atualizar);

  carregar();
}

// Menu no celular
const menuBotao = document.querySelector('.menu-botao');
const menu = document.getElementById('menu-principal');

if (menuBotao && menu) {
  const fecharMenu = () => {
    menu.classList.remove('aberto');
    menuBotao.setAttribute('aria-expanded', 'false');
  };

  menuBotao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    menuBotao.setAttribute('aria-expanded', String(aberto));
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', fecharMenu));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('aberto')) {
      fecharMenu();
      menuBotao.focus();
    }
  });

  window.matchMedia('(min-width: 1101px)').addEventListener('change', fecharMenu);
}

// Barra do menu ganha sombra quando gruda no topo
const barra = document.querySelector('.menu-barra');
if (barra) {
  const marcar = () => barra.classList.toggle('rolado', barra.getBoundingClientRect().top <= 0 && window.scrollY > 0);
  marcar();
  window.addEventListener('scroll', marcar, { passive: true });
}

// Destaca no menu a seção que está na tela
const linksSecao = [...document.querySelectorAll('.menu a[href^="#"]')];
if (linksSecao.length && 'IntersectionObserver' in window) {
  const porId = new Map(linksSecao.map(link => [link.getAttribute('href').slice(1), link]));
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      linksSecao.forEach(link => link.removeAttribute('aria-current'));
      porId.get(entrada.target.id)?.setAttribute('aria-current', 'location');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  porId.forEach((_, id) => {
    const secao = document.getElementById(id);
    if (secao) observador.observe(secao);
  });
}

// Modo revisão: abra qualquer página com ?revisao para ver o que precisa de confirmação
if (new URLSearchParams(location.search).has('revisao')) {
  document.documentElement.classList.add('modo-revisao');
}
