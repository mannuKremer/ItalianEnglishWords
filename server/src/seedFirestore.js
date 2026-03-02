require("dotenv").config();
var admin = require("firebase-admin");
var fs = require("fs");
var path = require("path");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});

var db = admin.firestore();

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

async function deleteCollection(collectionRef, batchSize) {
    var snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.size === 0) return;

    var batch = db.batch();
    snapshot.docs.forEach(function(doc) { batch.delete(doc.ref); });
    await batch.commit();

    console.log("Deleted " + snapshot.size + " documents...");
    await deleteCollection(collectionRef, batchSize);
}

async function seed() {
    console.log("Deleting existing words...");
    await deleteCollection(db.collection("words"), 400);
    console.log("All existing words deleted.\n");

    var filePath = path.join(__dirname, "../../shared/psychometric_vocab_pairs.csv");
    var data = fs.readFileSync(filePath, "utf8");
    var lines = data.split("\n").filter(function(l) { return l.trim(); });
    var words = lines.slice(1).map(function(line) {
        var parts = parseCsvLine(line);
        return { english: parts[0], hebrew: parts[1] };
    }).filter(function(w) { return w.english && w.hebrew; });

    console.log("Uploading " + words.length + " words to Firestore...");

    // Firestore batch limit is 500
    for (var i = 0; i < words.length; i += 400) {
        var batch = db.batch();
        var chunk = words.slice(i, i + 400);
        chunk.forEach(function(word, j) {
            var ref = db.collection("words").doc(String(i + j));
            batch.set(ref, word);
        });
        await batch.commit();
        console.log("Uploaded " + Math.min(i + 400, words.length) + "/" + words.length);
    }

    console.log("\nDone! " + words.length + " words uploaded to Firestore.");
    process.exit(0);
}

seed().catch(function(err) {
    console.error("Error:", err);
    process.exit(1);
});