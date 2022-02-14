import express from "express";
import original from "../controllers/OriginalController";
import { query, body, header, param, validationResult } from "express-validator"
import jwt from "jsonwebtoken";

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

router.get("/yt/content",
    [
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            original.content(req, res);
    });
router.get("/yt/content-more",
    [
        query('index')
            .notEmpty()
        ,
        query('listLength')
            .notEmpty()
        ,

    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            original.content_more(req, res);
    });




module.exports = router;
