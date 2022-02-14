import express from "express";
import etc from "../controllers/EtcController";
import { body, header, param, validationResult } from "express-validator"
import jwt from "jsonwebtoken";


// import axios from "axios";
// import cheerio from "cheerio"
// const log = console.log;




const router = express.Router();

router.use("/yt/*", [
    header('Authorization').notEmpty().isJWT(),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    else {
        const request_token = req.headers.authorization;
        const decoded = jwt.verify(request_token, process.env.TOKEN_KEY);
        if (decoded) {
            req.decoded = decoded
            next();
        }
        else
            res.json({ isAuth: false, success: false })
    }
});


router.post("/register", etc.register)

router.get("/report", etc.report)

router.get("/term", etc.term)

router.get("/area", etc.area)

router.get("/app-status", etc.appStatus)

router.get("/news", etc.news_list)

router.post("/push-test", etc.push_test)

module.exports = router;
