import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import mysql from "mysql";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import cors from "cors";
import nodemailer from "nodemailer";
import schedule from 'node-schedule';
import { body, validationResult, param  } from 'express-validator';
import axios from 'axios';
import fs from 'fs';
import FTP from 'basic-ftp';
import path from 'path';

const app = express();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "145.14.156.192",
  user: "u983993164_1is",
  password: "Buta2023@",
  database: "u983993164_1is",
  timeout: 100000,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
    return;
  }
  console.log("Connected to database with ID " + connection.threadId);
  connection.release();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = 'https://srv926-files.hstgr.io/de5d894127c0801d/files/public_html/1is/public/back/assets/images/cv_photo/';
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    const name = 'cv_' + uuidv4().substring(0, 6) + path.extname(file.originalname);
    cb(null, name);
  }
});

const upload = multer({ storage });

// Upload file to FTP
async function uploadFileToFtp(fileBuffer, remotePath) {
  const client = new FTP.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: '145.14.156.206', // FTP server address
      user: 'u983993164', // FTP username
      password: 'Pa$$w0rd!', // FTP password
      secure: false, // Set to false if not using FTPS
    });

    // Create the directory if it doesn't exist
    const directoryPath = path.dirname(remotePath);
    await client.ensureDir(directoryPath);

    await client.uploadFrom(localFilePath, remotePath);

    console.log('File uploaded successfully!');
  } catch (error) {
    console.error('File upload error:', error);
    throw error; // Rethrow the error to handle it in the calling function
  } finally {
    client.close();
  }
}

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File could not be uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const remoteFileName = 'cv_' + uuidv4().substring(0, 6) + path.extname(req.file.originalname);
    const remotePath = 'back/assets/images/cv_photo/' + remoteFileName;

    await uploadFileToFtp(fileBuffer, remotePath);

    const fileUrl = `https://1is.butagrup.az/${remotePath}`; // URL of the uploaded file
    console.log(fileUrl)
    return res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});
