const multer = require('multer');
const express = require('express');

const upload = multer();
const { facialScore } = require('../controllers/face-scoring');
const { integrityCheck } = require('../controllers/play-integrity');

const router = express.Router();

//* --------------------------  ROUTES  ---------------------------- *//
router.post('/integrity-check', integrityCheck);
router.post('/facial-score', upload.single('image'), facialScore);

module.exports = router;
