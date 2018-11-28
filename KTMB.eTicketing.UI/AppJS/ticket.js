(function () {
    var app = angular.module('ticket', []);

    app.controller('TicketController', ["$scope", "$http", 'growl', '$window', 'apiURL', '$rootScope', '$location', '$filter', '$cookies', 'baseURL', function ($scope, $http, growl, $window, apiURL, $rootScope, $location, $filter, $cookies, baseURL) {
        console.log("TicketController logged on.");

        $http.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        $http.defaults.headers.post['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE, OPTIONS';
        $http.defaults.headers.post['Access-Control-Allow-Headers'] = 'Origin, Content-Type, X-Auth-Token';


        $scope.journey = {};
        $scope.passenger = {};
        $scope.passenger.adult = [];
        $scope.passenger.child = [];
        $scope.selectedTrip = [];
        $scope.selectedSeat = {};
        $scope.readyToProceed = false;
        $scope.selectedInit = {};
        $scope.currentSeatSelection = [];
        $scope.AdultPriceBreakdown = [];
        $scope.ChildPriceBreakdown = [];



        $scope.getONDName = function getONDName(ondlist, origincode, destinationcode) {
            var ondName = {};
            angular.forEach(ondlist, function (ond) {
                if (ond.CODE.toString() === origincode.toString())
                    ondName.OriginName = ond.NAME;

                if (ond.CODE.toString() === destinationcode.toString())
                    ondName.DestinationName = ond.NAME;

                $scope.ONDName = ondName;
            });
        }


        $scope.reCaptcha = function () {

            var myresult = grecaptcha.getResponse(widgetId1);
            myresult = 'asdsdasdasdasdasdasdasd';
            console.log("recaptcha.");
            //var returnVal = reCaptcha(myresult);
            var captchadata = {
                response: myresult
            };
            console.log("recaptcha2.");
            $http({
                method: 'POST',
                url: apiURL + '/api/VERIFYCAPTCHA',
                data: JSON.stringify(captchadata),
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).then(function onSuccess(response) {
                alert(response.data);
                growl.info(response.data, { title: 'Info' });
                return response.data;
            }).catch(function onError(response) {
                alert(response.data);
                growl.error(response.statusText, {
                    title: 'ERROR!'
                });
            });

            alert("yus");

        };


        $scope.isreturn = '0';

        $scope.searchTrain = function (journey, isreturn) {
           
            //var myresult = grecaptcha.getResponse(widgetId1);
            //myresult = 'asdsdasdasdasdasdasdasd';
            //console.log("recaptcha.");
            ////var returnVal = reCaptcha(myresult);
            //var captchadata = {
            //    response: myresult
            //};
            //console.log("recaptcha2.");
            //$http({
            //    method: 'POST',
            //    url: apiURL + '/api/VERIFYCAPTCHA',
            //    data: JSON.stringify(captchadata),
            //    headers: { 'Content-Type': 'application/json; charset=utf-8' }
            //}).then(function onSuccess(response) {
            //    alert(response.data);
            //    growl.info(response.data, { title: 'Info' });
            //    return response.data;
            //}).catch(function onError(response) {
            //    alert(response.data);
            //    growl.error(response.statusText, { title: 'ERROR!' });
            //});
            
            
                    //'Access-Control-Allow-Origin': '*',
                    //'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
                    //'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'





            console.log("TicketController.searchTrain triggered.");
            $scope.checkQueue();
            delete sessionStorage.passengerInfo;
            console.log("journey" + journey);

            var adultCnt = journey.noadult == undefined ? 0 : Number(journey.noadult);
            var childCnt = journey.nochild == undefined ? 0 : Number(journey.nochild);
            var totalTicket = adultCnt + childCnt;

            var data = {
                ispublic: true
            };

            $http({
                method: 'POST',
                url: apiURL + '/api/GETPARAMETER',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                // console.log("GETPARAMETER" + response.data);

                angular.forEach(response.data.paramList, function (parameter) {
                    if (parameter.Name == 'LimitTransUser_User') {
                        if (totalTicket <= Number(parameter.Value)) {
                            var originDay = journey.departuredate.getDate();
                            var originMonth = (journey.departuredate.getMonth() + 1);
                            originDay = originDay.toString().length != 2 ? '0' + originDay : originDay;
                            originMonth = originMonth.toString().length != 2 ? '0' + originMonth : originMonth;
                            var originDate = originDay + '/' + originMonth + '/' + journey.departuredate.getFullYear();

                            var returnDate = null;
                            if (journey.returndate != undefined) {
                                var returnDay = journey.returndate.getDate();
                                var returnMonth = (journey.returndate.getMonth() + 1);
                                returnDay = returnDay.toString().length != 2 ? '0' + returnDay : returnDay;
                                returnMonth = returnMonth.toString().length != 2 ? '0' + returnMonth : returnMonth;
                                var returnDate = returnDay + '/' + returnMonth + '/' + journey.returndate.getFullYear();
                            }

                            returnDate = returnDate == null ? 'undefined' : returnDate;
                            var path = baseURL + '/ticket/select' +
                                '?origin=' + journey.origin +
                                '&destination=' + journey.destination +
                                '&odate=' + originDate +
                                '&oth=' + journey.departureth +
                                '&rdate=' + returnDate +
                                '&rth=' + journey.returnth +
                                '&adult=' + (journey.noadult == undefined ? "0" : journey.noadult) +
                                '&child=' + (journey.nochild == undefined ? "0" : journey.nochild) +
                                '&isreturn=' + isreturn +
                                '&pcode=' + journey.promocode;
                            // console.log(path);
                            $window.location.href = path;
                        }
                        else {
                            growl.info('You can only purchase maximum ' + parameter.Value + ' ticket(s) in single transaction', { title: 'WE ARE SORRY...', ttl: 10000 });
                        }
                    }
                });
            }).catch(function onError(response) {
                console.log(response);
                growl.error(response.statusText, { title: 'ERROR!' });
            });
        };

        $scope.refreshMeDelete = function () {
            var res = sessionStorage.getItem("refreshMe");
            if (res === "NaN") {
                sessionStorage.refreshMe = 0;
            }
            delete sessionStorage.refreshMe;
        };

        $scope.refreshMe = function() {
            var res = sessionStorage.getItem("refreshMe");
            if (res === "NaN") {
                sessionStorage.refreshMe = 0;
                }

            var refreshCnt = sessionStorage.refreshMe;
            refreshCnt++;
            sessionStorage.refreshMe = refreshCnt;
            if (refreshCnt > 2) {
                growl.info("You will be redirected to homepage.", {
                title: 'System Notification'
            });
                delete sessionStorage.refreshMe;
                $window.location.href = baseURL;
                }
                else if (refreshCnt > 1) {
                    growl.warning("You have refreshed this page twice. You will be redirected to homepage on next refresh.", {
            title: 'System Notification' });
                     }
         }

        $scope.getCoachV2 = function () {
            console.log("TicketController.getCoachV2 triggered.");
           
            $rootScope.spinnerShow = true;
            delete sessionStorage.bookedTrips;
            delete sessionStorage.readyForSeating;
            var origin = getUrlParameter('origin', $location.absUrl());
            var destination = getUrlParameter('destination', $location.absUrl());
            var odate = getUrlParameter('odate', $location.absUrl());
            var isreturn = getUrlParameter('isreturn', $location.absUrl());
            var rdate = getUrlParameter('rdate', $location.absUrl());
            var rth = getUrlParameter('rth', $location.absUrl());
            var oth = getUrlParameter('oth', $location.absUrl());
            var pcode = getUrlParameter('pcode', $location.absUrl());
            var adult = getUrlParameter('adult', $location.absUrl());
            var child = getUrlParameter('child', $location.absUrl());
            var tempid = 1;

            if (origin == 'undefined')
                $window.location.href = baseURL;

            var previousURL = baseURL + '/ticket/select' +
                '?origin=' + origin +
                '&destination=' + destination +
                '&odate=' + odate +
                '&rdate=' + rdate +
                '&pcode=' + pcode +
                '&adult=' + adult +
                '&child=' + child +
                '&oth=' + oth +
                '&rth=' +rth +
                '&isreturn=' +isreturn;

            var OnwardData = {
                    Origin: origin,
                    Destination: destination,
                    DateJourney: odate,
                    Direction: "O",
                    NoAdult: adult,
                    Nochild: child,
                    TimeRange: oth
            };

                $http({
                        method: 'POST',
                    url: apiURL + '/api/GETCONNECTINGV2',
                        data: JSON.stringify(OnwardData),
                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                            }).then(function onSuccess(response) {
                console.log('---ONWARD TRAIN---');
                console.log(response.data);
                    $scope.onwardList = response.data.ConnectingList;

                    angular.forEach($scope.onwardList, function(train) {
                        angular.forEach(train.TripList, function (trip) {
                        trip.TempId = tempid;
                        trip.URL = previousURL;
                            trip.IsShow = true;
                            tempid++;
                            });
                            });

                    //Trigger only for return
                if (isreturn == "1") {
                    var ReturnData = {
                        Origin: destination,
                    Destination: origin,
                    DateJourney: rdate,
                    Direction: "R",
                    NoAdult: adult,
                    Nochild: child,
                                    TimeRange: rth
                                    };
                                $http({
                                            method : 'POST',
                                        url: apiURL + '/api/GETCONNECTINGV2',
                                        data: JSON.stringify(ReturnData),
                                            headers: {
                                    'Content-Type': 'application/json; charset=utf-8' }
                                    }).then(function onSuccess(response) {
                                    console.log('---RETURN TRAIN---');
                        console.log(response.data);
                                    $scope.returnList = response.data.ConnectingList;
                                    angular.forEach($scope.returnList, function(train) {
                                        angular.forEach(train.TripList, function (trip) {
                                            trip.TempId = tempid;
                                            trip.URL = previousURL;
                                trip.IsShow = true;
                                            tempid++;
                                    });
                                    });
                                    $rootScope.spinnerShow = false;
                                    }).catch(function onError(response) {
                                    $rootScope.spinnerShow = false;
                                    growl.info('Sorry, we are currently experiencing high traffic at this moment and your request might take a while to be processed.<br>You can refresh this page or try again later during off peak hour.<br>Thank you for your patient. ~t189', {
                                        title: 'Service Notification:' });
                                        console.log('[ktmb.ticket.189]-slow network connection from user ', response);

                    });
                }
                            else
                        $rootScope.spinnerShow = false;
                        }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                growl.info('Sorry, we are currently experiencing high traffic at this moment and your request might take a while to be processed.<br>You can refresh this page or try again later during off peak hour.<br>Thank you for your patient. ~t189', { title: 'Service Notification:' });
                console.log('[ktmb.ticket.189]-slow network connection from user ', response);

         });
            $scope.calculateTicketCost();
        };

        $scope.getSearchTrain = function () {
            var departureth = getUrlParameter('oth', $location.absUrl());
            var returnth = getUrlParameter('rth', $location.absUrl());
            var departuredate = getUrlParameter('odate', $location.absUrl());
            var returndate = getUrlParameter('rdate', $location.absUrl());

            $scope.journey = {
                origin: getUrlParameter('origin', $location.absUrl()),
                destination: getUrlParameter('destination', $location.absUrl()),
                departureth: departureth != null && departureth != 'undefined' ? departureth : null,
                returnth: returnth != null && returnth != 'undefined' ? returnth : null,
                pcode: getUrlParameter('pcode', $location.absUrl()),
                noadult: getUrlParameter('adult', $location.absUrl()),
                nochild: getUrlParameter('child', $location.absUrl()),
                isreturn: getUrlParameter('isreturn', $location.absUrl()),
                departuredate: departuredate != null && departuredate != 'undefined' ? convertDateNoTime(departuredate) : null,
                returndate: returndate != null && returndate != 'undefined' ? convertDateNoTime(returndate) : null
            };
            $scope.isreturn = $scope.journey.isreturn;
            console.log($scope.journey);
        }

        $scope.getCoach = function () {
            console.log("TicketController.getCoach triggered.");
            $rootScope.spinnerShow = true;
            delete sessionStorage.bookedTrips;
            delete sessionStorage.readyForSeating;
            var origin = getUrlParameter('origin', $location.absUrl());
            var destination = getUrlParameter('destination', $location.absUrl());
            var odate = getUrlParameter('odate', $location.absUrl());
            var isreturn = getUrlParameter('isreturn', $location.absUrl());
            var rdate = getUrlParameter('rdate', $location.absUrl());
            var pcode = getUrlParameter('pcode', $location.absUrl());
            var adult = getUrlParameter('adult', $location.absUrl());
            var child = getUrlParameter('child', $location.absUrl());
            var tempid = 1;

            if (origin == 'undefined')
                $window.location.href = baseURL;

            var previousURL = baseURL + '/ticket/select' +
                '?origin=' + origin +
                '&destination=' + destination +
                '&odate=' + odate +
                '&rdate=' + rdate +
                '&pcode=' + pcode +
                '&adult=' + adult +
                '&child=' + child +
                '&isreturn=' + isreturn;

            $http({
                method: 'GET',
                url: apiURL + '/api/ONDLIST',
            }).then(function onSuccess(response) {
                var ondlist = response.data;
                $http({
                    method: 'GET',
                    url: apiURL + '/api/GETCONNECTING?OriginCode=' + origin + '&DestinationCode=' + destination + '&DateJourney=' + odate
                }).then(function onSuccess(response) {
                    $rootScope.spinnerShow = true;
                    if (response.data != null) {
                        if (response.data.TransitCount > 0) {
                            var selectionList = [];
                            angular.forEach(response.data.TransitInfo.Path, function (train) {

                                $scope.getONDName(ondlist, train.Origin, train.Destination);

                                var Train = {
                                    Sequence: train.seq,
                                    TripList: [],
                                    TripType: "O",//O for onward, R for return
                                    DateJourney: odate,
                                    OriginCode: train.Origin,
                                    OriginName: $scope.ONDName.OriginName,
                                    DestinationCode: train.Destination,
                                    DestinationName: $scope.ONDName.DestinationName
                                };

                                if (train.TrainAvailable.length > 0) {
                                    angular.forEach(train.TrainAvailable, function (trainInfo) {
                                        $http({
                                            method: 'GET',
                                            url: apiURL + '/api/COACHLIST?OriginCode=' + train.Origin + '&DestinationCode=' + train.Destination + '&DateJourney=' + odate + '&TrainNumber=' + trainInfo.TRAIN_NUMBER + '&Direction=O'
                                        }).then(function onSuccess(response) {
                                            if (response.data.length > 0) {
                                                var coachInfoRaw = response.data;
                                                angular.forEach(coachInfoRaw, function (coachInfo) {

                                                    var adultPrice = 0.0;
                                                    var childPrice = 0.0;
                                                    angular.forEach(coachInfo.Fare, function (fare) {
                                                        //Get the minimum price of each seat/berth
                                                        if (fare.SeatName.indexOf('Adult') !== -1)
                                                            if (adultPrice == 0.0) {
                                                                adultPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                            }
                                                            else {
                                                                if (parseFloat(fare.SeatFare) < adultPrice)
                                                                    adultPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                            }

                                                        if (fare.SeatName.indexOf('Child') !== -1)
                                                            if (childPrice == 0.0) {
                                                                childPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                            }
                                                            else {
                                                                if (parseFloat(fare.SeatFare) < childPrice)
                                                                    childPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                            }
                                                    });

                                                    var PaxType = [];
                                                    PaxType.push({ AdultChild: 'A', TICKETTTYPE: '1', PaxCount: adult })
                                                    PaxType.push({ AdultChild: 'C', TICKETTTYPE: '1', PaxCount: child })
                                                    var Paxinfo = {
                                                        OriginCode: train.Origin,
                                                        DestinationCode: train.Destination,
                                                        DateJourney: odate,
                                                        TrainNumber: trainInfo.TRAIN_NUMBER,
                                                        TrainType: trainInfo.TRAIN_TYPE,
                                                        CoachCode: coachInfo.CoachCode,
                                                        PaxType: PaxType,
                                                        OnwardReturn: "O"
                                                    }

                                                    $http({
                                                        method: 'POST',
                                                        url: apiURL + '/api/GETFARE',
                                                        data: JSON.stringify({ Paxinfo: Paxinfo }),
                                                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                                                    }).then(function onSuccess(response) {
                                                        if (response.data != null) {

                                                            var departDateTime = convertDate(trainInfo.DEPARTURE_DATETIME);
                                                            var arrivalDateTime = convertDate(trainInfo.ARRIVAL_DATETIME);

                                                            var hoursTillDeparture = Math.abs(new Date - departDateTime) / 36e5;
                                                            console.log('Hours till departure: ' + hoursTillDeparture);

                                                            var hours = Math.floor((arrivalDateTime - departDateTime) / 1000 / 60 / 60);
                                                            var minutes = ((arrivalDateTime - departDateTime) / 1000 / 60) % 60;
                                                            $scope.getONDName(ondlist, train.Origin, train.Destination);

                                                            var TripDetails = {
                                                                TempId: tempid,
                                                                TravellingDate: odate,
                                                                OriginCode: train.Origin,
                                                                OriginName: $scope.ONDName.OriginName,
                                                                DestinationCode: train.Destination,
                                                                DestinationName: $scope.ONDName.DestinationName,
                                                                TrainNumber: trainInfo.TRAIN_NUMBER,
                                                                TrainType: trainInfo.TRAIN_TYPE,
                                                                TrainName: trainInfo.NAME,
                                                                CoachCode: coachInfo.CoachCode,
                                                                CoachName: coachInfo.CoachName,
                                                                CoachDiagram: coachInfo.CoachDiagram,
                                                                CoachType: coachInfo.CoachType,
                                                                HasLowFare: response.data.LowFareSeatLeft > 0 ? true : false,//true if lowfare price is available
                                                                NormalPrice: response.data.NORMALCHARGE,
                                                                LowFarePrice: response.data.LOWFARECHARGE,
                                                                NormalSeatLeft: response.data.NormalSeatLeft,
                                                                LowFareSeatLeft: response.data.LowFareSeatLeft,
                                                                Duration: hours + 'H ' + minutes + 'MIN',
                                                                DepartureTime: trainInfo.DEPARTURE_DATETIME,
                                                                ArrivalTime: trainInfo.ARRIVAL_DATETIME,
                                                                TotalAdult: adult,
                                                                TotalChild: child,
                                                                Sequence: train.seq,
                                                                TripType: "O",
                                                                IsShow: true,
                                                                URL: previousURL,
                                                                Currency: coachInfo.Matawang,
                                                                SeatFareAdult: adultPrice,
                                                                SeatFareChild: childPrice,
                                                                PicURL: coachInfo.PicURL,
                                                                CanBook: hoursTillDeparture < 4 ? false : true
                                                            };

                                                            //Only show train with seat left more or equal with total passenger
                                                            var totalPassenger = Number(TripDetails.TotalAdult) + Number(TripDetails.TotalChild);
                                                            if (TripDetails.NormalSeatLeft >= totalPassenger || TripDetails.LowFareSeatLeft >= totalPassenger)
                                                                Train.TripList.push(TripDetails);

                                                            tempid++;
                                                        }
                                                    }).catch(function onError(response) {
                                                        console.log(response);
                                                    });
                                                });
                                            }
                                        }).catch(function onError(response) {
                                            console.log(response);
                                        });
                                    });
                                    $scope.onwardList = selectionList;
                                    console.log('---ONWARD TRAIN---');
                                    console.log($scope.onwardList);
                                }
                                selectionList.push(Train);
                            });
                        }
                        else {
                            //Only for UI - must return something
                            var selectionList = [];
                            $scope.getONDName(ondlist, origin, destination);
                            var Train = {
                                Sequence: 0,
                                TripList: [],
                                TripType: "O",//O for onward, R for return
                                DateJourney: odate,
                                OriginCode: origin,
                                OriginName: $scope.ONDName.OriginName,
                                DestinationCode: destination,
                                DestinationName: $scope.ONDName.DestinationName
                            };
                            selectionList.push(Train);
                            $scope.onwardList = selectionList;
                        }
                    }
                    else {
                        //Only for UI - must return something
                        var selectionList = [];
                        $scope.getONDName(ondlist, origin, destination);
                        var Train = {
                            Sequence: 0,
                            TripList: [],
                            TripType: "O",//O for onward, R for return
                            DateJourney: odate,
                            OriginCode: origin,
                            OriginName: $scope.ONDName.OriginName,
                            DestinationCode: destination,
                            DestinationName: $scope.ONDName.DestinationName
                        };
                        selectionList.push(Train);
                        $scope.onwardList = selectionList;
                    }
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.toString(), { title: 'ERROR!' });
                });
            }).catch(function onError(response) {
                growl.error(response.statusText, { title: 'ERROR!' });
            });

            //Execute only if the isreturn=true
            if (isreturn == '1') {
                $http({
                    method: 'GET',
                    url: apiURL + '/api/ONDLIST',
                }).then(function onSuccess(response) {
                    var ondlist = response.data;
                    $http({
                        method: 'GET',
                        url: apiURL + '/api/GETCONNECTING?OriginCode=' + destination + '&DestinationCode=' + origin + '&DateJourney=' + rdate
                    }).then(function onSuccess(response) {
                        $rootScope.spinnerShow = true;
                        if (response.data != null) {
                            if (response.data.TransitCount > 0) {
                                var selectionList = [];
                                angular.forEach(response.data.TransitInfo.Path, function (train) {
                                    $scope.getONDName(ondlist, train.Origin, train.Destination);
                                    var Train = {
                                        Sequence: train.seq,
                                        TripList: [],
                                        TripType: "R",//O for onward, R for return
                                        DateJourney: rdate,
                                        OriginCode: train.Origin,
                                        OriginName: $scope.ONDName.OriginName,
                                        DestinationCode: train.Destination,
                                        DestinationName: $scope.ONDName.DestinationName
                                    };

                                    if (train.TrainAvailable.length > 0) {
                                        angular.forEach(train.TrainAvailable, function (trainInfo) {
                                            $http({
                                                method: 'GET',
                                                url: apiURL + '/api/COACHLIST?OriginCode=' + train.Origin + '&DestinationCode=' + train.Destination + '&DateJourney=' + rdate + '&TrainNumber=' + trainInfo.TRAIN_NUMBER + '&Direction=R'
                                            }).then(function onSuccess(response) {
                                                if (response.data.length > 0) {
                                                    var coachInfoRaw = response.data;
                                                    console.log(coachInfoRaw);
                                                    angular.forEach(coachInfoRaw, function (coachInfo) {
                                                        var adultPrice = 0.0;
                                                        var childPrice = 0.0;
                                                        angular.forEach(coachInfo.Fare, function (fare) {
                                                            //Get the minimum price of each seat/berth
                                                            if (fare.SeatName.indexOf('Adult') !== -1)
                                                                if (adultPrice == 0.0) {
                                                                    adultPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                                }
                                                                else {
                                                                    if (parseFloat(fare.SeatFare) < adultPrice)
                                                                        adultPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                                }

                                                            if (fare.SeatName.indexOf('Child') !== -1)
                                                                if (childPrice == 0.0) {
                                                                    childPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                                }
                                                                else {
                                                                    if (parseFloat(fare.SeatFare) < childPrice)
                                                                        childPrice = parseFloat(fare.SeatFare).toFixed(2);
                                                                }
                                                        });

                                                        var PaxType = [];
                                                        PaxType.push({ AdultChild: 'A', TICKETTTYPE: '1', PaxCount: adult })
                                                        PaxType.push({ AdultChild: 'C', TICKETTTYPE: '1', PaxCount: child })
                                                        var Paxinfo = {
                                                            OriginCode: train.Origin,
                                                            DestinationCode: train.Destination,
                                                            DateJourney: rdate,
                                                            TrainNumber: trainInfo.TRAIN_NUMBER,
                                                            TrainType: trainInfo.TRAIN_TYPE,
                                                            CoachCode: coachInfo.CoachCode,
                                                            PaxType: PaxType,
                                                            OnwardReturn: "R"
                                                        }
                                                        $http({
                                                            method: 'POST',
                                                            url: apiURL + '/api/GETFARE',
                                                            data: JSON.stringify({ Paxinfo: Paxinfo }),
                                                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                                                        }).then(function onSuccess(response) {
                                                            if (response.data != null) {
                                                                var departDateTime = convertDate(trainInfo.DEPARTURE_DATETIME);
                                                                var arrivalDateTime = convertDate(trainInfo.ARRIVAL_DATETIME);

                                                                var hoursTillDeparture = Math.abs(new Date - departDateTime) / 36e5;
                                                                console.log('Hours till departure: ' + hoursTillDeparture);

                                                                var hours = Math.floor((arrivalDateTime - departDateTime) / 1000 / 60 / 60);
                                                                var minutes = ((arrivalDateTime - departDateTime) / 1000 / 60) % 60;
                                                                $scope.getONDName(ondlist, train.Origin, train.Destination);
                                                                var TripDetails = {
                                                                    TempId: tempid,
                                                                    TravellingDate: rdate,
                                                                    OriginCode: train.Origin,
                                                                    OriginName: $scope.ONDName.OriginName,
                                                                    DestinationCode: train.Destination,
                                                                    DestinationName: $scope.ONDName.DestinationName,
                                                                    TrainNumber: trainInfo.TRAIN_NUMBER,
                                                                    TrainType: trainInfo.TRAIN_TYPE,
                                                                    TrainName: trainInfo.NAME,
                                                                    CoachCode: coachInfo.CoachCode,
                                                                    CoachName: coachInfo.CoachName,
                                                                    CoachName: coachInfo.CoachName,
                                                                    CoachDiagram: coachInfo.CoachDiagram,
                                                                    HasLowFare: response.data.LowFareSeatLeft > 0 ? true : false,//true if lowfare price is available
                                                                    NormalPrice: response.data.NORMALCHARGE,
                                                                    LowFarePrice: response.data.LOWFARECHARGE,
                                                                    NormalSeatLeft: response.data.NormalSeatLeft,
                                                                    LowFareSeatLeft: response.data.LowFareSeatLeft,
                                                                    Duration: hours + 'H ' + minutes + 'MIN',
                                                                    DepartureTime: trainInfo.DEPARTURE_DATETIME,
                                                                    ArrivalTime: trainInfo.ARRIVAL_DATETIME,
                                                                    TotalAdult: adult,
                                                                    TotalChild: child,
                                                                    Sequence: train.seq,
                                                                    TripType: "R",
                                                                    IsShow: true,
                                                                    URL: previousURL,
                                                                    Currency: coachInfo.Matawang,
                                                                    SeatFareAdult: adultPrice,
                                                                    SeatFareChild: childPrice,
                                                                    PicURL: coachInfo.PicURL,
                                                                    CanBook: hoursTillDeparture < 4 ? false : true
                                                                };

                                                                //Only show train with seat left more or equal with total passenger
                                                                var totalPassenger = Number(TripDetails.TotalAdult) + Number(TripDetails.TotalChild);
                                                                if (TripDetails.NormalSeatLeft >= totalPassenger || TripDetails.LowFareSeatLeft >= totalPassenger)
                                                                    Train.TripList.push(TripDetails);

                                                                tempid++;
                                                            }
                                                        }).catch(function onError(response) {
                                                            growl.error(response.toString(), { title: 'ERROR!' });
                                                        });
                                                    });
                                                }
                                            }).catch(function onError(response) {
                                                growl.error(response.toString(), { title: 'ERROR!' });
                                            });
                                        });
                                        $scope.returnList = selectionList;
                                        console.log('---RETURN TRAIN---');
                                        console.log($scope.returnList);
                                    }
                                    selectionList.push(Train);
                                });
                            }
                            else {
                                //Only for UI - must return something
                                var selectionList = [];
                                $scope.getONDName(ondlist, destination, origin);
                                var Train = {
                                    Sequence: 0,
                                    TripList: [],
                                    TripType: "R",//O for onward, R for return
                                    DateJourney: odate,
                                    OriginCode: destination,
                                    OriginName: $scope.ONDName.DestinationName,
                                    DestinationCode: origin,
                                    DestinationName: $scope.ONDName.OriginName,
                                };
                                selectionList.push(Train);
                                $scope.returnList = selectionList;
                            }
                        }
                        else {
                            //Only for UI - must return something
                            var selectionList = [];
                            $scope.getONDName(ondlist, destination, origin);
                            var Train = {
                                Sequence: 0,
                                TripList: [],
                                TripType: "R",//O for onward, R for return
                                DateJourney: odate,
                                OriginCode: destination,
                                OriginName: $scope.ONDName.DestinationName,
                                DestinationCode: origin,
                                DestinationName: $scope.ONDName.OriginName,
                            };
                            selectionList.push(Train);
                            $scope.returnList = selectionList;
                        }
                        $rootScope.spinnerShow = false;
                    }).catch(function onError(response) {
                        growl.error(response.toString(), { title: 'ERROR!' });
                    });
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            $scope.calculateTicketCost();
        };

        $scope.bookingOnClick = function (tempid, islowfare) {
            console.log("TicketController.bookingOnClick triggered.");

            var selectedTrip = $scope.selectedTrip;
            var tripcount = 0;

            angular.forEach($scope.onwardList, function (trip) {
                tripcount++;
                angular.forEach(trip.TripList, function (triplist) {
                    if (triplist.TempId.toString() == tempid.toString()) {//Found match in onwardlist
                        angular.forEach(selectedTrip, function (selected) {//remove the same origin n destination to avoid duplication
                            if (selected.OriginCode === triplist.OriginCode && selected.DestinationCode === triplist.DestinationCode) {
                                var index = selectedTrip.indexOf(selected);
                                selectedTrip.splice(index, 1);//remove duplicate in current selected list
                            }
                        });

                        var adultCnt = Number(triplist.TotalAdult);
                        var childCnt = Number(triplist.TotalChild);
                        var singleCharge = parseFloat(triplist.NormalPrice.replace('MYR', ''));
                        triplist.TotalPassenger = adultCnt + childCnt;
                        if (adultCnt > 0)
                            singleCharge = singleCharge - parseFloat(triplist.SeatFareAdult) * adultCnt;
                        if (childCnt > 0)
                            singleCharge = singleCharge - parseFloat(triplist.SeatFareChild) * childCnt;
                        triplist.SingleCharge = (singleCharge / triplist.TotalPassenger).toFixed(2);

                        triplist.LowFareSelected = islowfare;
                        selectedTrip.push(triplist);
                    }
                });
            });

            angular.forEach($scope.returnList, function (trip) {
                tripcount++;
                angular.forEach(trip.TripList, function (triplist) {
                    if (triplist.TempId.toString() == tempid.toString()) {//Found match in returnList
                        angular.forEach(selectedTrip, function (selected) {//remove the same origin n destination to avoid duplication
                            if (selected.OriginCode === triplist.OriginCode && selected.DestinationCode === triplist.DestinationCode) {
                                var index = selectedTrip.indexOf(selected);
                                selectedTrip.splice(index, 1);//remove duplicate in current selected list
                            }
                        });

                        var adultCnt = Number(triplist.TotalAdult);
                        var childCnt = Number(triplist.TotalChild);
                        var singleCharge = parseFloat(triplist.NormalPrice.replace('MYR', ''));
                        triplist.TotalPassenger = adultCnt + childCnt;
                        if (adultCnt > 0)
                            singleCharge = singleCharge - parseFloat(triplist.SeatFareAdult) * adultCnt;
                        if (childCnt > 0)
                            singleCharge = singleCharge - parseFloat(triplist.SeatFareChild) * childCnt;
                        triplist.SingleCharge = (singleCharge / triplist.TotalPassenger).toFixed(2);

                        triplist.LowFareSelected = islowfare;
                        selectedTrip.push(triplist);
                    }
                });
            });

            //Remove the trip to avoid time clash - for onward
            var onwardFiltered = false;
            angular.forEach($scope.onwardList, function (trip) {
                angular.forEach(trip.TripList, function (triplist) {
                    if (tempid.toString() == triplist.TempId.toString()) {
                        console.log('line 400 in');

                        angular.forEach($scope.onwardList, function (filterTrip) {
                            angular.forEach(filterTrip.TripList, function (filterTripList) {
                                if (triplist.DestinationCode.toString() == filterTripList.OriginCode.toString()) {
                                    onwardFiltered = true;
                                    if (convertDate(triplist.ArrivalTime.toString()) >= convertDate(filterTripList.DepartureTime.toString())) {
                                        filterTripList.IsShow = false;
                                    }
                                    else {
                                        filterTripList.IsShow = true;
                                    }
                                }
                            });

                            if (!onwardFiltered) {
                                angular.forEach($scope.returnList, function (filterTrip) {
                                    angular.forEach(filterTrip.TripList, function (filterTripList) {
                                        console.log(triplist.DestinationCode.toString() + ', ' + filterTripList.OriginCode.toString());
                                        if (triplist.DestinationCode.toString() == filterTripList.OriginCode.toString()) {
                                            if (convertDate(triplist.ArrivalTime.toString()) >= convertDate(filterTripList.DepartureTime.toString())) {
                                                filterTripList.IsShow = false;
                                            }
                                            else {
                                                filterTripList.IsShow = true;
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            });

            //Remove the trip to avoid time clash - for return
            angular.forEach($scope.returnList, function (trip) {
                angular.forEach(trip.TripList, function (triplist) {
                    if (tempid.toString() == triplist.TempId.toString()) {
                        console.log('line 422 in');
                        angular.forEach($scope.returnList, function (filterTrip) {
                            angular.forEach(filterTrip.TripList, function (filterTripList) {
                                if (triplist.DestinationCode.toString() == filterTripList.OriginCode.toString()) {
                                    if (convertDate(triplist.ArrivalTime.toString()) >= convertDate(filterTripList.DepartureTime.toString())) {
                                        filterTripList.IsShow = false;
                                    }
                                    else {
                                        filterTripList.IsShow = true;
                                    }
                                }
                            });
                        });
                    }
                });
            });

            //Check the validity of the proceed button
            if (tripcount == selectedTrip.length)
                $scope.readyToProceed = true;

            $scope.selectedTrip = selectedTrip;
            $scope.calculateTicketCost();

            //Add another function to trim the selection to match date departure and next arrival time
            console.log($scope.onwardList);
            console.log($scope.returnList);
            console.log($scope.selectedTrip);
        };

        $scope.calculateTicketCost = function () {
            var totalCost = 0.00;
            angular.forEach($scope.selectedTrip, function (trip) {
                if (trip.LowFareSelected) {
                    totalCost = totalCost + parseFloat(trip.LowFarePrice.replace('MYR ', ''));
                }
                else
                    totalCost = totalCost + parseFloat(trip.NormalPrice.replace('MYR ', ''));
            });
            $scope.totalCost = parseFloat(totalCost).toFixed(2);
        };

        $scope.generateTripDate = function () {
            console.log("TicketController.generateTripDate triggered.");
            var rdate = getUrlParameter('rdate', $location.absUrl());
            var odate = getUrlParameter('odate', $location.absUrl());
            var isreturn = getUrlParameter('isreturn', $location.absUrl());

            var onwardTripDate = [];
            var returnTripDate = [];

            var _odate = odate.toString().toDate("dd/MM/yyyy", "/");

            for (i = 1; i < 6; i++) {
                if (i < 3) {
                    _odate.setDate(_odate.getDate() - i);
                    var x = { tripDate: _odate, isactive: false };
                    onwardTripDate.push(x);
                }

                _odate = odate.toString().toDate("dd/MM/yyyy", "/");

                if (i == 3) {
                    _odate.setDate(_odate.getDate());
                    var x = { tripDate: _odate, isactive: true };
                    onwardTripDate.push(x);
                }

                _odate = odate.toString().toDate("dd/MM/yyyy", "/");

                if (i > 3) {
                    _odate.setDate(_odate.getDate() + i - 3);
                    var x = { tripDate: _odate, isactive: false };
                    onwardTripDate.push(x);
                }
            }

            if (rdate != undefined) {
                var _rdate = rdate.toString().toDate("dd/MM/yyyy", "/");

                for (i = 1; i < 6; i++) {
                    if (i < 3) {
                        _rdate.setDate(_rdate.getDate() - i);
                        var x = { tripDate: _rdate, isactive: false };
                        returnTripDate.push(x);
                    }

                    _rdate = rdate.toString().toDate("dd/MM/yyyy", "/");

                    if (i == 3) {
                        _rdate.setDate(_rdate.getDate());
                        var x = { tripDate: _rdate, isactive: true };
                        returnTripDate.push(x);
                    }

                    _rdate = rdate.toString().toDate("dd/MM/yyyy", "/");

                    if (i > 3) {
                        _rdate.setDate(_rdate.getDate() + i - 3);
                        var x = { tripDate: _rdate, isactive: false };
                        returnTripDate.push(x);
                    }
                }
            }

            if (isreturn !== '1') {
                var dateTab = angular.element('.return-date');
                dateTab.attr('hidden', 'hidden');
            }

            $scope.ReturnTripDateList = returnTripDate;
            $scope.OnwardTripDateList = onwardTripDate;
        };

        $scope.changeTravellingDate = function (isreturn, newdate) {
            console.log("TicketController.changeTravellingDate triggered.");
            var origin = getUrlParameter('origin', $location.absUrl());
            var destination = getUrlParameter('destination', $location.absUrl());
            var adult = getUrlParameter('adult', $location.absUrl());
            var child = getUrlParameter('child', $location.absUrl());
            var pcode = getUrlParameter('pcode', $location.absUrl());
            var _isreturn = getUrlParameter('isreturn', $location.absUrl());
            var _odate = getUrlParameter('odate', $location.absUrl());
            var _rdate = getUrlParameter('rdate', $location.absUrl());
            var oth = getUrlParameter('oth', $location.absUrl());
            var rth = getUrlParameter('rth', $location.absUrl());
            console.log(_isreturn);

            var _todayDate = new Date();
            var todayDate = new Date(_todayDate.toDateString());
            if (todayDate > newdate) {
                growl.warning('Booking for the date earlier than today is not allowed.', { title: 'WE ARE SORRY!', ttl: 10000 });
                return;
            }

            var rdate = getUrlParameter('rdate', $location.absUrl());
            var odate = getUrlParameter('odate', $location.absUrl());

            if (isreturn) {
                rdate = $filter('date')(newdate, 'dd/MM/yyyy');
                if (rdate.toString().toDate("dd/MM/yyyy", "/") >= _odate.toString().toDate("dd/MM/yyyy", "/")) {
                    rdate = $filter('date')(newdate, 'dd/MM/yyyy');
                }
                else
                    rdate = _rdate;
            }
            else {
                odate = $filter('date')(newdate, 'dd/MM/yyyy');
                if (_rdate != 'undefined') {
                    if (odate.toString().toDate("dd/MM/yyyy", "/") <= _rdate.toString().toDate("dd/MM/yyyy", "/")) {
                        odate = $filter('date')(newdate, 'dd/MM/yyyy');
                    }
                    else
                        odate = _odate;
                }
            }

            $window.location.href = baseURL + '/ticket/select' +
                '?origin=' + origin +
                '&destination=' + destination +
                '&odate=' + odate +
                '&rdate=' + rdate +
                '&pcode=' + pcode +
                '&adult=' + adult +
                '&child=' + child +
                '&oth=' + oth +
                '&rth=' + rth +
                '&isreturn=' + _isreturn;
        };

        $scope.proceedBooking = function () {
            console.log("TicketController.proceedBooking triggered.");
            console.log('--- Selected Trip ---');
            console.log($scope.selectedTrip);
            //$scope.selectedTrip will be send to the future pages via session
            sessionStorage.bookedTrips = JSON.stringify($scope.selectedTrip);

            $window.location.href = baseURL + '/ticket/passenger';
        };

     

        $scope.getBooking = function () {
            console.log("TicketController.getBooking triggered.");
            if (sessionStorage.bookedTrips != undefined || sessionStorage.bookedTrips != null) {
                if (sessionStorage.passengerInfo != undefined) {
                    console.log(JSON.parse(sessionStorage.passengerInfo));
                    $scope.passenger = JSON.parse(sessionStorage.passengerInfo)
                    console.log($scope.passenger);
                    angular.forEach($scope.passenger.adult, function (human) {
                        if (human.dob != undefined) {
                            human.dob = new Date(human.dob);
                            console.log(human.dob);
                        }
                    });
                    angular.forEach($scope.passenger.child, function (human) {
                        if (human.dob != undefined) {
                            human.dob = new Date(human.dob);
                            console.log(human.dob);
                        }
                    });
                }

                console.log(JSON.parse(sessionStorage.bookedTrips));

                var bookedList = [];
                var isreturn = false;
                var totalCost = parseFloat('0.0');
                var adultPriceBreakdown = [];
                var childPriceBreakdown = [];

                angular.forEach(JSON.parse(sessionStorage.bookedTrips), function (trip) {
                    var adultCnt = Number(trip.TotalAdult);
                    var childCnt = Number(trip.TotalChild);
                    var coachName = String(trip.CoachName);
                    var trainNumber = String(trip.TrainNumber);
                    $scope.numberOfAdult = adultCnt;
                    $scope.numberOfChild = childCnt;
                    $scope.coachName = coachName;
                    $scope.trainNumber = trainNumber;

                    if (trip.LowFareSelected) {
                        totalCost = totalCost + parseFloat(trip.LowFarePrice.replace('MYR ', ''));
                    }
                    else
                        totalCost = totalCost + parseFloat(trip.NormalPrice.replace('MYR ', ''));

                    if (trip.TripType == 'R')
                        if (!isreturn)
                            isreturn = true;

                    //Calling /api/GETFAREDETAIL to get price breakdown for each passenger

                    //Loop thru passengerInfo if already exist in session
                    if (sessionStorage.passengerInfo != undefined) {
                        GetAdultPriceBreakdown(trip, JSON.parse(sessionStorage.passengerInfo), 1);
                        GetChildPriceBreakdown(trip, JSON.parse(sessionStorage.passengerInfo), 1);
                    }
                    else {
                        for (var i = 1; i <= Number(trip.TotalAdult) ; i++) {
                            var data = {
                                Paxinfo: {
                                    OriginCode: trip.OriginCode,
                                    DestinationCode: trip.DestinationCode,
                                    DateJourney: trip.TravellingDate,
                                    TrainNumber: trip.TrainNumber,
                                    CoachCode: trip.CoachCode,
                                    OnwardReturn: trip.TripType,
                                    AdultChild: 'A',
                                    TICKETTTYPE: '1'
                                },
                                isAgent: false
                            };
                            var x = 1;
                            $http({
                                method: 'POST',
                                url: apiURL + '/api/GETFAREDETAIL',
                                data: JSON.stringify(data),
                                headers: { 'Content-Type': 'application/json; charset=utf-8' }
                            }).then(function onSuccess(response) {
                                if (response.data.ERROR.length > 0) {
                                    //angular.forEach(response.data.ERROR, function (err) {
                                    //    console.log('ERROR!: ' + err);
                                    //});
                                    growl.info('Due to heavy traffic access at this moment, the data might not be displayed completely. <br>Please refresh this page or try again later.<br>Thank you. ~t987', { title: 'Service Notification:' });
                                    console.log('[ktmb.ticket.987]-slow server connection from user ', response.data);

                                }
                                else {
                                    var pd = {
                                        AdultChild: 'A',
                                        TicketType: response.data.TicketType,
                                        Price: response.data.NORMALCHARGE,
                                        Name: 'Adult Passenger #' + x,
                                        Id: x,
                                        Departure: trip.DepartureTime
                                    };
                                    adultPriceBreakdown.push(pd);
                                    x++;
                                    totalCost = totalCost + (parseFloat(response.data.NORMALCHARGE.replace('MYR ', '')));
                                }
                            }).catch(function onError(response) {
                                // console.log('ERROR!: ' + response.statusText + ' at line 655, ticket.js');
                                growl.info('Due to heavy traffic access at this moment, the data might not be displayed completely. <br>Please refresh this page or try again later.<br>Thank you. ~t1006', { title: 'Service Notification:' });
                                console.log('[ktmb.ticket.1006]-slow server connection from user ', response.statusText);

                            });

                        };

                        //Loop for child
                        for (var i = 1; i <= Number(trip.TotalChild) ; i++) {
                            var data = {
                                Paxinfo: {
                                    OriginCode: trip.OriginCode,
                                    DestinationCode: trip.DestinationCode,
                                    DateJourney: trip.TravellingDate,
                                    TrainNumber: trip.TrainNumber,
                                    CoachCode: trip.CoachCode,
                                    OnwardReturn: trip.TripType,
                                    AdultChild: 'C',
                                    TICKETTTYPE: '1' //Every ticket is an ordinary one, by default
                                },
                                isAgent: false
                            };
                            var y = 1;
                            $http({
                                method: 'POST',
                                url: apiURL + '/api/GETFAREDETAIL',
                                data: JSON.stringify(data),
                                headers: { 'Content-Type': 'application/json; charset=utf-8' }
                            }).then(function onSuccess(response) {
                                if (response.data.ERROR.length > 0) {
                                    angular.forEach(response.data.ERROR, function (err) {
                                        console.log('ERROR!: ' + err);
                                    });
                                }
                                else {
                                    var pd = {
                                        AdultChild: 'C',
                                        TicketType: response.data.TicketType,
                                        Price: response.data.NORMALCHARGE,
                                        Name: 'Child Passenger #' + y,
                                        Id: y,
                                        Departure: trip.DepartureTime
                                    };
                                    childPriceBreakdown.push(pd);
                                    y++;
                                    totalCost = totalCost + (parseFloat(response.data.NORMALCHARGE.replace('MYR ', '')));
                                }
                            }).catch(function onError(response) {
                                console.log('ERROR!: ' + response.statusText + ' at line 655, ticket.js');
                            });
                        };

                        $scope.AdultPriceBreakdown = adultPriceBreakdown;
                        $scope.ChildPriceBreakdown = childPriceBreakdown;
                    }

                    console.log($scope.AdultPriceBreakdown);
                    console.log($scope.ChildPriceBreakdown);
                    trip._DepartureTime = convertDate(trip.DepartureTime);
                    bookedList.push(trip);
                    $scope.previousURL = trip.URL;
                });

                var booked = {
                    bookedList: bookedList,
                    totalCost: totalCost,
                    IsReturn: isreturn
                };

                $scope.booked = booked;
                console.log($scope.booked);
            }
            else
                $window.location.href = baseURL;
        };

        $scope.updateFare = function (passenger, x) {
            console.log("TicketController.updateFare triggered.");
            console.log($scope.booked);
            var cost = 0.0;
            $scope.booked.totalCost = 0.0;
            $scope.AdultPriceBreakdown = [];
            $scope.ChildPriceBreakdown = [];

            angular.forEach($scope.booked.bookedList, function (trip) {
                GetAdultPriceBreakdown(trip, passenger, 1);
                GetChildPriceBreakdown(trip, passenger, 1);
                console.log($scope.AdultPriceBreakdown);
                console.log($scope.ChildPriceBreakdown);
            });
        };

        $scope.checkIsUserLogIn = function () {
            console.log("TicketController.checkIsUserLogIn triggered.");
            if ($cookies.get('UI_TOKEN') === undefined || $cookies.get('UI_TOKEN') === null)
                $scope.showModal('#userModal');
        };

        $scope.showModal = function (modalid) {
            console.log("TicketController.showModal triggered.");
            try {
                angular.element('.modal').modal('hide');
                angular.element(modalid).modal('show');
            }
            catch (err) {
                console.log(err);
            }
        };

        $scope.getNumber = function (num) {
            return new Array(num);
        };

        $scope.getTicketType = function () {
            console.log("TicketController.getTicketType triggered.");
            
            var booked = JSON.parse(sessionStorage.bookedTrips);

                    
            if (booked.length > 0) {
                $http({
                    method: 'GET',
                    url: apiURL + '/api/TICKETTYPELIST?DateJourney=' + booked[0].TravellingDate + '&Tren=' + booked[0].TrainNumber + '&Origin=' + booked[0].OriginCode + '&Dest=' + booked[0].DestinationCode,
                }).then(function onSuccess(response) {
                    console.log(response.data);
                    $scope.ticketTypeList = response.data;
                    $scope.ticketTypeListNew =
                    [
                        { "CODE": "1", "DESCRIPTION": "ORDINARY TICKET", "DESCRIPTION_MALAY": "Tiket Biasa" },
                        { "CODE": "4", "DESCRIPTION": "DISABLED", "DESCRIPTION_MALAY": "Orang Kurang Upaya" },
                    ];


                }).catch(function onError(response) {
                    //growl.error(response.statusText, { title: 'ERROR!' });
                    growl.info('Due to heavy traffic access at this moment, the data might not be displayed completely. <br>Please refresh this page or try again later.<br>Thank you. ~t1130', { title: 'Service Notification:' });
                    console.log('[ktmb.ticket.1130]-slow connection data from user ');

                });
            }
        };

        //This function only meant for populating favorite user array object
        $scope.PopulateField = function () {
            console.log("TicketController.PopulateField triggered.");
            var booked = JSON.parse(sessionStorage.bookedTrips);
            console.log(booked);
            var totalAdult = booked[0].TotalAdult;
            var totalChild = booked[0].TotalChild;
            console.log(totalAdult);
            console.log(totalChild);

            for (var i = 0; i <= Number(booked[0].TotalAdult) ; i++) {
                $scope.passenger.adult.push({});
            };

            for (var i = 0; i <= Number(booked[0].TotalChild) ; i++) {
                $scope.passenger.child.push({});
            };

        };

        $scope.getReselectTicket = function () {
            console.log("TicketController.getReselectTicket triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = { securitytoken: $cookies.get('UI_TOKEN') };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETRESELECTTICKET',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);
                    $scope.reselectList = response.data;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    //$window.location.reload();
                    console.log('ERROR!: ' + response.statusText + ' at line 1051, ticket.js');
                    $rootScope.spinnerShow = false;
                    // growl.info('Sorry, we are currently experiencing high traffic at this moment and your request might take a while to be processed.<br>You can refresh this page or try again later during off peak hour.<br>Thank you for your patient. ~t1174', { title: 'Service Notification:' });
                    // console.log('[ktmb.ticket.1174]-slow connection data from user ', response.statusText);

                });
            }
            else
                $rootScope.spinnerShow = false;
        };


        $scope.getFavoriteList = function () {
            console.log("TicketController.getFavoriteList triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = { securitytoken: $cookies.get('UI_TOKEN') };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETFAVORITEPASSENGER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);
                    $scope.FavoriteList = response.data;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    $window.location.reload();
                    //console.log('ERROR!: ' + response.statusText + ' at line 655, ticket.js');
                    $rootScope.spinnerShow = false;
                    growl.info('Sorry, we are currently experiencing high traffic at this moment and your request might take a while to be processed.<br>You can refresh this page or try again later during off peak hour.<br>Thank you for your patient. ~t1174', { title: 'Service Notification:' });
                    console.log('[ktmb.ticket.1174]-slow connection data from user ', response.statusText);

                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getFav = function (selected, index, isadult) {
            console.log("TicketController.getFav triggered.");
            var restrictTT = false;
            angular.forEach($scope.booked.bookedList, function (booking) {
                console.log(booking.OriginCode);
                console.log(booking.DestinationCode);



                if (restrictTT != true)
                    if (booking.DestinationCode == "37600" || booking.OriginCode == "37600")
                        restrictTT = true;
            });
            //console.log("Restrict status: " + restrictTT);
            angular.forEach($scope.FavoriteList, function (fav) {

                if ($scope.trainNumber == '9025' || $scope.trainNumber == '9027') {
                    fav.TicketType = '1';
                }


                if (fav.IC == selected) {
                    if (isadult) {
                        $scope.passenger.adult[index + 1].name = fav.FullName;
                        $scope.passenger.adult[index + 1].gender = fav.Gender;
                        $scope.passenger.adult[index + 1].icpassport = fav.IC;
                        $scope.passenger.adult[index + 1].konsesiid = fav.KonsesiID;

                        if (fav.TicketType != null && fav.TicketType != undefined) {
                            if (!restrictTT) {
                                $scope.passenger.adult[index + 1].tickettype = fav.TicketType;
                            }
                        }
                        if (fav.DOB != null && fav.DOB != undefined) {
                            $scope.passenger.adult[index + 1].dob = convertDateNoTime(fav.DOB);
                        }
                    }
                    else {
                        $scope.passenger.child[index + 1].name = fav.FullName;
                        $scope.passenger.child[index + 1].gender = fav.Gender;
                        $scope.passenger.child[index + 1].icpassport = fav.IC;
                        $scope.passenger.child[index + 1].konsesiid = fav.KonsesiID;
                        //$scope.passenger.child[index + 1].tickettype = fav.TicketType;//Child have no ticket type
                        if (fav.DOB != null && fav.DOB != undefined)
                            $scope.passenger.child[index + 1].dob = convertDateNoTime(fav.DOB);
                    }
                }
            });
        };

        $scope.verifyPassenger = function (passenger) {
            console.log("TicketController.verifyPassenger triggered.");
            sessionStorage.passengerInfo = JSON.stringify(passenger);
            var booked = JSON.parse(sessionStorage.bookedTrips);
            var lastTrip = { PaxList: [] };
            var isreturn = false;
            console.log(passenger);
            console.log(booked);

            var booking = {
                BookingList: [],
                SecurityToken: $cookies.get('UI_TOKEN'),
                AutoSelectSeat: true
            };

            angular.forEach(JSON.parse(sessionStorage.bookedTrips), function (trips) {
                var trip = { PaxList: [] };
                console.log(trips);

                for (var i = 1; i <= Number(trips.TotalAdult) ; i++) {
                    var day = passenger.adult[i].dob.getDate();
                    var month = (passenger.adult[i].dob.getMonth() + 1);
                    day = day.toString().length != 2 ? '0' + day : day;
                    month = month.toString().length != 2 ? '0' + month : month;
                    var DOB = day + '/' + month + '/' + passenger.adult[i].dob.getFullYear();

                    var pax = {
                        TempId: 'A' + i,
                        Name: passenger.adult[i].name,
                        IC: passenger.adult[i].icpassport,
                        ADULTCHILD: "A",
                        GENDER: passenger.adult[i].gender,
                        LABELNAME: "TBD",
                        SLOTID: "TBD",
                        TICKETTTYPE: passenger.adult[i].tickettype,
                        KONSESIID: passenger.adult[i].konsesiid,
                        DOB: DOB,
                        SaveFav: passenger.adult[i].saveFav
                    };
                    trip.PaxList.push(pax);
                };

                for (var i = 1; i <= Number(trips.TotalChild) ; i++) {
                    var day = passenger.child[i].dob.getDate();
                    var month = (passenger.child[i].dob.getMonth() + 1);
                    day = day.toString().length != 2 ? '0' + day : day;
                    month = month.toString().length != 2 ? '0' + month : month;
                    var DOB = day + '/' + month + '/' + passenger.child[i].dob.getFullYear();

                    var pax = {
                        TempId: 'C' + i,
                        Name: passenger.child[i].name,
                        IC: passenger.child[i].icpassport,
                        ADULTCHILD: "C",
                        GENDER: passenger.child[i].gender,
                        LABELNAME: "TBD",
                        SLOTID: "TBD",
                        TICKETTTYPE: passenger.child[i].tickettype,
                        KONSESIID: passenger.child[i].konsesiid,
                        DOB: DOB,
                        SaveFav: passenger.child[i].saveFav
                    };
                    trip.PaxList.push(pax);
                };

                if (trips.TripType == 'R')
                    if (!isreturn)
                        isreturn = true;

                trip.OnwardReturn = trips.TripType;
                trip.OriginCode = trips.OriginCode;
                trip.DestinationCode = trips.DestinationCode;
                trip.DateJourney = trips.TravellingDate;
                trip.TrainNumber = trips.TrainNumber;
                trip.TrainType = trips.TrainType;
                trip.CoachCode = trips.CoachCode;
                trip.CoachName = trips.CoachName;
                trip.CoachDiagram = trips.CoachDiagram;
                trip.isLowFare = trips.LowFareSelected;
                trip.TrainName = trips.TrainName;
                trip.OriginName = trips.OriginName;
                trip.DestinationName = trips.DestinationName;
                trip.DepartureTime = trips.DepartureTime;
                trip.ArrivalTime = trips.ArrivalTime;
                trip.TotalAdult = trips.TotalAdult;
                trip.TotalChild = trips.TotalChild;
                trip.SeatFareAdult = trips.SeatFareAdult;
                trip.SeatFareChild = trips.SeatFareChild;
                trip.TotalPassenger = trips.TotalPassenger;
                trip.SingleCharge = trips.SingleCharge;
                trip.NormalPrice = trips.NormalPrice;

                trip.URL = trips.URL
                booking.BookingList.push(trip);

                lastTrip.PaxList = [];
                lastTrip.PaxList = trip.PaxList;
            });

            console.log(booking);

            $http({
                method: 'POST',
                url: apiURL + '/api/VERIFYSLOT',
                data: JSON.stringify(booking),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ERROR.length > 0) {
                    angular.forEach(response.data.ERROR, function (error) {
                        growl.warning(error, { title: 'WARNING!', ttl: 10000 });
                    });
                }
                else {
                    //Add to favorite list
                    var personList = {
                        passengerlist: [],
                        securitytoken: $cookies.get('UI_TOKEN')
                    };

                    angular.forEach(lastTrip.PaxList, function (passenger) {
                        console.log(passenger.SaveFav);
                        if (passenger.SaveFav != undefined && passenger.SaveFav) {
                            var person = {
                                FullName: passenger.Name,
                                IC: passenger.IC,
                                DOB: passenger.DOB,
                                Gender: passenger.GENDER,
                                AdultChild: passenger.ADULTCHILD,
                                TicketType: passenger.TICKETTTYPE,
                                KonsesiID: passenger.KONSESIID
                            };
                            personList.passengerlist.push(person);
                        }
                    });

                    console.log(personList);

                    $http({
                        method: 'POST',
                        url: apiURL + '/api/STOREFAVORITEPASSENGER',
                        data: JSON.stringify(personList),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function onSuccess(response) {
                        console.log('Save favorite status: ' + response.data);
                    }).catch(function onError(response) {
                        growl.error(response.statusText + ' at line 946, ticket.js', { title: 'ERROR!' });
                    });

                    //Proceed to seating page
                    booking.VerificationResult = response.data;
                    booking.IsReturn = isreturn;
                    sessionStorage.readyForSeating = JSON.stringify(booking);
                    console.log(sessionStorage.readyForSeating);
                    sessionStorage.autoSelectComplete = null;
                    $window.location.href = baseURL + '/ticket/seating';
                }
            }).catch(function onError(response) {
                console.log(response);
                growl.error(response.statusText, { title: 'ERROR!' });
            });

        };

        $scope.verifyPassengerAutoSeat = function (passenger) {
            console.log("TicketController.verifyPassengerAutoSeat triggered.");
            var booked = JSON.parse(sessionStorage.bookedTrips);
            var lastTrip = { PaxList: [] };
            var isreturn = false;
            console.log(passenger);
            console.log(booked);

            var booking = {
                BookingList: [],
                SecurityToken: $cookies.get('UI_TOKEN'),
                AutoSelectSeat: true
            };

            angular.forEach(JSON.parse(sessionStorage.bookedTrips), function (trips) {
                var trip = { PaxList: [] };
                console.log(trips);

                for (var i = 1; i <= Number(trips.TotalAdult) ; i++) {
                    var day = passenger.adult[i].dob.getDate();
                    var month = (passenger.adult[i].dob.getMonth() + 1);
                    day = day.toString().length != 2 ? '0' + day : day;
                    month = month.toString().length != 2 ? '0' + month : month;
                    var DOB = day + '/' + month + '/' + passenger.adult[i].dob.getFullYear();

                    var pax = {
                        TempId: 'A' + i,
                        Name: passenger.adult[i].name,
                        IC: passenger.adult[i].icpassport,
                        ADULTCHILD: "A",
                        GENDER: passenger.adult[i].gender,
                        LABELNAME: "TBD",
                        SLOTID: "TBD",
                        TICKETTTYPE: passenger.adult[i].tickettype,
                        KONSESIID: passenger.adult[i].konsesiid,
                        DOB: DOB,
                        SaveFav: passenger.adult[i].saveFav
                    };
                    trip.PaxList.push(pax);
                };

                for (var i = 1; i <= Number(trips.TotalChild) ; i++) {
                    var day = passenger.child[i].dob.getDate();
                    var month = (passenger.child[i].dob.getMonth() + 1);
                    day = day.toString().length != 2 ? '0' + day : day;
                    month = month.toString().length != 2 ? '0' + month : month;
                    var DOB = day + '/' + month + '/' + passenger.child[i].dob.getFullYear();

                    var pax = {
                        TempId: 'C' + i,
                        Name: passenger.child[i].name,
                        IC: passenger.child[i].icpassport,
                        ADULTCHILD: "C",
                        GENDER: passenger.child[i].gender,
                        LABELNAME: "TBD",
                        SLOTID: "TBD",
                        TICKETTTYPE: passenger.child[i].tickettype,
                        KONSESIID: passenger.child[i].konsesiid,
                        DOB: DOB,
                        SaveFav: passenger.child[i].saveFav
                    };
                    trip.PaxList.push(pax);
                };

                if (trips.TripType == 'R')
                    if (!isreturn)
                        isreturn = true;

                trip.OnwardReturn = trips.TripType;
                trip.OriginCode = trips.OriginCode;
                trip.DestinationCode = trips.DestinationCode;
                trip.DateJourney = trips.TravellingDate;
                trip.TrainNumber = trips.TrainNumber;
                trip.CoachCode = trips.CoachCode;
                trip.CoachName = trips.CoachName;
                trip.CoachDiagram = trips.CoachDiagram;
                trip.isLowFare = trips.LowFareSelected;
                trip.TrainName = trips.TrainName;
                trip.OriginName = trips.OriginName;
                trip.DestinationName = trips.DestinationName;
                trip.DepartureTime = trips.DepartureTime;
                trip.ArrivalTime = trips.ArrivalTime;
                trip.TotalAdult = trips.TotalAdult;
                trip.TotalChild = trips.TotalChild;
                trip.SeatFareAdult = trips.SeatFareAdult;
                trip.SeatFareChild = trips.SeatFareChild;
                trip.TotalPassenger = trips.TotalPassenger;
                trip.SingleCharge = trips.SingleCharge;
                trip.NormalPrice = trips.NormalPrice;

                trip.URL = trips.URL
                booking.BookingList.push(trip);

                lastTrip.PaxList = [];
                lastTrip.PaxList = trip.PaxList;
            });

            console.log(booking);

            $http({
                method: 'POST',
                url: apiURL + '/api/VERIFYSLOT',
                data: JSON.stringify(booking),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ERROR.length > 0) {
                    angular.forEach(response.data.ERROR, function (error) {
                        growl.warning(error, { title: 'WARNING!', ttl: 10000 });
                        angular.element('.modal').modal('hide');
                        $scope.autoSelectSeatResult = null;
                    });
                }
                else {
                    //Add to favorite list
                    var personList = {
                        passengerlist: [],
                        securitytoken: $cookies.get('UI_TOKEN')
                    };

                    angular.forEach(lastTrip.PaxList, function (passenger) {
                        console.log(passenger.SaveFav);
                        if (passenger.SaveFav != undefined && passenger.SaveFav) {
                            var person = {
                                FullName: passenger.Name,
                                IC: passenger.IC,
                                DOB: passenger.DOB,
                                Gender: passenger.GENDER,
                                AdultChild: passenger.ADULTCHILD,
                                TicketType: passenger.TICKETTTYPE,
                                KonsesiID: passenger.KONSESIID
                            };
                            personList.passengerlist.push(person);
                        }
                    });

                    console.log(personList);

                    $http({
                        method: 'POST',
                        url: apiURL + '/api/STOREFAVORITEPASSENGER',
                        data: JSON.stringify(personList),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function onSuccess(response) {
                        console.log('Save favorite status: ' + response.data);
                    }).catch(function onError(response) {
                        growl.error(response.statusText + ' at line 946, ticket.js', { title: 'ERROR!' });
                    });

                    //Proceed to booking summary pop-up
                    booking.VerificationResult = response.data;
                    booking.IsReturn = isreturn;

                    angular.forEach(booking.BookingList, function (autotrip) {
                        angular.forEach(autotrip.PaxList, function (pax) {
                            angular.forEach(response.data.AUTOSEATRESULT, function (result) {
                                angular.forEach(result.PaxList, function (pax) {
                                    var data = {
                                        Paxinfo: {
                                            OriginCode: result.OriginCode,
                                            DestinationCode: result.DestinationCode,
                                            DateJourney: result.DateJourney,
                                            TrainNumber: result.TrainNumber,
                                            CoachCode: result.CoachCode,
                                            OnwardReturn: result.OnwardReturn,
                                            AdultChild: pax.ADULTCHILD,
                                            TICKETTTYPE: pax.TICKETTTYPE,
                                            LabelName: pax.LABELNAME,
                                            SlotId: pax.SLOTID,
                                        },
                                        isAgent: false
                                    };
                                    $http({
                                        method: 'POST',
                                        url: apiURL + '/api/GETFAREDETAIL',
                                        data: JSON.stringify(data),
                                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                                    }).then(function onSuccess(response) {
                                        console.log(response.data);
                                        if (response.data.ERROR.length > 0) {
                                            angular.forEach(response.data.ERROR, function (err) {
                                                console.log('ERROR!: ' + err);
                                            });
                                        }
                                        else
                                            pax.IndividualFare = response.data.NORMALCHARGE
                                    }).catch(function onError(response) {
                                        console.log('ERROR!: ' + response.statusText + ' at line 1725, ticket.js');
                                    });
                                });

                                if (autotrip.OriginCode == result.OriginCode && autotrip.DestinationCode == result.DestinationCode)
                                    autotrip.PaxList = result.PaxList;
                            });
                        });
                    });

                    $scope.autoSelectSeatResult = booking;
                    $scope.showModal('#autoSelectSeat');
                    console.log(booking);
                }
            }).catch(function onError(response) {
                growl.error(response.statusText, { title: 'ERROR!' });
            });

        };

        $scope.getLabels = function () {
            console.log("TicketController.getLabels triggered.");
            if (sessionStorage.readyForSeating == null || sessionStorage.readyForSeating == undefined)
                if (sessionStorage.bookingConfirmation == null || sessionStorage.bookingConfirmation == undefined)
                    $window.location.href = baseURL;

            var booking = (sessionStorage.readyForSeating == null || sessionStorage.readyForSeating == undefined) ? JSON.parse(sessionStorage.bookingConfirmation) : JSON.parse(sessionStorage.readyForSeating);
            if (booking.BookingList.length > 0) {
                //GET LABELS
                angular.forEach(booking.BookingList, function (trips) {
                    console.log(trips);
                    $scope.previousURL = trips.URL;
                    trips.LabelInfo = [];
                    if (booking.BookingList.length > 0) {
                        console.log(apiURL + '/api/LABELLIST?OriginCode=' + trips.OriginCode + '&DestinationCode=' + trips.DestinationCode + '&DateJourney=' + trips.DateJourney + '&TrainNumber=' + trips.TrainNumber + '&CoachCode=' + trips.CoachCode);
                        $http({
                            method: 'GET',
                            url: apiURL + '/api/LABELLIST?OriginCode=' + trips.OriginCode + '&DestinationCode=' + trips.DestinationCode + '&DateJourney=' + trips.DateJourney + '&TrainNumber=' + trips.TrainNumber + '&CoachCode=' + trips.CoachCode
                        }).then(function onSuccess(response) {
                            //GET ALL SEATS
                            if (response.data.length > 0) {
                                //GET SLOTS
                                var count = 1;
                                //$scope.TrainCoachInfo = response;
                                //console.log("yus", TrainCoachInfo);
                                angular.forEach(response.data, function (label) {
                                    var LabelInfo = { LabelName: label.LABEL_NAME };
                                    trips.LabelInfo.push(LabelInfo);

                                    if (count == 1)//Populate seatings for the first label found
                                        $scope.getSeats(trips.OriginCode, trips.DestinationCode, trips.DateJourney, trips.TrainNumber, trips.CoachCode, label.LABEL_NAME);
                                    count++;

                                    if (trips.CurrentShowLabel == null || trips.CurrentShowLabel == undefined)
                                        trips.CurrentShowLabel = label.LABEL_NAME;
                                });
                            }
                        }).catch(function onError(response) {
                            console.log(response);
                            growl.error(response.statusText, { title: 'ERROR!' });
                        });
                    }

                    GetAdultPriceBreakdownStep4(trips, trips.PaxList, 0);
                    GetChildPriceBreakdownStep4(trips, trips.PaxList, 0);
                });
                console.log("booking", booking);
                $scope.BookingInfoWithLabel = booking;
            }
            else
                $window.location.href = baseURL + '/ticket/passenger';
        };

        $scope.getSeats = function (origin, destination, datejourney, trainnumber, coachcode, label) {
            console.log("TicketController.getSeats triggered.");
            $rootScope.spinnerShow = true;
            //console.log(origin + ', ' + destination + ', ' + datejourney + ', ' + trainnumber + ', ' + coachcode + ', ' + label);
            $http({
                method: 'GET',
                url: apiURL + '/api/SLOTLIST?OriginCode=' + origin + '&DestinationCode=' + destination + '&DateJourney=' + datejourney + '&TrainNumber=' + trainnumber + '&CoachCode=' + coachcode + '&Label=' + label
            }).then(function onSuccess(response) {
                console.log(response.data);
                var seats = [];
                var tempSeatList = [];
                var seatByRow = { SeatList: [] };
                console.log(response);

                var uniqueRow = [];
                var v = 0;
                angular.forEach(response.data, function (seating) {
                    if (seating.SORT != v) {
                        v = seating.SORT;
                        uniqueRow.push(seating);
                    }
                });

                angular.forEach(uniqueRow, function (seat) {
                    console.log(seat);

                    console.log('--- SORT ' + seat.SORT + ' ---')
                    console.log('Origin: ' + seatByRow.OriginCode + ', Destination: ' + seatByRow.DestinationCode + ', Label: ' + seatByRow.LabelCode);

                    seatByRow = { SeatList: [] };
                    tempSeatList = [];//Initialize
                    angular.forEach(response.data, function (seatagain) {
                        if (seat.SORT == seatagain.SORT) {
                            tempSeatList.push(seatagain);
                            seatByRow.Row = seatagain.SORT;
                        }
                    });

                    seatByRow.LabelCode = label;
                    seatByRow.OriginCode = origin;
                    seatByRow.DestinationCode = destination;
                    seatByRow.SeatList = tempSeatList;
                    seats.push(seatByRow);
                });

                console.log(seats);

                var booking = $scope.BookingInfoWithLabel;
                angular.forEach(booking.BookingList, function (trips) {
                    if (trips.OriginCode == origin && trips.DestinationCode == destination) {
                        trips.AllSeats = seats;
                        trips.CurrentShowLabel = label;

                        var n = 0;
                        angular.forEach(seats, function (seat) {
                            angular.forEach(seat.SeatList, function (s) {
                                if (s.STATUS == 'A')
                                    n++;
                            });
                        });
                        trips.CurrentSeatAvailable = n;
                    }
                });
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                growl.error(response.statusText, { title: 'ERROR!' });
            });
        };

        $scope.setCurrentPassenger = function (id) {
            console.log("TicketController.setCurrentPassenger triggered.");
            $scope.selectedInit = id;
        };


        //$scope.checkSeatCount function still need enhancement
        $scope.checkSeatCount = function ($event) {
            //console.log('yus',$event.target.id.toString());

            ////$event.target.css("background-image", url('../seat/hsd.png'));
            //$(event.target).css("cursor", "wait");

            //console.log('yus',  $(event.target).prop("class"));


            console.log("TicketController.checkSeatCount triggered.");
            console.log('----CURRENT SELECTED PASSENGER----');
            console.log($scope.selectedInit);
            console.log('----CURRENT CHECKBOX ID----');
            console.log($event.target.id);

            var chckbxid = $event.target.id.toString();;
            var originCode = $event.target.id.split('_')[0];
            var destinationCode = $event.target.id.split('_')[1];
            var labelCode = $event.target.id.split('_')[2];
            var seatCode = $event.target.id.split('_')[3];

            if ($event.target.checked) {
                console.log('----SEAT CHECKED----');
                console.log(originCode + ', ' + destinationCode + ', ' + labelCode + ', ' + seatCode);
                //console.log('yus');
                //$(this).addClass('seatUpSelected');
                ////$(this).addClass('seatUpSelected').siblings().removeClass('seatUpSelected');
                //console.log('yus2');
                angular.forEach($scope.BookingInfoWithLabel.BookingList, function (booking) {
                    if (booking.OriginCode == originCode && booking.DestinationCode == destinationCode) {
                        angular.forEach(booking.PaxList, function (person) {
                            if (person.TempId == $scope.selectedInit) {
                                if (person.LABELNAME == 'TBD' && person.SLOTID == 'TBD') {
                                    person.LABELNAME = labelCode;
                                    person.SLOTID = seatCode;
                                }
                                else {
                                    var prevchckbxid = originCode.toString() + '_' + destinationCode.toString() + '_' + person.LABELNAME.toString() + '_' + person.SLOTID.toString();
                                    console.log('----PREVIOUS CHECKED SEAT----');
                                    console.log(prevchckbxid);
                                    $scope.selectedSeat[prevchckbxid] = false;
                                    person.LABELNAME = labelCode;
                                    person.SLOTID = seatCode;
                                }
                            }
                        });
                    }
                    $scope.AdultPriceBreakdown = [];
                    $scope.ChildPriceBreakdown = [];
                    GetAdultPriceBreakdownStep4(booking, booking.PaxList, 0);
                    GetChildPriceBreakdownStep4(booking, booking.PaxList, 0);
                });

            }
            else {
                console.log('----SEAT UNCHECKED----');
                console.log(originCode + ', ' + destinationCode + ', ' + labelCode + ', ' + seatCode);

                angular.forEach($scope.BookingInfoWithLabel.BookingList, function (booking) {
                    if (booking.OriginCode == originCode && booking.DestinationCode == destinationCode) {
                        angular.forEach(booking.PaxList, function (person) {
                            //Add one more level of checking where the seat previously selected - to avoid double seating
                            var validUncheck = {
                                isvalid: true,
                                rightfulowner: ''
                            };
                            angular.forEach($scope.BookingInfoWithLabel.BookingList, function (booking) {
                                if (booking.OriginCode == originCode && booking.DestinationCode == destinationCode) {
                                    angular.forEach(booking.PaxList, function (person) {
                                        //Seat already selected for someone else other then current selected passenger
                                        if (person.LABELNAME == labelCode && person.SLOTID == seatCode && person.TempId != $scope.selectedInit) {
                                            validUncheck.isvalid = false;
                                            validUncheck.rightfulowner = person.Name
                                        }

                                    });
                                }
                            });

                            if (validUncheck.isvalid) {
                                if (person.TempId == $scope.selectedInit) {
                                    person.LABELNAME = 'TBD';
                                    person.SLOTID = 'TBD';
                                }
                            }
                            else {
                                growl.info('Seat ' + labelCode + ' in coach ' + seatCode + ' is already selected for ' + validUncheck.rightfulowner, { title: 'WE ARE SORRY...', ttl: 5000 });
                                var validchckbxid = originCode.toString() + '_' + destinationCode.toString() + '_' + labelCode.toString() + '_' + seatCode.toString();
                                $scope.selectedSeat[validchckbxid] = true;
                            }

                        });
                    }
                    $scope.AdultPriceBreakdown = [];
                    $scope.ChildPriceBreakdown = [];
                    GetAdultPriceBreakdownStep4(booking, booking.PaxList, 0);
                    GetChildPriceBreakdownStep4(booking, booking.PaxList, 0);
                });

            }

            //Validate the seating info - proceed if the information completed
            var failcount = 0;
            angular.forEach($scope.BookingInfoWithLabel.BookingList, function (booking) {
                angular.forEach(booking.PaxList, function (person) {
                    if (person.LABELNAME == 'TBD' && person.SLOTID == 'TBD')
                        failcount++;
                });
            });

            if (failcount > 0) {
                $scope.readyToProceed = false;
            }
            else
                $scope.readyToProceed = true;
        };

        $scope.confirmBooking = function () {
            console.log("TicketController.confirmBooking triggered.");
            delete sessionStorage.counterMin;
            delete sessionStorage.counterSec;
            console.log($scope.BookingInfoWithLabel);
            console.log($scope.autoSelectSeatResult);

            var booking = $scope.BookingInfoWithLabel;

            if ($scope.BookingInfoWithLabel == undefined)
                booking = $scope.autoSelectSeatResult;

            booking.AutoSelectSeat = false;
            console.log(booking);

            $http({
                method: 'POST',
                url: apiURL + '/api/VERIFYSLOT',
                data: JSON.stringify(booking),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ERROR.length > 0 || response.data.SLOTERROR.length > 0) {
                    angular.forEach(response.data.ERROR, function (error) {
                        growl.error(error, { title: 'ERROR!' });
                    });

                    angular.forEach(response.data.SLOTERROR, function (error) {
                        growl.error(error, { title: 'ERROR!' });
                    });
                }
                else {
                    console.log('---FINAL VERIFICATION---');
                    console.log(response.data);
                    $http({
                        method: 'POST',
                        url: apiURL + '/api/CONFIRMSLOT',
                        data: JSON.stringify(booking),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function onSuccess(response) {
                        console.log(response.data);
                        if (response.data.ERROR.length > 0 || response.data.SLOTERROR.length > 0) {
                            angular.forEach(response.data.ERROR, function (error) {
                                growl.error(error, { title: 'ERROR!' });
                            });

                            angular.forEach(response.data.SLOTERROR, function (error) {
                                growl.error(error, { title: 'ERROR!' });
                            });
                        }
                        else {
                            console.log('---CONFIRMATION---');
                            console.log(response.data);
                            booking.ConfirmationResult = response.data;
                            console.log(booking);
                            sessionStorage.bookingConfirmation = JSON.stringify(booking);
                            $window.location.href = baseURL + '/ticket/confirmation';
                        }
                    }).catch(function onError(response) {
                        growl.error(response.statusText, { title: 'ERROR!' });
                    });
                }
            }).catch(function onError(response) {
                growl.error(response.statusText, { title: 'ERROR!' });
            });

        };

        $scope.finalConfirmation = function () {
            console.log("TicketController.finalConfirmation triggered.");
            if (sessionStorage.bookingConfirmation === null || sessionStorage.bookingConfirmation === undefined)
                $window.location.href = baseURL;

            var confirmation = JSON.parse(sessionStorage.bookingConfirmation);
            $scope.FinalConfirmation = confirmation;
            console.log($scope.FinalConfirmation);
            
            $http({
                method: 'GET',
                url: apiURL + '/api/TICKETTYPELIST?DateJourney=' + confirmation.BookingList[0].DateJourney + '&Tren=' + confirmation.BookingList[0].TrainNumber + '&Origin=' + confirmation.BookingList[0].OriginCode + '&Dest=' + confirmation.BookingList[0].DestinationCode,
               
            }).then(function onSuccess(response) {
                $scope.ticketTypeList = response.data;
                $scope.ticketTypeListNew =
                    [
                        { "CODE": "1", "DESCRIPTION": "ORDINARY TICKET", "DESCRIPTION_MALAY": "Tiket Biasa" },
                        { "CODE": "4", "DESCRIPTION": "DISABLED", "DESCRIPTION_MALAY": "Orang Kurang Upaya" },
                    ];

            }).catch(function onError(response) {
                growl.error(response.statusText, { title: 'ERROR!' });
            });
        };

        $scope.startCheckTXTime = new Date();
        $scope.getReceipt = function () {
            console.log("TicketController.getReceipt triggered.");
            $rootScope.spinnerShow = true;
            if (sessionStorage.bookingConfirmation === null || sessionStorage.bookingConfirmation === undefined)
                $window.location.href = baseURL;

            var confirmation = JSON.parse(sessionStorage.bookingConfirmation);
            $scope.FinalConfirmation = confirmation;
            console.log($scope.FinalConfirmation);

            //Double check to ensure the transaction is successfull
            var data = {
                RefId: confirmation.ConfirmationResult.REFID,
                securitytoken: $cookies.get('UI_TOKEN')
            };

            $http({
                method: 'POST',
                url: apiURL + '/api/CHECKTRANSACTIONSTATUS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                $scope.ticketData = response.data;
                if (response.data.ErrorList != null) {
                    $window.location.href = baseURL + '/ticket/paymentfailed/' + confirmation.ConfirmationResult.REFID;
                }
                else
                    $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });

            $http({
                method: 'GET',
                url: apiURL + '/api/TICKETTYPELIST?DateJourney=' + confirmation.BookingList[0].DateJourney + '&Tren=' + confirmation.BookingList[0].TRAIN_NUMBER + '&Origin=' + confirmation.BookingList[0].Origin + '&Dest=' + confirmation.BookingList[0].Destination,
            }).then(function onSuccess(response) {
                console.log(confirmation.BookingList[0].DateJourney);
                $scope.ticketTypeList = response.data;
                $scope.ticketTypeListNew =
                    [
                        { "CODE": "1", "DESCRIPTION": "ORDINARY TICKET", "DESCRIPTION_MALAY": "Tiket Biasa" },
                        { "CODE": "4", "DESCRIPTION": "DISABLED", "DESCRIPTION_MALAY": "Orang Kurang Upaya" },
                    ];
            }).catch(function onError(response) {
                growl.error(response.statusText, { title: 'ERROR!' });
            });
        };

        $scope.waitingForPaymentOld = function () {
            console.log("TicketController.waitingForPayment triggered.");
            if (sessionStorage.bookingConfirmation === null || sessionStorage.bookingConfirmation === undefined)
                $window.location.href = baseURL;
            var confirmation = JSON.parse(sessionStorage.bookingConfirmation);
            $scope.FinalConfirmation = confirmation;
            console.log($scope.FinalConfirmation);
            var data = {
                RefId: confirmation.ConfirmationResult.REFID,
                securitytoken: $cookies.get('UI_TOKEN')
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/CHECKTRANSACTIONSTATUS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log("CheckTransactionStatus " + response.data);
                if (response.data.ErrorList == null)
                {
                    setInterval(function (){ $scope.waitingForPayment();}, 60000);
                }
                else
                {
                    console.log('check ' + response.data.ErrorList);

                    if (response.data.ErrorList.indexOf("SUCCESS")>=0)
                    {
                        console.log('Printing ticket ' + response.data);
                        $scope.printTicket(confirmation.ConfirmationResult.REFID);
                    }
                    else 
                    {
                        console.log('CHECKTRANSACTIONSTATUS ' + response.data);
                    }
                }


                //if (response.data.ErrorList != null) {
                //    setInterval(function () {
                //        $scope.waitingForPayment();
                //    }, 60000);
                //    $scope.getTicket(confirmation.ConfirmationResult.REFID);
                //}
                //else
                //    console.log(response.data);
                   // $window.location.href = baseURL + '/ticket/print/' + confirmation.ConfirmationResult.REFID;
            }).catch(function onError(response) {
                console.log('ERROR! ' + response);
                $window.location.href = baseURL + '/ticket/paymentfailed/999999999999';
            });
        };

        //initiate timer every 30s
        $scope.waitingForPayment = function () {
            console.log("TicketController.waitingForPayment triggered.");           
            sessionStorage.myTimer = setInterval(function () { $scope.checkForPayment(); }, 30000);
        }
        //check for payment + reset interval timer once success/fail
        
        $scope.checkForPayment = function () {
            console.log("TicketController.checkForPayment triggered.");
            console.log("Timer " + sessionStorage.myTimer);

            ////Exit clause for the interval
            ////----------------------------
            //var now1 = new Date();
            //console.log(sessionStorage.counterMin1);
            //if (sessionStorage.counterMin1 != null && sessionStorage.counterMin1 != undefined && sessionStorage.counterSec1 != null && sessionStorage.counterSec1 != undefined) {
            //    now1.setMinutes(now1.getMinutes() + Number(sessionStorage.counterMin1.toString()));
            //    now1.setSeconds(now1.getSeconds() + Number(sessionStorage.counterSec1.toString()));
            //}
            //else
            //    now1.setMinutes(now1.getMinutes() + 6);
            //var t1 = getTimeRemaining(now1);
            //$scope.counterMin1 = t1.minutes;
            //$scope.counterSec1 = t1.seconds;

            //console.log(t1.minutes);

            //sessionStorage.counterMin1 = $scope.counterMin1;
            //sessionStorage.counterSec1 = $scope.counterSec1;

            //if (t1.minutes <= 0 && t1.seconds <= 0) {
            //    sessionStorage.counterMin1 = 0;
            //    sessionStorage.counterSec1 = 0;
            //    clearInterval(sessionStorage.myTimer);
            //    console.log('Transaction Time Out - API');
            //    return;
            //}
            ////=============================

           if (sessionStorage.bookingConfirmation === null || sessionStorage.bookingConfirmation === undefined) {
                $window.location.href = baseURL;
            }
            var confirmation = JSON.parse(sessionStorage.bookingConfirmation);
            $scope.FinalConfirmation = confirmation;
            console.log($scope.FinalConfirmation);

            var data = {
                RefId: confirmation.ConfirmationResult.REFID,
                securitytoken: $cookies.get('UI_TOKEN')
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/CHECKTRANSACTIONSTATUS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                //success payment  <-- print ticket
                //or still processing  <-- loop 
                //or error <-- loop
                //timeout <-- exit loop payment fail
                console.log('read data');

                if (response.data.ErrorList == null)
                {
                    console.log('Null ');
                    return;
                }
                
                var arr = response.data.ErrorList;
                var res = arr.toString();
                console.log("Response - " + res);      

                if (res.indexOf("SUCCESS") != -1) {
                    console.log('Printing ticket: ' + response.data.ErrorList);
                    clearInterval(sessionStorage.myTimer);
                    $window.location.href = baseURL + '/ticket/print/' + confirmation.ConfirmationResult.REFID;
                    //$scope.printTicket(confirmation.ConfirmationResult.REFID);
                }
               
                if (res.indexOf("Error[1]") != -1) {
                    console.log('Transaction Unsuccessful: ' + response.data.ErrorList);
                    clearInterval(sessionStorage.myTimer);
                    //$scope.printTicket(confirmation.ConfirmationResult.REFID);
                }

                if (res.indexOf("Error[2]") != -1) {
                    console.log('Transaction Still In Progress: ' + response.data.ErrorList);
                }
                
                if (res.indexOf("Error[3]") != -1) {
                    //transaction time out - reselect? end?
                    console.log('Transaction Time Out ' + response.data.ErrorList);
                    clearInterval(sessionStorage.myTimer);
                    $scope.showModal('#expired');
                    //$window.location.href = baseURL + '/ticket/ReselectSeat/' + confirmation.ConfirmationResult.REFID;
                }

               
                if (res.indexOf("Error[7]") != -1) {
                    //transaction time out - reselect? end?
                    console.log('Creating Ticket Failed ' + response.data.ErrorList);
                    clearInterval(sessionStorage.myTimer);
                    $window.location.href = baseURL + '/ticket/ReselectSeat/' + confirmation.ConfirmationResult.REFID;

                }
                return;
            }).catch(function onError(response) {
                console.log('ERROR! ' + response);
                clearInterval(sessionStorage.myTimer);
               // $window.location.href = baseURL + '/ticket/paymentfailed/999999999999';
            });
        };


        $scope.paymentGateway = function (channel) {
            console.log("TicketController.paymentGateway triggered.");
            sessionStorage.bookingConfirmation = JSON.stringify($scope.FinalConfirmation);
            console.log(channel);
            


            if (channel == 'CC') {
                $window.location.href = apiURL + '/PaymentCard.aspx?amount=' +
                $scope.FinalConfirmation.ConfirmationResult.FINALCHARGE.replace('MYR ', '') + '&refid=' +
                $scope.FinalConfirmation.ConfirmationResult.REFID.replace('MYR ', '') + '&securitytoken=' +
                encodeUriQuery($scope.FinalConfirmation.SecurityToken);
            }

            if (channel == 'M2U') {
                $window.location.href = apiURL + '/PaymentBank.aspx?amount=' +
                $scope.FinalConfirmation.ConfirmationResult.FINALCHARGE.replace('MYR ', '') + '&refid=' +
                $scope.FinalConfirmation.ConfirmationResult.REFID.replace('MYR ', '') + '&Pmode=' + channel + '&securitytoken=' +
                encodeUriQuery($scope.FinalConfirmation.SecurityToken);
            }

            if (channel == 'BSN') {
                var path = apiURL + '/PaymentBank.aspx?amount=' +
                $scope.FinalConfirmation.ConfirmationResult.FINALCHARGE.replace('MYR ', '') + '&refid=' +
                $scope.FinalConfirmation.ConfirmationResult.REFID.replace('MYR ', '') + '&Pmode=' + channel + '&securitytoken=' +
                encodeUriQuery($scope.FinalConfirmation.SecurityToken);
                $window.open(path, '_blank', 'height=650,width=888');
                $window.location.href = baseURL + '/ticket/waitingforpayment';//Go and wait at this page
            }

            if (channel == '88') {
                var path = apiURL + '/PaymentGateway.aspx?amount=' +
                $scope.FinalConfirmation.ConfirmationResult.FINALCHARGE.replace('MYR ', '') + '&refid=' +
                $scope.FinalConfirmation.ConfirmationResult.REFID.replace('MYR ', '') + '&securitytoken=' +
                encodeUriQuery($scope.FinalConfirmation.SecurityToken);
                $window.open(path, '_blank', 'height=650,width=888');
                //$window.location.href = baseURL + '/ticket/waitingforpayment';//Go and wait at this page
                $window.location.href = baseURL + '/ticket/waitingforpayment';//Go and wait at this page
            }

            if (channel == 'L') {
                $rootScope.spinnerShow = true;
                var refId = $scope.FinalConfirmation.ConfirmationResult.REFID;

                var viptoken = null;
                if ($scope.FinalConfirmation.ConfirmationResult.NEWSECURITYTOKEN != null)
                    viptoken = $scope.FinalConfirmation.ConfirmationResult.NEWSECURITYTOKEN;

                var data = {
                    refid: refId,
                    securitytoken: viptoken == null ? $cookies.get('UI_TOKEN') : viptoken
                };

                $http({
                    method: 'POST',
                    url: apiURL + '/api/CONFIRMLEDGERTRANSACTION',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);
                    if (response.data.ErrorList != null) {
                        angular.forEach(response.data.ErrorList, function (error) {
                            growl.error(error, { title: 'ERROR!', ttl: '10000' });
                        });
                    }
                    else
                        $window.location.href = baseURL + '/ticket/print/' + refId;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    $rootScope.spinnerShow = false;
                    console.log('ERROR! ' + response);
                });
            }

            //Currently not is use
            if (channel == 'IB') {
                $window.location.href = apiURL + '/PaymentGateway.aspx?devcode=112233&amount=' +
                $scope.FinalConfirmation.ConfirmationResult.FINALCHARGE.replace('MYR ', '') + '&refid=' +
                $scope.FinalConfirmation.ConfirmationResult.REFID.replace('MYR ', '') + '&securitytoken=' +
                encodeUriQuery($scope.FinalConfirmation.SecurityToken);
            }

        };

        $scope.getTicketOld = function (refid) {
            console.log("TicketController.getTicket triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                RefId: refid,
                securitytoken: $cookies.get('UI_TOKEN')
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/CHECKTRANSACTIONSTATUS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ErrorList != null) {
                    $scope.showModal('#txNotSuccess');
                    var ow = false;

                    //$scope.errTitle = "General Error!";
                    //$scope.errMsg = "Unknown error. Please contact system administrator.";

                    if (~response.data.ErrorList[0].indexOf("[-1]")) {
                        $scope.errTitle = "Access Denied!";
                        $scope.errMsg = "This ticket may not belong to you. If this is happen in error, please re-login and try again.<br /><br />E-Ticket Ref. ID : <b>" + refid + "</b>";
                    }

                    if (~response.data.ErrorList[0].indexOf("[1]")) {
                        angular.element('.modal').modal('hide');
                        //$scope.errTitle = "Transaction Unsuccesful!";
                        //$scope.errMsg = "We are sorry to inform that your transaction is unsuccessful.<br /><br />E-Ticket Ref. ID : <b>" + refid + "</b>";
                        ow = true;
                        var data = {
                            RefID: refid,
                            securitytoken: $cookies.get('UI_TOKEN')
                        };
                        $http({
                            method: 'POST',
                            url: apiURL + '/api/RESELECTION',
                            data: JSON.stringify(data),
                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                        }).then(function onSuccess(response) {
                            console.log(response.data);
                            $scope.ReselectSeat = response.data;
                            if (response.data.isApproved) {
                                $scope.ReselectSeat = response.data;
                                console.log($scope.ReselectSeat);
                                $window.location.href = baseURL + '/ticket/reselectseat?refid=' + refid;
                            }
                            else {
                                $scope.errTitle = "Transaction Unsuccesful!";
                                $scope.errMsg = "We are sorry to inform that your transaction is unsuccessful.<br /><br />E-Ticket Ref. ID : <b>" + refid + "</b>";
                            }
                            $scope.showModal('#txNotSuccess');
                            $rootScope.spinnerShow = false;
                        }).catch(function onError(response) {
                            $rootScope.spinnerShow = false;
                            console.log('ERROR! ' + response);
                        });
                    }

                    if (~response.data.ErrorList[0].indexOf("[2]")) {
                        $scope.errTitle = "Transaction In Progress!";
                        $scope.errMsg = "Your recent transaction currently in progress. For registered user, please log in to Manage Booking to check transaction status. For guest user, an email will be sent once transaction successful.<br /><br /> Please be inform if transaction appeared to be unsuccessful within 24 hours, please call our Callcenter to proceed refund process.<br /><br />E-Ticket Ref. ID : <b>" + refid + "</b>";
                    }

                    $scope.errTitle = "General Error!";
                    $scope.errMsg = "Unknown error. Please contact system administrator.";
                }
                $scope.PrintTicket = response.data;
                $rootScope.spinnerShow = ow;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };

        $scope.getTicket = function (refid) {
            console.log("TicketController.getTicket triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                RefId: refid,
                securitytoken: $cookies.get('UI_TOKEN')
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/CHECKTRANSACTIONSTATUS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ErrorList == null) {
                    $scope.showModal('#txNotSuccess');
                    var ow = false;
                }
                else {
                    $scope.PrintTicket = response.data;
                }
                $rootScope.spinnerShow = ow;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };


        $scope.getGuestTicketOld = function () {
            console.log("TicketController.getGuestTicket triggered.");
            $rootScope.spinnerShow = true;
            $scope.refId = getUrlParameter('refid', $location.absUrl());
            var data = {
                RefId: getUrlParameter('refid', $location.absUrl()),
                securitytoken: decodeURIComponent(getUrlParameter('securitytoken', $location.absUrl()))
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/CHECKTRANSACTIONSTATUS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ErrorList != null) {
                    $scope.showModal('#txNotSuccess');

                    $scope.errTitle = "General Error!";
                    $scope.errMsg = "Unknown error. Please contact system administrator.";

                    if (~response.data.ErrorList[0].indexOf("[-1]")) {
                        $scope.errTitle = "Access Denied!";
                        $scope.errMsg = "This ticket may not belong to you. If this is happen in error, please re-login and try again.<br /><br />E-Ticket Ref. ID : <b>" + $scope.refId + "</b>";
                    }

                    if (~response.data.ErrorList[0].indexOf("[1]")) {
                        $scope.errTitle = "Transaction Unsuccesful!";
                        $scope.errMsg = "We are sorry to inform that your transaction is unsuccessful.<br /><br />E-Ticket Ref. ID : <b>" + $scope.refId + "</b>";
                    }

                    if (~response.data.ErrorList[0].indexOf("[2]")) {
                        $scope.errTitle = "Transaction In Progress!";
                        $scope.errMsg = "Your recent transaction currently in progress. For registered user, please log in to Manage Booking to check transaction status. For guest user, an email will be sent once transaction successful.<br /><br /> Please be inform if transaction appeared to be unsuccessful within 24 hours, please call our Callcenter to proceed refund process.<br /><br />E-Ticket Ref. ID : <b>" + $scope.refId + "</b>";
                    }
                    //$scope.errTitle = "General Error!";
                    //$scope.errMsg = "Unknown error. Please contact system administrator.";

                }
                $scope.PrintTicket = response.data;
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };

        $scope.getGuestTicket = function () {
            console.log("TicketController.getGuestTicket triggered.");
            $rootScope.spinnerShow = true;
            $scope.refId = getUrlParameter('refid', $location.absUrl());
            var data = {
                RefId: getUrlParameter('refid', $location.absUrl()),
                securitytoken: decodeURIComponent(getUrlParameter('securitytoken', $location.absUrl()))
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/TICKETDETAILS',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ErrorList == null) {
                    $scope.showModal('#txNotSuccess');

                    $scope.errTitle = "General Error!";
                    $scope.errMsg = "Unknown error. Please contact system administrator.";
                }
                else {
                    $scope.PrintTicket = response.data;
                }
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };



        $scope.printTicket = function (refid) {
            console.log("TicketController.printTicket triggered.");
            $window.location.href = apiURL + '/PrintPDF.aspx?SecurityToken=' + encodeUriQuery($cookies.get('UI_TOKEN')) + '&Refid=' + refid;
        };

        

         $scope.prepareReselect = function () {
             console.log("TicketController.getPrepareReselection triggered.");
             $rootScope.spinnerShow = true;
             var refid = getUrlParameter('refid', $location.absUrl());
             var data = {
                 RefId: refid,
                 securitytoken: $cookies.get('UI_TOKEN')
             };
             console.log(data);
             $http({
                 method: 'POST',
                 url: apiURL + '/api/PRERESELECTION',
                 data: JSON.stringify(data),
                 headers: { 'Content-Type': 'application/json; charset=utf-8' }
             }).then(function onSuccess(response) {
                 console.log(response.data);
                 $scope.reselectionData = response.data;
                // console.log('1' +response);
                // console.log('22', sessionStorage.readyForSeating); // find this info.. to fill up back session 
                // sessionStorage.readyForSeating = JSON.stringify(booking);

                //var booking = JSON.parse(sessionStorage.readyForSeating);
                //console.log('2');
                //console.log(booking);
                 //console.log($scope.reselectionData);

                 angular.forEach(response.data.ListJourney, function (res) {
                     console.log('OriginCode', res.OriginCode);
                     console.log('DestinationCode', res.DestinationCode);
                     console.log('OriginName', res.OriginName);
                     console.log('DestinationName', res.DestinationName);
                     console.log('TrainNumber', res.TrainNumber);
                     console.log('CoachCode', res.CoachCode);
                     console.log('TrainDate', res.TrainDate);

                     res.LabelInfo = [];
                     var count = 1;
                     angular.forEach(res.ListLabel, function (label) {
                         console.log('Label start');

                            var LabelInfo = { LabelName: label.LABEL_NAME };
                            res.LabelInfo.push(LabelInfo);
                            console.log('Label2');

                            if (count == 1)//Populate seatings for the first label found
                                console.log('Label3');

                            $scope.getSeats(res.OriginCode, res.DestinationCode, res.DateJourney, res.TrainNumber, res.CoachCode, label.LABEL_NAME);
                            console.log('Label4');

                            count++;

                            console.log('Label5');

                            if (res.CurrentShowLabel == null || res.CurrentShowLabel == undefined)
                                res.CurrentShowLabel = label.LABEL_NAME;
                     });
                 });              

                

                 //===================================================================================================
                  //console.log("TicketController.getLabels triggered.");
                  //  if (sessionStorage.readyForSeating == null || sessionStorage.readyForSeating == undefined)
                  //      if(sessionStorage.bookingConfirmation == null || sessionStorage.bookingConfirmation == undefined)
                  //          $window.location.href = baseURL;

                  //  var booking = (sessionStorage.readyForSeating == null || sessionStorage.readyForSeating == undefined) ? JSON.parse(sessionStorage.bookingConfirmation): JSON.parse(sessionStorage.readyForSeating);
                  //  if (booking.BookingList.length > 0) {
                  //      //GET LABELS
                  //      angular.forEach(booking.BookingList, function (trips) {
                  //          console.log(trips);
                  //          $scope.previousURL = trips.URL;
                  //          trips.LabelInfo =[];
                  //          if (booking.BookingList.length > 0) {
                  //              response.data.ListJourney.OriginCode
                  //              console.log(apiURL + '/api/LABELLIST?OriginCode=' +trips.OriginCode + '&DestinationCode=' +trips.DestinationCode + '&DateJourney=' +trips.DateJourney + '&TrainNumber=' +trips.TrainNumber + '&CoachCode=' +trips.CoachCode);
                  //              $http({
                  //                      method: 'GET',
                  //                      url: apiURL + '/api/LABELLIST?OriginCode=' +trips.OriginCode + '&DestinationCode=' +trips.DestinationCode + '&DateJourney=' +trips.DateJourney + '&TrainNumber=' +trips.TrainNumber + '&CoachCode=' +trips.CoachCode
                  //              }).then(function onSuccess(response) {
                  //                  //GET ALL SEATS
                  //                  if (response.data.length > 0) {
                  //                  //GET SLOTS
                  //                      var count = 1;
                  //                          //$scope.TrainCoachInfo = response;
                  //                              //console.log("yus", TrainCoachInfo);
                  //                              angular.forEach(response.data, function (label) {
                  //                          var LabelInfo = { LabelName: label.LABEL_NAME };
                  //                          trips.LabelInfo.push(LabelInfo);

                  //                              if (count == 1)//Populate seatings for the first label found
                  //                              $scope.getSeats(trips.OriginCode, trips.DestinationCode, trips.DateJourney, trips.TrainNumber, trips.CoachCode, label.LABEL_NAME);
                  //                          count++;

                  //                          if (trips.CurrentShowLabel == null || trips.CurrentShowLabel == undefined)
                  //                              trips.CurrentShowLabel = label.LABEL_NAME;
                  //                              });
                  //                              }
                  //              }).catch(function onError(response) {
                  //                  console.log(response);
                  //                  growl.error(response.statusText, { title: 'ERROR!' });
                  //                  });
                  //              }

                  //          GetAdultPriceBreakdownStep4(trips, trips.PaxList, 0);
                  //          GetChildPriceBreakdownStep4(trips, trips.PaxList, 0);
                  //          });
                  //      console.log("booking", booking);
                  //      $scope.BookingInfoWithLabel = booking;
                  //      }
                  //      else
                  //      $window.location.href = baseURL + '/ticket/passenger';


                 //===================================================================================================


                $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    $rootScope.spinnerShow = false;
                console.log('ERROR! ' +response);
                });
         };

        $scope.getReselection = function () {
            console.log("TicketController.getReselection triggered.");
            $rootScope.spinnerShow = true;
            var refid = getUrlParameter('refid', $location.absUrl());
            var data = {
                RefId: refid,
                securitytoken: $cookies.get('UI_TOKEN')
            };
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/RESELECTION',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
               
                //==================================================================
                //check for transaction
                if (response.data.ErrorList != null) {

                    var arr = response.data.ErrorList;
                    var res = arr.toString();
                    console.log("Response - " + res);
                    $rootScope.spinnerShow = false;
                    //ERR01 Payment Status is not 00,66,99
                    //ERR02 This transaction not allowed for re-submit. Status not P,U
                    //ERR03 Payment iPay88 Failed
                    //ERR04 Payment iPay88 Not Success.
                    //ERR05 Payment Maybank Failed
                    //ERR06 Reselect Failed
                    if (res.indexOf("ERR01") != -1) {
                        $scope.showModal('#infoReselectError');
                        $scope.errTitle = "We are sorry to inform that we could not proceed with the transaction.";
                        $scope.errMsg = "<br />The payment transaction is unsuccessful. " +
                                        "<br /><br />Your REF ID is <b>" + refid + "</b>";
                        return;
                    }
                    if (res.indexOf("ERR02") != -1) {
                        $scope.showModal('#infoReselectError');
                        $scope.errTitle = "We are sorry to inform that we could not proceed with the transaction.";
                        $scope.errMsg = "<br />Please check ticket information via <b>Manage Booking</b> link section. " +
                                        "<br /><br />Your REF ID is <b>" + refid + "</b>";
                        return;
                    }
                    if (res.indexOf("ERR03") != -1) {
                        $scope.showModal('#infoReselectError');
                        $scope.errTitle = "We are sorry to inform that we could not proceed with the transaction.";
                        $scope.errMsg = "<br />The payment transaction result from iPay88 is unsuccessful. " +
                                        "<br /><br />Your REF ID is <b>" + refid + "</b>";
                        return;
                    }

                    if (res.indexOf("ERR04") != -1) {
                        $scope.showModal('#infoReselectError');
                        $scope.errTitle = "We are sorry to inform that we have yet to received any payment confirmation from the bank.";
                        $scope.errMsg = "However, if the payment has been made, <b>seat reselection</b> process is required to be done by going to the " +
                                        "<b>Reselect Seat link under Manage Booking</b> section. During this process, system will help to reconfirm the payment with the bank. " +
                                        "Once the payment is confirmed, new seat can be selected accordingly. <b>There will be no additional payment required.</b>" +
                                        "<br /><br />After the above steps have been performed and the ticket is yet to be obtained, " +
                                        "the refund process will take place. We are sincerely apologize for the inconvenience caused and we will try our best " +
                                        "to refund the payment soonest possible. Refund status can be tracked via the <b>Refund Link under Manage Booking</b> section." +
                                        "<br /><br />Your REF ID is <b>" + refid + "</b>";
                        return;
                    }
                    if (res.indexOf("ERR05") != -1) {
                        $scope.showModal('#infoReselectError');
                        $scope.errTitle = "We are sorry to inform that we could not proceed with the transaction.";
                        $scope.errMsg = "<br />The payment transaction result from Maybank is unsuccessful. " +
                                        "<br /><br />Your REF ID is <b>" + refid + "</b>";
                        return;
                    }
                    if (res.indexOf("ERR06") != -1) {
                        $scope.showModal('#infoReselectError');
                        $scope.errTitle = "We are sorry to inform that we could not secure new ticket.";
                        $scope.errMsg = "<br />We are sincerely apologize for the inconvenience caused and we will try our best " +
                                        "to refund the payment soonest possible. Refund status can be tracked via the <b>Refund Link under Manage Booking</b> section." +
                                        "<br /><br />Your REF ID is <b>" + refid + "</b>";
                        return;
                    }

                }

                //==================================================================
                $scope.showModal('#infoConfirm');
                $scope.errTitle = "Thank you.";
                $scope.errMsg = "<br />We had received confirmation from bank of the ticket payment." +
                                "<br />Please click <b>OK</b> button below to get your ticket." +
                                "<br /><br />Your REF ID is <b>" + refid + "</b>";
                return;

                ////start reselection seat
                //console.log("TicketController.getReselection start.");

                //$scope.reselectionData = response.data;

                ////if (!$scope.reselectionData.isApproved) {
                ////    $window.location.href = baseURL;
                ////}

                ////$scope.showModal('#infoReselect');
                ////$scope.errTitle = "SEAT(s) HAS BEEN RELEASED!";
                ////$scope.errMsg = "<b><span style='color:red;'>ATTENTION </span></b> :Seat(s) has been released. Please re-select your seat(s) within <b>10 minutes</b>.<br /><br />No payment required for RE-SELECTING SEAT(s)<br /><br />REF ID : " + refid;
                ////$scope.getLabels();

                //var booking = JSON.parse(sessionStorage.readyForSeating);
                //console.log(booking);
                //console.log($scope.reselectionData);

                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };

        $scope.getReselectionOLD = function () {
            console.log("TicketController.getReselection triggered.");
            $rootScope.spinnerShow = true;
            var refid = getUrlParameter('refid', $location.absUrl());
            var data = {
                RefId: refid,
                securitytoken: $cookies.get('UI_TOKEN')
            };
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/RESELECTION',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {

                $scope.reselectionData = response.data;

                if (!$scope.reselectionData.isApproved)
                    $window.location.href = baseURL;

                $scope.showModal('#infoReselect');
                $scope.errTitle = "SEAT(s) HAS BEEN RELEASED!";
                $scope.errMsg = "<b><span style='color:red;'>ATTENTION </span></b> :Seat(s) has been released. Please re-select your seat(s) within <b>10 minutes</b>.<br /><br />No payment required for RE-SELECTING SEAT(s)<br /><br />REF ID : " + refid;
                $scope.getLabels();

                var booking = JSON.parse(sessionStorage.readyForSeating);
                console.log(booking);
                console.log($scope.reselectionData);

                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };


        $scope.openFailpage = function () {
            alert('go');
            $window.location.href = baseURL + '/ticket/paymentfailed/' + refid;
        };

        $scope.submitReselection = function () {
            console.log("TicketController.submitReselection triggered.");
            $rootScope.spinnerShow = true;
            angular.forEach($scope.reselectionData.ListJourney, function (journey) {
                angular.forEach($scope.BookingInfoWithLabel.BookingList, function (booking) {
                    if (booking.OriginCode == journey.OriginCode && booking.DestinationCode == journey.DestinationCode) {
                        var i = 0;
                        angular.forEach(booking.PaxList, function (pax) {
                            var seat = {
                                gender: pax.GENDER,
                                ic: pax.IC,
                                name: pax.Name,
                                newlabel: pax.LABELNAME,
                                newslot: pax.SLOTID,
                                passenger_id_1: journey.ListPassanger[i].passenger_id_1,
                                passenger_id_2: journey.ListPassanger[i].passenger_id_2
                            };
                            journey.ListPassanger[i] = seat;
                            i++;
                        });
                    }
                });
            });

            console.log($scope.BookingInfoWithLabel);
            console.log($scope.reselectionData);

            var data = {
                RefID: $scope.reselectionData.RefID,
                securitytoken: $cookies.get('UI_TOKEN'),
                ListJourney: $scope.reselectionData.ListJourney
            };
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/RESUBMITSLOT',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (!response.data.isSuccess) {
                    angular.forEach(response.data.ErrorList, function (err) {
                        growl.error(err, { title: 'ERROR!' });
                    });
                }
                else
                    $window.location.href = baseURL + '/ticket/print/' + $scope.reselectionData.RefID;
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR! ' + response);
            });
        };

        $scope.returnHome = function () {
            console.log("TicketController.returnHome triggered.");
            var refid = getUrlParameter('refid', $location.absUrl());
            var data = {
                refId: refid,
                status: 'Cancel Reselect'
            };
            console.log(data);
        };

        $scope.CREATELOG = function (id, msg) {
            // Add Log 
            var log = {
                ID: id,
                MESSAGE: msg
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/UPDATELOG',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log("log status: ", response.data)
            });
        };

        $scope.triggerReselect = function () {
            console.log("TicketController.returnHome triggered.");
            var refid = getUrlParameter('refid', $location.absUrl());
            var data = {
                refId: refid,
                status: 'Triggered Reselect'
            };
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/INSERTLOG',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            })
        };


        $scope.setMinDate = function (date) {
            console.log("TicketController.setMinDate triggered.");
            $scope.journey.returndate = date;
        };

        var waiting;
        $scope.stopwaiting = true;

        $scope.waitingTime = function () {
            console.log("TicketController.waitingTime triggered.");
            setInterval(function () {
                $scope.$apply(function () {
                    $scope.stopwaiting = false;
                });
            }, 5000);
        };

        $scope.counterMin = '0';
        $scope.counterSec = '0';


        //sessionStorage.myTimer = setInterval(function () { $scope.checkForPayment(); }, 30000);
        //clearInterval(sessionStorage.myTimer);
        $scope.payTimer = function (minGiven) {
            console.log("TicketController.payTimer triggered.");

            var now = new Date();
            console.log(sessionStorage.counterMin);
            if (sessionStorage.counterMin != null && sessionStorage.counterMin != undefined && sessionStorage.counterSec != null && sessionStorage.counterSec != undefined) {
                now.setMinutes(now.getMinutes() + Number(sessionStorage.counterMin.toString()));
                now.setSeconds(now.getSeconds() + Number(sessionStorage.counterSec.toString()));
            }
            else
                now.setMinutes(now.getMinutes() + minGiven);

            setInterval(function () {
                $scope.$apply(function () {
                    var t = getTimeRemaining(now);

                    if (t.minutes >= 0) {

                        $scope.counterMin = t.minutes;
                        $scope.counterSec = t.seconds;

                        console.log(t.minutes);


                        sessionStorage.counterMin = $scope.counterMin;
                        sessionStorage.counterSec = $scope.counterSec;
                    }

                    if (t.minutes == 0 && t.seconds == 0) {
                        sessionStorage.counterMin = 0;
                        sessionStorage.counterSec = 0;
                        $scope.showModal('#expired');
                        //delete sessionStorage.passengerInfo;
                        //delete sessionStorage.bookingConfirmation;
                        //delete sessionStorage.bookedTrips;
                        //delete sessionStorage.readyForSeating;
                        //delete sessionStorage.autoSelectComplete;
                        //delete sessionStorage.counterMin;
                        //delete sessionStorage.counterSec;
                    }
                });
            }, 1000);
        };

        $scope.concurrentCount = 70;
        $scope.userIdleMin = 5;

        $scope.checkQueue = function () {
            console.log("TicketController.checkQueue triggered.");

            var origin = getUrlParameter('origin', $location.absUrl());
            var destination = getUrlParameter('destination', $location.absUrl());
            var odate = getUrlParameter('odate', $location.absUrl());
            var isreturn = getUrlParameter('isreturn', $location.absUrl());
            var rdate = getUrlParameter('rdate', $location.absUrl());
            var pcode = getUrlParameter('pcode', $location.absUrl());
            var adult = getUrlParameter('adult', $location.absUrl());
            var child = getUrlParameter('child', $location.absUrl());

            $http({
                method: 'GET',
                url: baseURL + '/api/session/checkqueue?count=' + $scope.concurrentCount + '&idlemin=' + $scope.userIdleMin,
            }).then(function onSuccess(response) {
                console.log(response.data);
                var path = '?origin=' + origin +
                    '&destination=' + destination +
                    '&odate=' + odate +
                    '&rdate=' + rdate +
                    '&pcode=' + pcode +
                    '&adult=' + adult +
                    '&child=' + child +
                    '&isreturn=' + isreturn;
                console.log(path);
                if (!response.data.Success)
                    if ($window.location.href != baseURL + '/ticket/waiting' + path)
                        $window.location.href = baseURL + '/ticket/waiting' + path;
            }).catch(function onError(response) {
                console.log('ERROR! ' + response);
            });
        };

        $scope.lookingForAccess = function () {
            console.log("TicketController.lookingForAccess triggered.");
            setInterval(function () {
                $scope.$apply(function () {
                    console.log("TicketController.lookingForAccess.Interval triggered.");

                    var origin = getUrlParameter('origin', $location.absUrl());
                    var destination = getUrlParameter('destination', $location.absUrl());
                    var odate = getUrlParameter('odate', $location.absUrl());
                    var isreturn = getUrlParameter('isreturn', $location.absUrl());
                    var rdate = getUrlParameter('rdate', $location.absUrl());
                    var pcode = getUrlParameter('pcode', $location.absUrl());
                    var adult = getUrlParameter('adult', $location.absUrl());
                    var child = getUrlParameter('child', $location.absUrl());

                    $http({
                        method: 'GET',
                        url: baseURL + '/api/session/checkqueue?count=' + $scope.concurrentCount + '&idlemin=' + $scope.userIdleMin,
                    }).then(function onSuccess(response) {
                        console.log(response.data);
                        var path = '?origin=' + origin +
                            '&destination=' + destination +
                            '&odate=' + odate +
                            '&rdate=' + rdate +
                            '&pcode=' + pcode +
                            '&adult=' + adult +
                            '&child=' + child +
                            '&isreturn=' + isreturn;
                        console.log(path);
                        if (response.data.Success)
                            if ($window.location.href != baseURL + '/ticket/select' + path)
                                $window.location.href = baseURL + '/ticket/select' + path;
                    }).catch(function onError(response) {
                        console.log('ERROR! ' + response);
                    });
                });
            }, 5000);
        };



        $scope.queueUpdate = function () {
            console.log("TicketController.queueUpdate triggered.");
            $http({
                method: 'GET',
                url: baseURL + '/api/session/checkqueue?count=' + $scope.concurrentCount + '&idlemin=' + $scope.userIdleMin,
            }).then(function onSuccess(response) {
                console.log(response.data);
            }).catch(function onError(response) {
                console.log('ERROR! ' + response);
            });
        };
       
        

        $scope.removeFromQueue = function () {
            console.log("TicketController.removeFromQueue triggered.");
            $http({
                method: 'GET',
                url: baseURL + '/api/session/remove',
            }).then(function onSuccess(response) {
                console.log(response.data);
            }).catch(function onError(response) {
                console.log('ERROR! ' + response);
            });
        };

        $scope.setClass = function (seatStatus, seatRow) {
            if (seatStatus == "L") {
                if (seatRow < 8) {
                    return 'seatUpLock';
                }
                else {
                    return 'seatDownLock';
                }
            }
            else {
                if (seatRow < 8) {
                    return 'seatUp';
                }
                else {
                    return 'seatDownBack';
                }
            }

        };



        //{true: {true: 'seatUpLock', false: 'seatDownLock'}[$index < 8], false: {true: 'seatUp', false: 'seatDownBack'}[$index < 8]}[s.SeatList[0].STATUS == 'L']



        ///////////////////////////////////////////////////////// SHARED FUNCTION //////////////////////////////////////////////

        function getTimeRemaining(endtime) {
            var t = Date.parse(endtime) - Date.parse(new Date());
            var seconds = Math.floor((t / 1000) % 60);
            var minutes = Math.floor((t / 1000 / 60) % 60);
            var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
            var days = Math.floor(t / (1000 * 60 * 60 * 24));
            return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        function encodeUriQuery(val, pctEncodeSpaces) {
            return encodeURIComponent(val).
              replace(/%40/gi, '@').
              replace(/%3A/gi, ':').
              replace(/%24/g, '$').
              replace(/%2C/gi, ',').
              replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
        }

        function getUrlParameter(param, path) {
            var sPageURL = path || window.location.search.substring(1),
                sURLVariables = sPageURL.split(/[&||?]/),
                res;

            for (var i = 0; i < sURLVariables.length; i += 1) {
                var paramName = sURLVariables[i],
                    sParameterName = (paramName || '').split('=');

                if (sParameterName[0] === param) {
                    res = sParameterName[1];
                }
            }
            return res;
        }

        String.prototype.toDate = function (format, delimiter) {
            var date = this;
            var formatedDate = null;
            var formatLowerCase = format.toLowerCase();
            var formatItems = formatLowerCase.split(delimiter);
            var dateItems = date.split(delimiter);
            var monthIndex = formatItems.indexOf("mm");
            var monthNameIndex = formatItems.indexOf("mmm");
            var dayIndex = formatItems.indexOf("dd");
            var yearIndex = formatItems.indexOf("yyyy");
            var d = dateItems[dayIndex];
            if (d < 10) {
                d = "0" + d;
            }
            if (monthIndex > -1) {
                var month = parseInt(dateItems[monthIndex]);
                month -= 1;
                if (month < 10) {
                    month = "0" + month;
                }
                formatedDate = new Date(dateItems[yearIndex], month, d);
            } else if (monthNameIndex > -1) {
                var monthName = dateItems[monthNameIndex];
                month = getMonthIndex(monthName);
                if (month < 10) {
                    month = "0" + month;
                }
                formatedDate = new Date(dateItems[yearIndex], month, d);
            }
            return formatedDate;
        };

        function getMonthIndex(name) {
            name = name.toLowerCase();
            if (name == "jan" || name == "january") {
                return 0;
            } else if (name == "feb" || name == "february") {
                return 1;
            } else if (name == "mar" || name == "march") {
                return 2;
            } else if (name == "apr" || name == "april") {
                return 3;
            } else if (name == "may" || name == "may") {
                return 4;
            } else if (name == "jun" || name == "june") {
                return 5;
            } else if (name == "jul" || name == "july") {
                return 6;
            } else if (name == "aug" || name == "august") {
                return 7;
            } else if (name == "sep" || name == "september") {
                return 8;
            } else if (name == "oct" || name == "october") {
                return 9;
            } else if (name == "nov" || name == "november") {
                return 10;
            } else if (name == "dec" || name == "december") {
                return 11;
            }
        }

        function convertDate(dateString) {
            //This function only support this format - dd/MM/yyyy HH:mm
            var reggie = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/;
            var dateArray = reggie.exec(dateString);
            var dateObject = new Date(
                (+dateArray[3]),
                (+dateArray[2]) - 1, // Careful, month starts at 0!
                (+dateArray[1]),
                (+dateArray[4]),
                (+dateArray[5])
            );
            return dateObject;
        }

        function convertDateNoTime(dateString) {
            //This function only support this format - dd/MM/yyyy
            var reggie = /(\d{2})\/(\d{2})\/(\d{4})/;
            var dateArray = reggie.exec(dateString);
            var dateObject = new Date(
                (+dateArray[3]),
                (+dateArray[2]) - 1, // Careful, month starts at 0!
                (+dateArray[1])
            );
            return dateObject;
        }

        function GetAdultPriceBreakdown(trip, passenger, x) {
            if (passenger.adult[x] != undefined) {
                if (passenger.adult[x].tickettype != undefined) {
                    var data = {
                        Paxinfo: {
                            OriginCode: trip.OriginCode,
                            DestinationCode: trip.DestinationCode,
                            DateJourney: trip.TravellingDate,
                            TrainNumber: trip.TrainNumber,
                            CoachCode: trip.CoachCode,
                            OnwardReturn: trip.TripType,
                            AdultChild: 'A',
                            TICKETTTYPE: passenger.adult[x].tickettype
                        },
                        isAgent: false
                    };

                    $http({
                        method: 'POST',
                        url: apiURL + '/api/GETFAREDETAIL',
                        data: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function onSuccess(response) {
                        console.log(response.data);
                        if (response.data.ERROR.length > 0) {
                            angular.forEach(response.data.ERROR, function (err) {
                                console.log('ERROR!: ' + err);
                            });
                        }
                        else {
                            var pd = {
                                AdultChild: 'A',
                                TicketType: response.data.TicketType,
                                Price: response.data.NORMALCHARGE,
                                Name: (passenger.adult[x].name == '' || passenger.adult[x].name == undefined) ? 'Adult Passenger #' + x : passenger.adult[x].name,
                                Id: x,
                                Departure: trip.DepartureTime
                            };
                            $scope.AdultPriceBreakdown.push(pd);
                            x++;
                            GetAdultPriceBreakdown(trip, passenger, x);
                        }
                    }).catch(function onError(response) {
                        console.log('ERROR!: ' + response.statusText + ' at line 1666, ticket.js');
                    });
                }
            }
        }

        function GetChildPriceBreakdown(trip, passenger, x) {
            if (passenger.child[x] != undefined) {
                if (passenger.child[x].tickettype != undefined) {
                    var data = {
                        Paxinfo: {
                            OriginCode: trip.OriginCode,
                            DestinationCode: trip.DestinationCode,
                            DateJourney: trip.TravellingDate,
                            TrainNumber: trip.TrainNumber,
                            CoachCode: trip.CoachCode,
                            OnwardReturn: trip.TripType,
                            AdultChild: 'C',
                            TICKETTTYPE: passenger.child[x].tickettype
                        },
                        isAgent: false
                    };

                    $http({
                        method: 'POST',
                        url: apiURL + '/api/GETFAREDETAIL',
                        data: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function onSuccess(response) {
                        console.log(response.data);
                        if (response.data.ERROR.length > 0) {
                            angular.forEach(response.data.ERROR, function (err) {
                                console.log('ERROR!: ' + err);
                            });
                        }
                        else {
                            var pd = {
                                AdultChild: 'C',
                                TicketType: response.data.TicketType,
                                Price: response.data.NORMALCHARGE,
                                Name: (passenger.child[x].name == '' || passenger.child[x].name == undefined) ? 'Child Passenger #' + x : passenger.child[x].name,
                                Id: x,
                                Departure: trip.DepartureTime
                            };
                            $scope.ChildPriceBreakdown.push(pd);
                            x++;
                            GetChildPriceBreakdown(trip, passenger, x);
                        }
                    }).catch(function onError(response) {
                        console.log('ERROR!: ' + response.statusText + ' at line 1716, ticket.js');
                    });
                }
            }
        }

        function GetAdultPriceBreakdownStep4(trip, paxlist, x) {
            $rootScope.spinnerShow = true;
            if (paxlist[x] != undefined) {
                if (paxlist[x].ADULTCHILD == 'A') {
                    if (paxlist[x].TICKETTTYPE != undefined) {
                        var data = {
                            Paxinfo: {
                                OriginCode: trip.OriginCode,
                                DestinationCode: trip.DestinationCode,
                                DateJourney: trip.DateJourney,
                                TrainNumber: trip.TrainNumber,
                                CoachCode: trip.CoachCode,
                                OnwardReturn: trip.OnwardReturn,
                                AdultChild: 'A',
                                TICKETTTYPE: paxlist[x].TICKETTTYPE,
                                LabelName: paxlist[x].LABELNAME == 'TBD' ? null : paxlist[x].LABELNAME,
                                SlotId: paxlist[x].SLOTID == 'TBD' ? null : paxlist[x].SLOTID,
                            },
                            isAgent: false
                        };
                        console.log(data);
                        $http({
                            method: 'POST',
                            url: apiURL + '/api/GETFAREDETAIL',
                            data: JSON.stringify(data),
                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                        }).then(function onSuccess(response) {
                            console.log(response.data);
                            if (response.data.ERROR.length > 0) {
                                angular.forEach(response.data.ERROR, function (err) {
                                    console.log('ERROR!: ' + err);
                                });
                            }
                            else {
                                var pd = {
                                    AdultChild: 'A',
                                    TicketType: response.data.TicketType,
                                    Price: response.data.NORMALCHARGE,
                                    Name: (paxlist[x].Name == '' || paxlist[x].Name == undefined) ? 'Adult Passenger #' + x : paxlist[x].Name,
                                    Id: x,
                                    Departure: trip.DepartureTime
                                };
                                $scope.AdultPriceBreakdown.push(pd);
                                x++;
                                GetAdultPriceBreakdownStep4(trip, paxlist, x);
                            }
                            $rootScope.spinnerShow = false;
                        }).catch(function onError(response) {
                            console.log('ERROR!: ' + response.statusText + ' at line 1725, ticket.js');
                            $rootScope.spinnerShow = false;
                        });
                    }
                }
                else {
                    x++;
                    GetAdultPriceBreakdownStep4(trip, paxlist, x);
                    $rootScope.spinnerShow = false;
                }
            }
        }

        function GetChildPriceBreakdownStep4(trip, paxlist, x) {
            if (paxlist[x] != undefined) {
                if (paxlist[x].ADULTCHILD == 'C') {
                    if (paxlist[x].TICKETTTYPE != undefined) {
                        var data = {
                            Paxinfo: {
                                OriginCode: trip.OriginCode,
                                DestinationCode: trip.DestinationCode,
                                DateJourney: trip.DateJourney,
                                TrainNumber: trip.TrainNumber,
                                CoachCode: trip.CoachCode,
                                OnwardReturn: trip.OnwardReturn,
                                AdultChild: 'C',
                                TICKETTTYPE: paxlist[x].TICKETTTYPE,
                                LabelName: paxlist[x].LABELNAME == 'TBD' ? null : paxlist[x].LABELNAME,
                                SlotId: paxlist[x].SLOTID == 'TBD' ? null : paxlist[x].SLOTID,
                            },
                            isAgent: false
                        };
                        console.log(data);
                        $http({
                            method: 'POST',
                            url: apiURL + '/api/GETFAREDETAIL',
                            data: JSON.stringify(data),
                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                        }).then(function onSuccess(response) {
                            console.log(response.data);
                            if (response.data.ERROR.length > 0) {
                                angular.forEach(response.data.ERROR, function (err) {
                                    console.log('ERROR!: ' + err);
                                });
                            }
                            else {
                                var pd = {
                                    AdultChild: 'C',
                                    TicketType: response.data.TicketType,
                                    Price: response.data.NORMALCHARGE,
                                    Name: (paxlist[x].Name == '' || paxlist[x].Name == undefined) ? 'Child Passenger #' + x : paxlist[x].Name,
                                    Id: x,
                                    Departure: trip.DepartureTime
                                };
                                $scope.ChildPriceBreakdown.push(pd);
                                x++;
                                GetChildPriceBreakdownStep4(trip, paxlist, x);
                            }
                        }).catch(function onError(response) {
                            console.log('ERROR!: ' + response.statusText + ' at line 1725, ticket.js');
                        });
                    }
                }
                else {
                    x++;
                    GetChildPriceBreakdownStep4(trip, paxlist, x);
                }
            }
        }

    }]);

})();