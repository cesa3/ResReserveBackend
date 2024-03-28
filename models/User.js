const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a name']
    },
    email:{
        type:String,
        required:[true,'Please add an email'],
        unique:true,
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'Please add a valid email'
        ]
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type:String,
        minlength:6,
        select: false
    },
    tel:{
        type: String,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createAt:{
        type:Date,
        default:Date.now
    },
    isGoogleAccount: {
        type:Boolean,
        default:false
    }

});

UserSchema.pre('save', async function (next) {
    if (!this.isGoogleAccount) {
        // this.isGoogleAccount = true;
        console.log("Password:", this.password); 
        console.log("Email:", this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } else if (this.isGoogleAccount) {
        console.log("Password: eiei", this.password);
        console.log("Email: eiei", this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.email, salt);
    }
    next();
});

UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

module.exports = mongoose.model('User',UserSchema);