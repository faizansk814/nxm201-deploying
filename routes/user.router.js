const express = require('express')

const userrouter = express.Router()
const bcrypt = require('bcrypt')
const UserModel = require('../model/user.model')
const jwt = require('jsonwebtoken')
const BlacklistModel = require('../model/blacklist.model')

userrouter.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (user) {
            return res.status(200).send({ msg: "Already a user login" })
        }
        bcrypt.hash(password, 5, async function (err, hash) {
            const newuser = new UserModel({ name, email, password: hash, role })
            await newuser.save()
            res.status(200).send({ msg: "Registration succesful", user: newuser })
        });
    } catch (error) {
        res.status(401).send({ msg: error.message })
    }
})

userrouter.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (user) {
            bcrypt.compare(password, user.password, function (err, result) {
                if (result) {
                    const accesstoken = jwt.sign({ useremail: user.email, role: user.role }, "marvel", { expiresIn: "1m" })
                    const refreshtoken = jwt.sign({ useremail: user.email, role: user.role }, "dc", { expiresIn: "5m" })
                    res.cookie("accesstoken", accesstoken, {
                        maxAge: 1000 * 60 * 10
                    })
                    res.cookie("refreshtoken", refreshtoken, {
                        maxAge: 1000 * 60 * 20
                    })
                    res.status(200).send({ msg: "login succesful", accesstoken, refreshtoken })
                } else {
                    res.status(401).send({ msg: "wrong credintials" })
                }
            });
        } else {
            res.status(404).send({ msg: "Login First" })
        }
    } catch (error) {
        res.status(401).send({ msg: error.message })
    }
})

userrouter.get("/logout", async (req, res) => {
    const accesstoken = req.cookies.accesstoken
    const refreshtoken = req.cookies.refreshtoken
    const blacklistedaccesstoken = new BlacklistModel({ token: accesstoken })
    const blacklistedrefreshtoken = new BlacklistModel({ token: refreshtoken })
    await blacklistedaccesstoken.save()
    await blacklistedrefreshtoken.save()
    res.send({ msg: "logout successful" })
})

module.exports = userrouter