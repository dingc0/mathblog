jQuery(document).ready(function($) {
    $('article').each(function(i,domObject) {
        //MathJax.startup.document.state(0);
        MathJax.texReset();
        MathJax.typesetPromise([domObject]);
    });
    MathJax.texReset();
    MathJax.typesetPromise();
});