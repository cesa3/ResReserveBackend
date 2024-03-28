const User = require('../models/User');

exports.register = async(req,res,next) => {
    try{
        const {name,email,password,role,tel,isGoogleAccount}=req.body;
        const user=await User.create({
            name,
            email,
            password,
            role,
            tel,
            isGoogleAccount,
        });
        // const token=user.getSignedJwtToken();
        // res.status(200).json({success:true , token});
        sendTokenResponse(user,200,res);
    }catch(err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
}

exports.login=async (req,res,next) => {
try{
    // console.log(req)
    const {email,password,provider} = req.body;
    console.log(email,password,provider)
    if(provider) {
        if(req.body.provider === 'google') {
            const user = await User.findOne({email: email})
            if(!user) {
                return res.status(400).json({success:false,msg:'Invalid credentials'});
            }
            if(user) {
                sendTokenResponse(user,200,res);
            }
        }
    }
    if(!email || !password){
        
        return res.status(400).json({success:false,msg:'Please provide an email and password'});
    }

    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({sucess:false,msg:'Invalid credentials'});
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(401).json({success:false,msg:'Invalid credentials'});
    }

    // const token=user.getSignedJwtToken();
    // res.status(200).json({success:true,token});
    sendTokenResponse(user,200,res);
    // if (user) {
    //     sendTokenResponse(user, 200, res);
    //     return; // Add this line to stop further execution
    // }
}catch(err){
    return res.status(401).json({success:false,msg:"Cannot convert email or password to string"});
}
};

const sendTokenResponse=(user,statusCode,res) => {
    const token=user.getSignedJwtToken();
    // console.log(token);

    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV==='production'){
        options.secure=true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isGoogleAccount: user.isGoogleAccount,
        token
    })
}
exports.getMe= async(req,res,next) => {
    console.log(req.body)
    if(req.body && req.body.id) {
        const user = await User.findById(req.body.id)
        if(user) {
            return sendTokenResponse(user,200,res)
        } else {
            return res.status(400).json({success:false,msg:'Cannot find user'})
        }
    }
    
    const user= await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    })
}

exports.logout=async(req,res,next)=>{
    res.cookie('token','none',{
        expires:new Date(Date.now() + 10*1000),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        data:{}
    })
}
