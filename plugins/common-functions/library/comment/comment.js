(function( $ ){
    var commentEditor = new NewMDE();
    $(document).ready(function() {
        $('.respond a').click(function () {
            var respondTo=$(this).closest('.respond').attr('class').match(/respond-to-(\S*)/)[1];
            if(respondTo) {
                commentEditor.value('@' + respondTo + ' ' + commentEditor.value());
            }
        });
    });

    $(document).ready(function(){
    var form=$('#commentform');
    form.on("submit",function(){
        //alert($('textarea[name="comment"]').val());
        //$('textarea[name="comment"]').val(commentEditor.value());
        $('<input type="hidden" name="citations"/>').appendTo('#commentform .form-submit').val(commentEditor.citations());
        //alert( $('input[name="citations"]').val());
        /*loading.show();
        $.ajax({
            url:form.attr('action'),
            data:form.serialize(), // form data
            type:form.attr('method'), // POST
            dataType: "json",
            beforeSend:function(){
            },
            success:function(res){
                loading.hide();
                if(!res.post){
                    return false;
                }
                updateEditForm(res);
                var messageBox=$('<div/>',{html:res.message});
                messageBox.dialog(
                    {
                        buttons:[
                            {
                                html: res.view,//link
                                click: function () {
                                    window.location=res.redirect;
                                }
                            },
                            {
                                html: 'Stay',
                                click:function(){
                                    $(this).remove();
                                    history.pushState(null, null, "?id="+res.post.ID);
                                }
                            }
                        ],
                    }
                );

            }
        });
        return false;
         */
    });

    });

})(jQuery);

jQuery(document).ready(function($){
    $('.comment-menus .edit a').click(function() {
        var commentID = $(this).getCommentID();
        $.ajax({
            url: ajaxurl,
            data: {ID: commentID, action: 'ajax_edit_comment'},
            type: 'post',
            dataType: "json",
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
            },
            success: function (res) {
                if (res.message == 'Error!') {
                    alert(res.message);
                } else {
                    //alert(res.commentList);
                    location.reload();
                }
            }
        });
        return false;
    });


});