const express=require('express')
const auth = require('../middleware/auth')
const BlogsModel = require('../model/blogs.model')
const jwt=require("jsonwebtoken")
const permitted = require('../middleware/rbac')
const blogsrouter=express.Router()


blogsrouter.get("/",auth,async (req,res)=>{
    const token=req.cookies.accesstoken
    const decoded=jwt.verify(token,"marvel")
    const blogs=await BlogsModel.find({useremail:decoded.useremail})
    res.status(200).send(blogs)
})

blogsrouter.post("/post",auth,async (req,res)=>{
   try {
    const newblog=new BlogsModel(req.body)
    await newblog.save()
    res.status(200).send(newblog)
   } catch (error) {
    res.status(401).send({msg:error.message})
   }
})

blogsrouter.patch("/patch/:id",auth,async (req,res)=>{
    const {id}=req.params
    const payload=req.body
    const token=req.cookies.accesstoken
    const decoded=jwt.verify(token,"marvel")
    try {
        const userblog=await BlogsModel.findById({_id:id})
        if(userblog.useremail!=decoded.useremail){
            return res.status(401).send({msg:"You are not authorized"})
        }
        const updatedblog=await BlogsModel.findByIdAndUpdate({_id:id},payload)
        res.status(200).send(updatedblog)
    } catch (error) {
        res.status(401).send({msg:error.message})
    }
})

blogsrouter.delete("/delete/:id",auth,async (req,res)=>{
    const {id}=req.params
    const token=req.cookies.accesstoken
    const decoded=jwt.verify(token,"marvel")
    try {
        const userblog=await BlogsModel.findById({_id:id})
        if(userblog.useremail!=decoded.useremail){
            return res.status(401).send({msg:"You are not authorized"})
        }
        const updatedblog=await BlogsModel.findByIdAndDelete({_id:id})
        res.status(200).send({msg:"BLog deleted"})
    } catch (error) {
        res.status(401).send({msg:error.message})
    }
})
blogsrouter.delete("/deleteModerator/:id",auth,permitted(["Moderator"]),async (req,res)=>{
    const {id}=req.params
    try {
        const deletedblog=await BlogsModel.findByIdAndDelete({_id:id})
        res.status(200).send({msg:"BLog deleted"})
    } catch (error) {
        res.status(401).send({msg:error.message})
    }
})
module.exports=blogsrouter