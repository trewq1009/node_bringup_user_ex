import express from "express";
import comment from "../controllers/CommentController";
import { body, query, header, validationResult } from "express-validator"
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
//comment

router.put("/yt/:type",
    [
        body('comment')
            .notEmpty(),
        body('target_id')
            .notEmpty(),
        body('depth')
            .notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            comment.comment_insert(req, res);
    });

router.get("/yt/:type/",
    [

        query('target_id')
            .notEmpty(),
        query('index')
            .notEmpty(),
        query('listLength')
            .notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            comment.comment_list(req, res);
    });

/////////////////////////


router.post("/register", comment.register);

// router.put("/reply", comment.reply)

router.get("/perList", comment.perList);

router.put("/report", comment.commentReport)

// router.put("/reply/report", comment.replyReport)

// router.put("/reply/delete", comment.replyDelete)

router.get("/my-comment", comment.myComment)

router.get("/detail/:comment_id", comment.detail)

router.put("/edit/:comment_id", comment.edit);

router.put("/delete/:comment_id", comment.delete);



// router.get("/list", comment.list);

router.get("/totalPage", comment.totalPage);


module.exports = router;
