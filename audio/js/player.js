define([], function(){



	var returns =  {
		playLocalFile : playLocalFile
	}




	function playLocalFile(file) {
		console.log('play!!');

		var sink = new XAudioServer(1, 8000, 320, 512, function (samplesRequested) {}, 0),
			codec = new Speex({ quality: 6 }),
			reader = new FileReader(),
			read_length = 56,
			current_position = 0;

		var loadNext = function() {
		    current_position += read_length;
		    var blob = file.slice(0, current_position);  // mimetype is optional
		    reader.readAsArrayBuffer(blob);
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