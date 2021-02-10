This project uses Serverless-Framework in order to deploy the project stack, including AWS API Gateway, DynamoDB tables, S3 bucket and Lambda
 functions that provide the backend functionality. 
 
## How manage serverless

To work with serverless, use the following

### `sls deploy -v --aws-profile <PROFILE>`

Replace < PROFILE > with an AWS profile that is allowed to deploy in your AWS account.<br>

The stack should give you and output overview which includes the API Gateway ID.
Use this ID and add it to the client config.ts file.

### `sls remove -v --aws-profile <PROFILE>`

Deletes the previously deployed setup.<br>
It might be that you need to manually delete the s3 buckets, if the buckets are not empty<br>

### `sls deploy function --function <FUNCTION-NAME> --aws-profile <PROFILE>`

Deploys / updates a specific function without validating the whole stack.<br>

## Learn More

You can learn more in the [Serverless Framework documentation](https://www.serverless.com/framework/docs/).