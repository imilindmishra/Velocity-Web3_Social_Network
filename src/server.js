import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '/output/'));
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Pinata API credentials (should be env variables for security)
const PINATA_API_KEY = '46b0fa147177770f0ee0';
const PINATA_API_SECRET = '87178730d50d9fd901ed7b7c3ac7435ac265f91844ab61db1594a23d41a2a4e7';

// Endpoint to handle file uploads and IPFS pinning
app.post('/api/cards', upload.single('cardImage'), async (req, res) => {
  if (!req.file) {
    console.log('No file received');
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'output', req.file.filename);
  console.log(`File path: ${filePath}`);

  try {
    // Pin file to IPFS
    const pinataResponse = await pinFileToIPFS(filePath);
    const imageIpfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.IpfsHash}`;
    console.log("File pinned at IPFS URL:", imageIpfsUrl);

    // Create metadata JSON object
    const metadata = {
      name: "Developer Card",
      description: "A card representing a developer.",
      image: imageIpfsUrl
    };

    // Pin metadata to IPFS
    const metadataResponse = await pinJSONToIPFS(metadata);

    // Respond with the IPFS URL of the metadata
    res.json({ success: true, ipfsUrl: metadataResponse.ipfsUrl });

    // Cleanup after successful pinning
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting the file after upload:", err);
      else console.log("File deleted successfully after upload.");
    });
  } catch (error) {
    console.error('Error in uploading to Pinata:', error);
    res.status(500).json({ success: false, message: "Error in uploading to Pinata", error: error.toString() });
  }
});

// Function to pin files to IPFS
async function pinFileToIPFS(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const options = {
    method: 'POST',
    url: url,
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_API_SECRET,
      ...data.getHeaders(),
    },
    data: data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Function to pin JSON to IPFS
async function pinJSONToIPFS(json) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const data = {
    pinataContent: json
  };

  const options = {
    method: 'POST',
    url: url,
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_API_SECRET
    },
    data: data,
  };

  try {
    const response = await axios(options);
    const metadataIpfsHash = response.data.IpfsHash;
    const metadataIpfsUrl = `https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`;
    return { ipfsUrl: metadataIpfsUrl, ipfsHash: metadataIpfsHash };
  } catch (error) {
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
