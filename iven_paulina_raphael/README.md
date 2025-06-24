TP-Link Lampensteuerung (Web + API)
====================================

Ein Node.js-Projekt mit Webinterface zur Steuerung einer TP-Link Tapo-Lampe. Befehle wie An/Aus, Farbwahl, Helligkeit und Morsecode werden über eine Weboberfläche (oder direkt via HTTP) über RabbitMQ verarbeitet.

🔧 Voraussetzungen
------------------
- 🐳 Docker & Docker Compose
- 📦 Node.js (>=18)
- 🧠 Git
- ✅ Zugangsdaten für dein TP-Link/Tapo-Konto

🚀 Installation & Start
-----------------------

1. Repository klonen

```bash
git clone https://github.com/nevi02/DHBW-Mannheim-WI2023SEB-Assignment.git
cd DHBW-Mannheim-WI2023SEB-Assignment
```

2. `.env`-Datei erstellen

```env
# Bulb Login
TP_EMAIL=dein@email.de
TP_PASSWORD=deinpasswort
TP_DEVICE_ID=deine_device_id

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# HTTP-Server 
API_PORT=3000
```

⚠️ Achtung: Diese Datei nicht ins Repository hochladen!

3. RabbitMQ starten

```bash
docker-compose up -d
```

Webinterface verfügbar unter: http://localhost:15672  
Login: guest / guest

4. Abhängigkeiten installieren

```bash
npm install
```

5. Projekt starten

```bash
npm start
```

Webserver läuft nun unter: http://localhost:4000

🌐 Weboberfläche
-----------------
Die Startseite zeigt eine einfache Benutzeroberfläche zur Steuerung der Lampe:

Funktionen:
- 💡 Ein/Aus: Knöpfe zur Stromsteuerung
- 🎨 Vordefinierte Farben: Rot, Grün, Blau
- 🟠 Farbpicker: Beliebige Farbe setzen
- 🔆 Helligkeit: Slider mit Live-Anzeige
- 🆘 Morsecode: Text eingeben und über Licht blinken lassen

🔌 API-Endpunkt
----------------

POST /api/command  
Content-Type: application/json

Beispielanfragen:

```json
{ "type": "basic", "command": "on" }
{ "type": "basic", "command": "off" }
{ "type": "brightness", "value": 80 }
{ "type": "color", "value": "#ff0000" }
{ "type": "morse", "text": "SOS" }
```

📁 Projektstruktur
------------------

```
.
├── public/
│   └── index.html              # Webinterface (Frontend)
├── src/
│   ├── api/
│   │   └── routes.js           # HTTP-Router
│   ├── lamp/
│   │   ├── controller.js       # Morsecode-Steuerung der Lampe
│   │   └── setup.js            # TP-Link API Setup
│   ├── messaging/
│   │   ├── consumer.js         # RabbitMQ Consumer
│   │   └── producer.js         # RabbitMQ Producer
│   ├── utils/
│   │   └── morse.js            # Text → Morsecode-Konvertierung
│   └── server.js              # Einstiegspunkt des Servers
├── .env                        # Lokale Umgebungsvariablen (nicht committen)
├── .gitignore                  # Git-Ignore-Datei
├── ASSIGNMENT.md              # Aufgabenbeschreibung
├── docker-compose.yml         # Startet RabbitMQ-Service
├── package.json               # Projekt- und Abhängigkeitsdefinition
├── package-lock.json          # Versionen der installierten Pakete
└── README.md                  # Anleitung & Beschreibung (diese Datei)
```
