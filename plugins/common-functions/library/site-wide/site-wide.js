//function defaultParameter(arg, val) { return typeof arg !== 'undefined' ? arg : val; }
function defaultParameter(arg, val) { if(!arg){return val;}else{return arg;}}
function icon(icon){
    //return '<svg class="icon" aria-hidden="true"><use xlink:href="'+icon+'"></use></svg>';
    return '<i class="'+icon+'"></i>';
}


(function( $ ){
    $.fn.extend({
        getPostID: function() {
            return  this.closest('article').attr('id').match(/post-([0-9]*)/)[1];
        },
        getCommentID: function () {
            return this.closest('li').attr('id').match(/comment-([0-9]*)/)[1];
        },
    });
})( jQuery );