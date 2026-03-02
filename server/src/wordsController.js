const express = require("express");
const db = require("./firebase");
const { loadWordsFromFile } = require("./localWordsLoader");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("words").get();
        const words = snapshot.docs.map(doc => doc.data());

        if (words.length === 0) {
            console.warn("⚠ No words found in Firestore. Using local file.");
            return res.json(loadWordsFromFile());
        }

        res.json(words);
    } catch (error) {
        console.error("❌ Error fetching words from Firestore:", error);
        res.json(loadWordsFromFile());
    }
});


router.get("/random", async (req, res) => {
    try {
        const snapshot = await db.collection("words").get();
        const words = snapshot.docs.map(doc => doc.data());

        if (words.length === 0) {
            console.warn("⚠ No words found in Firestore. Using local file.");
            return res.json(getRandomWord(loadWordsFromFile()));
        }

        res.json(getRandomWord(words));
    } catch (error) {
        console.error("❌ Error fetching words from Firestore:", error);
        res.json(getRandomWord(loadWordsFromFile()));
    }
});

function getRandomWord(words) {
    return words.length > 0 ? words[Math.floor(Math.random() * words.length)] : {};
}

module.exports = router;
