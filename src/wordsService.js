const db = require("./firebase");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { setCurrentWord } = require("./stateService");

let words = [];
let timer = null;

async function loadWords() {
    try {
        const snapshot = await db.collection(config.wordsCollection).get();
        words = snapshot.docs.map(doc => doc.data());
        if (words.length === 0) {
            console.error("No words found in Firestore. Loading from local file...");
            loadWordsFromFile();
            return;
        }
        nextWord();
        startTimer();
    } catch (error) {
        console.error("Error loading words from Firestore:", error);
        console.log("Loading words from local file...");
        loadWordsFromFile();
    }
}

function loadWordsFromFile() {
    try {
        const filePath = path.join(__dirname, "../italian_english_hebrew_words.json");
        const data = fs.readFileSync(filePath, "utf8");
        words = JSON.parse(data);
        if (words.length === 0) {
            console.error("Local words file is empty.");
            return;
        }
        nextWord();
        startTimer();
    } catch (error) {
        console.error("Error reading local words file:", error);
    }
}

function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextWord, config.updateInterval);
}

function nextWord() {
    if (words.length === 0) return;
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
}

module.exports = { loadWords, nextWord };