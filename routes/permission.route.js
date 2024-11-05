const express = require('express');
const router = express.Router();
const partiesController = require('../controllers/permission.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  partiesController.list);

router.post('/', partiesController.create);

router.put('/:id', partiesController.update);

router.delete('/:id', partiesController.delete);

router.get('/:id', partiesController.get);


module.exports = router;
