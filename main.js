const { app, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const UPDATE_INTERVAL = 30000;
let words = [];

app.whenReady().then(() => {
    app.dock.hide();
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Quit', click: () => app.quit() } // אפשרות לסגור
    ]);

    tray = new Tray(path.join(__dirname, 'icon.png'));
    tray.setContextMenu(contextMenu);

    fs.readFile(path.join(__dirname, 'italian_italian_words.json'), 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading words file:", err);
            return;
        }
        words = JSON.parse(data);
        updateWord();
        setInterval(updateWord, UPDATE_INTERVAL);
    });

    function updateWord() {
        if (words.length === 0) return;
        const randomIndex = Math.floor(Math.random() * words.length);
        const { italian, english } = words[randomIndex];
        tray.setTitle(`${italian} - ${english}`);
    }
});
