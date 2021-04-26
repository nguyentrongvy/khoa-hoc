
const fs = require('fs');
var request = require('request');
const path = require("path");
const qs = require('querystring');
const { nanoid } = require('nanoid')

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}


function getToken(cookie) {

    let uri = `https://photos.google.com/u/0/`;

    return new Promise((reslove, reject) => {

        var headers = {
            'Cookie': cookie
        };

        var options = {
            url: uri,
            method: 'GET',
            headers: headers,
        };

        function callback(error, response, body) {
            if (error) {
                reject(error)
            }
            if (!error && response.statusCode == 200) {
                let _vi_tri_tu = body.toString().indexOf('SNlM0e');
                let _cat_chuoi = body.toString().slice(_vi_tri_tu - 1, _vi_tri_tu + 400);
                let _lay_token = _cat_chuoi.split(',')[0];
                let _token = JSON.parse(`{${_lay_token}}`);
                reslove(_token);
            } else {
                reslove(null)
            }
        }

        request(options, callback);
    });

}


function first(_fileName, _flsize, cookie) {

    return new Promise((reslove, reject) => {

        var headers = {
            'Content-Type': 'application/json',
            'Cookie': cookie
        };


        var dataString = {
            "protocolVersion": "0.8", "createSessionRequest":
            {
                "fields": [{
                    "external": {
                        "name": _fileName,
                        "filename": _fileName,
                        "put": {},
                        "size": _flsize
                    }
                }]
            }
        };

        var options = {
            url: 'https://photos.google.com/_/upload/uploadmedia/rupio/interactive?authuser=2',
            method: 'POST',
            headers: headers,
            body: JSON.stringify(dataString)
        };

        function callback(error, response, body) {
            if (error) {
                reject(error)
            }
            console.log(body)
            if (!error && response.statusCode == 200) {
                if (body) {
                    let obj = JSON.parse(body);

                    if (obj['sessionStatus'] && obj['sessionStatus']['externalFieldTransfers'][0]['putInfo']['url']) {
                        console.log("Test request send succes photo Driver")
                        reslove(obj);
                    } else {
                        throw Error("Chết cookie upload driver photo search link https://photos.google.com/_/upload/uploadmedia/interactive?authuser=0&upload_id")
                    }
                } else {
                    // https://photos.google.com/_/upload/uploadmedia/interactive?authuser=0&upload_id=ABg5-UyVFTkXx2kPgYxUlUfD21fG1wP6dSdlVzU-2EHCXRghfvVVDEL-OjC1nZO6L_dpKBzruvKPeqV7SnPKDCebq5-bHNdw1Q&upload_protocol=resumable
                    throw Error("Chết cookie rồi test request send to thu lay link trong request https://photos.google.com")
                }
            } else {
                reslove(null)
            }
        }

        request(options, callback);
    });

}



function second(uri, _file, cookie, type_content) {
    return new Promise((reslove, reject) => {

        var headers = {
            'Content-Type': type_content.toLowerCase().trim(), // type_content
            'Cookie': cookie
        };

        var dataString = fs.createReadStream(_file);

        var options = {
            url: uri,
            method: 'POST',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
            if (error) {
                reject(error)
            }

            if (!error && response.statusCode == 200) {
                let obj = JSON.parse(body)
                reslove(obj);
            } else {
                console.log("kiểm tra xem chết cookie rồi")
                throw Error("Chết cookie upload driver photo search link https://photos.google.com/_/upload/uploadmedia/interactive?authuser=0&upload_id")
            }

        }

        request(options, callback);
    });
}


function _there(token = 'APwFbIMEG6RcZhX_IuE-ZT5yOMee:1618483156801',
    base64 = 'CAISyQMAqD4uLaXlx5Vm8DeblvQ3T1W1FIYRNFLHLHJ+LdQj7mNL3O2v0O1JMH+0nlnsUUAAWMw2trHG/m4sz1c4w8ZbRrTy1GQbgeHu9mkrTgss3nT6ivCsSM3c7IEO8osPplutUZYimkHQrSk8O6iq1YNNGocz+zz8PloTmOAs40re+UCI7Gb3MSGZW4vben5G8F45oq1jIB3UpQTYuNwKYTWsMV2Ng2CWQfPSEQD37Cd8hXbeIYBsuxTGhlQKrnkLouZGLCS+DIlJUw4PD9qwX5tW9NTOoiA8TTgOIc5lGWB4E3fmmy43ZRL/hqKWwqagCawzBh49tbUR4QPbtrlcfS1TBMjAu47SGq/RJuwjXV6wlIJ0ciuZvdmbTE7UpCINnf+mwGBpM9UNaXZ4QjMmpQ8FZBx/+8DymQyT7vHrYCIMWLc1W4muYiI6FgP+Rl30flf5Wv+SNAlloKe9DRk2P320j2UZfax/BEdfnU+200k+R3wh7oG5Yb9JjeUCBdD4bIVadRvXiDaPhuASWsRWZ2W3UbcPZ7n6fP0hIi6w6TO74kAfTowLxoR4zyzDotVXcYvBLNeK5Hy/IiwfZZnA+whtAt/Aj/O701ry',
    _filename = "video.mp4",
    _time = new Date().getTime(),
    cookie
) {


    return new Promise((res, rej) => {

        var headers = {
            'authority': 'photos.google.com',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'x-same-domain': '1',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'accept': '*/*',
            'origin': 'https://photos.google.com',
            'x-client-data': 'CIy2yQEIpbbJAQjEtskBCKmdygEIiLnKAQj4x8oBCLbvygEIsZrLAQjknMsBCKidywEI6J3LARjgmssB',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://photos.google.com/',
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'cookie': cookie

            // 'SEARCH_SAMESITE=CgQIqpIB; OTZ=5935861_28_28__28_; OGPC=19022519-1:; HSID=Ab7S1ryS3SK_QFnGf; SSID=A1SG51XjkY8u7U0kY; APISID=HrArlmNiPxiAkWF4/AYJbm4lZ_I02rPBst; SAPISID=VxiuqH2d_TOmkXMH/AOCJ_K1T9K953gcj5; __Secure-3PAPISID=VxiuqH2d_TOmkXMH/AOCJ_K1T9K953gcj5; OSID=8geMecMKCLAwWtlrldAanBphgybN3OJdCr2EFlGyXyB_ZQUUU2S6nJr6RCV5He_kt57c7Q.; __Secure-OSID=8geMecMKCLAwWtlrldAanBphgybN3OJdCr2EFlGyXyB_ZQUUKthtLC0TqJnvINanMBv6ww.; SID=8geMebMqJZPPD1-fLUXPcJAVBwbhOeMij4U_4YlCU_VRtt-Kmp0ZyzVG9A0vckQOAjIoeg.; __Secure-3PSID=8geMebMqJZPPD1-fLUXPcJAVBwbhOeMij4U_4YlCU_VRtt-KLQCFCwgB5WYtf7bVIQZQSQ.; NID=213=UI9R2J5i4JuggcjiDMYNCMQGg7OicuXQfN8AQaWXonbq4J0bBdawPa-T-qNtuMs6Ir20GGD_yNGY4_aHtxaAwjyBJDD3RSv-pejPMR_2wdKMhbFypQmwFZNGOcjd4HrA7HlhDMO5MhRnsw3k6xvjL2D6vgWCmFUEBOlDKt3d6KvBP6YF-WaEVfAKidaGxbbN-LoIK-RkGWjroCb0tyVGgJ00cbQpuApcCrI; 1P_JAR=2021-04-15-09; SIDCC=AJi4QfFSYh11d_lDb6QhyOiNl7Tb8gsYkUIf25qU1Fudpg1b8xDCFAzP805M_0xkt4ii5PkPTQ; __Secure-3PSIDCC=AJi4QfFmFz6MwYcGyqm191frchD8loPzmDuAA2C1X8jvFbOKvjJx6J4E1xRA55_xNdfrjnt1iA'
        };

        // var dataString = {
        //     'f.req': '[[["mdpdU","[[[\\"CAIS2QMAqD4uLRjmTkQgsTpx+5SMYqTFSg/S9eDiGQn7YCY56Py+5u60SWynTMxAKZuDWHj87bfapDNvmm1BD2tmXoUzy/10h8kC6qzsGIBjiQm87ivPu+cZJM170U9QMxzmCkjcaHq9ZsSa60tTfE3Fjf8cC++8CDaqg6u+VrKdiTQnX0pgl0W7y4ZcvZ+0X2Inw1vDMR4QDuz+cevbxHkrZSkVLKMssSWFoF2e2AQNVwvNFjZVbs00DhtiZVUdPhojghmniLGpIcHAojTV/4LrXGTTMg5nmfNGGMY6egrA+Xe7zolK3JJ32+OyIC95da3dnrR9wt/FD3WPG9tu0kKRvpAxBY2psB+hXp+Uo95+gb4ICPaKUkURoUYBT97eqhtelkE9QyaZ79319bA0gAFSbA1zr1Qh3uqz7zkMNNUOPVdC4SeP4dXGO2UZEHNpGthFcRS8pYcETauyWVBhDPAii6GbJfhoFWjCyV2PEotOZ3GIBBJAaGhJ3KX+Mbn+v4X2usYTcI4HOQ3yk2r+X4NhXU9Mkz6MxTTzOpwq7678pemG4LgyQEy44GjKsE/HWouwJN2IMcuV1NmVxSw0MGVS1U+H6/ShEt/CVKzr/brLgWaRumQSCNxWoxe8AA==\\",\\"Bài 06. Luyện thanh cơ bản với nguyên âm \\\\\\"I\\\\\\".mp4\\",1618464275639]]]",null,"generic"]]]',
        //     at: 'APwFbIMu4sxFS3s9MvkLJCEyos_u:1618478234839'
        // }

        // console.log(_filename.replace(/[^a-zA-Z0-9.]/g, ''))

        // nanoid()

        var dataString = {
            'f.req': '[[["mdpdU","[[[\\"' + base64 + '\\",' + _filename + ',' + _time + ']]]",null,"generic"]]]',
            at: token
        }


        // console.log(qs.parse(dataString))

        var options = {
            url: 'https://photos.google.com/u/2/_/PhotosUi/data/batchexecute',
            method: 'POST',
            headers: headers,
            body: qs.stringify(dataString)
        };

        function callback(error, response, body) {
            if (error) {
                rej(error)
            }

            if (!error && response.statusCode == 200) {
                console.log("Upload success to DRV....");
                res(body);
            } else {
                console.log("kiểm tra xem chết cookie rồi")
                throw Error("Chết cookie upload driver photo search link https://photos.google.com/_/upload/uploadmedia/interactive?authuser=0&upload_id")
            }
        }

        request(options, callback);

    })
}


async function main(
    cookie = 'SID=8geMeZvDC7yJaCMgx5lk1TslVkn9WUQVTu0rKZpQG5bisBnb862aK6BzSv9I6XgRgtEL_w.; __Secure-3PSID=8geMeZvDC7yJaCMgx5lk1TslVkn9WUQVTu0rKZpQG5bisBnbArc_J3Q22bevCjivyoesQQ.; HSID=Aaiv2UMDVS-QvnoC9; SSID=AzMXqC5qDx7Kzjyww; APISID=EaoIEGtRps_W3rV3/AE00FnO_5nrDVupSp; SAPISID=E25oHotVSFHzE6_P/ALJ6yg_fJhZfL1wxo; __Secure-3PAPISID=E25oHotVSFHzE6_P/ALJ6yg_fJhZfL1wxo; OSID=8geMeYsn_0uVTSOx2O5-yOWQ6x-_obInnHBRzLUwUEviQEYCHgzKXEPnNOytfHOIZIOcwA.; __Secure-OSID=8geMeYsn_0uVTSOx2O5-yOWQ6x-_obInnHBRzLUwUEviQEYCPgStS2yD0zAVZb2H7FC13A.; OTZ=5940212_28_28__28_; NID=213=GZqZaZT-B2AyUcz0MIYia4_L53uEoR00SH6nPucFWblq8EjuNIFT88oSluZugqyVN_c9iyUi5EVj6TXtxZSVUb7hy6t_31_eOEFPfP9f-FbGY6NGMpHfBe2K6hU-iAhHinTA7_FVdGIDPHeIwxImJiHIq4SA8MrHrDwziE1ZynlbkTmMUOQEPNqi1Dmz1zx29InzcSv1sqXQ7BcPa01pzhw; 1P_JAR=2021-4-18-3; SIDCC=AJi4QfEXRmmmCl98rB_FnXO8q68QawBBvCXnVzYFJzXzwl7ibs_letNKgkQTIsBUFY87iPtBrQ; __Secure-3PSIDCC=AJi4QfHujE9zEDzpZ3ttuoF25qoU-WK9LEee-KYh9cb1UkVJEMKZuCpKLgJ1HRzvl92cy7WCzh0',
    _file,
    type_content
) {

    return new Promise(async (res, rej) => {
        try {
            // cookie này lên là account unimited ko nó tính dung lượng tối đa vào 15GB hết úp.
            /* cookie của photodriver sử dụng 
        
            const cookie = 'SEARCH_SAMESITE=CgQIqpIB; OTZ=5935861_28_28__28_; OGPC=19022519-1:; HSID=Ab7S1ryS3SK_QFnGf; SSID=A1SG51XjkY8u7U0kY; APISID=HrArlmNiPxiAkWF4/AYJbm4lZ_I02rPBst; SAPISID=VxiuqH2d_TOmkXMH/AOCJ_K1T9K953gcj5; __Secure-3PAPISID=VxiuqH2d_TOmkXMH/AOCJ_K1T9K953gcj5; OSID=8geMecMKCLAwWtlrldAanBphgybN3OJdCr2EFlGyXyB_ZQUUU2S6nJr6RCV5He_kt57c7Q.; __Secure-OSID=8geMecMKCLAwWtlrldAanBphgybN3OJdCr2EFlGyXyB_ZQUUKthtLC0TqJnvINanMBv6ww.; SID=8geMebMqJZPPD1-fLUXPcJAVBwbhOeMij4U_4YlCU_VRtt-Kmp0ZyzVG9A0vckQOAjIoeg.; __Secure-3PSID=8geMebMqJZPPD1-fLUXPcJAVBwbhOeMij4U_4YlCU_VRtt-KLQCFCwgB5WYtf7bVIQZQSQ.; NID=213=APwN-sHu9U82jNNuTYUv89jSZygZuysUDVBrLLXqo9iYzZwxguhVPkUEq8q5kOdiLXlsdpZsUqJqCcHkLdJoCRM8YWmyaUTpikBwAkAYLAh4P4a0U8D_lL7IIKNj0thH8qTBrdVnNgTg5c0x7-t5TDI1IQsR0T65JRFt5hAbjDPGYDQlwJW7DVb4Zugee9zmHJ6egwjojVJ-WWW0ishnoXoOLpORjb0CAJU; 1P_JAR=2021-04-15-05; SIDCC=AJi4QfGjsuMtHjgo5U12lU5mXjNpp6IFb9fZW197jcpa37Q6jnSaLagcw68PKg5qsLhapBb6bw; __Secure-3PSIDCC=AJi4QfGRq-3nsNzYzglWwSFeIb0eF3t6YCSYw32xJR-l0F4pzQvJ7a1-hQW2TRu3nx7hcrP-Kg';
        
            let _khoa_hoc = `KN22F9 - Thu âm Mix Vocal cơ bản tới nâng cao trên phần mềm cubase 59 pro cho cả 2 hệ điều hành Win và Mac`;
            let _phan_hoc = `Phần 2 Thiết lập Cubase 5`;
            let _video = `Bài giảng 06 Hướng dẫn lưu (Save) file đang thu âm.mp4`;
            let _file = `./video/${_khoa_hoc}/${_phan_hoc}/${_video}`
            */
            // cookie = 'SID=8geMeZvDC7yJaCMgx5lk1TslVkn9WUQVTu0rKZpQG5bisBnb862aK6BzSv9I6XgRgtEL_w.; __Secure-3PSID=8geMeZvDC7yJaCMgx5lk1TslVkn9WUQVTu0rKZpQG5bisBnbArc_J3Q22bevCjivyoesQQ.; HSID=Aaiv2UMDVS-QvnoC9; SSID=AzMXqC5qDx7Kzjyww; APISID=EaoIEGtRps_W3rV3/AE00FnO_5nrDVupSp; SAPISID=E25oHotVSFHzE6_P/ALJ6yg_fJhZfL1wxo; __Secure-3PAPISID=E25oHotVSFHzE6_P/ALJ6yg_fJhZfL1wxo; OSID=8geMeYsn_0uVTSOx2O5-yOWQ6x-_obInnHBRzLUwUEviQEYCHgzKXEPnNOytfHOIZIOcwA.; __Secure-OSID=8geMeYsn_0uVTSOx2O5-yOWQ6x-_obInnHBRzLUwUEviQEYCPgStS2yD0zAVZb2H7FC13A.; OTZ=5940212_28_28__28_; NID=213=GZqZaZT-B2AyUcz0MIYia4_L53uEoR00SH6nPucFWblq8EjuNIFT88oSluZugqyVN_c9iyUi5EVj6TXtxZSVUb7hy6t_31_eOEFPfP9f-FbGY6NGMpHfBe2K6hU-iAhHinTA7_FVdGIDPHeIwxImJiHIq4SA8MrHrDwziE1ZynlbkTmMUOQEPNqi1Dmz1zx29InzcSv1sqXQ7BcPa01pzhw; 1P_JAR=2021-4-18-3; SIDCC=AJi4QfEXRmmmCl98rB_FnXO8q68QawBBvCXnVzYFJzXzwl7ibs_letNKgkQTIsBUFY87iPtBrQ; __Secure-3PSIDCC=AJi4QfHujE9zEDzpZ3ttuoF25qoU-WK9LEee-KYh9cb1UkVJEMKZuCpKLgJ1HRzvl92cy7WCzh0';
            let _fileName = path.basename(_file);
            let _fileNameReplace = nanoid() + _fileName.replace(/[^a-zA-Z0-9.]/g, '');

            // tính file size get file name

            var _flsize = getFilesizeInBytes(_file);
            // request 1 
            let _requestGetUrlGoogle = await first(_fileNameReplace, _flsize, cookie);
            let _resUrl = _requestGetUrlGoogle['sessionStatus']['externalFieldTransfers'][0]['putInfo']['url']
            let _response2 = await second(_resUrl, _file, cookie, type_content);


            if (!_response2.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo) {
                throw Error("Chết cookie upload driver photo search link https://photos.google.com/_/upload/uploadmedia/interactive?authuser=0&upload_id")
            }

            let _base64 = _response2.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.upload_token_base64;
            let resToken = await getToken(cookie);
            let _token = resToken['SNlM0e']
            let _time = new Date().getTime();
            // console.log("_token", _token);
            // console.log("_base64",)
            // console.log("_filename", _fileNameReplace);
            let _resLink = await _there(_token, _base64, _fileNameReplace, _time, cookie);

            let _imgLnk = null;

            if (_resLink && _resLink.indexOf('https://') > 0) {
                _imgLnk = _resLink.slice(_resLink.indexOf('https://') - 2, _resLink.length).split(`\\`)[1].replace('\"', "");
                // thêm tag =m18 hoặc m59 hoặc m22 hoặc m37 tương ứng với các định dạng video 360,480,720,1080
            }

            res({
                uri: _imgLnk,
                _photo_name: _fileNameReplace
                // _response: _resLink
            })

        } catch (error) {
            console.log("LỖI TRONG QUÁ TRÌNH UPLOAD", error)
            rej(error)
        }

    })

};

module.exports = main