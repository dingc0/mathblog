
jQuery(document).ready(function($) {

    var Posts=$('article');
    Posts.each(function(){
        var PostID=$(this).attr('id').match(/post-([0-9]*)/)[1];

        //alert(PostID);
        $.ajax({
            url: AdminAjaxURL,
            data: {"action": "insert_feed","FeedTask":'fresh',"PostID":PostID},
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
                $("#post-" + PostID +' .source-link').attr('href',res.Permalink);
                $("#post-" + PostID +' .edit-feed-link').attr('href',res.FeedURL);
                if (res.Success==true) {
                    var Temp = "#post-" + PostID + " .entry-title ";
                    if ($(Temp + "  a").length) {
                        $(Temp + " a").html(res.Title);
                    } else {
                        $(Temp).html(res.Title);
                    }
                    $("#post-" + PostID + " .entry-content").html(DoMarkdownWithoutMathjax(res.Content));
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'post-' + PostID]);

                }else{
                    alert("Error!");
                }
            }
        });

    });

});