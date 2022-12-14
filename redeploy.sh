#!/bin/sh

echo "Stopping and removing the back-end container"
docker stop backend_server
docker rm backend_server
echo "Removing the image for the back-end container"
docker image rm tomcat
echo "Removing the volume for the back-end container"
docker volume rm tomcat

echo "Stopping and removing the front-end container"
docker stop frontend_server
docker rm frontend_server
echo "Removing the image for the front-end container"
docker image rm react

echo "Stopping and removing the MySql container"
docker stop mysql_server
docker rm mysql_server

docker-compose up --build -d