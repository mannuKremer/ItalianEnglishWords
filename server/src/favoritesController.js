const express = require("express");
const db = require("./firebase");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("favorites").get();
        const favorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});


router.post("/", async (req, res) => {
    try {
        const { english, hebrew } = req.body;
        const docRef = await db.collection("favorites").add({ english, hebrew });
        res.json({ id: docRef.id, english, hebrew });
    } catch (error) {
        res.status(500).json({ error: "Failed to add favorite" });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("favorites").doc(id).delete();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove favorite" });
    }
});

module.exports = router;
