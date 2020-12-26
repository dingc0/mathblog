(function( $ ){
    $(".widecolumn").addClass('wrap').css('padding-top','4em');
    $("#signupuser").parent().children().hide();
    $("#privacy").append("<p class='show'></p>");
    $("label[for='blogname']").html("Site Address");
    $("label[for='user_email']").css('margin-top','2em');
    $("#site-language, label[for='site-language'],#privacy").hide();
    //$("#blogname, .prefix_address, p:not(.submit,.show),label[for='blogname']").hide();

    //$('.wp-signup-container').html('s');
    var noBlog=$('#top-menu li a.no-blog').length;
    var content = $('.wp-signup-container').html();
    if(noBlog) {
        content = content.replace(/(Welcome back.*?By filling out the form below, you can ).*?but write responsibly./, '$1add a blog site to your account.');
        content = content.replace(/<em>another<\/em>/, 'a');
        content = content.replace(/Sites you are already a member of[\s\S]*?(If you’re not going to use a great site domain, leave it for a new user. Now have at it!)/, '');
    }else{
        var primarySiteURL=$('#top-menu .loginout').find('a:first-child').attr('href');
        var string='You already have a blog site:' +
            '<ul><li>'+ primarySiteURL +'</li></ul>';
        content = content.replace(/Sites you are already a member of[\s\S]*?(If you’re not going to use a great site domain, leave it for a new user. Now have at it!)/, string+'$1');
    }
    $('.wp-signup-container').html(content);
})( jQuery );