<template>
    <div class="container">
        <form>
            <div class="row">
                <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
                    <h2>Tajawal Search Banners - Framework</h2>
                    <hr>
                    <!-- Origin Input -->
                    <div class="form-group">
                        <label for="origin">From</label>
                        <input
                                type="text"
                                id="origin"
                                class="form-control"
                                v-model="userData.origin"
                                @input = "inputListen('origin')"
                                >
                        <div class="suggestions" style="border: 1px solid red" v-if="originSearch">
                                <ul>
                                <li v-for="airport in airports" @click="chooseAirport(airport, 'origin')">
                                    <span v-if="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!-- Destination Input -->
                    <div class="form-group">
                        <label for="destination">To</label>
                        <input
                                type="text"
                                id="destination"
                                class="form-control"
                                v-model="userData.destination"
                                @input="inputListen('destination')"
                                >
                        <div class="suggestions" style="border: 1px solid red" v-if="destSearch">
                                <ul>
                                <li v-for="airport in airports" @click="chooseAirport(airport, 'destination')">
                                    <span v-if="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar -->
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
                        <h4>Airports: </h4>
                        <ul>
                            <li v-for="airport in filterAirport" >
                                <span v-if="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span>
                            </li>
                        </ul>

                        <hr>
                        <h4> Chosen airports </h4>
                        <p>Origin: {{originIATA}}</p>
                        <p>Destination: {{destIATA}}</p>
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
                originSearch: false,
                destSearch: false,
                airports: [],
                originAirport: "",
                destAirport: "",
                originIATA: "",
                destIATA: "",
                tempIATA: ""

            }
        },
        computed: {
            //This will filter out the airport based on what the user types in
            filterAirport() {
                return this.airports.filter((airport) => {
                    return airport.highlight.toLowerCase().match(this.userData.input.toLowerCase());
                });
            }
        },

        methods: {
            //Listens to user input and calls the getAirports method to call Ajax request once the user types in 3 characters or more
            inputListen(location) {
                this.userData[location].length >= 3 ? this.getAirports(location) : console.log("Filled in " + location + " " + this.userData[location].length);
            },
            //Clears the list of airports
            clearAirports() {
                this.airports = [];
            },

            //Does the Ajax request to get the airports based on user input
            getAirports(input) {
                input == "origin" ? this.userData.input = this.userData.origin : this.userData.input = this.userData.destination
                axios({
                    url: "https://www.us.despegar.com/suggestions?grouped=true&locale=en_US&profile=sbox-flights&hint="+this.userData.input,
                    method: "GET",                                            
                }).then( //IATA - City - Country
                    (resp) => {
                        this.clearAirports()
                        let response = resp.data.items;
                        // console.log(response);
                        let airports = response[0].items;
                        let cities = response[1].items
                        console.log("Airports: ");
                        console.log(airports);
                        console.log("==================");
                        // console.log("Cities: ")
                        // console.log(cities);
                        airports.forEach((airport) => {
                            this.airports.push(airport);
                        });
                        
                        //Resetting these values to show the correct drop down choices for the airports underneath the inputs
                        if(input == "origin") {
                            this.originSearch = true;
                            this.destSearch = false;
                        } else {
                            this.originSearch = false;
                            this.destSearch = true;
                        }

                    });
            },

            chooseAirport(airport, loc) {
                console.log("clicked the following airport:");
                airport.target.iata ? console.log(airport.target.iata) : console.log(airport.target.code);
                //Store the target.iata or target.code in a temp variable called tempIATA
                airport.target.iata ? this.tempIATA = airport.target.iata : this.tempIATA = airport.target.code;
                //If the airport.target object has an iata value / code
                if(this.tempIATA) {
                    //and depending on whether the user did an origin / dest search, we add the selected IATA to the respective data property 
                    //and set the input to have the value of the chosen airport - then we clear the list of airports
                    if(loc == "origin") {
                        this.originIATA = this.tempIATA;
                        this.userData.origin = airport.display;
                        this.clearAirports();
                        //Resetting the originSearch to not display the search results
                        this.originSearch = false;
                    } else {
                        this.destIATA = this.tempIATA;
                        this.userData.destination = airport.display;
                        this.clearAirports();
                        //Resetting the destSearch to not display the search results
                        this.destSearch = false;
                    }
                //If it doesn't have a IATA value, it usually has a code value
                } else if (airport.target.code) {
                    //and depending on whether the user did an origin / dest search, we add the selected IATA to the respective data property
                    loc == "origin" ? this.originIATA = airport.target.code : this.destIATA = airport.target.code;

                }
                


            }
        },
        

    }
</script>

<style>

</style>
