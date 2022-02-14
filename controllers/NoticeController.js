import Notice from "../models/Notice";
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";

let noticeController = {};

noticeController.register = (req, res) => {
  let token = req.cookies.x_auth;
  // 토큰 검사
  // User.findByToken(token)
  //   .then((user) => {
  // if (!user) return res.json({ isAuth: false, success: false });
  // req.token = token;
  // 토큰 검증 후 글 올리기
  Notice.find({}, (err, contents) => {
    const notice = new Notice({
      ...req.body,
      registered: dateMoment(),
      // auth_no: user.auth_no,
    });
    notice.save((err) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true,
        message: null,
        data: null,
      });
    });
  });
  // })
  // .catch((err) => {
  //   throw err;
  // });
};
console.log(dateMoment())

// // 안자르고 직접 자르는 api
noticeController.list = (req, res) => {
  const listLength = req.body.listLength;
  const index = req.body.index;
  Notice.find({}, (err, notice) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: {
        list: slideArr(notice, listLength, index),
        total: totalPage(notice.length, listLength),
        length: notice.length,
      },
    });
  });
};

// 에초에 잘라서 주는 api // app에 적합
noticeController.perList = (req, res) => {
  const listLength = Number(req.query.listLength || 10);
  const index = Number(req.query.index);
  // const search = new RegExp(req.body.notice.toLowerCase());
  Notice.find({}, {}, { limit: listLength, skip: (index - 1) * listLength }, (err, notice) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: notice,
    });
  });
};
// total page api
noticeController.totalPage = (req, res) => {
  const listLength = req.body.listLength;
  Notice.count({}, (err, notice) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: totalPage(notice, listLength),
    });
  });
};

noticeController.detail = (req, res) => {
  Notice.findOne({ content_no: req.params.notice_no }, (err, notice) => {
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

// noticeController.edit = (req, res) => {
//   let token = req.cookies.x_auth;
//   // 토큰 검사
//   User.findByToken(token).then((user) => {
//     if (!user) return res.json({ isAuth: false, success: false });
//     // 찾기
//     Content.findOne({ content_no: req.params.content_no }, (err, content) => {
//       if (content === null || content === undefined)
//         return res.json({
//           success: false,
//           message: "존재하지 않는 게시글입니다",
//         });
//       // 게시글의 회원번호와 토큰의 회원번호 비교
//       if (content.auth_no !== user.auth_no)
//         return res.json({ isAuth: false, success: false, message: "SignTokenInvalid" });
//       //
//       Content.findOneAndUpdate(
//         { content_no: req.params.id },
//         { $set: { content: req.body.content, title: req.body.title } },
//         (err, content) => {
//           if (err) throw err;
//           return res.status(200).json({
//             success: true,
//             data: content,
//           });
//         }
//       );
//     });
//   });
// };

// noticeController.delete = (req, res) => {
//   let token = req.cookies.x_auth;
//   User.findByToken(token).then((user) => {
//     if (!user) return res.json({ isAuth: false, success: false });
//     //
//     Content.findOne({ content_no: req.params.content_no }, (err, content) => {
//       if (content === null || content === undefined)
//         return res.json({
//           success: false,
//           message: "존재하지 않는 게시글입니다",
//         });
//       if (content.auth_no !== user.auth_no)
//         return res.json({ isAuth: false, success: false, message: "SignTokenInvalid" });

//       // DB에서 삭제
//       // content.remove();
//       // return res.status(200).json({
//       //   success: true,
//       // });
//       Content.findOneAndUpdate({ content_no: req.params.content_no }, { $set: { content_status: "DEAD" } }, (err) => {
//         if (err) throw err;
//         Comment.find({ content_no: req.params.content_no }).updateMany(
//           {},
//           { $set: { comment_status: "DEAD" } },
//           (err, comment) => {
//             return res.status(200).json({
//               success: true,
//             });
//           }
//         );
//       });
//     });
//   });
// };

module.exports = noticeController;
