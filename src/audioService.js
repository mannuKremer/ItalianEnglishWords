const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const config = require("../config");

function playWord(word) {
    const filePath = path.join(config.tempDir, `${word.italian}${config.audioFormat}`);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=it&q=${encodeURIComponent(word.italian)}`;

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        exec(`curl -s -o "${filePath}" "${url}"`, (error) => {
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
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100) {
        exec(`/usr/bin/afplay "${filePath}"`);
    } else {
        console.error("Audio file is empty or missing:", filePath);
    }
}

module.exports = { playWord };
