//database connecting
const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
//use connect() for all files
module.exports.connect=function(done){
    const url='mongodb://localhost:27017'
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