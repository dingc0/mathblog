(function( $ ){
    $('.comment-menus').each(function(){
        var commentID=$(this).getCommentID();
        //alert(commentID);
        $(this).appendTo('#div-comment-'+commentID);
        $(this).removeClass('hidden');
    });

})( jQuery );