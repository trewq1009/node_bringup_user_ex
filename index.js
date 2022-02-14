import express, { Router } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import process from "process"


import dotenv from 'dotenv'
dotenv.config()

import { mongodbConnection } from "./utils/mongo"

import state from "./routes/state";
import original from "./routes/original";
import topic from "./routes/topic"
import user from "./routes/user";
import bringup from "./routes/bringup"
import view from "./routes/view"
import demand from "./routes/demand"
import hashtag from "./routes/hashtag"
import todo from "./routes/todo";
import content from "./routes/content";
import comment from "./routes/comment";
import like from "./routes/like";
import report from "./routes/report";
import etc from "./routes/etc"
import notice from "./routes/notice"
import vali from "./routes/validator"
import mongoose1 from "./routes/mongoose"
import Etc from "./models/Etc"


const app = express();
const router = express.Router();
const port = 51011;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());;

//몽고db 커넥션
mongodbConnection()


router.use("/state", state)

router.use("/etc", etc)

router.use("/user", user);

router.use("/topic", topic);

router.use("/original", original)

router.use("/bringup", bringup)

router.use("/comment", comment);

router.use("/like", like);

router.use("/report", report);

router.use("/view", view);

router.use("/demand", demand);

router.use("/hashtag", hashtag);
// router.use("/todo", todo);

// router.use("/content", content);




// router.use("/notice", notice)

// router.use("/vali", vali)

// router.use("/mongoose", mongoose1)

app.use('/api/v1', router)

// process.on('uncaughtException', function (err) {
//   console.log('Caught exception: ' + err);
// });

// setTimeout(function () {
//   console.log('This will still run.');
// }, 500);

// // Intentionally cause an exception, but don't catch it.
// nonexistentFunc();
// console.log('This will not run.');

app.listen(port, () => {
  console.log(`서버 실행!! 포트는? ${port}`);
});
