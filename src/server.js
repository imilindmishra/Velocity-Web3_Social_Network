import express, { json } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cardsDirectory = path.join(__dirname, "cards");
if (!fs.existsSync(cardsDirectory)) {
  fs.mkdirSync(cardsDirectory);
}

app.post("/api/cards", async (req, res) => {
  try {
    const cardData = req.body;

    // Generate unique file names for both the JSON and image files
    const jsonFileName = `${Date.now()}.json`;
    const imageFileName = `${Date.now()}.png`;

    // Define the paths where the files will be saved
    const jsonFilePath = path.join(cardsDirectory, jsonFileName);
    const imageFilePath = path.join(cardsDirectory, imageFileName);

    // Write the card data (JSON) to the file
    fs.writeFileSync(jsonFilePath, JSON.stringify(cardData, null, 2));

    // Write the card image data to the file
    fs.writeFileSync(imageFilePath, cardImage, "base64"); // Assuming cardImage is in base64 format

    // Respond with the file names or any other response as needed
    res.status(201).json({ jsonFileName, imageFileName });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/cards", async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
