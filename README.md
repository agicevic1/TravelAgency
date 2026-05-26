# TravelPlus

TravelPlus je web aplikacija turističke agencije urađena u React/Vite frontend-u, Node.js/Express backend-u i MySQL bazi.

## Korisnici

Aplikacija na početku traži login. Bcrypt nije korišten, jer je traženo jednostavno statičko logovanje.

- Admin: `admin` / `admin1234`
- Finance: `finance` / `finance1234`

## Prava pristupa

- Oba korisnika vide Dashboard i Rezervacije.
- Samo `finance` vidi modul Finansije.
- Samo `admin` vidi SLM modul.
- Logout briše lokalnu sesiju i vraća korisnika na login.

## Moduli

### Dashboard
Prikazuje osnovne informacije o firmi: prihodi, rashodi, aktivne rezervacije, klijenti, otvoreni incidenti i SLA usklađenost.

### Finansije
Sadrži: Budžet, Rashode, Prihode i Alokaciju troškova po poslovnicama. Za svaku sekciju postoji forma za dodavanje novih podataka. Modul pokriva obračun troškova aranžmana, profitabilnost destinacija i praćenje faktura dobavljača.

### SLM
Sadrži: Nivoe usluga, SLA ugovore, Zahtjeve, Incidente i Metrike. Admin može dodavati nove podatke, upravljati zahtjevima/incidentima i preuzeti SLA ugovor u PDF formatu.

### Rezervacije
Prikazuje sve rezervacije i omogućava filtriranje po statusima: sve, pending/na čekanju, confirmed/potvrđene, completed/završene i cancelled/otkazane. Postoji forma za dodavanje nove rezervacije.

## Pokretanje

```bash
npm install
npm run dev:server
npm run dev
```

API server radi na `http://localhost:5000`, a frontend na `http://localhost:5173`.

## MySQL

Prije pokretanja importovati šemu:

```bash
mysql -u root -p < server/schema.sql
npm run seed
```

`.env` primjer:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=travelplus
PORT=5000
VITE_API_URL=http://localhost:5000
```
