const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/',  TransactionController.list);

router.post('/', TransactionController.create);

router.put('/:id', TransactionController.update);

router.delete('/:id', TransactionController.delete);

router.get('/:id', TransactionController.get);

module.exports = router;