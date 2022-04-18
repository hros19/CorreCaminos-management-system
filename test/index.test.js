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

    describe("Testing Supplier Routes", () => {

      describe("Test GET /supplier (valid)", () => {
        it ("Should return success message with the suppliers", done => {
          chai
            .request(app)
            .get("/supplier")
            .send(
              {
                parameter: "supplier_id",
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

      describe("Test GET /supplier (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/supplier")
            .send(
              {
                parameter: "INVALID_PARAMETER",
                order: "ASC",
                pag: 1,
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

      describe("Test GET /supplier/:id (valid)", () => {
        it ("Should return success message with the supplier", done => {
          chai
            .request(app)
            .get("/supplier/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /supplier/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/supplier/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test POST /supplier (valid)", () => {
        it ("Should return success message with the supplier created", done => {
          chai
            .request(app)
            .post("/supplier")
            .send(
              {
                supplier_name: "Proveedor nuevo",
                address: "Direccion nueva Av 1",
                phone: "777897979",
                email: "nuevoprov@mail.com",
                have_delivery: "NO"
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /supplier (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .post("/supplier")
            .send(
              {
                supplier_name: "Hola"
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /supplier/:id (valid)", () => {
        it ("Should return success message with the supplier updated", done => {
          chai
            .request(app)
            .put("/supplier/1")
            .send(
              {
                supplier_name: "Proveedor actualizado",
                address: "Direccion actualizada Av 1",
                phone: "11111111",
                email: "nuevoemail@actualizado.com",
                have_delivery: "YES"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /supplier/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .put("/supplier/XD")
            .send(
              {
                supplier_name: "Proveedor nuevo",
                address: "Direccion actualizada Av 1",
                phone: "11111111",
                email: "nuevomail@mail.com",
                have_delivery: "NO"
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /supplier/:id (valid id)", () => {
        it ("Should return success message with the supplier deleted", done => {
          chai
            .request(app)
            .delete("/supplier/4")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /supplier/:id (invalid id)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/supplier/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /supplier/:id/products (valid)", () => {
        it ("Should return success message with the products of the supplier", done => {
          chai
            .request(app)
            .get("/supplier/1/products")
            .send(
              {
                parameter: "product_id",
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

      describe("Test GET /supplier/:id/products (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/supplier/XD/products")
            .send(
              {
                parameter: "product_id",
                order: "ASC",
                pag: 1,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /supplier/:id/orders (valid_ id)", () => {
        it ("Should return success message with the orders of the supplier", done => {
          chai
            .request(app)
            .get("/supplier/3/orders")
            .send(
              {
                parameter: "order_date",
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

      describe("Test GET /supplier/:id/orders (invalid id)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/supplier/XD/orders")
            .send(
              {
                parameter: "order_date",
                order: "ASC",
                pag: 1,
                limit: 10
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

    }); // Ending of supplier test...

    describe("Test ProductCategory Routes", () => {

      describe("Test GET /productCat (valid)", () => {
        it ("Should return success message with the product categories", done => {
          chai
            .request(app)
            .get("/productCat")
            .send(
              {
                parameter: "product_cat_id",
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

      describe("Test GET /productCat (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/productCat")
            .send(
              {
                parameter: "XD",
                order: "ASC",
                pag: 1,
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

      describe("Test GET /productCat/subCategory (valid)", () => {
        it ("Should return success message with the subcategories of the product category", done => {
          chai
            .request(app)
            .get("/productCat/subCategory")
            .send(
              {
                parameter: "SubCategory_id",
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

      describe("Test GET /productCat/subCategory (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/productCat/subCategory")
            .send(
              {
                parameter: "XD",
                order: "ASC",
                pag: 1,
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

      describe("Test GET /productCat/subCategory/:id (valid)", () => {
        it ("Should return success message with the subcategory of the product category", done => {
          chai
            .request(app)
            .get("/productCat/subCategory/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /productCat/subCategory/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/productCat/subCategory/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /productCat/:id (valid)", () => {
        it ("Should return success message with the product category", done => {
          chai
            .request(app)
            .get("/productCat/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /productCat/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/productCat/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /productCat (valid)", () => {
        it ("Should return success message with the product category", done => {
          chai
            .request(app)
            .post("/productCat")
            .send(
              {
                product_cat_name: "Refrigerados"
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /productCat (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .post("/productCat")
            .send(
              {
                product_cat_name: ""
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /productCat/subCategory (valid)", () => {
        it ("Should return success message with the subcategory of the product category", done => {
          chai
            .request(app)
            .post("/productCat/subCategory")
            .send(
              {
                subcategory_name: "Paletas frias",
                product_cat_id: 1
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /productCat/subCategory (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .post("/productCat/subCategory")
            .send(
              {
                subcategory_name: "Paletas calientes",
                product_cat_id: 100000
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /productCat/subCategory/:id (valid)", () => {
        it ("Should return success message with the subcategory of the product category", done => {
          chai
            .request(app)
            .put("/productCat/subCategory/1")
            .send(
              {
                subcategory_name: "Legumbres"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /productCat/subCategory/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .put("/productCat/subCategory/XD")
            .send(
              {
                subcategory_name: "Legumbres"
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /productCat/subCategory/:id (valid)", () => {
        it ("Should return success message with the subcategory of the product category", done => {
          chai
            .request(app)
            .delete("/productCat/subCategory/9")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /productCat/subCategory/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/productCat/subCategory/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /productCat/:id (valid)", () => {
        it ("Should return success message with the product category", done => {
          chai
            .request(app)
            .put("/productCat/4")
            .send(
              {
                product_cat_name: "Congelados"
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /productCat/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .put("/productCat/XD")
            .send(
              {
                product_cat_name: "Congelados"
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /productCat/:id (valid)", () => {
        it ("Should return success message with the product category", done => {
          chai
            .request(app)
            .delete("/productCat/4")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /productCat/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/productCat/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

    }); // Ending of product category test...

    describe("Test of product routes", () => {

      describe("Test GET /product (valid)", () => {
        it ("Should return success message with the products", done => {
          chai
            .request(app)
            .get("/product")
            .send(
              {
                parameter: 'product_id',
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

      describe("test GET /product (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/product")
            .send(
              {
                parameter: "product_id",
                order: "ASC",
                pag: -20,
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

      describe("Test POST /product (valid)", () => {
        it ("Should return success message with the product", done => {
          chai
            .request(app)
            .post("/product")
            .send(
              {
                product_name: "Brava Lata 350ml",
                supplier_id: 2,
                product_subcat_id: 7,
                is_available: "YES",
                price: 50000
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /product (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .post("/product")
            .send(
              {
                product_name: "Brava Lata 350ml",
                is_available: "YES"
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /product/:id (valid)", () => {
        it ("Should return success message with the product", done => {
          chai
            .request(app)
            .get("/product/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test GET /product/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/product/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /product/:id (valid)", () => {
        it ("Should return success message with the product", done => {
          chai
            .request(app)
            .put("/product/16")
            .send(
              {
                product_name: "Brava Lata 1000ml",
                product_subcat_id: 6,
                is_available: "YES",
                price: 6000
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /product/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .put("/product/XD")
            .send(
              {
                product_name: "Brava Lata 350ml",
                product_subcat_id: 6,
                is_available: "YES",
                price: 2000
              }
            )
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /product/:id (valid)", () => {
        it ("Should return success message with the product", done => {
          chai
            .request(app)
            .delete("/product/1")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /product/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/product/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

    }); // Ending of product test...
    
    describe("Test of Business Stock routes", () => {

      describe("Test GET /stock (valid)", () => {
        it ("Should return success message with the stocks", done => {
          chai
            .request(app)
            .get("/stock")
            .send(
              {
                parameter: 'product_id',
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

      describe("test GET /stock (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/stock")
            .send(
              {
                parameter: "product_id",
                order: "ASC",
                pag: -20,
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

      describe('Test GET /stock/:id (valid)', () => {
        it('Should return success message with the stock', done => {
          chai
            .request(app)
            .get('/stock/2')
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
        });
      });

      describe("Test GET /stock/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .get("/stock/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /stock/:id (valid)", () => {
        it ("Should return success message with product in the stock", done => {
          chai
            .request(app)
            .post("/stock/16") // Product not before in stock
            .send(
              {
                quantity: 400
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /stock/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .post("/stock/10") // Product already in stock
            .send(
              {
                quantity: 400
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /stock/:id (valid)", () => {
        it ("Should return success message with the stock", done => {
          chai
            .request(app)
            .delete("/stock/10")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /stock/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/stock/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /stock/:id (valid)", () => {
        it ("Should return success message with the stock", done => {
          chai
            .request(app)
            .put("/stock/3")
            .send(
              {
                quantity: 5000
              }
            )
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test PUT /stock/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .put("/stock/3")
            .send(
              {
                quantity: 20000 // Not enough stock
              }
            )
            .end((err, res) => {
              res.should.have.status(400);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /stock/:id (valid)", () => {
        it ("Should return success message with the stock", done => {
          chai
            .request(app)
            .delete("/stock/3")
            .end((err, res) => {
              res.should.have.status(200);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test DELETE /stock/:id (invalid)", () => {
        it ("Should return a error message", done => {
          chai
            .request(app)
            .delete("/stock/XD")
            .end((err, res) => {
              res.should.have.status(404);
              done();
              console.log(res.body);
            });
          });
      });

      describe("Test POST /stock (valid)", () => {
        it ("Should return success message with the stock", done => {
          chai
            .request(app)
            .post("/stock")
            .send(
              {
                products: '[' +
                  '{"product_id": 5, "quantity": 10000}, ' +
                  '{"product_id": 6, "quantity": 40000}' +
                ']'
              }
            )
            .end((err, res) => {
              res.should.have.status(201);
              done();
              console.log(res.body);
            });
          });
      }); // Ending of stock testing...

      describe("Testing Delivery Routes", () => {

        describe("Test GET /delivery/day (valid)", () => {
          it ("Should return success message with the deliveries", done => {
            chai
              .request(app)
              .get("/delivery/day")
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

        describe("Test GET /delivery/day (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/delivery/day")
              .send(
                {
                  order: "ASC",
                  pag: -20,
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

        describe("Test GET /delivery/day/:id (valid)", () => {
          it ("Should return success message with the delivery", done => {
            chai
              .request(app)
              .get("/delivery/day/1")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /delivery/day/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/delivery/day/XD")
              .end((err, res) => {
                res.should.have.status(404);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /delivery/interval (valid)", () => {
          it ("Should return success message with the deliveries", done => {
            chai
              .request(app)
              .get("/delivery/interval")
              .send(
                {
                  parameter: "dev_interval_id",
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

        describe("Test GET /delivery/interval (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/delivery/interval")
              .send(
                {
                  parameter: "dev_interval_id",
                  order: "ASC",
                  pag: -20,
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

        describe("Test GET /delivery/interval/:id (valid)", () => {
          it ("Should return success message with the delivery", done => {
            chai
              .request(app)
              .get("/delivery/interval/1")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /delivery/interval/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/delivery/interval/XD")
              .end((err, res) => {
                res.should.have.status(404);
                done();
                console.log(res.body);
              });
            });
        });

      }); // Ending test of delivery routes...

      describe("Testing Client Routes", () => {
        
        describe("Test GET /client/:id (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .get("/client/1")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body.data);
              });
            });
        });

        describe("Test GET /client/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/client/XD")
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test POST /client (valid)", () => {
          it ("Should return success message with the client", done => {
            chai
              .request(app)
              .post("/client")
              .send(
                {
                  zone_id: 1,
                  dev_interval_id: 1,
                  business_type_id: 1,
                  business_name: "Nuevo cliente",
                  business_representative: "Domingo Diaz",
                  business_phone: "829-829-829",
                  business_email: "nuevoclient@mail.com",
                  formal_address: "Calle falsa 123",
                  latitude: -50,
                  longitude: 90
                }
              )
              .end((err, res) => {
                res.should.have.status(201);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test POST /client (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .post("/client")
              .send(
                {
                  zone_id: -200,
                  dev_interval_id: -200,
                  business_type_id: -200,
                  business_name: "Nuevo cliente",
                  business_representative: "Domingo Diaz",
                  business_phone: "829-829-829",
                  business_email: "noexiste@mail.com",
                  formal_address: "Calle falsa 123",
                  latitude: -50,
                  longitude: 90
                }
              )
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
          });
        });

        describe("Test PUT /client/:id (valid)", () => {
          it ("Should return success message with the client", done => {
            chai
              .request(app)
              .put("/client/1")
              .send(
                {
                  business_type_id: 1,
                  business_name: "Cliente actualizado",
                  business_representative: "Ramiro Fuentes",
                  business_phone: "9090-9090-9090",
                  business_email: "ramiroventas@mail.com",
                  formal_address: "Calle falsa 5555"
                }
              )
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test PUT /client/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .put("/client/XD")
              .send(
                {
                  business_type_id: -200,
                  business_name: "Cliente actualizado",
                  business_representative: "Ramiro Fuentes",
                  business_phone: "9090-9090-9090",
                  business_email: "xd@mail.com",
                  formal_address: "Calle falsa 5555"
                }
              )
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test DELETE /client/:id (valid)", () => {
          it ("Should return success message with the client", done => {
            chai
              .request(app)
              .delete("/client/1")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test DELETE /client/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .delete("/client/XD")
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /client (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .get("/client")
              .send(
                {
                  parameter: "client_id",
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

        describe("Test GET /client (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/client")
              .send(
                {
                  parameter: "client_id",
                  order: "ASC",
                  pag: -200,
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

        describe("Test GET /client/:id/devday (valid)", () => {
          it ("Should return success message with the devday", done => {
            chai
              .request(app)
              .get("/client/6/devday")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body.data);
              });
            });
        });

        describe("Test GET /client/:id/devday (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/client/XD/devday")
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test POST /client/:id/devday (valid)", () => {
          it ("Should return success message with the devday", done => {
            chai
              .request(app)
              .post("/client/5/devday")
              .send(
                {
                  delivery_day_id: 3
                }
              )
              .end((err, res) => {
                res.should.have.status(201);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test POST /client/:id/devday (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .post("/client/6/devday") // Already full of delivery days!
              .send(
                {
                  delivery_day_id: 2
                }
              )
              .end((err, res) => {
                res.should.have.status(500);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /client/order (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .get("/client/order")
              .send(
                {
                  parameter: "client_id",
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

        describe("Test GET /client/order (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/client/order")
              .send(
                {
                  parameter: "client_id",
                  order: "ASC",
                  pag: -200,
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

        describe("Test GET /client/order/:id (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .get("/client/order/1")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body.data);
              });
            });
        });

        describe("Test GET /client/order/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/client/order/XD")
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test PUT /client/order/:id (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .put("/client/order/1")
              .send(
                {
                  status: "COMPLETADO"
                }
              )
              .end((err, res) => {
                res.should.have.status(304);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test PUT /client/order/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .put("/client/order/XD")
              .send(
                {
                  status: "COMPLETADO"
                }
              )
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /client/:id/order (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .get("/client/2/order")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body.data);
              });
            });
        });

        describe("Test GET /client/:id/order (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .get("/client/XD/order")
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test DELETE /client/order/:id (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .delete("/client/order/1")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test DELETE /client/order/:id (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .delete("/client/order/XD")
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test POST /client/:id/order (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .post("/client/2/order")
              .send(
                {
                  products: '[' +
                    '{"product_id": 5, "quantity": 100000}, ' +
                    '{"product_id": 6, "quantity": 500}' +
                  ']'
                }
              )
              .end((err, res) => {
                res.should.have.status(201);
                done();
                console.log(res.body.data);
              });
            });
        });

        describe("Test POST /client/:id/order (invalid)", () => {
          it ("Should return a error message", done => {
            chai
              .request(app)
              .post("/client/XD/order")
              .send(
                {
                  products: '[' +
                    '{"product_id": 5, "quantity": 100000}, ' +
                    '{"product_id": 6, "quantity": 500}' +
                  ']'
                }
              )
              .end((err, res) => {
                res.should.have.status(400);
                done();
                console.log(res.body);
              });
            });
        });

        describe("Test GET /client/order/:id/detail (valid)", () => {
          it ("Should return success message with the clients", done => {
            chai
              .request(app)
              .get("/client/order/2/detail")
              .end((err, res) => {
                res.should.have.status(200);
                done();
                console.log(res.body.data);
              });
            });
        });

      }); // Ending of client testing...

    });

  }); // Ending of main test...
}