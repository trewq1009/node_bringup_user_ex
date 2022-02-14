import express from "express";
import todo from "../controllers/TodoController";

const router = express.Router();

router.post("/register", todo.register);

router.get("/list", todo.list);

router.get("/perList", todo.perList);

router.get("/totalPage", todo.totalPage);

router.delete("/delete/:_id", todo.delete);

router.put("/check/:id", todo.check);

router.put("/edit/:id", todo.edit);

router.get("/test", todo.test)

module.exports = router;
