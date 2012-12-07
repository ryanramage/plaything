define([], function(){

	var chart = function(domelement, settings) {
		this.canvas = domelement;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.analyserNode = null;
        this.context = this.canvas.getContext('2d');
        this.SPACING = 3;
        this.BAR_WIDTH = 1;
        this.numBars = Math.round(this.canvasWidth / this.SPACING);
	}

	chart.prototype.start = function(analyserNode) {
		this.analyserNode = analyserNode;
		var me = this;
		this.rafID = window.webkitRequestAnimationFrame(function(){
			me.draw();
		});
	}

	chart.prototype.draw = function() {
		var freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);
		this.analyserNode.getByteFrequencyData(freqByteData);
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.context.fillStyle = '#F6D565';
        this.context.lineCap = 'round';
        var multiplier = this.analyserNode.frequencyBinCount / this.numBars;
        for (var i = 0; i < this.numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            this.context.fillStyle = "hsl( " + Math.round((i*360)/this.numBars) + ", 100%, 50%)";
            this.context.fillRect(i * this.SPACING, this.canvasHeight, this.BAR_WIDTH, -magnitude);
        }
        var me = this;
        this.rafID = window.webkitRequestAnimationFrame(function(){
			me.draw();
		});
	}

	chart.prototype.done = function() {
		clearInterval(this.timer);
	}

	return  chart;
});