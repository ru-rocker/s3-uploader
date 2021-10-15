const AWS = require('aws-sdk');
const crypto = require('crypto'); 
const s3 = new AWS.S3();

const bucketName = process.env.BUCKET_NAME;
exports.handler = async (event) => {
    
    console.log(event);
    console.log(event.requestContext.authorizer.username);
    console.log('body', event.body);
    
    const company = event.queryStringParameters.company;
    const sha256 = crypto.createHash('sha256').update(event.body).digest('hex');
    const buf = Buffer.from(JSON.stringify(JSON.parse(event.body)));
    const referenceNo = event.headers.referenceNo;
    const bucketKey = process.env.BUCKET_FOLDER + referenceNo + '.json';
    
    const params = {
        Bucket: bucketName,
        Key: bucketKey,
        Body: buf,
        ContentType: "application/json",
        Metadata: {
            'sha-256': sha256,
            'username': event.requestContext.authorizer.username,
            'company' : company,
            'referenceNo': referenceNo
        },
    };

    const headParams = {
        Bucket: bucketName,
        Key: bucketKey
    };
    
    const metaRes = await s3.headObject(headParams).promise()
        .then(function(data) {
            console.log('head data:', data);
            return {
                'statusCode': 302,
                'data': data
            }
        }, function (err) {
            console.log(err, err.statusCode);
            return {
                'statusCode': err.statusCode,
                'data': err
            };
        });

    if(metaRes.statusCode != 302 || metaRes.data.Metadata['sha-256'] != sha256) {
        const response = 
            await s3.upload(params).promise().then(function(data) {
                console.log(`File uploaded successfully. ${data.Location}`);
                return {
                    statusCode: 200,
                    body: JSON.stringify(data)
                };
            }, function (err) {
                console.error("Upload failed", err);
                return {
                    statusCode: 500,
                    body: JSON.stringify(err)
                };
            });
        return response;
    } else {
        const response = {
            statusCode: 302,
            body: JSON.stringify(metaRes),
        };
        return response;
    }
    
};
