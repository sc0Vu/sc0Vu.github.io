var cache = [];

self.onmessage = function (msg) {
	var msgData = msg.data;

	if (cache[msgData.url]) {
		return postMessage(cache[msgData.url]);
	}

	fetch(msgData.url).then(function (response) {
		if (response.ok) {
			return response.text();
		} else {
			return response;
		}
	}).then(function (data) {
		cache[msgData.url] = data;
		return postMessage({key: msgData.key, url: msgData.url, data: cache[msgData.url]});
	}).catch(function (error) {
		console.warn('Something wrong happen!');
	});
}

self.onerror = function (error) {
	console.warn('Something wrong happen!');
}