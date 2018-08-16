<template>
    <div class="container pt-3">
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
                                @input = "getAirports('origin')"
                                @keydown.down="onArrowDown"
                                @keydown.up="onArrowUp"
                                @keydown.enter="onEnter('origin')"
                                @focus="destinationSearchResults = false"
                                >
                        <div class="autocomplete" v-if="originSearchResults">
                            <ul v-show="originSearchResults" class="autocomplete-results" style="overflow: hidden;">
                                <li v-for="(airport, i) in airports" @click="chooseAirport(airport, 'origin')" class="autocomplete-result" :class="{'is-active' : i === arrowCounter }">
                                    <span v-show="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span>
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
                                @input = "getAirports('destination')"
                                @keydown.down="onArrowDown"
                                @keydown.up="onArrowUp"
                                @keydown.enter="onEnter('dest')"
                                @focus="originSearchResults = false"
                                >
                        <div class="autocomplete" v-if="destSearchResults">
                            <ul v-show="destSearchResults" class="autocomplete-results" style="overflow: hidden;">
                                <li v-for="(airport, i) in airports" @click="chooseAirport(airport, 'destination')" class="autocomplete-result" :class="{'is-active' : i === arrowCounter }">
                                    <span v-show="airport.target.iata">{{airport.target.iata}} - </span> <span v-html="airport.display">{{airport.highlight}}</span>
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

// import Calendar from "vue2-slot-calendar"

    export default {
        data() {
            return {
                userData: {
                    origin: "",
                    destination: "",
                    input: ""
                },
                originSearchResults: false,
                destSearchResults: false,
                airports: [],
                originAirport: "",
                destAirport: "",
                originIATA: "",
                destIATA: "",
                tempIATA: "",
                arrowCounter: -1

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
            //Clears the list of airports
            clearAirports() {
                this.airports = [];
            },

            //Does the Ajax request to get the airports based on user input
            getAirports(originOrDest) {
                if(this.userData[originOrDest].length >= 3) {
                    //Depending on whether the user used origin or dest input, we fill in the userData with that data for the axios call
                    originOrDest == "origin" ? this.userData.input = this.userData.origin : this.userData.input = this.userData.destination
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
                            console.log("======================");

                            //Adding the airports to the airports array
                            airports.forEach((airport) => {
                                this.airports.push(airport);
                            });
                            
                            //Resetting these values to show the correct drop down choices for the airports underneath the inputs
                            if(originOrDest == "origin") {
                                this.originSearchResults = true;
                                this.destSearchResults = false;
                            } else {
                                this.originSearchResults = false;
                                this.destSearchResults = true;
                            }
                        });
                }
                
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
                        //Resetting the originSearchResults to not display the search results
                        this.originSearchResults = false;
                    } else {
                        this.destIATA = this.tempIATA;
                        this.userData.destination = airport.display;
                        this.clearAirports();
                        //Resetting the destSearchResults to not display the search results
                        this.destSearchResults = false;
                    }
                //If it doesn't have a IATA value, it usually has a code value
                } else if (airport.target.code) {
                    //and depending on whether the user did an origin / dest search, we add the selected IATA to the respective data property
                    loc == "origin" ? this.originIATA = airport.target.code : this.destIATA = airport.target.code;
                    //and depending on whether the user did an origin / dest search, we add the selected IATA to the respective data property 
                    //and set the input to have the value of the chosen airport - then we clear the list of airports
                    if(loc == "origin") {
                        this.originIATA = airport.target.code;
                        this.userData.origin = airport.display;
                        this.clearAirports();
                        //Resetting the originSearchResults to not display the search results
                        this.originSearchResults = false;
                    } else {
                        this.destIATA = airport.target.code;
                        this.userData.destination = airport.display;
                        this.clearAirports();
                        //Resetting the destSearchResults to not display the search results
                        this.destSearchResults = false;
                    }

                } 
        },//End chooseAirport
        /**The following methods will take care of keyboard inputs once the search results are shown */
        onArrowDown() {
            this.arrowCounter >= this.airports.length - 1 ? this.arrowCounter = 0 : this.arrowCounter += 1; 

        },
        onArrowUp() {
            if(this.arrowCounter >= 0) {
                this.arrowCounter--;
                if(this.arrowCounter < 0) {
                    this.arrowCounter = this.airports.length - 1;
                }
            }
            
        },
        onEnter(originOrDest) {
            //When the user presses enter, we check if they filled in the origin or destination input first
            if (originOrDest === "origin") {
                //Then we select the result based on the key of the array that they are at
                this.chooseAirport(this.airports[this.arrowCounter], 'origin');
            } else {
                // this.userData.destination = this.airports[this.arrowCounter];
                this.chooseAirport(this.airports[this.arrowCounter], 'destination');
            }
            this.arrowCounter = -1;
        }
    } //End methods
}
</script>

<style>


  .autocomplete {
    position: relative;
    width: 300px;
  }

  .autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #eeeeee;
    height: 100%;
    overflow: auto;
  }

  .autocomplete-result {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
  }

  .autocomplete-result:hover {
    background-color: #e64129;
    color: white;
  }

.autocomplete-result.is-active,
  .autocomplete-result:hover {
    background-color: #e64129;
    color: white;
  }
</style>