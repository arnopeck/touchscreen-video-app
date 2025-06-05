============================================================
VIDEOJUKEBOX - TOUCHSCREEN VIDEO APP
============================================================

Versione: 1.0
Data: Aprile 2025

Progetto sviluppato per l'utilizzo su con monitor touchscreen, 
finalizzato alla consultazione autonoma di contenuti video suddivisi in categorie.

------------------------------------------------------------
CARATTERISTICHE PRINCIPALI
------------------------------------------------------------

- Funzionamento 100% locale, senza connessione Internet
- Compatibilità browser: Chrome, Edge, Brave (modalità kiosk consigliata)
- Navigazione touch ottimizzata
- Riproduzione video fullscreen gestita dinamicamente
- Ritorno automatico alla home dopo 5 minuti di inattività
- URL dinamici via hash routing
- Struttura dati semplice e modificabile via file "DB.js"
- Sistema Admin Panel (in sviluppo) per gestione categorie/progetti

------------------------------------------------------------
STRUTTURA DEL PROGETTO
------------------------------------------------------------

/ (root)
|-- index.html          (Home app touchscreen)
|-- css/
|    |-- styles.css     (Stile principale)
|-- js/
|    |-- app.js         (Logica di navigazione e funzionalità)
|-- data/
|    |-- DB.js          (Database delle categorie e progetti)
|-- video/
|    |-- (cartelle video per categoria)
|-- admin/
|    |-- admin.html     (Pannello di gestione database)
|    |-- admin.js       (Logica admin)
|    |-- admin.css      (Stile admin)

------------------------------------------------------------
ISTRUZIONI DI UTILIZZO
------------------------------------------------------------

1. Avviare "index.html" in un browser supportato.
2. L'app funziona interamente offline: non è necessaria alcuna installazione.
3. Per aggiornare dati/categorie/progetti:
   - Accedere a "admin/admin.html"
   - Modificare o creare nuove voci
   - Esportare il nuovo "DB.js" e sostituirlo nella cartella /data

ATTENZIONE:
- I file video devono essere salvati seguendo la struttura: "video/{id_categoria}/{nome_file_video}.mp4"
- I nomi dei file devono corrispondere esattamente a quelli inseriti nel database.

------------------------------------------------------------
REQUISITI MINIMI
------------------------------------------------------------

- Browser moderno (consigliato Chrome in modalità full-screen kiosk)
- Mini PC o sistema embedded capace di gestire riproduzione video locale 1080p
- Monitor touchscreen 1080p o superiore

------------------------------------------------------------
COPYRIGHT
------------------------------------------------------------

© 2025 Arno Peck & Amico Immaginario 

Tutti i diritti riservati.

------------------------------------------------------------
