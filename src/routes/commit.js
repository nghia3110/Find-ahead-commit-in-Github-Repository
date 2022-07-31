const express = require('express');
const router = express.Router();

const mainController = require('../app/controllers/MainController'); 

router.use('/', mainController.showCommit);

module.exports = router;