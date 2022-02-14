import Etc from "../models/Etc";
import Bringup from "../models/Bringup"
import Topic from "../models/Topic"
import File from "../models/File";
import { ObjectId } from "mongodb";

import moment from 'moment';
import { getCurrentDate, dateMoment } from "../utils/utilsFunction";
let likeController = {};



likeController.like = (req, res) => {
    const user_id = req.decoded._id
    const type = req.params.type
    const target_id = req.body.target_id

    // let time = new Date(moment().subtract(0, "months").format("YYYY-MM"));
    // let hex_time = Math.floor(time/1000).toString(16);
    // let test = ObjectId(hex_time + "0000000000000000");
    
    const like_obj = {
        user_id: user_id
    }
    if (type == "bringup" || type == "topic") {
        let target_model
        if (type == "bringup")
            target_model = Bringup
        else if (type == "topic")
            target_model = Topic
        target_model.findOne({ _id: target_id, "like_user.user_id": user_id }, (err, data) => {
            console.log(data)
            if (err) return res.json({ success: false, err });
            if (data == undefined) { //좋아요

                target_model.findOneAndUpdate(
                    { _id: target_id },
                    {
                        $push: { like_user: like_obj },
                        $inc: { like_count: 1 }
                    },
                    (err, data) => {
                        if (err) return res.json({ succees: false, message: "실패", data: err })
                        if (!data) return res.json({ succees: false, message: "실패" })
                        return res.status(200).json({
                            success: true,
                            message: '좋아요 완료',
                            data: null,
                        });
                    }
                )
            } else {
                // console.log(data)
                target_model.findOneAndUpdate(
                    { "like_user.user_id": user_id },
                    {
                        $pull: { "like_user": { user_id: user_id } },
                        $inc: { like_count: -1 }
                    },
                    { new: true, upsert: true },
                    (err, data) => {
                        if (err) res.json({ succees: false, message: "실패", data: err })
                        if (!data) res.json({ succees: false, message: "실패" })
                        res.json({ success: true, message: "좋아요 취소", data: null })
                    }
                )
            }

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
                const comment_id = req.body.comment_id
                //좋아요
                const comment_array = JSON.parse(JSON.stringify(data.comment_array))

                let update_condition = {}
                let message = ""
                comment_array.find((item) => {
                    if (item._id == comment_id) {
                        let res = item.like_user.filter(it => it.user_id.includes(user_id.toString()));
                        if (res.length === 0) {
                            message = "좋아요 완료"
                            update_condition = {
                                $inc: { "comment_array.$[elem].like_count": 1 },
                                $push: { "comment_array.$[elem].like_user": like_obj }
                            }

                        } else {
                            message = "좋아요 취소"
                            update_condition = {
                                $inc: { "comment_array.$[elem].like_count": -1 },
                                $pull: { "comment_array.$[elem].like_user": like_obj }
                            }
                        }


                    }
                });
                // console.log(update_condition)

                target_model.findOneAndUpdate(
                    { _id: target_id },
                    update_condition,
                    { arrayFilters: [{ "elem._id": comment_id }] },
                    (err, data) => {
                        console.log(data)
                        if (err) return res.json({ succees: false, message: "실패", data: err })
                        if (!data) return res.json({ succees: false, message: "실패" })
                        return res.status(200).json({
                            success: true,
                            message: message,
                            data: null,
                        });
                    }
                )
            }
        })
    } else if (0) {
        console.log("0")
    } else {
        console.log("1")
    }
}



module.exports = likeController;
