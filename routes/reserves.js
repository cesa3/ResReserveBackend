const express = require('express');
const {getReserves,getReserve,addReserve,updateReserve,deleteReserve,deleteAllReserve} = require('../controllers/reserves');


const router = express.Router({mergeParams:true});

const {protect,authorize} = require('../middleware/auth');

router.route('/').get(protect,getReserves).post(protect,authorize('admin','user'),addReserve).delete(protect,authorize('admin','user'),deleteAllReserve);
router.route('/:id').get(protect,getReserve).put(protect,authorize('admin','user'),updateReserve).delete(protect,authorize('admin','user'),deleteReserve);

module.exports = router;