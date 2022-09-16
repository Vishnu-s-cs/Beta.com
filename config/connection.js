//database connecting
const mongoClient=require('mongodb').MongoClient
const dotenv = require("dotenv");
require('dotenv').config()
const state={
    db:null
}
//use connect() for all files
module.exports.connect=function(done){
    const url= process.env.MONGO_URL
    const dbname='Beta'
    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}
module.exports.get=function(){
    return state.db
}