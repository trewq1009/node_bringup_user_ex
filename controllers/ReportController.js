import Etc from "../models/Etc";
import Bringup from "../models/Bringup"
import Topic from "../models/Topic"
import File from "../models/File";

import { getCurrentDate, dateMoment } from "../utils/utilsFunction";
let reportController = {};



reportController.report = (req, res) => {
    const report_id = req.body.report_id
    const user_id = req.decoded._id
    const type = req.params.type
    const target_id = req.body.target_id
    const report_obj = {
        user_id: user_id,
        report_id: report_id
    }


    if (type == "bringup" || type == "topic") {
        let target_model
        if (type == "bringup")
            target_model = Bringup
        else if (type == "topic")
            target_model = Topic
        target_model.findOne({ _id: target_id, "report_user.user_id": user_id }, (err, data) => {
            if (err) return res.json({ success: false, err });
            let update_obj
            let message
            let usage_user
            let usage_obj = {
                user_id: user_id,
                target_id: target_id,
                type: type

            }
            if (data == undefined) {
                update_obj = {
                    $push: { report_user: report_obj },
                    $inc: { report_count: 1 }
                }
                message = "신고 완료"
                usage_user = {
                    $inc: { "value_history.$[elem].usage_count": 1 },
                    $push: { "value_history.$[elem].usage_user": usage_obj }
                }
            } else {
                update_obj = {
                    $pull: { report_user: { user_id: user_id } },
                    $inc: { report_count: -1 }
                }
                message = "신고 취소"
                usage_user = {
                    $inc: { "value_history.$[elem].usage_count": -1 },
                    $pull: { "value_history.$[elem].usage_user": { user_id: user_id } }
                }

            }
            //사용량
            report_etc_count(report_id, usage_user)

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
    } else if (type == "bringup-comment" || type == "topic-comment") {
        let target_model
        if (type == "bringup-comment")
            target_model = Bringup
        else if (type == "topic-comment")
            target_model = Topic

        target_model.findOne({ _id: target_id }, (err, data) => {
            if (err) return res.json({ success: false, err });
            if (!data) return res.json({ success: false, message: "게시글이 존재하지 않습니다" });
            else {
                if (!req.body.comment_id) return res.json({
                    success: false, "errors": [
                        {
                            "msg": "Invalid value",
                            "param": "comment_id",
                            "location": "body"
                        }
                    ]
                })
                let usage_user
                let usage_obj = {
                    user_id: user_id,
                    target_id: target_id,
                    type: type
                }
                const comment_id = req.body.comment_id

                const comment_array = JSON.parse(JSON.stringify(data.comment_array))
                let update_condition = {}
                let message = ""
                comment_array.find((item) => {
                    if (item._id == comment_id) {
                        let res = item.report_user.filter(it => it.user_id.includes(user_id.toString()));
                        if (res.length === 0) {
                            message = "신고 완료"
                            update_condition = {
                                $inc: { "comment_array.$[elem].report_count": 1 },
                                $push: { "comment_array.$[elem].report_user": report_obj }
                            }
                            usage_user = {
                                $inc: { "value_history.$[elem].usage_count": 1 },
                                $push: { "value_history.$[elem].usage_user": usage_obj }
                            }

                        } else {
                            message = "신고 취소"
                            update_condition = {
                                $inc: { "comment_array.$[elem].report_count": -1 },
                                $pull: { "comment_array.$[elem].report_user": { user_id: user_id } }
                            }
                            usage_user = {
                                $inc: { "value_history.$[elem].usage_count": -1 },
                                $pull: { "value_history.$[elem].usage_user": usage_obj }
                            }
                        }


                    }
                });

                report_etc_count(report_id, usage_user)

                target_model.findOneAndUpdate(
                    {},
                    update_condition,
                    { arrayFilters: [{ "elem._id": comment_id }] },
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
            }
        })
    } else {
        return res.json({ success: false, message: "TypeError" });
    }
}
const report_etc_count = (report_id, usage_user) => {
    Etc.findOneAndUpdate(
        { key: "report" },
        usage_user,
        { arrayFilters: [{ "elem._id": report_id }] },
        (err, result) => {
            // console.log(result)
        }

    )
}


module.exports = reportController;
