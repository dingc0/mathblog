
/*manage categories*/
jQuery(document).ready(function($) {
    var IDClass='.categories.current-blog';
    //$(IDClass+' .manage').click(function() {
    $(IDClass + ' .toggle').toggle();
    $(IDClass+ ' ul li').append("<a class='edit' href='#' title='edit'>"+MakeIcon('#icon-edit')+"</a>");
    $(IDClass+ ' ul').prepend("<li> <a class='new action'>"+MakeIcon('#icon-plus')+" New Category</a></li>");
    //return false;
    //});
    var dialogID='manage-categories';
    var dialogContent='<form  action="'+AdminAjaxURL+'" method="post">\n' +
        '                        <input  name="name" type="text"  placeholder=\'Enter your category here\' />\n' +
        '                        <input type="hidden" name="action" value="manage_categories"/>\n' +
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
                $(IDClass+ ' ul').html(res.categoryList);
                $(IDClass+ ' ul li').append("<a class='edit' href='#' title='edit'>"+MakeIcon('#icon-edit')+"</a>");
                $(IDClass+ ' ul').prepend("<li> <a class='new action'>"+MakeIcon('#icon-plus')+" New Category</a></li>");
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


/*categorize posts*/
jQuery(document).ready(function($) {
    $('.categorize-link').click(function() {
        var PostID = $(this).closest('.entry-actions').data('post-id');
        var PostCategoryIDs = $(this).attr('href').split(', ');
        $(this).append('<form class="display-none" action="' + AdminAjaxURL + '" method="post" class="categorize-form" id="categorize-form"><input type="hidden" name="action" value="categorize"/><input type="hidden" name="category-ids" value=""/><input type="hidden"  name="post-id" value="'+PostID+'"/></form>');
        SelectCategories(Categorize,PostCategoryIDs,'checked');
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

function SelectCategories(Callback,OriginalCategoryIDs,Multichoice){
    OriginalCategoryIDs=IEDefaultParameter(OriginalCategoryIDs,['']);
    Multichoice=IEDefaultParameter(Multichoice,['']);
    if (Multichoice=="checked"||Multichoice==true){
        Multichoice="checked";
    }else{
        Multichoice="";
    }
    var DialogContent = '<div class="categories"><ul>' + jQuery('.categories  ul').html() + '</ul></div>';
    var Title= '<div style="display:flex;"><div class="float-left overflow-hidden" style="margin-right:1em; white-space:nowrap;">SELECT A CATEGORY </div><div style="margin-left:auto;"><label style="display:inline-block;white-space: nowrap;"><input style="  vertical-align: middle;" type="checkbox" name="multi-choice" '+ Multichoice+'/><span style="vertical-align: :middle;">multiple</span></label></div></div>';
    var DialogID="category-dialog";
    var CategorySelector = '.dialog .categories li ';
    CreateDialog(DialogContent,Title, DialogID, '<div style=""><button class="display-none done-category click-me">Done</button>       <button class="cancel-category">Cancel</button></div>');
    jQuery('.dialog .new').closest('li').remove();jQuery('.dialog .edit').remove();
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
