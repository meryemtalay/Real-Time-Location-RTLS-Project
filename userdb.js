const mongoose =require("mongoose");
const connect=mongoose.connect("mongodb+srv://meryemtalay:12341234@cluster0.wuao5qz.mongodb.net/");

connect.then(()=> {
    console.log("Database connected succesfully");
})
.catch(()=> {
    console.log("Database cannot be connected");
});

const LoginSchema= new mongoose.Schema({ 
    username: { 
        type: String,
        required: true
    },
    // surname: { 
    //     type: String,
    //     required: true
    // },
    // email: { 
    //     type: String,
    //     required: true
    // },
    password: {
        type: String,
        required: true
    }

});

const collection= new mongoose.model("users",LoginSchema);

module.exports=collection;