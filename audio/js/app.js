define(['jquery', 'couchr'], function($, couchr){

	var rec,
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



	// Not showing vendor prefixes.
	getUserMedia({audio: true}, function(stream) {

		var context = new webkitAudioContext();
		var mediaStreamSource = context.createMediaStreamSource(stream);
		rec = new Recorder(mediaStreamSource, {
			workerPath: 'js/recorderWorker.js'
		});



	}, onFailSoHard);


	function startRecording() {
		console.log('start');
		rec.record();
       // export a wav every second, so we can send it using websockets
       intervalKey = setInterval(function() {
           rec.exportWAV(function(blob) {
               rec.clear();

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
	}


	function stopRecording() {
		console.log(stop);
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