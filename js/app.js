var app = angular.module('aceron', ["ngRoute"]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider 
	.when('/', {
		templateUrl:'views/home.html', 
		controller: 'HomeViewController'
	})
	.when('/perfiles/:Type', {
		templateUrl: 'views/types.html',
		controller: 'TypesViewController'
	})	
	.when('/perfiles/designacion/:Designation', {
		templateUrl: 'views/designation.html',
		controller: 'DesignationViewController'
	})
	.when('/calculo', {
		templateUrl: 'views/calculate.html',
		controller: 'CalculateViewController'
	})	
	.otherwise({
		redirectTo:'/'
	})
}])

//Common function to get data from JSON
var getJSON = function ($scope, $http){
	$http.get("js/steel-beams.json").success(function(data) {
		$scope.items = data;	
	})
}

//Controllers
app.controller('HomeViewController', ['$scope', '$http', function($scope, $http) {
	$scope.appTittle = "  A C E R Ó N  ";
	$scope.appSubTittle = "Prontuario online de Perfiles de Acero normalizados en España";
}]);

app.controller('TypesViewController', ['$scope', '$http', '$routeParams','$location', 'anchorSmoothScroll',
	function($scope, $http, $routeParams, $location, anchorSmoothScroll) {
		$scope.Type = $routeParams.Type;
		getJSON($scope, $http);

      //Set the location to the id of the element to scroll to
      $scope.gotoElement = function (id){
      	anchorSmoothScroll.scrollTo(id);     
      };
  }]);

app.controller('DesignationViewController', ['$scope', '$http', '$routeParams',  function($scope, $http, $routeParams) {
	$scope.Designation = $routeParams.Designation;
	getJSON($scope, $http);
}]);

app.controller('CalculateViewController', ['$scope', '$http', '$routeParams',  function($scope, $http, $routeParams) {
	$scope.Type = $routeParams.Type;
	$scope.Designation = $routeParams.Designation;
	getJSON($scope, $http);

	//Call calculate beam function
	$scope.calculateBeam = function(){
		DataBeam();
	};

	//Function to delete beam result
	$scope.DeleteBeamResult = function(){
		$('#beamResult').empty();
	};
}]);

//Function to calculate beam designation of specific data beam
var DataBeam = function(){

	//Get values of user data beam
	this.Qbeam = $('#Qbeam').val();
	this.Lbeam = $('#Lbeam').val();
	this.typeBeam = $('select[name=type]').val();
	this.defBeam = 5;
	this.Ebeam = 210000;

	//Calculate Ibeam according to user data beam
	var getIbeam = function() {	
		var Lbeampow4 = Math.pow(this.Lbeam*1000, 4);
		return (this.defBeam*this.Qbeam*Lbeampow4/(10000*384*this.Ebeam*((1000*this.Lbeam)/350)));
	}

	var getQbeam = function (){
		return(this.Qbeam);
	}
	var getLbeam = function (){
		return(this.Lbeam);
	}

	var getTypebeam = function (){
		return(this.typeBeam);
	}

	//Request to find the specific designation beam
	function RequestBeam() {
		$.ajax({
			url: "js/steel-beams.json",
			data: '',
			dataType: 'json',	 	
			success: function(data) {

				var GetDesignationBeam = function () {

					var ArrayType =  new Array();

					data.forEach(function(beam){
						if (getTypebeam() === beam.Type &&  getIbeam() < beam.Iy  &&  getIbeam() >= 0) {
							ArrayType.push(beam);
						} else {
							return(false);
						}
					});

					if (ArrayType[0] === undefined) {
						return(false);
					} else {
						return(ArrayType[0].Designation);
					}

				};

				//Card result data message
				var beamResultData = 
				'<div class="callout primary text-center small" data-closable>'+
					'<h5>El perfil de acero asignado es: </h5>'+
					'<div><a href="#/perfiles/designacion/'+GetDesignationBeam()+'"><h4 class="designation-card">'+GetDesignationBeam()+'</h4></div>'+
					'<div><img class="img-beam-designation"  style="margin: 0" src="img/sections/'+getTypebeam()+'.png" alt="'+getTypebeam()+'" width="70%"></a></div>'+
					'<div><p class="footer-img-card">Pincha para acceder a las propiedades del perfil</p></div>'+
					'<div><p><strong>Datos aportados:</strong></p></div>'+
					'<div><p class="data-card">Q='+getQbeam()+'kN/m L='+getLbeam()+'m I<sub>min</sub>='+getIbeam().toFixed(2)+'x10<sup>4</sup>mm<sup>4</sup></p></div>'+					
					'<button class="close-button" aria-label="Dismiss alert" type="button" data-close>'+
					'<span aria-hidden="true">&times;</span></button>'+
				'</div>'

				//Card error message
				var ErrorResultData = 
				'<div class="callout alert text-center small" data-closable>'+
					'<h3><strong>¡¡¡ERROR!!!</strong></h5>'+
					'<div><h5> No se ha podido asignar ningún perfil</h5></div>'+
					'<div><img class="img-beam-designation"  style="margin: 0" src="img/Error.JPG" alt=" " width="70%"></div><br>'+
					'<div><p>Prueba con otro tipo de perfil para los datos indroducidos o corrige tus datos</p></div>'+
					'<button class="close-button" aria-label="Dismiss alert" type="button" data-close>'+
					'<span aria-hidden="true">&times;</span></button>'+
				'</div>'

				//Show cards when user click calculate button
				if (GetDesignationBeam() === false) {	
					$('#beamResult').prepend(ErrorResultData);
				} else {
					$('#beamResult').prepend(beamResultData);
				}

			},
			type: 'GET'

		});

	};

	RequestBeam();
};

//Scroll to id
app.service('anchorSmoothScroll', function(){

	this.scrollTo = function(id) {

		var startY = currentYPosition();
		var stopY = elmYPosition(id);
		var distance = stopY > startY ? stopY - startY : startY - stopY;
		if (distance < 100) {
			scrollTo(0, stopY); return;
		}
		var speed = Math.round(distance / 100);
		if (speed >= 20) speed = 20;
		var step = Math.round(distance / 25);
		var leapY = stopY > startY ? startY + step : startY - step;
		var timer = 0;
		if (stopY > startY) {
			for ( var i=startY; i<stopY; i+=step ) {
				setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
				leapY += step; if (leapY > stopY) leapY = stopY; timer++;
			} return;
		}
		for ( var i=startY; i>stopY; i-=step ) {
			setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
			leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
		}

		function currentYPosition() {
			if (self.pageYOffset) return self.pageYOffset;
			if (document.documentElement && document.documentElement.scrollTop)
				return document.documentElement.scrollTop;
			if (document.body.scrollTop) return document.body.scrollTop;
			return 0;
		}

		function elmYPosition(id) {
			var elm = document.getElementById(id);
			var y = elm.offsetTop;
			var node = elm;
			while (node.offsetParent && node.offsetParent != document.body) {
				node = node.offsetParent;
				y += node.offsetTop;
			} return y;
		}

	};

});

