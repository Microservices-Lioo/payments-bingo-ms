# PAYEMNETS MS

## Dev

1. Clonar el repositorio
2. Instalar las dependencias con `npm install`
3. Crear el archivo `.env` basado en el archivo `.env.example`
4. Levantar el servidor de nast
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
5. Levantar el proyecto con `npm run start:dev`

## NATS

```
docker run -d --name nats-v -p 4222:4222 -p 8222:8222 nats
```

## Prod

1. Clonar el repositorio
2. Instalar las dependencias con `npm install`
3. Crear el archivo `.env` basado en el archivo `.env.example`
4. Levantar el servidor de nast
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
5. Ejecutar el comando para levantar la imagen de la aplicación en docker
```
docker build -f dockerfile.prod -t payments-ms .
```