function defaultParameter(arg, val) { return typeof arg !== 'undefined' ? arg : val; }
(function( $ ){
    $.extend({
        dialog: function(object){
            object.id=defaultParameter(object.id,"dialog");
            object.class=defaultParameter(object.class,"dialog");
            object.content=defaultParameter(object.content,'');
            object.title=defaultParameter(object.title,'');
            object.buttons=defaultParameter(object.buttons,{});
            object.element=defaultParameter(object.element,$('body'));
            var dialogHTML='<div id="'+object.id+'" class="dialog-common '+object.class+'"><p class="dialog-title">'+object.title+'</p><p class="dialog-content">'+object.content+'</p><div class="dialog-buttons">';
            var buttonHTML='';

            $.each(object.buttons,function(key,val){
                buttonHTML=buttonHTML+'<button id="'+key+'">'+key+'</button>   ';
            });
            dialogHTML=dialogHTML+buttonHTML+'</div></div><div id="'+object.id+'-background" class="dialog-background-common '+object.class+'-background"></div>';
            object.element.append(dialogHTML);
            $.each(object.buttons,function(key,val){
                if(!val){
                    val=function(){
                        $('#'+ object.id).remove();
                        $('#'+object.id+ '-background').remove();
                    }
                }
                $('#'+object.id+ ' #'+key).click(val);
            });
        },
    });
    $.fn.extend({
        getPostID: function() {
           return  this.closest('article').attr('id').match(/post-([0-9]*)/)[1];
        },
        beginProcess:  function(text,id){
            text=defaultParameter(text,'processing...');
            id=defaultParameter(id,"process");
            this.append('<div id="'+id+'-backgorund"></div><div id="'+id+'">'+text+'</div>');
            $('#'+id+'-background').addClass('cover-background');
            $('#'+id).addClass('cover');
            return this;
        },
        endProcess: function(id){
            id=defaultParameter(id,"process");
            this.children('.cover-background,.cover').remove();
            return this;
        },

});
})( jQuery );