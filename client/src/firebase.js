require("dotenv").config();
console.log('process.env.FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PROJECT_ID);

console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "Exists" : "Not Found");

const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

const db = admin.firestore();
module.exports = db;
