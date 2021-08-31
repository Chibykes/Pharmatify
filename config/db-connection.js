const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log(`Database connected`);
    } catch(err){
        console.error(`Error: ${err}`);
        process.exit(1);
    }
}

module.exports = connectDB;