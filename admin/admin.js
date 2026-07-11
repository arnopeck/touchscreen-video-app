// VideoJukebox — admin: gestisce categorie, progetti e video scrivendo
// direttamente nella cartella del progetto (File System Access API).
// Tutto il testo dinamico passa da textContent: mai innerHTML con i dati.

let rootHandle = null;          // cartella del progetto scelta dall'utente
let db = [];                    // contenuto di data/DB.js
let indiceCategoria = null;     // categoria selezionata (indice in db)
let modificheNonSalvate = false;

const $ = id => document.getElementById(id);

// --- Utilità ---

function slugify(testo) {
  const slug = testo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'categoria';
}

function setStato(messaggio, tipo = 'info') {
  const stato = $('stato');
  stato.textContent = messaggio;
  stato.className = tipo;
}

function segnaModifica() {
  modificheNonSalvate = true;
  $('salvaDB').disabled = false;
  setStato('Modifiche non salvate', 'attesa');
}

// Formato autori nel textarea: una riga per istituzione,
// "Istituzione: Nome, Nome" oppure solo "Istituzione"
function parseAutori(testo) {
  const autori = {};
  const istituzioni = [];
  testo.split('\n').map(r => r.trim()).filter(Boolean).forEach(riga => {
    const sep = riga.indexOf(':');
    const ente = (sep === -1 ? riga : riga.slice(0, sep)).trim();
    if (!ente) return;
    istituzioni.push(ente);
    const nomi = sep === -1
      ? []
      : riga.slice(sep + 1).split(',').map(n => n.trim()).filter(Boolean);
    if (nomi.length) autori[ente] = nomi;
  });
  return { istituzioni, autori };
}

function formatAutori(progetto) {
  const enti = [...new Set([
    ...(progetto.istituzioni || []),
    ...Object.keys(progetto.autori || {})
  ])];
  return enti.map(ente => {
    const nomi = (progetto.autori && progetto.autori[ente]) || [];
    return nomi.length ? `${ente}: ${nomi.join(', ')}` : ente;
  }).join('\n');
}

// --- Lettura e scrittura su disco ---

function parseDB(testo) {
  const inizio = testo.indexOf('[');
  const fine = testo.lastIndexOf(']');
  if (inizio === -1 || fine === -1) throw new Error('Formato di DB.js non riconosciuto');
  return JSON.parse(testo.slice(inizio, fine + 1));
}

function serializzaDB(dati) {
  return `const data = ${JSON.stringify(dati, null, 2)};\n`;
}

async function caricaDB() {
  const dataDir = await rootHandle.getDirectoryHandle('data');
  const fileHandle = await dataDir.getFileHandle('DB.js');
  const file = await fileHandle.getFile();
  db = parseDB(await file.text());
}

async function salvaDB() {
  try {
    const dataDir = await rootHandle.getDirectoryHandle('data');
    const fileHandle = await dataDir.getFileHandle('DB.js', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(serializzaDB(db));
    await writable.close();
    modificheNonSalvate = false;
    $('salvaDB').disabled = true;
    setStato('Salvato in data/DB.js', 'ok');
  } catch (e) {
    setStato(`Errore nel salvataggio: ${e.message}`, 'errore');
  }
}

async function cartellaVideo(catId, crea = false) {
  const videoDir = await rootHandle.getDirectoryHandle('video', { create: crea });
  return videoDir.getDirectoryHandle(catId, { create: crea });
}

async function listaVideo(catId) {
  try {
    const catDir = await cartellaVideo(catId);
    const nomi = [];
    for await (const [nome, handle] of catDir.entries()) {
      if (handle.kind === 'file' && /\.(mp4|webm|mov|m4v)$/i.test(nome)) nomi.push(nome);
    }
    return nomi.sort();
  } catch {
    return [];
  }
}

async function copiaVideo(catId, file) {
  const catDir = await cartellaVideo(catId, true);
  const dest = await catDir.getFileHandle(file.name, { create: true });
  const writable = await dest.createWritable();
  await writable.write(file);
  await writable.close();
  return `video/${catId}/${file.name}`;
}

// --- Apertura progetto ---

async function apriProgetto() {
  const errore = $('aperturaErrore');
  errore.hidden = true;

  if (!window.showDirectoryPicker) {
    errore.textContent = 'Questo browser non supporta la gestione delle cartelle. Usa Chrome o Edge.';
    errore.hidden = false;
    return;
  }

  let handle;
  try {
    handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  } catch (e) {
    if (e.name === 'AbortError') return; // annullato dall'utente
    errore.textContent = `Impossibile aprire la cartella (${e.name}). Se hai aperto la pagina da file://, prova da http://localhost.`;
    errore.hidden = false;
    return;
  }

  rootHandle = handle;
  try {
    await caricaDB();
  } catch (e) {
    rootHandle = null;
    errore.textContent = `La cartella "${handle.name}" non sembra il progetto VideoJukebox: ${e.message} (manca o non è leggibile data/DB.js).`;
    errore.hidden = false;
    return;
  }

  $('apertura').hidden = true;
  $('editor').hidden = false;
  setStato(`Progetto aperto: ${handle.name}`, 'ok');
  indiceCategoria = db.length ? 0 : null;
  renderCategorie();
  renderCategoriaSelezionata();
}

// --- Rendering: elenco categorie ---

function renderCategorie() {
  const lista = $('categorieList');
  lista.textContent = '';
  db.forEach((cat, i) => {
    const voce = document.createElement('button');
    voce.type = 'button';
    voce.className = 'voceCategoria' + (i === indiceCategoria ? ' selezionata' : '');

    const nome = document.createElement('span');
    nome.className = 'voceNome';
    nome.textContent = cat.nome_categoria || '(senza nome)';
    const conteggio = document.createElement('span');
    conteggio.className = 'voceConteggio';
    conteggio.textContent = `${cat.progetti.length} progetti · video/${cat.id}/`;

    voce.append(nome, conteggio);
    voce.onclick = () => {
      indiceCategoria = i;
      renderCategorie();
      renderCategoriaSelezionata();
    };
    lista.appendChild(voce);
  });
}

// --- Rendering: categoria selezionata e suoi progetti ---

async function renderCategoriaSelezionata() {
  const dettagli = $('categoriaDettagli');
  const vuoto = $('nessunaCategoria');
  if (indiceCategoria === null || !db[indiceCategoria]) {
    dettagli.hidden = true;
    vuoto.hidden = false;
    return;
  }
  dettagli.hidden = false;
  vuoto.hidden = true;

  const cat = db[indiceCategoria];
  const catNome = $('catNome');
  const catDescrizione = $('catDescrizione');
  catNome.value = cat.nome_categoria;
  catDescrizione.value = cat.descrizione_categoria;
  $('catInfo').textContent = `id: ${cat.id}`;

  catNome.oninput = () => {
    cat.nome_categoria = catNome.value;
    segnaModifica();
    renderCategorie();
  };
  catDescrizione.oninput = () => {
    cat.descrizione_categoria = catDescrizione.value;
    segnaModifica();
  };

  await renderProgetti();
}

async function renderProgetti() {
  const cat = db[indiceCategoria];
  const lista = $('progettiList');
  lista.textContent = '';
  const videoDisponibili = await listaVideo(cat.id);

  cat.progetti.forEach((progetto, i) => {
    lista.appendChild(creaCardProgetto(cat, progetto, i, videoDisponibili));
  });

  if (!cat.progetti.length) {
    const vuoto = document.createElement('p');
    vuoto.className = 'nota';
    vuoto.textContent = 'Nessun progetto in questa categoria.';
    lista.appendChild(vuoto);
  }
}

function creaCampo(etichetta, controllo) {
  const riga = document.createElement('div');
  riga.className = 'rigaCampo';
  const label = document.createElement('label');
  label.textContent = etichetta;
  riga.append(label, controllo);
  return riga;
}

function creaCardProgetto(cat, progetto, indice, videoDisponibili) {
  const card = document.createElement('div');
  card.className = 'progettoCard';

  // Barra superiore: numero, sposta su/giù, elimina
  const barra = document.createElement('div');
  barra.className = 'cardBarra';
  const numero = document.createElement('span');
  numero.textContent = `#${indice + 1}`;
  const azioni = document.createElement('div');

  const su = document.createElement('button');
  su.type = 'button';
  su.textContent = '↑';
  su.title = 'Sposta su';
  su.disabled = indice === 0;
  su.onclick = () => spostaProgetto(indice, -1);

  const giu = document.createElement('button');
  giu.type = 'button';
  giu.textContent = '↓';
  giu.title = 'Sposta giù';
  giu.disabled = indice === cat.progetti.length - 1;
  giu.onclick = () => spostaProgetto(indice, 1);

  const elimina = document.createElement('button');
  elimina.type = 'button';
  elimina.className = 'pericolo';
  elimina.textContent = 'Elimina';
  elimina.onclick = () => {
    if (!confirm(`Eliminare il progetto "${progetto.titolo || '(senza titolo)'}"? Il file video resta in video/${cat.id}/.`)) return;
    cat.progetti.splice(indice, 1);
    segnaModifica();
    renderCategorie();
    renderProgetti();
  };

  azioni.append(su, giu, elimina);
  barra.append(numero, azioni);
  card.appendChild(barra);

  // Campi testo
  const titolo = document.createElement('input');
  titolo.value = progetto.titolo || '';
  titolo.oninput = () => { progetto.titolo = titolo.value; segnaModifica(); };
  card.appendChild(creaCampo('Titolo', titolo));

  const sottotitolo = document.createElement('input');
  sottotitolo.value = progetto.sottotitolo || '';
  sottotitolo.oninput = () => { progetto.sottotitolo = sottotitolo.value; segnaModifica(); };
  card.appendChild(creaCampo('Sottotitolo', sottotitolo));

  const autori = document.createElement('textarea');
  autori.rows = 3;
  autori.placeholder = 'Una riga per istituzione:\nIUAV: Fabio Carella, Folco Soffietti\nICR: Barbara Davidde';
  autori.value = formatAutori(progetto);
  autori.oninput = () => {
    const risultato = parseAutori(autori.value);
    progetto.istituzioni = risultato.istituzioni;
    progetto.autori = risultato.autori;
    segnaModifica();
  };
  card.appendChild(creaCampo('Istituzioni e autori', autori));

  // Video: selezione tra i file della cartella + anteprima
  const rigaVideo = document.createElement('div');
  rigaVideo.className = 'rigaVideo';

  const select = document.createElement('select');
  const vuota = document.createElement('option');
  vuota.value = '';
  vuota.textContent = '— nessun video —';
  select.appendChild(vuota);
  videoDisponibili.forEach(nome => {
    const opzione = document.createElement('option');
    opzione.value = nome;
    opzione.textContent = nome;
    select.appendChild(opzione);
  });
  const nomeAttuale = (progetto.file_video || '').split('/').pop();
  if (nomeAttuale && !videoDisponibili.includes(nomeAttuale)) {
    const mancante = document.createElement('option');
    mancante.value = nomeAttuale;
    mancante.textContent = `${nomeAttuale} (file mancante!)`;
    select.appendChild(mancante);
  }
  select.value = nomeAttuale || '';
  select.onchange = () => {
    progetto.file_video = select.value ? `video/${cat.id}/${select.value}` : '';
    segnaModifica();
  };

  const anteprima = document.createElement('button');
  anteprima.type = 'button';
  anteprima.textContent = 'Anteprima';
  anteprima.onclick = () => mostraAnteprima(cat.id, select.value);

  rigaVideo.append(select, anteprima);
  card.appendChild(creaCampo('Video', rigaVideo));

  // Dropzone
  const dropzone = document.createElement('div');
  dropzone.className = 'dropzone';
  dropzone.textContent = 'Trascina qui un file video per aggiungerlo a questa categoria e assegnarlo al progetto';
  dropzone.ondragover = e => { e.preventDefault(); dropzone.classList.add('attiva'); };
  dropzone.ondragleave = () => dropzone.classList.remove('attiva');
  dropzone.ondrop = async e => {
    e.preventDefault();
    dropzone.classList.remove('attiva');
    const file = [...e.dataTransfer.files].find(f => /\.(mp4|webm|mov|m4v)$/i.test(f.name));
    if (!file) {
      setStato('Nessun file video tra quelli trascinati (formati: mp4, webm, mov, m4v)', 'errore');
      return;
    }
    try {
      setStato(`Copio ${file.name} in video/${cat.id}/ …`, 'attesa');
      progetto.file_video = await copiaVideo(cat.id, file);
      segnaModifica();
      setStato(`${file.name} copiato e assegnato al progetto`, 'ok');
      renderProgetti();
    } catch (err) {
      setStato(`Errore nella copia del video: ${err.message}`, 'errore');
    }
  };
  card.appendChild(dropzone);

  return card;
}

function spostaProgetto(indice, direzione) {
  const progetti = db[indiceCategoria].progetti;
  const nuovo = indice + direzione;
  [progetti[indice], progetti[nuovo]] = [progetti[nuovo], progetti[indice]];
  segnaModifica();
  renderProgetti();
}

// --- Anteprima video ---

async function mostraAnteprima(catId, nomeFile) {
  if (!nomeFile) {
    setStato('Nessun video assegnato da mostrare', 'errore');
    return;
  }
  try {
    const catDir = await cartellaVideo(catId);
    const handle = await catDir.getFileHandle(nomeFile);
    const file = await handle.getFile();
    const video = $('anteprimaVideo');
    video.src = URL.createObjectURL(file);
    $('anteprimaOverlay').hidden = false;
    video.play().catch(() => {});
  } catch {
    setStato(`File non trovato: video/${catId}/${nomeFile}`, 'errore');
  }
}

function chiudiAnteprima() {
  const video = $('anteprimaVideo');
  video.pause();
  if (video.src) URL.revokeObjectURL(video.src);
  video.removeAttribute('src');
  video.load();
  $('anteprimaOverlay').hidden = true;
}

// --- Categorie: creazione ed eliminazione ---

async function creaCategoria(nome) {
  const id = slugify(nome);
  if (db.some(c => c.id === id)) {
    setStato(`Esiste già una categoria con id "${id}"`, 'errore');
    return;
  }
  try {
    await cartellaVideo(id, true);
  } catch (e) {
    setStato(`Impossibile creare la cartella video/${id}/: ${e.message}`, 'errore');
    return;
  }
  db.push({ id, nome_categoria: nome, descrizione_categoria: '', progetti: [] });
  indiceCategoria = db.length - 1;
  segnaModifica();
  setStato(`Categoria "${nome}" creata (cartella video/${id}/)`, 'ok');
  renderCategorie();
  renderCategoriaSelezionata();
}

// --- Avvio ---

$('apriCartella').onclick = apriProgetto;
$('salvaDB').onclick = salvaDB;
$('chiudiAnteprima').onclick = chiudiAnteprima;
$('anteprimaOverlay').onclick = e => {
  if (e.target === $('anteprimaOverlay')) chiudiAnteprima();
};

$('nuovaCategoriaForm').onsubmit = e => {
  e.preventDefault();
  const nome = $('nuovaCategoriaNome').value.trim();
  if (!nome) return;
  creaCategoria(nome);
  $('nuovaCategoriaNome').value = '';
};

$('eliminaCategoria').onclick = () => {
  const cat = db[indiceCategoria];
  if (!cat) return;
  if (!confirm(`Eliminare la categoria "${cat.nome_categoria}" e i suoi ${cat.progetti.length} progetti dal DB?\nLa cartella video/${cat.id}/ e i suoi file NON vengono toccati.`)) return;
  db.splice(indiceCategoria, 1);
  indiceCategoria = db.length ? Math.max(0, indiceCategoria - 1) : null;
  segnaModifica();
  renderCategorie();
  renderCategoriaSelezionata();
};

$('aggiungiProgetto').onclick = () => {
  db[indiceCategoria].progetti.push({
    id: Date.now(),
    titolo: '',
    sottotitolo: '',
    istituzioni: [],
    autori: {},
    file_video: ''
  });
  segnaModifica();
  renderCategorie();
  renderProgetti();
};

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    if (!$('salvaDB').disabled) salvaDB();
  }
  if (e.key === 'Escape' && !$('anteprimaOverlay').hidden) chiudiAnteprima();
});

window.addEventListener('beforeunload', e => {
  if (modificheNonSalvate) e.preventDefault();
});
