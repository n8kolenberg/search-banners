
new Vue({
    el: "#app",
    data: {
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

    },
    computed: {
        //This will filter out the airport based on what the user types in
        filterAirport() {
            return this.airports.filter((airport) => {
                return airport.highlight.toLowerCase().match(this.userData.input.toLowerCase());
            });
        },
        allFieldsFilled() {
            //Unless all required fields are filled in, user can't click on search button as this is dynamically linked to search button
            if (this.originIATA && this.destIATA) {
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
            if (this.userData[originOrDest].length >= 3) {
                //Depending on whether the user used origin or dest input, we fill in the userData with that data for the axios call
                originOrDest == "origin" ? this.userData.input = this.userData.origin : this.userData.input = this.userData.destination
                axios({
                    url: "https://www.us.despegar.com/suggestions?grouped=true&locale=en_US&profile=sbox-flights&hint=" + this.userData.input,
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
                        if (originOrDest == "origin") {
                            this.originSearchResults = true;
                            this.destSearchResults = false;
                        } else {
                            this.originSearchResults = false;
                            this.destSearchResults = true;
                        }
                    });
            }

        }, //End getAirports

        //This function is triggered when user chooses airport from the autocomplete dropdown form
        chooseAirport(airport, loc) {
            console.log("clicked the following airport:");
            airport.target.iata ? console.log(airport.target.iata) : console.log(airport.target.code);
            //Store the target.iata or target.code in a temp variable called tempIATA
            airport.target.iata ? this.tempIATA = airport.target.iata : this.tempIATA = airport.target.code;
            //If the airport.target object has an iata value / code
            if (this.tempIATA) {
                //and depending on whether the user did an origin / dest search, we add the selected IATA to the respective data property 
                //and set the input to have the value of the chosen airport - then we clear the list of airports
                if (loc == "origin") {
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
                if (loc == "origin") {
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
        }, //End chooseAirport
        /**The following methods will take care of keyboard inputs once the search results are shown */
        onArrowDown() {
            this.arrowCounter >= this.airports.length - 1 ? this.arrowCounter = 0 : this.arrowCounter += 1;

        },
        onArrowUp() {
            if (this.arrowCounter >= 0) {
                this.arrowCounter--;
                if (this.arrowCounter < 0) {
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
            const now = new Date();
            //Counting 7 days on top of the current date in milliseconds
            const later = new Date(now.getTime() + 604800000)
            console.log(now.toLocaleDateString());
            console.log(later.toLocaleDateString());
            
            /**Creating the final search url that we'll redirect users to */
            //The url to search on tajawal needs a 0 in front of the month and getMonth starts counting at 0 so have to add 1 after getMonth()
            let from = now.getFullYear() + '-0' + (now.getMonth() + 1) + '-' + now.getDate();
            let to = later.getFullYear() + '-0' + (later.getMonth() + 1) + '-' + (later.getDate());
            let searchUrl = `https://www.tajawal.ae/en/flights/${this.originIATA}-${this.destIATA}/${from}/${to}/Economy/1Adult`;
            console.log('Search URL: ');
            console.log(searchUrl);
            window.open(searchUrl, '_blank');
        }
    } //End methods
})