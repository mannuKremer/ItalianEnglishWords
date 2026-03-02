const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const config = require("../config.json");

function playWord(word, onDone) {
    const filePath = path.join(config.tempDir, `${word.english}${config.audioFormat}`);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=en&q=${encodeURIComponent(word.english)}`;

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        exec(`curl -s -o "${filePath}" "${url}"`, (error) => {
            if (error) {
                console.error("Download failed:", error);
                if (onDone) onDone();
                return;
            }
            playAudio(filePath, onDone);
        });
    } else {
        playAudio(filePath, onDone);
    }
}

function playAudio(filePath, onDone) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100) {
        exec(`/usr/bin/afplay "${filePath}"`, () => {
            if (onDone) onDone();
        });
    } else {
        console.error("Audio file is empty or missing:", filePath);
        if (onDone) onDone();
    }
}

module.exports = { playWord };
