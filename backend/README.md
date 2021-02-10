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

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Serverless Framework documentation](https://www.serverless.com/framework/docs/).