define([], function(){


function myMIDIMessagehandler(event) {
	console.log(event);
}



return {
	on_dom_ready: function(){

		setTimeout(function(){
			window.navigator.getMIDIAccess( onsuccesscallback, onerrorcallback );
			function onsuccesscallback( access ) { 
			    m = access;

			    // Things you can do with the MIDIAccess object:
			    var inputs = m.enumerateInputs();   // inputs = array of MIDIPorts
			    var outputs = m.enumerateOutputs(); // outputs = array of MIDIPorts

			    console.log(inputs);

			    var i = m.getInput( inputs[1] );    // grab first input device.  You can also getInput( index );
			    i.onmessage = myMIDIMessagehandler; // onmessage( event ), event.MIDIMessages = []MIDIMessage.
			    var o = m.getOutput( outputs[0] );  // grab first output device
			    o.sendMessage( 0x90, 0x45, 0xff );  // full velocity note on A4 on channel zero
			    o.sendMessage( 0x80, 0x45, 0x00 );  // A4 note off
			};
			function onerrorcallback() {

			}			
		}, 3000);

	}
}

});