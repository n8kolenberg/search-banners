<template>
    <div class="container">
        <form>
            <div class="row">
                <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                    <h2>Tajawal Search Banners - Framework</h2>
                    <hr>
                    <div class="form-group">
                        <label for="origin">From</label>
                        <!-- v-model="userData.email" is the same as :value="userData.email" + @input="userData.email = $event.target.value"-->
                        <input
                                type="text"
                                id="origin"
                                class="form-control"
                                v-model="userData.origin"
                                @input = "inputListen('origin')"
                                >
                                <div class="suggestions" style="border: 1px solid red" v-if="airports">
                                     <ul>
                                        <li v-for="airport in airports"><span v-if="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span></li>
                                    </ul>
                                </div>
                    </div>
                    <div class="form-group">
                        <label for="destination">To</label>
                        <input
                                type="text"
                                id="destination"
                                class="form-control"
                                v-model="userData.destination"
                                @input="inputListen('destination')">
                                <!--.lazy only updates the userData.password when element gets out of focus / user clicks on another element-->
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 from-group">
                    <label for="priority">Calendar</label>
                    <select
                            id="priority"
                            class="form-control"
                            v-model="selectedPriority">
                            <option disabled value="">Please select an option</option>
                        <option v-for="priority in priorities">{{ priority }}</option>
                    </select>
                </div>
            </div>
            <hr>

        </form>
        <hr>
        <!--Resulting data and request URL -->
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h4>Your Data</h4>
                    </div>
                    <div class="panel-body">
                        <p>Origin: {{userData.origin}}</p>
                        <p>Destination: {{userData.destination}}</p>
                        <p>User Input: {{userData.input}}</p>

                        <hr>
                        <p>Airports: </p>
                        <ul>
                            <li v-for="airport in airports"><span v-if="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span></li>
                        </ul>
            
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios' 
    export default {
        data() {
            return {
                userData: {
                    origin: "",
                    destination: "",
                    input: ""
                },
                airports: [],
                IATA: []
            }
        },
            methods: {
                inputListen(location) {
                    this.clearAirports();
                    this.userData[location].length >= 3 ? this.getAirports(location) : console.log("Filled in " + location + " " + this.userData[location].length);
                },
                clearAirports() {
                    this.airports = [];
                },

                getAirports(input) {
                    input == "origin" ? this.userData.input = this.userData.origin : this.userData.input = this.userData.destination
                    axios({
                        url: "https://www.us.despegar.com/suggestions?grouped=true&locale=en_US&profile=sbox-flights&hint="+this.userData.input,
                        method: "GET",                                            
                    }).then( //IATA - City - Country
                        (resp) => {
                            this.clearAirports();
                            let response = resp.data.items;
                            console.log(response);
                            let airports = response[0].items;
                            let cities = response[1].items
                            console.log("Airports: ");
                            console.log(airports);
                            console.log("==================");
                            console.log("Cities: ")
                            console.log(cities);
                            // data.forEach()

                            airports.forEach((airport) => {
                                this.airports.push(airport);
                            });
                        });
                }
            },

    }
</script>

<style>

</style>
