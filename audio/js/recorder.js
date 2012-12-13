(function(window){

  var WORKER_PATH = 'recorderWorker.js';

 var resampler = new Resampler(44100, 8000, 1, 1024);
 var refillBuffer = new Int16Array(190);
 var codec = new Speex({ quality: 6 });
 var block = [],
     block_start, 
     block_end;


function record2(inputBuffer){
  var samples = resampler.resampler(inputBuffer);
  for (var i = 0; i < samples.length; ++i) {
      refillBuffer[i] = Math.ceil(samples[i] * 32768);
  }  
  onmicaudio(refillBuffer);
}

function onmicaudio (samples) {
  var encoded = codec.encode(samples);  
  if (encoded) {
    var time = new Date().getTime();  
    if (!block_start) block_start = time;
    block_end   = time;    
    var start_index = block.length;
    block.length += encoded.length;    
    for (var i=0;i<encoded.length;i++) {
      block[ start_index + i ] = encoded[i];
    }
  }
}



  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 1024;
    this.context = source.context;
    this.node = this.context.createJavaScriptNode(bufferLen, 1, 1);
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){

      if (!recording) return;
      //worker.postMessage({
      //  command: 'record',
      //  buffer: e.inputBuffer.getChannelData(0)
      //  
      //});
      record2(e.inputBuffer.getChannelData(0));
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

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffer = function(cb) {
      currCallback = cb || config.callback;
      //worker.postMessage({ command: 'getBuffer' })
      var b = {
        start: block_start,
        end : block_end,
        dur : block_end - block_start,
        buffer: block
      }
      block_start = new Date().getTime();
      block_end = null;
      block = [];
      currCallback(b);
    }

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };

  window.Recorder = Recorder;

})(window);
