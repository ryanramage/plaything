(function(window){

  var WORKER_PATH = 'recorderWorker.js';

 var resampler = new Resampler(44100, 8000, 1, 1024);
 var refillBuffer = new Int16Array(690);
 var codec = new Speex({ quality: 6 });
 var block = [],
     block_start, 
     block_end;


  function record2(inputBuffer, cb){
    var samples = resampler.resampler(inputBuffer);
    for (var i = 0; i < samples.length; ++i) {
        refillBuffer[i] = Math.ceil(samples[i] * 32768);
    }  
    onmicaudio(refillBuffer, cb);
  }

  function onmicaudio (samples, cb) {
    var encoded = codec.encode(samples);  
    if (encoded) {
      if (cb) {
        console.log('data ready', new Date().getTime());
        cb(encoded);
      }
    }
  }



  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 1024;
    this.context = source.context;
    this.node = this.context.createJavaScriptNode(bufferLen, 1, 1);
    this.onDataReady = config.onDataReady;
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;
      record2(e.inputBuffer.getChannelData(0), config.onDataReady);
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      block_start = new Date().getTime();
      recording = true;
    }

    this.stop = function(){
      block_end = new Date().getTime();
      recording = false;
    }


    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };

  window.Recorder = Recorder;

})(window);
