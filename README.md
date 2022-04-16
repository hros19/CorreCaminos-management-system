
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
- [Description of the problem](#description-of-the-problem)

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

![conceptual diagram](https://www.plantuml.com/plantuml/svg/VLFTJlD64BttKwp23RMK219-Q8KYIAAe5qMqIjKh96li7PnjrhjcVq2Xwhj_Q-y4EuOFNtdEp9npnZE-imwCyvLaIwqAh9q7oLRW80UBx45pb4bYTqBLOA1Y2oXsfT5UyQMMsZ1dGDcGGkNwPRyZS3HhhLmiExcShjTNltvPiH7loCvl-kttnkYtBdSvJ4NIrMnsVN4_pFsz5SLEeRLiDapr_CpMgxFbHL_pCVyN2xVGXgE9HMzRuV0d5NsLOSMzSqRatc4tmVT5P2fyeVFfzQVAuIS_cTw4kJ_NTMeNN-VSNY9RQCc_J1FvUhsuciwIPDlkXwLfqPr5rLn3cYQ9RhlOA4sNKg1oQJfYO5aCs7y92q_khMW-KAQWmcF4xUi1Oh0sQ4CpEF4QS_LMAyoKht8qBO0L2Dc-lMiLQvwrgK1cmBa9B2rKOfYZ54KF_hzlU6M2W273CI33l0t8RXTpNVWAbSi4Rs4B4io-VTqA8rIPSN0OH5XFvHyCzo6HP2WYdG9CbXjG_2Eg9RpuADfycam_PoN4SMflYYrOR4Ie0jGkAw26GhZzyMmF89H31Qf09dL9wZtq3rsIYQe3QHq3aCE0V46xOXkdYnrn7y0M8-hRFutcld1p5iE_F2WNlCwF-HuD_zX3-tveZrSq_vuhXXi7pji1CRKGDKL4NiUeMxBrTHtq36L54U4Nqg4LEIorsVUxyi-Wi1cyWf2GIpnsj24HiXH36hYpq34Dp_hxls4BhvXnbCsrjZixNifatWd-rhWfqJ7Rf907GydXEDdjXFw7MEOjDcdwfqVib9rF9fEK_HBU9u5qTChE8Z2A-ujj5UpQleDcsncxnkFvW8UM4pl376rd1AFasKVfxNWykBP-4qkYXU1hM4GJq-PjV-JnqHI37oMqFhc3m9DZyoIvGyLz9Ny0)

With more specification, we end up with this logical diagram.

![logical diagram B](https://www.plantuml.com/plantuml/svg/ZLHTK-is47tFhz3S-t3lpK064WfCIfdc0nVQGfaqPJfzyMoi9L4ZIwaaXmcT_lSgiXF90ZpX0UmzHtlE7gtvKHjGfiWv-LNEMGQSZC7033IIUqcHaqSBas6hfPTCh411JeQGBUTA5eAE99UA60L2MmY52Mct21HL8eKfQGhfk-Zlx1N9wMLuTA2KVF7OTp5KDXptUXTdWnYRBbYs5AWrwSQGz_AvbunFHcUXveY3raEfhAkIyx9W1jydU8rUJ1WOezYiCEZjdpLoIh4aEJ_jNiJ4EEdFtKixyXjQd5GCcGr7CfISncWGI98CpxkzLclXxcM_36u7MYqKXfaD-VI4TdAEdmXeKZsJVrl4_hJRZx-qssHT5bD6-uG9GwwkvYXGWK5wVUs8nyVkJmOgNN7ufy0-UHfCHhU3YIKNWjcAOvQKcG91zmnNDfiLfl8vdOFsHtyWNrOASrRaNnnfLQXi0HfJ2iOgR7zRpkYFoUJcOPgE1zCRHxCzKWDYcMQmWioEs2VFN8AfWzg0ANG5sJOddHD7uA1DkcKfV6QSVoopP5pcQ53PXWhMo97Mk_td8nuhjaRb4YuVwm5JL_iuNyjBeekmfEgkEhvwH7pM_jJVSfPQ6_jpFylPTFlQ2O3e8Yj30d9_ao50PHQuhObguA0s3dBl2wQOc3TSMH3JJoXvkQC3IXLgxH9xKtNXLT7DKQPGbZ_Cpmt5mMeK5FqoS2dczPBhjfAsHvyy_dRtCDqT_hexVUHFVHzC_YsSOfUlCr--n5zKc7ppD-MfzTi8n4FjUx3DK838q7xjpa6zLFUHU-pWxVF4jnjeJv3GVDZVVkBUVeXQFCF35cICVBj_cp5it6p1UxWK5DUstwPv8IfISwoHxftrgzR00t5VZ1smgjvi8sGUv6LOQ2PGwwdDq_a82w67MLLtoJUQYAY7kFXBYbBTFjHKNwLe5dECWpGciZ2bY7iALPGjDCiuIeFEZa2PDcu_btdrVo0Uyq_lmx-6PhvMCn_jRNrpOFAUKtUwKrMjNS-CajjgTQgQo-L_)
![logical diagram](https://www.plantuml.com/plantuml/svg/fLNVJzim47xlNs71Gra5qMZvmH13j0aPQ1kWjfkslLHEuxLMtRWuTb51_EzpuhPs3xSCyK2LtFVT-RxlVEGYbrX8DMRe6n_GFcOemX8dE2VeEqy9grJo4SqcME0nQk7-Q22uojAGCowG53ZBDKGowTAk24w9Y7ac3Mtxi1x7Hv-yZ0vz96Z_n4rl2i4VB7O88LCqQZIE3veGwmvfVvIHF4Tr23dzDEBeOtZWdXaodESjBdHNXlCmf9Bu2VQC1YGqfHGqKPBOzWysSinXsftz-Z4aGhUtwoTQyWiQT0f2SiO8Qd6MGjGn98vRH_L6fQ87IUKCROMCwiSjX7Da7j5J1Q5QxUvhhORwPQH7KtIAg8REpWOa8m9BafwVbxIue0q8x-4q5TeepIsf6aIQ_eLmPkvQq-31AjUjyiWp0jB_w51Gn8DLQagcFSqYOeePI8a8erCYPjTpE01SjqoYQ5Rq8MSJU79BvINMrL2GgDmbcXfxU_fdYMHuJ4xHpsOxl6gsTRxAwBqYckXm19besTfGBEdKiZLbCYoqPsgS4B6c2XbZojPWVxaOOxQmrP8gpt3Elo8oZV3CZDkDk5FVMOvzjtGwnJFz_C7wPd3Wc2aN60mORQluHgMF3on3vxre-xPOnhBfyYaiceMNb1U8plVVL4_lwtgUZnOXKp6NM2fhgeEaMEef5h_eCmf_jDkNDzrUrEnUkfovHeUyHbv49ARCYZJlQ4Ng3j2wYoQ2fwelpNo0Ik29netlniC0S5PiidL1xfs91miSUdQlS2dDP3bA5mk5EfBtHwNCHQYCE48HxE0zvtRKPCBe_FOiNbPTpKtKVtdSKonpmxglNKUD_TUcmrs7w11FoV9UMTPJzVTbfxgBgZUtrMVNWRbrePOpuCBiFeYvVbZd-tFqLL_SZBNMU5hgg0Hq1SF-ndALw9DUtNN8rt_NEgLae7acC2BmQ0TIRSstodKr-eLjLkI_geix7JYOtmRZsTiDWDNW460zCCC0PlWTtRnJDE_XAQOC9unikFDmw-s7mucitNzUO6ySWcS0KE5hNmjFt_2Bu8alDSHG0-pCP0M00kRwpd-t5oHBrPXL_W40)

Both diagrams were made with [PlantUML](https://www.plantuml.com/plantuml/uml/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000).

### Using the application
At the moment is not implemented a GUI, but can be tested manually using the console with simple commands or testing using mocha.

#### Manual test
After making the [Deployment](#deployment)
