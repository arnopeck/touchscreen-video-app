# TODO

## Prossimo grande passo
- [ ] **Riscrivere l'interfaccia admin** (`admin/`): oggi usa `innerHTML` senza escaping (si rompe con gli apostrofi, es. "Istituto d'Arte"), valuta il DB caricato con `new Function()` e mostra campi (`nome_file_video`, `ordine`) che non esistono nel formato reale di `DB.js`. Va rifatta con `textContent`/form sicuri e allineata al formato del DB.

## Contenuti
- [ ] Sostituire i progetti segnaposto "Test" e "Provolone" (categoria `ai`) con contenuti reali.
- [ ] Video definitivi al posto dei file di prova attuali.

## Da valutare
- [ ] Immagine poster per l'anteprima video (attributo `poster`) per evitare il riquadro nero prima del caricamento dei metadati.
- [ ] Campo `ordine` nei progetti del DB, se serve un ordinamento diverso da quello di inserimento.

## Fatto (12 luglio 2026)
- [x] Video rimossi dal repo GitHub: `video/` è solo locale, chi clona deve aggiungere i propri mp4 (vedi README).

## Fatto (11 luglio 2026)
- [x] Pulizia DB dai dati finti senza video (Categoria_4) e fix id stringa.
- [x] Fix timeout inattività (non interrompe più i video in fullscreen; riparte a fine video).
- [x] Gestione errori video: retry per singolo video, niente falsi errori da `stalled`, UI errore/spinner stilizzate.
- [x] Sicurezza kiosk: CSP (verificata anche via `file://`), niente inline, contextmenu/gesture bloccati.
- [x] Nome corretto VideoJukebox ovunque (era rimasto "Terrae Aquae").
- [x] Restyling completo UI touch (feedback :active, target grandi, overlay fullscreen).
- [x] Pulsante per tornare alla pagina categoria dal dettaglio progetto.
