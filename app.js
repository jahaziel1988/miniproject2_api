const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;
const bodyParser = require('body-parser');
const registrationRouter = require('./routes/registration');
const adminRoutes = require('./routes/admin');
const usersRouter = require('./routes/users');
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

app.use('/register', registrationRouter);
app.use('/admin', adminRoutes);
app.use('/users', usersRouter);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
