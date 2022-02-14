import express from "express";
import hashtag from "../controllers/HashtagController";
import { query, body, header, validationResult } from "express-validator"
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

router.get("/popular",
    [
        // query('index')
        //     .notEmpty()
        // ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.popular_list(req, res);
    });
router.get("/hot-item",
    [
        // query('index')
        //     .notEmpty()
        // ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.hot_item(req, res);
    });
router.post("/yt/review",
    [
        body('tag_id')
            .notEmpty()
        ,
        body('score')
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
            hashtag.review_add(req, res);
    });
router.get("/yt/item/:tag_id",
    [
        // query('index')
        //     .notEmpty()
        // ,
        // query('listLength')
        //     .notEmpty()
        // ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.item(req, res);
    });

router.get("/yt/review/:tag_id",
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
            hashtag.review_list(req, res);
    });
router.get("/recommend",
    [
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.recommend(req, res);
    });
router.get("/yt/search",
    [
        query('search')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.search(req, res);
    })
router.get("/yt/bringup-search",
    [
        query('search')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.bringup_search(req, res);
    })
router.get("/yt/topic-search",
    [
        query('search')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            hashtag.topic_search(req, res);
    })
/////////////////
router.get("/", hashtag.test);





module.exports = router;
