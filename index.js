const express=require('express')
require('dotenv').config()
const connection=require('./connection/db')
const userrouter = require('./routes/user.router')
const cookieparser=require('cookie-parser')
const blogsrouter = require('./routes/blogs.router')
const app=express()
app.use(express.json())
app.use(cookieparser())

app.use("/user",userrouter)
app.use("/blog",blogsrouter)
app.listen(process.env.port,async()=>{
    await connection
    console.log("connected")
})