import express from "express";
import bringup from "../controllers/BringupController";
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

//r-neighbor

router.get("/yt/r-neighbor",
    [
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            bringup.r_neighbor(req, res);
    });

//life
router.get("/yt/life",
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
            bringup.life_list(req, res);
    });

router.post("/yt/life",
    [
        body('content')
            .notEmpty()
        ,
        body('file_array')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            bringup.life_insert(req, res);
    });

router.put("/yt/life",
    [
        body('_id')
            .notEmpty()
        ,
        body('content')
            .notEmpty()
        ,
        body('file_array')
            .notEmpty()
        ,

    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            bringup.life_update(req, res);
    });

router.delete("/yt/life",
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
            bringup.life_delete(req, res);
    });



/////////////////





module.exports = router;
