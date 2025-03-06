const fs = require("fs");
const path = require("path");

const favoritesPath = path.join(__dirname, "../favorites.json");
let favorites = [];

function loadFavorites() {
    fs.readFile(favoritesPath, "utf8", (err, data) => {
        if (!err && data) {
            favorites = JSON.parse(data);
        }
    });
}

function saveFavorites() {
    fs.writeFile(favoritesPath, JSON.stringify(favorites, null, 2), (err) => {
        if (err) console.error("Error saving favorites:", err);
    });
}

function addToFavorites(word) {
    if (!favorites.some(fav => fav.italian === word.italian)) {
    favorites.push(word);
    saveFavorites();
}
}

function removeFromFavorites(word) {
    favorites = favorites.filter(fav => fav.italian !== word.italian);
    saveFavorites();
}

function getFavorites() {
    return favorites;
}

module.exports = { loadFavorites, addToFavorites, removeFromFavorites, getFavorites };
