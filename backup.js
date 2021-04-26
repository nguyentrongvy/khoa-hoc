


const fs = require('fs')
const path = require('path');
const LineByLineReader = require('line-by-line');
const querystring = require("querystring");
const dowLoadVideo = require("./dowload");
const uploadVideo = require("./upload");
const jsonMultilineStrings = require('json-multiline-strings')
const request = require('request');
const convertString = require("./removeVietnameseTones")
// const parse = require('csv-parse');
const uploadGoolePhoto = require('./uploadGdrive')


async function getLinkVideo(_id, _name, _header) {

    var _result = await new Promise((reslove, reject) => {
        let _url = 'https://drive.google.com/u/0/get_video_info?docid=' + _id;
        let options = {
            url: _url,
            headers: _header
        };

        request.get(options, async function (err, response, body) {
            if (err) reject(err);
            var data = querystring.parse(body, null, null);
            if (data.status == 'ok') {
                console.log("Quét link thành công trả về dữ liệu " + _name);
                // console.log("Đã lấy được dữ liệu từ docId...", JSON.stringify(data));
                reslove({
                    status: true,
                    response: data
                })
            } else {
                if (data && data.status && data.reason) {
                    console.log("Kiểm tra xem dữ liệu này có phải video", _name);
                    console.log(data);
                    return reslove({
                        status: false,
                        response: data
                    })
                } else {
                    throw Error("Chết Cookies sử dụng cookies mới để lấy dữ liệu")
                }


            }
        });

    }).then(function (_resInfoDoc) {
        if (_resInfoDoc && _resInfoDoc.status) {
            var response = _resInfoDoc.response;
            var fmt_stream = response['fmt_stream_map'].split(',');
            var uri = fmt_stream[fmt_stream.length - 1].split('|')[1];
            return {
                uri: uri,
                uris: fmt_stream,
                response: response,
                result: response
            }
        } else {
            return null;
        }
    });

    return _result;
}

const sleeper = ms => new Promise(res => setTimeout(res, ms))

function createFolder(pathFolder) {
    try {
        if (!fs.existsSync(pathFolder)) {
            fs.mkdirSync(pathFolder);
            console.log("tạo thành công folder");
        }
    } catch (error) {
        console.log(error);
        throw Error("Lỗi chưa có thư mục trước đó hoặc tên thư mục hoặc tên file có chứa kí tự đặc biệt hoặc khác #")
    }
}


function createFileJson(pathFile, _obj) {

    let _str = JSON.stringify(jsonMultilineStrings.split(_obj), null, '    ');

    if (fs.existsSync(pathFile)) {
        //file exists thì ghi lại
        fs.writeFileSync(pathFile, _str, { encoding: 'utf8', flag: 'w' }, function () {
            console.log("succeeded in saving");
        })
    } else {
        // tạo mới và ghi vào
        fs.appendFile(pathFile, _str, function (err) {
            if (err) throw err;
            console.log('Append data uri dowload file json ............\n')
            console.log('\n')
        });
    }
}


function updateFileJson(pathFile, _ctUpdate) {
    return new Promise((res, rej) => {
        try {
            fs.readFile(pathFile, function read(err, data) {
                if (err) {
                    console.log("có lỗi trong hàm update file json")
                    rej(err);
                }
                if (data) {
                    const _content = JSON.parse(data);
                    const _update = Object.assign({}, _content, _ctUpdate)
                    const _str = JSON.stringify(jsonMultilineStrings.split(_update), null, '    ');
                    fs.writeFileSync(pathFile, _str, { encoding: 'utf8', flag: 'w' });
                }
                res(pathFile);
            });

        } catch (error) {
            console.log(error);
        }
    })

}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function getContentFileCSV(fileCsv) {

    // Write a file with one JSON per line for each record
    // const json = records.map( JSON.stringify ).join('\n');

    return new Promise((reslove, reject) => {

        let _files = [];
        let lr = new LineByLineReader(fileCsv);

        lr.on('error', function (err) {
            // 'err' contains error object
            reject(err);
        });

        lr.on('line', function (line) {
            let regex = /'/g;
            let item = line.replace(regex, "")
            // 'line' contains the current line without the trailing newline character.
            _files.push(item);
        });

        lr.on('end', function () {
            // All lines are read, file is closed now.
            reslove(_files);
        });

    })


}

function isVideo(type) {
    switch (type.toLowerCase()) {
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
            // etc
            return true;
    }
    return false;
}


function getCtxJsonFile(_pathFileJson) {

    return new Promise((reslove, reject) => {

        if (!fs.existsSync(_pathFileJson)) {
            reslove(null)
        } else {
            try {
                fileContents = fs.readFileSync(_pathFileJson, 'utf-8').toString();
                reslove(fileContents);
            } catch (err) {
                console.log("Lỗi load file content in json file")
                reject(err)
            }

        }

    })

}


var _total = 0;

function main(headerPhotoUpload, headers, csvFile, _path_date_video = './video/17-4/', _path_date_json = './json/17-4/', _count) {

    return new Promise(async (res, rej) => {

        // Cookie driver account được phép truy cập 
        let _rows = await getContentFileCSV(csvFile);

        console.log("start.... load", csvFile)

        let _getLinks = _rows.slice(1, _rows.length).map(async line => {

            var item = line.split(',"');
            let _folderPath = item[1].replace(/[\",]+/g, "").split(">");
            let _name_path_root = _folderPath[1].trim();
            let _name_path_child = item[0] && item[0] ? item[0].trim() : '';
            let _name_file = item[3].replace(/[\",]+/g, "").trim();
            // let _type_file = ;
            let _folderPathRoot = _folderPath[1] ? convertString(_folderPath[1].trim()).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') : null;
            let _folderPathChild = _folderPath[2] ? convertString(_folderPath[2].trim()).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') : null;
            let _filename = convertString(item[3].trim()).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
            let _googleLinkView = item[2];
            let _googleLink = item[4];
            let _linkSplit = _googleLink.split("/");

            let _id = _linkSplit[_linkSplit.length - 2].trim();
            let _fileFormat = item[8];
            let _fileType = item[9].replace(/[\",]+/g, '')
            let _pathFileJson = _path_date_json + _folderPathRoot + (_folderPathChild ? '/' + _folderPathChild : '') + '/' + _filename + '.json';


            // load json content to check
            let _ctxJson = await getCtxJsonFile(_pathFileJson);
            let _json = JSON.parse(_ctxJson) || {};

            let _item = {
                fullPath: _name_path_root + (_name_path_child ? '/' + _name_path_child : '') + '/' + _name_file + '.' + _fileType,
                root: _folderPathRoot,
                child: _folderPathChild,
                name: convertString(_filename.trim()).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''),
                glink: _googleLink,
                upload: _json.upload || false,
                dowload: _json.dowload || false,
                id: _id,
                file_format: _fileFormat,
                type: _fileType,
                uriL3: _json.uriL3,
                urisL3: _json.urisL3,
                fileJson: _pathFileJson,
                fileVideoPath: _path_date_video + _folderPathRoot + (_folderPathChild ? '/' + _folderPathChild : '') + '/' + _filename + '.' + _fileType
            }

            return _item;
        })

        let _loadingCsv = await Promise.all(_getLinks).then(values => {
            return values.sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })
        })

        let _loadUriL3 = [];
        for (let _i = 0; _i < _loadingCsv.length; _i++) {
            let _line = _loadingCsv[_i];

            if (_line && _line.id && _line.upload != true && _line.dowload != true) {

                if (isVideo(_line.type)) {
                    var _result = await getLinkVideo(_line.id, _line.name, headers);

                    if (_result) {
                        _line.uriL3 = _result.uri;
                        _line.urisL3 = _result.uris;
                    }
                }
            }

            console.log("running..", _line.name)
            _loadUriL3.push(_line);
            let _delay = randomInteger(200, 1000);
            let timeLoad = 0;
            let _timeRunning = setInterval(() => {
                // console.log(timeLoad + 's')
                timeLoad = timeLoad + 1;
            }, 1000);

            // console.log("Chờ " + Number.parseFloat(_delay / 1000) + "s tải link " + _line.name)
            await sleeper(_delay)
            delete timeLoad;
            clearInterval(_timeRunning);
        }

        let _dbs = await Promise.all(_loadUriL3).then(values => {
            return values;
        });

        // create folder save jçson text save link

        _dbs.map(_data => {

            if (_data.upload) {
                return _data;
            } else {

                if (_data.id && _data.root) {

                    console.log("folder root", _data.root);
                    createFolder(_path_date_video + _data.root);
                    createFolder(_path_date_json + _data.root);

                    if (_data.child) {
                        createFolder(_path_date_video + _data.root + '/' + _data.child);
                        createFolder(_path_date_json + _data.root + '/' + _data.child);
                    }
                    createFileJson(_data.fileJson, _data, null, '   ');
                }
            }
        })


        // dowload về máy demo lưu ý không chạy song song luồng kẻo chồng chéo dữ liệu request dowload và upload 
        for (let n = 0; n < _dbs.length; n++) {

            let _data = _dbs[n];

            if (_data.uriL3 && _data.name) {
                // delay 
                if (_data.dowload != true) {

                    let timeLoad = 0;
                    let _timeRunning = setInterval(() => {
                        timeLoad = timeLoad + 3;
                        console.log("video thứ " + (n + 1) + " đang tải xuống " + timeLoad + ' giây -', _data.name)
                    }, 3000);


                    let _resDowload = await dowLoadVideo(headers, headerPhotoUpload, _data, _timeRunning, _count);

                    delete timeLoad;

                    await updateFileJson(_data.fileJson, { dowload: _resDowload, uriL3: _data.uri, urisL3: _data.uris });

                    let _resUpload = await uploadGoolePhoto(headerPhotoUpload, _data.fileJson, _data.file_format);

                    console.log("upload to DRV", _resUpload)
                    if (_resUpload && _resUpload.uri) {
                        _total++;
                        await updateFileJson(_data.fileJson, { uri_photo: _resUpload.uri, _photo_name: _resUpload._photo_name, upload: true })
                        console.log('\n \n \n' + "upload success to DRV ", _total + '\n \n \n')
                    }

                } else {

                    if (isVideo(_data.type)) {
                        if (_data.upload != true) {
                            console.log("continue upload to DRV")
                            let _resUpload = await uploadGoolePhoto(headerPhotoUpload, _data.fileJson, _data.file_format);
                            console.log("upload to DRV", _resUpload)
                            if (_resUpload && _resUpload.uri) {
                                _total++;
                                await updateFileJson(_data.fileJson, { uri_photo: _resUpload.uri, _photo_name: _resUpload._photo_name, upload: true })
                                console.log('\n \n \n' + "upload success to DRV ", _total + '\n \n \n')
                            }
                        }
                    }

                }

                await sleeper(randomInteger(2000, 3000));
            }

        }



        // let _link = await uploadGoolePhoto(_headerPhotoUpload, target);




        res("next file continue")
    })
}


async function getFileCSV(directoryPath) {
    try {
        return await new Promise((reslove, reject) => {
            fs.readdir(directoryPath, function (err, files) {
                if (err) {
                    console.log('đọc file csv bị lỗi');
                    reject(err);
                    // return console.log('Unable to scan directory: ' + err);
                }
                reslove(files)
            });
        })
    } catch (error) {
        console.log('error', error);
    }
}


async function init() {

    const _count = 0;
    const _csvFolder = './fileCsv/niviki/';
    const _videoFolder = './video/niviki/';
    const _jsonFolder = './json/niviki/';

    //https://drive.google.com/file/d/1ULinfBFVMPApqQiNfIIsmuR24POKeHPq/preview 
    // lấy từ link https://drive.google.com/u/0/get_video_info?docid= lấy từ request headers

    const headers = {
        'cookie': "SEARCH_SAMESITE=CgQIrZIB; SID=8wfE6jAmQV78jMUuXAHZdYHxOQWGNLHx6JbkLouwGSnVw-_NzGmWW0jmW30_abnmljZYLQ.; __Secure-3PSID=8wfE6jAmQV78jMUuXAHZdYHxOQWGNLHx6JbkLouwGSnVw-_Nf8Spz2NvijPsDSwQU4TM7g.; HSID=Agc9uMlAsxx_qlc9l; SSID=A-7WHERaSZOnXVVVd; APISID=2a3TUUoXqiAdqTKL/A0phg_RrRx4wLk-Ed; SAPISID=HIYDBWP6Gg-2dx-A/AdFvj0SDo87fAOyzr; __Secure-3PAPISID=HIYDBWP6Gg-2dx-A/AdFvj0SDo87fAOyzr; DRIVE_STREAM=VF2RgmbYBkQ; 1P_JAR=2021-04-25-07; NID=214=qt0iyVVJ3QBafy-RrvTtEIeqP0PS0d6Lp6IKyNKD9lsgMyhsVo8Ymk7LD8ajVXm6NaBw0pTbtsN_o6PYhD0CVhEx3Qi8TPHSCu6BUCH5asFLTZnVQWXTIZmdG2-mzvwgUZ5gHg2zzmQBiUnxIWRP3PDniHr5vhQXRmI2-yNQDCNGG2PIKG0Iz8F8SN2zzAogaGnxoOGn6NcxfWx2uBuFolssQdaR0qQ59woeKebkyTaX4VqClo_tZWBlwAbJwbzGBof4vIAvFBKC7WYqu1-hlHcovrQCmmqHLxK3TxoYwim_X1s; SIDCC=AJi4QfHSZ34WMScZ75mJsWm-ffuITYifNJx_Efpu8-1Zk1GDZjbRFyMLXaxz2uXn83qsDPmOunc; __Secure-3PSIDCC=AJi4QfGgMnXG6tR4yg7iCCqvj_P147GC3JDVh7saf22jk3SXvHBOndt8SYpkBFa1IjuXRPTCLA"
    };

    // https://photos.google.com/_/upload/uploadmedia/interactive?authuser=0&upload_id 
    const CookiePhotoUpload = 'OTZ=5935861_28_28__28_; OGPC=19022519-1:; SEARCH_SAMESITE=CgQIrZIB; OSID=8geMeRctBSYdOKjcn2FZXZnZ4MW3YOo7lgKaX-qsKfwvkyVjN9wnQ5TYXunkn_bCa9LmAg.; __Secure-OSID=8geMeRctBSYdOKjcn2FZXZnZ4MW3YOo7lgKaX-qsKfwvkyVjmfONGUv0YFn5sUOdgJBTuw.; SID=8geMeXx9VBle9J2fY0jl_B5GrF3rMqlu7F0fzqX3kqRyJg9dLyPwy4lcomLBbOCkhfCDQA.; __Secure-3PSID=8geMeXx9VBle9J2fY0jl_B5GrF3rMqlu7F0fzqX3kqRyJg9dJdcSquZpvcwgaNb7v-YTHA.; HSID=AYkVR1x708aZwmuip; SSID=ACNBThsg6091iFnS_; APISID=kzwI_yDWf_AyWryc/AXjFVJ4zbedGi-hTM; SAPISID=9uUOKHxECKUma0Cz/AGLrcLhW1e9wlj5Uj; __Secure-3PAPISID=9uUOKHxECKUma0Cz/AGLrcLhW1e9wlj5Uj; NID=213=HdCZMwBb5gSavI67ZnknPZKzuDoaNFI3wlY6VZYVdqYoN30oW20SweUL3E42J_VKaCi_gMNBAn7KZa5kCbhFtNnRfL6EZV_RqDo6eT4E5EN2GvIyRugEzNcbjK98ifnjl1eI23I029punqLcgti7J4BJHI7DSu-93VgzONNLuQPa73YiPHTrE9heW7OeuDNCHM8purNOrZWw_THQhLtZtmKCz8SXLra9GeUKSucA9Rfi2Bv3lEc7zd7gNN7Kp8GDWyBErYgvUBE4l7C2XVERcaKxBh4AjTXi; 1P_JAR=2021-04-20-08; SIDCC=AJi4QfG8go3kj5xtUvU7dJkWRevbGC_B0NxcjXWWIn9L6noc7e6B6q-iLRhrvJBBUadFbSzwPC8; __Secure-3PSIDCC=AJi4QfE3ic_jC2jPVUehBk7kzJuhUQliJO9P6grSzwO92oj2VSzLfxNPpOv7YSRkyFp4sbTJ2_4';

    const directoryPath = path.join(__dirname, _csvFolder);
    //passsing directoryPath and callback function

    // const _files = await new Promise((reslove, reject) => {
    //     fs.readdir(directoryPath, function (err, files) {
    //         if (err) {
    //             console.log('đọc file csv bị lỗi');
    //             reject(err);
    //             // return console.log('Unable to scan directory: ' + err);
    //         }
    //         reslove(files)

    //     });
    // });

    const _files = await getFileCSV(directoryPath);

    if (!_files || _files.length === 0) {
        console.log('không có file csv');
        return;
    }

    // for (let _f = 0; _f < _files.length; _f++) {
    //     _fileCsv = _files[_f];

    //     main(CookiePhotoUpload, headers, `${_csvFolder}/${_fileCsv}`, _videoFolder, _jsonFolder, _count)

    // }

    for (const file of _files) {
        main(CookiePhotoUpload, headers, `${_csvFolder}/${file}`, _videoFolder, _jsonFolder, _count)
    }

    await sleeper(1000000)

}


init();



