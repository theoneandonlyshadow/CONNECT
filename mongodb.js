const mongoose=require("mongoose")
mongoose.set('strictQuery', false);
mongoose.set('strictQuery', true);

mongoose.connect("<CONNECTION STRING>")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const LogInCollection = new mongoose.model('pixelwand',logInSchema)

module.exports = LogInCollection
