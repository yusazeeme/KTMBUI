(function () {
    var app = angular.module('datehandler', []);

    app.controller('DateController', ["$scope", function ($scope) {
        console.log("DateController logged on.");

        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        $scope.inlineOptions = {
            //customClass: getDayClass,
            minDate: $scope.today(),
            showWeeks: true
        };

        $scope.noFutureDateDOB = {
            maxDate: new Date()
        };

        $scope.originDate = $scope.today();
        $scope.dateOptions = {
            //dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: $scope.today(),
            startingDay: 1
        };

        $scope.setToday = function () {
            //$scope.dt = new Date();
            //return $scope.dt;
            return new Date();
        };

        $scope.setTomorrow = function () {
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        };

        
        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
              mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;           
        };

        $scope.toggleMin();

        $scope.tayang = function () {
            alert("data");
        };

        //$scope.setMaxDate = function (day,month,year) {
        //    console.log("set max date.");
        //    var today = new Date();
        //    console.log("set max date1.", today);
        //    today.setDate(day);
        //    today.setMonth(month);
        //    today.setYear(year);
        //    console.log("set max date2.",today);
        //    $scope.dateOptions.maxDate = today;
        //   // $scope.maxDate = yyyy + '-' + mm + '-' + dd;
        //    console.log("set max date3.",today);
        //    // $scope.dateOptions.maxDate = new Date();
        //};

        //$scope.setMaxDate(1,10,2018);


        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function () {
            $scope.popup2.opened = true;
        };

        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 1);
        $scope.events = [
          {
              date: tomorrow,
              status: 'full'
          },
          {
              date: afterTomorrow,
              status: 'partially'
          }
        ];

        function getDayClass(data) {
            var date = data.date,
              mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

    }]);

})();