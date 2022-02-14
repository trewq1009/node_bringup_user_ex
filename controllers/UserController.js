import dotenv from 'dotenv'
dotenv.config()

import jwt from "jsonwebtoken";
import moment from "moment";

import bcrypt from "bcrypt";

import User from "../models/User";
import Bringup from "../models/Bringup";
import File from "../models/File";
import Etc from "../models/Etc"
import Push from "../models/Push"
import Content from "../models/Content"
import Comment from "../models/Comment"
import Topic from "../models/Topic"
import { registered, slideArr } from "../utils/utilsFunction"
import { post_body, get_h } from "../utils/curl"
import e from 'express';
import { ObjectId } from "mongodb";
import Hashtag from '../models/Hashtag';
// import { delete } from 'request';

let userController = {};
//objectId : typeof(OBJECT)
const dateFromObjectId = function (objectId) {
  return new Date(parseInt(objectId.toString().substring(0, 8), 16) * 1000);
};

userController.test = (req, res) => {
  User.findOne({ _id: "" }, (err, user) => {
    const mongo_id = user._id
    console.log(dateFromObjectId(mongo_id))
    // F
    // const hexString = mongo_id.substring(0, 8);
    // const time = Int32.Parse(hexString, System.Globalization.NumberStyles.HexNumber);

  })
}
//랜덤 닉네임 재귀 함수
const generateNickname = () => {
  return new Promise(function (resolve, reject) {
    Etc.findOne(
      { key: "nickname_sample" },
      (err, results) => {
        const firstNickArray = results.value.split(',')
        const secondNickArray = results.value2.split(',')

        const firstName = firstNickArray[Math.floor(Math.random() * firstNickArray.length)]
        const secondName = secondNickArray[Math.floor(Math.random() * secondNickArray.length)]

        const rand_0_100 = Math.floor(Math.random() * 101);
        const nickName = firstName + " " + secondName + " #" + rand_0_100

        User.find({ nickname: nickName }, (err, result) => {
          if (result.length) {
            resolve(generateNickname())
          } else {
            return resolve(nickName)
          }
        })
      }
    )
  });
}


// userController.ban = (req, res) => {
//   let token = req.cookies.x_auth;
//   User.findByToken(token).then((user) => {
//     User.updateOne(
//       { _id: user._id },
//       { $push: { user_ban_list: req.body.ban_id } },
//       (err) => {
//         if (err) return res.json({ success: false, message: "차단을 실패하였습니다" });
//         else {
//           res.json({ success: true, message: "차단하였습니다" });
//         }
//       }
//     )
//   })

// }

userController.withdraw = (req, res) => {
  let token = req.cookies.x_auth;
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    User.findOneAndUpdate(
      { _id: user._id },
      { $set: { status: "DEAD" } },
      (err) => {
        // console.log('user DEAD')
      }
    );
    Content.updateMany(
      { user_id: user._id },
      { $set: { content_status: "DEAD" } },
      (err) => {
        // console.log('content DEAD')
      }
    );
    Comment.updateMany(
      { user_id: user._id },
      { $set: { content_status: "DEAD", comment: "삭제된 댓글입니다" } },
      (err) => {
        // console.log('comment DEAD')
      }
    );
    return res.json({
      success: true,
    })

  })
}

userController.pushList = (req, res) => {
  let token = req.cookies.x_auth;
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);
    // console.log(user._id)
    Push.find(
      { target_user_id: user._id },
      {},
      { limit: listLength, skip: (index - 1) * listLength },
      (err, push) => {
        if (!push.length)
          return res.json({
            success: false,
            message: "알림내역이 없습니다",
          });
        else {
          return res.json({
            success: true,
            data: push
          })
        }

      }
    )

  })
}
// userController.register = (req, res) => {
//   // console.log("안녕")

//   // User.find({ id: req.body.id }, (err, idCheck) => {
//   //   console.log(idCheck)
//   //   if (idCheck) {
//   //     return res.status(400).json({
//   //       success: false,
//   //       message: "이미 가입된 아이디가 있습니다",
//   //     });
//   //   }
//   //   // idCheck.forEach(element => {
//   //   //   console.log(element.nickname)
//   //   // });
//   // })


//   const user = new User({
//     ...req.body,
//     // nickname: req.body.nickname,
//     // id: req.body.id,
//     status: "ALIVE"
//     // fcm_token:req.body.fcm_token
//   });
//   user.save((err, user) => {
//     if (err) return res.json({ success: false, err });
//     return res.status(200).json({
//       success: true,
//       _id: user._id,
//       nickname: user.nickname,
//       web_path: user.web_path,
//       f_message: "signUp"
//     });

//   });
// }

userController.signIn = (req, res) => {
  // console.log(req.body.id)
  User.findOne({ id: req.body.id }, async (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        success: false,
        message: "유저가 없습니다",
      });
    // let password_chekck;
    // console.log(req.body.password)
    // console.log(user.password)
    // bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
    //   if (err) return err;
    //   console.log(isMatch);
    //   password_chekck = isMatch
    // });
    // console.log(await user.comparePassword(req.body.password))
    // if (!await user.comparePassword(req.body.password)) return console.log('ds');
    // await user.comparePassword(req.body.password, (err, isMatch) => {
    //   console.log(err)
    //   console.log("isMatch")
    //   console.log(isMatch)
    //   if (!isMatch) return res.json({ success: false, message: "비밀번호오류" });
    // });

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) {
      return res.json({ success: false, message: "비밀번호오류" });
    } else {
      const token = jwt.sign({ _id: user._id.toHexString() }, "secretToken", { expiresIn: "36500d" });
      // user.token = token
      // console.log(user)
      return res.status(200).json({
        success: true,
        token: token,
        data: user,

      });


      // return res.json({ success: true });
    }
  });

};
//////////////////////////////////////////////////////////////////

// userController.register = async (req, res) => {
//   //iam port access process
//   const T_body = { 'imp_key': process.env.IMP_KEY, 'imp_secret': process.env.IMP_SECRET }
//   const return_token = await post_body(process.env.GET_TOKEN_URL, T_body)
//   const access_token = JSON.parse(return_token.body)
//   if (access_token.code != 0) {
//     return res.status(202).json({
//       success: false,
//       message: "인증오류"
//     });
//   } else {

//     const I_headers = { "Authorization": access_token.response.access_token }
//     const return_account = await get_h(process.env.IMP_CERTIFICATION + "/" + req.body.imp_uid, I_headers)
//     const I_account = JSON.parse(return_account.body)

//     //남성회원 거르기 
//     if (I_account.response.gender == "male" && (
//       I_account.response.unique_key != "xYHcWne0ySA/PWc1GDpFtFWkg3YyGG2nWP0ilF2xGcs0lVEda1lkmli4A4JdcZ00ZK2bHuzCbVrEnQjtU/NoVA==" && //희
//       I_account.response.unique_key != "OI2FkkeZ3kDnlR6dSXvSuTI9FIThbdpaWcXvGh3bwv12eK6rGunHuON07HzPVdCr6XbPBqEx0W5Xx1Kz/lkwdQ==" && //고
//       I_account.response.unique_key != "/xR6hI0r3B3s43JSmpLOLwqIUvV9lonr02kHf+oyPkXiELqAosoBMh1P7WQ4Gmob7vKmktkV7ZqKC9fSH/0A/w=="    // 결
//     )
//     ) {
//       return res.status(202).json({
//         success: false,
//         message: "남성회원은 회원가입하실수 없습니다"
//       });
//     }

//     User.find({ id: I_account.response.unique_key, status: "ALIVE" }, (err, idCheck) => {
//       //sign up
//       if (!idCheck.length) {

//         File.find({ use_for: 'default_user_image' }, async (err, image) => {
//           //닉네임 생성
//           const nickName = await generateNickname()
//           //저장될 유저정보
//           const user = new User({
//             ...req.body,
//             web_path: image[Math.floor(Math.random() * image.length)].web_path,
//             nickname: nickName,
//             id: I_account.response.unique_key,
//             status: "ALIVE"
//             // fcm_token:req.body.fcm_token
//           });
//           user.save((err, user) => {
//             // console.log(req.body);
//             if (err) return res.json({ success: false, err });
//             user
//               .generateToken()
//               .then((user) => {
//                 return res.cookie("x_auth", user.token).status(200).json({
//                   success: true,
//                   token: user.token,
//                   _id: user._id,
//                   nickname: user.nickname,
//                   web_path: user.web_path,
//                   f_message: "signUp"
//                 });
//               })
//           });
//         })
//       }
//       //sign in
//       else {
//         User.findOne({ id: I_account.response.unique_key }, (err, user) => {
//           if (err) throw err;
//           if (!user)
//             return res.json({
//               success: false,
//               message: "유저가 없습니다",
//             });
//           User.findOneAndUpdate(
//             { _id: user._id },
//             { $set: { ...req.body } },
//             (err, content) => {
//               user
//                 .generateToken()
//                 .then((user) => {
//                   return res.cookie("x_auth", user.token).status(200).json({
//                     success: true,
//                     token: user.token,
//                     _id: user._id,
//                     nickname: user.nickname,
//                     web_path: user.web_path,
//                     f_message: "signIn"
//                   });
//                 })
//                 .catch((err) => res.status(400).send(err));
//             }
//           );
//         });
//       }
//     })
//   }
// }

userController.my_topic_list = (req, res) => {
  const _id = req.decoded._id
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);
  Topic.find(
    { user_id: _id },
    ["topic_id", "topic_name", "title", "content", "view_count", "like_count", "comment_count", "_id", "like_user"],
    { limit: listLength, skip: (index - 1) * listLength, sort: { _id: -1 } },
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.length == 0) return res.json({ success: false, message: "NoResult" })
      else {
        User.findOne(
          { _id: _id },
          ["topic_nickname"],
          (err, user) => {
            data.forEach(element => {
              element.user_info = user
              console.log(element)
              if (element.like_user && element.like_user.length > 0) {
                const j_like = JSON.parse(JSON.stringify(element.like_user))
                const like_state = j_like.some(it => it.user_id.includes(_id.toString()));
                element.like_state = like_state
              } else {
                element.like_state = false
              }
            });
            return res.json({ success: true, data: data })

          }
        )
      }
    }
  ).lean()
}

userController.my_topic_comment_list = (req, res) => {
  const _id = req.decoded._id
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);
  Topic.find(
    { "comment_array.user_id": _id },
    ["user_id", "depth", "topic_id", "topic_name", "title", "content", "view_count", "like_count", "comment_count", "_id", "comment_array"],
    { limit: listLength, skip: (index - 1) * listLength, sort: { _id: -1 } },
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.length == 0) return res.json({ success: false, message: "NoResult" })
      else {
        for (let i = 0; i < data.length; i++) {
          //topic user info
          const topic_idArray = []
          data.forEach(element => {
            topic_idArray.push({ _id: element.user_id })
          });
          User.find(
            { $or: topic_idArray },
            ["_id", "topic_nickname", "profile_web_path"],
            (err, user) => {
              if (!user || user.length == 0) return res.json({ success: false, message: "NoResult" })
              const j_comment_list = data
              const j_data = user

              const returnArray = j_comment_list.map((j_comment) => {
                const found = j_data.find((j_data) => {
                  if (j_data._id.toString() == j_comment.user_id.toString()) {
                    j_comment.user_info = j_data
                  }
                });
                return { ...j_comment, ...found };
              });
              data = returnArray



            }
          ).lean()

          //topic comment
          const temp_comment_array = data[i].comment_array
          data[i].comment_array = data[i].comment_array.filter((item, index) => {
            item.registered = registered(item._id)
            item.like_state = false
            if (item.user_id == _id) {
              if (item.like_user && item.like_user.length > 0) {
                const j_like = JSON.parse(JSON.stringify(item.like_user))
                const like_state = j_like.some(it => it.user_id.includes(_id.toString()));
                item.like_state = like_state
              }
              return true
            } else if (temp_comment_array[index].user_id != _id && temp_comment_array[index].depth == 1) {
              for (let a = index; a < temp_comment_array.length; a++) {
                if (temp_comment_array[a].user_id == _id) {
                  if (item.like_user && item.like_user.length > 0) {
                    const j_like = JSON.parse(JSON.stringify(item.like_user))
                    const like_state = j_like.some(it => it.user_id.includes(_id.toString()));
                    item.like_state = like_state
                  }
                  return true
                }
              }
            }
          })

          //topic comment user info
          const idArray = []
          data[i].comment_array.forEach(element => {
            idArray.push({ _id: element.user_id })
          });
          User.find(
            { $or: idArray },
            ["_id", "topic_nickname", "profile_web_path"],
            (err, user) => {
              if (!user || user.length == 0) return res.json({ success: false, message: "NoResult" })
              const j_comment_list = data[i].comment_array
              const j_data = user

              const returnArray = j_comment_list.map((j_comment) => {
                const found = j_data.find((j_data) => {
                  if (j_data._id.toString() == j_comment.user_id.toString()) {
                    j_comment.user_info = j_data
                  }
                });
                return { ...j_comment, ...found };
              });
              data[i].comment_array = returnArray

              if (i + 1 == data.length)
                return res.json({ success: true, data: data })

            }
          ).lean()
        }



      }
    }
  ).lean()
}
userController.my_score_list = (req, res) => {
  const _id = req.decoded._id
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);
  // console.log(_id)
  Hashtag.find(
    { "score_array.user_id": _id },
    ["score_array", "_id", "tag", "use_user"],
    {},
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.length == 0) return res.json({ success: false, message: "NoResult" })
      else {
        let temp_score_array = []
        for (let i = 0; i < data.length; i++) {
          data[i].score_array.forEach(element => {
            // console.log(element.user_id)
            if (element.user_id == _id) {
              element.registered = registered(element._id)
              element.tag_id = data[i]._id
              element.tag = data[i].tag
              element.use_user = data[i].use_user
              temp_score_array.push(element)
            }
          });
        }
        //sort DESC
        temp_score_array = temp_score_array.sort((a, b) => {
          if (new Date(a.registered).getTime() > new Date(b.registered).getTime()) {
            return -1
          }
          if (new Date(a.registered).getTime() < new Date(b.registered).getTime()) {
            return 1
          }
          return 0;
        })

        let returnArray = slideArr(temp_score_array, listLength, index)
        if (returnArray.length == 0) return res.json({ success: false, message: "NoResult" })


        const idArray = []
        returnArray.forEach(element => {
          idArray.push({ _id: element.use_user[0].bringup_id })
        });
        Bringup.find(
          { $or: idArray },
          ["file_array"],
          (err, bringup) => {
            if (!bringup || bringup.length == 0) return res.json({ success: false, message: "NoResult" })
            const j_comment_list = returnArray
            const j_data = bringup
            returnArray = j_comment_list.map((j_comment) => {
              const found = j_data.find((j_data) => {
                if (j_data._id.toString() == j_comment.use_user[0].bringup_id.toString()) {
                  j_comment.item_image = j_data.file_array[0].image_object.web_path
                  delete j_comment.use_user
                }
              });
              return { ...j_comment, ...found };
            });

            return res.json({ success: true, data: returnArray })

          }
        ).lean()


        // User.findOne(
        //   { _id: _id },
        //   ["topic_nickname"],
        //   (err, user) => {
        //     data.forEach(element => {
        //       element.user_info = user
        //     });
        //     return res.json({ success: true, data: data })

        //   }
        // )
      }
    }
  ).lean()
}

userController.feed_info = (req, res) => {
  const _id = req.decoded._id
  const user_id = req.params.user_id
  User.findOne(
    { _id: user_id },
    ["_id", "nickname", "profile_web_path", "children_list", "follower_list", "follower_count", "following_list", "following_count", "info_comment"],

  ).exec().then(data => {
    // console.log(data)
    // console.log(data)
    const j_data = JSON.parse(JSON.stringify(data))
    if (j_data.children_list)
      j_data.children_list.forEach(item => {
        if (item.rep == true) {
          j_data.rep_children_open = item.open
          j_data.rep_children_rel = item.relationship
          j_data.rep_children_bir = item.children_birthday
          j_data.children_list = item
        }
      })
    j_data.follow_state = j_data.follower_list.some(item => item.user_id = _id)

    // delete j_data.children_list
    delete j_data.follower_list
    delete j_data.following_list

    // console.log(user_id)
    Bringup.find(
      { user_id: user_id, status: "ALIVE" },
      (err, feed_count) => {
        j_data.feed_count = feed_count.length


        if (_id == user_id)
          j_data.my_content = true
        else
          j_data.my_content = false
        return res.json({ success: true, data: j_data })
      }
    )

  })

}
userController.feed_list = (req, res) => {
  const _id = req.decoded._id
  const user_id = req.params.user_id
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);

  // console.log(user_id)
  Bringup.find(
    { user_id: user_id, status: "ALIVE" },
    ["_id", "file_array", "content", "like_count", "like_user", "user_id"],
    { limit: listLength, skip: (index - 1) * listLength },
    (err, data) => {
      // console.log(data)
      if (err) return res.json({ success: false, err });
      if (!data) return res.json({ success: false, message: "NoResult" });
      else {
        data.forEach(element => {
          element.like_state = false
          element.like_user.find(it => {
            if (_id == it.user_id.toString())
              element.like_state = true
          })
          delete element.like_user
          element.time_registered = registered(element._id)
        });

        return res.json({ success: true, data: data })
      }

    }
  ).sort({ _id: -1 }).lean()
}

userController.follow = (req, res) => {
  const _id = req.decoded._id
  const user_id = req.body.user_id
  // console.log(_id)
  // console.log(user_id)

  User.findOne({ _id: _id, "following_list.user_id": user_id }, (err, data) => {
    if (err) return res.json({ success: false, err });
    let following_update_obj
    let follower_update_obj
    let message
    if (data == null) { //이웃맺기
      following_update_obj = {
        $push: { following_list: { user_id: user_id } },
        $inc: { following_count: 1 }
      }
      follower_update_obj = {
        $push: { follower_list: { user_id: _id } },
        $inc: { follower_count: 1 }
      }
      message = "이웃맺기 완료"
    } else {
      following_update_obj = {
        $pull: { following_list: { user_id: user_id } },
        $inc: { following_count: -1 }
      }
      follower_update_obj = {
        $pull: { follower_list: { user_id: _id } },
        $inc: { follower_count: -1 }
      }
      message = "이웃맺기 취소"
    }
    User.findOneAndUpdate(
      { _id: _id },
      following_update_obj,

      (err, data) => {
        if (err) res.json({ succees: false, message: "실패", data: err })
        if (!data) res.json({ succees: false, message: "실패" })
        User.findOneAndUpdate(
          { _id: user_id },
          follower_update_obj,
          { new: true },
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
    )
  })
}

userController.ban = (req, res) => {
  const _id = req.decoded._id
  const user_id = req.body.user_id
  // console.log(_id)
  // console.log(user_id)

  User.findOne({ _id: _id, "ban_list.user_id": user_id }, (err, data) => {
    if (err) return res.json({ success: false, err });
    let ban_update_obj
    let message
    if (data == null) {
      ban_update_obj = {
        $push: { ban_list: { user_id: user_id } },
        $inc: { ban_count: 1 }
      }
      message = "차단 완료"
    } else {
      ban_update_obj = {
        $pull: { ban_list: { user_id: user_id } },
        $inc: { ban_count: -1 }
      }
      message = "차단 취소"
    }
    User.findOneAndUpdate(
      { _id: _id },
      ban_update_obj,
      { upsert: true },
      (err, data) => {
        if (err) res.json({ succees: false, message: "실패", data: err })
        if (!data) res.json({ succees: false, message: "실패" })
        return res.status(200).json({
          success: true,
          message: message,
          data: null,


        })
      }
    )
  })
}

userController.children_open = (req, res) => {
  const _id = req.decoded._id
  const index_array = req.body.array_no
  User.findOne(
    { _id: _id, "children_list": { $elemMatch: { array_no: index_array } } },
    (err, data) => {
      if (!data) return res.json({ succees: false, message: "존재하지않습니다" })
      const children_list = JSON.parse(JSON.stringify(data.children_list))
      children_list.filter((item) => {
        if (item.array_no == index_array && item.open == true)
          item.open = false
        else
          item.open = true
      })
      data.children_list = children_list

      User.findOneAndUpdate(
        { _id: _id },
        { $set: { "children_list": children_list } },
        { new: true, upsert: true },
        (err, user) => {
          if (err)
            res.json({ succees: false, message: "수정에 실패하였습니다", data: err })
          res.json({ success: true, message: "수정에 성공하였습니다", data: null })
        }
      )
    }
  )

}
userController.children_rep = (req, res) => {
  const _id = req.decoded._id
  const index_array = req.body.array_no
  User.findOne(
    { _id: _id, "children_list": { $elemMatch: { array_no: index_array } } },
    (err, data) => {
      if (!data) return res.json({ succees: false, message: "존재하지않습니다" })
      // //유저그룹
      // let target_group = get_user_group(req.body.children_birthday)
      // children_list.user_group = target_group

      //대표변경
      let children_birthday
      let children_gender
      const children_list = JSON.parse(JSON.stringify(data.children_list))
      children_list.filter((item) => {
        if (item.array_no == index_array) {
          item.rep = true
          children_birthday = item.children_birthday
          children_gender = item.children_gender
        }
        else
          item.rep = false
      })
      data.children_list = children_list

      // //유저그룹
      let target_group
      if (children_birthday)
        target_group = get_user_group(children_birthday)
      else
        target_group = "A"
      if (children_gender == "M" && target_group != null)
        target_group = target_group + 1
      else if (children_gender == "W" && target_group != null)
        target_group = target_group + 2

      User.findOneAndUpdate(
        { _id: _id },
        { $set: { "children_list": children_list, "user_group": target_group } },
        { new: true, upsert: true },
        (err, user) => {
          if (err)
            res.json({ succees: false, message: "수정에 실패하였습니다", data: err })
          res.json({ success: true, message: "수정에 성공하였습니다", data: null })
        }
      )
    }
  )
}
userController.location = (req, res) => {
  const user_id = req.decoded._id
  const sido_no = req.body.sido_no
  const sido_value = req.body.sido_value
  const sigungu_no = req.body.sigungu_no
  const sigungu_value = req.body.sigungu_value
  User.findOneAndUpdate(
    { _id: user_id },
    {
      $set: {
        sido_no: sido_no,
        sido_value: sido_value,
        sigungu_no: sigungu_no,
        sigungu_value: sigungu_value,
      }
    },
    { upsert: true },
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data) return res.json({ success: false, message: "NoResult" })
      return res.status(200).json({
        success: true,
        message: "수정 완료"
      });
    }
  )
}

userController.bring_up_register = async (req, res) => {
  const _id = req.decoded._id
  console.log(_id)
  // console.log(req.body)


  User.findOne({ _id: _id }).then((user) => {
    const array_no = user.children_list.length == 0 ? 1 : Number((user.children_list[(user.children_list).length - 1]).array_no) + 1

    const data = {
      array_no: array_no.toString()
    }
    // if (req.body.sido_no != null)
    //   data.sido_no = req.body.sido_no
    // if (req.body.sido_value != null)
    //   data.sido_value = req.body.sido_value
    // if (req.body.sigungu_no != null)
    //   data.sigungu_no = req.body.sigungu_no
    // if (req.body.sigungu_value != null)
    //   data.sigungu_value = req.body.sigungu_value
    if (req.body.relationship != null)
      data.relationship = req.body.relationship
    if (req.body.children_name != null)
      data.children_name = req.body.children_name
    if (req.body.children_gender != null)
      data.children_gender = req.body.children_gender
    if (req.body.children_image_id != null && req.body.children_image_web_path != null) {
      data.children_image_id = req.body.children_image_id
      data.children_image_web_path = req.body.children_image_web_path
    }



    let target_group = ""
    if (req.body.children_birthday != null) {
      data.children_birthday = req.body.children_birthday
      target_group = get_user_group(req.body.children_birthday)
      if (req.body.children_gender == "M" && target_group != null)
        target_group = target_group + 1
      else if (req.body.children_gender == "W" && target_group != null)
        target_group = target_group + 2
    } else
      target_group = "A"



    let updateData
    if (user.children_list.length == 0) {
      data.rep = true
      updateData = {
        $push: { children_list: data },
        $set: { user_group: target_group }
      }
    } else {
      data.rep = false
      updateData = {
        $push: { children_list: data },
      }
    }
    User.updateOne(
      { _id: _id },
      updateData,
      (err, user) => {
        if (err)
          res.json({ succees: false, message: "등록에 실패하였습니다", data: err })
        res.json({ success: true, message: "등록에 성공하였습니다", data: null })
      })
  }

  )

}
userController.bring_up_get = (req, res) => {
  const _id = req.decoded._id
  User.findOne(
    { _id: _id, },
    ["children_list", "-_id"],
    { new: true, upsert: true },
    (err, user) => {
      if (err)
        res.json({ succees: false, data: err })
      res.json({ success: true, data: user })
    }
  )
}

userController.bring_up_update = (req, res) => {
  const _id = req.decoded._id
  const index_array = req.body.array_no
  // console.log(index_array)
  // console.log(req.body)
  User.findOneAndUpdate(
    { _id: _id, "children_list": { $elemMatch: { array_no: index_array } } },
    { $set: { "children_list.$": req.body } },
    { new: true, upsert: true },
    (err, user) => {
      if (err)
        res.json({ succees: false, message: "수정에 실패하였습니다", data: err })
      res.json({ success: true, message: "수정에 성공하였습니다", data: null })
    }
  )
}

userController.bring_up_delete = (req, res) => {
  const _id = req.decoded._id
  const index_array = req.body.array_no
  // console.log(index_array)
  // console.log(req.body)
  User.findOneAndUpdate(
    { _id: _id, "children_list": { $elemMatch: { array_no: index_array } } },
    { $pull: { "children_list": { array_no: index_array } } },
    { new: true, upsert: true },
    (err, user) => {
      if (err) {
        return res.json({ succees: false, message: "삭제에 실패하였습니다", data: err })
      }
      res.json({ success: true, message: "삭제에 성공하였습니다", data: null })
    }
  )
}




userController.social_signUp = (req, res) => {
  Etc.findOne({ key: 'default_user_image' }, async (err, image) => {
    if (req.body.nickname == undefined) return res.json({
      success: false,
      errors: [
        {
          msg: "Invalid value",
          param: "nickname",
          location: "body"
        }
      ]
    })
    //   //iam port access process
    const T_body = { 'imp_key': process.env.IMP_KEY, 'imp_secret': process.env.IMP_SECRET }
    const return_token = await post_body(process.env.GET_TOKEN_URL, T_body)
    const access_token = JSON.parse(return_token.body)
    if (access_token.code != 0) {
      return res.status(202).json({
        success: false,
        message: "인증오류"
      });
    } else {

      const I_headers = { "Authorization": access_token.response.access_token }
      const return_account = await get_h(process.env.IMP_CERTIFICATION + "/" + req.body.imp_uid, I_headers)
      const I_account = JSON.parse(return_account.body)
      // console.log(I_account)
      if (I_account.code != 0) {
        return res.status(202).json({
          success: false,
          message: "인증오류"
        });
      } else {
        User.findOne(
          { unique_key: I_account.response.unique_key },
          (err, data) => {
            // 테스팅용주석
            // if (data) res.json({ success: false, message: "이미 가입된 회원입니다" })
            // else {
            //회원가입
            const user = new User({
              social_key: req.body.social_key,
              social_value: req.body.social_value,
              id: req.body.social_key + "@" + req.body.social_value,
              password: req.body.social_key + "@" + req.body.social_value,
              nickname: req.body.nickname,
              topic_nickname: req.body.nickname,
              fcm_token: req.body.fcm_token,
              os: req.body.os,
              version: req.body.version,
              unique_key: I_account.response.unique_key,
              imp_uid: req.body.imp_uid,
              gender: I_account.response.gender,
              name: I_account.response.name,
              birthday: I_account.response.birthday,
              // phone: "01012345678",
            });
            // console.log(image)
            if (req.body.profile_image_id && req.body.profile_web_path) {
              user.profile_web_path = req.body.profile_web_path
              user.profile_image_id = req.body.profile_image_id
            } else {
              user.profile_web_path = image.value_string
              user.profile_image_id = image.value_string2
            }
            user.save(async (err, user) => {
              // console.log(req.body);
              if (err) {
                if (err.errors.nickname)
                  return res.json({ success: false, message: "닉네임이 중복되었습니다", err: err });
                else
                  return res.json({ success: false, err: err });
              }
              const token = await user.generateToken()
              return res.status(200).json({
                success: true,
                token: token,
                f_message: "signUp",
                user
              });
            });
          }
          // }
        )

      }
    }


  }).lean()

};
userController.social_signIn = (req, res) => {
  User.findOne({ social_key: req.body.social_key, social_value: req.body.social_value }, async (err, user) => {
    if (err) res.json;
    if (!user)
      return res.json({
        success: false,
        message: "존재하지 않는 회원입니다",
      });


    const token = await user.generateToken()

    //fcm_token / os / version
    User.findOneAndUpdate(
      { _id: user._id },
      {
        $set:
        {
          fcm_token: req.body.fcm_token,
          os: req.body.os,
          version: req.body.version,
        }
      }
    )

    return res.status(200).json({
      success: true,
      token: token,
      f_message: "signIn",
      user
    });
  });
}

userController.sign = (req, res) => {
  //아이디 중복검사
  if (req.body.type == "signIn") {
    //로그인
    User.findOne({ id: req.body.id }, async (err, user) => {
      if (err) res.json;
      if (!user)
        return res.json({
          success: false,
          message: "아이디 또는 비밀번호를 확인해주세요",
        });


      bcrypt.compare(req.body.password, user.password, async (err, data) => {
        if (err) return res.json({ success: false, err: err })
        if (!data) return res.json({ success: false, message: "아이디 또는 비밀번호를 확인해주세요" })
        const token = await user.generateToken()

        //fcm_token / os / version
        User.findOneAndUpdate(
          { _id: user._id },
          {
            $set:
            {
              fcm_token: req.body.fcm_token,
              os: req.body.os,
              version: req.body.version,
            }
          }
        )

        return res.status(200).json({
          success: true,
          token: token,
          f_message: "signIn",
          user
        });
      })
    });
  } else if (req.body.type == "signUp") {
    Etc.findOne({ key: 'default_user_image' }, async (err, image) => {
      if (req.body.nickname == undefined) return res.json({
        success: false,
        errors: [
          {
            msg: "Invalid value",
            param: "nickname",
            location: "body"
          }
        ]
      })
      //   //iam port access process
      const T_body = { 'imp_key': process.env.IMP_KEY, 'imp_secret': process.env.IMP_SECRET }
      const return_token = await post_body(process.env.GET_TOKEN_URL, T_body)
      const access_token = JSON.parse(return_token.body)
      if (access_token.code != 0) {
        return res.status(202).json({
          success: false,
          message: "인증오류"
        });
      } else {

        const I_headers = { "Authorization": access_token.response.access_token }
        const return_account = await get_h(process.env.IMP_CERTIFICATION + "/" + req.body.imp_uid, I_headers)
        const I_account = JSON.parse(return_account.body)
        // console.log(I_account)
        if (I_account.code != 0) {
          return res.status(202).json({
            success: false,
            message: "인증오류"
          });
        } else {
          User.findOne(
            { unique_key: I_account.response.unique_key },
            (err, data) => {
              // 테스팅용주석
              // if (data) res.json({ success: false, message: "이미 가입된 회원입니다" })
              // else {
              //회원가입
              const user = new User({
                id: req.body.id,
                password: req.body.password,
                nickname: req.body.nickname,
                topic_nickname: req.body.nickname,
                fcm_token: req.body.fcm_token,
                os: req.body.os,
                version: req.body.version,
                unique_key: I_account.response.unique_key,
                imp_uid: req.body.imp_uid,
                gender: I_account.response.gender,
                name: I_account.response.name,
                birthday: I_account.response.birthday,
                // phone: "01012345678",
              });
              // console.log(image)
              if (req.body.profile_image_id && req.body.profile_web_path) {
                user.profile_web_path = req.body.profile_web_path
                user.profile_image_id = req.body.profile_image_id
              } else {
                user.profile_web_path = image.value_string
                user.profile_image_id = image.value_string2
              }
              user.save(async (err, user) => {
                // console.log(req.body);
                if (err) {
                  if (err.errors.id)
                    return res.json({ success: false, message: "아이디가 중복되었습니다", err: err });
                  else if (err.errors.nickname)
                    return res.json({ success: false, message: "닉네임이 중복되었습니다", err: err });
                  else
                    return res.json({ success: false, err: err });
                }
                const token = await user.generateToken()
                return res.status(200).json({
                  success: true,
                  token: token,
                  f_message: "signUp",
                  user
                });
              });
              // }
            }
          )

        }
      }


    }).lean()
  }
};

// userController.signIn = (req, res) => {
//   // console.log(req.body.id)
//   User.findOne({ id: req.body.id }, (err, user) => {
//     if (err) throw err;
//     if (!user || req.body.id != "xYHcWne0ySA/PWc1GDpFtFWkg3YyGG2nWP0ilF2xGcs0lVEda1lkmli4A4JdcZ00ZK2bHuzCbVrEnQjtU/NoVA==")
//       return res.json({
//         success: false,
//         message: "유저가 없습니다",
//       });
//     // bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
//     //   if (err) return err;
//     //   console.log(isMatch);
//     // });

//     // if (!user.comparePassword(req.body.password)) return console.log(err);
//     // user.comparePassword(req.body.password, (err, isMatch) => {
//     //   if (!isMatch) return res.json({ success: false, message: "비밀번호오류" });
//     // });

//     // if (!user.comparePassword(req.body.password)) {
//     //   return res.json({ success: false, message: "비밀번호오류" });
//     // } else {
//     user
//       .generateToken()
//       .then((user) => {
//         return res.cookie("x_auth", user.token).status(200).json({
//           success: true,
//           user_id: user._id,
//           token: user.token,
//           auth_no: user.auth_no,
//           nickname: user.nickname,
//           web_path: user.web_path,
//         });
//       })
//       .catch((err) => res.status(400).send(err));
//     // return res.json({ success: true });
//     // }
//   });
// };

userController.auth = (req, res) => {
  let token = req.cookies.x_auth;
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      req.user = user;
      res.json(user);
    })
    .catch((err) => {
      throw err;
    });
};

userController.refresh = (req, res) => {
  // console.log("refresh")
  // console.log(req.body)
  // let token = req.cookies.x_auth;
  let token = req.headers.authorization;
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      User.findOneAndUpdate(
        { _id: user._id },
        { $set: { ...req.body } },
        (err) => {
          user.generateToken().then((user) => {
            return res.cookie("x_auth", user.token).status(200).json({
              success: true,
              nickname: user.nickname,
              web_path: user.web_path,
              _id: user._id
              // token: user.token,
            });
          });
        }
      )
    })
    .catch((err) => {
      throw err;
    });
};
userController.push_state = (req, res) => {
  const user_id = req.decoded._id
  User.findOne(
    { _id: user_id },
    ["-_id", "topic_push", "bringup_push", "message_push"],
    (err, user) => {
      if (err) return res.json({ success: false, err: err })
      if (!user) return res.json({ success: false, message: "NoResult" })
      return res.json({ success: true, data: user })
    })

}
userController.push_state_update = (req, res) => {
  const user_id = req.decoded._id
  const type = req.body.type
  User.findOne(
    { _id: user_id },
    ["-_id", "topic_push", "bringup_push", "message_push"],
    (err, user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      let set = {}
      let message
      if (type == "bringup") {
        set = { bringup_push: !user.bringup_push }
        message = user.bringup_push ? '알림이 취소되었습니다' : '알림이 설정되었습니다'
      } else if (type == "topic") {
        set = { topic_push: !user.topic_push }
        message = user.topic_push ? '알림이 취소되었습니다' : '알림이 설정되었습니다'
      } else if (type == "message") {
        set = { message_push: !user.message_push }
        message = user.message_push ? '알림이 취소되었습니다' : '알림이 설정되었습니다'
      }
      User.findOneAndUpdate(
        { _id: user_id },
        { $set: set },
        (err) => {
          if (err) return res.json({ success: false, err: err })
          return res.status(200).json({
            success: true,
            message: message
          });
        }
      );
    }
  )


  // User.findOneAndUpdate(
  //   { _id: user._id },
  //   { $set: { [push_type]: !user[push_type] } },
  //   (err, content) => {
  //     if (err) throw err;
  //     return res.status(200).json({
  //       success: true,
  //       message: user[push_type] ? '알림이 취소되었습니다' : '알림이 설정되었습니다',
  //       data: push_type,
  //     });
  //   }
  // );
}

userController.list = (req, res) => {
  User.find({}, (err, usr) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: usr,
    });
  });
};

userController.delete = (req, res) => {
  return User.findByIdAndDelete({ _id: req.params.id }, (err, usr) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
    });
  });
};

userController.detail = (req, res) => {
  let token = req.headers.authorization;
  User.findByToken(token)
    .then((user) => {
      return User.findOne({ _id: user._id }, (err, userInfo) => {
        if (err) throw err;
        return res.status(200).json({
          success: true,
          data: userInfo,
        });
      });
    })
};

userController.search = (req, res) => {
  const search = new RegExp(req.params.nickname.toLowerCase());
  User.find(
    { nickname: { $regex: search } },
    ["_id", "nickname", "profile_web_path", "children_list"],
    (err, usr) => {
      if (err) throw err;
      if (!usr) return res.json({ success: false, message: "NoResult" })
      for (let i = 0; i < usr.length; i++) {
        const rep_children_info = usr[i].children_list.filter(item => { if (item.rep == true) return true })
        if (rep_children_info[0])
          usr[i].rep_children_info = rep_children_info[0]
        else
          usr[i].rep_children_info = null
        delete usr[i].children_list
        if (i + 1 == usr.length)
          return res.status(200).json({
            success: true,
            data: usr,
          });
      }

    }).lean();
};

userController.nickname_update = (req, res) => {
  const user_id = req.decoded._id
  const nickname = req.body.nickname
  User.findOneAndUpdate(
    { _id: user_id },
    { $set: { nickname: nickname } },
    // { new: true },
    (err, data) => {
      if (err) throw err;
      if (!data) return res.json({ success: false, message: "NoResult" })
      return res.status(200).json({
        success: true,
        message: "수정 완료"
      });
    }
  )
}
userController.topic_nickname_update = (req, res) => {
  const user_id = req.decoded._id
  const topic_nickname = req.body.topic_nickname
  User.findOneAndUpdate(
    { _id: user_id },
    { $set: { topic_nickname: topic_nickname } },
    { upsert: true },
    (err, data) => {
      if (err) throw err;
      if (!data) return res.json({ success: false, message: "NoResult" })
      return res.status(200).json({
        success: true,
        message: "수정 완료"
      });
    }
  )
}

userController.profile_update = (req, res) => {
  const user_id = req.decoded._id
  const image_id = req.body._id
  File.findOne(
    { _id: image_id },
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data) return res.json({ success: false, message: "NoFile" })
      User.findOneAndUpdate(
        { _id: user_id },
        {
          $set: {
            profile_image_id: image_id,
            profile_web_path: data.web_path
          }
        },
        // { new: true },
        (err, data) => {
          if (err) throw err;
          if (!data) return res.json({ success: false, message: "NoResult" })
          return res.status(200).json({
            success: true,
            message: "수정 완료"
          });
        }
      )
    }
  ).lean()
}

userController.greeting_update = (req, res) => {
  const user_id = req.decoded._id
  const greeting = req.body.greeting
  User.findOneAndUpdate(
    { _id: user_id },
    { $set: { info_comment: greeting } },
    { upsert: true },
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data) return res.json({ success: false, message: "NoResult" })
      return res.status(200).json({
        success: true,
        message: "수정 완료"
      });
    }
  )
}

userController.follower_list = (req, res) => {
  const user_id = req.decoded._id
  const listLength = req.query.listLength || 10;
  const index = req.query.index;
  User.findOne(
    { _id: user_id },
    ["follower_list", "-_id", "following_list"],
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.follower_list == undefined || data.follower_list.length == 0) return res.json({ success: false, message: "NoResult" })
      const follower_list = slideArr(data.follower_list, listLength, index)
      if (follower_list.length == 0) return res.json({ success: false, message: "NoResult" })
      const idArray = []
      follower_list.forEach(element => {
        idArray.push({ _id: element.user_id })
      });
      // console.log(data.follower_list)

      User.find(
        { $or: idArray },
        ["_id", "nickname", "profile_web_path", "info_comment", "follower_list"],
        (err, user) => {
          if (err) return res.json({ success: false, err: err })
          if (!user) return res.json({ success: false, message: "NoResult" })

          const returnArray = data.follower_list.map((element) => {
            const found = user.find((user) => {
              if (user._id.toString() == element.user_id.toString()) {
                element.nickname = user.nickname
                element.profile_web_path = user.profile_web_path
                if (user.info_comment == undefined)
                  element.info_comment = ""
                else
                  element.info_comment = user.info_comment

                // console.log("user_id")
                // console.log(user_id)

                // console.log("user.follower_list")
                // console.log(user.follower_list)
                if (data.following_list != undefined) {
                  element.neighbor_state =
                    data.following_list.some(item => {
                      return item.user_id.toString() == element.user_id.toString()
                    })
                } else {
                  element.neighbor_state = false
                }
              }
            });
            return { ...element, ...found };
          });


          return res.status(200).json({
            success: true,
            data: returnArray
          });
        }
      ).lean()
    }
  ).lean()
}
userController.following_list = (req, res) => {
  const user_id = req.decoded._id
  const listLength = req.query.listLength || 10;
  const index = req.query.index;
  User.findOne(
    { _id: user_id },
    ["following_list", "-_id"],
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.following_list == undefined || data.following_list.length == 0) return res.json({ success: false, message: "NoResult" })
      const following_list = slideArr(data.following_list, listLength, index)
      if (following_list.length == 0) return res.json({ success: false, message: "NoResult" })
      const idArray = []
      following_list.forEach(element => {
        idArray.push({ _id: element.user_id })
      });

      User.find(
        { $or: idArray },
        ["_id", "nickname", "profile_web_path", "info_comment", "following_list"],
        (err, user) => {
          if (err) return res.json({ success: false, err: err })
          if (!user) return res.json({ success: false, message: "NoResult" })

          const returnArray = data.following_list.map((element) => {
            const found = user.find((user) => {
              if (user._id.toString() == element.user_id.toString()) {
                element.nickname = user.nickname
                element.profile_web_path = user.profile_web_path
                if (user.info_comment == undefined)
                  element.info_comment = ""
                else
                  element.info_comment = user.info_comment

                if (user.following_list != undefined) {
                  element.neighbor_state =
                    user.following_list.some(item => {
                      return item.user_id == user_id
                    })
                } else {
                  element.neighbor_state = false
                }
              }
            });
            return { ...element, ...found };
          });


          return res.status(200).json({
            success: true,
            data: returnArray
          });
        }
      ).lean()
    }
  ).lean()
}
userController.ban_list = (req, res) => {
  const user_id = req.decoded._id
  const listLength = req.query.listLength || 10;
  const index = req.query.index;
  User.findOne(
    { _id: user_id },
    ["ban_list", "-_id"],
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.ban_list == undefined || data.ban_list.length == 0) return res.json({ success: false, message: "NoResult" })
      const ban_list = slideArr(data.ban_list, listLength, index)
      if (ban_list.length == 0) return res.json({ success: false, message: "NoResult" })
      const idArray = []
      ban_list.forEach(element => {
        idArray.push({ _id: element.user_id })
      });
      console.log(idArray)
      User.find(
        { $or: idArray },
        ["_id", "nickname", "profile_web_path", "info_comment"],
        (err, user) => {
          if (err) return res.json({ success: false, err: err })
          if (!user || user.length == 0) return res.json({ success: false, message: "NoResult" })
          console.log(user)

          const returnArray = data.ban_list.map((element) => {
            const found = user.find((user) => {
              if (user._id.toString() == element.user_id.toString()) {
                element.nickname = user.nickname
                element.profile_web_path = user.profile_web_path
                if (user.info_comment == undefined)
                  element.info_comment = ""
                else
                  element.info_comment = user.info_comment


              }
            });
            return { ...element, ...found };
          });


          return res.status(200).json({
            success: true,
            data: returnArray
          });
        }
      ).lean()
    }
  ).lean()
}
userController.locker = (req, res) => {
  const user_id = req.decoded._id
  const target_id = req.body.target_id
  const locker_obj = {
    bringup_id: target_id,
  }
  let target_model
  target_model = User
  target_model.findOne({ _id: user_id, "locker_bringup.bringup_id": target_id }, (err, data) => {
    if (err) return res.json({ success: false, err });
    let update_obj
    let message
    if (data == undefined || !data) {
      update_obj = {
        $push: { locker_bringup: locker_obj },
        // $inc: { like_count: 1 }
      }
      message = "저장 완료"
    } else {
      update_obj = {
        $pull: { locker_bringup: locker_obj },
        // $inc: { like_count: -1 }
      }
      message = "저장 취소"
    }
    target_model.findOneAndUpdate(
      { _id: user_id },
      update_obj,
      (err, data) => {
        if (err) return res.json({ succees: false, message: "실패", data: err })
        if (!data) return res.json({ succees: false, message: "실패" })
        return res.status(200).json({
          success: true,
          message: message,
          data: null,
        });
      }
    )

  })
}
userController.locker_list = (req, res) => {
  const _id = req.decoded._id
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);
  User.findOne(
    { _id: _id },
    ["locker_bringup"],
    (err, data) => {
      if (err) return res.json({ success: false, err: err })
      if (!data || data.length == 0) return res.json({ success: false, message: "NoResult" })
      else {
        if (!data.locker_bringup) return res.json({ success: false, message: "NoResult" })
        const reverse_locker = data.locker_bringup.reverse()
        const locker_list = slideArr(reverse_locker, listLength, index)

        const bringup_idArray = []
        locker_list.forEach(element => {
          bringup_idArray.push({ _id: element.bringup_id })
        });
        Bringup.find(
          { $or: bringup_idArray },
          ["file_array", "like_user", "like_count", "content", "user_id"],
          (err, bringup) => {
            if (!bringup || bringup.length == 0) return res.json({ success: false, message: "NoResult" })



            const idArray = []
            bringup.forEach(element => {
              idArray.push({ _id: element.user_id })
            });
            User.find(
              { $or: idArray },
              ["_id", "nickname", "profile_web_path", "children_list"],
              (err, user) => {
                const j_comment_list = bringup
                const j_data = user
                const bringup_list = j_comment_list.map((j_comment) => {
                  const found = j_data.find((j_data) => {
                    if (j_data._id.toString() == j_comment.user_id.toString()) {
                      j_comment.user_info = j_data
                    }
                  });
                  return { ...j_comment, ...found };
                });
                // console.log(bringup_list)

                for (let i = 0; i < bringup.length; i++) {
                  bringup[i].like_state = false
                  if (bringup[i].like_user)
                    bringup[i].like_user.find(it => {
                      if (_id == it.user_id.toString())
                        bringup[i].like_state = true
                    })
                  bringup[i].time_registered = registered(bringup[i]._id)

                  // });
                  if (i + 1 == bringup.length) {
                    const j_comment_list = locker_list
                    const j_data = bringup

                    const returnArray = j_comment_list.map((j_comment) => {
                      const found = j_data.find((j_data) => {
                        if (j_data._id.toString() == j_comment.bringup_id.toString()) {
                          j_comment.file_array = j_data.file_array
                          j_comment.like_state = j_data.like_state
                          j_comment.like_count = j_data.like_count
                          j_comment.content = j_data.content
                          j_comment.user_info = j_data.user_info
                          if (j_comment.user_info.children_list.length != 0) {
                            const rep_data = j_comment.user_info.children_list.filter(it => { if (it.rep == true) return true })
                            j_comment.rep_children_bir = rep_data[0].children_birthday
                            j_comment.rep_children_rel = rep_data[0].relationship
                            j_comment.rep_children_open = rep_data[0].open
                          }
                          j_comment.my_content = false
                          if (j_data.user_id == _id)
                            j_comment.my_content = true
                        }
                      });
                      return { ...j_comment, ...found };
                    });
                    return res.json({ success: true, data: returnArray })

                  }
                }
                // console.log(returnArray)
              }
            ).lean()





          }
        ).lean()
      }
    }
  ).lean()
}
userController.id_find = async (req, res) => {
  //iam port access process
  const T_body = { 'imp_key': process.env.IMP_KEY, 'imp_secret': process.env.IMP_SECRET }
  const return_token = await post_body(process.env.GET_TOKEN_URL, T_body)
  const access_token = JSON.parse(return_token.body)
  if (access_token.code != 0) {
    return res.status(202).json({
      success: false,
      message: "인증오류"
    });
  } else {

    const I_headers = { "Authorization": access_token.response.access_token }
    const return_account = await get_h(process.env.IMP_CERTIFICATION + "/" + req.body.imp_uid, I_headers)
    const I_account = JSON.parse(return_account.body)

    if (I_account.code != 0) {
      return res.status(202).json({
        success: false,
        message: "인증오류"
      });
    } else {
      const unique_key = I_account.response.unique_key

      User.findOne(
        { unique_key: unique_key },
        ["id"],
        (err, user) => {
          if (err) return res.json({ success: false, err: err })
          if (!user) return res.json({ success: false, message: "NoResult" })
          return res.json({ success: true, data: user })
        }

      )
    }
  }


}
userController.password_find = async (req, res) => {
  //iam port access process
  const T_body = { 'imp_key': process.env.IMP_KEY, 'imp_secret': process.env.IMP_SECRET }
  const return_token = await post_body(process.env.GET_TOKEN_URL, T_body)
  const access_token = JSON.parse(return_token.body)
  if (access_token.code != 0) {
    return res.status(202).json({
      success: false,
      message: "인증오류"
    });
  } else {

    const I_headers = { "Authorization": access_token.response.access_token }
    const return_account = await get_h(process.env.IMP_CERTIFICATION + "/" + req.body.imp_uid, I_headers)
    const I_account = JSON.parse(return_account.body)
    if (I_account.code != 0) {
      return res.status(202).json({
        success: false,
        message: "인증오류"
      });
    } else {
      const unique_key = I_account.response.unique_key

      User.findOne(
        { unique_key: unique_key },
        ["id"],
        (err, user) => {
          if (err) return res.json({ success: false, err: err })
          if (!user) return res.json({ success: false, message: "NoResult" })
          return res.json({ success: true, data: user })
        }

      )
    }
  }
}
userController.password_edit = async (req, res) => {
  const id = req.body.id
  let password = req.body.password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      password = hash;
      console.log(password)
      User.findOneAndUpdate(
        { id: id },
        { $set: { password: password } },
        { new: true },
        (err, data) => {
          if (err) return res.json({ success: false, err: err })
          if (!data) return res.json({ success: false, message: "NoResult" })
          return res.json({ success: true })
        }
      )
    });
  });

}


const get_user_group = (children_birthday) => {
  let target_group = ""
  const birthday = moment(children_birthday)
  const currentTime = moment()
  const diff_month = currentTime.diff(birthday, 'month')
  if (diff_month <= -5) target_group = "C"
  else if (diff_month > -5 && diff_month <= 0) target_group = "B"
  else if (diff_month > 1 && diff_month <= 3) target_group = "D"
  else if (diff_month > 3 && diff_month <= 6) target_group = "F"
  else if (diff_month > 9 && diff_month <= 12) target_group = "G"
  else if (diff_month > 12 && diff_month <= 24) target_group = "H"
  else if (diff_month > 24 && diff_month <= 36) target_group = "I"
  else if (diff_month > 36 && diff_month <= 48) target_group = "J"
  else if (diff_month > 48 && diff_month <= 60) target_group = "K"
  else if (diff_month > 60 && diff_month <= 72) target_group = "L"
  else if (diff_month > 72 && diff_month <= 84) target_group = "M"
  else if (diff_month > 84 && diff_month <= 96) target_group = "N"
  else if (diff_month > 96 && diff_month <= 108) target_group = "O"
  else if (diff_month > 108 && diff_month <= 120) target_group = "P"
  else if (diff_month > 120 && diff_month <= 132) target_group = "Q"
  else if (diff_month > 132 && diff_month <= 144) target_group = "R"
  else if (diff_month > 144 && diff_month <= 156) target_group = "S"
  else if (diff_month > 156 && diff_month <= 168) target_group = "T"
  else if (diff_month > 168 && diff_month <= 180) target_group = "U"
  else if (diff_month > 180 && diff_month <= 192) target_group = "V"
  else if (diff_month > 192 && diff_month <= 204) target_group = "W"
  else if (diff_month > 204 && diff_month <= 216) target_group = "X"
  else if (diff_month > 216 && diff_month <= 228) target_group = "Y"
  else if (diff_month > 228 && diff_month <= 240) target_group = "Z"
  else target_group = null

  return target_group
}

module.exports = userController;
