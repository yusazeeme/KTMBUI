﻿(function () {
    var app = angular.module('cms', []);

    app.controller('CMSController', ["$scope", "$http", 'growl', '$window', 'intranetURL', '$rootScope', '$location', '$parse', '$cookies', 'baseURL', 'cmsURL', function ($scope, $http, growl, $window, intranetURL, $rootScope, $location, $parse, $cookies, baseURL, cmsURL) {
        console.log("CMSController logged on.");

        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 5;

        //$scope.getMenu = function () {
        //    console.log("CMSController.getMenu triggered");
        //    $http({
        //        method: 'GET',
        //        url: cmsURL + '/api/getmenu'
        //    }).then(function onSuccess(response) {
        //        console.log(response.data);
        //        $scope.allMenu = response.data;
        //    }).catch(function onError(response) {
        //        console.log(response);
        //    });
        //};

        $scope.getHomepage = function () {
            console.log("CMSController.getHomepage triggered");
            $http({
                method: 'GET',
                url: cmsURL + '/api/homepage'
            }).then(function onSuccess(response) {
                console.log(response.data);
                $scope.homepageContent = response.data;
                $scope.content = response.data;
            }).catch(function onError(response) {
                console.log(response);
            });
        };

        //$scope.getPromotion = function () {
        //    console.log("CMSController.getPromotion triggered");
        //    $http({
        //        method: 'GET',
        //        url: cmsURL + '/api/promotion'
        //    }).then(function onSuccess(response) {
        //        console.log(response.data);
        //        $scope.Promotion = response.data;
        //    }).catch(function onError(response) {
        //        console.log(response);
        //    });
        //};

        //$scope.getContent = function (menuid) {
        //    console.log("CMSController.getContent triggered");
        //    $http({
        //        method: 'GET',
        //        url: cmsURL + '/api/getcontent?menuid=' + menuid
        //    }).then(function onSuccess(response) {
        //        console.log(response.data);
        //        if (response.data.SingleContent != null && response.data.SingleContent != undefined) {
        //            if (response.data.SingleContent.IsParent) {
        //                if (response.data.SingleContent.FirstChildLinkTo == 'portal/full')
        //                    $window.location.href = baseURL + '/portal/full/' + response.data.SingleContent.FirstChildId;
        //                if (response.data.SingleContent.FirstChildLinkTo == 'portal/full3')
        //                    $window.location.href = baseURL + '/portal/full3/' + response.data.SingleContent.FirstChildId;
        //                if (response.data.SingleContent.FirstChildLinkTo == 'portal/full4')
        //                    $window.location.href = baseURL + '/portal/full4/' + response.data.SingleContent.FirstChildId;
        //                if (response.data.SingleContent.FirstChildLinkTo == 'portal/left')
        //                    $window.location.href = baseURL + '/portal/left/' + response.data.SingleContent.FirstChildId;
        //            }

        //            $scope.content = response.data;
        //            $scope.content.SingleContent.ContentEn = $scope.content.SingleContent.ContentEn.replace(/src="/g, 'src="' + intranetURL);
        //            $scope.content.SingleContent.ContentMy = $scope.content.SingleContent.ContentMy.replace(/src="/g, 'src="' + intranetURL);
        //            $scope.content.SingleContent.ContentEn = $scope.content.SingleContent.ContentEn.replace(/href="/g, 'href="' + intranetURL);
        //            $scope.content.SingleContent.ContentMy = $scope.content.SingleContent.ContentMy.replace(/href="/g, 'href="' + intranetURL);
        //        }       
        //    }).catch(function onError(response) {
        //        console.log(response);
        //    });
        //};

        //$scope.getContentList = function (menuid, daterestriction) {
        //    $rootScope.spinnerShow = true;
        //    console.log("CMSController.getContentList triggered");
        //    $http({
        //        method: 'GET',
        //        url: cmsURL + '/api/getcontentlist?menuid=' + menuid + '&rd=' + daterestriction
        //    }).then(function onSuccess(response) {
        //        $scope.content = response.data;                
        //        $rootScope.spinnerShow = false;
        //        $scope.totalItems = $scope.content.ContentList.length;
        //        console.log(response.data);
        //    }).catch(function onError(response) {
        //        console.log(response);
        //        $rootScope.spinnerShow = false;
        //    });
        //};

        //$scope.getContentList2 = function (menuid, daterestriction) {
        //    $rootScope.spinnerShow = true;
        //    console.log("CMSController.getContentList2 triggered");
        //    $http({
        //        method: 'GET',
        //        url: cmsURL + '/api/getcontentlist2?menuid=' + menuid + '&rd=' + daterestriction
        //    }).then(function onSuccess(response) {
        //        $scope.content = response.data;
        //        $rootScope.spinnerShow = false;
        //        $scope.totalItems = $scope.content.ContentList.length;
        //        console.log(response.data);
        //    }).catch(function onError(response) {
        //        console.log(response);
        //        $rootScope.spinnerShow = false;
        //    });
        //};
                
        //$scope.getAnnouncement = function (menuid, daterestriction) {
        //    $rootScope.spinnerShow = true;
        //    console.log("CMSController.getAnnouncement triggered");
        //    $http({
        //        method: 'GET',
        //        url: cmsURL + '/api/getcontentlist?menuid=' + menuid + '&rd=' + daterestriction
        //    }).then(function onSuccess(response) {
        //        $scope.notice = response.data;
        //        $rootScope.spinnerShow = false;
        //        console.log(response.data);
        //    }).catch(function onError(response) {
        //        console.log(response);
        //        $rootScope.spinnerShow = false;
        //    });
        //};

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

       //$scope.filter('content', function () {
       //     return function (items) {
       //         var filtered = [];
       //         for (var i = 0; i < items.length; i++) {
       //             var item = items[i];
       //             if (/a/i.test(item.name.substring(0, 1))) {
       //                 filtered.push(item);
       //             }
       //         }
       //         return filtered;
       //     };
       // });               
                
    }]);

})();