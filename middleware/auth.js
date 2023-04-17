const { model } = require("mongoose")
const BlacklistModel = require("../model/blacklist.model")
const jwt = require('jsonwebtoken')
const auth = async (req, res, next) => {
    const token = req.cookies.accesstoken
    if (token) {
        const isBlacklisted = await BlacklistModel.findOne({ token })
        if (isBlacklisted) {
            return res.status(401).send({ msg: "Login again" })
        }
        jwt.verify(token, "marvel", async function (err, decoded) {
            if (err) {
                if (err.message === "jwt expired") {
                    const refreshtoken = req.cookies.refreshtoken
                    if (refreshtoken) {
                        const isblacklistedrefresh = await BlacklistModel.findOne({ token: refreshtoken })
                        if (isblacklistedrefresh) {
                            return res.status(401).send({ msg: "Login again" })
                        }
                        jwt.verify(refreshtoken, "dc", function (err, decoded) {
                            if (decoded) {
                                const newaccestoken = jwt.sign({ useremail: decoded.useremail, role: decoded.role }, "marvel", { expiresIn: "1m" })
                                res.cookie("accesstoken", newaccestoken, {
                                    maxAge: 1000 * 60 * 10
                                })
                                console.log("access",newaccestoken)
                                req.role = decoded.role
                                req.body.useremail = decoded.useremail
                                next()
                            } else {
                                return res.status(401).send({ msg: "login again plzz" })
                            }
                        })
                    } else {
                        return res.status(401).send({ msg: "Login againcccc" })
                    }
                }
            } else {
                req.role = decoded.role
                req.body.useremail = decoded.useremail
                next()
            }
        })
    } else {
        res.status(401).send({ msg: "Login first" })
    }
}

module.exports=auth