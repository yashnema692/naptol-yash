const express = require('express');
const router = express.Router();
const advanceController = require('../controllers/advancePayment.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  advanceController.list);

router.post('/', advanceController.create);

router.put('/:id', advanceController.update);

router.delete('/:id', advanceController.delete);

router.get('/:id', advanceController.get);



module.exports = router;