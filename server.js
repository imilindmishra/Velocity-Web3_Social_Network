import express from "express";
import multer from "multer";
import { join } from "path";
import { writeFile } from "fs";

const app = express();
//cors setup
import cors from "cors";
app.use(cors());
const upload = multer();

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image file provided.");
  }

  const fileName = `${req.body.name}.png`;
  const filePath = join(__dirname, "public", "images", fileName);

  writeFile(filePath, req.file.buffer, (err) => {
    if (err) {
      console.error("Error saving image:", err);
      return res.status(500).send("Error saving image.");
    }

    res.send("Image saved successfully!");
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


