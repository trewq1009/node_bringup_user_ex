import User from "../models/User";
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";

let stateController = {};

stateController.server = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "ALIVE",
        data: null,
    })
}

stateController.token = (req, res) => {
    let token = req.headers.authorization
    User.findByToken(token).then((user) => {
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "DEAD",
                data: null,
            })
        } else {
            User.findOneAndUpdate(
                { _id: user._id },
                {
                    $set:
                    {
                        fcm_token: req.body.fcm_token,
                        os: req.body.os,
                        version: req.body.version,
                    }
                },
                { new: true },
                (err, data) => {

                }
                // console.log(data)
            )
            return res.status(200).json({
                success: true,
                message: "ALIVE",
                data: null,
                // data: { version: results.value },
            })
        }
    })
};



module.exports = stateController;
