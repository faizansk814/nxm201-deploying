const mongoose=require('mongoose')

const blogsSchema=mongoose.Schema({
    title:String,
    sub:String,
    body:String,
    useremail:String
})

const BlogsModel=mongoose.model("blog",blogsSchema)
module.exports=BlogsModel