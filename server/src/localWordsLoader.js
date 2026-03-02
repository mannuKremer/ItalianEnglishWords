const fs = require("fs");
const path = require("path");

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
        const words = lines.slice(1).map(line => {
            const [english, hebrew] = parseCsvLine(line);
            return { english, hebrew };
        }).filter(w => w.english && w.hebrew);

        if (words.length === 0) {
            console.error("❌ Local words file is empty or invalid.");
            return [];
        }

        console.log("✅ Loaded words from local CSV file.");
        return words;
    } catch (error) {
        console.error("❌ Error reading local words file:", error);
        return [];
    }
}

module.exports = { loadWordsFromFile };
