import Todo from "../models/ToDo";

import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";

let todoController = {};

todoController.test = (req, res) => {
  return res.status(200).json({
    success: true,
    message: dateMoment(),
    data: getCurrentDate()
  })
}

todoController.register = (req, res) => {
  Todo.find({}, (err, toDo) => {
    const todo = new Todo({ content: req.body.content, check: false });
    todo.save((err, toDos) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true,
        message: null,
        data: null,
      });
    });
  });
};

// 안자르고 직접 자르는 api
todoController.list = (req, res) => {
  const listLength = req.body.listLength;
  const index = req.body.index;
  Todo.find({}, (err, todo) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: {
        list: slideArr(todo, listLength, index),
        total: totalPage(todo.length, listLength),
        length: todo.length,
      },
    });
  });
};

// 에초에 잘라서 주는 api // app에 적합
todoController.perList = (req, res) => {
  const listLength = Number(req.body.listLength);
  const index = Number(req.body.index);
  const search = new RegExp(req.body.content.toLowerCase());
  Todo.find({ content: search }, {}, { limit: listLength, skip: (index - 1) * listLength }, (err, todo) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
      data: todo,
    });
  });
};
// total page api
todoController.totalPage = (req, res) => {
  const listLength = req.body.listLength;
  // Todo.find({}, (err, todo) => {
  //   if (err) throw err;
  //   return res.status(200).json({
  //     success: true,
  //     data: totalPage(todo.length, listLength),
  //   });
  // });
  Todo.count({}, (err, todo) => {
    if (err) throw err;
    console.log(todo);
    return res.status(200).json({
      success: true,
      data: totalPage(todo, listLength),
    });
  });
};

todoController.delete = (req, res) => {
  return Todo.findOneAndDelete({ _id: req.params._id }, (err, usr) => {
    if (err) throw err;
    return res.status(200).json({
      success: true,
    });
  });
};

todoController.check = (req, res) => {
  Todo.findOne({ id: req.params.id }, (err, todo) => {
    return Todo.findOneAndUpdate({ id: req.params.id }, { $set: { check: !todo.check } }, (err, tod) => {
      if (err) throw err;
      return res.status(200).json({
        success: true,
        data: tod,
      });
    });
  });
};

todoController.edit = (req, res) => {
  console.log(req.body);
  Todo.findOne({ id: req.params.id }, (err, todo) => {
    return Todo.findOneAndUpdate({ id: req.params.id }, { $set: { content: req.body.content } }, (err, tod) => {
      if (err) throw err;
      return res.status(200).json({
        success: true,
        data: tod,
      });
    });
  });
};

module.exports = todoController;
