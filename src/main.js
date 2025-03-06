const { app } = require("electron");
const { initTray } = require("./trayService");
const { loadWords } = require("./wordsService");
const { loadFavorites } = require("./favoritesService");

app.whenReady().then(async () => {
    app.dock.hide();
    initTray();

    await loadWords();
    loadFavorites();
});
