const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  deliveryController.list);

router.post('/', deliveryController.create);

router.put('/:id', deliveryController.update);

router.delete('/:id', deliveryController.delete);

router.get('/:id', deliveryController.get);



module.exports = router;
