<!-- @format -->

# Bus Factor Visualizer (Main React Project)

This is the main React + D3.js app for the Bus Factor Visualizer project. Every successful experiment with D3.js and React will be added to the app in this project.

## Description

This project aims to visualize developer contribution, knowledge distribution and the 'bus factor' for software projects.

### What is bus factor?

'Bus factor' or 'truck factor' is colloquially the minimum number of people in an organization or a team whose departure would stall a software project.

### What does this tool have to do with bus factor?

This tool illustrates the bus factor for entire software projects and for indiviudal folders in files as well. The mode of visualization is a tree map where every tile is either a folder or a file, whose size is determined by the metric chosen by the user, such as lines of code.

### Features

- Filter and search projects by
  - author
  - minimum/maximum bus factor
  - file extension
- Zoom in for insight into visualization and statistics about individual folders and files
- Check the bus factor and knowledge distribution over time.

# How to Run (Default Boilerplate Documentation for reference)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Docker

This section shows hows to build and run the app as a Docker container

### Build container (dev version)

The Dockerfile to use to build a container for the BFViz application is named Dockerfile-dev. The container can be built using the following command on command line:

`docker build -t <CONTAINER_NAME>:<VERSION> Dockerfile-dev .`

where CONTAINER_NAME and VERSION can be set as you see fit. For example, we could run

`docker build -t bfviz:2.0 Dockerfile-dev .`

First time builds take a little bit of time, especially if the required base image is not present already.

## Deploy container (dev version)

The dev version of the container utilizes the `npm start` command to run the app in development mode. The Docker container itself can be run by

```
docker run -d -it -p <PORT_TO_EXPOSE_APP_ON_THE_HOST>:3000 --memory="8g" --mount type=bind,source=<PATH_TO_FOLDER_CONTAINING_BUSFACTOR_JSON>,target=/app/src/data
```

There are two important sections in the command above.

There is the -p option which allows you to map port 3000, the port on which the Docker container exposes the BFViz application, to a port of your choosing on the host. In the example below, we have chosen port 8080 on the host for that purpose.

The second option to configure is the folder mount. The application uses the file named busFactor.json in the `/app/src/data` folder in the container. To provide the file to the container, we have a to _mount_ the folder on the host that contains that _busFactor.json_ file to `/app/src/data` on the container.

An example is given below. In this, we choose port 8080 as the port on the host. For the directory mapping, we choose data folder in the src folder, which itself is a subfolder of the current working directory as we used the `pwd` shell command.

```
docker run -d -it -p 8080:3000 --memory="8g" --mount type=bind,source="$(pwd)"/src/data,target=/app/src/data
```

The busFactor.json file itself should just contain the bus factor data for a GitHub repository. The data itself should be in JSON format.