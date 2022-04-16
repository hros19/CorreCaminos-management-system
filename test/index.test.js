import app from "../src/index.js";
import chai from "chai";
import chaiHttp from "chai-http";

if (app.enabled) {
  chai.use(chaiHttp);
  chai.should();

  describe("Test CorreCaminos management system", () => {

    // Testing basic route to validate connection.
    describe("Testing Initial Connection", () => {
      it("Should return a welcome message", done => {
        chai
          .request(app)
          .get("/")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("message");
            res.body.should.have.property("data");
            done();
            console.log(res.body);
          });
      });
    });

    // Testing vehicle routes.
    describe("Testing Vehicle Routes", () => {

      describe("Testing GET /vehicle (valid pagination)", () => {
        it("Should return a list of vehicles", done => {
          chai
            .request(app)
            .get("/vehicle")
            .send(
              {
                parameter: "vehicle_id",
                order: "ASC",
                pag: 1,
                limit: 5
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body.message);
            });
        });
      });

      describe("Testing GET /vehicle (invalid pagination)", () => {
        it("Should return a error message", done => {
          chai
            .request(app)
            .get("/vehicle")
            .send(
              {
                parameter: "XD", // Invalid parameter.
                order: "ASC",
                pag: 0, // Invalid page.
                limit: 2424 // Invalid limit.
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/:id (valid id)", () => {
        it("Should return a vehicle", done => {
          chai
            .request(app)
            .get("/vehicle/1")
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/:id (invalid id)", () => {
        it("Should return a error message", done => {
          chai
            .request(app)
            .get("/vehicle/XD") // "XD" is not a valid vehicle_id
            .end((err, res) => {
              res.should.have.status(404);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/:id/status (valid id)", () => {
        it("Should return a vehicle status", done => {
          chai
            .request(app)
            .get("/vehicle/1/status")
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/:id/status (invalid id)", () => {
        it("Should return a error message", done => {
          chai
            .request(app)
            .get("/vehicle/XD/status") // "XD" is not a valid vehicle_id
            .end((err, res) => {
              res.should.have.status(404);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/:id/maintenances (valid id)", () => {
        it("Should return a list of maintenances", done => {
          chai
            .request(app)
            .get("/vehicle/1/maintenances")
            .send(
              {
                pag: 1,
                limit: 5
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing GET /vehicle/:id/maintenances (invalid)", () => {
        it("Should return a 'not_found' error message", done => {
          chai
            .request(app)
            .get("/vehicle/XD/maintenances") // XD does not exist.
            .end((err, res) => {
              res.should.have.status(404);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/maintenance/:id (valid id)", () => {
        it("Should return a maintenance", done => {
          chai
            .request(app)
            .get("/vehicle/maintenance/1")
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing GET /vehicle/maintenance/:id (invalid id)", () => {
        it("Should return a error message", done => {
          chai
            .request(app)
            .get("/vehicle/maintenance/XD") // "XD" is not a valid maintenance_id
            .end((err, res) => {
              res.should.have.status(404);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      
      describe("Testing POST /vehicle (valid vehicle)", () => {
        it ("Should return a vehicle", done => {
          chai
            .request(app)
            .post("/vehicle")
            .send(
              {
                car_brand: "Toyota",
                car_plaque: "XXXYYY",
                type_of_gas: "Premium",
                gas_tank_capacity: 100,
                gas_tank_status: 20,
                kilometers_traveled: 0
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a("object");
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing POST /vehicle (invalid vehicle)", () => {
        it("Should return a error message", done => {
          chai
            .request(app)
            .post("/vehicle")
            .send(
              {
                car_brand: "Susuki",
                car_plaque: "XXXYYY", // Already taken 
                type_of_gas: "Diesel",
                gas_tank_capacity: 200,
                gas_tank_status: 20,
                kilometers_traveled: 100,
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing PUT /vehicle/:id (valid)", () => {
        it ("Should return success message with id asociated to the new vehicle info", done => {
          chai
            .request(app)
            .put("/vehicle/4")
            .send(
              {
                car_brand: "Prado",
                car_plaque: "SSSDDD",
                type_of_gas: "Barato",
                gas_tank_capacity: 500
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing PUT /vehicle/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .put("/vehicle/4")
            .send(
              {
                car_brand: "Prado",
                car_plaque: "SSSDDD",
                type_of_gas: "Barato",
                gas_tank_capacity: -5 // invalid parameter
              }
            )
            .end((err, res) => {
              res.should.have.status(500);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing DELETE /vehicle/:id (valid)", () => {
        it ("Should return success message", done => {
          chai
            .request(app)
            .delete("/vehicle/4")
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing DELETE /vehicle/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/vehicle/XD") // "XD" is not a valid vehicle_id
            .end((err, res) => {
              res.should.have.status(404);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing PUT /vehicle/:id/fillTank (valid)", () => {
        it ("Should return success message with the new status of the vehicle", done => {
          chai
            .request(app)
            .put("/vehicle/3/fillTank")
            .send(
              {
                gasAmount: 100 // Obligatory parameter
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing PUT /vehicle/:id/fillTank (invalid)", () => {
        it ("Should return a error message, indicating that the vehicle was already filled today", done => {
          chai
            .request(app)
            .put("/vehicle/1/fillTank") // 1 exists, but this vehicle was already filled today
            .send(
              {
                gasAmount: 100 // invalid parameter
              }
            )
            .end((err, res) => {
              res.should.have.status(406);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing PUT /vehicle/:id/registerKilometers (valid)", () => {
        it ("Should return success message with the new status of the vehicle", done => {
          chai
            .request(app)
            .put("/vehicle/3/registerKilometers")
            .send(
              {
                kilometers: 80 // Obligatory parameter
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing PUT /vehicle/:id/registerKilometers (invalid)", () => {
        it ("Should return a error message, indicating that the vehicle cant afford that quantity of kilometers, need more gasoline", done => {
          chai
            .request(app)
            .put("/vehicle/1/registerKilometers")
            .send(
              {
                kilometers: 5000
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a("object");
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing POST /vehicle/:id/registerMaintenance (valid)", () => {
        it ("Should return success message with the maintenance created", done => {
          chai
            .request(app)
            .post("/vehicle/3/registerMaintenance")
            .send(
              {
                status: "Limpieza profunda"
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing POST /vehicle/:id/registerMaintenance (invalid)", () => {
        it ("Should return a error message, indicating that the status cannot be empty!", done => {
          chai
            .request(app)
            .post("/vehicle/3/registerMaintenance") 
            .send(
              {
                status: "" 
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing PUT /vehicle/maintenance/:id (valid)", () => {
        it ("Should return success message with the maintenance updated", done => {
          chai
            .request(app)
            .put("/vehicle/maintenance/1")
            .send(
              {
                status: "Cambio de parabrisas"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing PUT /vehicle/maintenance/:id (invalid)", () => {
        it ("Should return a error message, indicating that the status cannot be empty!", done => {
          chai
            .request(app)
            .put("/vehicle/maintenance/1")
            .send(
              {
                status: ""
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Testing DELETE /vehicle/maintenance/:id (valid)", () => {
        it ("Should return success message with the maintenance deleted", done => {
          chai
            .request(app)
            .delete("/vehicle/maintenance/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Testing DELETE /vehicle/maintenance/:id (invalid)", () => {
        it ("Should return a error message, indicating that the maintenance does not exist", done => {
          chai
            .request(app)
            .delete("/vehicle/maintenance/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });


    }); // Ending of vehicle test...

    describe("Testing JobTitle Routes", () => {

      describe("Test GET /jobTitle (valid)", () => {
        it ("Should return success message with all the jobTitles", done => {
          chai
            .request(app)
            .get("/jobTitle")
            .send(
              {
                order: "ASC",
                pag: 1,
                limit: 5
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test GET /jobTitle (invalid)", () => {
        it ("Should return a error message, indicating that the order parameter is invalid", done => {
          chai
            .request(app)
            .get("/jobTitle")
            .send(
              {
                order: "XD",
                pag: 1,
                limit: 5
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /jobTitle/:id (valid)", () => {
        it ("Should return success message with the jobTitle", done => {
          chai
            .request(app)
            .get("/jobTitle/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /jobTitle/:id (invalid)", () => {
        it ("Should return a error message, indicating that the jobTitle does not exist", done => {
          chai
            .request(app)
            .get("/jobTitle/XD") // "XD" is not a valid jobTitle_id
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /jobTitle (valid)", () => {
        it ("Should return success message with the jobTitle created", done => {
          chai
            .request(app)
            .post("/jobTitle")
            .send(
              {
                name: "Tester"
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test POST /jobTitle (invalid)", () => {
        it ("Should return a error message, indicating that the name cannot be empty!", done => {
          chai
            .request(app)
            .post("/jobTitle")
            .send(
              {
                name: ""
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test PUT /jobTitle/:id (valid)", () => {
        it ("Should return success message with the jobTitle updated", done => {
          chai
            .request(app)
            .put("/jobTitle/3")
            .send(
              {
                name: "Administrator"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test PUT /jobTitle/:id (invalid)", () => {
        it ("Should return a error message, indicating that the name cannot be empty!", done => {
          chai
            .request(app)
            .put("/jobTitle/1")
            .send(
              {
                name: ""
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /jobTitle/:id (valid)", () => {
        it ("Should return success message with the jobTitle deleted", done => {
          chai
            .request(app)
            .delete("/jobTitle/3")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /jobTitle/:id (invalid)", () => {
        it ("Should return a error message, indicating that the jobTitle does not exist", done => {
          chai
            .request(app)
            .delete("/jobTitle/XD") // "XD" is not a valid jobTitle_id
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

    }); //  Ending of jobTitle test...

    describe("Testing Driver Routes", () => {

      describe("Test GET /driver (valid)", () => {
        it ("Should return success message with all the drivers", done => {
          chai
            .request(app)
            .get("/driver")
            .send(
              {
                parameter: "driver_id",
                order: "ASC",
                pag: 1,
                limit: 5
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test GET /driver (invalid)", () => {
        it ("Should return a error message, indicating that the parameter is invalid", done => {
          chai
            .request(app)
            .get("/driver")
            .send(
              {
                parameter: "XD",
                order: "ASC",
                pag: 1,
                limit: 5
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /driver/:id (valid)", () => {
        it ("Should return success message with the driver", done => {
          chai
            .request(app)
            .get("/driver/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /driver/:id (invalid)", () => {
        it ("Should return a error message, indicating that the driver does not exist", done => {
          chai
            .request(app)
            .get("/driver/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /driver/:id (valid)", () => {
        it ("Should return success message with the driver deleted", done => {
          chai
            .request(app)
            .delete("/driver/3")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /driver/:id (invalid)", () => {
        it ("Should return a error message, indicating that the driver does not exist", done => {
          chai
            .request(app)
            .delete("/driver/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /driver (valid)", () => {
        it ("Should return success message with the driver created", done => {
          chai
            .request(app)
            .post("/driver")
            .send(
              {
                vehicle_id: "3",
                job_title_id: "1",
                driver_name: "John Doe",
                driver_doc_id: "123456789",
                salary: 75000
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body.data);
            });
          });
      });

      describe("Test POST /driver (invalid)", () => {
        it ("Should return a error message, indicating that the vehicle_id is invalid", done => {
          chai
            .request(app)
            .post("/driver")
            .send(
              {
                vehicle_id: "XD",
                job_title_id: "1",
                driver_name: "John Doe",
                driver_doc_id: "123",
                salary: 1000
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /driver/:id (valid)", () => {
        it ("Should return success message with the driver updated", done => {
          chai
            .request(app)
            .put("/driver/4")
            .send(
              {
                vehicle_id: 3,
                job_title_id: 1,
                driver_name: "Hansol Antay",
                driver_doc_id: "9999",
                salary: 100000
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test PUT /driver/:id (invalid)", () => {
        it ("Should return a error message, indicating that the driver does not exist", done => {
          chai
            .request(app)
            .put("/driver/hola")
            .send(
              {
                vehicle_id: 3,
                job_title_id: 1,
                driver_name: "Hansol Antay",
                driver_doc_id: "9999",
                salary: 100000
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

    }); // Ending of driver test...

    describe("Testing Business Type Routes", () => {

      describe("Test GET /businessType (valid)", () => {
        it ("Should return success message with all the businessTypes", done => {
          chai
            .request(app)
            .get("/businessType")
            .send(
              {
                order: "ASC",
                pag: 1,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test GET /businessType (invalid)", () => {
        it ("Should return a error message, indicating that the page is invalid", done => {
          chai
            .request(app)
            .get("/businessType")
            .send(
              {
                order: "ASC",
                pag: -10,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /businessType/:id (valid)", () => {
        it ("Should return success message with the businessType", done => {
          chai
            .request(app)
            .get("/businessType/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /businessType/:id (invalid)", () => {
        it ("Should return a error message, indicating that the businessType does not exist", done => {
          chai
            .request(app)
            .get("/businessType/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /businessType (valid)", () => {
        it ("Should return success message with the businessType created", done => {
          chai
            .request(app)
            .post("/businessType")
            .send(
              {
                business_type_name: "Hotel Playa"
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test POST /businessType (invalid)", () => {
        it ("Should return a error message, indicating that the businessType name is invalid", done => {
          chai
            .request(app)
            .post("/businessType")
            .send(
              {
                business_type_name: ""
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test PUT /businessType/:id (valid)", () => {
        it ("Should return success message with the businessType updated", done => {
          chai
            .request(app)
            .put("/businessType/1")
            .send(
              {
                business_type_name: "Cine"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test PUT /businessType/:id (invalid)", () => {
        it ("Should return a error message, indicating that the businessType does not exist", done => {
          chai
            .request(app)
            .put("/businessType/XD")
            .send(
              {
                business_type_name: "Cine"
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /businessType/:id (valid)", () => {
        it ("Should return success message with the businessType deleted", done => {
          chai
            .request(app)
            .delete("/businessType/6")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /businessType/:id (invalid)", () => {
        it ("Should return a error message, indicating that the businessType does not exist", done => {
          chai
            .request(app)
            .delete("/businessType/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

    }); // Ending of businessType test...

    describe("Testing Zone Routes", () => {

      describe("Test GET /zone (valid)", () => {
        it ("Should return success message with all the zones", done => {
          chai
            .request(app)
            .get("/zone")
            .send(
              {
                order: "ASC",
                pag: 1,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test GET /zone (invalid)", () => {
        it ("Should return a error message, indicating that the page is invalid", done => {
          chai
            .request(app)
            .get("/zone")
            .send(
              {
                order: "ASC",
                pag: -10,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /zone/:id (valid)", () => {
        it ("Should return success message with the zone", done => {
          chai
            .request(app)
            .get("/zone/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /zone/:id (invalid)", () => {
        it ("Should return a error message, indicating that the zone does not exist", done => {
          chai
            .request(app)
            .get("/zone/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /zone/route (valid)", () => {
        it ("Should return success with a message with all the routes", done => {
          chai
            .request(app)
            .get("/zone/route")
            .send(
              {
                parameter: "route_id",
                order: "ASC",
                pag: 1,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test GET /zone/route (invalid)", () => {
        it ("Should return a error message, indicating that the page is invalid", done => {
          chai
            .request(app)
            .get("/zone/route")
            .send(
              {
                parameter: "route_id",
                order: "ASC",
                pag: -10,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /zone/route/:route_id (Valid)", () => {
        it ("Should return success message with the route", done => {
          chai
            .request(app)
            .get("/zone/route/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /zone/route/:route_id (invalid)", () => {
        it ("Should return a error message, indicating that the route does not exist", done => {
          chai
            .request(app)
            .get("/zone/route/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /zone/:id/route (valid)", () => {
        it ("Should return success message with all the routes", done => {
          chai
            .request(app)
            .get("/zone/2/route")
            .send(
              {
                parameter: "route_id",
                order: "ASC",
                pag: 1,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body.data);
            });
        });
      });

      describe("Test GET /zone/:id/route (invalid)", () => {
        it ("Should return a error message, indicating that pagination parameter are invalid", done => {
          chai
            .request(app)
            .get("/zone/1/route")
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /zone (valid)", () => {
        it ("Should return success message with the zone created", done => {
          chai
            .request(app)
            .post("/zone")
            .send(
              {
                name: "Zona Prueba"
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /zone (invalid)", () => {
        it ("Should return a error message, indicating that the zone already exists", done => {
          chai
            .request(app)
            .post("/zone")
            .send(
              {
                name: "Central"
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test PUT /zone/:id (valid)", () => {
        it ("Should return success message with the zone updated", done => {
          chai
            .request(app)
            .put("/zone/4")
            .send(
              {
                name: "Zona Actualizada"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test PUT /zone/:id (invalid)", () => {
        it ("Should return a error message, indicating that the zone does not exist", done => {
          chai
            .request(app)
            .put("/zone/XD")
            .send(
              {
                name: "Zona nueva"
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /zone/:id (valid)", () => {
        it ("Should return success message with the zone deleted", done => {
          chai
            .request(app)
            .delete("/zone/4")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /zone/:id (invalid)", () => {
        it ("Should return a error message, indicating that the zone does not exist", done => {
          chai
            .request(app)
            .delete("/zone/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe('Test POST /zone/route (valid)', () => {
        it('Should return success message with the route created', done => {
          chai
            .request(app)
            .post('/zone/route')
            .send({
              route_name: "Ruta Prueba",
              route_distance_km: 50
            })
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
        });
      });

      describe('Test POST /zone/route (invalid)', () => {
        it('Should return a error message', done => {
          chai
            .request(app)
            .post('/zone/route')
            .send({
              route_name: "",
              route_distance_km: ""
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test PUT /zone/route/:route_id (valid)", () => {
        it ("Should return success message with the route updated", done => {
          chai
            .request(app)
            .put("/zone/route/1")
            .send(
              {
                route_name: "Ruta Actualizada",
                route_distance_km: 100
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test PUT /zone/route/:route_id (invalid)", () => {
        it ("Should return a error message, indicating that the route does not exist", done => {
          chai
            .request(app)
            .put("/zone/route/XD")
            .send(
              {
                route_name: "Ruta nueva",
                route_distance_km: 100
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /zone/route/:route_id (valid)", () => {
        it ("Should return success message with the route deleted", done => {
          chai
            .request(app)
            .delete("/zone/route/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /zone/route/:route_id (invalid)", () => {
        it ("Should return a error message, indicating that the route does not exist", done => {
          chai
            .request(app)
            .delete("/zone/route/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /zone/:id/route/:route_id (valid)", () => {
        it ("Should return success message with the zone and route created", done => {
          chai
            .request(app)
            .post("/zone/1/route/9")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /zone/:id/route/:route_id (invalid)", () => {
        it ("Should return a error message, indicating that the zone does not exist", done => {
          chai
            .request(app)
            .post("/zone/XD/route/9")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /zone/:id/route/:route_id (valid)", () => {
        it ("Should return success message with the zone and route deleted", done => {
          chai
            .request(app)
            .delete("/zone/3/route/7")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test DELETE /zone/:id/route/:route_id (invalid)", () => {
        it ("Should return a error message, indicating that the zone does not exist", done => {
          chai
            .request(app)
            .delete("/zone/XD/route/1")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

    }); // Ending of zone test...
    
  }); // Ending of main test...
}