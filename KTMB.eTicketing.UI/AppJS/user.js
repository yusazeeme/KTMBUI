(function () {
    var app = angular.module('user', []);

    app.controller('UserController', ["$scope", "$http", '$window', 'growl', 'apiURL', '$rootScope', '$cookies', 'baseURL', 'DTOptionsBuilder', '$sce', function ($scope, $http, $window, growl, apiURL, $rootScope, $cookies, baseURL, DTOptionsBuilder, $sce) {
        console.log("UserController logged on.");

        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 5;

        $scope.signIn = function (user, usertype, redirect) {
            console.log("UserController.signIn triggered.");
            $rootScope.spinnerShow = true;

            var data = {
                Username: user.username,
                Password: user.password,
                UserType: usertype
            }
            $http({
                method: 'POST',
                url: apiURL + '/api/LOGINPOST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ErrorList.length > 0) {
                    for (var i = 0, len = response.data.ErrorList.length; i < len; i++) {
                        growl.error(response.data.ErrorList[i], { title: 'ERROR!', ttl: '10000' });
                    }
                    //growl.info('Sorry, we are unable to process your request at this moment.<br>Please refresh this page or try again later.<br>Thank you.', { title: 'Service Notification: ~u51' });
                    //console.log('[ktmb.user.51]-invalid data entry from user');
                    //Error in this level normally due to API - worng api address / api not running in web server
                    $rootScope.spinnerShow = false;
                }
                else {
                    growl.success('Login success!', { title: 'SUCCESS!' });
                    $rootScope.spinnerShow = false;
                    $cookies.put("UI_TOKEN", response.data.SecurityToken, {
                        path: "/"
                    });

                    console.log(redirect);
                    if (redirect != undefined) {
                        $window.location.href = baseURL + redirect.toString();
                    }
                    else
                        $window.location.reload();
                }
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                growl.info('Sorry, we are unable to process your request at this moment.<br>Please refresh this page or try again later.<br>Thank you.', { title: 'Invalid Data' });
                console.log('[ktmb.user.51]-invalid data entry from user');
                //Error in this level normally due to API - worng api address / api not running in web server
                $rootScope.spinnerShow = false;
            });
            return true;
        };

        $scope.signInV2 = function (user, usertype, redirect) {
            console.log("UserController.signIn triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                Username: user.username,
                Password: user.password,
                UserType: usertype
            }
            $http({
                method: 'POST',
                url: apiURL + '/api/LOGINPOST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);
                if (response.data.ErrorList.length > 0) {
                    for (var i = 0, len = response.data.ErrorList.length; i < len; i++) {
                        growl.error(response.data.ErrorList[i], { title: 'ERROR!', ttl: '10000' });
                    }
                }
                else {
                    growl.success('Login success!', { title: 'SUCCESS!' });
                    $rootScope.spinnerShow = false;
                    $cookies.put("UI_TOKEN", response.data.SecurityToken, {
                        path: "/"
                    });

                    var data = { "securitytoken": response.data.SecurityToken };
                    $http({
                        method: 'POST',
                        url: apiURL + '/api/CHECKEMAILIC',
                        data: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function onSuccess(response) {
                        console.log(response.data);;
                        if (!response.data.isSuccess) {
                            $window.location.href = baseURL + "/user/updateemailic";
                        }
                        else {
                            if (redirect != undefined) {
                                $window.location.href = baseURL + redirect.toString();
                            }
                            else
                                $window.location.reload();
                        }
                    }).catch(function onError(response) {
                        console.log(response);
                    })
                }
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                growl.error('Sorry, we are unable to process your request at this moment.<br>Please refresh this page or try again later.<br>Thank you. ~u113', { title: 'Service Notification:' });
                console.log('[ktmb.user.110]-invalid login data from user');
                //Error in this level normally due to API - worng api address / api not running in web server
                $rootScope.spinnerShow = false;
            });
            return true;
        };

        $scope.getEmailIc = function () {
            console.log("UserController.getEmailIc triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                securitytoken: $cookies.get('UI_TOKEN')
            }
            $http({
                method: 'POST',
                url: apiURL + '/api/GETPROFILE',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);;
                $scope.userEI = response.data;
                $rootScope.spinnerShow = false;
                growl.info("Please update your email and ic number", { title: '' });
            }).catch(function onError(response) {
                console.log('ERROR!: ' + response.statusText + ' at line 125 user.js');
                $rootScope.spinnerShow = false;
                return true;
            });
        };

        $scope.userEI = {};
        $scope.updateEmailIc = function (userEI, redirect) {
            console.log("UserController.updateProfile triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var data = {
                    IC: userEI.IC,
                    Email: userEI.Email,
                    securitytoken: $cookies.get('UI_TOKEN')
                };
                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/UPDATEICEMAIL',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    if (response.data.ErrorList != null) {
                        angular.forEach(response.data.ErrorList, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else {
                        growl.success('Login success!', { title: 'SUCCESS!' });
                        $rootScope.spinnerShow = false;
                        $cookies.put("UI_TOKEN", $cookies.get('UI_TOKEN'), {
                            path: "/"
                        });

                        console.log(redirect);
                        if (redirect != undefined) {
                            $window.location.href = baseURL + redirect.toString();
                        }
                        else
                            $window.location.reload();
                    }

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.error, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getUserInfoFromSession = function () {
            if (sessionStorage.userinfo != undefined) {
                console.log(JSON.parse(sessionStorage.userinfo));
                $scope.userinfosession = JSON.parse(sessionStorage.userinfo)
            }
        };

        $scope.getUserInfo = function () {
            console.log("UserController.getUserInfo triggered.");
            $scope.userinfo = null;
            $scope.refundInfo = null;
            var param = { "securitytoken": $cookies.get('UI_TOKEN') };
            //console.log('1. token', param);
            if ($cookies.get('UI_TOKEN') != undefined && $cookies.get('UI_TOKEN') != null) {
                if (sessionStorage.userinfo != undefined && sessionStorage.userinfo != null) {
                    $scope.userinfo = JSON.parse(sessionStorage.userinfo)
                    // sessionStorage.userinfo = JSON.stringify(response.data);
                    // $scope.userinfo = response.data;
                    var data = {
                        securitytoken: $cookies.get('UI_TOKEN'),
                        DateUpdate: ""
                    }
                    return;
                }
                //    else {
                //console.log('token',param);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETTOKENINFO',
                    data: JSON.stringify(param),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    // console.log('2. response', response.data);
                    if (response.data == null) {
                        $window.location.href = baseURL + '/user/login';
                    }
                    else {
                        sessionStorage.userinfo = JSON.stringify(response.data);
                        $scope.userinfo = response.data;
                        var data = {
                            securitytoken: $cookies.get('UI_TOKEN'),
                            DateUpdate: ""
                        };
                        //$http({
                        //    method: 'POST',
                        //    url: apiURL + '/api/GETREFUNDDETAILLIST',
                        //    data: JSON.stringify(data),
                        //    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                        //}).then(function successCallback(response) {
                        //    if (response.data.detailList.length == '0') {
                        //        var data = {
                        //            securitytoken: $cookies.get('UI_TOKEN'),
                        //        };
                        //        $http({
                        //            method: 'POST',
                        //            url: apiURL + '/api/GETREFUNDDETAILHISTORY',
                        //            data: JSON.stringify(data),
                        //            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                        //        }).then(function successCallback(response) {
                        //            if (response.data.detailList.length == '0') {
                        //                $rootScope.spinnerShow = false;
                        //            }
                        //            else {
                        //                $scope.refundHistory = response.data;
                        //                sessionStorage.refundHistory = JSON.stringify(response.data);
                        //                console.log($scope.refundHistory);
                        //                $rootScope.spinnerShow = false;
                        //            }
                        //        }).catch(function onError(response) {
                        //            console.log(response);
                        //            $rootScope.spinnerShow = false;
                        //        });
                        //    }
                        //    else
                        //        sessionStorage.refundInfo = JSON.stringify(response.data);
                        //    $scope.refundInfo = response.data;
                        //}).catch(function onError(response) {
                        //    console.log(response);
                        //});

                    }
                }).catch(function onError(response) {
                    growl.info('Sorry, we are currently experiencing high traffic at this moment and your request might take a while to be processed.<br>You can refresh this page or try again later during off peak hour.<br>Thank you for your patient. ~u276', { title: 'Service Notification:' });
                    console.log('[ktmb.user.276]-slow network connection from user', response);
                    $rootScope.spinnerShow = false;
                });
            }
                //}
            else {
                delete sessionStorage.userinfo;
                $scope.userinfo = null;
                $scope.refundInfo = null;
            }
        };

        $scope.checkAccess = function () {
            console.log("UserController.checkAccess triggered.");
            if ($cookies.get('UI_TOKEN') == undefined || $cookies.get('UI_TOKEN') == null) {
                $window.location.href = baseURL + '/user/login';
            }
            else {
                $scope.getUserInfo();
            }
        };

        $scope.createUser = function (newUser, usertype) {
            console.log("UserController.createUser triggered.");
            var data = {
                Username: newUser.Username.trim(),
                password: newUser.password.trim(),
                UserType: usertype.trim(),
                FullName: '',
                Email: newUser.Email.trim(),
                IC: newUser.IC.trim(),
                Phone: '',
                Address: '',
                Postcode: '',
                District: '',
                Country: '',
                securitytoken: ''
            };

            $rootScope.spinnerShow = true;
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/REGISTERNEWUSER',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.ErrorList.length > 0) {
                    angular.forEach(response.data.ErrorList, function (error) {
                        growl.error(error, { title: 'ERROR!', ttl: '10000' });
                    });
                }
                else {
                    $scope.newUser = {};
                    $rootScope.spinnerShow = false;
                    growl.success('Registration success! <a href="' + baseURL + '/user/login"><b>Click Here</b></a> to log in.', { title: 'SUCCESS!' });
                }
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                growl.error('Sorry, we are unable to process your request at this moment.<br>Please refresh this page or try again later.<br>Thank you. ~u341', { title: 'Service Notification:' });
                console.log('[ktmb.user.341]-invalid user data');
                $rootScope.spinnerShow = false;
            });
        };

        $scope.createAdmin = function (newUser, usertype) {
            console.log("UserController.createAdmin triggered.");

            var token = $cookies.get('UI_TOKEN');
            var data = {
                Username: newUser.Username,
                password: newUser.password,
                UserType: usertype,
                FullName: newUser.FullName,
                Email: newUser.Email,
                Phone: newUser.Phone,
                Address: newUser.Address,
                Postcode: newUser.Postcode,
                District: newUser.District,
                Country: newUser.Country,
                securitytoken: token
            };

            $rootScope.spinnerShow = true;
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/REGISTERNEWUSER',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.ErrorList.length > 0) {
                    angular.forEach(response.data.ErrorList, function (error) {
                        growl.error(error, { title: 'ERROR!', ttl: '10000' });
                    });
                }
                else
                    growl.success('Registration success!', { title: 'SUCCESS!', ttl: '10000' });
                $rootScope.spinnerShow = false;

            }).catch(function onError(response) {
                growl.error('Sorry, we are unable to process your request at this moment.<br>Please refresh this page or try again later.<br>Thank you. ~u383', { title: 'Service Notification:' });
                console.log('[ktmb.user.383]-invalid user data');
                $rootScope.spinnerShow = false;

            });
        };

        $scope.getUnlockUser = function () {
            console.log("UserController.unlockUser triggered.");
            var token = $cookies.get('UI_TOKEN');
            //console.log(token);

            var data = { securitytoken: token };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETLOCKEDUSER',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.error != null) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    $scope.lockedUser = response.data.userList;
            }).catch(function onError(response) {
                console.log('ERROR!: ' + response.statusText + ' at line 199 user.js');
            });
        };

        $scope.signOut = function () {
            console.log("UserController.signOut triggered.");
            var d = new Date();
            d.setDate(d.getDate() - 1);
            $cookies.put('UI_TOKEN', '', {
                path: '/',
                expires: d
            });
            // $scope.userinfo = null;

            //console.log($cookies.get('UI_TOKEN'));
            if ($scope.userinfo != null)
                $window.location.reload();

        };

        $scope.unlockUser = function (userid) {
            console.log("UserController.unlockUser triggered.");
            var token = $cookies.get('UI_TOKEN');
            // console.log(token);

            var data = { securitytoken: token, usermappingid: userid };
            $http({
                method: 'POST',
                url: apiURL + '/api/UNLOCKUSER',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.error != null) {
                    angular.forEach(response.data.error, function (error) {
                        growl.error(error, { title: 'ERROR!', ttl: '10000' });
                    });
                }
                else
                    growl.success('User unlocked!', { title: 'SUCCESS!', ttl: '10000' });
                $scope.getUnlockUser();
            }).catch(function onError(response) {
                console.log('ERROR!: ' + response.statusText + ' at line 240 user.js');
            });
        };

        //Angular datatables with options - this option set first column to be sorted by descending
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'desc']);
        $scope.dtOptionsExport = DTOptionsBuilder.newOptions().withButtons(['copy', 'csv', 'excel', 'print']);

        $scope.getBooking = function () {
            console.log("UserController.getBooking triggered.");
            $rootScope.spinnerShow = true;
            var token = $cookies.get('UI_TOKEN');
            var data = { securitytoken: token };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETPROFILEHISTORY',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.ErrorList != null) {
                    //angular.forEach(response.data.ErrorList, function (error) {
                    //    growl.error(error, { title: 'ERROR!', ttl: '10000' });
                    //});
                    growl.info('Due to heavy traffic access at this moment, the data might not be displayed completely. <br>Please refresh this page or try again later.<br>Thank you. ~u475', { title: 'Service Notification:' });
                    console.log('[ktmb.user.475]-slow network data from user');
                    //Error in this level normally due to API - worng api address / api not running in web server
                    $rootScope.spinnerShow = false;

                }
                else {
                    var RFIdList = [];
                    var currentRF;
                    angular.forEach(response.data.BookingHistory, function (bh) {
                        if (currentRF != bh.RefIdx) {
                            currentRF = bh.RefIdx;
                            RFIdList.push({
                                RefId: bh.RefIdx,
                                TicketList: []
                            });
                        }
                    });

                    angular.forEach(RFIdList, function (rf) {
                        angular.forEach(response.data.BookingHistory, function (bh2) {
                            if (bh2.RefIdx == rf.RefId) {
                                rf.TicketList.push(bh2);
                            }
                        });
                    });

                    console.log(RFIdList);
                    $scope.bookingList = RFIdList;
                }
                $rootScope.spinnerShow = false;
                growl.success('System will only show the train information that depart on today and onwards.To view booking history, please click Booking History', { title: 'SUCCESS!', });
            }).catch(function onError(response) {
                growl.info('Due to heavy traffic access at this moment, some of the data might be truncated. <br>Please refresh this page or try again later.<br>Thank you. ~u508', { title: 'Service Notification:' });
                console.log('[ktmb.user.508]-slow network data from user');
                $rootScope.spinnerShow = false;
            });
        };

        $scope.resetPassword = function (email) {
            console.log("UserController.resetPassword triggered.");
            var data = {
                securityToken: 'AAEAAAD/////AQAAAAAAAAAMAgAAAFRLVE1CLmVUaWNrZXRpbmcuU2VjdXJpdHlMYXllciwgVmVyc2lvbj0xLjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPW51bGwFAQAAACtLVE1CLmVUaWNrZXRpbmcuU2VjdXJpdHlMYXllci5TZWN1cml0eVRva2VuCgAAABY8RW1haWw+a19fQmFja2luZ0ZpZWxkFjxQaG9uZT5rX19CYWNraW5nRmllbGQZPFVzZXJOYW1lPmtfX0JhY2tpbmdGaWVsZBc8VXNlcklkPmtfX0JhY2tpbmdGaWVsZBc8TGVkZ2VyPmtfX0JhY2tpbmdGaWVsZBo8QWdlbnRDb2RlPmtfX0JhY2tpbmdGaWVsZBo8UHJpbnRUeXBlPmtfX0JhY2tpbmdGaWVsZBk8VXNlclR5cGU+a19fQmFja2luZ0ZpZWxkGjxlcnJvcmxpc3Q+a19fQmFja2luZ0ZpZWxkHDxFeHBpcmVkRGF0ZT5rX19CYWNraW5nRmllbGQBAQEAAQEBBAMBBT9LVE1CLmVUaWNrZXRpbmcuU2VjdXJpdHlMYXllci5BdXRoZW50aWNhdGlvbitBdXRoZW50aWNhdGlvblR5cGUCAAAAf1N5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljLkxpc3RgMVtbU3lzdGVtLlN0cmluZywgbXNjb3JsaWIsIFZlcnNpb249NC4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iNzdhNWM1NjE5MzRlMDg5XV0CAAAACgoGAwAAAAABMAoKCgX8////P0tUTUIuZVRpY2tldGluZy5TZWN1cml0eUxheWVyLkF1dGhlbnRpY2F0aW9uK0F1dGhlbnRpY2F0aW9uVHlwZQEAAAAHdmFsdWVfXwAIAgAAAAAAAAAKBgUAAAAUMy85LzIxMzEgMTA6MzY6NDMgQU0L|qZs9IqAcNMxUPgpRjI0beEmYDwRbghJbAM125U4va4Hn7S4VOPtijaAPeYO0pWC6akzQNVXZ2AMVicJsPiQfdKAHcvAUlKhXccgc5mQkTsDeW7SWGZ3FiAa6QAZEmMm+zTGInp246y9bIhwY+AVKE2at9UczY6UAAeDPZfrBdhBi7aTIUrwFdsBJZDv6VU9ugYCe2qRTkdPSXqk3rNC3D1ZYTJiZ1emQfUMWbu0+UbQBO0jLSQS/mv72CQXAK11Qk0Tnuq/WHpYWYnl7EuARrH2OfF78hmbuYT1yuVFStyeQPNvx7+wmG6Bkn9aFHtjXfk8g+FnPYOo2cuco05XWVvnehQ5F7/1x7syU94VS2wGHoD5kiCKlGGkpNo1et7OuPeMq3QUxsZERd4UqT29FN9oBQ1ccPIfAe1K1kPNneN74IHNXpfUAYFmHr71yfyruqlTZNiL1aZs5cmRz64eS5gDhkCv0tc2Owb51UsmTeemPabhFXC8Zjoa9V/I3YFg4CiukvLq/mXK+WTillBxJ3/zi/Cgl3YmnlNZvAyUj5jfIyW5AzUjoD+T36fcQkfH+BW/YQP4PDBVQHe/5eJe7DDNg/7WajEd/S8BuoNwYEYs0EAhiSGf9BfCDauVcjNG7bka6F8hd/+vX4MAEBzry2T9XqkC7YdPK6RO+zASOBxY=',
                Email: email
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/FORGOTPASSWORD',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);;
                if (response.data.success) {
                    growl.success('A new password will be sent to your email.', { title: 'SUCCESS!', ttl: '10000' });
                }
                else
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
            }).catch(function onError(response) {
                console.log('ERROR!: ' + response.statusText + ' at line 311 user.js');
            });
        };

        $scope.resetPasswordV2 = function (fp) {
            console.log("UserController.resetPassword triggered.");
            var data = {
                securityToken: 'AAEAAAD/////AQAAAAAAAAAMAgAAAFRLVE1CLmVUaWNrZXRpbmcuU2VjdXJpdHlMYXllciwgVmVyc2lvbj0xLjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPW51bGwFAQAAACtLVE1CLmVUaWNrZXRpbmcuU2VjdXJpdHlMYXllci5TZWN1cml0eVRva2VuCgAAABY8RW1haWw+a19fQmFja2luZ0ZpZWxkFjxQaG9uZT5rX19CYWNraW5nRmllbGQZPFVzZXJOYW1lPmtfX0JhY2tpbmdGaWVsZBc8VXNlcklkPmtfX0JhY2tpbmdGaWVsZBc8TGVkZ2VyPmtfX0JhY2tpbmdGaWVsZBo8QWdlbnRDb2RlPmtfX0JhY2tpbmdGaWVsZBo8UHJpbnRUeXBlPmtfX0JhY2tpbmdGaWVsZBk8VXNlclR5cGU+a19fQmFja2luZ0ZpZWxkGjxlcnJvcmxpc3Q+a19fQmFja2luZ0ZpZWxkHDxFeHBpcmVkRGF0ZT5rX19CYWNraW5nRmllbGQBAQEAAQEBBAMBBT9LVE1CLmVUaWNrZXRpbmcuU2VjdXJpdHlMYXllci5BdXRoZW50aWNhdGlvbitBdXRoZW50aWNhdGlvblR5cGUCAAAAf1N5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljLkxpc3RgMVtbU3lzdGVtLlN0cmluZywgbXNjb3JsaWIsIFZlcnNpb249NC4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iNzdhNWM1NjE5MzRlMDg5XV0CAAAACgoGAwAAAAABMAoKCgX8////P0tUTUIuZVRpY2tldGluZy5TZWN1cml0eUxheWVyLkF1dGhlbnRpY2F0aW9uK0F1dGhlbnRpY2F0aW9uVHlwZQEAAAAHdmFsdWVfXwAIAgAAAAAAAAAKBgUAAAAUMy85LzIxMzEgMTA6MzY6NDMgQU0L|qZs9IqAcNMxUPgpRjI0beEmYDwRbghJbAM125U4va4Hn7S4VOPtijaAPeYO0pWC6akzQNVXZ2AMVicJsPiQfdKAHcvAUlKhXccgc5mQkTsDeW7SWGZ3FiAa6QAZEmMm+zTGInp246y9bIhwY+AVKE2at9UczY6UAAeDPZfrBdhBi7aTIUrwFdsBJZDv6VU9ugYCe2qRTkdPSXqk3rNC3D1ZYTJiZ1emQfUMWbu0+UbQBO0jLSQS/mv72CQXAK11Qk0Tnuq/WHpYWYnl7EuARrH2OfF78hmbuYT1yuVFStyeQPNvx7+wmG6Bkn9aFHtjXfk8g+FnPYOo2cuco05XWVvnehQ5F7/1x7syU94VS2wGHoD5kiCKlGGkpNo1et7OuPeMq3QUxsZERd4UqT29FN9oBQ1ccPIfAe1K1kPNneN74IHNXpfUAYFmHr71yfyruqlTZNiL1aZs5cmRz64eS5gDhkCv0tc2Owb51UsmTeemPabhFXC8Zjoa9V/I3YFg4CiukvLq/mXK+WTillBxJ3/zi/Cgl3YmnlNZvAyUj5jfIyW5AzUjoD+T36fcQkfH+BW/YQP4PDBVQHe/5eJe7DDNg/7WajEd/S8BuoNwYEYs0EAhiSGf9BfCDauVcjNG7bka6F8hd/+vX4MAEBzry2T9XqkC7YdPK6RO+zASOBxY=',
                UserName: fp.username,
                IC: fp.ic,
                NewPassword: fp.password
            };
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/FORGOTPASSWORDV2',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function onSuccess(response) {
                console.log(response.data);;
                if (response.data.success) {
                    growl.success('You can now login using the new password! <a href="' + baseURL + '/user/login"><b>Click Here</b></a> to log in.', { title: 'SUCCESS!' });
                }
                else
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
            }).catch(function onError(response) {
                console.log('ERROR!: ' + response.statusText + ' at line 460 user.js');
            });
        };

        $scope.changePassword = function (changePass) {
            console.log("UserController.changePassword triggered.");
            $rootScope.spinnerShow = true;
            console.log($scope.userinfo.UserName);
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    Username: $scope.userinfo.UserName,
                    oldpassword: changePass.oldpassword,
                    newpassword: changePass.newpassword,
                    securitytoken: $cookies.get('UI_TOKEN')
                };
            }
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/CHANGEPASSWORD',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {

                console.log(response.data);;
                if (response.data.error != null) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    growl.success('Your password has changed.', { title: 'SUCCESS!', ttl: '5000' });
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                $rootScope.spinnerShow = false;
                console.log('ERROR!: ' + response.statusText + ' at line 344 user.js');
            });
            $rootScope.spinnerShow = false;

        };
        //$rootScope.spinnerShow = false;

        $scope.getFavoriteList = function (id) {
            console.log("UserController.getFavoriteList triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = { securitytoken: $cookies.get('UI_TOKEN') };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETFAVORITEPASSENGER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $scope.FavoriteList = response.data;
                    $scope.getFavorite(id);
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.info('Due to heavy traffic access at this moment, some of the data might not be displayed completey. <br>Please refresh this page or try again later.<br>Thank you. ~u615', { title: 'Service Notification:' });
                    console.log('[ktmb.user.615]-slow network data from user');
                    $rootScope.spinnerShow = false;
                });
            }
            else {
                growl.info('Due to heavy traffic access at this moment, some of the data might not be displayed completey. <br>Please refresh this page or try again later.<br>Thank you. ~u621', { title: 'Service Notification:' });
                console.log('[ktmb.user.621]-slow network data from user');
                $rootScope.spinnerShow = false;
            }
        };

        $scope.getFavorite = function (id) {
            console.log("UserController.getFavorite triggered.");
            angular.forEach($scope.FavoriteList, function (fav) {
                if (fav.ID == id) {
                    $scope.singleFav = fav;
                    if (fav.DOB != null && fav.DOB != undefined)
                        $scope.singleFav.dob = convertDateNoTime(fav.DOB);
                }
            });
        };

        $scope.updateFav = function (singleFav) {
            console.log("UserController.updateFav triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    passengerlist: []
                };

                var Day = singleFav.dob.getDate();
                var Month = (singleFav.dob.getMonth() + 1);
                Day = Day.toString().length != 2 ? '0' + Day : Day;
                Month = Month.toString().length != 2 ? '0' + Month : Month;
                var Dob = Day + '/' + Month + '/' + singleFav.dob.getFullYear();
                singleFav.dob = Dob;

                data.passengerlist.push(singleFav);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/UPDATEFAVORITEPASSENGER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    growl.success('Favorite passenger updated!', { title: 'SUCCESS!', ttl: '10000' });
                    $scope.getFavoriteList(singleFav.ID);
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    console.log("Fav passenger", response);
                    growl.info('Due to heavy traffic access at this moment, some of the data might not be updated. <br>Please refresh this page or try again later.<br>Thank you. ~u666', { title: 'Service Notification:' });
                    console.log('[ktmb.user.666]-slow network data from user');
                    $rootScope.spinnerShow = false;
                    // growl.error(response.statusText, { title: 'ERROR!', ttl: '10000' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getTicketType = function () {
            console.log("UserController.getTicketType triggered.");
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            console.log(dd + mm + yyyy);
            $http({
                method: 'GET',
                url: apiURL + '/api/TICKETTYPELISTUSER?DateJourney=' + dd + '/' + mm + '/' + yyyy,
            }).then(function onSuccess(response) {
                console.log(response.data);;
                $scope.ticketTypeList = response.data;
            }).catch(function onError(response) {
                growl.info('Unable to retrieved ticket type list. This is normally due to heavy traffic access at the server. <br>Please refresh this page or try again later.<br>Thank you. ~u696', { title: 'Service Notification:' });
                //growl.info('Due to heavy traffic access at this moment, some of the data might be truncated. <br>Please refresh this page or try again later.<br>Thank you.', { title: 'Service Notification:' });
                console.log('[ktmb.user.696]-slow network connection to the server');
                $rootScope.spinnerShow = false;
            });
        };

        $scope.addFav = function (singleFav) {
            console.log("UserController.addFav triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var Day = singleFav.dob.getDate();
                var Month = (singleFav.dob.getMonth() + 1);
                Day = Day.toString().length != 2 ? '0' + Day : Day;
                Month = Month.toString().length != 2 ? '0' + Month : Month;
                var Dob = Day + '/' + Month + '/' + singleFav.dob.getFullYear();

                var singleFav = {
                    FullName: singleFav.FullName,
                    IC: singleFav.IC,
                    Gender: singleFav.Gender,
                    DOB: Dob,
                    TicketType: singleFav.TicketType,
                    KonsesiID: singleFav.KonsesiID
                };
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    passengerlist: [singleFav]
                };
                //data.passengerlist.push(singleFav);
                // console.log("Add fav passenger",data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/INSERTFAVORITEPASSENGER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {

                    console.log('Add fav passenger', response.data);
                    if (response.data.error != null) {
                        //angular.forEach(response.data.error, function (error) {
                        //    growl.error(error, { title: 'ERROR!', ttl: '10000' });
                        //});
                        growl.info('Due to heavy traffic access at this moment, some of the data might not be created. <br>Please refresh this page or try again later.<br>Thank you. ~u740', { title: 'Service Notification:' });
                        console.log('[ktmb.user.740]-slow network data from user to server');
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        growl.success('Favorite passenger added!', { title: 'SUCCESS!', ttl: '10000' });
                        $scope.getFavoriteList();
                        $rootScope.spinnerShow = false;
                    }

                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.deleteFav = function (id) {
            console.log("UserController.deleteFav triggered.");
            var singleFav = { ID: id };
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    passengerlist: []
                };
                data.passengerlist.push(singleFav);
                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/DELETEFAVORITEPASSENGER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response);
                    growl.success('Favorite passenger removed!', { title: 'SUCCESS!' });
                    $scope.getFavoriteList();
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getProfile = function () {
            console.log("UserController.getProfile triggered.");
            $scope.getFavoriteList();
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN')
                };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETPROFILE',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $scope.userProfile = response.data;
                    angular.forEach($scope.FavoriteList, function (person) {
                        console.log(person);
                        if (person.IC == $scope.userProfile.IC)
                            $scope.userProfile.dob = convertDateNoTime(person.DOB);
                    });
                    if (response.data.Country == null)
                        $scope.userProfile.Country = 'MY';

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.info('Due to heavy traffic access at this moment, some of the data might not be shown completely. <br>Please refresh this page or try again later.<br>Thank you. ~u813', { title: 'Service Notification:' });
                    console.log('[ktmb.user.813]-slow server connection from user');
                    $rootScope.spinnerShow = false;
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.userProfile = {};
        $scope.updateProfile = function (userProfile) {
            console.log("UserController.updateProfile triggered.");

            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                // profile.securitytoken = $cookies.get('UI_TOKEN');
                var fromDay = userProfile.dob.getDate();
                var fromMonth = (userProfile.dob.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var dob = fromDay + '/' + fromMonth + '/' + userProfile.dob.getFullYear();


                var data = {
                    FullName: userProfile.FullName,
                    IC: userProfile.IC,
                    DOB: dob,
                    Gender: userProfile.Gender,
                    Phone: userProfile.Phone,
                    Email: userProfile.Email,
                    Address: userProfile.Address,
                    Postcode: userProfile.Postcode,
                    District: userProfile.District,
                    Country: userProfile.Country,
                    securitytoken: $cookies.get('UI_TOKEN')
                };
                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/UPDATEPROFILE',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    if (response.data.ErrorList != null) {
                        //angular.forEach(response.data.ErrorList, function (error) {
                        //    growl.error(error, { title: 'ERROR!' });
                        //});
                        growl.info('Due to heavy traffic access at this moment, some of the data might not be updated. <br>Please refresh this page or try again later.<br>Thank you. ~u862', { title: 'Service Notification:' });
                        console.log('[ktmb.user.862]-slow server connection from user');
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        //Add to favorite list
                        var personList = {
                            passengerlist: [],
                            securitytoken: $cookies.get('UI_TOKEN')
                        };

                        console.log(userProfile.saveFav);
                        if (userProfile.saveFav != undefined && userProfile.saveFav) {
                            var fromDay = userProfile.dob.getDate();
                            var fromMonth = (userProfile.dob.getMonth() + 1);
                            fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                            fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                            var dob = fromDay + '/' + fromMonth + '/' + userProfile.dob.getFullYear();

                            var person = {
                                FullName: userProfile.FullName,
                                IC: userProfile.IC,
                                DOB: dob,
                                Gender: userProfile.Gender
                            };
                            personList.passengerlist.push(person);
                        }

                        // console.log(personList);
                        console.log(response.data);;
                        growl.success('Your profile have been updated!', { title: 'SUCCESS!' });

                        $http({
                            method: 'POST',
                            url: apiURL + '/api/STOREFAVORITEPASSENGER',
                            data: JSON.stringify(personList),
                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                        }).then(function onSuccess(response) {
                            console.log('Save favorite status: ' + response.data);
                        }).catch(function onError(response) {
                            growl.error('Sorry, we are unable to process your request at this moment.<br>You can refresh this page or try again later.<br>Thank you. ~u902', { title: 'Service Notification:' });
                            console.log('[ktmb.user.902]-invalid data from user.');
                            $rootScope.spinnerShow = false;
                        });
                    }
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error('Sorry, we are unable to process your request at this moment.<br>You can refresh this page or try again later.<br>Thank you. ~u909', { title: 'Service Notification:' });
                    console.log('[ktmb.user.909]-invalid data from user');
                    $rootScope.spinnerShow = false;
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        ////////////////// FOR REPORTING ONLY ///////////////////////

        $scope.getRpt1006 = function (rpt) {
            console.log("UserController.getRpt1006 triggered.");
            console.log(rpt);
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var fromDay = rpt.fromDate.getDate();
                var fromMonth = (rpt.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.fromDate.getFullYear();

                var toDay = rpt.toDate.getDate();
                var toMonth = (rpt.toDate.getMonth() + 1);
                toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
                toMonth = toMonth.toString().length != 2 ? '0' + toMonth : toMonth;
                var toDate = toDay + '/' + toMonth + '/' + rpt.toDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    FromDate: fromDate,
                    ToDate: toDate,
                    Location: rpt.station,
                    UserId: rpt.userId
                };

                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/RPT1006',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    if (response.data.ErrorList != null) {
                        angular.forEach(response.data.ErrorList, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else
                        $scope.result = response.data;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getRpt1000 = function (rpt) {
            console.log("UserController.getRpt1000 triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDay = rpt.fromDate.getDate();
                var fromMonth = (rpt.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.fromDate.getFullYear();

                var toDay = rpt.toDate.getDate();
                var toMonth = (rpt.toDate.getMonth() + 1);
                toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
                toMonth = toMonth.toString().length != 2 ? '0' + toMonth : toMonth;
                var toDate = toDay + '/' + toMonth + '/' + rpt.toDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    FromDate: fromDate,
                    ToDate: toDate
                };

                $http({
                    method: 'POST',
                    url: apiURL + '/api/REP1000',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getDiscountReport = function (rpt) {
            console.log("UserController.getDiscountReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDay = rpt.fromDate.getDate();
                var fromMonth = (rpt.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.fromDate.getFullYear();

                var toDay = rpt.toDate.getDate();
                var toMonth = (rpt.toDate.getMonth() + 1);
                toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
                toMonth = toMonth.toString().length != 2 ? '0' + toMonth : toMonth;
                var toDate = toDay + '/' + toMonth + '/' + rpt.toDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    FromDate: fromDate,
                    ToDate: toDate,
                    DiscTrain: '',
                    DiscType: ''
                };

                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/DISCOUNTREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getSummaryReport = function (rpt) {
            console.log("UserController.getSummaryReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var fromDay = rpt.txDate.getDate();
                var fromMonth = (rpt.txDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.txDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    Jenis: rpt.paymentType,
                    Tarikh: fromDate
                };
                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/SUMMARYREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getTotalErrorReport = function (rpt) {
            console.log("UserController.getTotalErrorReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var fromDay = rpt.txDate.getDate();
                var fromMonth = (rpt.txDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.txDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    Jenis: rpt.paymentType,
                    Tarikh: fromDate
                };
                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/ERRORREPORTTOTAL',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };


        $scope.getErrorReport = function (rpt) {
            console.log("UserController.getErrorReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var fromDay = rpt.txDate.getDate();
                var fromMonth = (rpt.txDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.txDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    Jenis: rpt.paymentType,
                    Tarikh: fromDate
                };
                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/ERRORREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getErrorReportDetail = function (rpt) {
            console.log("UserController.getErrorReportDetail triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var fromDay = rpt.txDate.getDate();
                var fromMonth = (rpt.txDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.txDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    Jenis: rpt.paymentType,
                    Tarikh: fromDate
                };
                console.log(data);

                $http({
                    method: 'POST',
                    url: apiURL + '/api/ERRORREPORTDETAIL',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };


        $scope.getBankReport = function (rpt) {
            console.log("UserController.getBankReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDay = rpt.txDate.getDate();
                var fromMonth = (rpt.txDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.txDate.getFullYear();

                var data = {
                    SecurityToken: $cookies.get('UI_TOKEN'),
                    paymenttype: rpt.paymentType,
                    date: fromDate
                };

                $http({
                    method: 'POST',
                    url: apiURL + '/api/MAYBANKREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.addDiscount = function (disc, isadmin) {
            console.log("UserController.addDiscount triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDay = disc.fromDate.getDate();
                var fromMonth = (disc.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + disc.fromDate.getFullYear();

                var fromDay = disc.toDate.getDate();
                var fromMonth = (disc.toDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var toDate = fromDay + '/' + fromMonth + '/' + disc.toDate.getFullYear();

                var fromDay = disc.fromDate_Train.getDate();
                var fromMonth = (disc.fromDate_Train.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDateTrain = fromDay + '/' + fromMonth + '/' + disc.fromDate_Train.getFullYear();

                var fromDay = disc.toDate_Train.getDate();
                var fromMonth = (disc.toDate_Train.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var toDateTrain = fromDay + '/' + fromMonth + '/' + disc.toDate_Train.getFullYear();

                var fromDay = disc.fromDate_Issue.getDate();
                var fromMonth = (disc.fromDate_Issue.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDateIssue = fromDay + '/' + fromMonth + '/' + disc.fromDate_Issue.getFullYear();

                var fromDay = disc.toDate_Issue.getDate();
                var fromMonth = (disc.toDate_Issue.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var toDateIssue = fromDay + '/' + fromMonth + '/' + disc.toDate_Issue.getFullYear();


                var dataDiscount = {
                    DISCOUNT_ID: "",
                    DISCOUNT_CODE: disc.dcCode,
                    DISCOUNT_TRAIN: disc.dcTrain,
                    DISCOUNT_COACH: disc.dcCoach,
                    DISCOUNT_SEAT_OFFERED: disc.dcSeatOffer,
                    DISCOUNT_SEAT_LEFT: disc.dcSeatLeft,
                    DISCOUNT_RATE: disc.dcRate,
                    DISCOUNT_PRIORITY: disc.dcPriority,
                    DISCOUNT_TYPE: disc.dcType,
                    DISCOUNT_PURCHASE: disc.dcPurchase,
                    FROMDATE: fromDate,
                    TODATE: toDate,
                    NDAYS: disc.dcDays,
                    STATUS: disc.dcStatus,
                    TRAINDATE_FROM: fromDateTrain,
                    TRAINDATE_TO: toDateTrain,
                    ISSUE_FROM: fromDateIssue,
                    ISSUE_TO: toDateIssue
                };
                var data = {
                    id: '',
                    securitytoken: $cookies.get('UI_TOKEN'),
                    discount: dataDiscount
                };

                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/CREATEDISCOUNT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $scope.parameter = response.data;
                    $rootScope.spinnerShow = false;
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        //$('#modal-1').dialog("close").
                        growl.success('New discount added!', { title: 'SUCCESS!' });
                    $scope.getDiscountSetting();
                    $rootScope.spinnerShow = false;
                    $scope.addDiscount();
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.updateDiscount = function (discountview) {
            console.log("UserController.updateDiscount triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDay = discountview.fromDate.getDate();
                var fromMonth = (discountview.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + discountview.fromDate.getFullYear();

                var fromDay = discountview.toDate.getDate();
                var fromMonth = (discountview.toDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var toDate = fromDay + '/' + fromMonth + '/' + discountview.toDate.getFullYear();

                var fromDay = discountview.fromDate_Train.getDate();
                var fromMonth = (discountview.fromDate_Train.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDateTrain = fromDay + '/' + fromMonth + '/' + discountview.fromDate_Train.getFullYear();

                var fromDay = discountview.toDate_Train.getDate();
                var fromMonth = (discountview.toDate_Train.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var toDateTrain = fromDay + '/' + fromMonth + '/' + discountview.toDate_Train.getFullYear();

                var fromDay = discountview.fromDate_Issue.getDate();
                var fromMonth = (discountview.fromDate_Issue.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDateIssue = fromDay + '/' + fromMonth + '/' + discountview.fromDate_Issue.getFullYear();

                var fromDay = discountview.toDate_Issue.getDate();
                var fromMonth = (discountview.toDate_Issue.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var toDateIssue = fromDay + '/' + fromMonth + '/' + discountview.toDate_Issue.getFullYear();


                var dataDiscount = {
                    DISCOUNT_ID: discountview.DISCOUNT_ID,
                    DISCOUNT_CODE: discountview.dcCode,
                    DISCOUNT_TRAIN: discountview.dcTrain,
                    DISCOUNT_COACH: discountview.dcCoach,
                    DISCOUNT_SEAT_OFFERED: discountview.dcSeatOffer,
                    DISCOUNT_SEAT_LEFT: discountview.dcSeatLeft,
                    DISCOUNT_RATE: discountview.dcRate,
                    DISCOUNT_PRIORITY: discountview.dcPriority,
                    DISCOUNT_TYPE: discountview.dcType,
                    DISCOUNT_PURCHASE: discountview.dcPurchase,
                    FROMDATE: fromDate,
                    TODATE: toDate,
                    NDAYS: discountview.dcDays,
                    STATUS: discountview.dcStatus,
                    TRAINDATE_FROM: fromDateTrain,
                    TRAINDATE_TO: toDateTrain,
                    ISSUE_FROM: fromDateIssue,
                    ISSUE_TO: toDateIssue
                };
                var data = {
                    id: '',
                    securitytoken: $cookies.get('UI_TOKEN'),
                    discount: dataDiscount
                };

                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/CREATEDISCOUNT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $scope.parameter = response.data;
                    $rootScope.spinnerShow = false;
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        //$('#modal-1').dialog("close").
                        growl.success('New discount added!', { title: 'SUCCESS!' });
                    $scope.getDiscountSetting();
                    $rootScope.spinnerShow = false;
                    $scope.addDiscount();
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };
        $scope.discount = {};
        $scope.getDiscount = function (name) {
            console.log("UserController.getDiscount triggered.");
            angular.forEach($scope.discount.discountList, function (pm) {
                if (pm.DISCOUNT_ID == name) {
                    console.log(pm);
                    $scope.discountview = pm;
                }
            });
            $scope.getDiscountSetting();
        };

        $scope.getDiscountSetting = function (isadmin) {
            console.log("UserController.getDiscountSetting triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    SecurityToken: $cookies.get('UI_TOKEN')
                };

                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETDISCOUNT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
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

        $scope.deleteDisc = function (ID) {
            console.log("UserController.deleteDisc triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    id: ID
                };
                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/REMOVEDISCOUNT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $rootScope.spinnerShow = false;
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else {
                        growl.success('Discount removed!', { title: 'SUCCESS!' });
                        $scope.getDiscountSetting();
                        $rootScope.spinnerShow = false;
                    }
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        ////////////////    Parameter Setting     /////////////////

        $scope.getParameter = function () {
            console.log("UserController.getParameter triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    ispublic: null
                };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETPARAMETER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $scope.parameter = response.data;
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.param = {};
        $scope.getParam = function (name) {
            console.log("UserController.getParam triggered.");
            angular.forEach($scope.parameter.paramList, function (pm) {
                if (pm.Name == name) {
                    console.log(pm);
                    $scope.param = pm;
                }
            });
        };

        $scope.addParameter = function (param) {
            console.log("UserController.addParameter triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var dataParam = {
                    Name: param.Name,
                    Descr: param.Descr,
                    Value: param.Value,
                    IsPublic: param.isPublic
                };
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    param: dataParam
                };
                $http({
                    method: 'POST',
                    url: apiURL + '/api/CREATEPARAMETER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $scope.parameter = response.data;
                    $rootScope.spinnerShow = false;
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else
                        //$('#modal-1').dialog("close").
                        growl.success('New parameter added!', { title: 'SUCCESS!' });
                    $scope.getParameter();
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };


        $scope.updateParameter = function (param) {
            console.log("UserController.updateParameter triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var dataParam = {
                    Name: param.Name,
                    Descr: param.Descr,
                    Value: param.Value,
                    IsPublic: param.isPublic
                };

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    param: dataParam
                };

                $http({
                    method: 'POST',
                    url: apiURL + '/api/UPDATEPARAMETER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    growl.success('Parameter updated!', { title: 'SUCCESS!' });
                    $scope.getParam();
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    console.log(response);
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.deleteParam = function (id) {
            console.log("UserController.deleteParam triggered.");
            var param = id;
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {
                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    paramName: param
                };
                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/REMOVEPARAMETER',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;
                    $rootScope.spinnerShow = false;
                    if (response.data.error != null) {
                        growl.error(response.data.error, { title: 'ERROR!' });
                    }
                    else {
                        growl.success('Parameter removed!', { title: 'SUCCESS!' });
                        $scope.getParameter();
                        $rootScope.spinnerShow = false;
                    }
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };


        $scope.getUserReport = function (rpt) {
            console.log("UserController.getUserReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDay = rpt.fromDate.getDate();
                var fromMonth = (rpt.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.fromDate.getFullYear();

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    FromDate: fromDate,
                    ToDate: fromDate,
                    PaymentType: rpt.paymentType,
                    Status: rpt.status
                };

                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/USERREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        angular.forEach(response.data.error, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getUserBookingHistory = function (rpt) {
            console.log("UserController.getUserReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var fromDate = '01' + '/' + rpt.fromMonth + '/' + rpt.fromYear;
                var ToDate = rpt.toMonth + '/' + rpt.toYear;

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    FromDate: fromDate,
                    ToDate: ToDate,
                    PaymentType: rpt.paymentType,
                    Status: rpt.status
                };

                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/USERREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        angular.forEach(response.data.error, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else
                        $scope.result = response.data;
                    $scope.totalItems = $scope.result.userRepList.length;

                    $rootScope.spinnerShow = false;
                    growl.success('System will only show the train information that had departed. To view current booking, please click View Booking ', { title: 'SUCCESS!', });
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.rpt = {};
        $scope.getAgentReport = function (rpt) {
            console.log("UserController.getAgentReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                console.log(rpt);

                console.log(rpt.fromDate);
                console.log(rpt.toDate);

                var fromDay = rpt.fromDate.getDate();
                var fromMonth = (rpt.fromDate.getMonth() + 1);
                fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
                fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
                var fromDate = fromDay + '/' + fromMonth + '/' + rpt.fromDate.getFullYear();

                var toDay = rpt.toDate.getDate();
                var toMonth = (rpt.toDate.getMonth() + 1);
                toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
                toMonth = toMonth.toString().length != 2 ? '0' + toMonth : toMonth;
                var toDate = toDay + '/' + toMonth + '/' + rpt.toDate.getFullYear();


                var data = {
                    SecurityToken: $cookies.get('UI_TOKEN'),
                    FromDate: fromDate,
                    ToDate: toDate,
                    PaymentType: rpt.paymentType,
                    Status: rpt.status,
                    AgentName: rpt.agent
                };
                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/AGENTREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        angular.forEach(response.data.error, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };

        $scope.getVipReport = function (rpt) {
            console.log("UserController.getVipReport triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    month: rpt.month,
                    year: rpt.year
                };
                console.log(data);
                $http({
                    method: 'POST',
                    url: apiURL + '/api/VIPREPORT',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function onSuccess(response) {
                    console.log(response.data);;

                    if (response.data.error != null) {
                        angular.forEach(response.data.error, function (error) {
                            growl.error(error, { title: 'ERROR!' });
                        });
                    }
                    else
                        $scope.result = response.data;

                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    growl.error(response.statusText, { title: 'ERROR!' });
                });
            }
            else
                $rootScope.spinnerShow = false;
        };


        $scope.viewTicket = function (tx) {
            console.log("UserController.viewTicket triggered.");
            $rootScope.spinnerShow = true;
            if ($cookies.get('UI_TOKEN') !== undefined && $cookies.get('UI_TOKEN') !== null) {

                var data = {
                    securitytoken: $cookies.get('UI_TOKEN'),
                    FromTransactionDate: '',
                    ToTransactionDate: '',
                    TicketID: tx.ticketId,
                    View: true
                };

                $http({
                    method: 'POST',
                    url: apiURL + '/api/GETPROFILEHISTORY',
                    data: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                }).then(function successCallback(response) {
                    console.log(response.data);;
                    if (response.data.ErrorList != null) {
                        angular.forEach(response.data.ErrorList, function (error) {
                            growl.error(error, { title: 'ERROR!', ttl: '10000' });
                        });
                    }
                    else {
                        var RFIdList = [];
                        var currentRF;
                        angular.forEach(response.data.BookingHistory, function (bh) {
                            if (currentRF != bh.RefIdx) {
                                currentRF = bh.RefIdx;
                                RFIdList.push({
                                    RefId: bh.RefIdx,
                                    TicketList: []
                                });
                            }
                        });

                        angular.forEach(RFIdList, function (rf) {
                            angular.forEach(response.data.BookingHistory, function (bh2) {
                                if (bh2.RefIdx == rf.RefId) {
                                    rf.TicketList.push(bh2);
                                }
                            });
                        });

                        console.log(RFIdList);
                        console.log(response.data.BookingHistory[0].Userid);
                        $scope.bookingList = RFIdList;
                    }
                    $rootScope.spinnerShow = false;
                }).catch(function onError(response) {
                    console.log('ERROR!: ' + response.statusText + ' at line 287 user.js');
                    $rootScope.spinnerShow = false;
                });
            };
        }

        $scope.getAgentCrInfo = function () {
            console.log("UserController.getAgentCrInfo triggered.");
            var token = $cookies.get('UI_TOKEN');
            // console.log(token);

            var data = { securitytoken: token };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETAGENTCREDITINFO',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.ErrorList != null) {
                    angular.forEach(response.data.ErrorList, function (error) {
                        growl.error(error, { title: 'ERROR!', ttl: '10000' });
                    });
                }
                else
                    $scope.result = response.data;
            }).catch(function onError(response) {
                console.log('ERROR!: ' + response.statusText + ' at line 1504 user.js');
            });
        };

        $scope.userTnC = $sce.trustAsResourceUrl("https://intranet.ktmb.com.my/e-ticket/Images/TNC.pdf#zoom=71");
        $scope.guestTnC = $sce.trustAsResourceUrl("https://intranet.ktmb.com.my/e-ticket/Images/TNC.pdf#zoom=71");

        $scope.UploadFile = function (file) {
            console.log("UserController.UploadFile triggered.");
            $rootScope.spinnerShow = true;
            var token = $cookies.get('UI_TOKEN');
            // console.log(token);
            // console.log(file);

            var data = {
                Base64: file.base64,
                FileType: file.filetype,
                FileName: file.filename,
                FileSize: file.filesize
            };

            $http({
                method: 'POST',
                url: apiURL + '/api/UPLOADFILE',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data == null || response.data == '') {
                    growl.success('Your file is succesfully upload!', { title: 'SUCCESS!', ttl: '10000' });

                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!
                    var yyyy = today.getFullYear();
                    if (dd < 10) {
                        dd = '0' + dd;
                    }
                    if (mm < 10) {
                        mm = '0' + mm;
                    }
                    console.log(dd + '/' + mm + '/' + yyyy);

                    $scope.dateEmailList = dd + '/' + mm + '/' + yyyy;

                    var data = {
                        FromDate: $scope.dateEmailList,
                        ToDate: $scope.dateEmailList,
                        PaymentType: ""
                    };
                    $http({
                        method: 'POST',
                        url: apiURL + '/api/GETLISTUPLOADED',
                        data: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json; charset=utf-8' }
                    }).then(function successCallback(response) {
                        console.log(response.data);;
                        if (response.data.ErrorList != null) {
                            growl.error(response.data.ErrorList, { title: 'ERROR!', ttl: '10000' });
                            $rootScope.spinnerShow = false;
                        }
                        else {
                            if (response.data.TransactionList.length > 0) {
                                $scope.result = response.data;
                                $rootScope.spinnerShow = false;
                            }
                            else {
                                growl.success("There is no unsuccesful payment for this file", { title: 'SUCCESS!', ttl: '10000' });
                                $rootScope.spinnerShow = false;
                            }
                        }

                    }).catch(function onError(response) {
                        console.log(response);
                    });
                }
                else
                    growl.error(response.data, { title: 'ERROR!', ttl: '10000' });

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.GetRefundList = function (rpt) {
            console.log("UserController.GetRefundList triggered.");

            var token = $cookies.get('UI_TOKEN');
            var fromDay = rpt.txDateFrom.getDate();
            var fromMonth = (rpt.txDateFrom.getMonth() + 1);
            fromDay = fromDay.toString().length != 2 ? '0' + fromDay : fromDay;
            fromMonth = fromMonth.toString().length != 2 ? '0' + fromMonth : fromMonth;
            var txtDateFrom = fromDay + '/' + fromMonth + '/' + rpt.txDateFrom.getFullYear();

            var toDay = rpt.txDateTo.getDate();
            var toMonth = (rpt.txDateTo.getMonth() + 1);
            toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
            toMonth = toMonth.toString().length != 2 ? '0' + toMonth : fromMonth;
            var txtDateTo = toDay + '/' + toMonth + '/' + rpt.txDateTo.getFullYear();

            $cookies.put('FromDate', txtDateFrom);
            $cookies.put('ToDate', txtDateTo);
            $cookies.put('PaymentType', rpt.paymentType);

            //console.log(txtDate);
            //$scope.dateEmailList = txtDate;
            $rootScope.spinnerShow = true;

            var data = {
                FromDate: txtDateFrom,
                ToDate: txtDateTo,
                PaymentType: rpt.paymentType
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETLISTUPLOADED',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.ErrorList != null) {
                    growl.error(response.data.ErrorList, { title: 'ERROR!', ttl: '10000' });
                }
                else {
                    if (response.data.TransactionList.length > 0) {
                        $scope.result = response.data;
                        $scope.totalItems = $scope.result.TransactionList.length;
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        growl.success("There is no upload file for this date", { title: 'SUCCESS!', ttl: '10000' });
                        $rootScope.spinnerShow = false;
                    }
                }
            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.GetRefundListDate = function () {
            console.log("UserController.GetRefundListDate triggered.");
            var token = $cookies.get('UI_TOKEN');
            // console.log(token);

            $cookies.get('FromDate');
            $cookies.get('ToDate');
            $cookies.get('PaymentType');

            var data = {
                FromDate: $cookies.get('FromDate'),
                ToDate: $cookies.get('ToDate'),
                PaymentType: $cookies.get('PaymentType')
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETLISTUPLOADED',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            }).then(function successCallback(response) {
                if (response.data.ErrorList != null) {
                    growl.error(response.data.ErrorList, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    $scope.result = response.data;

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.emailList = [];
        $scope.getEmailList = function (name) {
            console.log("UserController.getEmailList triggered.");
            angular.forEach($scope.result.TransactionList, function (pm) {
                if (pm.ReferenceId == name) {
                    $scope.emailList.push(pm);
                }
            });
        };

        $scope.getEmailList2 = function (name) {
            console.log("UserController.getEmailList2 triggered.");
            angular.forEach($scope.result.TransactionList, function (pm) {
                if (pm.ReferenceId == name) {
                    angular.forEach($scope.result.TransactionList, function (a) {
                        if (a.EmailFinish == null || a.EmailFinish == undefined) {
                            a.EmailFinish = 'Y';
                        }
                    });
                    $scope.emailList.push(pm);
                }
            });
            console.log($scope.emailList);
        };

        $scope.SendEmailRefund = function () {
            console.log("UserController.SendEmailRefund triggered.");
            $rootScope.spinnerShow = true;
            console.log($scope.emailList);

            var data = { TransactionList: $scope.emailList }
            console.log(data);

            $http({
                method: 'POST',
                url: apiURL + '/api/SENDEMAILREFUND',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response.data);;
                $scope.res = response.data;
                angular.forEach($scope.res, function (item) {
                    console.log(item.isSuccess);
                    if (item.isSuccess == true) {
                        growl.success("Email has been sent to the customer.", { title: 'SUCCESS!', ttl: '10000' });
                        $scope.GetRefundListDate();
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        growl.error("Please try again", { title: 'ERROR!', ttl: '10000' });
                        $rootScope.spinnerShow = false;
                    }
                });

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.refundInfo = {};
        $scope.getRefundInfo = function (id) {
            console.log("UserController.getRefundInfo triggered.");
            angular.forEach($scope.result.detailList, function (i) {
                if (i.ID == id) {
                    $scope.refundInfo = i;
                }
            });
            console.log($scope.refundInfo);
        };

        $scope.GetRefund = function () {
            console.log("UserController.GetRefund triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                securitytoken: $cookies.get('UI_TOKEN'),
                DateUpdate: ""
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETREFUNDDETAILLIST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                $scope.result = response.data;
                console.log(response.data);;
                $rootScope.spinnerShow = false;
            }).catch(function onError(response) {
                console.log(response);
                $rootScope.spinnerShow = false;
            });
        };

        $scope.GetRefundX = function () {
            console.log("UserController.GetRefundX triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                securitytoken: $cookies.get('UI_TOKEN'),
                DateUpdate: ""
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETREFUNDDETAILLIST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                if (response.data.error != null) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                    $rootScope.spinnerShow = false;
                }
                else {
                    if (response.data.detailList.length > 0) {
                        $scope.result = response.data;
                        console.log($scope.result);
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        growl.success("There is no refund data to submit!", { title: 'SUCCESS!', ttl: '10000' });
                        $rootScope.spinnerShow = false;
                    }
                }
            }).catch(function onError(response) {
                console.log(response);
                $rootScope.spinnerShow = false;
            });
        };

        $scope.InsertRefundInfo = function (refundInfo) {
            console.log("UserController.InsertRefundInfo triggered.");
            $rootScope.spinnerShow = true;

            var data = {
                securitytoken: $cookies.get('UI_TOKEN'),
                TransactionDate: refundInfo.TransactionDate,
                Refid: refundInfo.Refid,
                TransactionID: refundInfo.TransactionID,
                BankName: refundInfo.BankName,
                BankNo: refundInfo.BankNo,
                AccHolderName: refundInfo.AccHolderName,
                AccHolderICNumber: refundInfo.AccHolderICNumber,
                Amount: refundInfo.Amount
            };
            console.log(data);
            //url: apiURL + '/api/GetRefundList',
            $http({
                method: 'POST',
                url: apiURL + '/api/INSERTREFUNDDETAIL',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            }).then(function successCallback(response) {
                $rootScope.spinnerShow = false;
                if (response.data.error != null) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '5000' });
                }
                else {
                    growl.success('Refund details successfully updated!', { title: 'SUCCESS!', ttl: '5000' });
                    $window.location.href = baseURL + '/user/refundinfo';
                }

                //$scope.GetRefundX();
                //console.log(response.data);;
                //$rootScope.spinnerShow = false;

            }).catch(function onError(response) {
                console.log(response);
                $rootScope.spinnerShow = false;
            });
        };

        $scope.refundInfo = [];
        $scope.getRefundInfo2 = function (id) {
            console.log("UserController.getRefundInfo triggered.");
            angular.forEach($scope.refundList.detailList, function (i) {
                if (i.ID == id) {
                    //$scope.refundInfo.push(i);
                    $scope.refundInfo = i;
                }
            });
            console.log($scope.refundInfo);
        };

        $scope.refundInfoList = [];
        $scope.GetRefundListDU = function (rpt) {
            console.log("UserController.GetRefundListDU triggered.");
            $rootScope.spinnerShow = true;

            var token = $cookies.get('UI_TOKEN');
            // console.log(token);
            var toDay = rpt.dateUpdate.getDate();
            var toMonth = (rpt.dateUpdate.getMonth() + 1);
            toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
            toMonth = toMonth.toString().length != 2 ? '0' + toMonth : fromMonth;
            var DateUpdated = toDay + '/' + toMonth + '/' + rpt.dateUpdate.getFullYear();
            //console.log(DateUpdated);
            $cookies.put('DateUpdated', DateUpdated);

            var data = {
                securitytoken: token,
                DateUpdate: DateUpdated,
                Refid: '',
                ProcessedDate: ''
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETREFUNDDETAILLIST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            })
             .then(function successCallback(response) {
                 console.log(response.data);;
                 if (response.data.error != null) {
                     growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                     $rootScope.spinnerShow = false;
                 }
                 else {
                     if (response.data.detailList.length > 0) {
                         $scope.refundList = response.data;
                         // console.log($scope.refundList);
                         $rootScope.spinnerShow = false;
                     }
                     else {
                         growl.success("There is no data updated on this date!", { title: 'SUCCESS!', ttl: '10000' });
                         $rootScope.spinnerShow = false;
                     }
                 }

             }).catch(function onError(response) {
                 console.log(response);
             });
        };

        $scope.GetRefundListDP = function (rpt) {
            console.log("UserController.GetRefundListDP triggered.");
            $rootScope.spinnerShow = true;

            var token = $cookies.get('UI_TOKEN');
            // console.log(token

            var toDay = rpt.dateProcess.getDate();
            var toMonth = (rpt.dateProcess.getMonth() + 1);
            toDay = toDay.toString().length != 2 ? '0' + toDay : toDay;
            toMonth = toMonth.toString().length != 2 ? '0' + toMonth : fromMonth;
            var DateProcess = toDay + '/' + toMonth + '/' + rpt.dateProcess.getFullYear();

            $cookies.put('DateProcess', DateProcess);
            var data = {
                securitytoken: token,
                DateUpdate: '',
                Refid: '',
                ProcessedDate: DateProcess
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETREFUNDDETAILLIST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.error != null) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                    $rootScope.spinnerShow = false;
                }
                else {
                    if (response.data.detailList.length > 0) {
                        $scope.refundList = response.data;
                        console.log($scope.refundList);
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        growl.success("There is no data updated on this date!", { title: 'SUCCESS!', ttl: '10000' });
                        $rootScope.spinnerShow = false;
                    }
                }

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.GetRefundListRI = function (rpt) {
            console.log("UserController.GetRefundListRI triggered.");
            $rootScope.spinnerShow = true;

            var token = $cookies.get('UI_TOKEN');
            // console.log(token
            $cookies.put('RefId', rpt.refId);

            var data = {
                securitytoken: token,
                DateUpdate: '',
                Refid: rpt.refId,
                ProcessedDate: ''
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETREFUNDDETAILLIST',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            }).then(function successCallback(response) {
                console.log(response.data);;
                if (response.data.error != null) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                    $rootScope.spinnerShow = false;
                }
                else {
                    if (response.data.detailList.length > 0) {
                        $scope.refundList = response.data;
                        console.log($scope.refundList);
                        $rootScope.spinnerShow = false;
                    }
                    else {
                        growl.success("There is no data updated on this date!", { title: 'SUCCESS!', ttl: '10000' });
                        $rootScope.spinnerShow = false;
                    }
                }

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.RefundIpayList = [];
        $scope.getRefundIpayList = function (name) {
            angular.forEach($scope.refundList.detailList, function (pm) {
                if (pm.Refid == name) {
                    var exist = false;
                    angular.forEach($scope.RefundIpayList, function (tm) {
                        if (tm == name) {
                            exist = true;
                            $scope.RefundIpayList.splice($scope.RefundIpayList.indexOf(name), 1);
                            //console.log("delete", name);
                        }
                    });
                    if (exist == false) {
                        $scope.RefundIpayList.push(pm.Refid);
                        //console.log("add", name);
                    }
                }
            });

            //angular.forEach($scope.RefundIpayList, function (tm) {
            //    console.log("resut", tm);
            //});


        };

        $scope.UpdateRefundInfo = function (refundInfo) {
            console.log("UserController.UpdateRefundInfo triggered.");
            $rootScope.spinnerShow = true;
            var data = {
                securitytoken: $cookies.get('UI_TOKEN'),
                ID: refundInfo.ID,
                Refid: refundInfo.Refid,
                TransactionDate: refundInfo.TransactionDate,
                TransactionID: refundInfo.TransactionID,
                BankName: refundInfo.BankName,
                BankNo: refundInfo.BankNo,
                AccHolderName: refundInfo.AccHolderName,
                AccHolderICNumber: refundInfo.AccHolderICNumber,
                Amount: refundInfo.Amount
            };
            console.log(data);
            $http({
                method: 'POST',
                url: apiURL + '/api/UPDATEREFUNDDETAIL',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            }).then(function successCallback(response) {
                if (response.data.error) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    growl.success('Refund details successfully updated!', { title: 'SUCCESS!' });
                $scope.GetRefundInfoListDate();
                console.log(response.data);;
                $rootScope.spinnerShow = false;

            }).catch(function onError(response) {
                console.log(response);
                $rootScope.spinnerShow = false;
            });
        };

        $scope.SendEmailIpayAll = function () {
            console.log("UserController.SendEmailIpayAll triggered.");
            $rootScope.spinnerShow = true;

            var token = $cookies.get('UI_TOKEN');
            var DateUpdated = $cookies.get('DateUpdated');

            var data = {
                securitytoken: token,
                DateUpdate: DateUpdated
            };

            $http({
                method: 'POST',
                url: apiURL + '/api/SENDEMAILIPAYALL',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                if (response.data.error) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    growl.success('Email sent!', { title: 'SUCCESS!' });
                //console.log(response.data);
                $rootScope.spinnerShow = false;

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.SendSelectedEmailIpay = function () {
            console.log("UserController.SendSelectedEmailIpay triggered.");
            //console.log("RefundIpayList Data", $scope.RefundIpayList);
            //$rootScope.spinnerShow = true;
            $scope.SendEmailIpaySingle($scope.RefundIpayList);
            $rootScope.spinnerShow = false;
        };


        $scope.SendEmailIpaySingle = function (RefidList) {
            console.log("UserController.SendEmailIpaySingle triggered.");

            $rootScope.spinnerShow = true;

            var token = $cookies.get('UI_TOKEN');
            var DateUpdated = $cookies.get('DateUpdated');
            var data = {
                securitytoken: token,
                refID: RefidList,
                dateTransaction: DateUpdated
            };
            //console.log(data);

            $http({
                method: 'POST',
                url: apiURL + '/api/SENDEMAILIPAY',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                if (response.data.error) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    growl.success('Email sent!', { title: 'SUCCESS!' });
                //console.log(response.data);
                $rootScope.spinnerShow = false;

            }).catch(function onError(response) {
                console.log(response);
            });
        };


        $scope.SendEmailIpay = function () {
            console.log("UserController.SendEmailIpay triggered.");

            $rootScope.spinnerShow = true;
            //console.log('IPAYYYY',$scope.RefundIpayList);

            var token = $cookies.get('UI_TOKEN');
            var data = {
                securitytoken: token,
                input: $scope.RefundIpayList
            };
            //console.log(data);

            $http({
                method: 'POST',
                url: apiURL + '/api/SENDEMAILIPAY',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }).then(function successCallback(response) {
                if (response.data.error) {
                    growl.error(response.data.error, { title: 'ERROR!', ttl: '10000' });
                }
                else
                    growl.success('Email sent!', { title: 'SUCCESS!' });
                //console.log(response.data);
                $rootScope.spinnerShow = false;

            }).catch(function onError(response) {
                console.log(response);
            });
        };

        $scope.refundHistory = function () {
            console.log("UserController.refundHistory triggered.");
            $rootScope.spinnerShow = true;

            var token = $cookies.get('UI_TOKEN');

            var data = {
                securitytoken: token,
            };
            $http({
                method: 'POST',
                url: apiURL + '/api/GETREFUNDDETAILHISTORY',
                data: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json; charset=utf-8' }

            }).then(function successCallback(response) {
                if (response.data.detailList.length == '0') {
                    growl.error("There is no data for refund history!", { title: 'ERROR!', ttl: '10000' });
                    $rootScope.spinnerShow = false;
                }
                else {
                    $scope.refundHistory = response.data;
                    console.log($scope.refundHistory);
                    $rootScope.spinnerShow = false;
                }
            }).catch(function onError(response) {
                console.log(response);
                $rootScope.spinnerShow = false;
            });
        };


        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function () {
            console.log('Page changed to: ' + $scope.currentPage);
        };

        $scope.setItemsPerPage = function (num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1; //reset to first page
        };

        ///////////////////////////////////////////////////////// SHARED FUNCTION //////////////////////////////////////////////

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

    }]);

})();