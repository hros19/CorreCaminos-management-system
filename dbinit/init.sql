-- ===============================================
-- Authors: Benjamin Johnson, Hansol Antay
-- Create date: 3/31/2022
-- Name of the database: correcaminosdb
-- ===============================================

--
-- Base de datos: `correcaminosdb`
--
DROP DATABASE IF EXISTS `correcaminosdb`;
CREATE DATABASE IF NOT EXISTS `correcaminosdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `correcaminosdb`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `BusinessStock`
--

CREATE TABLE `BusinessStock` (
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Client`
--

CREATE TABLE `Client` (
  `client_id` int(11) NOT NULL,
  `business_name` varchar(60) NOT NULL,
  `business_type` varchar(50) NOT NULL,
  `business_representative` varchar(60) NOT NULL,
  `phone_number` int(11) NOT NULL,
  `email` varchar(60) NOT NULL,
  `zone` varchar(100) NOT NULL,
  `formal_address` varchar(100) NOT NULL,
  `geological_address` point NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Driver`
--

CREATE TABLE `Driver` (
  `driver_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_name` varchar(50) NOT NULL,
  `driver_doc_id` int(11) NOT NULL,
  `salary` int(11) NOT NULL,
  `hiring_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `MaintenanceLog`
--

CREATE TABLE `MaintenanceLog` (
  `maintenance_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `maintenance_type` varchar(50) NOT NULL,
  `maintenenace_day` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OrderC`
--

CREATE TABLE `OrderC` (
  `order_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OrderDetail`
--

CREATE TABLE `OrderDetail` (
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Product`
--

CREATE TABLE `Product` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `price` float NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `subcategory_name` varchar(50) NOT NULL,
  `is_available` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Supplier`
--

CREATE TABLE `Supplier` (
  `supplier_id` int(11) NOT NULL,
  `supplier_name` int(60) NOT NULL,
  `formal_address` varchar(100) NOT NULL,
  `phone_number` int(11) NOT NULL,
  `email` varchar(60) NOT NULL,
  `have_delivery` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `SupplierOrder`
--

CREATE TABLE `SupplierOrder` (
  `supplier_order_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `SupplierOrderDetail`
--

CREATE TABLE `SupplierOrderDetail` (
  `supplier_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `SupplierStock`
--

CREATE TABLE `SupplierStock` (
  `supplier_stock_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Vehicle`
--

CREATE TABLE `Vehicle` (
  `vehicle_id` int(11) NOT NULL,
  `car_brand` varchar(50) NOT NULL,
  `car_plaque` int(11) NOT NULL,
  `type_of_gas` varchar(50) NOT NULL,
  `purchase_date` date NOT NULL,
  `tank_capacity` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `BusinessStock`
--
ALTER TABLE `BusinessStock`
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `Client`
--
ALTER TABLE `Client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indices de la tabla `Driver`
--
ALTER TABLE `Driver`
  ADD PRIMARY KEY (`driver_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indices de la tabla `MaintenanceLog`
--
ALTER TABLE `MaintenanceLog`
  ADD PRIMARY KEY (`maintenance_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indices de la tabla `OrderC`
--
ALTER TABLE `OrderC`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indices de la tabla `OrderDetail`
--
ALTER TABLE `OrderDetail`
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indices de la tabla `Supplier`
--
ALTER TABLE `Supplier`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indices de la tabla `SupplierOrder`
--
ALTER TABLE `SupplierOrder`
  ADD PRIMARY KEY (`supplier_order_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indices de la tabla `SupplierOrderDetail`
--
ALTER TABLE `SupplierOrderDetail`
  ADD KEY `supplier_order_id` (`supplier_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `SupplierStock`
--
ALTER TABLE `SupplierStock`
  ADD PRIMARY KEY (`supplier_stock_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `Vehicle`
--
ALTER TABLE `Vehicle`
  ADD PRIMARY KEY (`vehicle_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Client`
--
ALTER TABLE `Client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `MaintenanceLog`
--
ALTER TABLE `MaintenanceLog`
  MODIFY `maintenance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OrderC`
--
ALTER TABLE `OrderC`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Product`
--
ALTER TABLE `Product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Supplier`
--
ALTER TABLE `Supplier`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `SupplierOrder`
--
ALTER TABLE `SupplierOrder`
  MODIFY `supplier_order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `SupplierStock`
--
ALTER TABLE `SupplierStock`
  MODIFY `supplier_stock_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Vehicle`
--
ALTER TABLE `Vehicle`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `BusinessStock`
--
ALTER TABLE `BusinessStock`
  ADD CONSTRAINT `BusinessStock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `Product` (`product_id`);

--
-- Filtros para la tabla `Driver`
--
ALTER TABLE `Driver`
  ADD CONSTRAINT `Driver_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `Vehicle` (`vehicle_id`);

--
-- Filtros para la tabla `MaintenanceLog`
--
ALTER TABLE `MaintenanceLog`
  ADD CONSTRAINT `MaintenanceLog_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `Vehicle` (`vehicle_id`);

--
-- Filtros para la tabla `OrderC`
--
ALTER TABLE `OrderC`
  ADD CONSTRAINT `OrderC_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`client_id`);

--
-- Filtros para la tabla `OrderDetail`
--
ALTER TABLE `OrderDetail`
  ADD CONSTRAINT `OrderDetail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `OrderC` (`order_id`),
  ADD CONSTRAINT `OrderDetail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Product` (`product_id`);

--
-- Filtros para la tabla `SupplierOrder`
--
ALTER TABLE `SupplierOrder`
  ADD CONSTRAINT `SupplierOrder_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `Supplier` (`supplier_id`);

--
-- Filtros para la tabla `SupplierOrderDetail`
--
ALTER TABLE `SupplierOrderDetail`
  ADD CONSTRAINT `SupplierOrderDetail_ibfk_1` FOREIGN KEY (`supplier_order_id`) REFERENCES `SupplierOrder` (`supplier_order_id`),
  ADD CONSTRAINT `SupplierOrderDetail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Product` (`product_id`);

--
-- Filtros para la tabla `SupplierStock`
--
ALTER TABLE `SupplierStock`
  ADD CONSTRAINT `SupplierStock_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `Supplier` (`supplier_id`),
  ADD CONSTRAINT `SupplierStock_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Product` (`product_id`);
COMMIT;
