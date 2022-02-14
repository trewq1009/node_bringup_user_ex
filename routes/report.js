import express from "express";
import report from "../controllers/ReportController";
import { body, header, param, validationResult } from "express-validator"
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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

router.put("/yt/:type",
    [
        body('report_id')
            .notEmpty()
        ,
        body('target_id')
            .notEmpty()
        ,
    ], (req, res) => {
        // if (!ObjectId.isValid(req.body.report_id)) console.log("zzzzzzz")
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            report.report(req, res);
    });




module.exports = router;
