define(['jquery', 'couchr', 'js/analyserChart', 'js/player'], function($, couchr, analyserChart, player){

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
		storageSize = 20000*1024,
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

	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;


	var canvas = document.getElementById("analyser");
	chart = new analyserChart(canvas);


	audioContext = getAudioContext();




	function gotStream(stream, fileWriter) {
	    inputPoint = audioContext.createGainNode();

	    // Create an AudioNode from the stream.
	    realAudioInput = audioContext.createMediaStreamSource(stream);
	    audioInput = realAudioInput;
	    audioInput.connect(inputPoint);

	//    audioInput = convertToMono( input );

	    analyserNode = audioContext.createAnalyser();
	    analyserNode.fftSize = 2048;
	    inputPoint.connect( analyserNode );

	    var first = true;
	    audioRecorder = new Recorder( inputPoint, {
			workerPath: 'js/recorderWorker.js',
			onDataReady : function(data){		
				
				var b = new Blob([data], {  });
				try {
					if (first) {
						console.log(data);	
				    	fileWriter.write(b);
				    	first=false;
				    }
				} catch(ee) {
					console.log(ee);
				}
			}
		});

	    zeroGain = audioContext.createGainNode();
	    zeroGain.gain.value = 0.0;
	    inputPoint.connect( zeroGain );
	    //zeroGain.connect( audioContext.destination );
	    chart.start(analyserNode);
        audioRecorder.record();	    
	}

	function fwDone(evt) {
		console.log("Write completed.", evt);
		//console.log(fileWriter.position, fileWriter.length);
	}
	function fwError(evt) {
		console.log("Write failed:" + evt);
	}
	function onInitFs(fs) {
	  var filename = new Date().getTime() + '.spx' ;
	  console.log(filename, 'writing');
	  fs.root.getFile(filename, {create: true}, function(fileEntry) {

	    // Create a FileWriter object for our FileEntry (log.txt).
	    fileEntry.createWriter(function(fileWriter) {

		  fileWriter.onwrite = fwDone;
		  fileWriter.onerror = fwError;
	      // Create a new Blob and write it to log.txt.
	      getUserMedia({audio: true}, function(stream) {
	      	  gotStream(stream, fileWriter);
	      }, onFailSoHard);	
	    }, errorHandler);
	  }, errorHandler);

			
	}
	function toArray(list) {
	  return Array.prototype.slice.call(list || [], 0);
	}

	function listResults(entries) {
	  entries.forEach(function(entry, i) {
	  	$entry = $('<li>' +  entry.name  + '<li>');
	  	$entry.on('click', function(){  
	  		entry.file(function(file){
	  			player.playLocalFile(file);  
	  		})
	  	});
	  	$('#previous_entries').append($entry)
	  });

	}

	function listFs(fs) {
	  var dirReader = fs.root.createReader();
	  var entries = [];

	  // Call the reader.readEntries() until no more results are returned.
	  var readEntries = function() {
	     dirReader.readEntries (function(results) {
	      if (!results.length) {
	        listResults(entries.sort());
	      } else {
	        entries = entries.concat(toArray(results));
	        readEntries();
	      }
	    }, errorHandler);
	  };

	  readEntries(); // Start reading dirs.		
	}

	function errorHandler(e) {
	  var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  console.log('Error: ' + msg);
	}	


	function listRecordings() {
		window.requestFileSystem(PERSISTENT, storageSize, listFs, errorHandler);
	}
	listRecordings();


	function startRecording() {
		window.webkitStorageInfo.requestQuota(PERSISTENT, storageSize, function(grantedBytes) {
		  window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
		}, function(e) {
		  console.log('Error', e);
		});
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