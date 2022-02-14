
import request from 'request';
import async from 'async';
import { ObjectID, ObjectId } from "mongodb";
import dotenv from 'dotenv'
dotenv.config()

import { registered } from "./../utils/utilsFunction"
import Hashtag from "../models/Hashtag";
import User from "../models/User";
import { post } from "../utils/curl";
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";
import { jwt_verify } from "../utils/utilsFunction"
import { hash } from 'bcrypt';
import Bringup from '../models/Bringup';
import Etc from '../models/Etc';
import Topic from '../models/Topic';
let hashtagController = {};

hashtagController.popular_list = async (req, res) => {
    let a = 24
    function promiseFunc(a) {
        return new Promise((resolve, reject) => {

            console.log("a")
            console.log(a)
            let newDate = new Date()

            const m_seconds = a * 60 * 60 * 1000
            newDate = new Date(newDate - m_seconds)

            newDate.setHours(newDate.getHours() - (newDate.getHours() % a))
            newDate.setMinutes(0)
            newDate.setSeconds(0)

            const hexSeconds = Math.floor(newDate / 1000).toString(16) + "0000000000000000"
            console.log("hexSeconds")
            console.log(registered(hexSeconds))

            Hashtag.find(
                {
                    "use_user._id": {
                        $gte: { _id: hexSeconds }
                    }
                },
                {},
                { limit: 10 },
                async (err, data1) => {
                    return new Promise((resolve, reject) => {
                        // console.log(data1)
                        a = a * 2
                        if (data1.length < 10) {
                            resolve(promiseFunc(a));

                        } else {
                            data1.forEach(element => {
                                let data = element.use_user.filter(element2 => {
                                    return ObjectID(element2._id) >= ObjectID(hexSeconds)
                                })
                                element.use_user = data
                            });
                            console.log(a + "시간  데이터")
                            console.log(data1)
                            //=====================
                            const now = new Date()
                            let m_seconds = a * 60 * 60 * 1000
                            newDate = new Date(newDate - m_seconds)
                            now.setHours(now.getHours() - (now.getHours() % a) - a)
                            now.setMinutes(0)
                            now.setSeconds(0)

                            const hexSeconds2 = Math.floor(now / 1000).toString(16) + "0000000000000000"
                            // console.log(hexSeconds2)
                            console.log("hexSeconds2")
                            console.log(registered(hexSeconds2))

                            // console.log("614c28be5feebb97f8fb7d9f")
                            // console.log(registered("614c28be5feebb97f8fb7d9f"))

                            Hashtag.find(
                                { "use_user._id": { $lte: hexSeconds, $gt: hexSeconds2 } },
                                (err, data2) => {
                                    console.log(a * 2 + "시간  데이터")
                                    data2.forEach(element => {
                                        let data = element.use_user.filter(element2 => {
                                            return (ObjectID(element2._id) >= ObjectID(hexSeconds2) && ObjectID(element2._id) < ObjectID(hexSeconds))
                                        })
                                        element.use_user = data
                                    });
                                    // console.log(data2)



                                    for (let i = 0; i < data1.length; i++) {
                                        for (let j = 0; j < data2.length; j++) {
                                            if (data1[i]._id.toString() == data2[j]._id.toString() && data1[i].grade == undefined) {
                                                // console.log("현재")
                                                // console.log(i)
                                                // console.log("과거")
                                                // console.log(j)
                                                data1[i].grade = j - i
                                            }

                                        }
                                    }
                                    data1.forEach(element => {
                                        if (element.grade == undefined)
                                            element.grade = 'new'
                                    });


                                    resolve('Done');

                                    let findData = data1.map(element => {
                                        Bringup.findOne(
                                            { _id: element.use_user[element.use_user.length - 1].bringup_id },
                                            (err, data) => {
                                                console.log("bringupData")
                                                console.log(data)
                                                element.fileData = data.file_array[0]
                                            }
                                        )
                                    })
                                    for (let count = 0; count < data1.length; count++) {
                                        Bringup.findOne(
                                            { _id: data1[count].use_user[data1[count].use_user.length - 1].bringup_id },
                                            (err, brinup) => {
                                                data1[count].fileData = brinup.file_array[0]
                                                if (count + 1 == data1.length)
                                                    return res.json({ success: true, data: data1 })
                                            }
                                        )
                                    }
                                }
                            ).lean()
                        }
                    })

                }
            ).lean()
        })
    }

    (async function testFunc() {
        console.log('Starting');
        const returnArray = await promiseFunc(a)
    })()



}
hashtagController.hot_item = async (req, res) => {
    let a = 2
    function promiseFunc(a) {
        return new Promise((resolve, reject) => {

            console.log("a")
            console.log(a)
            let newDate = new Date()

            const m_seconds = a * 60 * 60 * 1000
            newDate = new Date(newDate - m_seconds)

            newDate.setHours(newDate.getHours() - (newDate.getHours() % a))
            newDate.setMinutes(0)
            newDate.setSeconds(0)

            const hexSeconds = Math.floor(newDate / 1000).toString(16) + "0000000000000000"
            console.log("hexSeconds")
            console.log(registered(hexSeconds))

            Hashtag.find(
                {
                    "use_user._id": { $gte: { _id: hexSeconds } }, item_state: true
                },
                {},
                { limit: 10 },
                async (err, data1) => {
                    return new Promise((resolve, reject) => {
                        // console.log(data1)
                        a = a * 2
                        if (data1.length < 10) {

                            resolve(promiseFunc(a));

                        } else {
                            data1.forEach(element => {
                                let data = element.use_user.filter(element2 => {
                                    return ObjectID(element2._id) >= ObjectID(hexSeconds)
                                })
                                element.use_user = data
                            });
                            console.log(a / 2 + "시간  데이터")
                            // console.log(data1)
                            //=====================
                            const now = new Date()
                            let m_seconds = a * 60 * 60 * 1000
                            newDate = new Date(newDate - m_seconds)
                            now.setHours(now.getHours() - (now.getHours() % a) - a)
                            now.setMinutes(0)
                            now.setSeconds(0)

                            const hexSeconds2 = Math.floor(now / 1000).toString(16) + "0000000000000000"
                            // console.log(hexSeconds2)
                            console.log("hexSeconds2")
                            console.log(registered(hexSeconds2))

                            // console.log("614c28be5feebb97f8fb7d9f")
                            // console.log(registered("614c28be5feebb97f8fb7d9f"))

                            Hashtag.find(
                                { "use_user._id": { $lte: hexSeconds, $gt: hexSeconds2 }, item_state: true },
                                (err, data2) => {
                                    console.log(a + "시간  데이터")
                                    data2.forEach(element => {
                                        let data = element.use_user.filter(element2 => {
                                            return (ObjectID(element2._id) >= ObjectID(hexSeconds2) && ObjectID(element2._id) < ObjectID(hexSeconds))
                                        })
                                        element.use_user = data
                                    });
                                    // console.log(data2)



                                    for (let i = 0; i < data1.length; i++) {
                                        for (let j = 0; j < data2.length; j++) {
                                            if (data1[i]._id.toString() == data2[j]._id.toString() && data1[i].grade == undefined) {
                                                // console.log("현재")
                                                // console.log(i)
                                                // console.log("과거")
                                                // console.log(j)
                                                data1[i].grade = j - i
                                            }

                                        }
                                    }
                                    data1.forEach(element => {
                                        if (element.grade == undefined)
                                            element.grade = 'new'
                                    });


                                    resolve('Done');

                                    let findData = data1.map(element => {
                                        Bringup.findOne(
                                            { _id: element.use_user[element.use_user.length - 1].bringup_id },
                                            (err, data) => {
                                                // console.log("bringupData")
                                                // console.log(data)
                                                element.fileData = data.file_array[0]
                                            }
                                        )
                                    })
                                    for (let count = 0; count < data1.length; count++) {
                                        Bringup.findOne(
                                            { _id: data1[count].use_user[data1[count].use_user.length - 1].bringup_id },
                                            (err, brinup) => {
                                                data1[count].fileData = brinup.file_array[0]
                                                if (count + 1 == data1.length)
                                                    return res.json({ success: true, data: data1 })
                                            }
                                        )
                                    }
                                }
                            ).lean()
                        }
                    })

                }
            ).lean()
        })
    }

    (async function testFunc() {
        console.log('Starting');
        const returnArray = await promiseFunc(a)
    })()
}
hashtagController.review_list = (req, res) => {
    const user_id = req.decoded._id
    const tag_id = req.params.tag_id
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);




    Hashtag.findOne(
        { _id: tag_id, item_state: true },
        ["score_array"],
        (err, hashtag) => {
            if (err) return res.json({ success: false, message: err });
            if (!hashtag) return res.json({ success: false, message: "NoResult" });

            if (hashtag.score_array == undefined) return res.json({ success: false, message: "NoResult" });


            //리뷰수
            const total = hashtag.score_array.length
            //
            const reverse_array = hashtag.score_array.reverse()
            const hashtag_list = slideArr(reverse_array, listLength, index)

            const idArray = []
            reverse_array.forEach(element => {
                idArray.push({ _id: element.user_id })
            });

            User.find(
                { $or: idArray },
                ["_id", "nickname", "profile_web_path"],
                (err, data) => {
                    if (!data) return res.json({ success: false, message: "NoResult" })
                    const j_comment_list = hashtag_list
                    const j_data = data

                    const returnArray = j_comment_list.map((j_comment) => {
                        const found = j_data.find((j_data) => {
                            if (j_data._id.toString() == j_comment.user_id.toString()) {
                                j_comment.user_info = j_data
                            }
                        });
                        return { ...j_comment, ...found };
                    });


                    returnArray.forEach(element => {
                        element.folded = false
                        element.registered = registered(element._id)
                    });

                    const return_obj = {}
                    return_obj.total = total
                    return_obj.hashtag_list = returnArray

                    return res.json({ success: true, data: return_obj });
                }
            ).lean()


        }
    ).lean();




}

hashtagController.item = async (req, res) => {
    const user_id = req.decoded._id
    const tag_id = req.params.tag_id




    Hashtag.findOne(
        { _id: tag_id, item_state: true },
        ["use_user", "connect_tag", "site_url", "score_array"],
        {},
        (err, hashtag) => {
            if (err) return res.json({ success: false, err: err });
            if (!hashtag) return res.json({ success: false, message: "NoResult" });
            const bringup_ids = hashtag.use_user.slice(-9).reverse()
            if (hashtag.score_array) {
                const array = []
                hashtag.score_array.forEach(element => {
                    array.push(element.score)
                });
                const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
                hashtag.average = Math.round(average(array) * 100) / 100
            } else {
                hashtag.average = 0.0
            }


            let i = 1;
            hashtag.image_list = []
            if (bringup_ids.length == 0)
                return res.json({ success: true, data: hashtag });
            else
                bringup_ids.forEach(element => {
                    Bringup.findOne(
                        { _id: element.bringup_id },
                        ["file_array"],
                        (err, bringup) => {
                            hashtag.image_list.push(bringup.file_array[0].image_object)
                            if (i != 9)
                                i++
                            else {
                                delete hashtag["use_user"]
                                return res.json({ success: true, data: hashtag });
                            }
                        }
                    )
                });
            // if (err) return res.json({ success: false, message: err });
            // if (hashtag.score_array == undefined) return res.json({ success: false, message: "NoResult" });
            // const reverse_array = hashtag.score_array.reverse()
            // const hashtag_list = slideArr(reverse_array, listLength, index)
            // return res.json({ success: true, data: hashtag_list });
        }
    ).lean();




}

hashtagController.review_add = (req, res) => {
    const user_id = req.decoded._id
    const score_obj = { user_id: user_id, score: req.body.score, content: req.body.content }
    Hashtag.findOneAndUpdate(
        { _id: req.body.tag_id, use_count: { $gte: 10 }, item_state: true },
        {
            $push: { score_array: score_obj }
        },
        (err, data) => {
            if (err) return res.json({ success: false, message: err });
            if (data == null) return res.json({ success: false, message: "리뷰등록 실패" });
            else return res.json({ success: true, message: "리뷰 등록 완료" });

        }
    )
}

hashtagController.recommend = (req, res) => {
    const now = new Date
    // console.log(now)
    // "value_hashtag.start_at": { $gte: now }, "value_hashtag.end_at": { $lte: now }
    Etc.findOne(
        {
            "key": "recommend-hashtag",
            //  'value_hashtag.start_at': { $lte: now },
            //   'value_hashtag.end_at': { $gte: now } 
        },
        {},
        (err, rtag) => {
            // console.log(rtag.value_hashtag)
            const alive_data = rtag.value_hashtag.find(item => {
                return item.state == 'ALIVE' && item.start_at <= now && item.end_at >= now
            })
            if (!alive_data)
                return res.json({ success: false, message: "NoResult" })
            else
                res.json({ success: true, data: alive_data })
        }
    )
}

hashtagController.search = (req, res) => {
    const user_id = req.decoded._id
    const search = req.query.search;
    Hashtag.findOne(
        { tag: search },
        ["use_user", "connect_tag"],
        async (err, tag) => {
            if (err) throw err;
            if (!tag) return res.json({ success: false, message: "NoResult" })
            // console.log(tag)
            let bringup_array = []
            let topic_array = []
            let connect_tag = []
            tag.use_user.forEach(element => {
                // console.log(item)
                if (element.bringup_id) {
                    bringup_array.push({ _id: element.bringup_id })
                }
                else if (element.topic_id)
                    topic_array.push({ _id: element.topic_id })

            });
            tag.connect_tag.forEach(element => {
                // console.log(element)
                connect_tag.push({ _id: element.tag_id })
            })

            const bringup_data = await Bringup.find(
                { $or: bringup_array },
                ["file_array"],
                { limit: 9 },
                (err, data) => {
                    return data
                }
            ).lean().exec()
            let return_bringup = []
            if (bringup_data)
                for (let a = 0; a < bringup_data.length; a++) {
                    return_bringup.push({ _id: bringup_data[a]._id, web_path: bringup_data[a].file_array[0].image_object.web_path })
                }

            const topic_data = await Topic.find(
                { $or: topic_array },
                ["title", "topic_id", "title", "content", "topic_name"],
                { limit: 9 },
                (err, data) => {
                    return data
                }
            ).lean().exec()
            const user_data = await User.findOne(
                { _id: user_id },
                ["my_topic", "-_id"],
                (err, data) => {
                    return data
                }
            )

            let return_topic = []
            if (topic_data)
                for (let a = 0; a < topic_data.length; a++) {
                    const my_topic_state = user_data.my_topic.some((item) => {
                        if (item.topic_id.toString() == topic_data[a].topic_id.toString()) {
                            return true
                        } else {
                            return false
                        }
                    })
                    topic_data[a].my_topic_state = my_topic_state
                    if (a + 1 == topic_data.length) {
                        return_topic = topic_data
                    }


                }

            const connect_data = await Hashtag.find(
                { $or: connect_tag },
                ["use_user.bringup_id", "tag"],
                (err, data) => {
                    return data
                }
            ).lean().exec()
            if (connect_data)
                for (let a = 0; a < connect_data.length; a++) {

                    const bringup_id_array = connect_data[a].use_user.filter(item => { if (item.bringup_id) return true })
                    const connect_bringup_data = await Bringup.findOne(
                        { _id: bringup_id_array[0].bringup_id },
                        ["file_array"],
                        (err, data) => {
                            return data
                        }
                    ).lean().exec()

                    delete connect_data[a].use_user
                    const bringup_data = { _id: connect_bringup_data._id, web_path: connect_bringup_data.file_array[0].image_object.web_path }
                    connect_data[a].bringup_data = bringup_data
                }
            return res.json({ success: true, data: { bringup_data: return_bringup, topic_data: return_topic, connect_data: connect_data } })
        }).lean();
}

hashtagController.bringup_search = (req, res) => {
    const user_id = req.decoded._id
    const search = req.query.search;
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);
    Hashtag.findOne(
        { tag: search },
        ["use_user"], async (err, tag) => {
            if (err) throw err;
            if (!tag) return res.json({ success: false, message: "NoResult" })
            let bringup_array = []
            tag.use_user.forEach(element => {
                if (element.bringup_id) {
                    bringup_array.push({ _id: element.bringup_id })
                }
            });

            Bringup.find(
                { $or: bringup_array, status: "ALIVE" },
                ["-comment_array"],
                { limit: listLength, skip: (index - 1) * listLength },
                (err, data) => {
                    if (err) res.json({ succees: false, data: err })
                    if (!data) res.json({ succees: false, message: "Nodata" })
                    else {
                        const returnData = data
                        //작성자 _id
                        const idArray = []
                        returnData.forEach(element => {
                            idArray.push({ _id: element.user_id })
                        })
                        User.find(
                            { $or: idArray },
                            ["_id", "nickname", "profile_web_path", "children_list", "follower_list", "locker_bringup"],
                            (err, data) => {
                                // console.log(data)
                                const j_comment_list = JSON.parse(JSON.stringify(returnData))
                                const j_data_list = JSON.parse(JSON.stringify(data))

                                if (err) res.json({ succees: false, data: err });
                                console.log(err);
                                
                                const returnArray = j_comment_list.map((j_comment) => {
                                    const found = j_data_list.find((j_data) => {
                                        // console.log(j_data._id)
                                        if (j_data._id.toString() == j_comment.user_id.toString()) {
                                            j_comment.user_info = j_data
                                        }
                                    });
                                    return { ...j_comment, ...found };
                                });
                                // console.log(returnArray)

                                User.findOne(
                                    { _id: user_id },
                                    ["locker_bringup"],
                                    (err, my_user) => {
                                        for (let i = 0; i < returnArray.length; i++) {
                                            returnArray[i].my_content = false
                                            if (user_id == returnArray[i].user_id)
                                                returnArray[i].my_content = true
                                            //좋아요 여부
                                            returnArray[i].like_state = false
                                            returnArray[i].like_user.find(it => {
                                                if (it.user_id.toString() == returnArray[i].user_id.toString())
                                                    returnArray[i].like_state = true
                                            })

                                            //작성시간
                                            const time_registered = registered(returnArray[i]._id)
                                            returnArray[i].time_registered = time_registered

                                            //내보관함
                                            returnArray[i].locker_state = false
                                            if (my_user.locker_bringup != undefined) {
                                                my_user.locker_bringup.forEach(item => {
                                                    if (returnArray[i]._id.toString() == item.bringup_id.toString()) {
                                                        returnArray[i].locker_state = true
                                                    }
                                                })
                                            }

                                            //대표자녀
                                            if (returnArray[i].user_info.children_list != undefined) {
                                                returnArray[i].user_info.children_list.forEach(item => {
                                                    if (item.rep == true) {
                                                        returnArray[i].user_info.rep_children_open = item.open
                                                        returnArray[i].user_info.rep_children_rel = item.relationship
                                                        returnArray[i].user_info.rep_children_bir = item.children_birthday
                                                    }
                                                })

                                                delete returnArray[i].user_info.children_list
                                            }


                                            //이웃여부
                                            if (returnArray[i].user_info.follower_list != undefined) {
                                                returnArray[i].follow_state =
                                                    returnArray[i].user_info.follower_list.some(item => {
                                                        return item.user_id == user_id
                                                    })
                                                // console.log(returnArray[i].user_info.follow_state)
                                                // delete returnArray[i].user_info.follower_list
                                            } else {
                                                returnArray[i].follow_state = false
                                            }

                                            //프론트요청
                                            returnArray[i].folded = false
                                            if (returnArray.length - 1 == i)
                                                return res.json({ success: true, data: returnArray })
                                        }
                                    }
                                ).lean()
                            }
                        )


                    }
                }
            ).lean().sort({ _id: -1 }).exec()
        }).lean();
}
hashtagController.topic_search = (req, res) => {
    const user_id = req.decoded._id
    const search = req.query.search;
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);

    Hashtag.findOne(
        { tag: search },
        ["use_user"],

        async (err, tag) => {
            if (err) throw err;
            if (!tag) return res.json({ success: false, message: "NoResult" })
            // console.log(tag)

            let topic_array = []

            tag.use_user.forEach(element => {
                topic_array.push({ _id: element.topic_id })
            });


            User.findOne(
                { _id: user_id },
                ["my_topic", "-_id"],
                (err, user) => {
                    if (err) return res.json({ success: false, message: err })
                }
            ).lean().then(user => {
                const end = async () => {
                    let returnArray = []
                    await Topic.find(
                        { $or: topic_array, status: "ALIVE" },
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
                                    temp_obj.topic_list = topic
                                    return res.json({ success: true, data: temp_obj })
                                }
                            ).lean()
                        }
                    ).lean()


                }
                end()
            })


        })


}

hashtagController.test = (req, res) => {
    Hashtag.aggregate([
        { $unwind: "$score_array" },
        { $group: { _id: "614c263f87e73f8fc4aea8fe", score: { $avg: "$score_array.score" } } },
    ], (err, data) => {
        console.log(data)
    })

    // Hashtag.findOne(
    //     { _id: "614c263f87e73f8fc4aea8fe" }
    // )
}

module.exports = hashtagController;
