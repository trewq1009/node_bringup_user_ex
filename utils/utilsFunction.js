import bcrypt from "bcrypt";
import moment from 'moment'
import { ObjectId } from "mongodb";
import admin from "firebase-admin"

import User from "../models/User"

import serAccount from '../firebase_info.json';
admin.initializeApp({
  credential: admin.credential.cert(serAccount),
})

export const app_push = (type, user_id, comment) => {

  User.findOne(
    { _id: user_id },
    ["nickname", "topic_push", "bringup_push", "message_push", "fcm_token"],
    (err, user) => {
      if (user) {
        // const zzz = "f-FSoOVFRGGTIG0e5iQlvo:APA91bF2DBwhdDsXRCLW2HpQbCF0Qne223LjhDpIhpkrSRmCJHTD-4wDmGs6WrYckCutfnh7H5gwMS0weybbQ5O7ux7c94qda2ZlAAge3-0uHlN7NzTs14IE8xeh2HAO62Ho4Ii8g6MC"
        if (user.fcm_token) {
          let target
          if (type == "bringup") {
            target = user.bringup_push

          } else if (type == "topic") {
            target = user.app_push

          } else if (type == "message") {
            target = user.message_push

          }
          if (target == true) {
            const title = user.nickname + "님 새로운 소식이 있습니다"
            const body = comment
            const target_token = user.fcm_token
            // const target_token = "frTgyd-DSxOgWlFePK2sec:APA91bGSkoaTz1h8iRKjdhf4N4Xnn7SlzYnueFffXifk4NY4P4mUydF0AI36itQ9Ge-KviM772mMokQTChy31VXD7BX16D6D2pLTnsOahl4hRnIItjaZSrbGuuO3rscwrXDfOqnY3NZM"

            // console.log(target_token)

            let message = {
              notification: {
                title: title,
                body: body,
              },
              token: target_token,
            }

            admin
              .messaging()
              .send(message)
              .then(function (response) {
                console.log('Successfully sent message: : ', response)
                // return { success: true }
              })
              .catch(function (err) {
                console.log('Error Sending message!!! : ', err)
                // return { success: false }
              });
          }
        }
      }
    }
  )


}

export const registered = (_id) => {
  const utc = (ObjectId(_id).getTimestamp())

  return moment(utc).format("YYYY-MM-DD HH:mm:ss")
}

export const totalPage = (arrLength, listLength) => {
  if (listLength === null || listLength === undefined) return null;
  return Math.ceil(arrLength / listLength);
};

export const slideArr = (arr, listLength, index) => {
  if (listLength === null || listLength === undefined) return arr;
  if (index === null || index === undefined) return arr;
  if (Number(index) === 1) {
    return arr.slice(0, listLength);
  } else if (totalPage(arr.length / listLength) === index) {
    return arr.slice(listLength * (index - 1), listLength * index);
  } else {
    return arr.slice(listLength * (index - 1), listLength * index);
  }
};

export const bcryptPassword = (password) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, encryptedPassword) => {
      return encryptedPassword;
    });
  });
};

export const getCurrentDate = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();
  let today = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let milliseconds = date.getMilliseconds();
  return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
};



export const dateMoment = () => moment().format("YYYY-MM-DD HH:mm:ss");
