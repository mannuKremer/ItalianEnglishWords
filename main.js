const { app, Tray, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const config = require("./config.json");

let words = [];
let tray = null;
let currentWord = { italian: "?", english: "?" };

app.whenReady().then(() => {
    app.dock.hide();
    tray = new Tray(path.join(__dirname, "icon.png"));

    loadWords();
    setInterval(updateWord, config.updateInterval);
});

function loadWords() {
    const wordsPath = path.join(__dirname, config.wordsFile);
    fs.readFile(wordsPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading words file:", err);
            return;
        }
        words = JSON.parse(data);
        updateWord();
    });
}

function updateWord() {
    if (words.length === 0) return;

    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];

    tray.setTitle(`${currentWord.italian} - ${currentWord.english}`);
    updateContextMenu();
}

function playWord() {
    const filePath = path.join(config.tempDir, `${currentWord.italian}${config.audioFormat}`);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=it&q=${encodeURIComponent(currentWord.italian)}`;

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        console.log(`Downloading: ${currentWord.italian}`);
        exec(`wget -O "${filePath}" "${url}"`, (error) => {
            if (error) {
                console.error("Download failed:", error);
                return;
            }
            playAudio(filePath);
        });
    } else {
        playAudio(filePath);
    }
}

function playAudio(filePath) {
    if (fs.existsSync(filePath)) {
        exec(`afplay "${filePath}"`);
    } else {
        console.error("Audio file missing:", filePath);
    }
}

function updateContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
        { label: `🔊 Play "${currentWord.italian}"`, click: playWord },
        { label: "➡ Next Word", click: updateWord },
        { type: "separator" },
        { label: "Quit", click: () => app.quit() }
    ]);
    tray.setContextMenu(contextMenu);
}
