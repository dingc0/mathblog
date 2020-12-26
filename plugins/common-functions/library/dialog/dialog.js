
(function( $ ){
    $.extend($.ui.dialog.prototype.options,{
        //create: function (event) { $(event.target).parent().css('position', 'fixed');},
        modal:true,
        dialogClass:'modal-dialog',
        //resizable: false,
    });
    $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
        _title: function(title) {
            if (!this.options.title ) {
                //title.html("&#160;");
            } else {
                title.html(this.options.title);
            }
        }
    }));


    $.fn.extend({
        getPostID: function() {
            return  this.closest('article').attr('id').match(/post-([0-9]*)/)[1];
        },
        progress:function(){
            var that=this;
            $(that).append('<div class="progress-label">...</div>\n' +
                '<div id="progressbar"></div>');
            var progressbar = $( "#progressbar" ),
                progressLabel = $( ".progress-label" );
            progressbar.progressbar({
                value: false,
                change: function() {
                    progressLabel.text( progressbar.progressbar( "value" ) + "%" );
                },
                complete: function() {
                    //progressLabel.text( "Complete!" );
                    progressLabel.remove();
                    progressbar.remove();
                }
            });
        },
    });

})( jQuery );
jQuery(document).ready(function($) {
//test
});


