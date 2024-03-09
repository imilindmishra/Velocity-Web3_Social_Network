import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs'; // Ensure fs is imported

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '/output/')); // Ensure the output directory exists
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/cards', upload.single('cardImage'), async (req, res) => {
  const filePath = path.join(__dirname, 'output', req.file.filename);
  
  try {
    const pinataResponse = await pinFileToIPFS(filePath);
    res.json({ message: 'Card and image uploaded successfully!', pinataResponse });

    // After successful upload, delete the file from the local filesystem
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting the file after upload:", err);
      } else {
        console.log("File deleted successfully after upload.");
      }
    });

  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    res.status(500).send('Error uploading to Pinata');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

async function pinFileToIPFS(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const PINATA_API_KEY = '46b0fa147177770f0ee0'; // Use environment variables in production
  const PINATA_API_SECRET = '87178730d50d9fd901ed7b7c3ac7435ac265f91844ab61db1594a23d41a2a4e7'; // Use environment variables in production

  const options = {
    method: 'POST',
    url,
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_API_SECRET,
      ...data.getHeaders(),
    },
    data,
  };
  
  const response = await axios(options);
  return response.data;
}
