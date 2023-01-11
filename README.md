# DS2022_30441_Keresztes_Beata_Assignment_3

## Deployment steps on Azure

1. Navigate to the project root directory, which contains 4 folders: backend, frontend, mysql and rabbitmq.

2. Build the images and push them to the container registry inside the created resource group:

3. 2.1. Create the container group with the databases and the backend application:
> docker-compose up --build -d

2.2. Verify the running containers:
> docker ps

2.3. Stop the containers running locally:
> docker-compose down

2.4. Push the generated containers, each having 1 image, to the container registry on Azure:
> docker context use acicontext
> 
> docker compose up -d

2.5. Verify the running containers on Azure (inside the acicontext) and note thier public IP address:
> docker ps

3. Copy the returned IP address and paste it in the frontend/Dockerfile, by setting the value of the environment variable: 'REACT_APP_HOST_IP_ADDRESS':
Example:
> ENV REACT_APP_HOST_IP_ADDRESS=20.218.202.217

4. Build the image for the react application and push the frontend container on the container registry:

4.1. Create the container group with the react application:
> cd frontend
>
> docker context use default
>
> docker-compose up --build -d

4.2. Verify the running container:
> docker ps

4.3. Stop the container running locally:
> docker-compose down

4.4. Push the generated container, with only 1 image, to the container registry on Azure:
> docker context use acicontext
>
> docker compose up -d

4.5. Verify the running containers on Azure (inside the acicontext) and note its public IP address:
docker ps

5. Build the image for the chat service and the proxy server:

> cd chat-service
>
> docker context use default
>
> docker-compose up --build -d

6. Open a browser and enter the poreviously obtained url of the frontend application. The application should start successfully allowing the user to navigate to the login or register page.

7. Start a local sensor simulator app:
7.1. Configure the host of the rabbitmq server and the device's id in the configuration file:
> cd smart_energy_device_simulator/src/main/resources/application.properties

7.2. Set the following properties: 
Example:
> rabbitmqHost=20.218.202.217
> 
> deviceId=6848b103-4718-43c3-b790-cb2c6e2c367c

7.3. Generate the application jar file:
> cd smart_energy_device_simulator
> 
> mvn clean package

7.4. Run the jar file:
> java -jar target/smart_energy_device_simulator-1.0-SNAPSHOT-jar-with-dependencies.jar

8. Log in to the application from the browser, using the credentials of the user which owns the device with the given id and enable the notification. Observe that the notifications arrive to the client stating that the energy consumption of the given device has exceeded a specific threshold.

9. Finally, stop the containers running on the cloud (both for the backend and the frontend):
> docker context use acicontext
> 
> docker compose down
> 
> docker cd frontend
> 
> docker compose down
