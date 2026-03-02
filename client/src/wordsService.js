const fs = require("fs");
const path = require("path");
const config = require("../config");
const { setCurrentWord } = require("./stateService");

let words = [];
let timer = null;
let paused = false;
let wordSourceFn = null;

async function loadWords() {
    try {
        const response = await fetch("https://italianenglishwords.onrender.com/words");
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        words = await response.json();

        if (words.length === 0) {
            console.error("No words received from server. Loading from local file...");
            loadWordsFromFile();
            return;
        }

        nextWord();
        startTimer();
    } catch (error) {
        console.error("Error fetching words from server:", error);
        console.log("Loading words from local file...");
        loadWordsFromFile();
    }
}


function parseCsvLine(line) {
    var result = [];
    var current = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (ch === '"' && inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
        } else if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

function loadWordsFromFile() {
    try {
        const filePath = path.join(__dirname, "../../shared/psychometric_vocab_pairs.csv");
        const data = fs.readFileSync(filePath, "utf8");
        const lines = data.split("\n").filter(l => l.trim());
        words = lines.slice(1).map(line => {
            const [english, hebrew] = parseCsvLine(line);
            return { english, hebrew };
        }).filter(w => w.english && w.hebrew);
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
    var pool = wordSourceFn ? wordSourceFn() : words;
    if (pool.length === 0) return;
    var word = pool[Math.floor(Math.random() * pool.length)];
    setCurrentWord(word);
}

function setWordSource(fn) {
    wordSourceFn = fn;
}

function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    paused = true;
}

function resumeTimer() {
    paused = false;
    startTimer();
}

function isPaused() {
    return paused;
}

module.exports = { loadWords, nextWord, stopTimer, resumeTimer, isPaused, setWordSource };