const express = require('express');
const router = express.Router();
const truckController = require('../controllers/truck.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/getbytype',  truckController.getByType);

router.get('/',  truckController.list);

router.post('/', truckController.create);

router.put('/:id', truckController.update);

router.delete('/:id', truckController.delete);

router.get('/:id', truckController.get);



module.exports = router;
