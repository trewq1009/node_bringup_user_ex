import Etc from "../models/Etc";
import Original from "../models/Original"
import User from "../models/User";

import { registered } from "../utils/utilsFunction";
let originalController = {};



originalController.content = (req, res) => {
    const user_id = req.decoded._id

    User.findOne({ _id: user_id }).lean().then(user => {
        // console.log(user.user_group)
        Original.find(
            {
                user_group: {
                    $in: [user.user_group, "ALL"]
                }
            },
            {},
            { sort: { _id: -1 } },
            (err, content) => {
                if (err) return res.json({ success: false, message: err })
                if (content.length == 0) return res.json({ success: false, message: "NoResult" })
                else
                    return res.status(200).json({
                        success: true,
                        data: content,
                    });
            }

        ).lean()
    })


}
originalController.content_more = (req, res) => {
    const user_id = req.decoded._id
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);

    User.findOne({ _id: user_id }).lean().then(user => {
        // console.log(user.user_group)
        Original.find(
            {
                user_group: {
                    $in: [user.user_group, "ALL"]
                }
            },
            {},
            { sort: { _id: -1 }, limit: listLength, skip: (index - 1) * listLength },
            (err, content) => {
                if (err) return res.json({ success: false, message: err })
                if (content.length == 0) return res.json({ success: false, message: "NoResult" })
                else {
                    content.forEach(element => {
                        element.registered = registered(element._id)
                    });
                    return res.status(200).json({
                        success: true,
                        data: content,
                    });
                }
            }

        ).lean()
    })


}



module.exports = originalController;
