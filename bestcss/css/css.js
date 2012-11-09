define( ['jscss',  'text!css/something.css', 'css/basics', 'lessc!css/test.less'], function (jscss, something, basics, test) {
    jscss.embed(something);
    jscss.embed(jscss.compile(basics));
});