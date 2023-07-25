const express = require('express');
const router = express.Router();
const pool = require('../models/pool');

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





module.exports = router;
