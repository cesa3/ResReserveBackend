const Reserve = require('../models/Reserve');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

exports.getReserves=async (req,res,next) => {
    let query;

    if(req.user.role !== 'admin'){
        query=Reserve.find({user:req.user.id}).populate({
            path:'restaurant',
            select:'name province tel'
        });
    }else{
        if(req.params.restaurantId){
            console.log(req.params.restaurantId);
            query=Reserve.find({restaurant: req.params.restaurantId}).populate({
                path:'restaurant',
                select:'name province tel'
            });
        }else
            query=Reserve.find().populate({
                path:'restaurant',
                select:'name province tel'
            });
            
        
    }

    try {
        const reserves=await query; 
        const reservesWithUserName = await Promise.all(reserves.map(async reserve => {
            // Find the user's name based on the user id in the reservation
            const user = await User.findById(reserve.user);
            console.log(user)
            const userName = user ? user.name : 'eiei';
            // Return the reservation with the user's name attached
            return {
                ...reserve._doc,
                userName: userName
            };
        }));

        res.status(200).json({
            success: true,
            count: reservesWithUserName.length,
            data: reservesWithUserName
        });
    }catch(err){
        return res.status(500).json({success:false,message:"Cannot find Reserve"});
    }
};

exports.getReserve=async (req,res,next) => {
    try{
        const reserve = await Reserve.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name description tel'
        });

        if(!reserve){
            return res.status(404).json({success:false, message: `No reserse with the id of ${req.params.id}`});
        }
        if(reserve.user.toString() !== req.user.id  && req.user.role !== 'admin' ){
            return res.status(404).json({success:false, message: `Cannot get this reserse with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: reserve
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Reserve"});
    }
}

exports.addReserve=async(req,res,next) => {
    try{
        req.body.restaurant=req.params.restaurantId;

        const restaurant= await Restaurant.findById(req.params.restaurantId);

        if(!restaurant){
            return res.status(404).json({success:false,message:`No restaurant with the id of ${req.params.restuarantId}`});
        }


        req.body.user=req.user.id;
        const existedReserve=await Reserve.find({user:req.user.id});
        
        if(existedReserve.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reserves`});
        }
        const reserve = await Reserve.create(req.body);

        const tablenum = req.body.table;
        
        const newTimeSlot = { start: req.body.start, end: req.body.end }; 
        const targetTableNumber = req.body.table;
        const targetTable = restaurant.table.find(table => table.tableNumber === targetTableNumber);
        if (targetTable) {
            targetTable.timeSlots.push(newTimeSlot);
            await restaurant.save();
        } else {
            return res.status(200).json({success:true,data:"Table not found"});
        }

        res.status(200).json({success:true,data:reserve});

        
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create Reserve"});
    }
}

exports.updateReserve=async (req,res,next)=>{
    try{
        let reserve= await Reserve.findById(req.params.id);

        if(!reserve){
            return res.status(404).json({success:false,message:`No reserve with the id of ${req.params.id}`});
        }
        if(reserve.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this reserve`})
        }
        reserve = await Reserve.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators : true
        });

        res.status(200).json({
            success:true,
            data:reserve
        });
        
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Reserve"});
    }
}

exports.deleteReserve=async (req,res,next)=>{
    try{
        const reserve= await Reserve.findById(req.params.id);
        if(!reserve){
            return res.status(404).json({success:false,message:`No reserve with the id of ${req.params.id}`});
        }
        const restaurant = await Restaurant.findById(reserve.restaurant);
        
        if(reserve.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this bootcamp`})
        }

        
        await restaurant.save();
        await reserve.deleteOne();

        res.status(200).json({
            success:true,
            data: {}
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Reserve"});
    }
}

exports.deleteAllReserve = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const reservesToDelete = await Reserve.find({ user: req.user.id });
        const deleteResult = await Reserve.deleteMany({ user: userId });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ success: false, message: `No reserves found for user with ID ${userId}` });
        }
        

        for (const reserve of reservesToDelete) {
            const restaurant = await Restaurant.findById(reserve.restaurant);
            if (restaurant) {
                restaurant.table.push(reserve.table);
                await restaurant.save();
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${deleteResult.deletedCount} reserves for user with ID ${userId}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot delete reserves" });
    }
}