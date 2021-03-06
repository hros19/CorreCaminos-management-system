
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

# CorreCaminos Rest API 馃摝
Primer proyecto de Bases de Datos II que involucra la creaci贸n de un Rest API utilizando como tecnolog铆as principales Docker, MySQL y NodeJS. Por el momento no est谩 implementada una interfaz gr谩fica.

Estudiante: Hansol Antay Rostr谩n

## Contenidos
- [Deployment](#deployment)
- [Descripci贸n del problema](#descripci贸n-del-problema)
- [Utilizar la aplicaci贸n](#utilizar-la-aplicaci贸n)
  - [Mocha](#mocha)
  - [Manual - http](#manual-http)
  - [Reiniciar base de datos](#reiniciar-base-de-datos)
- [Endpoints](#endpoints)
  - [Stock del negocio](#stock-del-negocio)
  - [Tipos de negocio](#tipos-de-negocio)
  - [Clientes](#clientes)
  - [Delivery](#delivery)
  - [Conductores](#conductores)
  - [Tipos de conductores](#tipos-de-conductores)
  - [Productos](#productos)
  - [Categor铆as de productos](#categor铆as-de-productos)
  - [Reporte diario](#reporte-diario)
  - [Proveedores](#proveedores)
  - [Vehiculos](#vehiculos)
  - [Zonas](#zonas)
- [Objetivos](#objetivos)
- [Conclusiones](#conclusiones)


## Deployment
Es requerido que se tenga [docker](https://docs.docker.com/get-docker/) instalado en tu dispositivo, como tambi茅n una [copia de este repositorio](https://github.com/hros19/CorreCaminos-management-system/generate) con la idea de que se tenga todo el repositorio localmente en tu **dispositivo Linux** y adem谩s, tener [nodejs y npm](https://stackoverflow.com/questions/39981828/installing-nodejs-and-npm-on-linux).

Una vez que estemos en el directorio en donde se encuentran todos los contenidos de este repositorio primero debemos inicializar el proyecto usando `npm install` para que nos genere la carpeta **node_modules**. Esto es requerido, de lo contrario saltar谩 un mensaje de error al intentar levantar el contenedor **nodeappcontainer**.

**Nota:** Si tienes MySQL instalado previamente en tu dispositivo y est谩 ejecut谩ndose la momento de levantar el docker-compose, te va a saltar el siguiente error:
```console
ERROR: for mysqlcontainer Cannot start service mysqldb: driver failer programming external connectivity on endpoint mysqlcontainer (...): 
Error starting userland proxy: listen tcp4 0.0.0.0:3306: bind: address already in use
ERROR: Encountered errors while bringing up the project
```
En ese caso basta con utilizar el comando `sudo service mysql stop`. Dependiendo de como lo tengas configurando en tu sistema, MySQL se va a levantar de forma autom谩tica una vez reinicies el equipo por lo que no hay que preocuparse, de igual forma puedes volver a leventar el servicio usando `sudo service mysql start`.

Luego de ello podemos ejecutar el comando `docker-compose up` para levantar los contenedores de la aplicaci贸n.

## Descripci贸n del problema
Una empresa ficticia llamada "CorreCaminos S.A" tuvo un auge debido a la pandemia, por lo que necesitan un programa que permita administrar todo la l贸gica de la empresa. Esta empresa provee productos a distintos clientes a lo largo del pa铆s, tambi茅n cuenta con una flotilla de repartidores con veh铆culos, un stock y la empresa cuenta con sus propios proveedores que abastecen el stock de la empresa.

Con las historias de usuario se construy贸 el siguiente diagrama conceptual:

![conceptual diagram](https://www.plantuml.com/plantuml/svg/VLFTJlD64BttKwp23RMK219-Q8KYIAAe5qMqIjKh96li7PnjrhjcVq2Xwhj_Q-y4EuOFNtdEp9npnZE-imwCyvLaIwqAh9q7oLRW80UBx45pb4bYTqBLOA1Y2oXsfT5UyQMMsZ1dGDcGGkNwPRyZS3HhhLmiExcShjTNltvPiH7loCvl-kttnkYtBdSvJ4NIrMnsVN4_pFsz5SLEeRLiDapr_CpMgxFbHL_pCVyN2xVGXgE9HMzRuV0d5NsLOSMzSqRatc4tmVT5P2fyeVFfzQVAuIS_cTw4kJ_NTMeNN-VSNY9RQCc_J1FvUhsuciwIPDlkXwLfqPr5rLn3cYQ9RhlOA4sNKg1oQJfYO5aCs7y92q_khMW-KAQWmcF4xUi1Oh0sQ4CpEF4QS_LMAyoKht8qBO0L2Dc-lMiLQvwrgK1cmBa9B2rKOfYZ54KF_hzlU6M2W273CI33l0t8RXTpNVWAbSi4Rs4B4io-VTqA8rIPSN0OH5XFvHyCzo6HP2WYdG9CbXjG_2Eg9RpuADfycam_PoN4SMflYYrOR4Ie0jGkAw26GhZzyMmF89H31Qf09dL9wZtq3rsIYQe3QHq3aCE0V46xOXkdYnrn7y0M8-hRFutcld1p5iE_F2WNlCwF-HuD_zX3-tveZrSq_vuhXXi7pji1CRKGDKL4NiUeMxBrTHtq36L54U4Nqg4LEIorsVUxyi-Wi1cyWf2GIpnsj24HiXH36hYpq34Dp_hxls4BhvXnbCsrjZixNifatWd-rhWfqJ7Rf907GydXEDdjXFw7MEOjDcdwfqVib9rF9fEK_HBU9u5qTChE8Z2A-ujj5UpQleDcsncxnkFvW8UM4pl376rd1AFasKVfxNWykBP-4qkYXU1hM4GJq-PjV-JnqHI37oMqFhc3m9DZyoIvGyLz9Ny0)

Con m谩s especificaci贸n, se tiene el siguiente diagrama l贸gico que representa a la base de datos.

![logical diagram B](https://www.plantuml.com/plantuml/svg/ZLHTK-is47tFhz3S-t3lpK064WfCIfdc0nVQGfaqPJfzyMoi9L4ZIwaaXmcT_lSgiXF90ZpX0UmzHtlE7gtvKHjGfiWv-LNEMGQSZC7033IIUqcHaqSBas6hfPTCh411JeQGBUTA5eAE99UA60L2MmY52Mct21HL8eKfQGhfk-Zlx1N9wMLuTA2KVF7OTp5KDXptUXTdWnYRBbYs5AWrwSQGz_AvbunFHcUXveY3raEfhAkIyx9W1jydU8rUJ1WOezYiCEZjdpLoIh4aEJ_jNiJ4EEdFtKixyXjQd5GCcGr7CfISncWGI98CpxkzLclXxcM_36u7MYqKXfaD-VI4TdAEdmXeKZsJVrl4_hJRZx-qssHT5bD6-uG9GwwkvYXGWK5wVUs8nyVkJmOgNN7ufy0-UHfCHhU3YIKNWjcAOvQKcG91zmnNDfiLfl8vdOFsHtyWNrOASrRaNnnfLQXi0HfJ2iOgR7zRpkYFoUJcOPgE1zCRHxCzKWDYcMQmWioEs2VFN8AfWzg0ANG5sJOddHD7uA1DkcKfV6QSVoopP5pcQ53PXWhMo97Mk_td8nuhjaRb4YuVwm5JL_iuNyjBeekmfEgkEhvwH7pM_jJVSfPQ6_jpFylPTFlQ2O3e8Yj30d9_ao50PHQuhObguA0s3dBl2wQOc3TSMH3JJoXvkQC3IXLgxH9xKtNXLT7DKQPGbZ_Cpmt5mMeK5FqoS2dczPBhjfAsHvyy_dRtCDqT_hexVUHFVHzC_YsSOfUlCr--n5zKc7ppD-MfzTi8n4FjUx3DK838q7xjpa6zLFUHU-pWxVF4jnjeJv3GVDZVVkBUVeXQFCF35cICVBj_cp5it6p1UxWK5DUstwPv8IfISwoHxftrgzR00t5VZ1smgjvi8sGUv6LOQ2PGwwdDq_a82w67MLLtoJUQYAY7kFXBYbBTFjHKNwLe5dECWpGciZ2bY7iALPGjDCiuIeFEZa2PDcu_btdrVo0Uyq_lmx-6PhvMCn_jRNrpOFAUKtUwKrMjNS-CajjgTQgQo-L_)
![logical diagram](https://www.plantuml.com/plantuml/svg/fLNVJzim47xlNs71Gra5qMZvmH13j0aPQ1kWjfkslLHEuxLMtRWuTb51_EzpuhPs3xSCyK2LtFVT-RxlVEGYbrX8DMRe6n_GFcOemX8dE2VeEqy9grJo4SqcME0nQk7-Q22uojAGCowG53ZBDKGowTAk24w9Y7ac3Mtxi1x7Hv-yZ0vz96Z_n4rl2i4VB7O88LCqQZIE3veGwmvfVvIHF4Tr23dzDEBeOtZWdXaodESjBdHNXlCmf9Bu2VQC1YGqfHGqKPBOzWysSinXsftz-Z4aGhUtwoTQyWiQT0f2SiO8Qd6MGjGn98vRH_L6fQ87IUKCROMCwiSjX7Da7j5J1Q5QxUvhhORwPQH7KtIAg8REpWOa8m9BafwVbxIue0q8x-4q5TeepIsf6aIQ_eLmPkvQq-31AjUjyiWp0jB_w51Gn8DLQagcFSqYOeePI8a8erCYPjTpE01SjqoYQ5Rq8MSJU79BvINMrL2GgDmbcXfxU_fdYMHuJ4xHpsOxl6gsTRxAwBqYckXm19besTfGBEdKiZLbCYoqPsgS4B6c2XbZojPWVxaOOxQmrP8gpt3Elo8oZV3CZDkDk5FVMOvzjtGwnJFz_C7wPd3Wc2aN60mORQluHgMF3on3vxre-xPOnhBfyYaiceMNb1U8plVVL4_lwtgUZnOXKp6NM2fhgeEaMEef5h_eCmf_jDkNDzrUrEnUkfovHeUyHbv49ARCYZJlQ4Ng3j2wYoQ2fwelpNo0Ik29netlniC0S5PiidL1xfs91miSUdQlS2dDP3bA5mk5EfBtHwNCHQYCE48HxE0zvtRKPCBe_FOiNbPTpKtKVtdSKonpmxglNKUD_TUcmrs7w11FoV9UMTPJzVTbfxgBgZUtrMVNWRbrePOpuCBiFeYvVbZd-tFqLL_SZBNMU5hgg0Hq1SF-ndALw9DUtNN8rt_NEgLae7acC2BmQ0TIRSstodKr-eLjLkI_geix7JYOtmRZsTiDWDNW460zCCC0PlWTtRnJDE_XAQOC9unikFDmw-s7mucitNzUO6ySWcS0KE5hNmjFt_2Bu8alDSHG0-pCP0M00kRwpd-t5oHBrPXL_W40)

Ambos diagramas se construyeron gracias a la herramienta [PlantUML](https://www.plantuml.com/plantuml/uml/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000).

## Utilizar la aplicaci贸n
No existe una interfaz de usuario, la funcionalidad se tiene que probar mediante consola de comandos, se pueden utilizar otras herramientas como [Postman API](https://www.postman.com/) o alguna otra equivalente pero no es requerido para este proyecto debido a que utilizamos librerias para realizar las pruebas de forma directa en la consola.

> ### Mocha
> Despu茅s de hacer el [deployment](#deployment) correspondiente, vamos a detener el contenedor llamado **nodeappcontainer** utilizando el comando `docker stop nodeappcontainer`, luego vamos a tener que ejecutar el siguiente comando para correr las [pruebas unitarias](https://github.com/hros19/CorreCaminos-management-system/blob/main/test/index.test.js) definidas anteriormente.
> ```console
> DB_HOST=localhost SERVER_PORT=3001 npm test
> ```
En caso de alg煤n error hay que asegurarse de que solamente el contenedor **mysqlcontainer** este corriendo en ese momento, podemos asegurarnos utilizando el comentado `docker ps` para ver todos los contenedores de Docker que se esten ejecutando.

Se recomienda comenzar con las pruebas unitarias debido a que los valores iniciales del programa se consideraron para las estas pruebas, siendo valores espec铆ficos que de ser alterados van a modificar los resultados de dichas pruebas.

> ### Manual (http)
> Para probar la aplicaci贸n de forma manual si va a ser requerido tener ambos contenedos levantados, en caso de haber detenido el contenedor **nodeappcontainer** basta con volver a levantarlo usando `docker start nodeappcontainer` o levantar por completo ambos servicios nuevamente con `docker-compose up --build`. Luego vamos a poder utilizar el siguiente comando con los endpoints detallados en la secci贸n [endpoints](#endpoints), pero se respeta la siguiente sintaxis:
> ```console
> http <m茅todo> :3000/<endpoint> [key=value, ...]
> ```
Los componentes llave-valor no son requeridos en la mayor铆a de los endpoints pero en los casos que son requeridos algunos par谩metros deben ser pasados **obligatoriamente**, de lo contrario puede marcar un error inesperado pero se debe a que algunas veces se requiere de uno o varios par谩metros en espec铆fico.

Tambi茅n es importante considerar que de haber cambiado el puerto (3000) en los archivos de configuraci贸n, tambi茅n requerido cambiarlo en este comando.
  
> ### Reiniciar base de datos
> Como es un proyecto evaluado y las pruebas modifican los valores de la base de datos se recomienda usar el siguiendo comando para reiniciar por completo la base de datos sin tener que volver a levantar los contenedores de docker, ni tampoco reiniciarlos o algo por el estilo. Esto puede ser muy 煤til si se quieren comprobar distintas pruebas para los mismos valores iniciales de la base de datos.
> ```console
> docker exec -i mysqlcontainer mysql -uroot -pletmein <./dbinit/init.sql
> ```
Es importante recalcar que se perder谩n todos los cambios hechos previamente.
  
## Endpoints
Antes de detallar todos los endpoints hay que considerar que algunos par谩metros son espec铆ficos o con valores restringidos. Por lo que hay que considerar a la hora de probar la funcionalidad del programa.

Para los endpoints con par谩metros de paginaci贸n se deben respetar los siguientes par谩metros:
  - Para referirse al par谩metro como tal que se toma como referencia para ordenar los resultados obtenidos se usa la palabra reservada **parameter**. Los valores que esta variable puede tomar se van a especificar en cada endpoint.
  - El orden de los resultados se representar谩n con una variable **order**, en todos los casos va a tener valores restringidos de {ASC, DESC}, cualquier otro valor el programa indicar谩 que el valor no es correcto.
  - Para elegir una p谩gina en espec铆fico se tiene que especificar una variable de nombre **pag**, su valor debe ser num茅rico positivo mayor a cero y que no sobrepase el total de p谩ginas.
  - Para elegir un l铆mite de elementos para cada p谩gina, se utilizar谩 una variable nombrada **limit**, debe ser un valor entre 1 y 99. No importa si la cantidad de resultados es menor al l铆mite, de igual es v谩lido.
  
**Nota importante**: para todos los valores que sean parte del cuerpo del request y que tengan un espacio, estos deben estar entre comillas, por ejemplo el siguiente request va a dar error:
```console
http POST :3000/client client_name=Carlos Villa ...
```
En su lugar debe ser:
```console
http POST :3000/client client_name="Carlos Vila" ...
```
### Presentaci贸n del proyecto
La informaci贸n principal del proyecto se puede ver con el endpoint b谩sico

```console
http GET :3000/
```
  
### Stock del negocio
Se tiene un almacenamiento limitado por parte de la empresa CorreCaminos S.A, este endpoint permitir谩 gestionar todas las acciones referente a la stock propia de la empresa. Todas las rutas se encuentran en [este archivo](https://github.com/hros19/CorreCaminos-management-system/blob/main/src/route/business_stock.route.js).
  
> **Obtener todos los productos en stock con paginaci贸n**
>
> ```console
> http GET :3000/stock parameter=product_id order=ASC pag=1 limit=10
> ```
>
> parameter = {product_id, quantity}
  
> **Rellenar productos en stock**
>
> Estos tienen que estar registrados en stock previamente, de lo contrario, saltar谩 un error.
> 
> ```console
> http POST :3000/stock products='[{"product_id": 8, "quantity": 100}, {"product_id": 9, "quantity": 400}]'
> ```
> 
>  Se pueden registrar m谩s productos, pero solamente de forma inicial se pueden agregar los productos con los id **8** y **9**, esto es debido a que el proveedor asociado a estos productos es el 煤nico que no tiene pedidos recientes y no se permiten hacer varios pedidos a un mismo proveedor en una sola semana. En caso de querer "fillear" m谩s productos, se deben registrar tanto en el sistema, como en el stock del negocio.
> 
> **Nota:** no es lo mismo "registrar" que "fillear".

> **Obtener un producto del stock**
> 
> ```console
> http GET :3000/stock/:id
> ```
> 
> Recordar nuevamente que un producto puede existir pero no necesariamente tiene que pertenecer al stock.

> **Eliminar un producto del stock**
>
> Este elimina el producto completamente del stock.
> ```console
> http DELETE :3000/stock/:id
> ```

> **Quitar existencias de un producto en stock**
>
> Elimina cierta cantidad de productos que se encuentren registrados en stock de un producto en particular.
>
> ```console
> http PUT :3000/stock/:id quantity=200
> ```
>
> Se puede eliminar la cantidad que se desee, considerando que el producto tenga suficientes existencias, no permitir谩 que el producto quede con una cantidad negativa.

> **Registrar existencias de un producto en stock**
>
> Registra una cantidad espec铆fica de existencias de un producto en stock en particular.
>
> ```
> http POST :3000/stock/:id quantity=200
> ```
>
> No hay l铆mite superior, puede ingresar la cantidad que quiera.
  
### Tipos de negocio
Estos endpoints manejaran todos los posibles tipos de clientes/negocios que se maneje en el sistema. No se permitir谩n almacenar nombres repetidos.

> **Obtener tipos de negocio con paginaci贸n**
>
> ```console
> http GET :3000/businessType parameter=business_type_name order=ASC pag=1 limit=10
> ```
  
> **Crear un nuevo tipo de negocio**
>
> ```console
> http POST :3000/businessType name="Bar clandestino"
> ```

> **Obtener un tipo de negocio en concreto**
>
> ```console
> http GET :3000/businessType/:id
> ```

> **Actualizar el nombre de un tipo de negocio**
>
> ```console
> http PUT :3000/businessType/:id new_name="Casino de lujo"
> ```
  
> **Eliminar un tipo de negocio en concreto**
>
> ```console
> http DELETE :3000/businessType/:id
> ```
  
### Clientes
Este endpoint manejar谩 todas las acciones relacionadas a los clientes de la empresa, como la informaci贸n de estos, sus 贸rdenes y su gestionamiento.
  
> **Obtener todos los clientes con paginaci贸n**
> 
> ```console
> http GET :3000/client parameter=client_id order=ASC pag=1 limit=10
> ```
>
> parameter = {client_id, business_name, business_representative, phone_number, email, address, business_type_name, dev_interval_id, dev_interval_name, zone_id, zone_name, formal_address, latitude, longitude}

> **Crear un nuevo client**
>
> ```console
> http POST: 3000/client zone_id=2 dev_interval_id=3 business_type_id=1 business_name="Super La Teja" business_representative="Mario Casas" phone_number="88686868" email="lateja@mail.com" formal_address="Calle que no existe 1" latitude=-50 longitude=40
> ```

> **Obtener 贸rdenes de los clientes**
>
> Estas son todas las 贸rdenes registradas que se han hecho a la empresa proveniente de los clientes.
>
> ```console
> http GET: 3000/order parameter=client_id order=ASC pag=1 limit=10
> ```
>
> parameter = {client_order_id, client_id, order_status, order_date, order_delivery_date}
  
> **Obtener una orden en concreto**
> Busca una orden que haya sido realiza por un client, buscando por el id de la orden
>
> ```console
> http GET :3000/client/order/:id
> ```
  
> **Actualizar una orden en concreto**
>
> Actualiza la informaci贸n de la orden de un cliente.
>
> ```console
> http PUT :3000/client/order/:id new_status="PENDIENTE"
> ```
>
> Hay que tener cuidado con este endpoint en particular, los valores aceptados son {PENDIENTE, EN DESPACHO, COMPLETADO} podria generarse un error por este lado debido a que el sistema cambia el estado autom谩ticamente dependiendo la circunstancia. Por lo que solo debe usarse para fines administrativos.
  
> **Eliminar una orden en particular de un cliente**
>
> Permite eliminar una orden hecha anteriormente por un cliente.
>
> ```console
> http DELETE :3000/client/order/:id
> ```
  
> **Resumir la orden de un cliente**
>
> Este considera el caso de cuando una orden queda como **PENDIENTE**, cuando una orden queda como pendiente, no se realizan los cambios en el stock y la orden se guarda hasta que un administrador llame a este endpoint para volver a intentar despachar la orden. Esta funci贸n vuelve a revisar que todos los productos de la orden se encuentren disponibles en el stock, de ser as铆 la orden pasa a estar **EN DESPACHO**, se quitan los productos del stock y queda lista para que se asigne el pedido a un conductor.
>
> ```console
> http PUT :3000/client/order/:id/resume
> ```
>
> Como se puede intuir, solo se aceptan pedidos que tengan calidad de **PENDIENTE**.
  
> **Obtener detalles de una orden de un cliente**
>
> Este endpoint permite ver todos los productos que est茅n asociados a una orden.
>
> ```console
> http GET :3000/client/order/:id/detail
> ```
  
> **Obtener la informaci贸n de un cliente**
>
> ```console
> http GET :3000/client/:id
> ```
  
> **Actualizar la informaci贸n de un cliente**
>
> ```console
> http PUT :3000/client/:id business_type_id=3 business_name=Kiosco business_representative="Alex Martinez" phone_number="96959535" email="kiosquito@mail.com" formal_address="Calle nueva y falsa 245"
> ```
  
> **Eliminar un cliente**
>
> ```console
> http DELETE :3000/client/:id
> ```
  
> **Obtener todas las 贸rdenes de un cliente**
>
> Este retorna todas las 贸rdenes hechas por un cliente en espec铆fico por su client_id.
>
> ```console
> http GET :3000/client/:id/order parameter=client_order_id order=ASC pag=1 limit=10
> ```
>
> parameter = {client_order_id, client_id, order_status, order_date, order_delivery_date}

> **Crear una orden para un cliente**
>
> Permite abrir una nueva orden para un client en espec铆fico.
>
> ```console
> http POST :3000/client/:id/order products='[{"product_id": 3, "quantity": 200}, {"product_id": 5, "quantity": 400}]'
> ```
>
> De igual forma se pueden agregar la cantidad de productos que desee
  
> **Eliminar un d铆a de entrega de un cliente**
>
> Todos los clientes tienen d铆a o d铆as (dependiendo del intervalo asignado) para las entregas de sus productos. Este endpoint permite eliminar un d铆a de entrega asignado a un client previamente.
>
> ```
> http DELETE :3000/client/:id/devday
> ```
  
> **Crear un nuevo d铆a de entrega para un cliente**
>
> No crea un d铆a de entrega como tal para el cliente, si no que le asigna al cliente un nuevo d铆a para poder entregarle sus pedidos. Se tiene que considerar que los clientes pueden tener {1 o 2} d铆as de entrega en total, se tiene que revisar bien si tiene o no d铆as asignados para poder asignarle al cliente ese d铆a en espec铆fico.
>
> ```
> http POST :3000/client/:id/devday delivery_day_id=3
> ```
>
> delivery_day_id = {1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Friday}
  
> **Obtener los d铆as de entrega de un cliente**
>
> Retorna todos los d铆as que tenga asignado un cliente para sus entregas.
>
> ```
> http GET :3000/client/:id/devday
> ```
>
> Considerando que solo pueden tener dos d铆as como m谩ximo, no se considera algo vital tener paginaci贸n en este endpoint.

### Delivery
Estos permiten gestionar todo relacionado
  
> **Obtener todos los d铆as de entrega**
>
> En realidad, los d铆as son {Monday: 1, Tuesday: 2, ...} pero bueno, se pueden ver con paginaci贸n y todo.
>
> ```
> http GET :3000/delivery/day order=ASC pag=1 limit=10
> ```
>
> No tiene par谩metro de paginaci贸n.
  
> **Obtener todos los d铆as de entrega**
>
> En realidad, los d铆as son {Monday: 1, Tuesday: 2, ...} pero bueno, se pueden ver con paginaci贸n y todo.
>
> ```
> http GET :3000/delivery/day order=ASC pag=1 limit=10
> ```
>
> No tiene par谩metro de paginaci贸n.
  
> **Obtener un d铆a de entrega en espec铆fico**
>
> ```
> http GET :3000/delivery/day/:id
> ```
  
> **Obtener todos los intervalos de entrega**
>
> Obtiene todos los intervalos de entrega para asignarlos a los clientes. Este afecta directamente a la cantidad de pedidos que reciben por semana.
>
> ```
> http GET :3000/delivery/interval parameter=dev_interval_id order=ASC pag=1 limit=10
> ```
>
> No tiene par谩metro de paginaci贸n.
  
> **Obtener un intervalo de entrega**
>
> ```
> http GET :3000/delivery/interval/:id
> ```
  
### Conductores
  
> **Obtener todos los conductores**
>
> ```
> http GET :3000/driver parameter=driver_id order=ASC pag=1 limit=10
> ```
>
> parameter = {driver_id, driver_name, job_title_name, driver_doc_id, salary, hiring_date, vehicle_id, car_plaque}
  
> **Crear conductor**
>
> ```
> http POST :3000/driver vehicle_id=x job_title_id=1 driver_name="Joaquin Rodriguez" driver_doc_id="350036360" salary=80000
> ```
>
> No existe un vehiculo con id **x**, inicialmente no hay veh铆culos disponibles, debe crearse uno para poder asignarlo a un nuevo conductor debido a que los dem谩s est谩n ocupados.
  
> **Obtener un conductor en particular**
>
> ```
> http GET :3000/driver/:id
> ```
  
> **Actualizar un conductor en particular**
>
> ```
> http PUT :3000/driver/:id vehicle_id=x job_title_id=1 driver_name="Juan Diaz" driver_doc_id="4447585" salary=10000
> ```
>
> No existe un vehiculo con id **x**, inicialmente no hay veh铆culos disponibles, debe crearse uno para poder asignarlo a un nuevo conductor debido a que los dem谩s est谩n ocupados.
  
> **Eliminar un conductor en particular**
>
> ```
> http DELETE :3000/driver/:id
> ```
  
> **Mandar a un conductor a completar una orden**
>
> ```
> http POST :3000/driver/:id/delviery/:clientOrderId
> ```
>
> La orden del cliente debe estar marcada como **PENDIENTE** y el conductor debe ser **Repartidor**.
  
### Tipos de conductores
Los tipos de conductor varian inicialmente entre {Promotor, Repartidor} pero se pueden agregar m谩s.

> **Obtener tipos de conductores**
>
> Obtiene todos los tipos de conductores registrados en el sistema con paginaci贸n.
>
> ```
> http GET :3000/jobTitle order=ASC pag=1 limit=10
> ```
  
> **Crear un tipo de conductor**
>
> Crea un nuevo tipo de conductor.
>
> ```
> http POST :3000/jobTitle name="Anunciante"
> ```
  
> **Actualizar tipo de conductor**
>
> ```
> http PUT :3000/jobTitle/:id new_name="Chequeador"
> ```

> **Obtener un tipo de conductor en particular**
>
> ```
> http POST :3000/jobTitle/:id
> ```

> **Eliminar un tipo de conductor**
>
> ```
> http DELETE :3000/jobTitle/:id
> ```
  
### Productos
Endpoint para gestionar todo lo que tenga que ver con los productos sean ajenos al stock de la empresa o no.

> **Obtener todos los productos**
>
> ```
> http GET :3000/product parameter=product_id order=ASC pag=1 limit=10
> ```
>
> parameter = {product_id, product_name, supplier_id, product_cat_id, product_subcat_id, is_available}
  
> **Crear un nuevo producto**
>
> Registrar un nuevo producto en el sistema, sin embargo, no lo registrar en el stock del cliente de manera autom谩tica.
>
> ```
> http POST :3000/product product_name="Guisantes Frescos" supplier_id=2 sub_cat_id=2 is_available="YES" price=7500
> ```
>
> is_available = {YES, NO}
  
> **Obtener un producto**
>
> ```
> http GET :3000/product/:id
> ```
  
> **Actualizar un producto**
>
> ```
> http PUT :3000/product/:id product_name="Guisantes feos" sub_cat_id=5 is_available=NO price=4500
> ```
  
> **Eliminar un producto**
>
> ```
> http DELETE :3000/product/:id
> ```
 
### Categor铆as de productos
Con estos endpoint se pueden manejar las categor铆as y las subcategor铆as de los productos

> **Obtener categor铆as de los productos**
>
> ```
> http GET :3000/productCat parameter=product_cat_name order=ASC pag=1 limit=10
> ```
>
> parameter = {product_cat_name, product_cat_id}
  
> **Crear una categor铆a de un producto**
>
> ```
> http POST :3000/product name="Electrodomesticos"
> ```
  
> **Obtener subcategor铆as de los productos**
>
> ```
> http GET :3000/productCat/subCategory parameter=Category_id order=ASC pag=1 limit=10
> ```
>
> parameter = {Category_id, Category_name, SubCategory_id, SubCategory_name}
  
> **Crear una nueva subcategor铆a**
>
> ```
> http POST :3000/productCat/subCategory name="Freidora" category_id=2
> ```
  
> **Obtener subcategor铆a**
>
> ```
> http GET :3000/productCat/subCategory/:id
> ```
  
> **Actualizar una subcategor铆a**
>
> ```
> http PUT :3000/productCat/subCategory/:id name="Horno"
> ```
  
> **Eliminar una subcategor铆a**
>
> ```
> http DELETE :3000/productCat/subCategory/:id
> ```
  
> **Obtener una categor铆a**
>
> ```
> http GET :3000/productCat/:id
> ```

> **Actualizar una categor铆a**
>
> ```
> http PUT :3000/productCat/:id name="Maquinaria"
> ```
  
> **Eliminar una categor铆a**
>
> ```
> http DELETE :3000/productCat/:id
> ```
  
> **Obtener los reportes **
>
> ```
> http GET :3000/productCat/:id
> ```
  
### Reporte diario
Servir谩 para obtener el reporte de los pedidos de los clientes que siguen en calidad de **PENDIENTE** de una fecha especifica.
  
> **Obtener el reporte del dia de una fecha**
>
> ```
> http GET :3000/report date='2022-04-26'
> ```
  
### Proveedores
Los proveedores son los que abastecen a la empresa, se le pueden hacer un pedido a cada proveedor por semana.
  
> **Obtener todos los proveedores**
>
> ```
> http GET :3000/supplier parameter=supplier_id order=ASC pag=1 limit=10
> ```
>
> parameter = {supplier_id, supplier_name, formal_address, phone_number, email, have_delivery}

> **Crear un nuevo proveedor**
>
> ```
> http POST :3000/supplier supplier_name="Maseca" formal_address="Calle muy real 1" phone_number="787484" email="mase@ca.com" have_delivery=NO
> ```
>
> have_delivery = {YES, NO}
  
> **Obtener un proveedor en particular**
>
> ```
> http GET :3000/supplier/:id
> ```
>
> have_delivery = {YES, NO}
  
> **Actualizar un proveedor en particular**
>
> ```
> http PUT :3000/supplier/:id supplier_name="Monge" formal_address="Calle muy real 5" phone_number="1111111111" email="monge@cr.com" have_delivery=NO
> ```
>
> have_delivery = {YES, NO}
  
> **Eliminar un proveedor en particular**
>
> ```
> http DELETE :3000/supplier/:id
> ```

> **Obtener todos los productos de un proveedor**
>
> Retorna todos los productos con paginaci贸n que ofrece un proveedor
>
> ```
> http GET :3000/supplier/:id/products parameter=product_id order=ASC pag=1 limit=10
> ```
>
> parameter = {product_id, product_name, product_subcat_id, product_subcat_name, supplier_id, supplier_name, is_available}
  
> **Obtener todas las ordenes hechas a un proveedor**
>
> Retorna todas las ordenes que a hecho la empresa a un proveedor en particular.
>
> ```
> http GET :3000/supplier/:id/orders parameter=supplier_id order=ASC pag=1 limit=10
> ```
>
> parameter = {supplier_order_id, supplier_id, order_date}
  
### Vehiculos
Maneja todos los vehiculos que estan registrados en la empresa.
  
> **Obtener todos los vehiculos de la empresa**
>
> ```
> http GET :3000/vehicle parameter=vehicle_id order=ASC pag=1 limit=10
> ```
>
> parameter = {vehicle_id, car_brand, car_plaque, type_of_gas, purchase_date, gas_tank_capacity, gas_tank_status, last_tank_refill, kilometers_traveled}
  
> **Registrar un nuevo vehiculo de la empresa**
>
> Es importate aclarar que los vehiclos no pueden tener una capacidad de tanque menor al estado actual. Sin mencionar que deben ser valores positivos al igual que los kilometros recorridos por el vehiculo.
>
> ```
> http POST :3000/vehicle car_brand="Tesla" car_plaque="TTT-YYY" type_of_gas=Diesel gas_tank_capacity=500 gas_tank_status=100 kilometers_traveled=0
> ```
  
> **Obtener un vehiculo en particular**
>
> ```
> http GET :3000/vehicle/:id
> ```
>
  
> **Actualizar un vehiculo en particular**
>
> Recordar que no se puede actualizar el vehiculo de modo que la capacidad maxima del tanque quede menor al estado actual. Tampoco se permite tener placas repetidas.
>
> ```
> http PUT :3000/vehicle/:id car_brand=Suzuki car_plaque=WWWCCZ type_of_gas=Premium gas_tank_capacity=1000
> ```
  
> **Eliminar un vehiculo en particular**
>
> ```
> http DELETE :3000/vehicle/:id
> ```
  
> **Obtener el estado de un vehiculo en particular**
>
> Este permite el quartil actual del estado de la gasolina.
> 
> ```
> http GET :3000/vehicle/:id
> ```
  
> **Llenar el tanque de un vehiculo en particular**
>
> Permite rellenar el tanque de gasolina con una cantidad especifica.
> 
> ```
> http PUT :3000/vehicle/:id/fillTank quantity=100
> ```
>
> En caso de que sobrepase la capacidad m谩xima del veh铆culo, tomar谩 dicha capacidad como estado actual. Se ignora el sobrante.
  
> **Registrar kilometros a un veh铆culo en particular**
>
> Este no es vital utilizar, no se tiene que hacer de forma manual. Cuando se hace el pedido y se mandar al repartidor hace este c谩lculo y deducci贸n de la gasolina autom谩ticamente. Hay que tomar en cuenta que **1 kil贸metro = 1 Litro de gasolina**, va a dar error si se sobrepasa.
> 
> ```
> http PUT :3000/vehicle/:id/registerKilometers quantity=100
> ```

> **Registrar mantenimiento a un veh铆culo en particular**
> 
> ```
> http POST :3000/vehicle/:id/registerMaintenance tipo_mantenimiento="Cambio de aceite"
> ```
  
> **Obtener todos los mantenimientos de un vehiculo en particular**
> 
> ```
> http GET :3000/vehicle/:id/maintenances pag=1 limit=10
> ```
  
> **Obtener un mantenimiento en particular**
> 
> ```
> http GET :3000/vehicle/maintenance/:id
> ```
  
> **Actualizar un mantenimiento en particular**
> 
> ```
> http PUT :3000/vehicle/maintenance/:id new_type="Cambio de frenos"
> ```
  
> **Eliminar un mantenimiento en particular**
> 
> ```
> http DELETE :3000/vehicle/maintenance/:id
> ```
  
### Zonas
Las zonas contienen a diversos clientes, y estan compuestos por rutas. Estas rutas tienen distancias y son las que determinan el gasto de gasolina que har谩n los vehiculos.
  
> **Obtener todas las zonas**
> 
> ```
> http GET :3000/zone/ order=ASC pag=1 limit=10
> ```
  
> **Crear una nueva zona**
> 
> ```
> http POST :3000/zone/ name="Zona nuevisima"
> ```
  
> **Obtener una zona en particular**
> 
> ```
> http GET :3000/zone/:id
> ```
  
> **Actualizar una zona en particular**
> 
> ```
> http PUT :3000/zone/:id new_name="Zona nueva actualizada"
> ```
  
> **Eliminar una zona en particular**
> 
> ```
> http DELETE :3000/zone/:id
> ```
  
> **Obtener todas las rutas de una zona en particular**
> 
> ```
> http GET :3000/zone/:id/route parameter=zone_id order=ASC pag=1 lmit=10
> ```
  
> **Asignar una ruta a una zona**
> 
> ```
> http POST :3000/zone/:id/route/:route_id
> ```
  
> **Desasignar una ruta a una zona**
> 
> ```
> http DELETE :3000/zone/:id/route/:route_id
> ```
  
## Objetivos
Esta secci贸n sirve para resumir los objetivos logrados y no logrados del proyecto.
  
| **Requerimiento**                                                                                       | **Descripci贸n**                                                                                                                                                                                                                                                                           | **Estado** | **Comentario**                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Manejo de Clientes                                                                                      | Permite crear, actualizar, consultar y eliminar clientes de forma apropiada.                                                                                                                                                                                                              | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Intervalo estricto para las entregas de los clientes                                                    | Existe una funcionalidad que especifica d铆as de entrega de los clientes y se respeta.                                                                                                                                                                                                     | :white_check_mark:    | Todo se hace de forma autom谩tica.                                                                                                                                                                                                                                                                                          |
| Se guarda la direcci贸n GPS del cliente.                                                                 | Almacena las coordenadas geogr谩ficas de los clientes de forma apropiada.                                                                                                                                                                                                                  | :white_check_mark:    | Se almacena en una tabla con su con su respectiva variable de tipo POINT.                                                                                                                                                                                                                                                  |
| Manejo de Productos                                                                                     | Permite crear, actualizar, consultar y eliminar productos de forma apropiada.                                                                                                                                                                                                             | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Manejo de categor铆as y subcategor铆as de los productos                                                   | Permite gestionar categor铆as y subcategor铆as para los distintos productos ofrecidos por la empresa CorreCaminos.                                                                                                                                                                          | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Funcionalidad de atributo disponible/ no-disponible de un producto                                      | Existe la propiedad de un producto de ser "disponible" o "no disponible" que afecta a las dem谩s funcionalidades del sistema de manera adecuada.                                                                                                                                           | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Manejo de un stock                                                                                      | Existe una entidad funcional que permite almacenar una cantidad finita de productos que se enlaza directamente con las acciones que realizan los clientes y proveedores de la empresa.                                                                                                    | :white_check_mark:    | Se maneja un stock v谩lido.                                                                                                                                                                                                                                                                                                 |
| Limite de pedidos por semana para los proveedores                                                       | El programa restringue que no se permitan hacer pedidos al mismo proveedor en el lapso de una semana.                                                                                                                                                                                     | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Mecanismo para recoger pedidos para los proveedores que no posean delivery                              | Existe una entidad funcional en el programa que permite asignar conductores para recoger pedidos en caso de que el proveedor no tenga un servicio de env铆os.                                                                                                                              | :x:       | No se realiz贸 en absoluto, me di cuenta hasta el pen煤ltimo d铆a de la entrega. Tendr铆a que cambiar muchas cosas.                                                                                                                                                                                                            |
| Se puede ver la lista de productos de un proveedor en espec铆fico                                        | El sistema despliega toda la informaci贸n de los productos para el proveedor que se desee.                                                                                                                                                                                                 | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Permite a un admin registrar varios productos a la vez en stock                                         | El programa permite que se puedan pedir m煤ltiple productos al mismo tiempo considera las restricciones de: productos no disponibles (considera que este atributo puede cambiar) y que el proveedor no tenga un pedido registrado en los 煤ltimos 7 d铆as.                                   | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Permite a los pedir varios productos a la vez                                                           | El programa permite que el usuario pueda pedir m煤ltiples productos al mismo tiempo considerando las restricciones de: que existan suficientes productos en stock y que el pedido se registre de forma autom谩tica dependiente del tipo y d铆as de delivery asignado previamente al cliente. | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Gesti贸n autom谩tica de los estados de los pedidos de los clientes                                        | El programa no requiere de intervenci贸n manual para cambiar el estado de los pedidos a parte de resumir una orden que esta pendiente o entregar una orden que esta en despacho.                                                                                                           | :white_check_mark:    | El programa solo requiere que la persona haga el pedido, en caso de que quede como "Pendiente" lo unico que tendr谩 que hacer el administrador es intentar resumir el pedido para ver si ya existen suficientes existencias en stock. En ese caso, procesa la orden de forma autom谩tica.                                             |
| Gesti贸n de fechas de los pedidos de forma autom谩tica                                                    | No se requiere de ninguna intervenci贸n manual para mover fechas de entrega, todo lo hace el sistema de forma autom谩tica.                                                                                                                                                                  | :white_check_mark:    | Imaginemos que un pedido queda en pendiente y al admin se le olvid贸 resumir el pedido (quedando la entrega para el pasado). El sistema cuando detecta esto, vuelve a calcular una fecha cercana que sea acorde a los d铆as de delivery v谩lidos para ese cliente y lo asigna de forma autom谩tica cuando se resume el pedido. |
| Funcionalidad para mandar a un conductor para entregar un pedido                                        | El programa debe permitir mandar a un conductor de la empresa que sea "repartidor", que este tenga un veh铆culo en condiciones para hacer la entrega (suficiente gasolina) y que actualice el estado como "COMPLETADO".                                                                    | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Generar reportes de forma diario con los pedidos que est谩n como "PENDIENTE"                             | El programa genera todos los d铆as un reporte que indica todos los pedidos que est谩n como "EN DESPACHO", o sea, listos para entregar (mandar a los conductores) y los muestra con paginaci贸n.                                                                                              | :white_check_mark:    | Aclaraci贸n: solo muestra los pedidos con estado de "EN DESPACHO", los dem谩s son ignorados.                                                                                                                                                                                                                                 |
| Permite asignar un promotor para todos los clientes que no tengan pedidos en los 煤ltimos 15 d铆as        | El programa asigna de forma autom谩tica a un promotor que visita al cliente para ofrecer promociones, etc... cuando este no haya realizado un solo pedido en los 煤ltimos 15 d铆as reflejando el recorrido del vehiculo correctamente.                                                       | :x:       | Por temas de tiempo, no son mi fuerte las bases de datos. Casi que tuve que ir aprendiendo mientras realizaba el proyecto.                                                                                                                                                                                                 |
| Agrupaci贸n de clientes por zonas de forma diaria para ver cuales est谩n pendientes para recibir pedidos. | El programa genera un reporte diario por zonas con todos los clientes a los que se les deba hacer pedidos de forma autom谩tica.                                                                                                                                                            | :x:       | No se generan por zonas, las zonas utilizaron para agrupar rutas y de ah铆 sacar el costo o distancia que tiene que recorrer un vehiculo. Los reportes se realizan solamente considerando todos aquellos que tengan pedidos que esten "EN DESPACHO".                                                                        |
| Manejo/Gesti贸n de la flotilla de veh铆culos                                                              | Existe una tabla con toda la informaci贸n de los veh铆culos que tiene la empresa. Junto con su lista de registros de mantenimiento.                                                                                                                                                         | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Permitir chequear el estado cualquier veh铆culo.                                                         | Existe una forma de ver los cuartos de gasolina restantes del veh铆ulo, como tambi茅n la cantidad de kilometros recorridos del mismo.                                                                                                                                                       | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |
| Permite rellenar el tanque de gasolina de cada veh铆culo solamente una por d铆a                           | El programa restringue que los veh铆culos no puedan ser rellenados m谩s de una vez al d铆a.                                                                                                                                                                                                  | :white_check_mark:    |                                                                                                                                                                                                                                                                                                                            |

## Conclusiones
Pues aprend铆 un mont贸n de bases de datos y manejo de informaci贸n de los endpoints, no est谩 completo pero son peque帽os detalles que puedo trabajar m谩s adelante. Aun as铆 estoy feliz con el resultado.
