function permitted(arr){
    return (req,res,next)=>{
        if(arr.includes(req.role)){
            next()
        }else{
            return res.status(401).send({msg:"You are not authorized"})
        }
    }
}

module.exports=permitted