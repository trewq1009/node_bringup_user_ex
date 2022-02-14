import mongoose from "mongoose"
import Mong from "../models/Mongoose";
import Hashtag from "../models/Hashtag";
import moment from "moment"


let mongooseController = {};

//FUNCTION


//Controller
//Wellcome
mongooseController.test = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "몽구스 컨트롤러에 오신걸 환영합니다",
        data: "데이터는 없다"
    })
}

//time
//ObjectId 값을 이용해 등록 시간을 알 수 있다
/*
    moment(data._id.getTimestamp()).format("YYYY-MM-DD HH:mm:ss")
    [objectId]].getTimestamp())만 사용시 UTC Time 으로 시간이 나온다
    서버 시간을 변경할 수도있지만 비추
*/
mongooseController.time = (req, res) => {
    Mong.findOne({ _id: req.body.mong }, (err, data) => {
        console.log("req.body.mong")
        console.log(req.body.mong)

        console.log("dateFromObjectId(data._id)")
        console.log(data._id)
        console.log(dateFromObjectId(data._id))

        console.log("data._id.getTimestamp()")
        console.log(data._id.getTimestamp())

        console.log("형식변경")
        console.log(moment(data._id.getTimestamp()).format("YYYY-MM-DD HH:mm:ss"))

        return res.status(200).json({
            success: true,
            message: null,
            data: null,
        });

    })
}

//save
/*
   기본 저장 
*/
mongooseController.save = (req, res) => {
    const mong = new Mong(req.body);
    mong.save((err, data) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
            message: null,
            data: null,
        });
    })


}



//insertMany
/*
   대량 저장 
*/
mongooseController.insertMany = (req, res) => {
    // const arr = [{ mong: req.body.mong }, { mong: req.body.mong }]
    //JSON 형태로도 가능
    const arr = req.body
    Mong.insertMany(arr, (err, data) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
            message: null,
            data: null,
        });
    })
}


//transaction
//보류
mongooseController.transac = async (req, res, next) => {

    const session = await mongoose.startSession();
    const mong1 = new Mong({ mong: req.body.mong1 });
    const mong2 = new Mong({ mong: req.body.mong2 });

    try {
        session.startTransaction()

        await mong1.save({ session })
        await mong2.save({ session })

        await session.commitTransaction()
        session.endSession()

        res.send('Success')


    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }

}
//deleteOne
/*
   1개 삭제 
   삭제할 데이터가 여러개일 경우 마지막것부터 삭제
*/

mongooseController.deleteOne = (req, res) => {
    Mong.deleteOne({ mong: 1 }, (err) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
            message: null,
            data: null,
        });
    })
}

//deleteMany
/*
   대량 삭제 
*/

mongooseController.deleteMany = (req, res) => {
    Mong.deleteMany({ mong: 1 }, (err) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
            message: null,
            data: null,
        });
    })
}

//find
/*
    여러개 찾기
    일치하는 조건 모두 리턴
*/

mongooseController.find = (req, res) => {
    const _startTime = Date.now();

    Mong.find({ mong: req.params.mong },
        {},
        {},
        (err, result) => {
            if (err) return res.json({ success: false, err });
            console.log('Runtime in MS: ', Date.now() - _startTime);
            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            });
        })
}

//findOne
/*
    1개 찾기 
    일치하는 조건 맨위에것 하나만 리턴
*/

mongooseController.findOne = (req, res) => {
    Mong.findOne({ mong: req.params.mong },
        {},
        {},
        (err, result) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            });
        })
}


//findById
/*
    ObjectId 기준으로 찾기 
*/


mongooseController.findById = async (req, res) => {

    await Mong.findById(req.params.id,
        (err, result) => {
            if (err) return res.json({ success: false, err });

            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            })
        })

}

//findByIdAndUpdate
/*
    ObjectId 기준으로 찾기 
*/

const options = { new: true }
mongooseController.findByIdAndUpdate = (req, res) => {
    Mong.findByIdAndUpdate(req.body.id, { mong: req.body.mong }, options,
        (err, result) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            });
        })
}
//geoSearch 
/*
    검색할 지점으로 부터 일정 번위를 설정하여 결과 반환
*/

//updateOne
/*
    update 불가
    updateOne 이나 updateMany 사용해야함
    첫번째 검색 결과 한개만 update

    $inc: { num: -1 } // num 값을 -1한다
*/

mongooseController.updateOne = (req, res) => {
    Mong.updateOne({ mong: req.body.mong1 }, { $inc: { num: -1 } },
        (err, result) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            });
        })
}

//updateMany
/*
    검색결 조건 모두 update
*/


mongooseController.updateMany = (req, res) => {
    // Mong.updateMany({ 조건 }, { set },
    Mong.updateMany({ mong: req.body.mong1 }, { $set: { mong: req.body.mong2 } },
        (err, result) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            });
        })
}

//findOneUpdate
/*
    찾아서 업데이트

    *upsert
     - insert & update 
        있으면update 없으면 insert

*/

mongooseController.findOneUpdate = (req, res) => {
    const filter = { mong: '88888' };
    const update = { num: 9999 };
    Mong.findOneAndUpdate(
        filter, update,
        // { new: true, upsert: true } //*upsert
    ).exec((err, result) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
            message: null,
            data: result,
        });
    })

}



//option
/*
    option 영역
     - { "num": { $eq: 2 } } //num 2 일때
     - { "num": { $gt: 2 } } //num 2 초과
     - { "num": { $lt: 2 } } //num 2 미만
     - { "num": { $gte: 2 } } //num 2 이상
     - { "num": { $lte: 2 } } //num 2 이하
     - { "num": { $ne: 222 } } //num 222 가 아닌것
     - { "num": { $nin: [222, 333] } } 222 도 아니고 333도 아닌것
     - { "num": { $exists: true, $nin: [222, 333] } } num 이 존재하는것중 222 도 아니고 333도 아닌것
     - { $and : [{ "num": { $gt: 2, $lt:333 }, "mong": { $eq: "1" } }]} // num이 2 이상 333이하 && mong "1" 인데이터
     - { $or: [{ "num": { $gt: 2 }, "mong": { $eq: "1" } }]} // num이 2 이상 || mong "1" 인데이터
     - { $nor: [{ "num": { $gt: 2 }, "mong": { $eq: "1" }}]} // num이 2 이상이 아니거나 mong 이 "1"이 아닌 데이터
     - { $not: [{ "num": { $gt: 2 }}]} // num이 2 이상이 아닌
     
     - { "json.m1": { $exists: true, $eq: 1 } } // json안에 m1 이 존재하고 값이 1인데이터

    .select("a b c")
     - a, b, c 의 데이터만 보여준다 기본적으로 나오는 _id 값을 없애고 싶을땐 앞에 -를 붙인다 (-_id)

     .distinct('abc') 
      - 중복제거
*/


mongooseController.option = (req, res) => {
    Mong.find(
        //option 영역
        // { "num": { $gt: 9999 } }
        // { "mong": { $exists: true } }
        { $or: [{ "num": [222, 333] }], $text },


    )

        // .select("-_id mong num json")
        .sort({ "_id": -1 })
        // .in('num', ['222'])
        .lean()
        .exec((err, result) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
                success: true,
                message: null,
                data: result,
            });
            // }).where('mong').equals("gd")
        })
}
//post hashtag 100000개

mongooseController.hashtag = (req, res) => {
    for (var i = 0; i < 100000; i++) {
        const hashtag = new Hashtag({ tag: "a" + i });
        hashtag.save({ upsert: true })
    }

    return res.status(200).json({
        success: true,
        message: null,
    });

    // .exec((req, result) => {
    //     if (err) return res.json({ success: false, err });
    //     return res.status(200).json({
    //         success: true,
    //         message: null,
    //         data: result,
    //     });
    // })
}

//get hashtag & explain

mongooseController.getHashtag = (req, res) => {
    // Hashtag.find({ "tag": "a99995" })
    //     .explain().then(res => console.log(res[0]))
    // Hashtag.findById("60daa7d062cb792360e51cd9")
    // .explain().then(res => console.log(res[0]))
    Hashtag.findById("60daa7d062cb792360e51cd9").exec((err, result) => { console.log(result) })
    // .explain().then(res => console.log(res[0]))

}

//pagenation 

mongooseController.pagenation = (req, res) => {
    Hashtag.find({
        $and: [
            { _id: { $gt: "60daa692b5ef5e4f98535d2a" } },
            { tag: "a12" }
        ]
    }
    ).limit(10)
        .exec((err, result) => {
            console.log(result)
        })

}
//56
module.exports = mongooseController;
