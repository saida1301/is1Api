import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { createReadStream } from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

const imageUrl = 'https://srv926-files.hstgr.io/a3dc356988a95d11/files/public_html/1is/public/back/assets/images/cv_photo/';

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { path, originalname } = req.file;
    const image = createReadStream(path);
  
    const response = await axios.post(imageUrl + originalname, image, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    console.log('Image uploaded successfully');
    console.log('Response:', response.data);
  
    res.send('Image uploaded successfully');
  } catch (error) {
    console.error('Error uploading image:', error.response.data);
    res.status(500).send('Error uploading image');
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 3000');
});
