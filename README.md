[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)


# QualiChain Recruiting Webapp

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

Users are identified by a JWT token. When a request is made to the backend, that token is loaded at authService.ts.
Authorization is performed by parsing the JWT token and deriving the users' role (simple role-based access control)

Example of the response from the IAM server after the recruiter logins:
{
    "response_data": {
        "success": true,
        "token": "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW1haW5pbmdfYXR0ZW1wdHMiOjMsInJvbGVzIjpbInJlY3J1aXRlciJdLCJ2YWxpZGF0aW9uIjoiY29uZmlybWVkIiwiZGVzY3JpcHRpb24iOlsiUXVhbGljaGFpbiBDZXJ0aWZpZWQgUmVjcnVpdGVyICJdLCJjb250YWN0IjpbImdlbmVyYWxAcXVhbGljaGFpbi5jb20iXSwiX190IjoicmVjcnVpdGVyIiwiX2lkIjoiNWY4YjMxZTBjZmUwZDIyZjI3MzIzM2EzIiwibmFtZSI6IlJlY3J1aXRlciBCb2IiLCJlbWFpbCI6ImJvYkBxdWFsaWNoYWluLmNvbSIsInBhc3N3b3JkIjoiJDJiJDE0JFkxbjBZbHd2SzFXb2xoY0ZKOW9EdWVNc2FjSVc5cTk2b3dJMm50ZUJaOENlMzFyM1Nob0cyIiwibG9jYXRpb24iOiJFdXJvcGUiLCJfX3YiOjAsImlhdCI6MTYwMjk3ODYyMSwiZXhwIjoxNjAyOTg5NDIxfQ.-U4968r074oEwlhwTzvn4HgGLnndHWSiqhyc7W32JJ8",
        "user": {
            "id": "5f8b31e0cfe0d22f273233a3",
            "name": "Recruiter Bob",
            "email": "bob@qualichain.com",
            "roles": [
                "recruiter"
            ]
        }
    },
    "succeeded": true,
    "message": "Logged in"
}


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
