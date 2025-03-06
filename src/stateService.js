let currentWord = { italian: "?", english: "?", hebrew: "?" };
let onWordChangeCallback = null;

function setCurrentWord(word) {
    currentWord = word;
    if (onWordChangeCallback) {
        onWordChangeCallback(word);
    }
}

function getCurrentWord() {
    return currentWord;
}

function onWordChange(callback) {
    onWordChangeCallback = callback;
}

module.exports = { setCurrentWord, getCurrentWord, onWordChange };
