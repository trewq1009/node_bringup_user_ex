import express from "express";
import user from "../controllers/UserController";
import { param, query, body, validationResult, header } from "express-validator"
import jwt from "jsonwebtoken";


const router = express.Router();

router.use(["/yt/*"],
    [
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

router.get("/yt/my-topic",
    [
        query('index')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.my_topic_list(req, res);
    });
router.get("/yt/my-topic-comment",
    [
        query('index')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.my_topic_comment_list(req, res);
    });
router.get("/yt/my-score",
    [
        query('index')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.my_score_list(req, res);
    });


router.put("/yt/nickname",
    [
        body('nickname')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.nickname_update(req, res);
    });
router.put("/yt/topic-nickname",
    [
        body('topic_nickname')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.topic_nickname_update(req, res);
    });
router.put("/yt/profile",
    [
        body('_id')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.profile_update(req, res);
    });

router.put("/yt/greeting",
    [
        body('greeting')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.greeting_update(req, res);
    });

router.get("/yt/follower",
    [
        query('index')
            .notEmpty()
        ,
        // query('listLength')
        //     .notEmpty()
        // ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.follower_list(req, res);
    });
router.get("/yt/following",
    [
        query('index')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.following_list(req, res);
    });

router.get("/yt/ban",
    [
        query('index')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.ban_list(req, res);
    });

router.get("/yt/feed-list/:user_id",
    [
        param('user_id')
            .notEmpty()
        ,
        query('index')
            .notEmpty()
        ,
        // query('listLength')
        //     .notEmpty()
        // ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.feed_list(req, res);
    });

router.get("/yt/feed-info/:user_id",
    [
        param('user_id')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.feed_info(req, res);
    });

router.put("/yt/follow",
    [
        body('user_id')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.follow(req, res);
    });
router.put("/yt/ban",
    [
        body('user_id')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.ban(req, res);
    });
router.put("/yt/rep",
    [
        body('array_no')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.children_rep(req, res);
    });

router.put("/yt/open",
    [
        body('array_no')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.children_open(req, res);
    });


router.put("/yt/location",
    [
        body('sido_no')
            .notEmpty()
        ,
        body('sido_value')
            .notEmpty()
        ,
        body('sigungu_no')
            .notEmpty()
        ,
        body('sigungu_value')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.location(req, res);
    });


router.post("/yt/bring-up",
    [
        // body('sido_no')
        //     .notEmpty()
        // ,
        // body('sido_value')
        //     .notEmpty()
        // ,
        // body('sigungu_no')
        //     .notEmpty()
        // ,
        // body('sigungu_value')
        //     .notEmpty()
        // ,
        // body('relationship')
        //     .notEmpty()
        // ,
        // body('children_gender')
        //     .notEmpty()
        // ,
        // body('children_name')
        //     .notEmpty()
        // ,
        // body('children_birthday')
        //     .notEmpty()
        // ,
        // body('children_image_id')
        //     .notEmpty()
        // ,
        // body('children_image_web_path')
        //     .notEmpty()
        // ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.bring_up_register(req, res);
    });

router.get("/yt/bring-up",
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.bring_up_get(req, res);
    });

router.put("/yt/bring-up",
    [
        body('array_no')
            .notEmpty()
        ,
        // body('sido_no')
        //     .notEmpty()
        // ,
        // body('sido_value')
        //     .notEmpty()
        // ,
        // body('sigungu_no')
        //     .notEmpty()
        // ,
        // body('sigungu_value')
        //     .notEmpty()
        // ,
        body('relationship')
            .notEmpty()
        ,
        body('children_name')
            .notEmpty()
        ,
        body('children_birthday')
            .notEmpty()
        ,
        body('children_image_id')
            .notEmpty()
        ,
        body('children_image_web_path')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.bring_up_update(req, res);
    });

router.delete("/yt/bring-up",
    [
        body('array_no')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.bring_up_delete(req, res);
    });

router.post("/sign",
    [
        body('type')
            .notEmpty()
        ,
        body('id')
            .notEmpty()
        ,

        body('password')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.sign(req, res);
    });
router.post("/social/sign-up",
    [
        body('social_key')
            .notEmpty()
        ,
        body('social_value')
            .notEmpty()
        ,

        body('nickname')
            .notEmpty()
        ,
        body('imp_uid')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.social_signUp(req, res);
    });
router.post("/social/sign-in",
    [
        body('social_key')
            .notEmpty()
        ,
        body('social_value')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.social_signIn(req, res);
    });

router.get("/search/:nickname",
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.search(req, res);
    });
router.put("/yt/locker",
    [
        body('target_id')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.locker(req, res);
    });

router.get("/yt/locker",
    [
        query('index')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.locker_list(req, res);
    });
router.post("/find/id",
    [
        body('imp_uid')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.id_find(req, res);
    });
router.post("/find/password",
    [
        body('imp_uid')
            .notEmpty()
        ,
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.password_find(req, res);
    });
router.post("/edit/password",
    [
        body('password')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            user.password_edit(req, res);
    });


// router.post("/signIn",
//     [
//         body('id')
//             .notEmpty()
//         ,
//         body('password')
//             .notEmpty()
//         ,
//     ],
//     (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty())
//             return res.status(400).json({ success: false, errors: errors.array() });
//         else
//             user.signIn(req, res);
//     });

// router.get("/nickname/check/:nickname")



/////////////////

router.get("/test", user.test)

router.put("/withdraw", user.withdraw)

router.get("/push", user.pushList)



router.post("/refresh", user.refresh);

router.get("/detail", user.detail);

router.get("/yt/push/state", user.push_state)

router.put("/yt/push/state", user.push_state_update)

router.put("/ban", user.ban);

// router.post("/signUp", user.register);




router.get("/list", user.list);

router.get("/auth", user.auth);

router.delete("/delete/:id", user.delete);


router.post("/edit/:id", user.search);



module.exports = router;
