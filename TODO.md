# TODO

## Contenuti
- [ ] Sostituire i progetti segnaposto "Test" e "Provolone" (categoria `ai`) con contenuti reali.
- [ ] Video definitivi al posto dei file di prova attuali.

## Da valutare
- [ ] Immagine poster per l'anteprima video (attributo `poster`) per evitare il riquadro nero prima del caricamento dei metadati.
- [ ] Campo `ordine` nei progetti del DB, se serve un ordinamento diverso da quello di inserimento.

## Fatto (12 luglio 2026)
- [x] **Admin riscritta da zero** (`admin/`): File System Access API (Chrome/Edge), niente installazioni — apertura cartella progetto, creazione categorie con cartella in `video/`, drag & drop dei video, anteprima, salvataggio diretto di `data/DB.js`. Sicura: `JSON.parse` invece di `new Function`, `textContent` invece di `innerHTML`, CSP. UI con gli stessi token di design dell'app. Da verificare a mano: il picker della cartella aprendo la pagina via `file://` (se Chrome lo blocca, usare `http://localhost`).
- [x] Video rimossi dal repo GitHub (anche dalla storia, riscritta con filter-branch): `video/` è solo locale, chi clona deve aggiungere i propri mp4 (vedi README).

## Fatto (11 luglio 2026)
- [x] Pulizia DB dai dati finti senza video (Categoria_4) e fix id stringa.
- [x] Fix timeout inattività (non interrompe più i video in fullscreen; riparte a fine video).
- [x] Gestione errori video: retry per singolo video, niente falsi errori da `stalled`, UI errore/spinner stilizzate.
- [x] Sicurezza kiosk: CSP (verificata anche via `file://`), niente inline, contextmenu/gesture bloccati.
- [x] Nome corretto VideoJukebox ovunque (era rimasto "Terrae Aquae").
- [x] Restyling completo UI touch (feedback :active, target grandi, overlay fullscreen).
- [x] Pulsante per tornare alla pagina categoria dal dettaglio progetto.
