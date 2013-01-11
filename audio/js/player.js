define([], function(){



	var returns =  {
		playLocalFile : playLocalFile
	}




	function playLocalFile(file) {
		console.log('play!!', file);

		var sink = new XAudioServer(1, 8000, 320, 1024, function (samplesRequested) {
			console.log('out of samples', samplesRequested)
		}, 0, function() {
			console.log('failed');
		}),
			codec = new Speex({ quality: 6 }),
			reader = new FileReader(),
			read_length = 5120,
			current_position = 0;

		var loadNext = function() {
		    current_position += read_length;
		    var blob = file.slice(0, current_position);  // mimetype is optional
		    reader.readAsArrayBuffer(blob);
		}

		reader.onerror = function(err) {
			console.log('loading error: ', err);
		}


	    reader.onload = function(e) {
	      var raw = e.target.result; // arrayBuffer containing bytes 
	      var encoded = new Uint8Array(raw)
	      console.log(encoded);
          var decoded = codec.decode(encoded);
          console.log(decoded);
          sink.writeAudio(decoded); 
	    };


	    loadNext();
	}
	return returns;
});