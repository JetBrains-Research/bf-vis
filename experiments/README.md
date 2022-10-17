# Experiments with visualization libraries

This folder contains the experiments made with visualization libraries. 

## Organization
They are organized as *`library_name-`*`experiments` e.g. *d3-experiments* for tests and examples using the D3.js library

## How to run
 Most of the examples can be tested out by directly opening the *.html files in a web browser. D3.js examples, however require to be served through an http server. Due to this reason, they are part ofa node.js project with the http-server module

 This can be done by running

 `npm install` 
 
 in the *d3-experiments* folder and then navigating to that folder in the terminal and running
 
 `npx http-server ./`

 The example can then be accessed via the URL shown in the terminal and navigating to one of the many HTML files.