var routes = new XMLHttpRequest();
routes.open('GET', '../json/routes.json', false);
routes.send();

routes = JSON.parse(routes.responseText);

var routesNew = new XMLHttpRequest();
routesNew.open('GET', '../json/cities.json', false);
routesNew.send();

routesNew = JSON.parse(routesNew.responseText);

Vue.component('result', {
    template: `
        <div id="res">
            <p class="result">{{ message }}</p>
        </div>
    `,
    props: ['message']
})

Vue.component('inputCity', {
    template: `
        <div class="dialog">
            <div class="from-city">
                <label for="from">From:</label>
                <input list="cities-from" class="from" v-model="messageFrom" v-on:click="clearFieldFrom">
                <datalist id="cities-from" >
                    <option value="Kharkov"/>
                    <option value="Odessa"/>
                    <option value="Kiev"/>
                    <option value="Dnepropetrovsk"/>
                    <option value="Lvov"/>
                </datalist>
            </div>
            <div class="to-city">
                <label for="to">To:</label>
                <input list="cities-to" class="to" v-model="messageTo" v-on:click="clearFieldTo">
                <datalist id="cities-to">
                    <option value="Kharkov"/>
                    <option value="Odessa"/>
                    <option value="Kiev"/>
                    <option value="Dnepropetrovsk"/>
                    <option value="Lvov"/>
                </datalist>
            </div>
            <div class="search-method">
                <label for="to">Search method:</label>
                <input list="search-method" v-model="messageSearchMethod" v-on:click="clearFieldSearchMethod">
                <datalist id="search-method">
                    <option value="Distance"/>
                    <option value="Price"/>
                    <option value="Time"/>
                </datalist>
            </div>
            <button class="btn" v-on:click="onClick" >Go</button>
            <result 
                v-bind:message="messageResult"       
            ></result>
        </div>
    `,
    data: function () {
        return {
            messageResult: "",
            messageFrom: "",
            messageTo: "",
            messageSearchMethod: ""
        }
    },
    methods: {
        clearFieldFrom: function () {
            this.messageFrom = ""
        },
        clearFieldTo: function () {
            this.messageTo = ""
        },
        clearFieldSearchMethod: function () {
            this.messageSearchMethod = ""
        },
        onClick: function () {
            this.messageResult = getMessage(this.messageFrom, this.messageTo, this.messageSearchMethod)

        },

    }
})

Vue.component('show', {
    template: `
        <div class="routes">
            <table class="tb">
                <caption>Routes</caption>
                <tr>
                    <th class="th-from">From</th>
                    <th class="th-to">To</th>
                    <th>Time start</th>
                    <th>Time end</th>
                    <th>Travel time</th>
                    <th>Distance</th>
                    <th>Price</th>
                </tr>
                <tr
                    is="routes-component"
                    v-for="route in routes"
                    v-bind:route="route"
                >
                </tr>
            </table>
        </div>

`,
    props: ['route'],
    data: function () {
        return {
            routes: routes
        }
    }
})

Vue.component('routes-component', {
    template: `
        <tr>
            <td>{{ route.from }}</td>
            <td>{{ route.to }}</td>
            <td>{{ route.startTime }}</td>
            <td>{{ route.endTime }}</td>
            <td>{{ route.travelTime }}</td>
            <td>{{ route.distance }}</td>
            <td>{{ route.price }}</td>
        </tr>
    `,
    props: ['route']
})

var app = new Vue({
    template: `
        <div>
           <input-city></input-city>
           <show></show>
        </div>
    `,
    el: "#app"
})

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

function getMessage(start, end, searchMethod) {
    try {
        if (start == end) {
            throw true;
        }

        var mapGraph = {};

        if(start != "" && end != "") {

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
                            return;
                    }
                }
            }

            var graph = new Graph(mapGraph);

            var cities = graph.findShortestPath(start, end);
            costsEnd.reverse();
            costsEnd = costsEnd.join(' ');
            if (cities.length > 2) {
                return ("From " + cities.shift() + " to " + cities.pop() + " via: " + cities.shift() + " total: "+ costsEnd);
            } else {
                return ("From " + cities.shift() + " to " + cities.pop() + " total: "+ costsEnd);
            }
        }
    } catch(e) {
        return ("There is no such route");
        console.log("Error " + e.name + ":" + e.messageResult + "\n" + e.stack);
    }
}