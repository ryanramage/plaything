define(['jquery', 'couchr'], function($, couchr){

	var rec,
		mediaStreamSource,
		doc,
		att_id = 1,
		intervalKey;
   	var getUserMedia = function(options, success, error) {
   		var getUserMedia =
            window.navigator.getUserMedia ||
            window.navigator.mozGetUserMedia ||
            window.navigator.webkitGetUserMedia ||
            window.navigator.msGetUserMedia ||
            function(options, success, error) {
                error();
            };

        return getUserMedia.call(window.navigator, options, success, error);
    }

    var getAudioContext = function() {
    	return new (window.AudioContext || window.webkitAudioContext);
    }


    var onFailSoHard = function(e) {
		console.log('Reeeejected!', e);
	};


	doc = {
		_id: new Date().getTime() + '',
		type : 'recording'
	}

	couchr.post('_db', doc, function(err, rest) {
		if (err) return console.log('could not post doc');
		doc._rev = rest.rev;
	}) 






	function startRecording() {
		console.log('start');


		// Not showing vendor prefixes.
		getUserMedia({audio: true}, function(stream) {
			console.log('here');
			var context = getAudioContext();
			mediaStreamSource = context.createMediaStreamSource(stream);
			rec = new Recorder(mediaStreamSource, {
				workerPath: 'js/recorderWorker.js'
			});
			rec.record();
	       // export a wav every second, so we can send it using websockets
	       intervalKey = setInterval(function() {
	           rec.exportWAV(function(blob) {
	               rec.clear();

	               //Recorder.forceDownload(blob, att_id);

	                var form = new FormData();
	                form.append('_attachments', blob, att_id++);
	                form.append("_rev", doc._rev);
	                var oReq = new XMLHttpRequest();
	                oReq.onreadystatechange = function() {
	               		if (oReq.readyState === 2) {
	               			doc._rev = oReq.getResponseHeader('ETag');
	               			console.log(doc._rev);
	               		}
	                };
					oReq.open("POST", '_db/' + doc._id);
					oReq.send(form);
	           });
	        }, 10000);
		}, onFailSoHard);
	}


	function stopRecording() {
		console.log(stop);
		rec.stop();
		mediaStreamSource.disconnect();

		clearInterval(intervalKey);
		console.log('process');
	}


	return {
		on_dom_ready: function() {
			$('button.start').on('click', startRecording);
			$('button.stop').on('click', stopRecording);
		}
	}
})