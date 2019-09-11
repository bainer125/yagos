var evtSource = new EventSource("/updates");
evtSource.onmessage = function(e) {
  	document.getElementById('clockText').innerHTML=e.data;
}