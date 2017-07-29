var routes = new XMLHttpRequest();
routes.open('GET', '/get-json', false);
routes.send();

routes = JSON.parse(routes.responseText);

var routesNew = new XMLHttpRequest();
routesNew.open('GET', '/get-cities-json', false);
routesNew.send();

routesNew = JSON.parse(routesNew.responseText);

function getTotal(citiesWay, data) {
    var totalNew = '';
    var price = 0;
    var hours = 0;
    var distance = 0;

    if(citiesWay.length > 2) {
        totalNew = ("From " + citiesWay.shift() + " to " + citiesWay.pop() + " via: " + citiesWay.shift());
    } else {
        totalNew = ("From " + citiesWay.shift() + " to " + citiesWay.pop());
    }

    for(var i = 0; i < data.length; i++) {
        var time = data[i].travelTime.split(":", 1).toString();
        price += data[i].price;
        hours += +time;
        distance += data[i].distance;
    }

    totalNew +=  (". Total: " + distance + " km, " + hours + " hours, " + price + " UAH");
    return totalNew;
}

var costsEnd = [];

var Graph = (function (undefined) {

    var extractKeys = function (obj) {
        var keys = [], key;
        for (key in obj) {
            Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
        }
        return keys;
    }

    var sorter = function (a, b) {
        return parseFloat (a) - parseFloat (b);
    }

    var findPaths = function (map, start, end, infinity) {
        infinity = infinity || Infinity;

        var costs = {},
            open = {'0': [start]},
            predecessors = {},
            keys;

        var addToOpen = function (cost, vertex) {
            var key = "" + cost;
            if (!open[key]) open[key] = [];
            open[key].push(vertex);
        }

        costs[start] = 0;

        while (open) {
            if(!(keys = extractKeys(open)).length) break;

            keys.sort(sorter);

            var key = keys[0],
                bucket = open[key],
                node = bucket.shift(),
                currentCost = parseFloat(key),
                adjacentNodes = map[node] || {};

            if (!bucket.length) delete open[key];

            for (var vertex in adjacentNodes) {
                if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
                    var cost = adjacentNodes[vertex],
                        totalCost = cost + currentCost,
                        vertexCost = costs[vertex];

                    if ((vertexCost === undefined) || (vertexCost > totalCost)) {
                        costs[vertex] = totalCost;
                        addToOpen(totalCost, vertex);
                        predecessors[vertex] = node;
                    }
                }
            }
        }

        if (costs[end] === undefined) {
            return null;
        } else {
            costsEnd.push(costs[end].toString());
            return predecessors;
        }
    }

    var extractShortest = function (predecessors, end) {
        var nodes = [],
            u = end;

        while (u !== undefined) {
            nodes.push(u);
            u = predecessors[u];
        }

        nodes.reverse();
        return nodes;
    }

    var findShortestPath = function (map, nodes) {
        var start = nodes.shift(),
            end,
            predecessors,
            path = [],
            shortest;

        while (nodes.length) {
            end = nodes.shift();
            predecessors = findPaths(map, start, end);
            console.log();
            if (predecessors) {
                shortest = extractShortest(predecessors, end);
                if (nodes.length) {
                    path.push.apply(path, shortest.slice(0, -1));
                } else {
                    return path.concat(shortest);
                }
            } else {
                return null;
            }
            start = end;
        }
    }

    var toArray = function (list, offset) {
        try {
            return Array.prototype.slice.call(list, offset);
        } catch (e) {
            var a = [];
            for (var i = offset || 0, l = list.length; i < l; ++i) {
                a.push(list[i]);
            }
            return a;
        }
    }

    var Graph = function (map) {
        this.map = map;
    }

    Graph.prototype.findShortestPath = function (start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(this.map, start);
        } else if (arguments.length === 2) {
            return findShortestPath(this.map, [start, end]);
        } else {
            return findShortestPath(this.map, toArray(arguments));
        }
    }

    Graph.findShortestPath = function (map, start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(map, start);
        } else if (arguments.length === 3) {
            return findShortestPath(map, [start, end]);
        } else {
            return findShortestPath(map, toArray(arguments, 1));
        }
    }

    return Graph;

})();

function getWay(start, end, searchMethod) {
    try {

        var mapGraph = {};

        if(start != "" && end != "") {
            if (start == end) {
                throw true;
            }
            for(var i = 0; i < routesNew.length; i++) {
                mapGraph[routesNew[i].from] = {};

                for (var j = 0; j < routesNew[i].info.length; j++) {

                    var nodeWeight = routesNew[i].info[j];
                    costsEnd = [];

                    switch (searchMethod.toLowerCase()) {
                        case "distance":
                            costsEnd.push(" km");
                            mapGraph[routesNew[i].from][routesNew[i].info[j].to] = nodeWeight.distance;
                            break;
                        case "price":
                            costsEnd.push(" UAH");
                            mapGraph[routesNew[i].from][routesNew[i].info[j].to] = nodeWeight.price;
                            break;
                        case "time":
                            costsEnd.push(" hours");
                            var time = nodeWeight.travelTime.split(":", 1).toString();
                            var intTime = parseInt(time, 10);
                            mapGraph[routesNew[i].from][routesNew[i].info[j].to] = intTime;
                            break;
                        default:
                            console.log("Input method search!");
                            alert("Input method search!");
                            return;
                    }
                }
            }

            var graph = new Graph(mapGraph);

            var cities = graph.findShortestPath(start, end);
            costsEnd.reverse();
            costsEnd = costsEnd.join(' ');
            var finalPath = [];
            if (cities.length > 2) {
                for (var i = 0; i < routes.length; i++) {
                    if (routes[i].from == cities[0] && routes[i].to == cities[1] ||
                        routes[i].from == cities[1] && routes[i].to == cities[2]) {
                        finalPath.push(routes[i]);
                    }
                }
                return {finalPath, cities};
            } else {

                for (var i = 0; i < routes.length; i++) {
                    if (routes[i].from == cities[0] && routes[i].to == cities[1]) {
                        finalPath.push(routes[i]);
                    }
                }
                return {finalPath, cities};
            }
        } else {
            alert("No data");
            return;
        }

    } catch(e) {
        console.log("There is no such route");
        alert("There is no such route");
    }
}