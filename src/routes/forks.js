const express = require('express');
const router = express.Router();

const mainController = require('../app/controllers/MainController'); 

router.use('/', mainController.showForks);

module.exports = router;