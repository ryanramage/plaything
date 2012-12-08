define(['jquery', 'couchr', 'js/analyserChart'], function($, couchr, analyserChart){

	var mediaStreamSource,
		analyserNode,
		audioInput,
	    realAudioInput,
	    inputPoint ,
	    zeroGain,
	    audioRecorder ,
	    audioContext,
	    chart,
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


	var canvas = document.getElementById("analyser");
	chart = new analyserChart(canvas);


	audioContext = getAudioContext();
	doc = {
		_id: new Date().getTime() + '',
		type : 'recording'
	}

	couchr.post('_db', doc, function(err, rest) {
		if (err) return console.log('could not post doc');
		doc._rev = rest.rev;
	}) 



	function gotStream(stream) {
	    inputPoint = audioContext.createGainNode();

	    // Create an AudioNode from the stream.
	    realAudioInput = audioContext.createMediaStreamSource(stream);
	    audioInput = realAudioInput;
	    audioInput.connect(inputPoint);

	//    audioInput = convertToMono( input );

	    analyserNode = audioContext.createAnalyser();
	    analyserNode.fftSize = 2048;
	    inputPoint.connect( analyserNode );

	    audioRecorder = new Recorder( inputPoint, {
			workerPath: 'js/recorderWorker.js'
		});

	    zeroGain = audioContext.createGainNode();
	    zeroGain.gain.value = 0.0;
	    inputPoint.connect( zeroGain );
	    zeroGain.connect( audioContext.destination );

	    chart.start(analyserNode);
	    audioRecorder.clear();
        audioRecorder.record();
	    // export a wav every second, so we can send it using websockets
	    intervalKey = setInterval(saveSection, 10000);
	    
	}


	function saveSection() {
       audioRecorder.exportWAV(function(blob) {
           audioRecorder.clear();
            var form = new FormData();
            form.append('_attachments', blob, att_id++);
            form.append("_rev", doc._rev);
            var oReq = new XMLHttpRequest();
            oReq.onreadystatechange = function() {
           		if (oReq.readyState === 2) {
           			doc._rev = oReq.getResponseHeader('ETag');
           		}
            };
			oReq.open("POST", '_db/' + doc._id);
			oReq.send(form);
       });		
	}


	function startRecording() {
		getUserMedia({audio: true}, gotStream, onFailSoHard);
	}


	function stopRecording() {
		audioRecorder.stop();
		//mediaStreamSource.disconnect();
		clearInterval(intervalKey);
		chart.done();
	}
    var onFailSoHard = function(e) {
		console.log('Reeeejected!', e);
	};

	return {
		on_dom_ready: function() {
			$('button.start').on('click', startRecording);
			$('button.stop').on('click', stopRecording);
		}
	}
})