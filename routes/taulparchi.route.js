const express = require('express');
const router = express.Router();
const TaulParchiController = require('../controllers/taulparchi.controller');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.get('/userId/:id',  TaulParchiController.getByUser);

router.get('/getsummary', TaulParchiController.getTaulParchiSummary);

router.get('/',  TaulParchiController.list);

router.post('/', TaulParchiController.create);

router.get('/getWeightsummary', TaulParchiController.getWeightSummary);

router.get('/taulparchisAggregate', TaulParchiController.getTaulparchisAggregatedData);

router.get('/getdetails', TaulParchiController.getTaulParchiDetails);

router.put('/:id', TaulParchiController.update);

router.delete('/:id', TaulParchiController.delete);

router.get('/:id', TaulParchiController.get);




module.exports = router;