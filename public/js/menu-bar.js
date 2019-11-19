

$(document).ready(function(){
	$("#menu_bar").load("../menu-bar.html");
	//$("#menu_bar").css({"display": "initial"});
});

$(document).on("click", "#menu_bar_arrow", function(){
	$("#menu_bar").css({"display": "none"});
});

$(document).on("click", "#header_menu_btn", function(){
	$("#menu_bar").css({"display": "initial"});
});