(function () {
    var app = angular.module('dynamic', []);

    app.controller('DynamicController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        

        $scope.LoadDate = function () {
            $scope.timeoftravel = dynamicAPI.getTime();
            //$rootScope.spinnerShow = true;
            //try {
            //    var data = { securitytoken: $cookies.get('UI_TOKEN') };
            //    $http({
            //        method: 'GET',
            //        url: apiURL + '/api/GETDYNAMICFAREDATE',
            //        data: JSON.stringify(data),
            //        headers: { 'Content-Type': 'application/json; charset=utf-8' }
            //    }).then(function onSuccess(response) {
            //        console.log(response.data);
            //        $scope.timeoftravel = response.data;
            //    }).catch(function onError(response) {
            //        console.log(response.data);
            //        growl.info('Err '+ response.data, { title: 'Service Notification:' });
            //    });
            //}
            //catch (err) {
            //    growl.info('Err ' + err.message, { title: 'Service Notification:' });
            //}
            //finally {
            //    $rootScope.spinnerShow = false;
            //}
        }
        
        //$scope.timeoftravel = dynamicAPI.getTime();
        $scope.form = {};
        
        $scope.save = function () {

            $scope.form.DateStart = dynamicAPI.formatDate($scope.form.DateStart);
            $scope.form.DateEnd = dynamicAPI.formatDate($scope.form.DateEnd);

            if ($scope.form.ID){
                dynamicAPI.updateTime($scope.form);
            } else {
                $scope.form.Id = $scope.timeoftravel.length + 1;
                dynamicAPI.postTime($scope.form);
            }
            
            reset();
        }

        $scope.add = function () {
            $scope.form = {};
        }

        $scope.edit = function (data) {
            $scope.form = Object.assign({ }, data);
            $scope.form.DateStart = dynamicAPI.toDate(data.DateStart);
            $scope.form.DateEnd = dynamicAPI.toDate(data.DateEnd);
        }

        function reset() {
            $scope.form = {};
            $scope.timeoftravel = dynamicAPI.getTime();
        }

    }]);

    app.controller('WeekController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.totWeek = dynamicAPI.getWeek();

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
        }

        $scope.save = function () {
            console.log($scope.form);
        }
    }]);

    app.controller('HourController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.totHour = dynamicAPI.getHour();

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
        }

        $scope.save = function () {
            console.log($scope.form);
        }
    }]);

    app.controller('HourPeakController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.totHourPeak = dynamicAPI.getHourPeak();

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
        }

        $scope.save = function () {
            console.log($scope.form);
        }
    }]);

    app.controller('SeatController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.seatList = dynamicAPI.getSeatList();

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
        }

        $scope.save = function () {
            console.log($scope.form);
        }
    }]);

    app.controller('timePurchaseController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.purchaseList = dynamicAPI.getPurchaseList();

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
        }

        $scope.save = function () {
            console.log($scope.form);
        }
    }]);

    app.controller('TrainController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.trainList = dynamicAPI.getTrainList();

        $scope.save = function () {
            console.log($scope.form);
        }

        $scope.add = function () {
            $scope.form = {};
        }

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
        }
    }]);


    app.controller('OriginController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.originList = dynamicAPI.getOriginList();

        $scope.save = function () {
            console.log($scope.form);
        }

        $scope.add = function () {
            $scope.form = {};
        }

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
            $scope.form.dateStart = dynamicAPI.toDate(data.dateStart);
            $scope.form.dateEnd = dynamicAPI.toDate(data.dateEnd);
        }
    }]);

    app.controller('HolidayController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', 'dynamicAPI', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce, dynamicAPI) {
        $scope.holidayList = dynamicAPI.getHolidayList();

        $scope.save = function () {
            console.log($scope.form);
        }

        $scope.add = function () {
            $scope.form = {};
        }

        $scope.edit = function (data) {
            $scope.form = Object.assign({}, data);
            $scope.form.dateStart = dynamicAPI.toDate(data.dateStart);
            $scope.form.dateEnd = dynamicAPI.toDate(data.dateEnd);
        }
    }]);

    app.factory('dynamicAPI', ["$http", function () {

        var time = [{ Id: 1, PeakType: "Super Peak", DateStart: "10 Feb 2018", DateEnd: "15 Feb 2018", Rate: 10, Status: "active" },
                    { Id: 2, PeakType: "Peak", DateStart: "15 Apr 2018", DateEnd: "19 Apr 2018", Rate: 7, Status: "active" },
                   { Id: 3,  PeakType: "Peak", DateStart: "30 Apr 2018", DateEnd: "2 May 2018", Rate: 7, Status: "active" },
                   { Id: 4,  PeakType: "Peak", DateStart: "14 Jun 2018", DateEnd: "20 Jun 2018", Rate: 7, Status: "active" },
                   { Id: 5,  PeakType: "Off Peak", DateStart: "01 Jul 2018", DateEnd: "25 Jul 2018", Rate: -5, Status: "active" }];

        var week = [{ Id: 1, Code: "W1", PeakType: "Off Peak", WeekType: "Weekend", Description: "Off peak on weekend", Rate: 0, Status: "active" },
                    { Id: 2, Code: "W2", PeakType: "Off Peak", WeekType: "Weekdays", Description: "Off Peak on weekdays", Rate: 0, Status: "active" },
                    { Id: 3, Code: "W3", PeakType: "Peak", WeekType: "Weekend", Description: "Peak on weekend", Rate: 3, Status: "active" },
                    { Id: 4, Code: "W4", PeakType: "Peak", WeekType: "Weekdays", Description: "Peak on weekdays", Rate: 0, Status: "active" },
                    { Id: 5, Code: "W5", PeakType: "Super Peak", WeekType: "Weekend", Description: "Super peak on weekend", Rate: 3, Status: "active" },
                    { Id: 6, Code: "W6", PeakType: "Super Peak", WeekType: "Weekdays", Description: "Super peak on weekdays", Rate: 0, Status: "active" } ];

        var hour = [{ Id: 1, Code: "H1", WeekCode: "W1", WeekType: "Weekend", WeekPeekType: "Off Peak", HoursPeakType: "Off Peak", Description: "Off peak hours on off peak weekend", Rate: 0, Status: "active" },
                    { Id: 2, Code: "H2", WeekCode: "W1", WeekType: "Weekend", WeekPeekType: "Off Peak", HoursPeakType: "Peak", Description: "Peak hours on off peak weekend", Rate: 0, Status: "active" },
                    { Id: 3, Code: "H3", WeekCode: "W2", WeekType: "Weekdays", WeekPeekType: "Off Peak", HoursPeakType: "Off Peak", Description: "Off peak hours on off peak weekdays", Rate: 0, Status: "active" },
                    { Id: 4, Code: "H4", WeekCode: "W2", WeekType: "Weekdays", WeekPeekType: "Off Peak", HoursPeakType: "Peak", Description: "Peak hours on off peak weekdays", Rate: 3, Status: "active" },
                    { Id: 5, Code: "H5", WeekCode: "W3", WeekType: "Weekend", WeekPeekType: "Peak", HoursPeakType: "Off Peak", Description: "Off peak hours on peak weekend", Rate: 0, Status: "active" },
                    { Id: 6, Code: "H6", WeekCode: "W3", WeekType: "Weekend", WeekPeekType: "Peak", HoursPeakType: "Peak", Description: "Peak hours on peak weekend", Rate: 0, Status: "active" },
                    { Id: 7, Code: "H7", WeekCode: "W4", WeekType: "Weekdays", WeekPeekType: "Peak", HoursPeakType: "Off Peak", Description: "Off peak hours on peak weekdays", Rate: 0, Status: "active" },
                    { Id: 8, Code: "H8", WeekCode: "W4", WeekType: "Weekdays", WeekPeekType: "Peak", HoursPeakType: "Peak", Description: "Peak hours on peak weekdays", Rate: 3, Status: "active" },
                    { Id: 9, Code: "H9", WeekCode: "W5", WeekType: "Weekend", WeekPeekType: "Super Peak", HoursPeakType: "Off Peak", Description: "Off peak hours on super peak weekend", Rate: 0, Status: "active" },
                    { Id: 10, Code: "H10", WeekCode: "W5", WeekType: "Weekend", WeekPeekType: "Super Peak", HoursPeakType: "Peak", Description: "Peak hours on super peak weekend", Rate: 0, Status: "active" },
                    { Id: 11, Code: "H11", WeekCode: "W6", WeekType: "Weekdays", WeekPeekType: "Super Peak", HoursPeakType: "Off Peak", Description: "Off peak hours on super peak weekdays", Rate: 0, Status: "active" },
                    { Id: 12, Code: "H12", WeekCode: "W6", WeekType: "Weekdays", WeekPeekType: "Super Peak", HoursPeakType: "Peak", Description: "Peak hours on super peak weekdays", Rate: 3, Status: "active" } ];

        var hourpeak = [{ Id: 1, Code: "P1", PeakHoursType: "Peak", HourStart: "08:00", HourEnd: "10:00", Status: "active" },
                        { Id: 2, Code: "P2", PeakHoursType: "Peak", HourStart: "12:00", HourEnd: "02:00", Status: "active" },
                        { Id: 3, Code: "P3", PeakHoursType: "Peak", HourStart: "17:00", HourEnd: "20:00", Status: "active" }];

        var seatList = [{ Id: 1, SeatType: "Standard", Rate: "RM 8", Status: "active" }, { Id: 2, SeatType: "Business Class", Rate: "RM 25", Status: "active" }, { Id: 3, SeatType: "Hot Seat", Rate: "RM 16", Status: "active" }]

        var purchaseList = [{ Id: 1, PurchaseType: "Early Birds", Duration: 36, Rate: 0, Status: "active" }, { Id: 2, PurchaseType: "Last Minute", Duration: 4, Rate: 5, Status: "active" }];

        var trainList = [{ ID: 1, trainNumber: "123", Rate: 10 }, { ID: 2, trainNumber: "1234", Rate: 20 }, { ID: 3, trainNumber: "12345", Rate: 15 }]

        var originList = [{ ID: 1, origin: "27800", destination: "19100", dateStart: '1/1/2018', dateEnd: '31/1/2018', Rate: 20 }]

        var holidayList = [{ ID: 1, dateStart: '1/1/2018', dateEnd: '30/1/2018', desc:"Raya" }]

        var getTime = function () {
            return time;
        }

        var postTime = function (item) {
            time.push(item);
        }

        var updateTime = function (item) {
            alert();
        }
        
        var getWeek = function () {
            return week;
        }

        var getHour = function () {
            return hour;
        }

        var getHourPeak = function () {
            return hourpeak;
        }

        var getSeatList = function () {
            return seatList;
        }

        var getPurchaseList = function () {
            return purchaseList;
        }

        var getTrainList = function () {
            return trainList;
        }

        var getOriginList = function () {
            return originList;
        }

        var getHolidayList = function () {
            return holidayList;
        }

        function formatDate(date) {
            var monthNames = [
              "January", "February", "March",
              "April", "May", "June", "July",
              "August", "September", "October",
              "November", "December"
            ];

            var day = date.getDate();
            var monthIndex = date.getMonth() + 1;
            var year = date.getFullYear();

            return day + '/' + monthIndex + '/' + year;
        }

        function toDate(dateStr) {
            const date = dateStr.split("/");
            return new Date(date[2], date[1] - 1, date[0]);
        }
        

        return {
            getTime: getTime,
            postTime: postTime,
            updateTime:updateTime,
            getWeek: getWeek,
            getHour: getHour,
            getHourPeak: getHourPeak,
            getTrainList: getTrainList,
            getSeatList: getSeatList,
            getPurchaseList:getPurchaseList,
            getOriginList: getOriginList,
            getHolidayList: getHolidayList,
            formatDate: formatDate,
            toDate: toDate
        };
    }])

})();