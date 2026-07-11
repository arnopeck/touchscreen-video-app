// VideoJukebox — logica applicazione per chioschi touchscreen

const VIDEO_STATES = {
  NONE: 'none',
  LOADING: 'loading',
  ERROR: 'error',
  PLAYING: 'playing'
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const TRANSITION_MS = 500;

let inactivityTimeout;
let currentVideoState = VIDEO_STATES.NONE;
let retryVideoSetup = null; // reimpostata da renderProgetto sul progetto corrente

// --- Stato del player video ---

function updateVideoState(state, errorMessage = '') {
  currentVideoState = state;
  const container = document.getElementById('videoContainer');
  const errorContainer = document.getElementById('videoErrorContainer');
  const spinner = document.getElementById('loadingSpinner');

  container.classList.remove('error', 'loading', 'playing');
  if (state === VIDEO_STATES.LOADING) container.classList.add('loading');
  if (state === VIDEO_STATES.PLAYING) container.classList.add('playing');
  if (state === VIDEO_STATES.ERROR) {
    container.classList.add('error');
    errorContainer.querySelector('.error-message').textContent = errorMessage;
  }
  errorContainer.setAttribute('aria-hidden', String(state !== VIDEO_STATES.ERROR));
  spinner.setAttribute('aria-hidden', String(state !== VIDEO_STATES.LOADING));
}

function handleVideoError(video) {
  // Contatore per singolo elemento video: anteprima e overlay falliscono
  // entrambi sullo stesso file e non devono sommarsi a vicenda
  video.tentativiErrore = (video.tentativiErrore || 0) + 1;
  if (video.tentativiErrore <= MAX_RETRY_ATTEMPTS) {
    updateVideoState(
      VIDEO_STATES.ERROR,
      `Errore nel caricamento del video. Tentativo ${video.tentativiErrore} di ${MAX_RETRY_ATTEMPTS}.`
    );
    setTimeout(() => {
      updateVideoState(VIDEO_STATES.LOADING);
      video.load();
    }, RETRY_DELAY_MS);
  } else {
    updateVideoState(VIDEO_STATES.ERROR, "Impossibile caricare il video. Contattare l'amministratore.");
  }
}

// --- Timer di inattività ---

function isVideoPlaying() {
  return ['progettoVideo', 'overlayVideo'].some(id => {
    const video = document.getElementById(id);
    return video && !video.paused && !video.ended;
  });
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  // Durante la riproduzione niente timeout: riparte da pause/ended
  if (isVideoPlaying()) return;
  inactivityTimeout = setTimeout(goHome, INACTIVITY_TIMEOUT_MS);
}

// --- Router ---

function router() {
  const hash = window.location.hash.slice(1);
  const parts = hash.split('/').filter(p => p);

  stopVideos();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (!hash || parts[0] === 'home') {
    document.title = 'VideoJukebox';
    document.getElementById('home').classList.add('active');
    renderHome();
  } else if (parts[0] === 'categoria' && parts.length === 2) {
    document.title = `VideoJukebox - ${getCategoriaNome(parts[1])}`;
    document.getElementById('categoria').classList.add('active');
    renderCategoria(parts[1]);
  } else if (parts[0] === 'categoria' && parts.length === 3 && parts[2] === 'progetti') {
    document.title = `VideoJukebox - ${getCategoriaNome(parts[1])}`;
    document.getElementById('progetti').classList.add('active');
    renderListaProgetti(parts[1]);
  } else if (parts[0] === 'categoria' && parts.length === 4 && parts[2] === 'progetto') {
    document.title = `VideoJukebox - ${getCategoriaNome(parts[1])} - ${getProgettoTitolo(parts[1], parts[3])}`;
    document.getElementById('progetto').classList.add('active');
    renderProgetto(parts[1], parts[3]);
  } else {
    goHome();
  }
}

function getCategoria(catId) {
  return data.find(c => c.id === catId);
}

function getCategoriaNome(catId) {
  const categoria = getCategoria(catId);
  return categoria ? categoria.nome_categoria : '';
}

function getProgettoTitolo(catId, projId) {
  const categoria = getCategoria(catId);
  if (!categoria) return '';
  const progetto = categoria.progetti.find(p => p.id == projId);
  return progetto ? progetto.titolo : '';
}

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}

function stopVideos() {
  ['progettoVideo', 'overlayVideo'].forEach(id => {
    const video = document.getElementById(id);
    if (video && !video.paused) {
      video.pause();
      video.currentTime = 0;
    }
  });
}

function goHome() {
  stopVideos();
  location.hash = 'home';
  enterFullscreen();
}

// --- Rendering pagine ---

function renderHome() {
  const container = document.getElementById('categorie');
  container.innerHTML = '';
  data.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.nome_categoria;
    btn.onclick = () => {
      location.hash = `categoria/${cat.id}`;
      enterFullscreen();
    };
    container.appendChild(btn);
  });
}

function renderCategoria(id) {
  const categoria = getCategoria(id);
  if (!categoria) return goHome();
  document.getElementById('categoriaNome').textContent = categoria.nome_categoria;
  document.getElementById('categoriaDescrizione').textContent = categoria.descrizione_categoria;
  document.getElementById('visualizzaProgetti').onclick = () => (location.hash = `categoria/${id}/progetti`);

  const select = document.getElementById('selectCategorie');
  select.innerHTML = '';
  data.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.nome_categoria;
    option.selected = cat.id === id;
    select.appendChild(option);
  });
  select.onchange = () => {
    location.hash = `categoria/${select.value}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

function renderListaProgetti(id) {
  const categoria = getCategoria(id);
  if (!categoria) return goHome();
  document.getElementById('progettiTitolo').textContent = categoria.nome_categoria;
  const lista = document.getElementById('listaProgetti');
  lista.innerHTML = '';
  categoria.progetti.forEach(p => {
    const btn = document.createElement('button');
    const titolo = document.createElement('span');
    titolo.className = 'progettoTitoloVoce';
    titolo.textContent = p.titolo;
    const enti = document.createElement('span');
    enti.className = 'progettoIstituzioniVoce';
    enti.textContent = p.istituzioni.join(', ');
    btn.append(titolo, enti);
    btn.onclick = () => (location.hash = `categoria/${id}/progetto/${p.id}`);
    lista.appendChild(btn);
  });
}

function renderProgetto(catId, projId) {
  const categoria = getCategoria(catId);
  if (!categoria) return goHome();
  const progetto = categoria.progetti.find(p => p.id == projId);
  if (!progetto) return goHome();

  document.getElementById('progettoTitolo').textContent = progetto.titolo;
  document.getElementById('progettoSottotitolo').textContent = progetto.sottotitolo;

  const tornaCategoria = document.getElementById('tornaCategoria');
  tornaCategoria.textContent = categoria.nome_categoria;
  tornaCategoria.onclick = () => (location.hash = `categoria/${catId}`);

  const autoriDiv = document.getElementById('progettoAutori');
  autoriDiv.innerHTML = '';
  for (const ente in progetto.autori) {
    const gruppo = document.createElement('div');
    gruppo.className = 'autoriGruppo';
    const h4 = document.createElement('h4');
    h4.textContent = ente;
    gruppo.appendChild(h4);
    progetto.autori[ente].forEach(nome => {
      const p = document.createElement('p');
      p.textContent = nome;
      gruppo.appendChild(p);
    });
    autoriDiv.appendChild(gruppo);
  }

  const videoThumb = document.getElementById('progettoVideo');
  const videoFull = document.getElementById('overlayVideo');
  const paginaContenuti = document.getElementById('paginaContenuti');
  const overlayContainer = document.getElementById('overlayVideoContainer');
  const container = document.getElementById('videoContainer');
  const closeButton = document.getElementById('closeFullscreenButton');
  const prevButton = document.getElementById('prevProgetto');
  const nextButton = document.getElementById('nextProgetto');

  // Riporta la pagina allo stato iniziale: l'overlay può essere rimasto
  // aperto se il timeout di inattività è scattato a video in pausa
  overlayContainer.classList.remove('aperto');
  paginaContenuti.classList.remove('nascosto', 'hidden');

  updateVideoState(VIDEO_STATES.LOADING);

  function chiudiFullscreen() {
    videoFull.pause();
    videoFull.currentTime = 0;
    overlayContainer.classList.remove('aperto');
    paginaContenuti.classList.remove('nascosto', 'hidden');
    // Se l'overlay era in buffering, riallinea lo stato all'anteprima
    if (currentVideoState === VIDEO_STATES.LOADING) {
      updateVideoState(videoThumb.readyState >= 2 ? VIDEO_STATES.PLAYING : VIDEO_STATES.LOADING);
    }
  }

  function setupVideo(video, isFullscreen = false) {
    video.tentativiErrore = 0;
    video.src = progetto.file_video;

    video.onloadstart = () => updateVideoState(VIDEO_STATES.LOADING);
    video.oncanplay = () => updateVideoState(VIDEO_STATES.PLAYING);
    video.onwaiting = () => updateVideoState(VIDEO_STATES.LOADING);
    video.onplaying = () => updateVideoState(VIDEO_STATES.PLAYING);

    video.onerror = () => {
      if (isFullscreen) chiudiFullscreen();
      handleVideoError(video);
    };

    if (isFullscreen) {
      video.onplay = resetInactivityTimer;
      video.onpause = resetInactivityTimer;
      video.onended = () => {
        chiudiFullscreen();
        resetInactivityTimer();
      };
    }

    video.load();
  }

  retryVideoSetup = () => {
    updateVideoState(VIDEO_STATES.LOADING);
    setupVideo(videoThumb);
    setupVideo(videoFull, true);
  };

  setupVideo(videoThumb);
  setupVideo(videoFull, true);

  function apriFullscreen() {
    paginaContenuti.classList.add('hidden');
    setTimeout(() => {
      paginaContenuti.classList.add('nascosto');
      overlayContainer.classList.add('aperto');
      videoFull.play().catch(() => {
        chiudiFullscreen();
        handleVideoError(videoFull);
      });
    }, TRANSITION_MS);
  }

  container.onclick = () => {
    if (currentVideoState === VIDEO_STATES.ERROR) {
      retryVideoSetup();
      return;
    }
    apriFullscreen();
  };

  videoFull.onclick = chiudiFullscreen;
  closeButton.onclick = chiudiFullscreen;

  const indiceCorrente = categoria.progetti.findIndex(p => p.id == projId);

  prevButton.classList.toggle('disabled', indiceCorrente <= 0);
  nextButton.classList.toggle('disabled', indiceCorrente >= categoria.progetti.length - 1);

  prevButton.onclick = e => {
    e.stopPropagation();
    if (indiceCorrente > 0) {
      location.hash = `categoria/${catId}/progetto/${categoria.progetti[indiceCorrente - 1].id}`;
    }
  };

  nextButton.onclick = e => {
    e.stopPropagation();
    if (indiceCorrente < categoria.progetti.length - 1) {
      location.hash = `categoria/${catId}/progetto/${categoria.progetti[indiceCorrente + 1].id}`;
    }
  };
}

// --- Avvio ---

function initApp() {
  document.querySelectorAll('.home-button').forEach(btn => (btn.onclick = goHome));

  document.querySelector('#videoErrorContainer .retry-button').onclick = e => {
    e.stopPropagation();
    if (retryVideoSetup) retryVideoSetup();
  };

  router();
  resetInactivityTimer();
}

window.addEventListener('hashchange', () => {
  router();
  resetInactivityTimer();
});
window.addEventListener('load', initApp);

['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach(evt =>
  window.addEventListener(evt, resetInactivityTimer, { passive: true })
);

// Hardening kiosk: niente menu contestuale né gesti di zoom
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
