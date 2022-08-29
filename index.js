require('dotenv').config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const router = require('./src/routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(express.json());
app.use(cors());

app.post('/', (req, res) => {
  res.send('Service is a go!');
});

app.use('/api/v1/', router);

app.listen(port, () => {
  console.log(`Service Running on port ${port}`);
});
