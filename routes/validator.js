import express from "express";
import { header, body, validationResult } from "express-validator"

import vali from "../controllers/ValidatorController";

const router = express.Router();

/*
npm - validator document
https://github.com/validatorjs/validator.js
 - trim(): 공백제거
 - withMessage('오류난 시점 메세지')
 - bail() 오류났을때 멈춤
 - isEmail():이 유효성 검사 기능은 들어오는 문자열이 유효한 이메일 주소인지 확인합니다.
 - isLength():이 유효성 검사기는 문자열 길이가 지정된 범위에 속하는지 확인합니다. 우리의 경우 지정된 범위는 최소 6 자입니다.
 - matches([정규식])
    1.최소 8자리에 숫자, 문자, 특수문자 각각 1개 이상 포함
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/

    2.최소 8자리에 대문자 1자리 소문자 한자리 숫자 한자리
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

    3.최소 8자리에 대문자 1자리 소문자 1자리 숫자 1자리 특수문자 1자리
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/

    4.위도경도
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/

    5.IP주소
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

 - 와일드카드
  body('data.*.key').isNumeric() // data 안에 모든 key의 value 는 숫자를 사용하여야한다

 - isJSON() - String 형태의 데이터가 JSON 형식인지 확인 JSON.parse이용
 - isNumeric() -입력이 숫자인지 확인
 - contains() -입력에 특정 값이 포함되어 있는지 확인
 - isBoolean() -입력이 부울 값인지 확인
 - isCurrency() -입력이 통화 형식인지 확인
 - isMobilePhone() -입력이 유효한 휴대폰 번호인지 확인
 - isPostalCode() -입력 한 우편 번호가 유효한지 확인
 - isBefore()그리고 isAfter()-날짜가 다른 날짜 이전인지 이후인지 확인
*/

router.use(express.json());
router.post("/test",
    [
        header('Authorization').notEmpty().isJWT(),
        body('username')
            .isEmail()
            .withMessage('이메일 형식 아니다')
            .bail()
            .isLength({ min: 6 })
            .withMessage('최소 5글자 이상이다')
            .bail()
        ,
        body('password')
            .isLength({ min: 5 })
            .withMessage('최소 5글자 이상이다')
            .bail()
        ,
        body('json').isJSON(),
        body('json.*.zz').isNumeric(),
        body('matches').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/),


    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        else
            vali.test(req, res);
    });

router.get("/get", vali.testGet);

module.exports = router;