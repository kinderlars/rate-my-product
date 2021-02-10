# Project Summary
This project was created as part of the Udacity Cloud Developer Nanodegree and shows the usage of the serverless framework. <br>
The services created can be split into a simple frontend and a main backend component. 

What does the service do?<br>
The service allows logged in users to create products and ratings. It is worth pointing out, that all logged in users see all products and ratings
, but cannot modify or delete ratings that were not created by them. 
Never the less, if a user decides to delete a product, the linked ratings will also be dropped. 
The logic of dropping all ratings when a product is deleted was chosen on purpose to not have unrelated ratings in the Dynamo table.

##Frontend
The frontend was implemented using React and consumes the backend API.
You can login, create a product and rating. 
The rating needs to be linked to an existing product, otherwise the rating creation will fail.

##Backend
The backend is using the Serverless framework and deploys a resource stack in AWS.<br> 
This stack is combines relevant resource like s3 buckets
, DynamoDB tables, API Gateway and Lambda functions that provide the main logic of the backend. <br>
On top, the stack contains AWS X-Ray to allow request tracing in order to help identify slow requests and their reasons. <br>

