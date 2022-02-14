import Etc from "../models/Etc";
import News from "../models/News";
import Bringup from "../models/Bringup"
import File from "../models/File";

import { app_push } from "../utils/utilsFunction"




import { getCurrentDate, dateMoment, registered } from "../utils/utilsFunction";
let etcController = {};

etcController.term = (req, res) => {
    Etc.findOne({ key: "term" }, (err, term) => {
        return res.status(200).json({
            success: true,
            data: term
        });
    })
}
etcController.area = (req, res) => {
    Etc.findOne({ key: "sido_sigungu" }, (err, term) => {
        term.value_array.forEach(element => {
            element.label = element.sigungu_value
            element.value = element.sigungu_no

        });
        return res.status(200).json({
            success: true,
            data: term
        });
    })
}

etcController.register = (req, res) => {
    const etc = new Etc({
        ...req.body,
        registered: getCurrentDate(),
        key: req.body.key,
    });
    etc.save((err) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
            message: null,
            data: null,
        });
    });
};


etcController.appStatus = (req, res) => {
    Etc.findOne({ key: "app_status" }, (err, status) => {
        if (err) throw err;
        return res.status(200).json({
            success: true,
            data: status.value
        });
    });
};

etcController.report = (req, res) => {
    Etc.findOne(
        { key: "report" },
        (err, data) => {
            if (err) throw err;
            const returnArray = []
            data.value_history.forEach(element => {
                let temp_ojb = {}
                temp_ojb._id = element._id
                temp_ojb.report_content = element.report_content
                returnArray.push(temp_ojb)
            });
            return res.status(200).json({
                success: true,
                data: returnArray
            });
        }
    ).lean()
}
etcController.news_list = (req, res) => {
    News.findOne(
        {},
        {},
        { sort: { _id: -1 } },
        (err, data) => {
            return res.status(200).json({
                success: true,
                data: data
            });
        }
    )
}
etcController.push_test = (req, res) => {


    // const target_token = req.body.fcm_token
    const type = req.body.type
    const user_id = req.body.user_id
    const comment = req.body.comment
    app_push(type, user_id, comment)

    // console.log(target_token)

    // let message = {
    //     notification: {
    //         title: '테스트 데이터 발송',
    //         body: '데이터가 잘 가나요?',
    //     },
    //     token: target_token,
    // }

    // admin
    //     .messaging()
    //     .send(message)
    //     .then(function (response) {
    //         // console.log('Successfully sent message: : ', response)
    //         return res.status(200).json({ success: true })
    //     })
    //     .catch(function (err) {
    //         console.log('Error Sending message!!! : ', err)
    //         return res.status(400).json({ success: false })
    //     });
}

module.exports = etcController;
