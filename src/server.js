import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

// For handling __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

app.use(cors()); // Use CORS

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '/output/')); // Make sure the output directory exists
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/cards', upload.single('cardImage'), (req, res) => {
  console.log('Received card data:', req.body);
  console.log('Received file:', req.file);
  res.json({ message: 'Card and image uploaded successfully!' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
