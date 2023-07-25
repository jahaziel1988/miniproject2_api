const express = require('express');
const router = express.Router();
const pool = require('../models/pool');
const sendEmail = require('../utils/email');



router.post('/approve', (req, res) => {
  const { userID, email, username } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'Invalid userID' });
  }

  const transferQuery = `INSERT INTO tblmemberinfo (uID, full_name, birthdate, address, member_of_other_communities, hear_from_us, what_can_you_do, dream_community) 
  SELECT uID, full_name, birthdate, address, member_of_other_communities, hear_from_us, what_can_you_do, dream_community 
  FROM tblUserInfo WHERE uID = ?`;

  pool.query(transferQuery, [userID], (err, transferResult) => {
    if (err) {
      console.error('Error transferring user data:', err);
      res.status(500).json({ error: 'An error occurred while transferring user data.' });
    } else {
      console.log('User data transferred to tblmemberinfo');

      const updateQuery = 'UPDATE tblAccInfo SET is_approved = ? WHERE uID = ?';
      pool.query(updateQuery, [true, userID], (err, result) => {
        if (err) {
          console.error('Error updating user approval status:', err);
          res.status(500).json({ error: 'An error occurred while updating user approval status.' });
        } else {
          console.log('User approval status updated');

          const subject = 'Account Approved';
          const message = `Hello ${username}, \n\nWe are happy to announce that your account has been approved. You can now use your registered username and password to log in to our community website.\n\nWelcome to the 2KLC community!\n\nBest regards,\n2KLC Community Team`;

          sendEmail(email, subject, message)
            .then(() => {
              res.json({ message: 'User approved and email sent successfully!' });
            })
            .catch((error) => {
              console.error('Error sending approval email:', error);
              res.status(500).json({ error: 'An error occurred while sending approval email.' });
            });
        }
      });
    }
  });
});



module.exports = router;
