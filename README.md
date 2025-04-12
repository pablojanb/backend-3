# Proyecto de Gestión de Adopciones, Usuarios y Mascotas con Node.js, Express y MongoDB

## Descripción

Este proyecto en Node.js consiste en un sistema de gestión de adopciones de mascotas, implementado con **Node.js**, **Express**, **MongoDB**, **Mongoose** y **BCrypt**. La API está desarrollada siguiendo buenas prácticas de desarrollo y pruebas, implementando **Supertest**, **Mocha** y **Chai** para asegurar la calidad del código mediante tests automatizados. Se utiliza **Faker** para generar datos ficticios en pruebas, mientras que **Swagger** permite documentar de forma clara y visual los distintos endpoints de la API. Además, el entorno de desarrollo y despliegue se optimiza mediante la creación de imágenes con Docker, garantizando portabilidad y escalabilidad del sistema.

## DockerHub

`https://hub.docker.com/r/pablojanb/backend-3`

## Tecnologías

- **Node.js:** Para la ejecución del servidor.
- **Express:** Para la creación de APIs RESTful.
- **MongoDB:** Para la persistencia de datos.
- **Mongoose:** Para interactuar con MongoDB desde el servidor.
- **Supertest:** Testeo de endpoints HTTP.
- **Mocha:** Ejecución y estructuración de tests.
- **Chai:** Libreria de aserciones para tests.
- **BCrypt:** Para manejo de contraseñas.
- **Multer:** Para envio de archivos.
- **Winston:** Librería de logging para manejar errores, debuggear, etc.
- **Swagger-ui-express:** Para la creación de una interfaz web con la documentación.
- **Docker:** Para crear, empaquetar y ejecutar la aplicacion en contenedores.

## Instalación

Para ejecutar esta aplicación en tu entorno local, sigue los siguientes pasos:

1. **Clona el repositorio:**

`git clone https://github.com/pablojanb/backend-3.git`

2. **Navega a la carpeta del proyecto:**

`cd backend-3`

3. **Instala las dependencias:**

`npm install`

4. **Configura tus variables de entorno:**

`PORT = 9090`
`MONGO = mongodb://localhost:27017/mydb?retryWrites=true&w=majority`

5. **Inicia el servidor de desarrollo:**

`npm run dev`