const checkHr = (req, res, next)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Authentication required"
        });
    }
    if(req.user.role !== "hr"){
        return res.status(403).json({
            message:"Access denied. Hr only"
        });
    }
    next();
}
module.exports = checkHr;