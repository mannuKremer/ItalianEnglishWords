const { Tray, Menu } = require("electron");
const path = require("path");
const { getCurrentWord, onWordChange } = require("./stateService");
const { nextWord } = require("./wordsService");
const { addToFavorites, removeFromFavorites, getFavorites } = require("./favoritesService");
const { playWord } = require("./audioService");

let tray = null;
let isFavoritesMode = false;

function initTray() {
    tray = new Tray(path.join(__dirname, "./icon.png"));
    updateContextMenu();

    onWordChange((word) => {
        tray.setTitle(`${word.italian} - ${word.english} - ${word.hebrew}`);
        updateContextMenu();
    });
}

function updateContextMenu() {
    const word = getCurrentWord();

    const contextMenu = Menu.buildFromTemplate([
        { label: `🔊 Play "${word.italian}"`, click: () => playWord(word) },
        { label: "➡ Next Word", click: () => nextWord() },
        { label: "⭐ Add to Favorites", click: () => addToFavorites(word) },
        { label: "❌ Remove from Favorites", click: () => removeFromFavorites(word), enabled: isFavoritesMode },
        { label: isFavoritesMode ? "🔄 Show All Words" : "📜 Show Favorites", click: toggleFavoritesMode },
        { type: "separator" },
        { label: "Quit", click: () => process.exit(0) }
    ]);

    if (tray) {
        tray.setContextMenu(contextMenu);
    }
}

function toggleFavoritesMode() {
    isFavoritesMode = !isFavoritesMode;
    updateContextMenu();
}

module.exports = { initTray, updateContextMenu };
