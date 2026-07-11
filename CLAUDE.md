# VideoJukebox

App touchscreen per chioschi espositivi (musei, mostre): l'utente naviga categorie → progetti → video a schermo intero. Vanilla JavaScript, zero dipendenze runtime, funziona offline aprendo `index.html` direttamente.

## Vincoli irrinunciabili

- **Deve funzionare via `file://`** (zero installazione): niente moduli ES, niente `fetch`, niente risorse esterne. Gli script sono classici e condividono lo scope globale (`data` è definita in `data/DB.js`).
- **CSP attiva** in `index.html`: consente solo risorse locali. Non aggiungere script/stili inline, handler `onclick` negli attributi HTML, né CDN — verrebbero bloccati.
- **Testo dinamico solo via `textContent`**, mai `innerHTML` con dati provenienti da `DB.js`.
- **Interfaccia touch**: feedback con `:active`, target minimi ~52px, `:hover` solo dentro `@media (hover: hover)`.
- Nomi di funzioni e variabili in italiano, coerenti con l'esistente. Indentazione 2 spazi.

## Architettura

- `index.html` — SPA con 4 sezioni `.page`; il router in `js/app.js` attiva quella giusta in base all'hash:
  - `#home` · `#categoria/{id}` · `#categoria/{id}/progetti` · `#categoria/{id}/progetto/{id}`
- `data/DB.js` — "database" come costante globale `data`: categorie → progetti (titolo, sottotitolo, istituzioni, autori, `file_video`). I video stanno in `video/{id-categoria}/`.
- `js/app.js` — router, rendering, player video (anteprima + overlay fullscreen), gestione errori con 3 retry per video, timeout di inattività di 5 minuti (sospeso mentre un video è in riproduzione).
- `admin/` — editor dei contenuti basato su **File System Access API** (solo Chrome/Edge): l'utente apre la cartella del progetto, crea categorie (= cartelle in `video/`), trascina i video, e l'admin scrive direttamente `data/DB.js`. Il DB viene letto con `JSON.parse` (mai `eval`/`new Function`) e scritto come `const data = <JSON>;` — mantenere questo formato. Il textarea autori usa una riga per istituzione: `Ente: Nome, Nome`.

## Avvio e verifica

- Diretto: aprire `index.html` nel browser.
- Server locale: `.claude/launch.json` definisce `static` (python3 http.server, porta 8899). Attenzione alla cache del browser dopo una modifica: usare hard reload o query `?v=N`.
- Per verificare la CSP su `file://`: Chrome headless con `--dump-dom` e grep di `Refused`.
- Kiosk in produzione: Chrome con `--kiosk` (istruzioni nel README).

## Contenuti

I progetti "Test" e "Provolone" (categoria `ai`) sono segnaposto con video reali: restano finché non ci sono contenuti definitivi. Non aggiungere voci al DB senza il file video corrispondente: la voce mostrerebbe l'errore permanente.
