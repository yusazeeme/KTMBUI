﻿(function () {
    var app = angular.module('lookup', []);

    app.controller('LookupController', ["$scope", "$http", "apiURL", '$rootScope', '$cookies', 'growl', function ($scope, $http, apiURL, $rootScope, $cookies, growl) {
        console.log("LookupController logged on.");

        $scope.getOriginList = function () {
            delete sessionStorage.refreshMe;
            console.log("LookupController.getOriginList triggered.");
            if ($scope.origins == null)
                $http({
                    method: 'GET',
                    url: apiURL + '/api/ondlist'
                }).then(function successCallback(response) {
                    console.log(response.data);
                    sessionStorage.ondList = JSON.stringify(response.data);
                    $scope.origins = response.data;
                   
                }, function errorCallback(response) {
                    console.log('errorCallback');
                });
        };

        $scope.getOriginList2 = function () {
            console.log("LookupController.getOriginList2 triggered.");            
        };


        $scope.getDestinationList = function (originCode) {
            console.log("LookupController.getDestinationList triggered." + originCode);
            $rootScope.spinnerShow = true;
            $http({
                method: 'GET',
                url: apiURL + '/api/ondlist?origincode=' + originCode
            }).then(function successCallback(response) {
                console.log(response);
                $scope.destinations = response.data;
                $rootScope.spinnerShow = false;
            }, function errorCallback(response) {
                console.log('errorCallback');
                $rootScope.spinnerShow = false;
            });
        };

        $scope.filterOND = function (type, code) {
            console.log("LookupController.filterOND triggered.");
            console.log(code);
            if (type == 'O') {
                var ondlist = JSON.parse(sessionStorage.ondList);
                $scope.destinations = ondlist;
                angular.forEach($scope.destinations, function (location) {
                    if (location.CODE === code) {
                        var index = ondlist.indexOf(location);
                        ondlist.splice(index, 1);
                    }
                });
                $scope.destinations = ondlist;

            }
            else {
                var ondlist = JSON.parse(sessionStorage.ondList);
                $scope.origins = ondlist;
                angular.forEach($scope.origins, function (location) {
                    if (location.CODE === code) {
                        var index = ondlist.indexOf(location);
                        ondlist.splice(index, 1);
                    }
                });
                $scope.origins = ondlist;
            }
        };

        $scope.getCountryList = function () {
            console.log("LookupController.getCountryList triggered.");
            $rootScope.spinnerShow = true;
            $http({
                method: 'GET',
                url: apiURL + '/api/COUNTRYLIST'
            }).then(function successCallback(response) {
                console.log(response);
                $scope.destinations = response.data;
                $rootScope.spinnerShow = false;
            }, function errorCallback(response) {
                console.log('errorCallback');
                $rootScope.spinnerShow = false;
            });
        };

        ////////////////// FOR REPORTING ONLY ///////////////////////

        $scope.getStation = function () {
            console.log("LookupController.getStation triggered.");
            $rootScope.spinnerShow = true;
            $http({
                method: 'GET',
                url: apiURL + '/api/GETSTATION'
            }).then(function successCallback(response) {
                console.log(response);
                $scope.stations = response.data;
                $rootScope.spinnerShow = false;
            }, function errorCallback(response) {
                console.log('errorCallback');
                $rootScope.spinnerShow = false;
            });
        };

        $scope.getAgentList = function () {
            console.log("UserController.getAgentList triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = { securitytoken: $cookies.get('UI_TOKEN') };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/AGENTLIST',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.agent = response.data;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getDiscountType = function () {
            console.log("UserController.getDiscountType triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = { SecurityToken: $cookies.get('UI_TOKEN') };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETDISCOUNT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);
                    if (response.data.ErrorList != null) {
                        angular.forEach(response.data.ErrorList, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else
                        $scope.discount = response.data;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

    }]);

})();