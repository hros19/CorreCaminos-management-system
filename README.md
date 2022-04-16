
![](https://img.shields.io/badge/JavaScript-E37400?style=plastic&logo=javascript&logoColor=white)
![](https://img.shields.io/badge/Docker-5BB4FF?style=plastic&logo=docker&logoColor=white)
![](https://img.shields.io/badge/MySQL-FF7138?style=plastic&logo=mysql&logoColor=white)
![](https://img.shields.io/badge/Mocha-03C86D?style=plastic&logo=mocha&logoColor=white)
![](https://img.shields.io/badge/Chai-00619A?style=plastic&logo=chai&logoColor=white)
![](https://img.shields.io/badge/Jest-732DFE?style=plastic&logo=jest&logoColor=white)
![](https://img.shields.io/badge/Nodemon-B00508?style=plastic&logo=nodemon&logoColor=white)
![](https://img.shields.io/badge/NPM-00A071?style=plastic&logo=npm&logoColor=white)
![](https://img.shields.io/badge/Express-00B7BB?style=plastic&logo=express&logoColor=white)
![](https://img.shields.io/badge/Linux-1200BB?style=plastic&logo=linux&logoColor=white)

# CorreCaminos Rest API 📦
First project for the course Databases II, whose main object is to implement a basic Rest API designed for a fictitious company called "CorreCaminos S.A" using MySQL, Express and Docker as the main technologies for the building of the application.

## Table of Contents
- [Deployment](#deployment)
- 
### Deployment
It is required that you have [docker](https://docs.docker.com/get-docker/) installed in your environment, you will also need a [copy of this repository](https://github.com/hros19/CorreCaminos-management-system/generate) so that you can have it locally on your **Linux device**.  Then it only remains to execute the following command in the console wherever you have the copy of the repository on your local machine: `docker-compose up`.

**NOTE:** If you previously had MySQL installed on your local machine then you may get the following error when trying to run the above command:
```console
ERROR: for mysqlcontainer Cannot start service mysqldb: driver failer programming external connectivity on endpoint mysqlcontainer (...): 
Error starting userland proxy: listen tcp4 0.0.0.0:3306: bind: address already in use
ERROR: Encountered errors while bringing up the project
```
In that case, is enough to run the following command `sudo service mysql stop` and then `docker-compose up`. Depending on the configuration, every time you start the MySQL system it will start automatically, so there is no need to worry. In the same way you can restart the service using the command `sudo service mysql start`.

### Description of the problem
Since the beginning of the pandemic, our client (Corre Caminos S.A) had a great growth and need an system to manage the logical operations. We analyze more specifically the case of the company, determining which are the fundamental elements for the operation of the company, ending up concluding the following conceptual diagram.

![conceptual diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/hros19/restapi-management-systems/main/conceptual_diagram.puml)

And more specifically, the following logical diagram is built, which will be the database.

![logical diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/hros19/restapi-management-systems/main/logical_diagram.puml)
![logical diagram B](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/hros19/CorreCaminos-management-system/main/logical_diagramB.puml)
