chrome.runtime.onInstalled.addListener(function (details) {
  chrome.runtime.openOptionsPage();
});

console.log("AutoLogin Started");

var username;
var password;

function get_options() {
  chrome.storage.sync.get([
    "username",
    "password"
  ], function(items) {
    if(items.username) {
      username = items.username;
      password = items.password;
      start();
    }
    else {
      console.log("Credentials not saved");
      return;
    }
  });
}

function start() {
	$.ajax({
		url: "https://agnigarh.iitg.ac.in:1442/login?",
		type: "GET",
		success: login,
		error: function(error) {
			console.log(error);
			start();
		}
	});
}

function login(result) {
	console.log(result);
	const magic = $(result).find('[name="magic"]').attr("value");
	const Tredir = $(result).find('[name="4Tredir"]').attr("value");
	console.log(magic);
	console.log(Tredir);
	const payload = {'4Tredir': Tredir, 'magic': magic, 'username': username, 'password': password};
	$.ajax({
		url: "https://agnigarh.iitg.ac.in:1442",
		data: payload,
		type: "POST",
		success: keepalive,
		error: function(error) {
			console.log(error);
			start();
		}
	});
}

function keepalive(result) {
	if(result.search("Authentication Failed")!=-1) {
		chrome.notifications.create({
	      "type": "basic",
	      "title": "Incorrect Credentials!",
	      "iconUrl": "icon.png",
	      "message": "Incorrect Please Update"
	    });
	}
	const url = $(result).text().split("=")[1].split("\"")[1];
	console.log(url);
	setInterval(function(){
		$.ajax({
			url,
			type: "GET",
			success: function(result) {
				console.log("AutoLogin Refreshed")
			},
			error: function(error) {
				console.log(error);
				start();
			}
		});
	}, 60000);
}

get_options();