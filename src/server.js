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

    // Generate a unique file name (you can use a timestamp, UUID, or any other method)
    const fileName = `${Date.now()}.json`;

    // Define the path where the file will be saved
    const filePath = path.join(cardsDirectory, fileName);

    // Write the card data to the file
    fs.writeFileSync(filePath, JSON.stringify(cardData, null, 2));

    res.status(201).json({ fileName }); // Return the file name or any other response as needed
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
