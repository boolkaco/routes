Vue.component('result', {
    template: `
        <div>
            <table class="tb-routes-travel">
                <caption>Travel routes</caption>
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
                    v-for="route in message"
                    v-bind:route="route"
                >
                </tr>
            </table>
            <p class="result">{{total}}</p>
        </div>
    `,
    props: ['message', 'total']
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
                </datalist>
            </div>
            <div class="to-city">
                <label for="to">To:</label>
                <input list="cities-to" class="to" v-model="messageTo" v-on:click="clearFieldTo">
                <datalist id="cities-to">
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
            this.messageResult = getWay(this.messageFrom, this.messageTo, this.messageSearchMethod)
            this.$emit('message-edit', this.messageResult)
        },

    }
})

Vue.component('show', {
    template: `
        <div class="routes">
            <table class="tb-all-routes">
                <caption>All routes</caption>
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
           <input-city @message-edit="messageShow"></input-city>
           <result v-bind:message="this.messageRoute" v-bind:total="this.total"></result>
           <!--<div>{{total}}</div>-->
           <show></show>
        </div>
    `,
    el: "#app",
    data: {
        messageRoute: '',
        cities: '',
        total: ''
    },
    methods: {
        messageShow: function (message) {
            this.messageRoute = message.finalPath
            this.cities = message.cities
            this.total = getTotal(this.cities, this.messageRoute)
        }
    }
})