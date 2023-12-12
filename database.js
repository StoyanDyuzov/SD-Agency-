const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb+srv://stoyandyuzov:lNhVsKK1FvqXGiVm@villastore.ouvu93y.mongodb.net/?retryWrites=true&w=majority");
connect.then(()=>{
    console.log("Database connected successfully")
})
.catch(()=>{
    console.log("Database can not be connected")
})
const SignupSchema =  new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    scheduled_list:{
        type:[String],
        required: true
    }
})


const collection_signup =new mongoose.model("users",SignupSchema)


module.exports = collection_signup