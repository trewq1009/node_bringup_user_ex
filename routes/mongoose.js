import express from "express";

import mongoose from "../controllers/MongooseController";

const router = express.Router();


router.get("/test", mongoose.test)

router.get("/time", mongoose.time)

router.post("/save", mongoose.save)

router.post("/insertMany", mongoose.insertMany)

router.post("/transac", mongoose.transac)

router.delete("/deleteOne", mongoose.deleteOne)

router.delete("/deleteMany", mongoose.deleteMany)

router.get("/find/:mong", mongoose.find)

router.get("/findOne/:mong", mongoose.findOne)

router.get("/findById/:id", mongoose.findById)

router.put("/findByIdAndUpdate", mongoose.findByIdAndUpdate)

router.put("/updateOne", mongoose.updateOne)

router.put("/updateMany", mongoose.updateMany)

router.put("/findOneUpdate", mongoose.findOneUpdate)

router.get("/option", mongoose.option)

router.post("/hashtag", mongoose.hashtag)

router.get("/hashtag", mongoose.getHashtag)

router.get("/pagenation", mongoose.pagenation)

module.exports = router;