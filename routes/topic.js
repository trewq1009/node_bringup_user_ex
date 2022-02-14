import express from "express";
import topic from "../controllers/TopicController";
import { query, body, header, validationResult } from "express-validator"
import { jwt_verify } from "../utils/utilsFunction";
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

router.put("/yt/my-topic", [
    body('topic_id')
        .notEmpty()
    ,
],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            topic.add_topic(req, res);
    });

router.get("/yt/list", topic.list);

router.get("/yt/all", topic.all);

router.post("/yt/content",
    [
        body('topic_id')
            .notEmpty()
        ,
        body('topic_name')
            .notEmpty()
        ,
        body('title')
            .notEmpty()
        ,
        body('content')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            topic.content_insert(req, res);
    });
router.get("/yt/certain/:topic_id",
    [
        query('index')
            .notEmpty()
        ,
        query('listLength')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            topic.content_list(req, res);
    });

router.get("/yt/home",
    [

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            topic.home(req, res);
    });
/////////////////





module.exports = router;
