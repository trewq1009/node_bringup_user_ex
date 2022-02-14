import express from "express";
import state from "../controllers/StateController";
import { header, body, validationResult } from "express-validator"


const router = express.Router();

router.get("/serverState", state.server);
router.post("/tokenState",
    [
        header('Authorization').notEmpty().isJWT()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            state.token(req, res);
    });



module.exports = router;
