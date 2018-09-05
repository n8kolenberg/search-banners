<template>
    <div class="container" id="search-container">   
        <form id="search-form">
            <div class="row">
                <div class="col-xs-3">
                    <!-- Origin Input -->
                    <div class="form-group" id="origin-input">
                        <label for="origin">Origin</label>
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
                   <div class="form-group" id="destination-input" >
                        <label for="destination">Destination</label>
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
                </div> <!-- End div with class col-3 -->
            </div>

            <!-- Calendar UI Elements-->
            <div class="row">
                <div class="col-xs-12 from-group text-center pagination-centered" id="date-picker">
                     <div class="block">
                        <el-date-picker
                        v-model="selectedDate"
                        type="daterange"
                        start-placeholder="From"
                        end-placeholder="Until"
                        size="mini"
                        align="center"
                        id="el-date-picker">
                        </el-date-picker>
                    </div>
                    
                </div>
            </div>

            <div class="row">
                <div class="col-xs-12 from-group text-center">
                    <button id="searchBtn" class="btn btn-info btn-lg form-group" @click.prevent="searchTajawal" :disabled="allFieldsFilled">Search</button>
                </div>
            </div>

        </form>

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
                arrowCounter: -1,
                //DatePicker data in form of array once user selects dates
                selectedDate: '',

                };//End return

            },// End data()
        computed: {
            //This will filter out the airport based on what the user types in
            filterAirport() {
                return this.airports.filter((airport) => {
                    return airport.highlight.toLowerCase().match(this.userData.input.toLowerCase());
                });
            },
            allFieldsFilled() {
                //Unless all required fields are filled in, user can't click on search button as this is dynamically linked to search button
                if(this.originIATA && this.destIATA && this.selectedDate) {
                    return false;
                } else {
                    return true;
                }
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
                        this.originIATA = this.tempIATA.toLowerCase();
                        this.userData.origin = airport.display;
                        this.clearAirports();
                        //Resetting the originSearchResults to not display the search results
                        this.originSearchResults = false;
                    } else {
                        this.destIATA = this.tempIATA.toLowerCase();
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
                } //End if else clause
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
        },

        searchTajawal() {
            if(this.selectedDate) {
            /**Creating the final search url that we'll redirect users to */
            //The url to search on tajawal needs a 0 in front of the month and getMonth starts counting at 0 so have to add 1 after getMonth()
            let from = this.selectedDate[0].getFullYear() + '-0' + (this.selectedDate[0].getMonth()+1) + '-' + this.selectedDate[0].getDate();
            let to = this.selectedDate[1].getFullYear() + '-0' + (this.selectedDate[1].getMonth()+1) + '-' + this.selectedDate[1].getDate();
            let searchUrl = `https://www.tajawal.ae/en/flights/${this.originIATA}-${this.destIATA}/${from}/${to}/Economy/1Adult`;
            console.log('Search URL: ');
            console.log(searchUrl);
            window.open(searchUrl, '_blank');
            }
            

        }
    } //End methods
}
</script>

<style>

    label {
        color: #feffff;
        font-size: 1.15em;
    }

    #search-container {
        background-image: url('https://demo.criteo.com/support/nkolenberg/searchbanners/Search-Banners-300x600.jpg');
        background-repeat: no-repeat;
        height: 600px;
        width: 300px;
        margin: 0px;
    }

    #search-form {
        position: absolute;
        top: 150px;

    }

    #origin-input {
        width: 270px;
        position: relative;
    }

    #destination-input {
        width: 270px;
        position: relative;
    }

    #searchBtn {
        margin-top: 20px;
        background-color: #e64129;
        width: 125px;
        height: 35px;
    }

    #date-picker {
        margin-top: 20px;
    }

    #searchBtn {
        border-radius: 5px;
    }

.el-date-editor--daterange.el-input, .el-date-editor--daterange.el-input__inner, .el-date-editor--timerange.el-input, .el-date-editor--timerange.el-input__inner {
    width: 270px;
}

  .autocomplete {
    position: absolute;
    z-index: 99;
    top: 100%;
    left: -15px;
    right: 0;
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
    background-color: whitesmoke;
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
  .el-picker-panel {
      color: #626060;
  }

  .el-date-table td.end-date span,
  .el-date-table td.start-date span {
      background-color: #3665ac;
  }


</style>