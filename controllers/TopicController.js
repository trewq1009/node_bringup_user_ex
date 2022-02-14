
import request from 'request';
import dotenv from 'dotenv'
dotenv.config()

import Topic from "../models/Topic";
import Etc from "../models/Etc";
import User from "../models/User";
import Hashtag from "../models/Hashtag"
import Content from "../models/Content";
import Comment from "../models/Comment";
import { post } from "../utils/curl";
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";
import { jwt_verify } from "../utils/utilsFunction"
let topicController = {};

topicController.home = (req, res) => {
    const user_id = req.decoded._id
    User.findOne(
        { _id: user_id },
        ["my_topic", "-_id"],
        (err, user) => {
            if (err) return res.json({ success: false, message: err })
        }
    ).lean().then(user => {
        Etc.findOne(
            { key: "topic" },
        ).lean().then(async topicList => {
            const topic_sort = topicList.value_topic.sort(function (a, b) { // 내림차순
                return b["z_index"] - a["z_index"];
            });
            const returnArray = []

            const end = async () => {
                //populate
                await Topic.find(
                    {},
                    ["_id", "user_id", "title", "content", "view_count", "like_count", "comment_count", "topic_id", "topic_name"],
                    { sort: { view_count: -1 }, limit: 3 },
                    (err, topic) => {
                        if (err) return res.json({ success: false, message: err })
                        const temp_obj = {}
                        //topic_nickname
                        const idArray = []
                        topic.forEach(topic_element => {
                            //user_info
                            idArray.push({ _id: topic_element.user_id })
                            //topic_info
                            let my_topic_state
                            if (user.my_topic.length) {
                                my_topic_state = user.my_topic.some((item) => {
                                    if (item.topic_id.toString() == topic_element.topic_id.toString()) {
                                        return true
                                    }
                                })
                            } else {
                                my_topic_state = false
                            }

                            const topic_info_obj = {
                                _id: topic_element.topic_id,
                                topic_name: topic_element.topic_name,
                                my_topic_state: my_topic_state
                            }

                            topic_element.topic_info = topic_info_obj
                        });

                        User.find(
                            { $or: idArray },
                            ["_id", "topic_nickname"],
                            async (err, data) => {
                                topic.map((topic_data) => {
                                    data.find((data_user) => {

                                        if (data_user._id.toString() == topic_data.user_id.toString()) {
                                            topic_data.user_info = data_user
                                        }
                                    });
                                })
                                // console.log("topic")
                                // console.log(topic)
                                temp_obj.topic_list = topic
                                returnArray.push({ populate_topic_list: temp_obj })
                            }
                        ).lean()
                    }
                ).lean()
                //general
                for (let i = 0; i < topic_sort.length; i++) {
                    await Topic.find(
                        { topic_id: topic_sort[i]._id },
                        ["_id", "user_id", "title", "content", "view_count", "like_count", "comment_count"],
                        { sort: { view_count: -1 }, limit: 3 },
                        (err, topic) => {
                            if (err) return res.json({ success: false, message: err })
                            if (topic.length != 0) {
                                const temp_obj = {}
                                topic_sort[i].my_topic_state = false
                                user.my_topic.find((element) => {
                                    if (element.topic_id.toString() == topic_sort[i]._id.toString())
                                        topic_sort[i].my_topic_state = true
                                })


                                //topic_nickname
                                const idArray = []
                                topic.forEach(topic_element => {
                                    idArray.push({ _id: topic_element.user_id })
                                });
                                User.find(
                                    { $or: idArray },
                                    ["_id", "topic_nickname"],
                                    (err, data) => {
                                        topic.map((topic_data) => {
                                            data.find((data_user) => {
                                                if (data_user._id.toString() == topic_data.user_id.toString()) {
                                                    topic_data.user_info = data_user
                                                }
                                            });
                                        })

                                        temp_obj.topic_info = topic_sort[i]
                                        temp_obj.topic_list = topic
                                        returnArray.push({ topic_array: temp_obj })
                                        if (topic_sort.length == i + 1) {
                                            return res.status(200).json({
                                                success: true,
                                                data: returnArray,
                                            });
                                        }
                                    }
                                ).lean()


                            } else {
                                if (topic_sort.length == i + 1)
                                    return res.status(200).json({
                                        success: true,
                                        data: returnArray,
                                    });
                            }
                        }
                    ).lean()

                }

            }
            end()




        })
    })

}

topicController.add_topic = (req, res) => {
    const user_id = req.decoded._id
    const topic_id = req.body.topic_id
    // const a = { $push: { topic_id: topic_id } }
    // const b = { $pull: { topic_id: topic_id } }
    User.findOne(
        { _id: user_id, "my_topic.topic_id": topic_id },
        (err, data) => {
            if (err) return res.json({ success: false, err });
            let updat_obj
            let message
            if (!data) {
                updat_obj = {
                    $push: {
                        my_topic: { topic_id: topic_id }
                    }
                }
                message = "토픽 등록"
            } else {
                updat_obj = {
                    $pull: {
                        my_topic: { topic_id: topic_id }
                    }
                }
                message = "토픽 해제"
            }
            User.findOneAndUpdate(
                { _id: user_id, },
                updat_obj,
                (err, data) => {
                    if (err) return res.json({ success: false, err });
                    return res.status(200).json({
                        success: true,
                        message: message,
                        data: null
                    });
                }
            )

        }
    )
}
topicController.list = (req, res) => {
    const user_id = req.decoded._id

    Etc.findOne(
        { key: "topic" },
        ['-_id', 'value_topic'],
        (err, data) => {
            if (err) return res.json({ success: false, err });
            // console.log(result)
            User.findOne(
                { _id: user_id },
                ["-_id", "my_topic"],
                (err, my_topic) => {
                    const j_topic_list = JSON.parse(JSON.stringify(my_topic.my_topic))
                    const j_data = JSON.parse(JSON.stringify(data.value_topic))

                    const returnArray = j_topic_list.map((j_topic) => {
                        const found = j_data.find((j_data) => {
                            if (j_data._id.toString() == j_topic.topic_id.toString()) {
                                j_topic.topic_name = j_data.topic_name
                            }
                        });
                        return { ...j_topic, ...found };
                    });
                    return res.status(200).json({
                        success: true,
                        data: returnArray
                    });
                }
            )
        }

    )
}
topicController.all = (req, res) => {
    const user_id = req.decoded._id

    Etc.findOne(
        { key: "topic" },
        ['-_id', 'value_topic'], // Columns to Return
        (err, data) => {
            if (err) return res.json({ success: false, err });
            User.findOne(
                { _id: user_id },
                ["-_id", "my_topic"],
                (err, my_topic) => {
                    const j_topic_list = JSON.parse(JSON.stringify(data.value_topic))
                    const j_data = JSON.parse(JSON.stringify(my_topic.my_topic))
                    let returnArray = []

                    if (j_data.length == 0) {
                        j_topic_list.forEach(element => {
                            element.topic_state = false
                            returnArray.push(element)
                        });
                    } else {
                        returnArray = j_topic_list.map((j_topic) => {
                            const found = j_data.find((j_data) => {
                                if (j_topic.topic_state == undefined)
                                    j_topic.topic_state = false
                                if ((j_data.topic_id.toString() == j_topic._id.toString())) {
                                    j_topic.topic_state = true
                                }
                            });
                            return { ...j_topic, ...found };
                        });
                    }
                    const a = returnArray.sort(function (a, b) { // 내림차순
                        return b["z_index"] - a["z_index"];
                    });
                    return res.status(200).json({
                        success: true,
                        data: returnArray
                    });
                }
            )

        }

    )
}

topicController.content_insert = (req, res) => {
    const user_id = req.decoded._id
    //hashtag
    const split_text = req.body.content.split(" ")
    let hashtag = []
    split_text.forEach(element => {
        if (element.includes("#")) {
            if (!hashtag.includes(element))
                hashtag.push(element)

        }
    });

    //
    const content = new Topic({
        user_id: user_id,
        topic_id: req.body.topic_id,
        topic_name: req.body.topic_name,
        title: req.body.title,
        content: req.body.content,
    })
    content.save(
        (err, data) => {
            if (err) return res.json({ success: false, err });

            hashtag.forEach(element => {
                Hashtag.findOneAndUpdate(
                    { tag: element },
                    {
                        $inc: { use_count: 1 },
                        $push: { use_user: { user_id: user_id, topic_id: data._id } }
                    },
                    { upsert: true },
                    (err, data) => {
                    }
                )
            })

            return res.status(200).json({
                success: true,
                message: null,
                data: null,
            });

        }
    )
}

topicController.content_list = (req, res) => {
    const user_id = req.decoded._id
    const topic_id = req.params.topic_id
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);
    Topic.find(
        { topic_id: topic_id },
        ["user_id", "topic_id", "topic_name", "title", "content", "view_count", "like_count", "comment_count"],
        { sort: { _id: -1 }, limit: listLength, skip: (index - 1) * listLength },
        (err, returnData) => {
            if (err) return res.json({ success: false, err });
            if (!returnData || returnData.length == 0) return res.json({ success: false, message: "NoResult" });
            const idArray = []
            returnData.forEach(element => {
                idArray.push({ _id: element.user_id })
            });

            User.find(
                { $or: idArray },
                ["_id", "topic_nickname", "profile_web_path"],
                (err, data) => {
                    const j_comment_list = JSON.parse(JSON.stringify(returnData))
                    const j_data = JSON.parse(JSON.stringify(data))

                    const returnArray = j_comment_list.map((j_comment) => {
                        const found = j_data.find((j_data) => {
                            if (j_data._id.toString() == j_comment.user_id.toString()) {
                                j_comment.user_info = j_data
                            }
                        });
                        return { ...j_comment, ...found };
                    });
                    return res.status(200).json({
                        success: true,
                        data: returnArray,
                    });
                }
            )

        }
    ).sort()

}

// Content.findOneAndUpdate(
//     { _id: req.body._id, user_id: user._id },
//     { $set: { content_status: "DEAD" } }
//     , (err, content) => {
//         if (content === null || content === undefined) {
//             return res.json({
//                 success: false,
//                 message: "권한이 없거나 존재하지 않는 게시글입니다",
//             })
//         } else {
//             return res.status(200).json({
//                 success: true,
//             });
//         }
//     });




module.exports = topicController;
