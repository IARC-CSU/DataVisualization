# IARC/CSU github Dataviz webpage

Welcome to the CSU dataviz gallery, a webpage listing all graphics and datavisualization made by the [Cancer Surveillance Unit][https://www.iarc.who.int/branches-csu]. 

The repository is maintained by Mathieu Laversanne and Frédéric LAM.
Github.io url is https://iarc-csu.github.io/DataVisualization. 

Please ask CSU team in case you want to contribute or have any enquiry. 

Each project below has it's own context, using plain html/javascript/css sometimes, VueJS other time, and of course d3js library most of the time. So the purpose of subfolders is to isolate each peace of interactive graphics. 

## Errata

This repository presents multiple advantes but also disavantages to be composed of many subfolders. Here is another repository where a more advanced VueJS(3) and d3JS(7) version cohabitate.

https://github.com/fredericlam/CervicalCancer

### Windows way

ws is [Node.js](https://www.npmjs.com/package/ws) package used to serve a simplpe folder.

```
ws -p 8092
```

### Python way

See official documentation into Python website: https://docs.python.org/3/library/http.server.html.

```
python3 -m SimpleHTTPServer 8082  // (Python 2.7.10)
```
or

```
python3 -m http.server 8095
python3 -m http.server 8095 --bind 10.50.1.111
```