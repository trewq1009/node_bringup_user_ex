import Etc from "../models/Etc";
import Bringup from "../models/Bringup"
import Topic from "../models/Topic"
import File from "../models/File";

import { getCurrentDate, dateMoment } from "../utils/utilsFunction";
let viewController = {};



viewController.view = (req, res) => {
    const user_id = req.decoded._id
    const type = req.params.type
    const target_id = req.body.target_id
    const view_obj = {
        user_id: user_id,
    }

    let target_model
    if (type == "bringup") {
        target_model = Bringup
    } else if (type == "topic") {
        target_model = Topic
    } else if (0) {
        console.log("0")
    } else {
        console.log("1")
    }
    target_model.findOne({ _id: target_id }, (err, data) => {
        if (err) return res.json({ success: false, err });
        let update_obj
        let message

        if (!data) return res.json({ success: false, message: "NoResult" });
        update_obj = {
            $push: { view_list: view_obj },
            $inc: { view_count: 1 }
        }
        message = "조회수 증가"


        target_model.findOneAndUpdate(
            { _id: target_id },
            update_obj,
            (err, data) => {
                if (err) res.json({ succees: false, message: "실패", data: err })
                if (!data) res.json({ succees: false, message: "실패" })
                return res.status(200).json({
                    success: true,
                    message: message,
                    data: null,
                });
            }
        )

    })
}



module.exports = viewController;
