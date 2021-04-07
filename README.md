[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)



# Qualichain IAM & Recruiting webapp


![web][logo]


[logo]: https://web.ist.utl.pt/~ist180970/assets/img/qualichain-logo.png
A webapp for the Qualichain Portuguese PoC. The Qualichain Portuguese PoC is about the interaction between a higher education organization, IST (or Técnico Lisboa), and a recruiting organization, AMA. A full version of the PoC source code is provided in another repository (https://github.com/QualiChain/consortium). 

This repository presents an alternative app to be executed by a recruiting organization. The difference is that the Recruiting Module of the other repository is a standalone app that has to be installed before executed, whereas the Recruiting Webapp is, as the name suggests, a web application. 

## Requirements
* Git
* Nodejs version >= 10.0.0 and npm version >= 6.0.0 (tested with Nodejs 14.15, npm 6.14)
* If using Windows: [Git Bash](https://gitforwindows.org/)

####
## Setup and Run
1. Fork and clone the project 

2. Set the backend environment variables, by duplicating .env.example (home directory of the project). Rename it to .env and set its values.
This step includes the configuration of [Mlab][mlab]. If you cannot configure the database, request the support for a working URI.
### Run the App

In order to run the project the required libraries need to be installed.

1. Install [node][node]. We recommend installing it via [nvm][nvm].

[nvm]: https://github.com/nvm-sh/nvm

2. On the home directory of the project, run ```npm run first-setup```.


## Running the server
1. Go to the main directory and run ``npm run start``.
1. To access the user interface, open a browser (Chrome is recommended) and go to ``localhost:8080``.

[mlab]: https://docs.mlab.com/

## QualiChain Identity and Access Management Module

IAM integration instructions

Currently, the IAM provides users the option to login, being integrated with NTUA’s and SEAL (in progress) APIs. It also allows verifying an JWT identity token. It has two main endpoints:
-Login: http://qualichain.herokuapp.com/users/login
-Validate JWT 	Token: https://qualichain.herokuapp.com/auth/validateToken


Login

The login endpoint receives user credentials (form/data; username + password), and returns a JWT token. As an example, by logging in with the following credentials:
"username": bob@qualichain.com
 "password": 123


It returns a "response_data" field containing the token itself and the user data.
For example:



{




   "response_data": {


       "token": "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmQxMDQzMjRlMDI1NGYwNGU1ZDcxZjciLCJpZCI6MSwibmFtZSI6InBhbmFnaW90aXMgcGFuYWdpb3RpcyIsImVtYWlsIjoiZXhhbXBsZTFAZ21haWwuY29tIiwicmVtYWluaW5nX2F0dGVtcHRzIjozLCJyb2xlcyI6WyJyZWNydWl0ZXIiXSwidXNlclBhdGgiOiIvaG9tZS9wYW5hZ2lvdGlzIiwiaWF0IjoxNjEwNDU1NjMwLCJleHAiOjE2MTA0NjY0MzB9.v0Mf2rDPgPgkUoT2E0K3PkB33bBrw19wdO4RelXiFR0",


       "user": {


           "id": 1,


           "email": "example1@gmail.com",


           "name": "panagiotis panagiotis",


           "roles": [


               "recruiter"


           ]


       }


   },


   "succeeded": true,


   "message": "Logged in"


}


note the role field, which identifies this user as a “recruiter” and can be used for authorization purposes.



Token Validation

After receiving the token, it needs to be validated. Currently there are two methods to do this.

Remote method

The IAM provides a token validation endpoint that can be used for testing purposes. The endpoint is u can also use the endpoint. Note that it is hosted by the IAM API server:

POST /users/validateToken HTTP/1.1
Host: qualichain.herokuapp.com
Content-Type: application/json
Authorization: Bearer eyJhbG...

I.e., make a POST with the authorization header set with the JWT token to https://qualichain.herokuapp.com/auth/validateToken

Example of validation:
curl --location --request POST 'https://qualichain.herokuapp.com/auth/validateToken' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjhiNTVhZDcyNWVmNDUzZmVjOGVlNWYiLCJpZCI6IjVmOGI1NWFkNzI1ZWY0NTNmZWM4ZWU1ZiIsIm5hbWUiOiJSYWZhZWwgQmVsY2hpb3IiLCJlbWFpbCI6InJhZmFlbC5iZWxjaGlvckB0ZWNuaWNvLnVsaXNib2EucHQiLCJyZW1haW5pbmdfYXR0ZW1wdHMiOjMsInJvbGVzIjpbInN0dWRlbnQiLCJwcm9mZXNzb3IiXSwiaWF0IjoxNjA3NDM4NjAxLCJleHAiOjE2MDc0NDk0MDF9.Az9RoBodxFHePN3qDwbbMD18OfoXYmK0OvWRwWSEhks' \
--data-raw ''

Example of response:
{
   "response_data": {
       "id": "5f8b31e0cfe0d22f273233a3",
       "name": "Recruiter Bob",
       "email": "bob@qualichain.com",
       "roles": [
           "recruiter"
       ]
   },
   "succeeded": true,
   "message": "Token Validated"
}



Note that this should be used only for testing purposes and the next method is the preferred one, and validation is done locally.

Local method (recommended)

The JWT token can be validated using the Passport.js package [1]. Some validation examples can be found at
https://github.com/QualiChain/consortium-web-app/blob/master/server/routes/user-routes.js#L171
https://github.com/QualiChain/consortium-web-app/blob/master/server/routes/iam.js#L45


This validation requires a secret. Currently, we are using  symmetric crypto.
This will be updated to asymmetric cryptography soon.
The secret is 7Yu$XnJZ5G2J$YZcGSJs9t



[1] http://www.passportjs.org/docs/


Generating Crypto Material:

Generate Private key

#### At the sslcert folder

ssh-keygen -t rsa -b 4096 -m PEM -f qualichain.key
### Don't add passphrase
openssl rsa -in qualichain.key -pubout -outform PEM -out qualichain.key.pub

#### Check keys
cat qualichain.key
cat qualichain.key.pub

#### Convert keys to a format readable by dotenv package, by running the script under sslcert folder
Node convert.js

#### check results
cat qualichain.key.convert
cat qualichain.key.pub.convert


#### Now, we need to add qualichain.key.convert and qualichain.key.pub.convert to the .env file, between double quotes (“)

JWT_SECRET_SIGNING_KEY = [qualichain.key.pub.convert]
JWT_SECRET_VERIFICATION_KEY = [qualichain.key.convert]

#### Finally, add JWT_ALGORITHM as RS256 to .env
JWT_ALGORITHM = RS256

Emission on tokens is done using the private/signing key, at the login endpoint, user-routes

Verification of JWT tokens is done with the verification/public key, (loading it at line 11 from passport.js)



Mock Users:

--
Username: admin@qualichain.epu.ntua.gr
Password: 123
Roles: Administrator (can register Recruiters)
--
Username: recruiting@gmail.com
Password: 123
Roles: Recruiting organisation
--
Username: admin@tecnico.ulisboa.pt
Password: 123
Roles: academic organisation
--
Username: rafael.belchior@tecnico.ulisboa.pt
Password: 123
Roles: student and professor

--
Username: student@tecnico.ulisboa.pt
Password: 123
Roles: student
--
Username: professor@tecnico.ulisboa.pt
Password: 123
Roles: professor
---
Username: bob@qualichain.com
Password: 123
Roles: recruiter
--



## On QualiChain Recruiting

This is the module executed by a recruiting organization, e.g., a public administration organization like AMA or a company. This component is responsible for the diploma validation. It receives a PDF file representing a diploma as an input. 
Such PDF is titled with the Issuer ID + Civil ID, which constitutes the ID of the diploma. The hash of the diploma is calculated. Then, the corresponding hash of the diploma registered at the (Ropsten) Ethereum network is obtained, through the provided ID.

In case the calculated digest of the diploma matches the digest of the provided PDF, the diploma is valid, i.e., it is authentic and has not been modified. Otherwise, it is invalid.

The Issuer ID identifies the HEI that issued the diploma. You don't have to provide the address of the HEI's contract because the QualiChain Recruiting module gets it from the QualiChain Consortium smart contract, explained below.

**Note**: if you created a new HEI with the QualiChain Higher Education Module (above), you first must add it to the consortium before being able to run the QualiChain Recruiting. For that, you must first run the QualiChain Consortium module to register the new HEI (below).
## Troubleshooting
If the setup fails, run ``sudo apt-get install build-essential
                         ``
                         followed by ``rm package-lock.json && rm -rf node_modules && rm -rf ~/.node-gyp
                                       ``. Finally, run ``npm run first-setup``
## Contributors

Rafael Belchior, rafael.belchior at tecnico.ulisboa.pt 


[node]: http://nodejs.org/
