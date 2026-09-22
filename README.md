# Projektmanagement
Ein Projekt von der BFI25 für andere welche eigene Projekte machen wollen, aber nicht wissen wie sie vorgehen sollen. 


# Installations Guide
Hier ist der vollständige Installations Guide für das Projekt.

### Was brauchen wir?
**Code Editor**
Im Besten Fall nutzen wir hierfür Visual Studio Code, weil es auch damit Entwickelt wurde.
Download: https://code.visualstudio.com/Download
1. Lade dir deinen Installer herunter z.B. Windows und führe die Datei aus.
2. 

**NodeJS**\
Download: https://nodejs.org/en/download
1. Lade dir deinen Installer herunter z.B. Windows Installer (.msi) und führe die Datei aus.
2. 

Zum Testen im CMD / Terminal `node -v` ausführen.

**OpenSSL**\
Download: https://slproweb.com/download/Win64OpenSSL-4_0_2.exe
1. Lade dir den Installer herunter und führe ihn aus.
2. Öffne das CMD und setze OpenSSL als System Variable: `setx PATH "%PATH%;C:\Program Files\OpenSSL-Win64\bin"`
3. In dem C: Hauptordner einen Ordner mit dem Namen `SSL` erstellen.
4. Im CMD dann in `C:\SSL` reingehen mit : `cd C:/SSL`.
5. Dann im CMD in dem Path: `C:\SSL` den Befehl nutzen um ein Certificat zu erstellen: `openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost-key.pem -out localhost.pem -days 365 -subj "/CN=localhost"`

Zum Testen im CMD / Terminal `openssl -v`

**Git**\
Download: https://git-scm.com/install/windows
1. Lade dir deinen Installer herunter z.B. Git for Windows/x64 Setup und führe die Datei aus. 
2. 

Zum Testen im CMD / Terminal `git -v` ausführen.


### GitHub Projekt Clonen
Öffne in Visual Studio Code durch die Option oben Links durch den File / Datei Knopf und dann auf Open Folder / Ordner Öffnen um nun einen Ordner oder den Desktop in Visual Studio Code zu öffnen. Dort wird später der Projektordner hinkopiert aus dem GitHub. Anderen falls kann man auch manuell die .zip Datei aus dem GitHub Projekt herunterladen und entpacken und diese dann mit Visual Studio Code öffnen, jedoch werden wir das mit dem Herunterladen der .zip nicht hier beschreiben.

Führe diesen Befehl im Terminal aus\
`git clone https://github.com/Gohst101/projektmanagment.ghost-exe.de`


### .env File einrichten
Damit das Projekt vernünftig läuft solltest du aus dem Ordner die Datei.env_example zu .env umbenennen und die Schritte in der Datei befolgen.



### Projekt Initalisieren
Wenn wir nun das Projekt geklont haben müssen wir sicherstellen das wir nochmal in Visual Studio Code einen Ordner öffnen und dann in den neu erstellten Projekt Ordner hineingehen und Ordner öffnen klicken.

**Dort müssen wir dann folgende Befehle im Terminal eingeben:**\
Das npm Projekt Initalisieren\
`npm init -y`

Die npm Packete Installieren\
`npm install bcryptjs dotenv ejs express-session express fs mysql2 path pem`

Projekt Starten\
`npm run dev`

Nun sollte das Projekt unter: https://localhost:deinPort erreichbar sein.
