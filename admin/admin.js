// admin/admin.js

let db = []; // Qui lavoriamo sui dati in memoria
let categoriaSelezionata = null;

const categorieList = document.getElementById('categorieList');
const progettiList = document.getElementById('progettiList');
const addCategoriaBtn = document.getElementById('addCategoria');
const addProgettoBtn = document.getElementById('addProgetto');
const exportDBBtn = document.getElementById('exportDB');
const loadDBInput = document.getElementById('loadDB');
const loadDBBtn = document.getElementById('loadDBBtn');

// Renderizza categorie
function renderCategorie() {
  categorieList.innerHTML = '';
  db.forEach((cat, index) => {
	const div = document.createElement('div');
	div.className = 'categoriaItem';
	div.innerHTML = `
	  <input value="${cat.id}" placeholder="ID categoria" onchange="updateCategoriaId(${index}, this.value)">
	  <input value="${cat.nome_categoria}" placeholder="Nome categoria" onchange="updateCategoriaNome(${index}, this.value)">
	  <textarea placeholder="Descrizione" onchange="updateCategoriaDescrizione(${index}, this.value)">${cat.descrizione_categoria}</textarea>
	  <button class="action" onclick="selezionaCategoria(${index})">Seleziona</button>
	`;
	categorieList.appendChild(div);
  });
}

// Renderizza progetti
function renderProgetti() {
  if (categoriaSelezionata === null) return;
  progettiList.innerHTML = '';
  db[categoriaSelezionata].progetti.forEach((proj, index) => {
	const div = document.createElement('div');
	div.className = 'progettoItem';
	div.innerHTML = `
	  <input value="${proj.titolo}" placeholder="Titolo" onchange="updateProgettoTitolo(${index}, this.value)">
	  <input value="${proj.sottotitolo}" placeholder="Sottotitolo" onchange="updateProgettoSottotitolo(${index}, this.value)">
	  <input value="${proj.nome_file_video}" placeholder="Nome file video" onchange="updateProgettoNomeFile(${index}, this.value)">
	  <input value="${proj.ordine}" placeholder="Ordine" onchange="updateProgettoOrdine(${index}, this.value)">
	  <textarea placeholder="Istituzioni separate da virgola" onchange="updateProgettoIstituzioni(${index}, this.value)">${proj.istituzioni.join(', ')}</textarea>
	  <textarea placeholder="Autori JSON {istituzione: [autori]}" onchange="updateProgettoAutori(${index}, this.value)">${JSON.stringify(proj.autori)}</textarea>
	`;
	progettiList.appendChild(div);
  });
}

// Funzioni aggiornamento categoria
function updateCategoriaId(index, value) { db[index].id = value; }
function updateCategoriaNome(index, value) { db[index].nome_categoria = value; }
function updateCategoriaDescrizione(index, value) { db[index].descrizione_categoria = value; }

// Funzioni aggiornamento progetto
function updateProgettoTitolo(index, value) { db[categoriaSelezionata].progetti[index].titolo = value; }
function updateProgettoSottotitolo(index, value) { db[categoriaSelezionata].progetti[index].sottotitolo = value; }
function updateProgettoNomeFile(index, value) { db[categoriaSelezionata].progetti[index].nome_file_video = value; }
function updateProgettoOrdine(index, value) { db[categoriaSelezionata].progetti[index].ordine = parseInt(value) || 0; }
function updateProgettoIstituzioni(index, value) {
  db[categoriaSelezionata].progetti[index].istituzioni = value.split(',').map(x => x.trim());
}
function updateProgettoAutori(index, value) {
  try {
	db[categoriaSelezionata].progetti[index].autori = JSON.parse(value);
  } catch (e) {
	alert('Formato autori non valido. Deve essere un oggetto JSON.');
  }
}

// Seleziona categoria
function selezionaCategoria(index) {
  categoriaSelezionata = index;
  renderProgetti();
}

// Aggiungi categoria
addCategoriaBtn.onclick = () => {
  db.push({
	id: '',
	nome_categoria: '',
	descrizione_categoria: '',
	progetti: []
  });
  renderCategorie();
};

// Aggiungi progetto
addProgettoBtn.onclick = () => {
  if (categoriaSelezionata === null) {
	alert('Seleziona prima una categoria.');
	return;
  }
  db[categoriaSelezionata].progetti.push({
	id: Date.now(),
	titolo: '',
	sottotitolo: '',
	istituzioni: [],
	autori: {},
	nome_file_video: '',
	ordine: 0
  });
  renderProgetti();
};

// Esporta DB
exportDBBtn.onclick = () => {
  const output = db.map(cat => ({
	id: cat.id,
	nome_categoria: cat.nome_categoria,
	descrizione_categoria: cat.descrizione_categoria,
	progetti: cat.progetti.sort((a, b) => a.ordine - b.ordine).map(proj => ({
	  id: proj.id,
	  titolo: proj.titolo,
	  sottotitolo: proj.sottotitolo,
	  istituzioni: proj.istituzioni,
	  autori: proj.autori,
	  file_video: `video/${cat.id}/${proj.nome_file_video}`
	}))
  }));

  const blob = new Blob([`const data = ${JSON.stringify(output, null, 2)};`], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DB.js';
  a.click();
  URL.revokeObjectURL(url);
};

// Carica DB
loadDBBtn.onclick = () => {
  loadDBInput.click();
};

loadDBInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
 reader.onload = (event) => {
   try {
	 let text = event.target.result;
 
	 // Valutiamo come JS
	 const tempFunction = new Function(text + '; return data;');
	 const loaded = tempFunction();
 
	 db = loaded.map(cat => ({
	   id: cat.id,
	   nome_categoria: cat.nome_categoria,
	   descrizione_categoria: cat.descrizione_categoria,
	   progetti: cat.progetti.map((proj, idx) => ({
		 id: proj.id || Date.now() + idx,
		 titolo: proj.titolo,
		 sottotitolo: proj.sottotitolo,
		 istituzioni: proj.istituzioni,
		 autori: proj.autori,
		 nome_file_video: proj.file_video.split('/').pop(),
		 ordine: idx + 1
	   }))
	 }));
 
	 categoriaSelezionata = null;
	 renderCategorie();
	 progettiList.innerHTML = '';
	 alert('DB caricato con successo!');
   } catch (error) {
	 console.error('Errore parsing DB:', error);
	 alert('Errore caricando il DB.js. Controlla il file.');
   }
 };

  reader.readAsText(file);
};

// Avvio
renderCategorie();
