
jQuery(document).ready(function($) {
    $(".no-blog").click(function(){
        var  link=$(this).attr("href");
        $('<div/>',{html:"You haven't add a blog site to your account yet!"}).dialog(
            {
                title:"Message",
                buttons:[
                    {
                    html: 'Get one',
                    click: function () {
                        window.location = link;
                    },
                    },
                    {
                        html:"Cancel",
                        click:function(){
                            $(this).remove();
                        }
                    }
                ]
            }
        );

        return false;

    });
});
