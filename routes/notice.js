
import express from "express";
import notice from "../controllers/NoticeController";

const router = express.Router();

router.post("/register", notice.register);

router.get("/list", notice.list);

router.get("/perList", notice.perList);

router.post("/totalPage", notice.totalPage);

// router.get("/detail/:notice_no", notice.detail);

// router.put("/delete/:notice_no", notice.delete);

// router.put("/edit/:notice_no", notice.edit);

module.exports = router;
