-- ==========================================================================================
-- DATABASE: correcaminosdb
-- CREATION DATE: April 02, 2022
-- Authors: Hansol Antay
-- ==========================================================================================

DROP DATABASE IF EXISTS correcaminosdb;
CREATE DATABASE IF NOT EXISTS correcaminosdb;
USE correcaminosdb;
SET GLOBAL sql_mode='';
SET GLOBAL event_scheduler = ON;
ALTER DATABASE correcaminosdb CHARACTER SET utf8 COLLATE utf8_unicode_ci;
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- XXVEHICLE
/*
TABLE Vehicle
All the information of the vehicles of the company.
*/
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

DELIMITER $$

/*
PROCEDURE create_vehicle
Create a register on the table Vehicle and return the new element created.
*/
CREATE PROCEDURE create_vehicle(IN pCarBrand VARCHAR(255), IN pCarPlaque VARCHAR(255),
	IN pTypeOfGas VARCHAR(255), IN pTankCapacity FLOAT, IN pTankStatus FLOAT, IN pKilomTraveled FLOAT)
BEGIN
	IF (pKilomTraveled >= 0 AND pTankCapacity >= 0 AND pTankStatus >= 0 AND (pTankCapacity >= pTankStatus))  
		THEN INSERT INTO Vehicle (car_brand, car_plaque, type_of_gas, gas_tank_capacity,
											 gas_tank_status, kilometers_traveled)
		VALUES (pCarBrand, pCarPlaque, pTypeOfGas, pTankCapacity, pTankStatus, pKilomTraveled);
		SET @VEHICLE_ID = LAST_INSERT_ID();
		SELECT * FROM Vehicle WHERE vehicle_id = @VEHICLE_ID;
  ELSE
		IF (pKilomTraveled < 0) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid value for (kilometers_traveled)', MYSQL_ERRNO = '1000';
		ELSEIF (pTankCapacity < 0) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid value for (gas_tank_capacity)', MYSQL_ERRNO = '1001';
		ELSEIF (pTankStatus < 0) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid value for (gas_tank_capacity)', MYSQL_ERRNO = '1002';
		ELSEIF (pTankCapacity < pTankStatus) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '(gas_tank_capacity) cannot be less than the current state (gas_tank_status)', MYSQL_ERRNO = '1003';
		ELSE
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unexpected error during creation of vehicle', MYSQL_ERRNO = '1004';
		END IF;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: The vehicle could not be created.', MYSQL_ERRNO = '1000';
	END IF;
END $$

/*
PROCEDURE reg_kilometers
Let register kilometers to an specific vehicle. Also make the discount on the amount
of tank_gas_status considering 1 kilometer is equivalent to 1 Liter of gasoline.

NOTE: This function doesnt make any validations, is necesary to validate the pKilometers
is not bigger than the Vehicle.gas_tank_status
*/
CREATE PROCEDURE reg_kilometers(IN pVehicleId INT, IN pKilometers FLOAT)
BEGIN
	DECLARE vActualKilometers FLOAT;
	DECLARE vActualTankStatus FLOAT;
  SELECT kilometers_traveled, gas_tank_status INTO vActualKilometers, vActualTankStatus
  FROM Vehicle WHERE vehicle_id = pVehicleId;
  -- Check if the kilometers are valid
	IF (vActualTankStatus - pKilometers < 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Need more gasoline to travel that amount of kilometers', MYSQL_ERRNO = '1000';
	ELSEIF (pKilometers < 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unvalid kilometers by parameter', MYSQL_ERRNO = '1001';
	ELSE
		UPDATE Vehicle SET kilometers_traveled = (vActualKilometers + pKilometers),
											gas_tank_status = (gas_tank_status - pKilometers)
		WHERE vehicle_id = pVehicleId;
	END IF;
	COMMIT;
END $$

/*
PROCEDURE upd_vehicle_details
Let update the basic information of a vehicle.

It also validates that a user does not enter a new maximum gasoline capacity that is less than 
the current capacity of the tank.
*/
CREATE PROCEDURE upd_vehicle_details(IN pVehicleId INT, IN pCarBrand VARCHAR(255), IN pCarPlaque VARCHAR(255),
	IN pTypeOfGas VARCHAR(255), IN pTankCapacity FLOAT)
BEGIN
	DECLARE vActualStatus FLOAT;
  SELECT Vehicle.gas_tank_status INTO vActualStatus
  FROM Vehicle WHERE Vehicle.vehicle_id = pVehicleId;
  IF (vActualStatus > pTankCapacity) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actual status overpass the tank maximum capacity', MYSQL_ERRNO = '1000';
	ELSE
		UPDATE Vehicle
			SET car_brand = pCarBrand, car_plaque = pCarPlaque,
					type_of_gas = pTypeOfGas, gas_tank_capacity = pTankCapacity
		WHERE vehicle_id = pVehicleId;
  END IF;
END $$

/*
PROCEDURE getp_vehicles
Get all the Vehicles with parameters of pagination and also a parameter for the order.
*/
CREATE PROCEDURE getp_vehicles(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255),
	IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Vehicle ORDER BY ', pParameter, ' ', pOrder, ' ',
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
FUNCTION calcQuartsOfValue
Aritmetic function that performs a calculation to determinate in which quartil with
pMaximum value is the pActual value.
@returns the number of the quartil.
*/
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

/*
PROCEDURE getVehicleStatus
Get the basic information of a specific vehicle.
*/
CREATE PROCEDURE get_veh_status(IN pVehicleId INT)
BEGIN
  SELECT Vehicle.car_plaque, Vehicle.kilometers_traveled,
				 (SELECT calcQuartsOfValue(Vehicle.gas_tank_capacity, Vehicle.gas_tank_status)) AS rem_quartils_of_gas
	FROM Vehicle 
	WHERE vehicle_id = pVehicleId;
END $$

/*
PROCEDURE fillVehicleTank
Let fill the tank with a specific pAmoutOfGas.

It also validates that the size entered into the tank does not exceed the maximum gas 
tank size. What it does in that case is simply ignore the leftover gasoline.
*/
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
	ELSE
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gasoline tank already filled today', MYSQL_ERRNO = '1000';
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

DELIMITER $$

/*
PROCEDURE create_maint_log
Permite crear un nuevo reporte de mantenimiento a un vehículo.
Retorna la fila insertada.
*/
CREATE PROCEDURE create_maint_log(IN pVehicleId INT, IN pType VARCHAR(255))
BEGIN
	INSERT INTO MaintenanceLog (vehicle_id, maintenance_type)
  VALUES (pVehicleId, pType);
  SET @MAINT_LOG = LAST_INSERT_ID();
  SELECT * FROM MaintenanceLog WHERE maintenance_id = @MAINT_LOG;
END $$

/*
PROCEDURE upd_maint_log
Allows you to update vehicle maintenance records.
*/
CREATE PROCEDURE upd_maint_log(IN pMaintenanceLogId INT, IN pType VARCHAR(255))
BEGIN
	UPDATE MaintenanceLog
		SET maintenance_type = pType
    WHERE maintenance_id = pMaintenanceLogId;
END $$

/*
PRCOEDURE getp_veh_maint_logs
It allows to obtain all the records of maintenance done to a particular vehicle.
*/
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

CREATE PROCEDURE get_veh_maint_logs(IN pVehicleId INT)
BEGIN
	SELECT v.vehicle_id, mn.maintenance_type, mn.maintenance_date FROM Vehicle v
	INNER JOIN MaintenanceLog mn
	ON v.vehicle_id = mn.vehicle_id
	WHERE v.vehicle_id = pVehicleId;
END$$

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

DELIMITER $$

/*
PROCEDURE create_job_title
Creates a new job_title in the respective table and return the new row inserted.
*/
CREATE PROCEDURE create_job_title(IN pJobTitle VARCHAR(255))
BEGIN
	INSERT INTO JobTitle (job_title_name) VALUES (pJobTitle);
  SET @JOBTITLE_ID = LAST_INSERT_ID();
  SELECT * FROM JobTitle WHERE job_title_id = @JOBTITLE_ID;
END $$

/*
PROCEDURE getp_job_titles
Get all the job titles of the company with pagination parameters.
*/
CREATE PROCEDURE getp_job_titles(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT jb.job_title_id, jb.job_title_name FROM JobTitle jb ',
												 'ORDER BY jb.job_title_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE upd_job_title
Let update a job title on the table.
*/
CREATE PROCEDURE upd_job_title(IN pJobTitleId INT, IN pJobTitle VARCHAR(255))
BEGIN
	UPDATE JobTitle
  SET job_title_name = pJobTitle WHERE job_title_id = pJobTitleId;
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

DELIMITER $$

/*
PROCEDURE create_driver
Let insert a driver in the respective table and return the row inserted.
*/
CREATE PROCEDURE create_driver(IN pVehicleId INT, IN pJobTitleId INT, IN pDriverName VARCHAR(255),
															 IN pDriverDocId VARCHAR(255), IN pSalary FLOAT)
BEGIN
	INSERT INTO Driver (vehicle_id, job_title_id, driver_name, driver_doc_id, salary)
  VALUES (pVehicleId, pJobTitleId, pDriverName, pDriverDocId, pSalary);
  SET @DRIVER_ID = LAST_INSERT_ID();
  SELECT * FROM Driver WHERE driver_id = @DRIVER_ID;
END $$

/*
PROCEDURE upd_driver
Let update the information of an specific driver.
*/
CREATE PROCEDURE upd_driver(IN pDriverId INT, IN pVehicleId INT, IN pJobTitleId INT, IN pDriverName VARCHAR(255),
														IN pDriverDocId VARCHAR(255), IN pSalary FLOAT)
BEGIN
	UPDATE Driver
  SET vehicle_id = pVehicleId, job_title_id = pJobTitleId, driver_name = pDriverName,
			driver_doc_id = pDriverDocId, salary = pSalary
  WHERE driver_id = pDriverId;
END $$

/*
PROCEDURE getp_drivers
Get all the drivers with given order and paginations parameters.
*/
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

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
Table: GeologicalAddress
Description: The purpose for this table is to contain the geological information of each client.
*/
CREATE TABLE GeologicalAddress (
	geo_address_id INT NOT NULL AUTO_INCREMENT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  geo_point POINT NOT NULL,
  CONSTRAINT PK_GeoAddrId
		PRIMARY KEY (geo_address_id),
	CONSTRAINT UQ_GeoAddrLatLong
		UNIQUE (latitude, longitude)
);

DELIMITER $$

/*
FUNCTION: create_geo_addr
DESCRIPTION: Create a register on the table GeologicalAddress and returns the id of the row.
The purpose of this function is for being used in a create_Client procedure, we would call
this function to asign the new client with the geological address.
*/
CREATE FUNCTION create_geo_addr(pLatitude FLOAT, pLongitude FLOAT)
	RETURNS INT DETERMINISTIC
BEGIN
	SET @vPoint = POINT(pLatitude, pLongitude);
	INSERT INTO GeologicalAddress (latitude, longitude, geo_point) VALUES (pLatitude, pLongitude, @vPoint);
  SET @ID = LAST_INSERT_ID();
  RETURN @ID;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: DeliveryDay
DESCRIPTION: Is literally just a table for 'DaysOfWeek', I dont remember why I did this. :P
*/
CREATE TABLE DeliveryDay (
	dev_day_id INT NOT NULL AUTO_INCREMENT,
  dev_day_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_DevDayId
		PRIMARY KEY (dev_day_id),
	CONSTRAINT UQ_DevDayName
		UNIQUE (dev_day_name)
);

DELIMITER $$

/*
PROCEDURE: create_dev_day
DESCRIPTION: just register the new day and returns it.
Maybe is just an unnecesary functionality, we can just insert the days manually.
*/
CREATE PROCEDURE create_dev_day(IN pDevDayName VARCHAR(255))
BEGIN
	INSERT INTO DeliveryDay (dev_day_name) VALUES (pDevDayName);
  SET @ID = LAST_INSERT_ID();
  SELECT * FROM DeliveryDay WHERE dev_day_id = @ID;
END $$

/*
PROCEDURE: getp_dev_days
DESCRIPTION: Return all the delivery days with pagination parameters.
*/
CREATE PROCEDURE getp_dev_days(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM DeliveryDay ',
												 'ORDER BY dev_day_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_dev_day
DESCRIPTION: Update an actually delivery day.
*/
DROP PROCEDURE IF EXISTS upd_dev_day$$
CREATE PROCEDURE upd_dev_day(IN pDevDayId INT, IN pDevDayName VARCHAR(255))
BEGIN
	UPDATE DeliveryDay
  SET dev_dev_name = pDevDayName WHERE dev_day_id = pDevDayId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: DeliveryInterval
DESCRIPTION: The interval of how much a Client can make orders.
{DAILY, TWO_PER_WEEK, WEEKLY, BIWEEKLY}
*/
CREATE TABLE DeliveryInterval (
	dev_interval_id INT NOT NULL AUTO_INCREMENT,
  dev_interval_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_DevIntervId
		PRIMARY KEY (dev_interval_id),
	CONSTRAINT UQ_DevIntervName
		UNIQUE (dev_interval_name)
);

DELIMITER $$

/*
PROCEDURE: create_dev_interval
DESCRIPTION: Creates a new delivery interval
*/
CREATE PROCEDURE create_dev_interval(IN pDevIntervalName VARCHAR(255))
BEGIN
	INSERT INTO DeliveryInterval (dev_interval_name) VALUES (pDevIntervalName);
  SET @DEV_INTERV_ID = LAST_INSERT_ID();
  SELECT * FROM DeliveryInterval WHERE dev_interval_id = @DEV_INTERV_ID;
END $$

/*
PROCEDURE: getp_dev_intervals
DESCRIPTION: Get all the delivery intervals with pagination parameters.
*/
CREATE PROCEDURE getp_dev_intervals(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM DeliveryInterval ',
												 'ORDER BY dev_interval_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_dev_interval
DESCRIPTION: Update an existing delivery interval.
*/
CREATE PROCEDURE upd_dev_interval(IN pDevIntervalId INT, IN pDevIntervalName VARCHAR(255))
BEGIN
	UPDATE DeliveryInterval
  SET dev_interval_name = pDevIntervalName WHERE dev_interval_id = pDevIntervalId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: BusinessType
DESCRIPTION: New business type for distinguish some clients
*/
CREATE TABLE BusinessType (
	business_type_id INT NOT NULL AUTO_INCREMENT,
  business_type_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_BussinessType
		PRIMARY KEY (business_type_id),
	CONSTRAINT UQ_BusinessTypeName
		UNIQUE (business_type_name)
);

DELIMITER $$

/*
PROCEDURE: create_buss_type
DESCRIPTION: Inserts a new business type on the table and returns it.
*/
CREATE PROCEDURE create_buss_type(IN pBussTypeName VARCHAR(255))
BEGIN
	INSERT INTO BusinessType (business_type_name) VALUES (pBussTypeName);
  SET @BUSS_TYPE_ID = LAST_INSERT_ID();
  SELECT * FROM BusinessType WHERE business_type_id = @BUSS_TYPE_ID;
END $$

/*
PROCEDURE: getp_buss_types
DESCRIPTION: Returns all the business types registered with pagination parameters.
*/
CREATE PROCEDURE getp_buss_types(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM BusinessType ',
												 'ORDER BY business_type_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_business_type
DESCRIPTION: Update an existing business type from the table.
*/
CREATE PROCEDURE upd_business_type(IN pBusTypeId INT, IN pBusTypeName VARCHAR(255))
BEGIN
	UPDATE BusinessType
  SET business_type_name = pBusTypeName WHERE business_type_id = pBusTypeId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: Zone
DESCRIPTION: New zone for the ubications of the Clients.
*/
CREATE TABLE Zone (
	zone_id INT NOT NULL AUTO_INCREMENT,
  zone_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_Zone
		PRIMARY KEY (zone_id),
	CONSTRAINT UQ_Zone_Name
		UNIQUE (zone_name)
);

DELIMITER $$

/*
PROCEDURE: create_zone
DESCRIPTION: Register a new zone in the table.
*/
CREATE PROCEDURE create_zone(IN pZoneName VARCHAR(255))
BEGIN
	INSERT INTO Zone (zone_name) VALUES (pZoneName);
  SET @ZONE_ID = LAST_INSERT_ID();
  SELECT * FROM Zone WHERE zone_id = @ZONE_ID;
END $$

/*
PROCEDURE: getp_zones
DESCRIPTION: Get all the zones from the table with pagination parameters.
*/
CREATE PROCEDURE getp_zones(IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Zone ',
												 'ORDER BY zone_name ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_zone
DESCRIPTION: updates and exisiting zone from the table.
*/
CREATE PROCEDURE upd_zone(IN pZoneId INT, IN pZoneName VARCHAR(255))
BEGIN
	UPDATE Zone
  SET zone_name = pZoneName WHERE zone_id = pZoneId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: Route
DESCRIPTION: Routes would be asociated with a zone.
*/
CREATE TABLE Route (
	route_id INT NOT NULL AUTO_INCREMENT,
  route_name VARCHAR(255) NOT NULL,
  route_distance_km FLOAT NOT NULL,
  CONSTRAINT PK_Route
		PRIMARY KEY (route_id),
	CONSTRAINT UQ_Route_Name
		UNIQUE (route_name)
);

DELIMITER $$

/*
PROCEDURE: create_route
DESCRIPTION: register a new route in the table.
*/
CREATE PROCEDURE create_route(IN pRouteName VARCHAR(255), IN pRouteDistanceKm FLOAT)
BEGIN
	INSERT INTO Route (route_name, route_distance_km) 
  VALUES (pRouteName, pRouteDistanceKm);
  SET @ROUTE_ID = LAST_INSERT_ID();
  SELECT * FROM Route WHERE route_id = @ROUTE_ID;
END $$

/*
PROCEDURE: getp_routes
DESCRIPTION: Get all the routes with pagination parameters.
*/
CREATE PROCEDURE getp_routes(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Route ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_route
DESCRIPTION: Update an existing route from the table.
*/
CREATE PROCEDURE upd_route(IN pRouteId INT, IN pRouteName VARCHAR(255),
													 IN pRouteDistanceKm FLOAT)
BEGIN
	IF (pRouteDistanceKm > 0 AND pRouteName != "")
		THEN
			UPDATE Route
			SET route_name = pRouteName, route_distance_km = pRouteDistanceKm
      WHERE route_id = pRouteId;
		ELSE SELECT 'Invalid inputs' AS 'Error';
	END IF;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: ZoneXRoute
DESCRIPTION: Stablish a relationship from Routes and Zones.
*/
CREATE TABLE ZoneXRoute (
	zone_id INT NOT NULL,
  route_id INT NOT NULL,
  CONSTRAINT PK_ZoneXRoute_id
		PRIMARY KEY (zone_id, route_id),
	CONSTRAINT FK_Zone_id
		FOREIGN KEY (zone_id)
		REFERENCES Zone (zone_id)
    ON DELETE CASCADE,
	CONSTRAINT FK_Route_id
		FOREIGN KEY (route_id)
    REFERENCES Route (route_id)
    ON DELETE CASCADE
);

DELIMITER $$

/*
PROCEDURE: create_zonexroute
DESCRIPTION: Creates a new relationship from a zone and a route and returns the information of the row.
*/
CREATE PROCEDURE create_zonexroute(IN pZoneId INT, IN pRouteId INT)
BEGIN
	INSERT INTO ZoneXRoute (zone_id, route_id)
	VALUES (pZoneId, pRouteId);
  SELECT Zone.zone_name, zxr.zone_id, Route.route_name, zxr.route_id FROM ZoneXRoute zxr
  RIGHT JOIN Zone ON zxr.zone_id = Zone.zone_id
  LEFT JOIN Route ON zxr.route_id = Route.route_id
  WHERE ( ((Zone.zone_id, Route.route_id) = (pZoneId, pRouteId)) AND Route.route_name != '' AND Zone.zone_name != '');
END $$

/*
PROCEDURE: rem_zonexroute
DESCRIPTION: Deasociate a zone with a route.
*/
CREATE PROCEDURE rem_zonexroute(IN pZoneId INT, IN pRouteId INT)
BEGIN
	DELETE FROM ZoneXRoute
  WHERE (zone_id, route_id) = (pZoneId, pRouteId);
END $$

/*
PROCEDURE: getp_zone_routes
DESCRIPTION: Get all the zone and routes with pagination parameters.
*/
CREATE PROCEDURE getp_zone_routes(IN pZoneId INT, IN pParameter VARCHAR(255), IN pOrder VARCHAR(255),
																	IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(350);
  SET @strQuery = CONCAT('SELECT rt.route_id, rt.route_name FROM Zone zn ',
												 'INNER JOIN ZoneXRoute zxr ON zxr.zone_id = ', pZoneId, ' ',
												 'INNER JOIN Route rt ON zxr.route_id = rt.route_id ',
												 'WHERE zn.zone_id = ', pZoneId, ' ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE get_zone_routes
DESCRIPTION: Retrieve all the routes of an specific zone.
*/
CREATE PROCEDURE get_zone_routes(IN pZoneId INT)
BEGIN
	SELECT Route.route_id, Route.route_name FROM Zone zn
	INNER JOIN ZoneXRoute zxr ON zxr.zone_id = pZoneId
	INNER JOIN Route ON zxr.route_id = Route.route_id
	WHERE zn.zone_id = pZoneId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: Supplier
DESCRIPTION: All the supplier that give products to the CorreCaminos company.
*/
CREATE TABLE Supplier (
	supplier_id INT NOT NULL AUTO_INCREMENT,
  supplier_name VARCHAR(255) NOT NULL,
  formal_address VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  have_delivery VARCHAR(5) NOT NULL DEFAULT 'YES',
  CONSTRAINT PK_Supplier
		PRIMARY KEY Supplier (supplier_id),
	CONSTRAINT UQ_Supplier_Name
		UNIQUE (supplier_name),
	CONSTRAINT UQ_Supplier_email
		UNIQUE (email),
	CONSTRAINT UQ_Supplier_Phone
		UNIQUE (phone_number)
);

DELIMITER $$

/*
PROCEDURE: create_supplier
DESCRIPTION: register a new supplier in the table and returns it.
*/
CREATE PROCEDURE create_supplier(IN pName VARCHAR(255), IN pAddress VARCHAR(255),
																 IN pPhone VARCHAR(255), IN pEmail VARCHAR(255), 
                                 IN pHaveDelivery VARCHAR(25))
BEGIN
	INSERT INTO Supplier (supplier_name, formal_address, phone_number, email, have_delivery) 
  VALUES (pName, pAddress, pPhone, pEmail, pHaveDelivery);
  SET @ID = LAST_INSERT_ID();
  SELECT * FROM Supplier WHERE supplier_id = @ID;
END $$

/*
PROCEDURE: upd_supplier
DESCRIPTION: Update the main information of an existing supplier.
*/
CREATE PROCEDURE upd_supplier(IN pSupplierId INT, IN pName VARCHAR(255), IN pAddress VARCHAR(255),
															IN pPhone VARCHAR(255), IN pEmail VARCHAR(255), 
															IN pHaveDelivery VARCHAR(25))
BEGIN
	UPDATE Supplier
  SET supplier_name = pName, formal_address = pAddress, phone_number = pPhone, email = pEmail,
			have_delivery = pHaveDelivery
	WHERE supplier_id = pSupplierId;
END $$

/*
PROCEDURE: getp_suppliers
DESCRIPTION: Get all the supplier with pagination parameters.
*/
CREATE PROCEDURE getp_suppliers(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), 
																IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Supplier ',
												 'ORDER BY ', pParameter, ' ' ,pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: ProductCategory
DESCRIPTION: This table would keep all the product categories.
*/
CREATE TABLE ProductCategory (
	product_cat_id INT NOT NULL AUTO_INCREMENT,
  product_cat_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_ProdCat_id
		PRIMARY KEY (product_cat_id),
	CONSTRAINT UQ_ProdCat_name
		UNIQUE (product_cat_name)
);

DELIMITER $$

/*
PROCEDURE: create_prodCat
DESCRIPTION: Creates a new product category
*/
CREATE PROCEDURE create_prodCat(IN pProdCatName VARCHAR(255))
BEGIN
	INSERT INTO ProductCategory (product_cat_name) 
  VALUES (pProdCatName);
  SET @PRODUCT_CAT_ID = LAST_INSERT_ID();
  SELECT * FROM ProductCategory WHERE product_cat_id = @PRODUCT_CAT_ID;
END $$

/*
PROCEDURE: getp_prodCategories
DESCRIPTION: Return all the product categories with pagination parameters.
*/
CREATE PROCEDURE getp_prodCategories(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM ProductCategory ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_prodCategory
DESCRIPTION: Update an existing product category from the table.
*/
CREATE PROCEDURE upd_prodCategory(IN pProdCatId INT, IN pProdCatName VARCHAR(255))
BEGIN
	UPDATE ProductCategory
	SET product_cat_name = pProdCatName
	WHERE product_cat_id = pProdCatId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: ProductSubCategory
DESCRIPTION: Table to keep the subcategories of each product.
*/
CREATE TABLE ProductSubCategory (
	product_subcat_id INT NOT NULL AUTO_INCREMENT,
  product_subcat_catId INT NOT NULL, 
  product_subcat_name VARCHAR(255) NOT NULL,
  CONSTRAINT PK_ProdSubCat_id
		PRIMARY KEY (product_subcat_id),
	CONSTRAINT UQ_ProdSubCat_name
		UNIQUE (product_subcat_name),
	CONSTRAINT FK_ProdSubCat_CatId
		FOREIGN KEY (product_subcat_catId)
    REFERENCES ProductCategory (product_cat_id)
    ON DELETE CASCADE
);

DELIMITER $$

/*
PROCEDURE: create_prodSubCat
DESCRIPTION: create a new product subcategory, asociated to an product category
*/
CREATE PROCEDURE create_prodSubCat(IN pProdSubCatName VARCHAR(255), IN pCatId INT)
BEGIN
	INSERT INTO ProductSubCategory (product_subcat_name, product_subcat_catId) 
  VALUES (pProdSubCatName, pCatId);
  SET @PRODUCT_SUBCAT_ID = LAST_INSERT_ID();
  SELECT * FROM ProductSubCategory WHERE product_subcat_id = @PRODUCT_SUBCAT_ID;
END $$

/*
PROCEDURE: getp_prodSubCategories
DESCRIPTION: Get all the product sub categories with pagination parameters.
*/
CREATE PROCEDURE getp_prodSubCategories(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255),
																				IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT pc.product_cat_id AS "Category_id", pc.product_cat_name AS "Category_name",',
												 'psc.product_subcat_id AS "SubCategory_id", psc.product_subcat_name AS "SubCategory_name" ',
												 'FROM ProductSubCategory psc ',
                         'RIGHT JOIN ProductCategory pc ON psc.product_subcat_catId = pc.product_cat_id ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
FUNCTION: get_subcat_cat
DESCRIPTION: Return the id of the category of an specific subcategory.
*/
CREATE FUNCTION get_subcat_cat(pProdSubCatId INT)
	RETURNS INT DETERMINISTIC
BEGIN
	SET @v := (SELECT pc.product_cat_id FROM ProductSubCategory psc
						 INNER JOIN ProductCategory pc ON psc.product_subcat_catId = pc.product_cat_id
						 WHERE product_subcat_id = pProdSubCatId);
	RETURN @v;
END $$

/*
PROCEDURE: upd_prodSubCategory
DESCRIPTION: Update an existing product subcategory.
*/
CREATE PROCEDURE upd_prodSubCategory(IN pProdSubCatId INT, IN pProdSubCatName VARCHAR(255))
BEGIN
	UPDATE ProductSubCategory
	SET product_subcat_name = pProdSubCatName
	WHERE product_subcat_id = pProdSubCatId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: Product
DESCRIPTION: All the products registered.
*/
CREATE TABLE Product (
	product_id INT NOT NULL AUTO_INCREMENT,
  supplier_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_cat_id INT NOT NULL,
  product_subcat_id INT NOT NULL,
  is_available VARCHAR(20) NOT NULL DEFAULT 'YES',
  CONSTRAINT PK_Product
		PRIMARY KEY (product_id),
	CONSTRAINT FK_Product_SupId
		FOREIGN KEY (supplier_id)
    REFERENCES Supplier (supplier_id)
    ON DELETE CASCADE,
	CONSTRAINT FK_Product_catId
		FOREIGN KEY (product_cat_id)
    REFERENCES ProductCategory (product_cat_id)
    ON DELETE RESTRICT,
	CONSTRAINT FK_Product_subcatId
		FOREIGN KEY (product_subcat_id)
    REFERENCES ProductSubCategory (product_subcat_id)
    ON DELETE RESTRICT,
	CONSTRAINT UQ_Product_name
		UNIQUE (product_name)
);

DELIMITER $$

/*
PROCEDURE create_product
DESCRIPTION: Creates a new product on the database.
*/
CREATE PROCEDURE create_product(IN pProdName VARCHAR(255), IN pSupplierId INT, IN pSubCatId INT,
																IN pIsAvailable VARCHAR(10))
BEGIN
	SET @category_id := get_subcat_cat(pSubCatId);
  IF (@category_id IS NULL)
		THEN SELECT 'No subcategory with that id' AS 'Error';
	ELSE
		INSERT INTO Product (product_name, supplier_id, product_cat_id, product_subcat_id, is_available)
		VALUES (pProdName, pSupplierId, @category_id, pSubCatId, pIsAvailable);
		SET @PRODUCT_ID = LAST_INSERT_ID();
		SELECT * FROM Product WHERE product_id = @PRODUCT_ID;
  END IF;
END $$

/*
PROCEDURE: getp_pruducts
DESCRIPTION: Return all the products with pagination parameters.
*/
CREATE PROCEDURE getp_products(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM Product ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: upd_product
DESCRIPTION: Update an existing product
*/
CREATE PROCEDURE upd_product(IN pProductId INT, IN pProductName VARCHAR(255), IN pSubCatId INT, IN pIsAvailable VARCHAR(255))
BEGIN
	SET @category_id := get_subcat_cat(pSubCatId);
  IF (@category_id IS NULL)
		THEN SELECT 'No subcategory with that id' AS 'Error';
	ELSE
		UPDATE Product
    SET product_name = pProductName, product_cat_id = @category_id, product_subcat_id = pSubCatId,
				is_available = pIsAvailable
		WHERE product_id = pProductId;
  END IF;
END $$

/*
PROCEDURE getp_sup_products
DESCRIPTION: Get all the products of a supplier.
*/
CREATE PROCEDURE getp_sup_products(IN pSupplierId INT, IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT prod.product_id, prod.product_name, psc.product_subcat_id, ', 
												 'psc.product_subcat_name, sup.supplier_id, sup.supplier_name, prod.is_available ',
												 'FROM Product prod ',
												 'INNER JOIN Supplier sup ON sup.supplier_id = prod.supplier_id ',
                         'INNER JOIN ProductSubCategory psc ON psc.product_subcat_id = prod.product_subcat_id ',
                         'WHERE prod.supplier_id = ', pSupplierId, ' ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;	
END $$

/*
PROCEDURE: get_sup_products
DESCRIPTION: Get a product by an specific supplier without pagination.
*/
CREATE PROCEDURE get_sup_products(IN pSupplierId INT)
BEGIN
  DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT prod.product_id, prod.product_name, psc.product_subcat_id, ', 
                         'psc.product_subcat_name, sup.supplier_id, sup.supplier_name, prod.is_available ',
                         'FROM Product prod ',
                         'INNER JOIN Supplier sup ON sup.supplier_id = prod.supplier_id ',
                         'INNER JOIN ProductSubCategory psc ON psc.product_subcat_id = prod.product_subcat_id ',
                         'WHERE prod.supplier_id = ', pSupplierId);
  PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE BusinessStock
DESCRIPTION: Keeps all the products that are available on the company stock.
*/
CREATE TABLE BusinessStock(
	product_id INT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT PK_BussStock
		PRIMARY KEY (product_id),
	CONSTRAINT FK_BussStock_prodId
		FOREIGN KEY (product_id)
    REFERENCES Product (product_id)
    ON DELETE RESTRICT
);

DELIMITER $$

/*
FUNCTION get_product_status
DESCRIPTION: Returns the actual status of a product.
*/
CREATE FUNCTION get_product_status(pProductId INT)
	RETURNS VARCHAR(25) DETERMINISTIC
BEGIN
	SET @status := (SELECT is_available FROM Product WHERE product_id = pProductId);
  RETURN @status;
END$$

/*
PROCEDURE getp_businessStock
DESCRIPTION: Get all the products in the business stock with pagination parameters.
*/
CREATE PROCEDURE getp_businessStock(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM BusinessStock ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE reg_product_bussStock
DESCRIPTION: Register new products in the businessStock.
*/
CREATE PROCEDURE reg_prod_bussStock(IN pProductId INT, IN pQuantity INT)
BEGIN
	INSERT INTO BusinessStock (product_id, quantity)
  VALUES (pProductId, pQuantity);
  SELECT p.product_id, p.product_name, bs.quantity FROM BusinessStock bs
  INNER JOIN Product p ON p.product_id = bs.product_id
  WHERE bs.product_id = pProductId;
END $$

/*
FUNCTION get_product_quantity
DESCRIPTION: Return the actual quantity of specific product.
*/
CREATE FUNCTION get_product_quantity(pProductId INT)
	RETURNS INT DETERMINISTIC
BEGIN
	SET @v := (SELECT quantity FROM BusinessStock WHERE product_id = pProductId);
  return @v;
END $$

/*
PROCEDURE fill_product_bussStock
DESCRIPTION: Fill the stock of an existing product in the business stock.
*/
CREATE PROCEDURE fill_product_bussStock(IN pProductId INT, IN pQuantity INT)
BEGIN
	SET @actual_quantity := get_product_quantity(pProductId);
  SET @new_quantity := (@actual_quantity + pQuantity);
  UPDATE BusinessStock
  SET quantity = @new_quantity WHERE product_id = pProductId;
END $$

/*
PROCEDURE unreg_product_bussStock
DESCRIPTION: Unregister a specific amount of a product in the business stock. 
This can also be readin as a 'extrack product from bussiness stock'.
*/
CREATE PROCEDURE unreg_product_bussStock(IN pProductId INT, IN pQuantity INT)
BEGIN
	SET @actual_quantity := get_product_quantity(pProductId);
  SET @new_quantity := (@actual_quantity - pQuantity);
  IF (@new_quantity <= 0) THEN
		UPDATE BusinessStock
		SET quantity = 0 WHERE product_id = pProductId;
	ELSE
		UPDATE BusinessStock
		SET quantity = @new_quantity WHERE product_id = pProductId;
	END IF;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: SupplierOrder
DESCRIPTION: This table is to register all the orders the company made to each
supplier, also having control of the last order.
*/
CREATE TABLE SupplierOrder (
	supplier_order_id INT NOT NULL AUTO_INCREMENT,
	supplier_id INT NOT NULL,
  order_date DATE DEFAULT (CURRENT_DATE),
  CONSTRAINT PK_SupOrder
		PRIMARY KEY (supplier_order_id),
	CONSTRAINT FK_SupOrder_SupId
		FOREIGN KEY (supplier_id)
    REFERENCES Supplier (supplier_id)
    ON DELETE CASCADE,
	CONSTRAINT UQ_SupOrder
		UNIQUE (supplier_id, order_date)
);

DELIMITER $$

/*
FUNCTION: getq_ordersBySup
DESCRIPTION: Get the quantity of the total orders by a specific supplier.
*/
CREATE FUNCTION getq_ordersBySup(pSupplierId INT)
	RETURNS INT DETERMINISTIC
BEGIN
	SET @qty := (SELECT COUNT(*) FROM SupplierOrder WHERE supplier_id = pSupplierId);
  RETURN @qty;
END$$

/*
FUNCTION: getd_lastOrderSup
DESCRIPTION: Returns the date of the last order by an specific Supplier.
*/
CREATE FUNCTION getd_lastOrderSup(pSupplierId INT)
	RETURNS DATE DETERMINISTIC
BEGIN
	DECLARE last_order DATE;
  SET last_order = (SELECT order_date FROM SupplierOrder
										WHERE supplier_id = pSupplierId
										ORDER BY order_date DESC LIMIT 0, 1);
	return last_order;
END$$

/*
PROCEDURE: get_ordersBySup
DESCRIPTION: Get all the orders made by a specific supplier without pagination parameters
*/
CREATE PROCEDURE get_ordersBySup(IN pSupplierId INT)
BEGIN
  DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM SupplierOrder ',
                         'WHERE supplier_id = ', pSupplierId);
  PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: getp_ordersBySup
DESCRIPTION: Get all the orders by a specific supplier with pagination parameters.
*/
CREATE PROCEDURE getp_ordersBySup(IN pSupplierId INT, IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
  DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM SupplierOrder ',
                         'WHERE supplier_id = ', pSupplierId, ' ',
                         'ORDER BY ', pParameter, ' ', pOrder, ' ', 
                         'LIMIT ', pStart, ', ', pElemPerPage);
  PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE: create_supOrder
DESCRIPTION: Register a new order for a Supplier and also returns the id of the
SupplierOrder just created.
*/
CREATE PROCEDURE create_supOrder(IN pSupplierId INT)
BEGIN
	INSERT INTO SupplierOrder (supplier_id)
  VALUES (pSupplierId);
  SET @ID = LAST_INSERT_ID();
  SELECT @ID AS ID;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: SupplierOrdDet
DESCRIPTION: Would manage the details for each order for the suppliers.
*/
CREATE TABLE SupplierOrdDet (
	supplier_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT PK_SupOrdDet
		PRIMARY KEY (supplier_order_id, product_id),
	CONSTRAINT FK_SupOrdDet_supId
		FOREIGN KEY (supplier_order_id)
		REFERENCES SupplierOrder (supplier_order_id)
    ON DELETE CASCADE,
	CONSTRAINT FK_SupOrdDet_prodId
		FOREIGN KEY (product_id)
    REFERENCES Product (product_id)
    ON DELETE CASCADE
);

DELIMITER $$

/*
PROCEDURE: create_supOrdDet
DESCRIPTION: Creates a new supplier order detail.
*/
CREATE PROCEDURE create_supOrdDet(IN pSupplierOrderId INT, IN pProductId INT, IN pQuantity INT)
BEGIN
	INSERT INTO SupplierOrdDet (supplier_order_id, product_id, quantity)
  VALUES (pSupplierOrderId, pProductId, pQuantity);
  -- Do the changes on Business Stock.
  SET @prod_qty := get_product_quantity(pProductId);
  SET @prod_status := get_product_status(pProductId);
  IF (@prod_status = 'NO') THEN
		SIGNAL SQLSTATE '23002'
    SET MESSAGE_TEXT = 'Product not available', MYSQL_ERRNO = 1002;
  ELSEIF (@prod_qty is NULL) THEN
		-- The product is not registered on the business stock, then created it.
    CALL reg_prod_bussStock(pProductId, pQuantity);
	ELSE
		-- Product already on stock, just need refill.
    CALL fill_product_bussStock(pProductId, pQuantity);
  END IF;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: Client
DESCRIPTION: Table for all the clients of the company.
*/
CREATE TABLE Client (
	client_id INT NOT NULL AUTO_INCREMENT,
  geo_address_id INT,
  zone_id INT,
  dev_interval_id INT NOT NULL,
  business_type_id INT,
	business_name VARCHAR(255) NOT NULL,
	business_representative VARCHAR(255) NOT NULL,
	phone_number VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
  formal_address VARCHAR(255) NOT NULL,
	CONSTRAINT PK_Client 
		PRIMARY KEY (client_id),
	CONSTRAINT FK_Client_DevIntervId
		FOREIGN KEY (dev_interval_id)
		REFERENCES DeliveryInterval (dev_interval_id)
    ON DELETE RESTRICT,
	CONSTRAINT FK_Client_GeoAddrId
		FOREIGN KEY (geo_address_id)
    REFERENCES GeologicalAddress (geo_address_id)
    ON DELETE SET NULL,
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
		UNIQUE (business_name)
); 

DELIMITER $$

/*
PROCEDURE: upd_client
DESCRIPTION: Update the information of an existing client.
*/
CREATE PROCEDURE upd_client(IN pClientId INT, IN pBussTypeId INT,
													IN pBussName VARCHAR(255), IN pBussRep VARCHAR(255),
                          IN pPhoneNumber VARCHAR(255), IN pEmail VARCHAR(255),
                          IN pFormalAddress VARCHAR(255))
BEGIN
	UPDATE Client
  SET business_type_id = pBussTypeId, business_name = pBussName, business_representative = pBussRep,
			phone_number = pPhoneNumber, email = pEmail, formal_address = pFormalAddress
	WHERE client_id = pClientId;
END $$

/*
PROCEDURE: create_client
DESCRIPTION: Register a new client on the table.
*/
CREATE PROCEDURE create_client(IN pZoneId INT, IN pDevIntervalId INT, IN pBussTypeId INT,
															 IN pBussName VARCHAR(255), IN pBussRep VARCHAR(255),
															 IN pPhoneNumber VARCHAR(255), IN pEmail VARCHAR(255),
                               IN pFormalAddress VARCHAR(255), IN pLatitude FLOAT, IN pLongitude FLOAT)
BEGIN
	SET @vQtyEmail = -1;
  SET @vQtyPhone = -1;
  SET @vQtyBussName = -1;
  SET @vTotalClients = (SELECT COUNT(*) FROM Client);  
  CALL isValueInTable('Client', 'email', CONCAT('"', pEmail, '"'), @vQtyEmail);
  CALL isValueInTable('Client', 'phone_number', CONCAT('"', pPhoneNumber, '"'), @vQtyPhone);
  CALL isValueInTable('Client', 'business_name', CONCAT('"', pBussName, '"'), @vQtyBussName);
  IF ((@vQtyEmail > 0 AND @vQtyPhone > 0 AND @vQtyBussName > 0) OR @vTotalClients = 0) THEN
		SET @vGeoAddrId = create_geo_addr(pLatitude, pLongitude);
		INSERT INTO Client (geo_address_id, zone_id, dev_interval_id, business_type_id, business_name,
												business_representative, phone_number, email, formal_address)
		VALUES (@vGeoAddrId, pZoneId, pDevIntervalId, pBussTypeId, pBussName, pBussRep,
						pPhoneNumber, pEmail, pFormalAddress);
		SET @ID = LAST_INSERT_ID();
		SELECT * FROM Client WHERE client_id = @ID;
	ELSE
		SELECT 'Duplicated values' AS 'Error';
	END IF;
END $$

/*
PROCEDURE: getp_clients
DESCRIPTION: Get all the clients with pagination parameters.
*/
CREATE PROCEDURE getp_clients(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT c.client_id, c.business_name, c.business_representative, ',
												 'c.phone_number, c.email, c.formal_address, ',
                         'bt.business_type_id, bt.business_type_name, ',
                         'di.dev_interval_id, di.dev_interval_name, ',
                         'z.zone_id, z.zone_name, c.formal_address, ga.latitude, ga.longitude ',
                         'FROM Client c ',
                         'INNER JOIN Zone z ON c.zone_id = z.zone_id ',
                         'INNER JOIN DeliveryInterval di ON c.dev_interval_id = di.dev_interval_id ',
                         'INNER JOIN BusinessType bt ON c.business_type_id = bt.business_type_id ',
                         'INNER JOIN GeologicalAddress ga ON c.geo_address_id = ga.geo_address_id ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE isValueInTable
DESCRIPTION: Ask if a value is in a specific table.
*/
CREATE PROCEDURE isValueInTable(IN pTable VARCHAR(255), IN pColumn VARCHAR(255), IN pValue VARCHAR(255),
																OUT result INT)
BEGIN
	DECLARE strQuery VARCHAR(300);
  SET @RES = -1;
  SET @strQuery = CONCAT('SELECT COUNT(*) INTO @RES FROM ', pTable,
												 ' WHERE ', pValue, ' NOT IN (', 
												 'SELECT ', pColumn, ' FROM ', pTable, ');');
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
  SET result = @RES;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE: ClientXDevDay
Description: Allow to asociate clients with their respectives delivery days.
*/
CREATE TABLE ClientXDevDay (
	client_id INT NOT NULL,
  dev_day_id INT NOT NULL,
  CONSTRAINT PK_ClntXDevDayId
		PRIMARY KEY (client_id, dev_day_id),
	CONSTRAINT FK_client_id
		FOREIGN KEY (client_id)
		REFERENCES Client (client_id)
    ON DELETE CASCADE,
	CONSTRAINT FK_devday_id
		FOREIGN KEY (dev_day_id)
    REFERENCES DeliveryDay (dev_day_id)
    ON DELETE CASCADE
);

DELIMITER $$

/*
PROCEDURE: create_clientxdevday
DESCRIPTION: Create a new asociation of a client and a delivery day.
*/
CREATE PROCEDURE create_clientxdevday(IN pClientId INT, IN pDevDayId INT)
BEGIN
	SET @vDevIntervalName = (SELECT dev_interval_name FROM DeliveryInterval
													 LEFT JOIN Client ON client_id = pClientId
													 WHERE Client.dev_interval_id = DeliveryInterval.dev_interval_id);
	SET @vQtyDaysRegistered = (SELECT COUNT(*) FROM ClientXDevDay WHERE client_id = pClientId);
  CASE
		WHEN ((@vDevIntervalName = 'TWO_PER_WEEK' AND @vQtyDaysRegistered < 2) OR
				 ((@vDevIntervalName = 'BIWEEKLY' OR @vDevIntervalName = 'WEEKLY') AND @vQtyDaysRegistered < 1))
			THEN
				INSERT INTO ClientXDevDay (client_id, dev_day_id)
				VALUES (pClientId, pDevDayId);
				SELECT Client.business_name, cxdd.client_id, DeliveryDay.dev_day_name, cxdd.dev_day_id FROM ClientXDevDay cxdd
				RIGHT JOIN Client ON cxdd.client_id = Client.client_id
				LEFT JOIN DeliveryDay ON cxdd.dev_day_id = DeliveryDay.dev_day_id
				WHERE ( ((Client.client_id, DeliveryDay.dev_day_id) = (pClientId, pDevDayId)) AND Client.business_name != '' AND DeliveryDay.dev_day_name != '');
		ELSE SELECT 'Limit of days passed' AS 'Error';
	END CASE;
END $$

/*
PROCEDURE: rem_clientxdevday
DESCRIPTION Remove an asociation of a client and a delivery day.
*/
CREATE PROCEDURE rem_clientxdevday(IN pClientId INT, IN pDevDayId INT)
BEGIN
	DELETE FROM ClientXDevDay
  WHERE (client_id, dev_day_id) = (pClientId, pDevDayId);
END $$

/*
PROCEDURE: get_client_devdays
DESCRIPTION: Return all the delivery days of a client.
*/
CREATE PROCEDURE get_client_devdays(IN pClientId INT)
BEGIN
	SELECT devd.dev_day_name FROM Client
	INNER JOIN ClientXDevDay cxdv ON cxdv.client_id = pClientId
	INNER JOIN DeliveryDay devd ON devd.dev_day_id = cxdv.dev_day_id
	WHERE Client.client_id = pClientId;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
Table: ClientOrder
DESCRIPTION: Would keep all the orders of the clients.
*/
CREATE TABLE ClientOrder (
	client_order_id INT NOT NULL AUTO_INCREMENT,
  client_id INT NOT NULL,
  order_status VARCHAR(255) NOT NULL,
  order_date DATE DEFAULT (CURRENT_DATE),
  order_delivery_date DATE DEFAULT NULL,
  CONSTRAINT PK_CltOrder
		PRIMARY KEY (client_order_id),
	CONSTRAINT FK_CltOrder_ClientId
		FOREIGN KEY (client_id)
    REFERENCES Client (client_id)
    ON DELETE RESTRICT
);

DELIMITER $$

/*
FUNCTION: getstr_ClnDevDays
DESCRIPTION: Get in a string all the delivery days of a specific client.
*/
CREATE FUNCTION getstr_ClnDevDays(pClientId INT)
	RETURNS VARCHAR(255) DETERMINISTIC
BEGIN
set @v := (SELECT GROUP_CONCAT(dev_day_name) AS "days" FROM CLIENT
		INNER JOIN ClientXDevDay cxdv ON cxdv.client_id = pClientId
		INNER JOIN DeliveryDay devd ON devd.dev_day_id = cxdv.dev_day_id
		WHERE Client.client_id = pClientId);
RETURN @v;
END $$

/*
PROCEDURE: create_clientOrder
DESCRIPTION: Creates a new order for a specific client.
*/
CREATE PROCEDURE create_clientOrder(IN pClientId INT, IN pStatus VARCHAR(255))
BEGIN
	SET @vDays = getstr_ClnDevDays(pClientId);
  IF (@vDays IS NULL) THEN SELECT 'No registered days' AS ERROR; END IF;
  SET @vDevInterval = (SELECT devint.dev_interval_name FROM DeliveryInterval devint 
											 LEFT JOIN Client ON Client.dev_interval_id = devint.dev_interval_id
											 WHERE client_id = pClientId);
	SET @vTotalDeliv = (SELECT COUNT(*) FROM ClientOrder WHERE client_id = pClientId);
	IF (@vDevInterval = 'TWO_PER_WEEK') THEN
		SET @vDayOne = SUBSTRING_INDEX(@vDays, ",", 1);
    SET @vDayTwo = SUBSTRING_INDEX(@vDays, ",", -1);
    -- Just one day (of two posibilities) selected as a delivery days.
    IF (@vDayOne = @vDayTwo) THEN
			-- No previous deliveries. New client, maybe.
      IF (@vTotalDeliv = 0) THEN
				SET @vSelecDate = getNextDateOf(@vDayOne);
        INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
        VALUES (pClientId, pStatus, @vSelecDate);
        SET @ID = LAST_INSERT_ID();
        SELECT @ID; --  We return the id for asociated the order details.
			-- Previous deliveries were founded. We need to follow the last delivery date.
			ELSE
				-- Selecting the last date registered for a delivery.
				SET @vSelecDate = (SELECT order_delivery_date FROM ClientOrder
													 WHERE ClientOrder.client_id = pClientId
                           ORDER BY order_delivery_date DESC LIMIT 1);
				-- If the last delivery is in a future date. (Pending to arrive)
				IF ((CURRENT_DATE < @vSelecDate) = 1) THEN
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
				-- If is the last delivery is today (not aplicable, asuming the truck content is not 'reorganizable'
				ELSEIF ((CURRENT_DATE = @vSelecDate) = 1) THEN
					-- If this happens, we need to move to the next week.
          SET @vSelecDate = CURRENT_DATE + 7;
          INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
				-- If the last delivery is in the past. We just take the next dev_day.
				ELSE
					SET @vSelecDate = getNextDateOf(@vDayOne);
          INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
        END IF;
      END IF;
		-- Two days to consider per week.
		ELSE
			-- No previous deliveries. New client, maybe.
      IF (@vTotalDeliv = 0) THEN
				SET @vSelecDate = getCloserDay(@vDayOne, @vDayTwo);
        INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
        VALUES (pClientId, pStatus, @vSelecDate);
        SET @ID = LAST_INSERT_ID();
        SELECT @ID; --  We return the id for asociated the order details.
			-- Previous deliveries were found. Need to follow the last delivery date.
      ELSE
				-- Selecting the last date registered for a delivery.
				SET @vSelecDate = (SELECT order_delivery_date FROM ClientOrder
													 WHERE ClientOrder.client_id = pClientId
                           ORDER BY order_delivery_date DESC LIMIT 1);
				-- Selecting the last date registered for a delivery.
				SET @vSelecDate = (SELECT order_delivery_date FROM ClientOrder
													 WHERE ClientOrder.client_id = pClientId
                           ORDER BY order_delivery_date DESC LIMIT 1);
				-- If the last delivery is in a future date. (Pending to arrive)
				IF ((CURRENT_DATE < @vSelecDate) = 1) THEN
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
				-- If the last delivery was on the past or is the current day we just
        -- select the next delivery day.
				ELSE
					-- If this happens, we need to move to the next dev day.
          SET @vSelecDate = getCloserDay(@vDayOne, @vDayTwo);
          INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
				END IF;
      END IF;
    END IF; -- TWO_PER_WEEK, 1 DAY OR 2 DAYS.
	ELSEIF (@vDevInterval = 'WEEKLY') THEN
		SET @vDay = SUBSTRING_INDEX(@vDays, ",", 1);
    SELECT @vDay;
		-- No previous deliverys, select next day.
    SET @vSelecDay = getNextDateOf(@vDay);
    SELECT @vSelecDay;
    INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
		VALUES (pClientId, pStatus, @vSelecDay);
		SET @ID = LAST_INSERT_ID();
		SELECT @ID; --  We return the id for asociate the order details.
	ELSEIF (@vDevInterval = 'DAILY') THEN
		SET @vSelecDay = CURRENT_DATE + 1;
    INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
		VALUES (pClientId, pStatus, @vSelecDay);
		SET @ID = LAST_INSERT_ID();
    SELECT @ID; --  We return the id for asociate the order details.
	ELSEIF (@vDevInterval = 'BIWEEKLY') THEN
		SET @vDay = SUBSTRING_INDEX(@vDays, ",", 1);
		-- If there are no previous deliveries, select the next day.
		IF (@vTotalDeliv = 0) THEN
				SET @vSelecDate = getNextDateOf(@vDay);
        INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
        VALUES (pClientId, pStatus, @vSelecDate);
        SET @ID = LAST_INSERT_ID();
        SELECT @ID; --  We return the id for asociated the order details.
		-- Previous deliveries were founded. We need to follow the last delivery date.
    ELSE
			-- Selecting the last date registered for a delivery.
			SET @vSelecDate = (SELECT order_delivery_date FROM ClientOrder
												 WHERE ClientOrder.client_id = pClientId
												 ORDER BY order_delivery_date DESC LIMIT 1);
			-- If the last delivery is in a future date. (Pending to arrive)
      IF ((CURRENT_DATE < @vSelecDate) = 1) THEN
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
			-- If is the last delivery is today (not aplicable, asuming the truck content is not 'reorganizable'
			ELSEIF ((CURRENT_DATE = @vSelecDate) = 1) THEN
				-- If this happens, we need to move to the next two weeks.
				SET @vSelecDate = CURRENT_DATE + 14;
				INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
				VALUES (pClientId, pStatus, @vSelecDate);
				SET @ID = LAST_INSERT_ID();
				SELECT @ID; --  We return the id for asociate the order details.
			-- If the last delivery is in the past. We need to check the last date.
      ELSE
				-- If the last delivery was 14 days ago, sadly, the order would be send
        -- in the next order.
				IF ( (DATEDIFF(CURRENT_DATE, @vSelecDate) = 14) = 1 ) THEN
					SET @vSelecDate = CURRENT_DATE + 14;
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociate the order details.
				-- If was a long time ago that the Client request some product, just
        -- send it the next day of the delivery for that Client.
				ELSEIF ( (DATEDIFF(CURRENT_DATE, @vSelecDate) > 7 ) = 1 ) THEN
					SET @vSelecDate = getNextDateOf(@vDayOne);
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociated the order details.
				-- If the last delivery was exactly one week ago, that saids that the next delivery
        -- is on the next week.
				ELSEIF ( (DATEDIFF(CURRENT_DATE, @vSelecDate) = 7 ) = 1) THEN
					SET @vSelecDate = CURRENT_DATE + 7;
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociated the order details.
				-- If the last delivery was less than a week ago, we just use that value and
        -- select the date two weeks further
				ELSEIF ( (DATEDIFF(CURRENT_DATE, @vSelecDate) < 7 ) = 1) THEN
					SET @vSelecDate = (STR_TO_DATE(@vSelecDate, '%Y-%m-%d') + 14);
					INSERT INTO ClientOrder(client_id, order_status, order_delivery_date)
					VALUES (pClientId, pStatus, @vSelecDate);
					SET @ID = LAST_INSERT_ID();
					SELECT @ID; --  We return the id for asociated the order details.
        END IF;
			END IF;
    END IF;
  END IF;
END $$

/*
FUNCTION: getCloserDay
DESCRIPTION: This function would take two days (I.e. Tuesday and Sunday) and 
it will select the date of the day that is closest to the current date.
*/
CREATE FUNCTION getCloserDay(pDayNameA VARCHAR(20), pDayNameB VARCHAR(20))
	RETURNS DATE DETERMINISTIC
BEGIN
	DECLARE pDateA DATE;
  DECLARE pDateB DATE;
  SET pDateA = getNextDateOf(pDayNameA);
  SET pDateB = getNextDateOf(pDayNameB);
  IF (DATEDIFF(pDateA, CURRENT_DATE) < DATEDIFF(pDateB, CURRENT_DATE)) THEN
		RETURN pDateA;
	ELSE RETURN pDateB;
  END IF;
END $$

/*
FUNCTION: getNextDateOf
DESCRIPTION: It will select the closest date of the day that is passed by 
parameter without counting the current day.
*/
CREATE FUNCTION getNextDateOf(pDayName VARCHAR(20))
	RETURNS DATE DETERMINISTIC
BEGIN
	DECLARE curr_date DATE;
	SET curr_date = CURRENT_DATE + 1;
		WHILE (DAYNAME(curr_date) != pDayName) DO
			SET curr_date = (curr_date + 1);
		END WHILE;
		RETURN curr_date;
END $$

/*
PROCEDURE: getp_clientOrders
DESCRIPTION: Would return all the clients orders with pagination parameters.
*/
CREATE PROCEDURE getp_clientOrders(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM ClientOrder ',
												 'ORDER BY ', pParameter,' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$
 
/*
PROCEDURE: upd_clientOrder
DESCRIPTION: Update an existing client order.
*/
CREATE PROCEDURE upd_clientOrder(IN pClientOrderId INT, IN pStatus VARCHAR(255))
BEGIN
	UPDATE ClientOrder
  SET order_status = pStatus
  WHERE client_order_id = pClientOrderId;
END $$

/*
FUNCTION get_ordStatus
DESCRIPTION: Returns the status of a client order.
*/
CREATE FUNCTION get_ordStatus(pClientOrderId INT)
	RETURNS VARCHAR(255) DETERMINISTIC
BEGIN
	SET @stat := (SELECT order_status FROM ClientOrder WHERE client_order_id = pClientOrderId);
  RETURN @stat;
END $$

DELIMITER ;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
TABLE ClientOrderDetail
DESCRIPTION: Keep all the order details.
*/
CREATE TABLE ClientOrderDetail (
	client_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT PK_ClientOrdDet
		PRIMARY KEY (client_order_id, product_id),
	CONSTRAINT FK_ClientOrdDet_ordId
		FOREIGN KEY (client_order_id)
    REFERENCES ClientOrder (client_order_id)
    ON DELETE CASCADE,
	CONSTRAINT FK_ClientOrdDet_prodId
		FOREIGN KEY (product_id)
    REFERENCES Product (product_id)
    ON DELETE CASCADE
);

DELIMITER $$

/*
PROCEDURE getp_cltOrdDet
DESCRIPTION: Returns all the client order details with pagination.
*/
CREATE PROCEDURE getp_cltOrdDet(IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT * FROM ClientOrderDetail ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
PROCEDURE getp_cltOrdDetOf
DESCRIPTION: Give all the details of the order of a client with pagination.
*/
CREATE PROCEDURE getp_cltOrdDetOf(IN pClientOrderId INT, IN pParameter VARCHAR(255), IN pOrder VARCHAR(255), IN pStart INT, IN pElemPerPage INT)
BEGIN
	DECLARE strQuery VARCHAR(255);
  SET @strQuery = CONCAT('SELECT cod.product_id, p.product_name, cod.quantity ',
												 'FROM ClientOrderDetail cod ',
                         'LEFT JOIN Product p ON p.product_id = cod.product_id ',
												 'WHERE client_order_id = ', pClientOrderId, ' ',
												 'ORDER BY ', pParameter, ' ', pOrder, ' ', 
												 'LIMIT ', pStart, ', ', pElemPerPage);
	PREPARE myQuery FROM @strQuery;
  EXECUTE myQuery;
END $$

/*
FUNCTION get_prod_readiness
DESCRIPTION: Returns the readiness of a product in a string.
*/
CREATE FUNCTION get_prod_readiness(pProductId INT, pQuantity INT)
	RETURNS VARCHAR(50) DETERMINISTIC
BEGIN
	SET @actual_quantity := get_product_quantity(pProductId);
  IF (@actual_quantity is NULL OR (@actual_quantity - pQuantity < 0)) THEN
		RETURN 'Not Ready';
	ELSE
		RETURN 'Ready';
  END IF;
END $$

/*
PROCEDURE: create_cltOrdDet
DESCRIPTION: Create a new order detail of a client.
*/
CREATE PROCEDURE create_cltOrdDet (IN pClientOrderId INT, IN pProductId INT, IN pQuantity INT)
BEGIN
	SET @readiness = get_prod_readiness(pProductId, pQuantity);
  IF (@readiness = 'Not Ready') THEN
    INSERT INTO ClientOrderDetail (client_order_id, product_id, quantity)
    VALUES (pClientOrderId, pProductId, pQuantity);
    CALL upd_clientOrder(pClientOrderId, 'pendiente');
	ELSE
		INSERT INTO ClientOrderDetail (client_order_id, product_id, quantity)
    VALUES (pClientOrderId, pProductId, pQuantity);
  END IF;
END $$

/*
FUNCTION dispatchOrder
DESCRIPTION: This would remove all the items from the businessStock of a 'ready/en despacho' order.
*/
CREATE PROCEDURE dispatchOrder(IN pClientOrderId INT)
BEGIN
	DECLARE var_product_id INTEGER;
  DECLARE var_quantity INTEGER; 
  DECLARE var_final INTEGER DEFAULT 0;
  DECLARE cursor1 CURSOR FOR SELECT product_id, quantity FROM ClientOrderDetail WHERE client_order_id = pClientOrderId;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET var_final = 1;
	SET @ordStatus = get_ordStatus(pClientOrderId);
  IF (@ordStatus = 'en despacho') THEN
		OPEN cursor1;
    bucle: LOOP
			FETCH cursor1 INTO var_product_id, var_quantity;
      IF var_final = 1 THEN
				LEAVE bucle;
			END IF;
      CALL unreg_product_bussStock(var_product_id, var_quantity);
		END LOOP bucle;
    CLOSE cursor1;
	ELSE
		SIGNAL SQLSTATE '23000'
    SET MESSAGE_TEXT = 'Order isnot ready for dispatch', MYSQL_ERRNO = 1000;
  END IF;
END $$

DELIMITER ;

-- Charset for all tables.
SELECT CONCAT('ALTER TABLE ', TABLE_NAME, ' CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;')
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'correcaminosdb' AND TABLE_TYPE != 'VIEW';

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DATA INSERTION

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CALL create_vehicle('Nissan', 'ABC-123', 'Diesel', 50, 40, 300);
CALL create_vehicle('Toyota', 'XYZ-456', 'Premium', 30, 20, 150);
CALL create_vehicle('Tesla', 'MMM-111', 'Normal', 100, 96, 0);

UPDATE Vehicle
SET last_tank_refill = '2022-03-03' WHERE vehicle_id = 3;

CALL create_maint_log(1, 'Frenos averiados');
CALL create_maint_log(1, 'Cambio de aceite');
CALL create_maint_log(1, 'Cambio de luces traseras');
CALL create_maint_log(2, 'Cambio de transmision');

CALL create_job_title('Promotor');
CALL create_job_title('Repartidor');

CALL create_driver(1, 1, 'Johnny Arias', '788991010', 2000);
CALL create_driver(2, 2, 'Marcos Rivera', '712345050', 3000);
CALL create_driver(3, 2, 'Ronny Diaz', '790901234', 3500);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CALL create_dev_day('Monday');
CALL create_dev_day('Tuesday');
CALL create_dev_day('Wednesday');
CALL create_dev_day('Thursday');
CALL create_dev_day('Friday');
CALL create_dev_day('Saturday');
CALL create_dev_day('Sunday');

CALL create_dev_interval('DAILY');
CALL create_dev_interval('WEEKLY');
CALL create_dev_interval('TWO_PER_WEEK');
CALL create_dev_interval('BIWEEKLY');

CALL create_buss_type('Chino');
CALL create_buss_type('Supermercado');
CALL create_buss_type('Gasolinera');
CALL create_buss_type('Automercado');
CALL create_buss_type('Restaurante');

CALL create_zone('Norte');
CALL create_zone('Central');
CALL create_zone('Sur');

CALL create_route('Ruta_A', 13.5);
CALL create_route('Ruta_B', 2.2);
CALL create_route('Ruta_C', 10.4);
CALL create_route('Ruta_D', 15.9);
CALL create_route('Ruta_E', 6.5);
CALL create_route('Ruta_F', 7.8);
CALL create_route('Ruta_G', 0.7);
CALL create_route('Ruta_H', 1.5);
CALL create_route('Ruta_I', 4.8);

CALL create_zonexroute(1, 1);
CALL create_zonexroute(1, 2);
CALL create_zonexroute(1, 3);
CALL create_zonexroute(2, 4);
CALL create_zonexroute(2, 5);
CALL create_zonexroute(2, 6);
CALL create_zonexroute(3, 7);
CALL create_zonexroute(3, 8);
CALL create_zonexroute(3, 9);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Initial info for Supplier, ProductCategory and ProductSubCategory
CALL create_supplier('Dos Pinos', 'Avenida central contiguo al estadio', '27030606', 'dospinos@cr.com', 'YES');
CALL create_supplier('Coca Cola FEMSA', 'Frente al teatro Nacional de San José', '27806924', 'cocacola@cr.com', 'YES');
CALL create_supplier('Pepsico', 'A la par de mogambos', '27455501', 'pepsico@cr.com', 'NO');

CALL create_prodCat('Granos básicos'); -- 1
CALL create_prodSubCat('Arroz', 1);
CALL create_prodSubCat('Frijoles', 1);
CALL create_prodSubCat('Trigo', 1);
CALL create_prodCat('Lacteos'); -- 2
CALL create_prodSubCat('Leche', 2);
CALL create_prodSubCat('Yogurt', 2);
CALL create_prodCat('Refresco'); -- 3
CALL create_prodSubCat('Gaseosa', 3);
CALL create_prodSubCat('Cerveza', 3);
CALL create_prodSubCat('Jugo', 3);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Init values for BusinessStock and Product
CALL create_product('Leche Entera 1L', 1, 4, 'NO');
CALL create_product('Leche Deslactosada 1L', 1, 4, 'YES');
CALL create_product('Yogurt Arandano 250ml', 1, 5, 'YES');
CALL create_product('Yogurt Fresa 250ml', 1, 5, 'YES');
CALL create_product('Pilsen TR 250ml', 1, 7, 'YES');
CALL create_product('Heineken LT 333ml', 1, 7, 'YES');
CALL create_product('Imperial', 1, 7, 'NO');
CALL create_product('Coca Cola 355ml', 2, 6, 'YES');
CALL create_product('Fresca 600ml', 2, 6, 'YES');
CALL create_product('Arroz Integral 1kg', 3, 1, 'NO');
CALL create_product('Arroz Precocido 1kg', 3, 1, 'YES');
CALL create_product('Frijoles Rojos 800g', 3, 2, 'YES');
CALL create_product('Frijoles Negros 500g', 3, 2, 'YES');
CALL create_product('Harina Integral 300g', 3, 3, 'YES');
CALL create_product('Harina Reposteria 300g', 3, 3, 'YES');

CALL reg_prod_bussStock(1, 10000);
CALL reg_prod_bussStock(2, 500);
CALL reg_prod_bussStock(3, 8000);
CALL reg_prod_bussStock(4, 450);
CALL reg_prod_bussStock(5, 550); 
CALL reg_prod_bussStock(6, 900); 
CALL reg_prod_bussStock(7, 1200); 
CALL reg_prod_bussStock(8, 1650); 
CALL reg_prod_bussStock(9, 2000); 
CALL reg_prod_bussStock(10, 900); 
CALL reg_prod_bussStock(11, 1750); 
CALL reg_prod_bussStock(12, 2800); 
CALL reg_prod_bussStock(13, 5000); 
CALL reg_prod_bussStock(14, 15000); 
CALL reg_prod_bussStock(15, 200); 

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Zones: Norte, Central, Sur
-- DI: DAILY, WEEKLY, TWO_PER_WEEK, BIWEEKLY
-- BT: Chino, Supermercado, Gasolinera, Automercado, Restaurante.
CALL create_client(1, 2, 3, 'Gasolinera A', 'Joaquin Mesa', '85856969', 'joq@mail.com',
									 'Frente a masxmenos Av 15', 20.6, 67.5);
CALL create_client(1, 4, 1, 'Chino A', 'Oscar Arias', '83830294', 'oscarin@mail.com',
									 'Diagonal a la corte', -50.4, 11.56);
CALL create_client(2, 4, 5, 'Restaurante A', 'Dolores Brenes', '82828282', 'dolor@mail.com',
									 'A la par del estadio nacional', 56.24, 5.3);
CALL create_client(2, 1, 5, 'Restaurante B', 'Adriana Rodriguez', '89707070', 'adri@mail.com',
									 'Continuo a la musmanni', 86.65, 24.7);
CALL create_client(3, 2, 4, 'Automercado A', 'Martin Caceres', '82009881', 'martin@mail.com',
									 'Frente al teatrio de bellas artes', -11.64, 10.46);
CALL create_client(3, 3, 2, 'Supermercado A', 'Alan Mena', '82129456', 'alan@mail.com',
									 'Diagonal a mogambos', 44.56, -27.2); 

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CALL create_clientxdevday(1, 3); -- Delivery on Wednesdays.
CALL create_clientxdevday(2, 1); -- Delivery on Mondays.
CALL create_clientxdevday(3, 6); -- Delivery on Saturdays.
CALL create_clientxdevday(5, 5); -- Delivery on Fridays.
CALL create_clientxdevday(6, 3); -- Delivery on Wednesdays.
CALL create_clientxdevday(6, 7); -- and Sundays.

