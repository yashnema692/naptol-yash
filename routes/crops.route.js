const express = require('express');
const router = express.Router();
const cropsController = require('../controllers/crops.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  cropsController.list);

router.post('/', cropsController.create);

router.put('/:id', cropsController.update);

router.delete('/:id', cropsController.delete);

router.get('/:id', cropsController.get);



module.exports = router;
