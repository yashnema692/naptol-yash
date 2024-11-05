const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/getbytype',  farmerController.getByType);

router.get('/',  farmerController.list);

router.post('/', farmerController.create);

router.put('/:id', farmerController.update);

router.delete('/:id', farmerController.delete);

router.get('/:id', farmerController.get);



module.exports = router;
