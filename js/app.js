//console.log('app start');

let inactivityTimeout;

// Add these constants at the top of the file after the inactivityTimeout declaration
const ERROR_STATES = {
  NONE: 'none',
  LOADING: 'loading',
  ERROR: 'error',
  PLAYING: 'playing'
};

let currentVideoState = ERROR_STATES.NONE;
let videoErrorCount = 0;
const MAX_RETRY_ATTEMPTS = 3;

function updateVideoState(state, errorMessage = '') {
  currentVideoState = state;
  const videoContainer = document.getElementById('videoContainer');
  const errorContainer = document.getElementById('videoErrorContainer');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  // Reset all states
  videoContainer.classList.remove('error', 'loading', 'playing');
  if (errorContainer) errorContainer.style.display = 'none';
  if (loadingSpinner) loadingSpinner.style.display = 'none';
  
  switch (state) {
    case ERROR_STATES.LOADING:
      videoContainer.classList.add('loading');
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      break;
    case ERROR_STATES.ERROR:
      videoContainer.classList.add('error');
      if (errorContainer) {
        errorContainer.style.display = 'block';
        errorContainer.querySelector('.error-message').textContent = errorMessage;
      }
      break;
    case ERROR_STATES.PLAYING:
      videoContainer.classList.add('playing');
      break;
  }
}

function handleVideoError(video, isFullscreen = false) {
  const errorMessage = `Errore nel caricamento del video${videoErrorCount < MAX_RETRY_ATTEMPTS ? '. Tentativo ' + (videoErrorCount + 1) + ' di ' + MAX_RETRY_ATTEMPTS : ''}`;
  updateVideoState(ERROR_STATES.ERROR, errorMessage);
  
  if (videoErrorCount < MAX_RETRY_ATTEMPTS) {
    videoErrorCount++;
    setTimeout(() => {
      video.load();
      video.play().catch(err => {
        console.warn('Riprova autoplay fallita:', err);
      });
    }, 2000); // Retry after 2 seconds
  } else {
    // After max retries, show permanent error
    updateVideoState(ERROR_STATES.ERROR, 'Impossibile caricare il video. Contattare l\'amministratore.');
  }
}

function resetVideoErrorState() {
  videoErrorCount = 0;
  updateVideoState(ERROR_STATES.NONE);
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);

  const video = document.getElementById('progettoVideo');
  if (video && !video.paused) {
	// Se un video sta riproducendo, NON imposto il timeout
	console.log('Video in riproduzione, nessun timeout di inattività.');
	return;
  }

  inactivityTimeout = setTimeout(() => {
	console.log('Inattività rilevata, torno alla home');
	goHome();
  }, 5 * 60 * 1000); // 5 minuti
}

function router() {
  const hash = window.location.hash.slice(1);
  const parts = hash.split('/').filter(p => p);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (!hash || parts[0] === 'home') {
	document.title = 'Terrae Aquae';
	document.getElementById('home').classList.add('active');
	renderHome();
  } else if (parts[0] === 'categoria' && parts.length === 2) {
	document.title = `Terrae Aquae - ${getCategoriaNome(parts[1])}`;
	document.getElementById('categoria').classList.add('active');
	renderCategoria(parts[1]);
  } else if (parts[0] === 'categoria' && parts.length === 3 && parts[2] === 'progetti') {
	document.title = `Terrae Aquae - ${getCategoriaNome(parts[1])}`;
	document.getElementById('progetti').classList.add('active');
	renderListaProgetti(parts[1]);
  } else if (parts[0] === 'categoria' && parts.length === 4 && parts[2] === 'progetto') {
	document.title = `Terrae Aquae - ${getCategoriaNome(parts[1])} - ${getProgettoTitolo(parts[1], parts[3])}`;
	document.getElementById('progetto').classList.add('active');
	renderProgetto(parts[1], parts[3]);
  } else {
	goHome();
  }
}

function getCategoriaNome(catId) {
  const categoria = data.find(c => c.id === catId);
  return categoria ? categoria.nome_categoria : '';
}

function getProgettoTitolo(catId, projId) {
  const categoria = data.find(c => c.id === catId);
  if (!categoria) return '';
  const progetto = categoria.progetti.find(p => p.id == projId);
  return progetto ? progetto.titolo : '';
}

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
	elem.requestFullscreen().catch(err => console.warn('Fullscreen fallito:', err));
  } else if (elem.webkitRequestFullscreen) { /* Safari */
	elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
	elem.msRequestFullscreen();
  }
}

function renderHome() {
  const container = document.getElementById('categorie');
  container.innerHTML = '';
  data.forEach(cat => {
	const btn = document.createElement('button');
	btn.textContent = cat.nome_categoria;
	btn.onclick = () => {
		location.hash = `categoria/${cat.id}`;
		enterFullscreen();
	}
	container.appendChild(btn);
  });
}

function renderListaProgetti(id) {
  const categoria = data.find(c => c.id === id);
  if (!categoria) return goHome();
  document.getElementById('progettiTitolo').textContent = categoria.nome_categoria;
  const lista = document.getElementById('listaProgetti');
  lista.innerHTML = '';
  categoria.progetti.forEach(p => {
	const btn = document.createElement('button');
	btn.textContent = p.titolo + ' (' + p.istituzioni.join(', ') + ')';
	btn.onclick = () => location.hash = `categoria/${id}/progetto/${p.id}`;
	lista.appendChild(btn);
  });
}

function renderProgetto(catId, projId) {
  const categoria = data.find(c => c.id === catId);
  if (!categoria) return goHome();
  const progetto = categoria.progetti.find(p => p.id == projId);
  if (!progetto) return goHome();

  // Aggiorna testi progetto
  document.getElementById('progettoTitolo').textContent = progetto.titolo;
  document.getElementById('progettoSottotitolo').textContent = progetto.sottotitolo;

  const autoriDiv = document.getElementById('progettoAutori');
  autoriDiv.innerHTML = '';
  for (const ente in progetto.autori) {
	const h4 = document.createElement('h4');
	h4.textContent = ente;
	autoriDiv.appendChild(h4);
	progetto.autori[ente].forEach(nome => {
	  const p = document.createElement('p');
	  p.textContent = nome;
	  autoriDiv.appendChild(p);
	});
  }

  // Elementi video e navigazione
  const videoThumb = document.getElementById('progettoVideo');
  const videoFull = document.getElementById('overlayVideo');
  const paginaContenuti = document.getElementById('paginaContenuti');
  const overlayContainer = document.getElementById('overlayVideoContainer');
  const playBtn = document.getElementById('playButton');
  const container = document.getElementById('videoContainer');
  const closeButton = document.getElementById('closeFullscreenButton');
  const prevButton = document.getElementById('prevProgetto');
  const nextButton = document.getElementById('nextProgetto');

  // Reset error state for new video
  resetVideoErrorState();
  
  // Add loading state
  updateVideoState(ERROR_STATES.LOADING);
  
  // Setup video sources with error handling
  function setupVideo(video, isFullscreen = false) {
    video.src = progetto.file_video;
    
    video.onloadstart = () => {
      updateVideoState(ERROR_STATES.LOADING);
    };
    
    video.oncanplay = () => {
      updateVideoState(ERROR_STATES.PLAYING);
    };
    
    video.onerror = (e) => {
      console.error('Video error:', e);
      handleVideoError(video, isFullscreen);
    };
    
    video.onstalled = () => {
      console.warn('Video stalled');
      handleVideoError(video, isFullscreen);
    };
    
    video.onwaiting = () => {
      updateVideoState(ERROR_STATES.LOADING);
    };
    
    video.onplaying = () => {
      updateVideoState(ERROR_STATES.PLAYING);
    };
    
    video.load();
  }
  
  setupVideo(videoThumb);
  setupVideo(videoFull, true);

  // Funzione per chiudere fullscreen
  function chiudiFullscreen() {
    videoFull.pause();
    videoFull.currentTime = 0;
    videoFull.load();
    overlayContainer.classList.add('hidden');
    setTimeout(() => {
      overlayContainer.style.display = 'none';
      paginaContenuti.style.display = 'block';
      paginaContenuti.classList.remove('hidden');
    }, 500);
  }

  // Update the container click handler
  container.onclick = () => {
    if (currentVideoState === ERROR_STATES.ERROR) {
      // If in error state, try to reload the video
      resetVideoErrorState();
      setupVideo(videoFull, true);
      return;
    }
    
    paginaContenuti.classList.add('hidden');
    setTimeout(() => {
      paginaContenuti.style.display = 'none';
      overlayContainer.style.display = 'block';
      overlayContainer.classList.remove('hidden');
      videoFull.controls = false;
      videoFull.play().catch(err => {
        console.warn('Autoplay bloccato:', err);
        handleVideoError(videoFull, true);
      });
    }, 500);
  };

  // Click sul video per chiudere
  videoFull.onclick = chiudiFullscreen;

  // Click sulla X per chiudere
  closeButton.onclick = chiudiFullscreen;

// Trova posizione corrente
  const progettoCorrenteIndex = categoria.progetti.findIndex(p => p.id == projId);
  
  // Abilita/disabilita bottoni con opacity
  if (progettoCorrenteIndex > 0) {
	prevButton.classList.remove('disabled');
  } else {
	prevButton.classList.add('disabled');
  }
  
  if (progettoCorrenteIndex < categoria.progetti.length - 1) {
	nextButton.classList.remove('disabled');
  } else {
	nextButton.classList.add('disabled');
  }
  
  // Clic su freccia sinistra
  prevButton.onclick = (e) => {
	e.stopPropagation();
	if (progettoCorrenteIndex > 0) {
	  const progettoPrecedente = categoria.progetti[progettoCorrenteIndex - 1];
	  location.hash = `categoria/${catId}/progetto/${progettoPrecedente.id}`;
	}
  };
  
  // Clic su freccia destra
  nextButton.onclick = (e) => {
	e.stopPropagation();
	if (progettoCorrenteIndex < categoria.progetti.length - 1) {
	  const progettoSuccessivo = categoria.progetti[progettoCorrenteIndex + 1];
	  location.hash = `categoria/${catId}/progetto/${progettoSuccessivo.id}`;
	}
  };
}

function goHome() {
  const video = document.getElementById('progettoVideo');
  if (video && !video.paused) {
	video.pause();
	video.currentTime = 0;
  }
  
  location.hash = 'home';
  
  enterFullscreen(); // Richiama la funzione di fullscreen
}

function renderCategoria(id) {
  console.log('Chiamata renderCategoria con id:', id);
  const categoria = data.find(c => c.id === id);
  console.log('Categoria trovata:', categoria);
  if (!categoria) return goHome();
  document.getElementById('categoriaNome').textContent = categoria.nome_categoria;
  document.getElementById('categoriaDescrizione').textContent = categoria.descrizione_categoria;
  document.getElementById('visualizzaProgetti').onclick = () => location.hash = `categoria/${id}/progetti`;

  // === GESTIONE MENU A TENDINA ===
  const select = document.getElementById('selectCategorie');
  select.innerHTML = '';
  data.forEach(cat => {
	const option = document.createElement('option');
	option.value = cat.id;
	option.textContent = cat.nome_categoria;
	if (cat.id === id) {
	  option.selected = true;
	}
	select.appendChild(option);
  });
  select.onchange = () => {
	location.hash = `categoria/${select.value}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

window.addEventListener('hashchange', () => {
  router();
  resetInactivityTimer(); // Resetto timer anche se cambio pagina
});
window.addEventListener('load', () => {
  router();
  resetInactivityTimer(); // Resetto timer anche al primo load
});

// Eventi per attività utente
window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('mousedown', resetInactivityTimer);
window.addEventListener('touchstart', resetInactivityTimer);
window.addEventListener('keydown', resetInactivityTimer);

