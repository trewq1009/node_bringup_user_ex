
import request from 'request';
import dotenv from 'dotenv'
dotenv.config()

import jwt from "jsonwebtoken";



import Content from "../models/Content";
import Comment from "../models/Comment";
import User from "../models/User";
import { post } from "../utils/curl";
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";

let contentController = {};

contentController.delete1 = (req, res) => {
  let token = req.headers.authorization;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Content.findOneAndUpdate(
        { _id: req.body._id, user_id: user._id },
        { $set: { content_status: "DEAD" } }
        , (err, content) => {
          if (content === null || content === undefined) {
            return res.json({
              success: false,
              message: "권한이 없거나 존재하지 않는 게시글입니다",
            })
          } else {
            return res.status(200).json({
              success: true,
            });
          }
        });
    })
    .catch((err) => {
      throw err;
    });
}

contentController.update1 = (req, res) => {
  let token = req.headers.authorization;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      console.log(user)
      req.token = token;
      // 토큰 검증 후 글 올리기
      Content.findOneAndUpdate(
        { _id: req.body._id, content_status: "ALIVE", user_id: user._id },
        { $set: { content: req.body.content } }
        , (err, content) => {
          console.log(content)
          if (content === null || content === undefined) {
            return res.json({
              success: false,
              message: "권한이 없거나 존재하지 않는 게시글입니다",
            })
          } else {
            return res.status(200).json({
              success: true,
            });
          }
        });
    })
    .catch((err) => {
      throw err;
    });
}

contentController.detail1 = (req, res) => {
  let token = req.headers.authorization;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Content.findOne({ _id: req.params.content_id, content_status: "ALIVE" }, (err, content) => {
        if (content === null || content === undefined)
          return res.json({
            success: false,
            message: "존재하지 않는 게시글입니다",
          });

        return res.status(200).json({
          success: true,
          data: content,

        }
        );
      });
    })
    .catch((err) => {
      throw err;
    });
}

contentController.list1 = (req, res) => {
  let token = req.headers.authorization;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Content.find({ content_status: "ALIVE" }, (err, contents) => {
        return res.status(200).json({
          success: true,
          message: null,
          data: contents,
        });
      });
    })
    .catch((err) => {
      throw err;
    });
}

contentController.add1 = (req, res) => {
  let token = req.headers.authorization;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      // 토큰 검증 후 글 올리기
      const content = new Content({
        content: req.body.content,
        content_status: "ALIVE",
        web_path: "zzzz",
        registered: dateMoment(),
        user_id: user._id,
        nickname: user.nickname,
      });
      content.save((err, retrunContent) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
          success: true,
          message: null,
          data: retrunContent,
        });
      });
    })
    .catch((err) => {
      throw err;
    });
}


contentController.test = (req, res) => {
  const url = (process.env.UTIL_SERVER_URL) + (process.env.PUSH_API);
  console.log(url)
  const data = {
    token: "123123",
    case: 1,
    nickname: "닉넴",
    content: "내용"

  }
  // const tokenData = post(url, data)
  const options = {
    url: url,
    method: 'POST',
    json: data
  };
  request(options, function (error, response, body) { })

}

contentController.register = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, success: false });
      req.token = token;
      // 토큰 검증 후 글 올리기
      Content.find({}, (err, contents) => {
        const content = new Content({
          ...req.body,
          registered: dateMoment(),
          user_id: user._id,
          nickname: user.nickname,
        });
        content.save((err, retrunContent) => {
          if (err) return res.json({ success: false, err });
          return res.status(200).json({
            success: true,
            message: null,
            data: retrunContent,
          });
        });
      });
    })
    .catch((err) => {
      throw err;
    });
};
//랜덤 및 갯수제한 
contentController.random = (req, res) => {
  // console.log(req.body.filter_array)
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    if (req.body.hashtag === "" || req.body.hashtag === undefined) {
      const ninArray = req.body.filter_array

      let filter = { _id: { $nin: ninArray }, user_id: { $nin: user.user_ban_list }, content_status: "ALIVE" };
      // if (req.query.hashtag != '') {
      //   filter = { ...filter, hashtag: { $in: [req.query.hashtag] } }
      // }

      const fields = {};
      const options = { limit: req.body.limit };

      Content.findRandom(filter, fields, options, function (err, results) {
        if (!err) {
          if (results == undefined) {
            return res.status(200).json({
              success: false,
              message: "검색결과가 없습니다",
              data: null,
            });
          }
          const myLike = results.map((item) => {
            return { ...item._doc, myLike: item.like_status.some(state => state.user_id.toString() === user._id.toString()) }
          })

          // const myLike = results.like_status.filter((item) => item.auth_no === user.auth_no).length
          // console.log(myLike)
          return res.status(200).json({
            success: true,
            message: null,
            data: myLike,
          });
        }
      });
    } else {
      const listLength = Number(req.body.listLength || 10);
      const index = Number(req.body.pageIndex);

      Content.find(
        { user_id: { $nin: user.user_ban_list }, hashtag: { $in: [req.body.hashtag] }, content_status: "ALIVE" },
        {},
        { limit: listLength, skip: (index - 1) * listLength },
        (err, content) => {
          if (err) throw err;
          return res.status(200).json({
            success: true,
            data: content,
          });
        }).sort({ _id: -1 });


    }
  })
}

// 해시태그 찾기
contentController.hashtag = (req, res) => {
  const search = new RegExp(req.query.hashtag.toLowerCase());
  const filter = { hashtag: { $in: [search] } }
  const fields = { hashtag: 1, _id: 0 };

  Content.find(filter, fields, (err, results) => {
    if (!err) {
      let returnHashtag = [];
      // console.log(results.length)
      results.forEach(element => {
        // console.log(element.hashtag[0])
        element.hashtag.forEach(i => {
          if (i.includes(req.query.hashtag))
            returnHashtag.push(i)
        })
      });
      // const uniqueArr = returnHashtag.filter((element, index) => {
      //   console.log(returnHashtag.indexOf(element) === index)
      //   return returnHashtag.indexOf(element) === index;
      // });
      let arr = []
      const uniqueArr = () => {
        returnHashtag.map((item, index) => {
          const count = returnHashtag.filter((filterItem) => filterItem === item).length;
          if (returnHashtag.indexOf(item) === index) {
            return arr.push({ count: count, tag: item })
          }
        })
      }
      uniqueArr()


      return res.status(200).json({
        success: true,
        message: null,
        data: arr,
      });
    }
  });
}

//게시글 좋아요
contentController.like = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    // 찾기

    Content.findOne({ _id: req.body.content_id }, (err, content) => {
      if (content === null || content === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 게시글입니다",
        });

      let like_status = false

      content.like_status.forEach(element => {
        if (element.user_id == user._id.toString())
          like_status = true
      });

      //좋아요
      if (like_status == true && req.body.content_like == true) {
        return res.status(200).json({
          success: false,
          message: '이미 좋아요를 누르셨습니다',
          data: null,
        });
      } else if (like_status == false && req.body.content_like == false) {
        return res.status(200).json({
          success: false,
          message: '이미 좋아요를 취소하셨습니다',
          data: null,
        });
      } else if (like_status == true && req.body.content_like == false) {

        const idx = content.like_status.findIndex(function (item) { return item.user_id === user._id }) // findIndex = find + indexOf if (idx > -1) a.splice(idx, 1)
        content.like_status.splice(idx, 1)

        Content.findOneAndUpdate(
          { _id: req.body.content_id },
          { $set: { like_status: content.like_status } },
          (err, content) => {
            if (err) throw err;
            return res.status(200).json({
              success: true,
              message: '좋아요 취소',
              data: null,
            });
          }
        )
      } else if (like_status == false && req.body.content_like == true) {
        const obj = new Object
        obj.user_id = user._id
        obj.registered = dateMoment()

        content.like_status.push(obj)



        Content.findOneAndUpdate(
          { _id: req.body.content_id },
          { $set: { like_status: content.like_status } },
          (err, content) => {
            if (err) throw err;
            return res.status(200).json({
              success: true,
              message: '좋아요 완료',
              data: null,
            });
          }
        )
      } else {
        console.log("????")
      }



      //   // 좋아요 했는지
      //   if (content.like_status.includes(user.auth_no) && req.body.content_like == true) {
      //     return res.status(200).json({
      //       success: false,
      //       message: '이미 좋아요를 누르셨습니다',
      //       data: null,
      //     });
      //   } else if (!(content.like_status.includes(user.auth_no)) && req.body.content_like == false) {
      //     return res.status(200).json({
      //       success: false,
      //       message: '이미 좋아요를 취소하셨습니다',
      //       data: null,
      //     });
      //   } else if (content.like_status.includes(user.auth_no) && req.body.content_like == false) {
      //     let like_status = content.like_status.filter((item) => item !== user.auth_no)
      //     Content.findOneAndUpdate(
      //       { content_no: req.body.content_no },
      //       { $set: { like_status: like_status } },
      //       (err, content) => {
      //         if (err) throw err;
      //         return res.status(200).json({
      //           success: true,
      //           message: '좋아요 취소',
      //           data: null,
      //         });
      //       }
      //     );
      //   } else if ((!(content.like_status.includes(user.auth_no)) && req.body.content_like == true)) {
      //     let like_status = content.like_status.concat([user.auth_no])
      //     Content.findOneAndUpdate(
      //       { content_no: req.body.content_no },
      //       { $set: { like_status: like_status } },
      //       (err, content) => {
      //         if (err) throw err;
      //         return res.status(200).json({
      //           success: true,
      //           message: '좋아요 완료',
      //           data: null,
      //         });
      //       }
      //     );
      //   }
    });
  })
}

//게시글 신고
contentController.report = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    // 찾기
    Content.findOne({ _id: req.body.content_id }, (err, content) => {
      if (content === null || content === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 게시글입니다",
        });
      // 좋아요 했는지

      if (content.report_status.includes(user._id)) {

        if (err) throw err;
        return res.status(200).json({
          success: true,
          message: '이미 신고하셨습니다',
          data: null,

        }
        );
      } else {
        let report_status = content.report_status.concat([user._id])
        Content.findOneAndUpdate(
          { _id: req.body.content_id },
          { $set: { report_status: report_status } },
          (err, content) => {
            if (err) throw err;
            return res.status(200).json({
              success: true,
              message: '신고가 완료되었습니다',
              data: null,
            });
          }
        );
      }
    });
  })
}

//내가 작성한 게시물
contentController.myContent = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);
    // console.log(typeof user._id)
    Content.find(
      { user_id: user._id, content_status: "ALIVE" },
      {},
      { limit: listLength, skip: (index - 1) * listLength },
      (err, content) => {
        if (err) throw err;
        return res.status(200).json({
          success: true,
          data: content,
        });
      }).sort({ _id: -1 });

  });



}

//내가 공감한 게시물
contentController.myLike = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    const listLength = Number(req.query.listLength || 10);
    const index = Number(req.query.index);


    // console.log(user._id)

    Content.find(
      { "like_status.user_id": user._id, user_id: { $ne: user._id }, content_status: "ALIVE" },
      {},
      { limit: listLength, skip: (index - 1) * listLength },
      (err, content) => {
        if (err) throw err;
        return res.status(200).json({
          success: true,
          data: content,
        });
      }).sort({ _id: -1 });

  });
}

//게시글 상세
contentController.detail = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });


    Content.findOne({ _id: req.params.content_id, content_status: "ALIVE" }, (err, content) => {
      if (content === null || content === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 댓글입니다",
        });

      return res.status(200).json({
        success: true,
        data: content,

      }
      );
    });
  });

}

// =======


// // 안자르고 직접 자르는 api
contentController.list = (req, res) => {
  const listLength = req.body.listLength;
  const index = req.body.index;
  Content.find({}, (err, content) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: {
        list: slideArr(content, listLength, index),
        total: totalPage(content.length, listLength),
        length: content.length,
      },
    });
  });
};

// 에초에 잘라서 주는 api // app에 적합
contentController.perList = (req, res) => {
  const listLength = Number(req.body.listLength || 10);
  const index = Number(req.body.index);
  const search = new RegExp(req.body.content.toLowerCase());
  Content.find({ comment_status: "ALIVE" }, {}, { limit: listLength, skip: (index - 1) * listLength }, (err, content) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: content,
    });
  });
};
// total page api
contentController.totalPage = (req, res) => {
  const listLength = req.body.listLength;
  Content.count({}, (err, content) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: totalPage(content, listLength),
    });
  });
};

contentController.detail = (req, res) => {
  Content.findOne({ _id: req.params.content_id }, (err, content) => {
    if (err) throw err;
    // 댓글을 같이 줘야할 때
    // Comment.find({ content_no: req.params.content_no }, (err, comment) => {
    //   if (err) throw err;
    //   return res.status(200).json({
    //     success: true,
    //     data: {
    //       content: content,
    //       comment_list: comment,
    //     },
    //   });
    // });
    return res.status(200).json({
      success: true,
      data: content,
    });
  });
};

contentController.edit = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    // 찾기
    Content.findOne({ _id: req.params.content_id }, (err, content) => {
      if (content === null || content === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 게시글입니다",
        });
      // 게시글의 회원번호와 토큰의 회원번호 비교

      if (content.user_id.toString() !== user._id.toString())
        return res.json({ isAuth: false, success: false, message: "SignTokenInvalid" });
      //
      Content.findOneAndUpdate(
        { _id: req.params.content_id },
        { $set: { content: req.body.content, web_path: req.body.web_path, hashtag: req.body.hashtag } },
        (err, content) => {
          if (err) throw err;
          return res.status(200).json({
            success: true,
            data: content,
          });
        }
      );
    });
  });
};

contentController.delete = (req, res) => {
  let token = req.cookies.x_auth;
  User.findByToken(token).then((user) => {
    if (!user) return res.json({ isAuth: false, success: false });
    //
    Content.findOne({ _id: req.params.content_id }, (err, content) => {
      if (content === null || content === undefined)
        return res.json({
          success: false,
          message: "존재하지 않는 게시글입니다",
        });
      if (content.auth_no !== user.auth_no)
        return res.json({ isAuth: false, success: false, message: "SignTokenInvalid" });
      if (content.content_status == "DEAD")
        return res.status(200).json({
          success: false,
          message: "이미 삭제되었습니다"
        });
      Content.findOneAndUpdate({ _id: req.params.content_id }, { $set: { content_status: "DEAD" } }, (err) => {
        if (err) throw err;
        Comment.find({ _id: req.params.content_id }).updateMany(
          {},
          { $set: { comment_status: "DEAD" } },
          (err, comment) => {
            return res.status(200).json({
              success: true,
              message: "삭제가 완료되었습니다"
            });
          }
        );
      });
    });
  });
};

module.exports = contentController;
