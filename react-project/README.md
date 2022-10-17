# Bus Factor Visualizer (Main React Project)
This is the main React + D3.js app for the Bus Factor Visualizer project. Every successful experiment with D3.js and React will be added to the app in this project.

## Description
This project aims to visualize developer contribution, knowledge distribution and the 'bus factor' for software projects.

### What is bus factor?
'Bus factor' or 'truck factor' is colloquially the minimum number of people in an organization or a team whose departure would stall a software project.

### What does this tool have to do with bus factor?
This tool illustrates the bus factor for entire software projects and for indiviudal folders in files as well. The mode of visualization is a tree map where every tile is either a folder or a file, whose size is determined by the metric chosen by the user, such as lines of code.

### Features
+ Filter and search projects by 
  - author
  - minimum/maximum bus factor
  - file extension
+ Zoom in for insight into visualization and statistics about individual folders and files
+ Check the bus factor and knowledge distribution over time.


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
