const express = require('express');
const router = express.Router();
const hammalsController = require('../controllers/hammals.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  hammalsController.list);

router.post('/', hammalsController.create);

router.put('/:id', hammalsController.update);

router.delete('/:id', hammalsController.delete);

router.get('/:id', hammalsController.get);



module.exports = router;
