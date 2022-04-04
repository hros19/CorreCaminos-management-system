-- ==========================================================================================
-- DATABASE: correcaminosdb
-- CREATION DATE: April 02, 2022
-- Authors: Hansol Antay, Benjamin Johnson
-- ==========================================================================================

DROP DATABASE IF EXISTS correcaminosdb;
CREATE DATABASE IF NOT EXISTS correcaminosdb;
USE correcaminosdb;
SET GLOBAL sql_mode='';
SET GLOBAL event_scheduler = ON;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*
TABLE Vehicle
All the information of the vehicles of the company.
*/
DROP TABLE Vehicle;
CREATE TABLE Vehicle (
	vehicle_id INT NOT NULL AUTO_INCREMENT,
	car_brand VARCHAR(255) NOT NULL,
	car_plaque VARCHAR(255) NOT NULL,
	type_of_gas VARCHAR(255) DEFAULT 'premium',
	purchase_date DATE DEFAULT (CURRENT_DATE),
	gas_tank_capacity FLOAT NOT NULL,
	gas_tank_status FLOAT NOT NULL DEFAULT 0.0,
	last_tank_refill DATE DEFAULT (CURRENT_DATE),
	kilometers_traveled FLOAT NOT NULL DEFAULT 0.0,
    
	CONSTRAINT PK_Vehicle
		PRIMARY KEY (vehicle_id),
	CONSTRAINT UQ_Vehicle_plaque
		UNIQUE (car_plaque)
);

/*
PROCEDURE create_vehicle
Create a register on the table Vehicle and return the new element created.
*/
DELIMITER $$
CREATE PROCEDURE create_vehicle(IN pCarBrand VARCHAR(255), IN pCarPlaque VARCHAR(255),
	IN pTypeOfGas VARCHAR(255), IN pTankCapacity FLOAT, IN pTankStatus FLOAT, IN pKilomTraveled FLOAT)
BEGIN
	IF (pKilomTraveled >= 0 AND pTankCapacity >= 0 AND pTankStatus >= 0 AND (pTankCapacity >= pTankStatus))  
		THEN INSERT INTO Vehicle (car_brand, car_plaque, type_of_gas, gas_tank_capacity,
											 gas_tank_status, kilometers_traveled)
		VALUES (pCarBrand, pCarPlaque, pTypeOfGas, pTankCapacity, pTankStatus, pKilomTraveled);
		SET @VEHICLE_ID = LAST_INSERT_ID();
		SELECT * FROM Vehicle WHERE vehicle_id = @VEHICLE_ID;
    ELSE SELECT 'Invalid tank values' AS 'Error';
	END IF;
END $$
DELIMITER ;

/*
PROCEDURE reg_kilometers
Let register kilometers to an specific vehicle. Also make the discount on the amount
of tank_gas_status considering 1 kilometer is equivalent to 1 Liter of gasoline.

NOTE: This function doesnt make any validations, is necesary to validate the pKilometers
is not bigger than the Vehicle.gas_tank_status
*/
DELIMITER $$
CREATE PROCEDURE reg_kilometers(IN pVehicleId INT, IN pKilometers FLOAT)
BEGIN
	DECLARE vActualKilometers FLOAT;
  SELECT kilometers_traveled INTO vActualKilometers
  FROM Vehicle WHERE vehicle_id = pVehicleId;
  
  UPDATE Vehicle SET kilometers_traveled = (vActualKilometers + pKilometers),
										 gas_tank_status = (gas_tank_status - pKilometers)
  WHERE vehicle_id = pVehicleId;
END $$
DELIMITER ;

/*
PROCEDURE upd_vehicle_details
Let update the basic information of a vehicle.

It also validates that a user does not enter a new maximum gasoline capacity that is less than 
the current capacity of the tank.
*/
DELIMITER $$
CREATE PROCEDURE upd_vehicle_details(IN pVehicleId INT, IN pCarBrand VARCHAR(255), IN pCarPlaque VARCHAR(255),
	IN pTypeOfGas VARCHAR(255), IN pTankCapacity FLOAT)
BEGIN
	DECLARE vActualStatus FLOAT;
  SELECT Vehicle.gas_tank_status INTO vActualStatus
  FROM Vehicle WHERE Vehicle.vehicle_id = pVehicleId;
  IF (vActualStatus > pTankCapacity)
		THEN SELECT 'Actual status of tank is bigger' AS 'Error';
	ELSE
		UPDATE Vehicle
			SET car_brand = pCarBrand, car_plaque = pCarPlaque,
					type_of_gas = pTypeOfGas, gas_tank_capacity = pTankCapacity
		WHERE vehicle_id = pVehicleId;
  END IF;
END $$
DELIMITER ;

/*
PROCEDURE getp_vehicles
Get all the Vehicles with parameters of pagination and also a parameter for the order.
*/
DELIMITER $$
CREATE PROCEDURE getp_vehicles(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255),
	IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Vehicle ORDER BY ', pParameter, ' ', pOrder, ' ',
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

/*
FUNCTION calcQuartsOfValue
Aritmetic function that performs a calculation to determinate in which quartil with
pMaximum value is the pActual value.
@returns the number of the quartil.
*/
DELIMITER $$
CREATE FUNCTION calcQuartsOfValue(pMaximum FLOAT, pActual FLOAT)
	RETURNS INT DETERMINISTIC
  BEGIN
    IF (pActual >= pMaximum * 0.75)
				THEN RETURN 4;
			ELSEIF (pActual >= pMaximum * 0.50)
				THEN RETURN 3;
			ELSEIF (pActual >= pMaximum * 0.25)
				THEN RETURN 2;
			ELSE RETURN 1;
    END IF;
	END $$
DELIMITER ;

/*
PROCEDURE getVehicleStatus
Get the basic information of a specific vehicle.
*/
DELIMITER $$
CREATE PROCEDURE get_veh_status(IN pVehicleId INT)
BEGIN
  SELECT Vehicle.car_plaque, Vehicle.kilometers_traveled,
				 (SELECT calcQuartsOfValue(Vehicle.gas_tank_capacity, Vehicle.gas_tank_status)) AS rem_quartils_of_gas
	FROM Vehicle 
	WHERE vehicle_id = pVehicleId;
END $$
DELIMITER ;

/*
PROCEDURE fillVehicleTank
Let fill the tank with a specific pAmoutOfGas.

It also validates that the size entered into the tank does not exceed the maximum gas 
tank size. What it does in that case is simply ignore the leftover gasoline.
*/
DELIMITER $$
CREATE PROCEDURE fillVehicleTank(IN pVehicleId INT, IN pAmountOfGas FLOAT)
BEGIN
	DECLARE vLastRefill DATE;
  DECLARE vTankCapacity FLOAT;
  DECLARE vTankStatus FLOAT;
  DECLARE vNewTankStatus FLOAT;
  
	SELECT Vehicle.last_tank_refill, Vehicle.gas_tank_capacity, Vehicle.gas_tank_status
  INTO vLastRefill, vTankCapacity, vTankStatus
	FROM Vehicle WHERE Vehicle.vehicle_id = pVehicleId;
  
  IF (vLastRefill != CURRENT_DATE)
			THEN
				CASE
					WHEN (vTankStatus + pAmountOfGas >= vTankCapacity) THEN
						UPDATE Vehicle
							SET gas_tank_status = vTankCapacity,
									last_tank_refill = CURRENT_DATE
							WHERE vehicle_id = pVehicleId;
					ELSE
						UPDATE Vehicle
							SET gas_tank_status = (vTankStatus + pAmountOfGas),
									last_tank_refill = CURRENT_DATE
							WHERE vehicle_id = pVehicleId;
        END CASE;
		ELSE SELECT 'tank_already_filled_today' AS 'ERROR';
	END IF;
END $$
DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*
TABLE MaintenanceLog
Table to save all the maintenance done to the company's vehicles.
*/
CREATE TABLE MaintenanceLog (
	maintenance_id INT NOT NULL AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  maintenance_type VARCHAR(255) NOT NULL,
  maintenance_date DATE DEFAULT (CURRENT_DATE),
  CONSTRAINT PK_MaintLog
		PRIMARY KEY (maintenance_id),
	CONSTRAINT FK_MaintLog_vehId
		FOREIGN KEY (vehicle_id)
    REFERENCES Vehicle (vehicle_id)
    ON DELETE CASCADE
);

-- pendiente
CREATE EVENT myEvent
	ON SCHEDULE EVERY 10 SECOND
		DO
			CALL reportMaintenance(1, "Hola");

/*
PROCEDURE create_maint_log
Permite crear un nuevo reporte de mantenimiento a un vehículo.
Retorna la fila insertada.
*/
DELIMITER $$
CREATE PROCEDURE create_maint_log(IN pVehicleId INT, IN pType VARCHAR(255))
BEGIN
	INSERT INTO MaintenanceLog (vehicle_id, maintenance_type)
  VALUES (pVehicleId, pType);
  SET @MAINT_LOG = LAST_INSERT_ID();
  SELECT * FROM MaintenanceLog WHERE maintenance_id = @MAINT_LOG;
END $$
DELIMITER ;

/*
PROCEDURE upd_maint_log
Allows you to update vehicle maintenance records.
*/
DELIMITER $$
CREATE PROCEDURE upd_maint_log(IN pMaintenanceLogId INT, IN pType VARCHAR(255))
BEGIN
	UPDATE MaintenanceLog
		SET maintenance_type = pType
    WHERE maintenance_id = pMaintenanceLogId;
END $$
DELIMITER ;

/*
PRCOEDURE getp_veh_maint_logs
It allows to obtain all the records of maintenance done to a particular vehicle.
*/
DELIMITER $$
CREATE PROCEDURE getp_veh_maint_logs(IN pVehicleId INT, IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT v.vehicle_id, mn.maintenance_type, mn.maintenance_date FROM Vehicle v ',
												 'INNER JOIN MaintenanceLog mn ',
                         'ON v.vehicle_id = mn.vehicle_id ',
                         'WHERE v.vehicle_id = ', pVehicleId, ' ',
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*
TABLE Driver
Table to keep all the driver of the company.
*/
CREATE TABLE Driver (
	driver_id INT NOT NULL AUTO_INCREMENT,
	vehicle_id INT,
  job_title_id INT,
	driver_name VARCHAR(255) NOT NULL,
	driver_doc_id VARCHAR(255) NOT NULL,
	salary FLOAT NOT NULL,
	hiring_date DATE DEFAULT (CURRENT_DATE),
	CONSTRAINT PK_Driver 
		PRIMARY KEY (driver_id),
	CONSTRAINT FK_Driver_vehId 
		FOREIGN KEY (vehicle_id)
		REFERENCES Vehicle (vehicle_id)
		ON DELETE SET NULL,
	CONSTRAINT FK_JobTitle_id 
		FOREIGN KEY (job_title_id)
    REFERENCES JobTitle (job_title_id)
    ON DELETE SET NULL,
	CONSTRAINT UQ_Driver_docId 
		UNIQUE (driver_doc_id),
	CONSTRAINT UQ_Driver_vehId
		UNIQUE (vehicle_id)
);

/*
PROCEDURE create_driver
Let insert a driver in the respective table and return the row inserted.
*/
DELIMITER $$
CREATE PROCEDURE create_driver(IN pVehicleId INT, IN pJobTitleId INT, IN pDriverName VARCHAR(255),
															 IN pDriverDocId VARCHAR(255), IN pSalary FLOAT)
BEGIN
	INSERT INTO Driver (vehicle_id, job_title_id, driver_name, driver_doc_id, salary)
  VALUES (pVehicleId, pJobTitleId, pDriverName, pDriverDocId, pSalary);
  SET @DRIVER_ID = LAST_INSERT_ID();
  SELECT * FROM Driver WHERE driver_id = @DRIVER_ID;
END $$
DELIMITER ;

/*
PROCEDURE upd_driver
Let update the information of an specific driver.
*/
DELIMITER $$
CREATE PROCEDURE upd_driver(IN pDriverId INT, IN pVehicleId INT, IN pJobTitleId INT, IN pDriverName VARCHAR(255),
														IN pDriverDocId VARCHAR(255), IN pSalary FLOAT)
BEGIN
	UPDATE Driver
  SET vehicle_id = pVehicleId, job_title_id = pJobTitleId, driver_name = pDriverName,
			driver_doc_id = pDriverDocId, salary = pSalary
  WHERE driver_id = pDriverId;
END $$
DELIMITER ;

/*
PROCEDURE getp_drivers
Get all the drivers with given order and paginations parameters.
*/
DELIMITER $$
CREATE PROCEDURE getp_drivers(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), 
															IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT Driver.driver_id, Driver.driver_name, JobTitle.job_title_name, ',
												 'Driver.driver_doc_id, Driver.salary, Driver.hiring_date, ',
												 'Vehicle.vehicle_id, Vehicle.car_plaque FROM Driver ',
                         'LEFT JOIN Vehicle ON Driver.vehicle_id = Vehicle.vehicle_id ',
                         'LEFT JOIN JobTitle ON JobTitle.job_title_id = Driver.job_title_id ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*
TABLE JobTitle
It stores all the different jobs of the company.
*/
CREATE TABLE JobTitle (
	job_title_id INT NOT NULL AUTO_INCREMENT,
	job_title_name VARCHAR(255),
	CONSTRAINT PK_JobTitle 
		PRIMARY KEY (job_title_id),
	CONSTRAINT UQ_JobTitle_name 
		UNIQUE (job_title_name)
);

/*
PROCEDURE create_job_title
Creates a new job_title in the respective table and return the new row inserted.
*/
DELIMITER $$
CREATE PROCEDURE create_job_title(IN pJobTitle VARCHAR(255))
BEGIN
	INSERT INTO JobTitle (job_title_name) VALUES (pJobTitle);
  SET @JOBTITLE_ID = LAST_INSERT_ID();
  SELECT * FROM JobTitle WHERE job_title_id = @JOBTITLE_ID;
END $$
DELIMITER ;

/*
PROCEDURE getp_job_titles
Get all the job titles of the company with pagination parameters.
*/
DELIMITER $$
CREATE PROCEDURE getp_job_titles(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT jb.job_title_id, jb.job_title_name FROM JobTitle jb ',
												 'ORDER BY jb.job_title_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

/*
PROCEDURE upd_job_title
Let update a job title on the table.
*/
DELIMITER $$
CREATE PROCEDURE upd_job_title(IN pJobTitleId INT, IN pJobTitle VARCHAR(255))
BEGIN
	UPDATE JobTitle
  SET job_title_name = pJobTitle WHERE job_title_id = pJobTitleId;
END $$
DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

CREATE TABLE Client (
	client_id INT NOT NULL AUTO_INCREMENT,
  zone_id INT,
  business_type_id INT,
	business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(255) NOT NULL,
	business_representative VARCHAR(255) NOT NULL,
	phone_number VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
  formal_address VARCHAR(255) NOT NULL,
  geological_address POINT NOT NULL,
	CONSTRAINT PK_Client 
		PRIMARY KEY (client_id),
	CONSTRAINT FK_Client_BussTypeId
		FOREIGN KEY (business_type_id)
		REFERENCES BusinessType (business_type_id)
		ON DELETE SET NULL,
	CONSTRAINT FK_Client_ZoneId 
		FOREIGN KEY (zone_id)
    REFERENCES Zone (zone_id)
    ON DELETE SET NULL,
	CONSTRAINT UQ_Client_email 
		UNIQUE (email),
	CONSTRAINT UQ_Client_phone
		UNIQUE (phone_number),
	CONSTRAINT UQ_Client_name
		UNIQUE (business_name),
	CONSTRAINT UQ_GeoLog_Address
		UNIQUE (geologial_address)
); 

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

CREATE TABLE BusinessType (
	business_type_id INT NOT NULL AUTO_INCREMENT,
  business_type_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_BussinessType
		PRIMARY KEY (business_type_id),
	CONSTRAINT UQ_BusinessTypeName
		UNIQUE (business_type_name)
);

DELIMITER $$
CREATE PROCEDURE create_buss_type(IN pBussTypeName VARCHAR(255))
BEGIN
	INSERT INTO BusinessType (business_type_name) VALUES (pBussTypeName);
  SET @BUSS_TYPE_ID = LAST_INSERT_ID();
  SELECT * FROM BusinessType WHERE business_type_id = @BUSS_TYPE_ID;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE getp_buss_types(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM BusinessType ',
												 'ORDER BY business_type_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

DROP PROCEDURE upd_business_type;
DELIMITER $$
CREATE PROCEDURE upd_business_type(IN pBusTypeId INT, IN pBusTypeName VARCHAR(255))
BEGIN
	UPDATE BusinessType
  SET business_type_name = pBusTypeName WHERE business_type_id = pBusTypeId;
END $$
DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

CREATE TABLE Zone (
	zone_id INT NOT NULL AUTO_INCREMENT,
  zone_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_Zone
		PRIMARY KEY (zone_id),
	CONSTRAINT UQ_Zone_Name
		UNIQUE (zone_name)
);

DELIMITER $$
CREATE PROCEDURE create_zone(IN pZoneName VARCHAR(255))
BEGIN
	INSERT INTO Zone (zone_name) VALUES (pZoneName);
  SET @ZONE_ID = LAST_INSERT_ID();
  SELECT * FROM Zone WHERE zone_id = @ZONE_ID;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE getp_zones(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Zone ',
												 'ORDER BY zone_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE upd_zone(IN pZoneId INT, IN pZoneName VARCHAR(255))
BEGIN
	UPDATE Zone
  SET zone_name = pZoneName WHERE zone_id = pZoneId;
END $$
DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
DROP TABLE IF EXISTS Route;
CREATE TABLE Route (
	route_id INT NOT NULL AUTO_INCREMENT,
  zone_id INT NOT NULL,
  route_name VARCHAR(255) NOT NULL,
  route_distance_km FLOAT NOT NULL,
  CONSTRAINT PK_Route
		PRIMARY KEY (route_id),
	CONSTRAINT FK_Route_ZoneId
		FOREIGN KEY (zone_id)
    REFERENCES Zone (zone_id)
    ON DELETE CASCADE,
	CONSTRAINT UQ_Route_Name
		UNIQUE (route_name)
);

DELIMITER $$
DROP PROCEDURE IF EXISTS create_route$$
CREATE PROCEDURE create_route(IN pZoneId INT, IN pRouteName VARCHAR(255), IN pRouteDistanceKm FLOAT)
BEGIN
	INSERT INTO Route (zone_id, route_name, route_distance_km) 
  VALUES (pZoneId, pRouteName, pRouteDistanceKm);
  SET @ROUTE_ID = LAST_INSERT_ID();
  SELECT * FROM Route WHERE route_id = @ROUTE_ID;
END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS getp_routes$$
CREATE PROCEDURE getp_routes(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Route ',
												 'ORDER BY route_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS upd_route$$
CREATE PROCEDURE upd_route(IN pRouteId INT, IN pZoneId INT, IN pRouteName VARCHAR(255),
													 IN pRouteDistanceKm FLOAT)
BEGIN
	IF (pRouteDistanceKm > 0 AND pRouteName != "")
		THEN
			UPDATE Route
			SET zone_id = pZoneId, route_name = pRouteName, route_distance_km = pRouteDistanceKm
      WHERE route_id = pRouteId;
		ELSE SELECT 'Invalid inputs' AS 'Error';
	END IF;
END $$
DELIMITER ;

SHOW PROCEDURE STATUS;
SHOW TABLES;