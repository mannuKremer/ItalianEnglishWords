const { Tray, Menu } = require("electron");
const path = require("path");
const { getCurrentWord, onWordChange } = require("./stateService");
const { nextWord, stopTimer, resumeTimer, isPaused, setWordSource } = require("./wordsService");
const { addToFavorites, removeFromFavorites, getFavorites } = require("./favoritesService");
const { playWord } = require("./audioService");

let tray = null;
let isFavoritesMode = false;
let wasPausedBeforeMenu = false;

function playWithPause(word) {
    stopTimer();
    playWord(word, () => {
        resumeTimer();
    });
}

function initTray() {
    tray = new Tray(path.join(__dirname, "./icon.png"));
    updateContextMenu();

    onWordChange((word) => {
        tray.setTitle(`${word.english} - ${word.hebrew}`);
        updateContextMenu();
    });
}

function updateContextMenu() {
    const word = getCurrentWord();

    const contextMenu = Menu.buildFromTemplate([
        { label: `🔊 Play "${word.english}"`, click: () => playWithPause(word) },
        { label: "➡ Next Word", click: () => nextWord() },
        { label: isPaused() ? "▶ Resume" : "⏸ Pause", click: () => { isPaused() ? resumeTimer() : stopTimer(); updateContextMenu(); } },
        { label: "⭐ Add to Favorites", click: () => addToFavorites(word) },
        { label: "❌ Remove from Favorites", click: () => removeFromFavorites(word), enabled: isFavoritesMode },
        { label: isFavoritesMode ? "🔄 Show All Words" : "📜 Show Favorites", click: toggleFavoritesMode },
        { type: "separator" },
        { label: "Quit", click: () => process.exit(0) }
    ]);

    contextMenu.on('menu-will-show', () => {
        wasPausedBeforeMenu = isPaused();
        if (!wasPausedBeforeMenu) stopTimer();
    });

    contextMenu.on('menu-will-close', () => {
        if (!wasPausedBeforeMenu) resumeTimer();
    });

    if (tray) {
        tray.setContextMenu(contextMenu);
    }
}

function toggleFavoritesMode() {
    isFavoritesMode = !isFavoritesMode;
    setWordSource(isFavoritesMode ? getFavorites : null);
    nextWord();
    updateContextMenu();
}

module.exports = { initTray, updateContextMenu };
