const mongoose=require("mongoose")
mongoose.set('strictQuery', false);
mongoose.set('strictQuery', true);

mongoose.connect("<CONNECTION STRING>")
.then(()=>{
    console.log('Connection to Mongoose established');
})
.catch((e)=>{
    console.log('Connection to Mongoose failed');
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
