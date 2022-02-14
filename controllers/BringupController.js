
import request from 'request';
import { ObjectId } from "mongodb";
import _ from "lodash"
import dotenv from 'dotenv'
dotenv.config()

import { registered } from "./../utils/utilsFunction"
import Bringup from "../models/Bringup";
import User from "../models/User";
import Hashtag from "../models/Hashtag";
import { post } from "../utils/curl";
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";
import { jwt_verify } from "../utils/utilsFunction"
import { hash } from 'bcrypt';
import { months } from 'moment';
let bringupController = {};
/*
1.인터렉션
  게시물
 - 최근 1달이내 게시물
 - 최근 3달이내 댓글

 - 팔로워 100명이상

 - (+기타조건)
  위 조건중 한개이상 충족시 유저 랜덤 50명 선출 후

2. 추천유저 및 게시물
 유저 그룹
     - 같은 유저 그룹 26점(오차마다 -1)
     - 같은 성별 그룹 +5점

3. 지역
 같은 시/도 +5점
 같은 군구 +10
 총점을 합한 결과

점수가 높은 유저 순으로 5명 노출

*/
bringupController.r_neighbor = (req, res) => {
    const _id = req.decoded._id
    const month = new Date().getMonth()
    const one_post_month = new Date().setMonth(month - 1)
    const one_post_idMin = ObjectId(Math.floor((one_post_month) / 1000).toString(16) + "0000000000000000")

    const three_post_month = new Date().setMonth(month - 3)
    const three_post_idMin = ObjectId(Math.floor((three_post_month) / 1000).toString(16) + "0000000000000000")

    let r_user_array = []
    Bringup.find(
        {
            $or: [
                {
                    _id: { $gte: one_post_idMin },
                },
                {
                    "comment_array._id": { $gte: three_post_idMin }
                }
            ],
        },
        (err, bringup) => {
            bringup.forEach(element => {
                r_user_array.push({ _id: element.user_id.toString() })
            });

            User.find(
                { follower_count: { $gte: 100 } },
                (err, data) => {
                    if (data) {
                        data.forEach(element => {
                            r_user_array.push({ _id: element._id })
                        })
                    }
                    r_user_array = _.uniqBy(r_user_array, "_id")
                    r_user_array = r_user_array.filter(item => { return item._id != _id })
                    User.findOne(
                        { _id: _id },
                        ["user_group", "sido_no", "sigungu_no"],
                        (err, user) => {
                            if (err) res.json({ succees: false, data: err })
                            if (!user) res.json({ succees: false, message: "Nodata" })
                            
                            // user.user_group 안에 데이터가 없을때도 있어서 충돌
                            if (!user.user_group) return res.json({succees: false, data: [] })
                            const user_group_int = user.user_group.charAt(0).charCodeAt()
                            const user_gender_int = parseInt(user.user_group.charAt(1))
                            User.find(
                                { $or: r_user_array, "follower_list.user_id": { $nin: [_id] } },
                                ["user_group", "sido_no", "sigungu_no", "profile_web_path", "nickname", "children_list", "followr_list"],
                                (err, data) => {
                                    data.forEach(element => {
                                        //score
                                        element.score = 0
                                        if (element.user_group) {
                                            let group_point = 26 - Math.abs(user_group_int - element.user_group.charAt(0).charCodeAt())
                                            if (element.user_group.charAt(1)) {
                                                if (user_gender_int == parseInt(element.user_group.charAt(1)))
                                                    group_point = group_point + 5
                                            }
                                            element.score = element.score + group_point
                                        }
                                        if (element.sido_no) {
                                            let area_score = 0
                                            if (user.sido_no == element.sido_no)
                                                area_score = area_score + 5
                                            if (element.sigungu_no) {
                                                if (user.sigungu_no == element.sigungu_no) {
                                                    area_score = area_score + 10
                                                }
                                            }
                                            element.score = element.score + area_score
                                        }
                                        //neighbor_state
                                        element.neighbor_state = false

                                        //info
                                        const rep_children_info = element.children_list.filter(item => { if (item.rep == true) return true })
                                        if (rep_children_info[0])
                                            element.rep_children_info = rep_children_info[0]
                                        else
                                            element.rep_children_info = null
                                        delete element.children_list
                                        delete element.followr_list

                                    });
                                    const returnArray = data.sort((a, b) => { return b.score - a.score })
                                    return res.json({ success: true, data: returnArray })
                                }
                            ).lean()
                        }
                    ).lean()



                }
            ).lean()
        }
    ).lean()


}

bringupController.life_list = (req, res) => {
    const _id = req.decoded._id
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);

    Bringup.find(
        { status: "ALIVE" },
        ["-comment_array"],
        { limit: listLength, skip: (index - 1) * listLength },
        (err, data) => {
            if (err) res.json({ succees: false, data: err })
            if (!data) res.json({ succees: false, message: "Nodata" })
            const returnData = JSON.parse(JSON.stringify(data))
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
                        { _id: _id },
                        ["locker_bringup"],
                        (err, my_user) => {
                            for (let i = 0; i < returnArray.length; i++) {
                                returnArray[i].my_content = false
                                if (_id == returnArray[i].user_id)
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
                                    returnArray[i].user_info.follow_state =
                                        returnArray[i].user_info.follower_list.some(item => {
                                            return item.user_id == _id
                                        })
                                    // console.log(returnArray[i].user_info.follow_state)
                                    // delete returnArray[i].user_info.follower_list
                                } else {
                                    returnArray[i].user_info.follow_state = false
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
    ).sort({ _id: -1 })
}

bringupController.life_insert = (req, res) => {
    const user_id = req.decoded._id
    const split_text = req.body.content.split(" ")
    let hashtag = []
    split_text.forEach(element => {
        if (element.includes("#")) {
            if (!hashtag.includes(element))
                hashtag.push(element)

        }
    });
    const bringup = new Bringup({
        content: req.body.content,
        file_array: req.body.file_array,
        user_id: user_id,
        tag_array: hashtag
    })




    bringup.save().then((life, err) => {
        if (err) return res.json({ success: false, message: err });
        //hashtag



        hashtag.forEach(element => {
            Hashtag.findOneAndUpdate(
                { tag: element },
                {
                    $inc: { use_count: 1 },
                    $push: { use_user: { user_id: user_id, bringup_id: life._id } }
                },
                { upsert: true },
                (err, data) => {
                }
            )
        })
        // hashtag END

        return res.status(200).json({ success: true, data: life._id });

    })
}


bringupController.life_update = (req, res) => {
    const user_id = req.decoded._id
    const split_text = req.body.content.split(" ")

    let hashtag = []
    split_text.forEach(element => {
        if (element.includes("#")) {
            if (!hashtag.includes(element))
                hashtag.push(element)

        }
    });
    Bringup.findOneAndUpdate(
        { _id: req.body._id, user_id: user_id },
        {
            $set: {
                content: req.body.content,
                file_array: req.body.file_array,
                tag_array: hashtag
            }
        },
        async (err, data) => {
            if (err) return res.json({ success: false, message: err });
            if (!data) return res.json({ success: false, message: "NoReuslt" });
            //hashtag
            await Hashtag.updateMany(
                { "use_user.bringup_id": req.body._id, "use_user.user_id": user_id },
                {
                    $pull: { use_user: { bringup_id: req.body._id } },
                    $inc: { use_count: -1 }
                },
                (err, data) => {
                    console.log("1111111")
                    console.log(data)
                }
            )


            hashtag.forEach(element => {
                Hashtag.findOneAndUpdate(
                    { tag: element },
                    {
                        $inc: { use_count: 1 },
                        $push: { use_user: { user_id: user_id, bringup_id: req.body._id } }
                    },
                    { upsert: true },
                    (err, data) => {
                    }
                )
            })
            // hashtag END
            return res.status(200).json({ success: true, data: null });
        }
    )

}
bringupController.life_delete = (req, res) => {
    const user_id = req.decoded._id
    Bringup.findOneAndUpdate(
        { _id: req.body._id, user_id: user_id },
        { status: "DEAD" },
        (err) => {
            if (err)
                res.json({ succees: false, message: "삭제에 실패하였습니다", data: err })
            res.json({ success: true, message: "삭제에 성공하였습니다", data: null })
        }
    )
}

// bringupController.comment_insert = (req, res) => {
//     const user_id = req.decoded._id
//     const target_id = req.body.target_id
//     const comment_obj = {
//         comment: req.body.comment,
//         user_id: user_id,
//     }
//     Bringup.findOneAndUpdate(
//         { _id: target_id },
//         {
//             $push: { comment_array: comment_obj },
//             $inc: { comment_count: 1 }
//         },
//         (err, data) => {

//             if (err) res.json({ succees: false, data: err })
//             if (data == null) res.json({ succees: false, message: "게시글이 존재하지 않습니다" })
//             else
//                 return res.status(200).json({
//                     success: true,
//                     message: '댓글 작성 완료',
//                     data: null,
//                 });
//         }
//     )
// }







module.exports = bringupController;
