/* manage favorites*/
jQuery(document).ready(function($) {
    var IDClass='.favorites.current-blog';
    //$(IDClass+' .manage').click(function() {
    $(IDClass + ' .toggle').toggle();
    $(IDClass+ ' ul li').append("<a class='edit' href='#' title='edit'>"+MakeIcon('#icon-edit')+"</a>");
    $(IDClass+ ' ul').prepend("<li> <a class='new action' href='#'>"+MakeIcon('#icon-plus')+" New Category</a></li>");
            //return false;
        //});
    var dialogID='manage-categories';
    var dialogContent='<form  action="'+currentUserAdminAjaxURL+'" method="post">\n' +
        '                        <input  name="name" type="text"  placeholder=\'Enter your category here\' />\n' +
        '                        <input type="hidden" name="action" value="manage_favorites"/>\n' +
        '                        <input type="hidden" name="task"  value=""/>\n' +
        '                        <input type="hidden" name="id"  value="0"/>\n' +
        '                    </form>';

    $(IDClass+' .new').click(function(){
        var   dialogButtons={Save:function(){$('#'+dialogID+ ' form input[name="task"]').val('new');
        if($('#'+dialogID+' input[name="name"]').val()==''){alert("Please enter your category!");return false;}else{$('#'+dialogID+ ' form').submit();}},
        Cancel:''};
        $.dialog({id:dialogID,title: 'Edit Category', content:dialogContent,buttons:dialogButtons});
        return false;
    });
    $(document).on('click',IDClass+' ul li .edit',function(){
        var itemID=$(this).getItemID();
        var   dialogButtons={
            Save:function(){$('#'+dialogID+ ' form input[name="task"]').val('update');
                if($('#'+dialogID+' input[name="name"]').val()==''){alert("Please enter your category!");return false;}else{$('#'+dialogID+ 'form').submit();}
                $('#'+dialogID+ ' form').submit();
                //$('#'+dialogID+ ' #Cancel').click();
            },
            Delete:function(){$('#'+dialogID+ ' form input[name="task"]').val('trash');

                if(confirm("You are about to delete the category! Are you sure?")){
                    $('#'+dialogID+ ' form').submit();
                    //$('#'+dialogID+ ' #Cancel').click();
                }

                },
            Cancel:''
        };
        $.dialog({id:dialogID,title: 'Edit Category', content:dialogContent,buttons:dialogButtons});
        $('#'+dialogID+ ' form input[name="id"]').val(itemID);
        var name=$(this).parent().children(':first-child').text();
        $('#'+dialogID+" input[name='name']").val(name);
        return false;
    });


    $(document).off('submit',"#"+dialogID+"  form").on("submit","#"+dialogID+"  form",function(){
        var form=$('#'+dialogID+"  form");
        $.ajax({
            url:form.attr('action'),
            data:form.serialize(),
            type:form.attr('method'),
            dataType: "json",
            beforeSend: function () {
                $('body').beginProcess();
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            },
            success: function (res) {
                $('body').endProcess();
                $('#'+dialogID+ ' #Cancel').click();
                $.dialog({id:'message',content:res.message,buttons:{OK:''}});

                $(IDClass+ ' ul').html(res.favoriteList);
                $('.favorites.current-user-blog ul').html(res.favoriteList);

                $(IDClass+ ' ul li').append("<a class='edit' href='#' title='edit'>"+MakeIcon('#icon-edit')+"</a>");
                $(IDClass+ ' ul').prepend("<li> <a class='new action' href='#'>"+MakeIcon('#icon-plus')+" New Category</a></li>");
            }
        });
        return false;
    });
    /*$(IDClass+' .managed').click(function(){
        $(IDClass + ' .toggle').toggle();
        $(IDClass+ ' ul li .edit').remove();
        return false;
    });*/

});

/*manage subscriptions*/
jQuery(document).ready(function($) {

    $(".new-feed").on("click",function(e){
        e.preventDefault();
        var  DialogID="add-feed";
        var  Content= '<form class="add-feed-form"  action="'+AdminAjaxURL+'" method="post"><input type="text" name="feed-url" placeholder="https://example.com/post-link"/><p></p><input type="hidden" name="category-ids" value=""/><input type="hidden" name="post-id" value="0"/><input type="hidden" name="action" value="insert_feed"/><button type="button" class="save click-me" name="save">Save</button>    <button class="dialog-button-ok">Cancel</button></form>'
        CreateDialog(Content,'Add a Post URL',DialogID,'');
        var form= $('#'+DialogID+' form');
        $("#"+DialogID+" form  .save").on("click",function(){
            //e.preventDefault();
            SelectFavorites(ReturnCategoryIDs);
            function ReturnCategoryIDs(CategoryIDs){
                $('#'+DialogID+' form input[name="category-ids"]').val(CategoryIDs);
                $('#'+DialogID+' form').submit();
            }
        });
        form.on("submit",function(e){
            $.ajax({
                url:form.attr('action'),
                data:form.serialize(),
                type:form.attr('method'),
                dataType: "json",
                beforeSend:function(){
                   BeginProcess();
                },
                error: function() { },
                success:function(res){

                    RemoveDialog(DialogID);
                    EndProcess();
                    //alert(res.Message);
                    CreateDialog(res.Message,undefined,'reload-page',undefined,ReloadPage);
                }
            });

            return false;
        });
        return false;
    });

    $(".edit-feed-link").on("click",function(e){

        var  DialogID="edit-feed";
        var PostID=$(this).getPostID();
        var FeedURL=$(this).attr('href');
        var CategoryIDs=$('#post-'+PostID+' .favorite-link').attr('href');

        var  Content= '<form  action="'+AdminAjaxURL+'" method="post">' +
            '<input type="text" name="feed-url" placeholder="https://example.com/post-link" value="' + FeedURL +'"/><p></p>' +
            '<input type="hidden" name="category-ids" value="'+ CategoryIDs +'"/><input type="hidden" name="post-id" value="'+PostID+'"/>' +
            '<input type="hidden" name="action" value="insert_feed"/><input type="hidden" name="FeedTask" value=""/>' +
            '<button type="button" class="save" name="save" value="update">Save</button>  <button type="button" class="delete" name="delete"  value="delete">Delete</button>  ' +
            '<button class="dialog-button-ok" type="button">Cancel</button></form>'
        CreateDialog(Content,'Edit subscription',DialogID,'');
        var form= $('#'+DialogID+' form');
        $("#"+DialogID+" form  .save").on("click",function(){
            //e.preventDefault();
                $('#'+DialogID+' form input[name="FeedTask"]').val($(this).val());
                $('#'+DialogID+' form').submit();

        });
        $("#"+DialogID+" form  .delete").on("click",function(){
            //e.preventDefault();
            //SelectFavorites(ReturnCategoryIDs);
            $('#'+DialogID+' form input[name="FeedTask"]').val($(this).val());
            $('#'+DialogID+' form').submit();
        });
        form.off('submit').on("submit",function(e){
            $.ajax({
                url:form.attr('action'),
                data:form.serialize(),
                type:form.attr('method'),
                dataType: "json",
                beforeSend:function(){
                    BeginProcess();
                },
                error: function (xhr, status, error) {
                    console.log(xhr.responseText);
                },
                success:function(res){

                    RemoveDialog(DialogID);
                    EndProcess();
                    //alert(res.Message);
                    CreateDialog(res.Message,undefined,'reload-page',undefined,ReloadPage);
                }
            });

            return false;
        });
        return false;
    });

    $('.favorite-link').click(function() {
        var PostID = $(this).getPostID();
        var PostCategoryIDs = $(this).attr('href').split(', ');
        $(this).append('<form class="display-none" action="' + AdminAjaxURL + '" method="post" class="categorize-form" id="categorize-form"><input type="hidden" name="action" value="insert_feed"/><input type="hidden" name="category-ids" value=""/><input type="hidden"  name="post-id" value="'+PostID+'"/></form>');
        SelectFavorites(Categorize,PostCategoryIDs,'checked');
        function Categorize(CategoryIDs){
            //alert(CategoryIDs);
            $('#categorize-form input[name="category-ids"]').val(CategoryIDs);
            $('#categorize-form').submit();

        }
        //https://stackoverflow.com/questions/21307137/using-jquery-to-get-data-attribute-values-swith-each
        //alert(PostCategoryIDs[0]);
        $('#categorize-form').off('submit').on('submit',function(){//because 'submit' was registered  in $(".catergorize-link").click();
            var filter=$('#categorize-form');
            $.ajax({
                url:filter.attr('action'),
                data:filter.serialize(), // form data
                type:filter.attr('method'), // POST
                dataType: "json",
                beforeSend:function(){
                    BeginProcess();
                },
                //error: function(ts) { MyAjaxErrorFunction(); },
                success:function(res){
                    EndProcess();
                    CreateDialog(res.Message,undefined,'CategorizeMessage',undefined,ReloadPage);
                }
            });
            filter.remove();
            return  false;
        });
        return false;
    });
});



