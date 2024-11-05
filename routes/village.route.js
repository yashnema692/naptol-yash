const express = require('express');
const router = express.Router();
const villageController = require('../controllers/village.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  villageController.list);

router.post('/', villageController.create);

router.put('/:id', villageController.update);

router.delete('/:id', villageController.delete);

router.get('/:id', villageController.get);



module.exports = router;