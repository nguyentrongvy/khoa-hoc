const fs = require('fs');
const AWS = require('aws-sdk');
const axios = require('axios');
const path = require('path');

var uploadVideo = function uploadVideo(_header, uri, pathFolder, _fileName) {

    try {
        // savevideo/video/${rootFolder}/${folder}

        const bucket_your_name = 'savevideo';
        const bucket_path = `${bucket_your_name}/${pathFolder}`;
        const filename = _fileName;

        AWS.config.region = 'ap-southeast-1';

        AWS.config.update({
            accessKeyId: 'AKIA4TQWMDIO24Z4XKO6',
            secretAccessKey: '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'
        });

        return new Promise(async (reslove, reject) => {

            console.log("bắt đầu gửi request..to ...uri", _fileName)
            const res = await axios.get(uri, {
                headers: _header,
                responseType: 'stream'
            }).catch(function (error) {
                if (error.response) {
                    // Request made and server responded
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }

            })

            const params = {
                Bucket: bucket_path,
                Key: filename,
                Body: res.data,
                ContentType: res.headers['content-type']
            }

            const s3 = new AWS.S3();

            console.log("bắt đầu upload..to s3...", _fileName)
            s3.upload(params).promise().then(result => {
                console.log("upload success....." + _fileName);

                let _pathFileJson = path.join(__dirname, `${pathFolder.replace("video", "json")}/${_fileName}.json`);

                fs.readFile(_pathFileJson, function read(err, data) {
                    if (err) {
                        throw err;
                    }
                    const content = data;
                    const _obj = JSON.parse(content);
                    _obj.status = true;
                    _obj.s3Link = result.Location;

                    if (fs.existsSync(_pathFileJson)) {
                        //file exists thì ghi lại
                        fs.writeFileSync(_pathFileJson, JSON.stringify(_obj), { encoding: 'utf8', flag: 'w' });
                    }
                });

                reslove(result);
            }).catch(err => reject(err))
        })
    } catch (error) {
        console.log("có lỗi trong quá trình upload lên amazon s3")
    }
}




module.exports = uploadVideo