jQuery(document).ready(function($) {
        var CurrentUserAdminAjaxURL=$('#current-user-admin-ajax-url').attr("href");
        var Feeds=$('article.post .subscribe .subscribe-link');
        Feeds.each(function(){
            var PostID=$(this).getPostID();
            var FeedURL=$(this).attr('href');
            //alert(PostID);
            $.ajax({
                url: CurrentUserAdminAjaxURL,
                data: {"action": "has_subscribed","FeedURL":FeedURL},
                type: "POST",
                //contentType: "application/json; charset=utf-8",
                dataType: "json",

                beforeSend: function () {
                    //BeginProcess("processing",'Synchronizing...');
                },
                error: function(xhr, status, error) {
                    console.log(xhr.responseText);
                },
                success: function (res) {
                    //If the res.Content=null?
                    //alert(res.Content);
                    //EndProcess("processing");
                    if (res.HasSubscribed) {
//                        alert(res.HasSubscribed);
                        //$("#post-" + PostID +' .subscribe a').attr('href',res.FeedURL);
                        //if(res.Subscribed){
                            $("#post-" + PostID +' .subscribe').toggle();
                        //}
                    }
                }
            });

        });


    $(".subscribe-link").click(function() {
        var PostID=$(this).getPostID();
        //alert(PostID);
        var FeedURL=$(this).attr('href');
        var CurrentUserAdminAjaxURL=$('#current-user-admin-ajax-url').attr("href");
        //alert(CurrentUserAdminAjaxURL);
        SelectFavorites(Subscribe);
        function Subscribe(CategoryIDs) {
            //alert(CategoryIDs);
            $.ajax({
                url: CurrentUserAdminAjaxURL,
                data:  {"feed-url":FeedURL,"action":"insert_feed","category-ids":CategoryIDs,"post-id":0},
                type: "POST",
                dataType: "json",
                beforeSend: function () {
                BeginProcess();
                //alert(CategoryIDs);
            },
            error: function () {
                MyAjaxErrorFunction();
            },
            success: function (res) {
                EndProcess();
                //RemoveDialog(DialogID);
                CreateDialog(res.Message);
                if(res.Success) {
                    $('#post-' + PostID + ' .subscribe').toggle();
                }
            }
        });
        }

        return false;
    });
    $(".subscribing-link").click(function() {
if(!confirm("You will no longer follow this post! Are you sure?")){
    return false;
}
var PostID=$(this).getPostID();
        var FeedURL=$(this).attr('href');
        var CurrentUserAdminAjaxURL=$('#current-user-admin-ajax-url').attr("href");

            $.ajax({
                url: CurrentUserAdminAjaxURL,
                data:  {"feed-url":FeedURL,"action":"insert_feed","FeedTask":"delete"},
                type: "POST",
                dataType: "json",
                beforeSend: function () {
                    BeginProcess();
                },
                error: function(xhr, status, error) {
                    console.log(xhr.responseText);
                },
                success: function (res) {
                    EndProcess();
                    //RemoveDialog(DialogID);
                    CreateDialog(res.Message);
                    if(res.Success) {
                        $('#post-' + PostID + ' .subscribe').toggle();
                    }
                }
            });

        return false;
    });

});


function SelectFavorites(Callback,OriginalCategoryIDs,Multichoice){
    OriginalCategoryIDs=IEDefaultParameter(OriginalCategoryIDs,['']);
    Multichoice=IEDefaultParameter(Multichoice,['']);
    if (Multichoice=="checked"||Multichoice==true){
        Multichoice="checked";
    }else{
        Multichoice="";
    }
    var DialogContent = '<div class="categories"><ul>' + jQuery('.favorites.current-user-blog  ul').html() + '</ul></div>';
    var Title= '<div style="display:flex;"><div class="float-left overflow-hidden" style="margin-right:1em; white-space:nowrap;">SELECT A CATEGORY </div><div style="margin-left:auto;"><label style="display:inline-block;white-space: nowrap;"><input style="  vertical-align: middle;" type="checkbox" name="multi-choice" '+ Multichoice+'/><span style="vertical-align: :middle;">multiple</span></label></div></div>';
    var DialogID="category-dialog";
    var CategorySelector = '.dialog .categories li ';
    CreateDialog(DialogContent,Title, DialogID, '<div style=""><button class="display-none done-category click-me">Done</button>       <button class="cancel-category">Cancel</button></div>');
    for (var i = 0; i < jQuery(CategorySelector).length; i++) {
        //var CategoryID=jQuery(this).parent().attr('class').match(/cat-item-(\S*)/)[1];
        var CategoryID = jQuery(CategorySelector).eq(i).attr('class').match(/cat-item-(\S*)/)[1];
        var CategoryText = jQuery(CategorySelector).eq(i).children('a').html();
        var Checked = "";
        if (OriginalCategoryIDs.indexOf(CategoryID)!=-1) {Checked = "checked";}
        var CategoryText =jQuery(CategorySelector).eq(i).children('a').html();
        jQuery(CategorySelector).eq(i).html('<label class=".width100"><input type="checkbox" class="display-none" data-category-id="' + CategoryID + '" ' + Checked + '/>' + CategoryText + '</label>');// $(x[i]).html()  or $(x).html().eq(i);
    }

    function MultiChoiceToggle(){
        if( jQuery('input[name="multi-choice"]').prop("checked")) {
            jQuery(CategorySelector).find( 'input').show();
            jQuery('.dialog .done-category').show();
        }else
        {
            jQuery(CategorySelector).find( 'input').hide();
            jQuery('.dialog .done-category').hide();
        }
    }
    MultiChoiceToggle();
    jQuery('input[name="multi-choice"]').on('change',function() {
        MultiChoiceToggle();
    });

    jQuery('.cancel-category').on('click', function () {
        RemoveDialog(DialogID);
        //return false;
    });
    var CategoryIDs='';
    jQuery( CategorySelector+' input[type="checkbox"]'+ ','+ CategorySelector+'label').on('click',  function(){//Do not bind click events inside of click events unless the click event creates the element. Use '.one'  or  '.off("click")'  otherwise.
        if(! jQuery('input[name="multi-choice"]').attr("checked")) {
            CategoryIDs=jQuery(this).closest('.cat-item').attr('class').match(/cat-item-(\S*)/)[1];
            RemoveDialog(DialogID);
            Callback(CategoryIDs);

        }
        //return false;
    });
    jQuery('.dialog .done-category').on('click', function () {

        var CategoryIDs = jQuery(CategorySelector + ' input[type="checkbox"]:checked').map(function () {
            return jQuery(this).data("category-id");
        });//https://stackoverflow.com/questions/21307137/using-jquery-to-get-data-attribute-values-with-each
        //alert(CategoryIDs.get())
        CategoryIDs=CategoryIDs.get();
        RemoveDialog(DialogID);
        Callback(CategoryIDs);

    });

}