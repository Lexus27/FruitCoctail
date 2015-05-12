$(function(){
	resizze();

});

$(window).resize(function(){
	resizze();
});

$(window).load(function(){
	$(".spinner-bg").fadeOut();
	$(".spinner").fadeOut();
});

function resizze () {
	var k = 1.33;
	var height = $(window).height();
	$(".game").css({"width": (height * k) + "px"});
	$(".bg").css({"width": (height * k) + "px"});
}
