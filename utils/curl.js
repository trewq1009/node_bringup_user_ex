import { addListener } from 'nodemon';
import request from 'request';

export const get_h = (url, headers) => {
    //api get options.
    const options = {
        url: url,
        method: 'GET',
        headers: headers
    };

    return new Promise(resolve => {
        request(options, function (error, response, body) {
            resolve(response);
        })
    })
}

export const post_body = (url, data) => {

    const headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': "application/x-www-form-urlencoded"
    }
    //api get options.
    const options = {
        url: url,
        method: 'POST',
        headers: headers,
        form: data
    };

    return new Promise(resolve => {
        request(options, function (error, response, body) {
            resolve(response);
        })
    })

    // return request(options, function (error, response, body) {
    // })


}

export const post = (url, data) => {
    const headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': "application/json"
    }
    //api get options.
    const options = {
        url: url,
        method: 'POST',
        headers: headers,
        json: data
    };

    return new Promise(resolve => {
        request(options, function (error, response, body) {
            resolve(response);
        })
    })

    // return request(options, function (error, response, body) {
    // })


}


export const put_h = (url, data, headers) => {
    const options = {
        url: url,
        method: 'PUT',
        headers: headers,
        body: data
    };
    return new Promise(resolve => {
        request(options, function (error, response, body) {
            resolve(response);
        })
    })
}
