define( ['jscss', 'less', 'text!css/something.css', 'css/basics', 'lessc!css/test.less'], function (jscss, less, something, basics, test) {
    jscss.embed(something);
    jscss.embed(jscss.compile(basics));
});