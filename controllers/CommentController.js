import dotenv from 'dotenv'
dotenv.config()
import request from 'request'

import Comment from "../models/Comment";
import Content from "../models/Content";
import Bringup from "../models/Bringup"
import User from "../models/User";
import Topic from "../models/Topic"

import { totalPage, slideArr, app_push, dateMoment, registered } from "../utils/utilsFunction";

let commentController = {};

commentController.comment_list = (req, res) => {
  const user_id = req.decoded._id
  const type = req.params.type
  const listLength = req.query.listLength;
  const index = req.query.index;
  if (type == "bringup") {
    Bringup.findOne({ _id: req.query.target_id },
      (err, comment) => {
        if (err) return res.json({ success: false, message: err })
        if (!comment) return res.json({ success: false, message: "NoResult" })
        const comment_list = slideArr(comment.comment_array, listLength, index)
        const comment_total = totalPage(comment.comment_array.length, listLength)
        const comment_lenth = comment.comment_array.length

        const idArray = []
        comment.comment_array.forEach(element => {
          idArray.push({ _id: element.user_id })
        });
        // console.log(idArray)

        User.find(
          { $or: idArray },
          ["_id", "nickname", "profile_web_path"],
          (err, data) => {
            // console.log(JSON.parse(JSON.stringify(data)))
            // console.log(comment_list)
            if (!data) return res.json({ success: false, message: "NoResult" })
            const j_comment_list = JSON.parse(JSON.stringify(comment_list))
            const j_data = JSON.parse(JSON.stringify(data))

            const returnArray = j_comment_list.map((j_comment) => {
              const found = j_data.find((j_data) => {
                if (j_data._id.toString() == j_comment.user_id.toString()) {
                  j_comment.user_info = j_data
                  j_comment.registered = registered(j_comment._id)
                  if (j_comment.like_user.length) {
                    const like_state = j_comment.like_user.filter(element => {
                      return element.user_id.toString() == user_id.toString()
                    })
                    if (like_state.length != 0) {
                      j_comment.like_state = true
                    } else {
                      j_comment.like_state = false
                    }
                  } else {
                    j_comment.like_state = false
                  }
                }
              });
              return { ...j_comment, ...found };
            });


            return res.status(200).json({
              success: true,
              data: {
                list: returnArray,
                total: comment_total,
                length: comment_lenth,
              },
            });
          }
        ).lean()

      });
  } else if (type == "topic") {
    Topic.findOne({ _id: req.query.target_id },
      (err, comment) => {
        if (err) return res.json({ success: false, message: err })
        if (!comment) return res.json({ success: false, message: "NoResult" })
        const comment_list = slideArr(comment.comment_array, listLength, index)
        const comment_total = totalPage(comment.comment_array.length, listLength)
        const comment_lenth = comment.comment_array.length

        const idArray = []
        comment.comment_array.forEach(element => {
          idArray.push({ _id: element.user_id })
        });
        // console.log(idArray)

        User.find(
          { $or: idArray },
          ["_id", "topic_nickname", "profile_web_path"],
          (err, data) => {
            // console.log(JSON.parse(JSON.stringify(data)))
            // console.log(comment_list)
            if (!data) return res.json({ success: false, message: "NoResult" })
            const j_comment_list = JSON.parse(JSON.stringify(comment_list))
            const j_data = JSON.parse(JSON.stringify(data))

            const returnArray = j_comment_list.map((j_comment) => {
              const found = j_data.find((j_data) => {
                if (j_data._id.toString() == j_comment.user_id.toString()) {
                  j_comment.user_info = j_data
                  j_comment.registered = registered(j_comment._id)
                  //my comment
                  console.log(user_id)
                  console.log(j_comment.user_id)
                  if (user_id == j_comment.user_id)
                    j_comment.my_comment = true
                  else
                    j_comment.my_comment = false
                  //like state
                  if (j_comment.like_user.length) {
                    const like_state = j_comment.like_user.filter(element => {
                      return element.user_id.toString() == user_id.toString()
                    })
                    if (like_state.length != 0) {
                      j_comment.like_state = true
                    } else {
                      j_comment.like_state = false
                    }
                  } else {
                    j_comment.like_state = false
                  }
                }
              });
              return { ...j_comment, ...found };
            });


            return res.status(200).json({
              success: true,
              data: {
                list: returnArray,
                total: comment_total,
                length: comment_lenth,
              },
            });
          }
        ).lean()

      });
  }

}

commentController.comment_insert = (req, res) => {
  const type = req.params.type
  const user_id = req.decoded._id
  const target_id = req.body.target_id
  const depth = req.body.depth
  const comment = {
    comment: req.body.comment,
    user_id: user_id,
    depth: depth
  }

  if (type == "bringup") {
    Bringup.findOne(
      { _id: target_id },
      (err, data) => {
        if (data == null) {//게시글없음
          return res.json({ success: false, message: "NoData" })
        } else {
          //depth 1

          let push_array = [];
          if (depth == 1) {
            push_array = comment
          } else {
            if (!req.body.upper_comment_id) return res.json({
              success: false, "errors": [
                {
                  "msg": "Invalid value",
                  "param": "upper_comment_id",
                  "location": "body"
                }
              ]
            })
            const upper_comment_id = req.body.upper_comment_id
            const index = data.comment_array.findIndex(x => x._id == upper_comment_id);
            if (index == -1) return res.json({ success: false, message: "index error" })
            push_array = {
              $each: [comment],
              $position: index + 1
            }
          }
          //app-push
          if (user_id != data.user_id) {
            app_push("bringup", data.user_id, comment.comment)
          }



          //update
          Bringup.findOneAndUpdate(
            { _id: target_id },
            {
              $push: { comment_array: push_array },
              $inc: { comment_count: 1 }
            },
            (err, data) => {
              if (err) res.json({ succees: false, data: err })
              if (data == null) res.json({ succees: false, message: "게시글이 존재하지 않습니다" })
              else
                return res.status(200).json({
                  success: true,
                  message: '댓글 작성 완료',
                  data: null,
                });
            }
          )
        }
      }
    )
  } else if (type == "topic") {
    Topic.findOne(
      { _id: target_id },
      (err, data) => {
        if (data == null) {//게시글없음
          return res.json({ success: false, message: "NoData" })
        } else {
          //depth 1

          let push_array = [];
          if (depth == 1) {
            push_array = comment
          } else {
            if (!req.body.upper_comment_id) return res.json({
              success: false, "errors": [
                {
                  "msg": "Invalid value",
                  "param": "upper_comment_id",
                  "location": "body"
                }
              ]
            })
            const upper_comment_id = req.body.upper_comment_id
            const index = data.comment_array.findIndex(x => x._id == upper_comment_id);
            if (index == -1) return res.json({ success: false, message: "index error" })
            push_array = {
              $each: [comment],
              $position: index + 1
            }
          }
          //update
          Topic.findOneAndUpdate(
            { _id: target_id },
            {
              $push: { comment_array: push_array },
              $inc: { comment_count: 1 }
            },
            (err, data) => {
              if (err) res.json({ succees: false, data: err })
              if (data == null) res.json({ succees: false, message: "게시글이 존재하지 않습니다" })
              else
                return res.status(200).json({
                  success: true,
                  message: '댓글 작성 완료',
                  data: null,
                });
            }
          )
        }
      }
    )
  } else {

  }

}


//////////////
commentController.register = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      if (req.body.depth == "1") {
        Content.findOne({ _id: req.body.content_id }, (err, content) => {
          User.findOne({ _id: content.user_id }, (err, userInfo) => {
            if (userInfo.comment_push == true && userInfo._id.toString() != user._id.toString()) {
              //푸시발송
              //유저 토큰
              const url = (process.env.UTIL_SERVER_URL) + (process.env.PUSH_API);
              const contentData = {
                content_id: req.body.content_id.toString(),
                case: "comment_push",
                send_user_id: user._id,
                target_user_id: userInfo._id,
                content_id: req.body.content_id

              }
              const data = {
                token: userInfo.fcm_token,
                nickname: user.nickname,
                content: req.body.comment,
                contentData: contentData,
              }
              // const tokenData = post(url, data)
              const options = {
                url: url,
                method: 'POST',
                json: data
              };
              request(options, function (error, response, body) {
                // console.log(response)
              })
            }

            //저장
            const comment = new Comment({
              ...req.body,
              user_id: user._id,
              web_path: user.web_path,
              comment_report: [],
              content: content.content,
              nickname: user.nickname,
            });

            comment.save((err, results) => {
              if (err) return res.json({ success: false, err });
              if (req.body.depth == 1) {
                Comment.findOneAndUpdate(
                  { _id: results._id },
                  { $set: { parent_comment: results._id } },
                  (err) => {
                  }
                );
              }
              Content.updateOne(
                { _id: req.body.content_id },
                { $inc: { comment_count: +1 } }, (err) => {
                  return res.status(200).json({
                    success: true,
                    message: null,
                    data: results,
                  });
                }
              )

            });
          })
        })
      } else {
        Comment.findOne({ _id: req.body.parent_comment }, (err, comment) => {
          User.findOne({ _id: comment.user_id }, (err, userInfo) => {
            if (userInfo.reply_push == true && userInfo._id.toString() != user._id.toString()) {
              //푸시발송
              //유저 토큰
              const url = (process.env.UTIL_SERVER_URL) + (process.env.PUSH_API);
              const contentData = {
                content_id: req.body.content_id.toString(),
                case: "reply_push",
                send_user_id: user._id,
                target_user_id: userInfo._id,
                content_id: comment.content_id,
                comment_id: req.body.parent_comment
              }
              const data = {
                token: userInfo.fcm_token,
                nickname: user.nickname,
                content: req.body.comment,
                contentData: contentData,
              }
              // const tokenData = post(url, data)
              const options = {
                url: url,
                method: 'POST',
                json: data
              };
              request(options, function (error, response, body) { })
            }


            //저장
            const commentData = new Comment({
              ...req.body,
              user_id: user._id,
              web_path: user.web_path,
              comment_report: [],
              content: comment.content,
              nickname: user.nickname,
            });

            commentData.save((err, results) => {
              if (err) return res.json({ success: false, err });
              Content.updateOne(
                { _id: req.body.content_id },
                { $inc: { comment_count: +1 } }, (err) => {
                  return res.status(200).json({
                    success: true,
                    message: null,
                    data: results,
                  });
                }
              )

            });
          })
        })
      }



    })
    .catch((err) => {
      throw err;
    });
};

//답글달기
commentController.reply = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Comment.findOne({ comment_no: req.body.comment_no }, (err, comment) => {
        if (comment === null || comment === undefined)
          return res.json({
            success: false,
            message: "존재하지 않는 댓글입니다",
          });
        // 기획 변경으로 주석
        // if (user.auth_no != comment.auth_no) {
        //   return res.json({
        //     success: false,
        //     message: "작성자만 작성가능합니다",
        //   });
        // }

        let obj = new Object()
        obj.reply_status = 'ALIVE'
        obj.reply = req.body.reply
        obj.web_path = user.web_path;
        obj.register = dateMoment();
        obj.reply_report = []
        obj.auth_no = user.auth_no;
        obj.nickname = user.nickname;
        //댓글고유번호
        if (comment.reply === null || comment.reply === [])
          obj.reply_no = 1
        else
          obj.reply_no = comment.reply.length + 1
        const replyArray = comment.reply.concat([obj])
        //알림발송
        User.findOne({ auth_no: comment.auth_no }, (err, userInfo) => {
          if (userInfo.reply_push == true && userInfo.auth_no != user.auth_no) {
            //푸시발송
            //유저 토큰
            const url = (process.env.UTIL_SERVER_URL) + (process.env.PUSH_API);
            const contentData = {
              content_no: comment.content_no.toString(),
              comment_no: comment.comment_no.toString(),
              case: "reply_push"
            }
            const data = {
              token: userInfo.fcm_token,
              nickname: user.nickname,
              content: req.body.reply,
              contentData: contentData
            }
            // const tokenData = post(url, data)
            const options = {
              url: url,
              method: 'POST',
              json: data
            };
            request(options, function (error, response, body) { })
          }
          Comment.findOneAndUpdate(
            { comment_no: req.body.comment_no },
            { $set: { reply: replyArray } },
            (err, comment) => {
              if (err) throw err;
              //댓글총개수 업데이트
              Content.findOne({ content_no: comment.content_no }, (err, content) => {
                Content.findOneAndUpdate(
                  { content_no: content.content_no },
                  { $set: { comment_count: content.comment_count + 1 } },
                  (err, results) => {
                    return res.status(200).json({
                      success: true,
                      message: null,
                      data: obj,
                    });
                  }
                );
              });
            }
          );
        })
        // 댓글 등록

      })

    })
    .catch((err) => {
      throw err;
    });
}

//댓글 리폿
commentController.commentReport = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Comment.findOne({ _id: req.body.comment_id }, (err, comment) => {
        if (comment === null || comment === undefined)
          return res.json({
            success: false,
            message: "존재하지 않는 댓글입니다",
          });

        if (comment.commentReport.includes(user._id)) {

          if (err) throw err;
          return res.status(200).json({
            success: true,
            message: '신고가 완료된 댓글입니다',
            data: null,

          }
          );
        } else {
          let commentReport = comment.commentReport.concat([user._id])
          Comment.findOneAndUpdate(
            { _id: req.body.comment_id },
            { $set: { commentReport: commentReport } },
            (err, comment) => {
              if (err) throw err;
              return res.status(200).json({
                success: true,
                message: '신고가 완료되었습니다',
                data: null,
              });
            }
          );
        }
      })

    })
    .catch((err) => {
      throw err;
    });
}

//답글신고
commentController.replyReport = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Comment.findOne({ comment_no: req.body.comment_no }, (err, comment) => {
        if (comment === null || comment === undefined)
          return res.json({
            success: false,
            message: "존재하지 않는 댓글입니다",
          });

        if (comment.reply[req.body.reply_no - 1].reply_report.includes(user.auth_no)) {
          if (err) throw err;
          return res.status(200).json({
            success: true,
            message: '이미 신고하셨습니다',
            data: null,

          }
          );
        } else {
          const replyData = comment.reply.filter((item, index) => (item.reply_no == req.body.reply_no))

          // replyData[0].reply_report.concat([req.body.reply_no])
          const concatData = replyData[0].reply_report.concat([user.auth_no])
          // console.log(concatData)

          comment.reply[req.body.reply_no - 1].reply_report = concatData
          // console.log(comment.reply[0].reply_report)

          Comment.findOneAndUpdate(
            { comment_no: req.body.comment_no },
            { $set: { reply: comment.reply } },
            (err, comment) => {
              if (err) throw err;
              return res.status(200).json({
                success: true,
                message: '신고가 완료되었습니다',
                data: null,
              });
            }
          );
        }

      })

    })
    .catch((err) => {
      throw err;
    });
}

//답글신고
commentController.replyDelete = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Comment.findOne({ comment_no: req.body.comment_no }, (err, comment) => {
        if (comment === null || comment === undefined)
          return res.json({
            success: false,
            message: "존재하지 않는 댓글입니다",
          });

        if (user.auth_no != comment.reply[req.body.reply_no - 1].auth_no) {
          return res.json({
            success: false,
            message: "작성자만 삭제할 수 있습니다",
          });
        } else {
          if (comment.reply[req.body.reply_no - 1].reply_status == "DEAD") {
            return res.json({
              success: false,
              message: "이미 삭제되었습니다",
            });
          }
          comment.reply[req.body.reply_no - 1].reply_status = "DEAD"
          Comment.findOneAndUpdate(
            { comment_no: req.body.comment_no },
            { $set: { reply: comment.reply } },
            (err, comment) => {
              //댓글수 줄임
              Content.findOne({ content_no: comment.content_no }, (err, content) => {
                Content.findOneAndUpdate(
                  { content_no: comment.content_no },
                  { $set: { comment_count: content.comment_count - 1 } },
                  (err) => {
                    if (err) throw err;
                    return res.status(200).json({
                      success: true,
                      message: '삭제가 완료되었습니다',
                      data: null,
                    });
                  }
                );
              })
            }
          );
        }



      })

    })
    .catch((err) => {
      throw err;
    });
}

//내가 작성한 댓글
commentController.myComment = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);



    Comment.find(
      { user_id: user._id, comment_status: "ALIVE" },
      {},
      { limit: listLength, skip: (index - 1) * listLength },
      (err, comment) => {
        if (err) throw err;

        return res.status(200).json({
          success: true,
          data: comment,
        });
      }).sort({ _id: -1 });

  });
}

//댓글 상세
commentController.detail = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });


    Comment.find({ parent_comment: req.params.comment_id }, (err, comment) => {
      if (comment === null || comment === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 댓글입니다",
        });
      return res.status(200).json({
        success: true,
        data: comment

      })
      // Comment.find(
      //   { parent_comment: comment._id, depth: 2 },
      //   (err, comments) => {
      //     return res.status(200).json({
      //       success: true,
      //       data: { ...comment._doc, reply_list: comments }

      //     })
      //   }
      // )


    });

  });

}



// // 안자르고 직접 자르는 api
// commentController.list = (req, res) => {
//   const listLength = req.body.listLength;
//   const index = req.body.index;
//   Comment.find({ content_no: req.body.content_no }, (err, comment) => {
//     if (err) throw err;
//     return res.status(200).json({
//       success: true,
//       data: {
//         list: slideArr(comment, listLength, index),
//         total: totalPage(comment.length, listLength),
//         length: comment.length,
//       },
//     });
//   });
// };

//댓글 리스트
commentController.perList = (req, res) => {
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);

  Comment.find(
    { content_id: req.query.content_id },
    {},
    { limit: listLength, skip: (index - 1) * listLength },
    (err, comment) => {
      if (err) throw err;
      return res.status(200).json({
        success: true,
        data: comment,
      });
    }).sort({ parent_comment: 1, depth: 1 }
    )
};
// total page api
commentController.totalPage = (req, res) => {
  const listLength = req.body.listLength;
  Comment.count({ content_no: req.body.content_no }, (err) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: totalPage(comment, listLength),
    });
  });
};

commentController.edit = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    // 찾기
    Comment.findOne({ _id: req.params.comment_id }, (err, comment) => {
      if (comment === null || comment === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 댓글입니다",
        });
      // 게시글의 회원번호와 토큰의 회원번호 비교
      console.log(typeof comment.user_id)
      console.log(typeof user._id)
      if (comment.user_id.toString() !== user._id.toString())
        return res.json({ isAuth: false, success: false, message: "SignTokenInvalid" });
      //
      Comment.findOneAndUpdate(
        { _id: req.params.comment_id },
        { $set: { comment: req.body.comment } },
        (err, comment) => {
          if (err) throw err;
          return res.status(200).json({
            success: true,
            data: comment,
          });
        }
      );
    });
  });
};

commentController.delete = (req, res) => {
  let token = req.cookies.x_auth;
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    //
    Comment.findOne({ _id: req.params.comment_id }, (err, comment) => {
      if (comment === null || comment === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 댓글입니다",
        });
      if (comment.user_id.toString() !== user._id.toString())
        return res.json({ isAuth: false, success: false, message: "SignTokenInvalid" });

      if (comment.comment_status == "DEAD") {
        return res.json({
          success: false,
          message: "이미 삭제되었습니다",
        });
      } else {
        Content.updateOne(
          { _id: comment.content_id },
          { $inc: { comment_count: -1 } }, (err) => {
            Comment.findOneAndUpdate(
              { _id: req.params.comment_id },
              { $set: { comment: "삭제된 댓글입니다", original_comment: comment.comment, comment_status: "DEAD" } },
              (err) => {
                if (err) throw err;
                return res.status(200).json({
                  success: true,
                  message: null,
                  data: null,
                });
              }
            );
          }
        )

      }



    });
  });
};

module.exports = commentController;
