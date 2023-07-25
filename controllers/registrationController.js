const registrationModel = require('../models/registrationModel');

exports.registerUser = async (req, res) => {
  const registrationData = req.body;

  try {
    const isUsernameTaken = await registrationModel.isUsernameTaken(registrationData.username);

    if (isUsernameTaken) {
      res.status(409).json({ error: 'Username has been taken' });
    } else {
      await registrationModel.registerUser(registrationData);
      res.send('Registration successful');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Registration failed');
  }
};
