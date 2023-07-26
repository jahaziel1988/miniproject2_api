const express = require('express');
const router = express.Router();
const pool = require('../models/pool');
const multer = require('multer');
const path = require('path');

router.get('/check-unique', (req, res) => {
  const { username, email } = req.query;
  const checkUniqueQuery =
    'SELECT COUNT(*) as count_username, (SELECT COUNT(*) FROM tblAccInfo WHERE email = ?) as count_email FROM tblAccInfo WHERE username = ?';

  pool.query(checkUniqueQuery, [email, username], (err, result) => {
    if (err) {
      console.error('Error checking unique username and email:', err);
      res.status(500).json({ error: 'An error occurred while checking unique username and email.' });
    } else {
      const isUniqueUsername = result[0].count_username === 0;
      const isUniqueEmail = result[0].count_email === 0;
      res.json({ isUniqueUsername, isUniqueEmail });
    }
  });
});

router.get('/', (req, res) => {
  const searchQuery = req.query.searchQuery || '';
  const getUsersQuery = `SELECT * FROM tblAccInfo JOIN tblUserInfo ON tblAccInfo.uID = tblUserInfo.uID`;
  const searchValue = `%${searchQuery}%`; 
  const isApproved = false; 

  pool.query(getUsersQuery, [isApproved, searchValue, searchValue], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'An error occurred while fetching users.' });
    } else {
      res.json(users);
    }
  });
});


const adminUsername = 'admin';
const adminPassword = 'admin123';


router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const findUserQuery = `SELECT * FROM tblAccInfo WHERE username = ? AND is_approved = 1 LIMIT 1`;

  pool.query(findUserQuery, [username], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'An error occurred while fetching user.' });
    } else if (username === adminUsername && password === adminPassword) {
      res.json({ message: 'Admin login successful', admin: true }); 
    } else {
      if (user.length === 0) {
        res.status(401).json({ error: 'Your account is not yet approved or the username and password provided are invalid. Please verify and retry.' });
      } else {
        if (user[0].password === password) {
          res.json({ message: 'Login successful', user: user[0] });
        } else {
          res.status(401).json({ error: 'Your account is not yet approved or the username and password provided are invalid. Please verify and retry.' });
        }
      }
    }
  });
});


// HIGHLIGHTS space TO GUYS

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueFilename = file.originalname; 
    cb(null, uniqueFilename);
  },
});




const upload = multer({ storage });

router.post('/highlights', upload.fields([{ name: 'playerCard', maxCount: 1 }, { name: 'videoHighlight', maxCount: 1 }]), (req, res) => {
  const { uID, username } = req.body;
  const playerCardURL = req.files['playerCard'][0].filename;
  const videoHighlightURL = req.files['videoHighlight'][0].filename;

  const insertHighlightQuery = 'INSERT INTO tblHighlights (uID, username, playerCard, videoHighlight) VALUES (?, ?, ?, ?)';
  pool.query(insertHighlightQuery, [uID, username, playerCardURL, videoHighlightURL], (err, result) => {
    if (err) {
      console.error('Error inserting highlight:', err);
      res.status(500).json({ error: 'An error occurred while adding the highlight.' });
    } else {
      res.json({ message: 'Highlight added successfully!' });
    }
  });
});


router.get('/highlights', (req, res) => {
  const getHighlightsQuery = 'SELECT * FROM tblHighlights';

  pool.query(getHighlightsQuery, (err, highlights) => {
    if (err) {
      console.error('Error fetching highlights:', err);
      res.status(500).json({ error: 'An error occurred while fetching highlights.' });
    } else {
      res.json(highlights);
    }
  });
});



module.exports = router;
