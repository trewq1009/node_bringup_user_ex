// import Todo from "../models/ToDo";
import { validation123 } from "../utils/validatorModule"
import { totalPage, slideArr, getCurrentDate, dateMoment } from "../utils/utilsFunction";

let validatorController = {};

validatorController.test = (req, res) => {
    // console.log(typeof req.body.json)
    // console.log(JSON.parse(req.body.json))

    return res.status(200).json({
        success: true,
        message: dateMoment(),
        data: getCurrentDate()
    })
}

validatorController.testGet = (req, res) => {

};



module.exports = validatorController;
