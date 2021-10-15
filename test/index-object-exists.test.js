const aws = require('aws-sdk');
const lambda = require('../index')

jest.mock('aws-sdk', () => {
    const putObjectOutputMock = {
        promise: jest.fn(),
    };
    const putObjectMock = jest.fn(() => putObjectOutputMock);

    const headObjectOutputMock = {
        promise: jest.fn(() => Promise.resolve({
            AcceptRanges: 'bytes',
            LastModified: new Date('2018-04-25T13:32:58.000Z'),
            ContentLength: 23,
            ETag: '"ae771fbbba6a74eeeb77754355831713"',
            ContentType: 'text/plain',
            Metadata: {
                'sha-256': '20b6b36a2adc92c7b9acfbbafa1293ecb4b80e828ad708f0c655a22a15d5cb1f',
            },
        }), () => { }),
    };
    const headObjectMock = jest.fn(() => headObjectOutputMock);

    const mS3 = {
        headObject: headObjectMock,
        upload: putObjectMock,
    };
    return { S3: jest.fn(() => mS3) };
});

describe('lambda_s3_uploader', () => {

    var event;
    beforeEach(() => {
        event = {
            requestContext: {
                authorizer: {
                    username: 'dummy'
                }
            },
            body: JSON.stringify({ 'abc': 100 }),
            queryStringParameters: {
                company: 'life'
            },
            headers: {
                referenceNo: '0000000011'
            }
        }
    });

    it('head object exists', async () => {
        const result = await lambda.handler(event);
        try {
            expect(result)
                .toEqual({ "body": "{\"statusCode\":302,\"data\":" +
                        "{\"AcceptRanges\":\"bytes\",\"LastModified\":\"2018-04-25T13:32:58.000Z\",\"ContentLength\":23," +
                        "\"ETag\":\"\\\"ae771fbbba6a74eeeb77754355831713\\\"\"," +
                        "\"ContentType\":\"text/plain\"," +
                        "\"Metadata\":{" +
                        "\"sha-256\":\"20b6b36a2adc92c7b9acfbbafa1293ecb4b80e828ad708f0c655a22a15d5cb1f\"}}}",
                    "statusCode": 302 });

        } catch (e) {
            console.log(e);
            throw new Error();
        }
    })

});