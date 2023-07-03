import FTP from 'ftp';
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
const app = express();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// FTP'ye dosya yükleme
async function uploadFileToFtp(fileContents, remotePath) {
  return new Promise((resolve, reject) => {
    const client = new FTP();

    client.on('ready', () => {
      console.log('FTP bağlantısı başarılı. Dosya yükleniyor...');

      client.put(fileContents, remotePath, (error) => {
        client.end(); // Close the FTP connection

        if (error) {
          console.error('Dosya yükleme hatası:', error);
          reject(error);
        } else {
          console.log('Dosya başarıyla yüklendi!');
          resolve();
        }
      });
    });

    client.on('error', (error) => {
      console.error('FTP bağlantı hatası:', error);
      reject(error);
    });

    client.connect({
      host: '145.14.156.206', // FTP sunucu adresi
      user: 'u983993164', // FTP kullanıcı adı
      password: 'Pa$$w0rd!', // FTP şifre
      port: 21, // FTP portu
    });
  });
}

// Hosting sunucusuna dosya kaydetme
// Hosting sunucusuna dosya kaydetme
async function saveFileToHosting(fileContents, fileName) {
  return new Promise((resolve, reject) => {
    const localPath = `back/assets/images/cv_photo/${fileName}`; // Kaydedilecek yerel dosya yolunu belirtin

    fs.writeFile(localPath, fileContents, (error) => {
      if (error) {
        console.error('Dosya kaydetme hatası:', error);
        reject(error);
      } else {
        console.log('Dosya hosting sunucusuna kaydedildi!');
        const remotePath = `public_html/1is/public/back/assets/images/cv_photo/${fileName}`; // Yüklenecek dosyanın uzak FTP yolu
        uploadFileToFtp(fileContents, remotePath)
          .then(() => {
            console.log('Dosya FTP sunucusuna yüklendi!');
            resolve();
          })
          .catch((error) => {
            console.error('FTP dosya yükleme hatası:', error);
            reject(error);
          });
      }
    });
  });
}



app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileContents = req.file.buffer; // Multer'dan dosya içeriğini alın
    const extension = '.png'; // Gerçek dosya uzantısıyla değiştirin

    const fileName = `cv_${uuidv4().substring(0, 6)}${extension}`; // Rastgele bir dosya adı oluşturun
    const remotePath = `back/assets/images/cv_photo/${fileName}`; // Yüklenecek dosyanın uzak FTP yolu

    console.log('Dosya yüklemesi başlıyor...');
    await uploadFileToFtp(fileContents, remotePath);
    console.log('Dosya yükleme tamamlandı!');

    const localPath = `back/assets/images/cv_photo/${fileName}`; // Kaydedilecek yerel dosya yolunu belirtin

    fs.writeFile(localPath, fileContents, (error) => {
      if (error) {
        console.error('Dosya kaydetme hatası:', error);
        res.status(500).json({ error: 'Dosya kaydetme başarısız' });
      } else {
        console.log('Dosya hosting sunucusuna kaydedildi!');
        const fileUrl = `https://srv926-files.hstgr.io/a3dc356988a95d11/files/public_html/1is/public/${fileName}`; // Yüklenen dosyanın URL'i
        res.status(200).json({ message: 'Dosya başarıyla yüklendi', fileUrl });
      }
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: 'Dosya yükleme başarısız' });
  }
});


app.listen(8000, () => {
  console.log('Server port 8000 üzerinde çalışıyor');
});
