# Overview
Lambda function for uploading submission data to S3, shipped with unit test using jest.

# Environment Variables
* `BUCKET_NAME` : bucket name
* `BUCKET_FOLDER` : bucket folder

# Deployment
For now, no pipeline has been setup.
Only using aws cli:

    # you need to trim node_modules, exclude production
    rm -rf node_modules/
    npm install --production

    # then zip your file
    zip -r function.zip . \
        -x '*test*' -x 'package*.json' \
        -x '*coverage*' -x '*.git*' -x '*.idea*' \
        -x '\.gitignore' -x '*.DS_Store*' \
        -x '*.md'

    aws lambda update-function-code --function-name azdiscover-upload-to-s3 --zip-file fileb://function.zip


This syntax will be translated into pipelines.
