const Restaurant = require('../models/Restaurant');


//@desc Getall restaurant
//@route GET /api/v1/restaurants
//@access Public

exports.getRestaurants=async(req,res,next) => { 
    try{
        let query;
        const reqQuery= {...req.query};
        const removeFields=['select','sort','page','limit'];
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);

        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
        query=Restaurant.find(JSON.parse(queryStr)).populate('reserves');
 
        if(req.query.select){
            const fields=req.query.select.split(',').join(' ');
            query=query.select(fields);
        }
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query=query.sort(sortBy);
        }else{
            query=query.sort('-createdAt');
        }
        const page = parseInt(req.query.page,10)|| 1;
        const limit = parseInt(req.query.limit,10) || 25;
        const startIndex = (page - 1)*limit;
        const endIndex = page*limit;
        const total = await Restaurant.countDocuments();
        query = query.skip(startIndex).limit(limit);
        const restaurants = await query;
        const pagination = {};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }
        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        res.status(200).json({success:true,count:restaurants.length,pagination,data:restaurants});
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc Get single restaurant
//@route GET /api/v1/restaurants/:id
//@access Public

exports.getRestaurant=async(req,res,next) => {
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({ success: true, data:restaurant });
    }catch(err){
        return res.status(400).json({success:false});
    }
};

exports.getTable=async(req,res,next) => {
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({ success: true, data:restaurant.table});
    }catch(err){
        return res.status(400).json({success:false});
    }
};

//@desc Create restaurant
//@route POST /api/v1/restaurants
//@access Private

exports.createRestaurant=async (req,res,next) => {
    try{
        const restaurant =await Restaurant.create(req.body);
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(201).json({success:true,data:restaurant});
    }catch(err){
        console.log(err)
        return res.status(400).json({success:false, msg:"eiei"});
    }
};

//@desc Put restaurant
//@route PUT /api/v1/restaurants/:id
//@access Private

exports.updateRestaurant=async(req,res,next) => {
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators:true
        })
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:restaurant});
    }catch(err){
        return res.status(400).json({success:false});
    }
};

//@desc delete restaurant
//@route DELETE /api/v1/restaurants/:id
//@access Private

exports.deleteRestaurant=async(req,res,next) => {
    try{
        const restaurant = await Restaurant.findById(req.params.id);

        if(!restaurant){
            return res.status(404).json({success:false, message: `Bootcamp not found with id of ${req.params.id}`});
        }
        await restaurant.deleteOne();
        res.status(200).json({success:true,data: {}});
    }catch(err){
        res.status(400).json({success:false});
    }
};



