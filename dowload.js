const request = require('request');
const fs = require('fs');
const path = require('path');

var dowloadVideo = function dowloadVideo(_header, _headerPhotoUpload, _data, _timeRunning) {

    let {
        uriL3,
        fileVideoPath
    } = _data


    var target = fileVideoPath;

    var options = {
        uri: uriL3,
        headers: _header
    };

    /* Create an empty file where we can save data */
    const file = fs.createWriteStream(target, { encoding: 'utf8' });

    return new Promise((res, rej) => {

        let _dieCookie = false;

        request(options)
            .on('response', function (response) {
                if (response.statusCode == 403) {
                    _dieCookie = true;
                    console.log('\n \n ' + response + "\n\n")
                }
                return response;
            })
            .pipe(file)
            .on('data', (data) => {
                console.log('start dowload ', target);
                return data;
            })
            .on('finish', async () => {
                console.log('file downloaded to ', target);
                res(true)
            })
            .on('close', async function () {
                clearInterval(_timeRunning);
                if (_dieCookie) {
                    console.log("\n Lỗi 403 kiểm tra dữ liệu cookie trước khi tiếp tục \n")
                    rej(Error(" =============Check cookie hoặc nạp cookie mới trước skhi tiếp tục ============="));
                }
            })
            .on('error', (error) => {
                console.log("========có lỗi trong quá trình tải=======");
                console.log(error);
                rej(error)
            })
    })
}

module.exports = dowloadVideo