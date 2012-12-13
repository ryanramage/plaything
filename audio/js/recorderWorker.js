var recLength = 0,
  recBuffer = [], 
  sampleRate;

importScripts('xaudio.js', 'speex.js');

var resampler = new Resampler(44100, 8000, 1, 1024);
var refillBuffer = new Int16Array(190);
var codec = new Speex({ quality: 6 });

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'getBuffer':
      getBuffer();
      break;
    case 'clear':
      clear();
      break;
  }
};

function init(config){

}

function record(inputBuffer){
  var samples = resampler.resampler(inputBuffer);
  for (var i = 0; i < samples.length; ++i) {
      refillBuffer[i] = Math.ceil(samples[i] * 32768);
  }  
  onmicaudio(refillBuffer);
}

function onmicaudio (samples) {
  var encoded = codec.encode(samples);
  for (var i=0; i < encoded.length; i++) {
    recBuffer.push(encoded[i]);
  }
}


function getBuffer() {
  this.postMessage(recBuffer);
}



function clear(){
  recLength = 0;
  recBuffer = [];
}






