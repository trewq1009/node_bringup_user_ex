import express from "express";
import { header, cookie, body, validationResult } from "express-validator"


import content from "../controllers/ContentController";


const router = express.Router();

//temp

// router.post("/", content.add1)

router.get("/",
    [
        header('Authorization')
            .isJWT().withMessage('너네 토큰 미국가셧쒀!').bail()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            content.list1(req, res);
    });

router.get("/:content_id",
    [
        header('Authorization')
            .isJWT().withMessage('너네 토큰 미국가셧쒀!').bail()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            content.detail1(req, res);
    });


router.post("/",
    [
        header('Authorization')
            .isJWT().withMessage('너네 토큰 미국가셧쒀!').bail()
        ,
        body('content')

            .notEmpty()
            .withMessage('너네 컨텐츠 미국가셧쒀!')
            .bail()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            content.add1(req, res);
    });

router.put("/",
    [
        header('Authorization')
            .isJWT().withMessage('너네 토큰 미국가셧쒀!').bail()
        ,
        body('_id')
            .notEmpty()
            .withMessage('너네 id 미국가셧쒀!')
            .bail()
        ,
        body('content')

            .notEmpty()
            .withMessage('너네 컨텐츠 미국가셧쒀!')
            .bail()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            content.update1(req, res);
    });
router.delete("/",
    [
        header('Authorization')
            .isJWT().withMessage('너네 토큰 미국가셧쒀!').bail()
        ,
        body('_id')
            .notEmpty()
            .withMessage('너네 id 미국가셧쒀!')
            .bail()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            content.delete1(req, res);
    });



//tempEND

router.get("/test", content.test)

router.post("/register",
    cookie('x_auth').notEmpty(),
    body('web_path').isString(),
    body('content').isString(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        else
            content.register(req, res);
    });

//url 길이제한으로 post 사용
router.post("/random", content.random)

router.get("/hashtag", content.hashtag)

router.put("/like", content.like)

router.put("/report", content.report)

router.get("/my-content", content.myContent)

router.get("/my-like", content.myLike)

router.get("/detail/:content_id", content.detail)


router.get("/list", content.list);

router.post("/perList", content.perList);

router.post("/totalPage", content.totalPage);

router.get("/detail/:content_id", content.detail);

router.put("/delete/:content_id", content.delete);

router.put("/edit/:content_id", content.edit);

module.exports = router;
