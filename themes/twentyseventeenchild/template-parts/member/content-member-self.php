<?php
/**
 * Template part for displaying page content in members.php
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package WordPress
 * @subpackage Twenty_Seventeen
 * @since Twenty Seventeen 1.0
 * @version 1.0
 */

?>
<style>
    .header-member{display:flex;align-items:center;}
    .header-member figure{flex-grow: 0}
    .header-member .tags{flex-grow: 1;border-bottom:lightgrey 1px solid;}
    .header-member a{display:inline-block;padding:1em;web-kit-box-shadow:none;box-shadow: none;}
    .header-member a.current{
        color: #000;
        -webkit-box-shadow: inset 0 0 0 rgba(0, 0, 0, 0), 0 3px 0 rgba(0, 0, 0, 1);
        box-shadow: inset 0 0 0 rgba(0, 0, 0, 0), 0 3px 0 rgba(0, 0, 0, 1);
    }

    .content:not(.current){display:none}
    #profile p>span{font-weight:800;}

</style>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <header class="entry-header">
        <?php the_title( '<h1 class="entry-title">@', '</h1>' ); ?>
        <?php //twentyseventeen_edit_link( get_the_ID() ); ?>
    </header><!-- .entry-header -->
    <div class="entry-content">

        <div class="header-member">   <?php

            $member_id=get_post()->post_author;//the author id, not object
            $member=get_userdata($member_id);
            $member_name=$member->display_name;
            $member_login_name=$member->user_login;
            $member_email=$member->user_email;
            $primary_blog=get_active_blog_for_user($member_id);
            $blog_name=$primary_blog->blogname;
            $blog_url=$primary_blog->siteurl;
            ?>
            <figure class="vcard" style="display: inline-block;text-align: center"><?php echo "<a href='$blog_url'>".get_avatar($member_id,128)."</a>";?><label  for="avatar_user" class="hidden">Replace</label><figcaption style="text-align: center;"></figcaption><div class="reputation"></div></figure>
            <div  class="tags">
                <a id="about" href="#" class="current">About</a>
                <a id="profile" href="#">Site</a>
            </div>

        </div>

        <div id="about-content" class="content current"><?php the_content();?></div>
        <div  id="profile-content" class="content">
            <form id="settings-form"  action="<?php echo admin_url('admin-ajax.php')?>" method="post">
                <input  type="hidden" name="action" value="update_settings"/>
                <input type="hidden" name="user-id" value="<?php echo $member_id;?>"/>
            <ul>
                <li id="blog"><p><span>Blog name: </span><input type="text"  name="blog-name" value="<?php echo $blog_name;?>"/></p></li>
                <li id="display-name"><p><span>Nickname: </span><input type="text" name="display-name" value="<?php echo $member_name;?>"/></p></li>
                <li><p><span>Password: </span><input type="password" name="password"  autocomplete="new-password"/></p></li>
                <li><p><span>Email: </span><input type="text" name="email" value="<?php echo $member_email ;?>"/></p></li>
                <li><p><span>Email notifications: </span>
                        <label class="switch">
                            <input  name="notificaton-preference" type="checkbox" <?php  if(get_user_meta($user_id,'notification_preference',true)){echo "checked";}?>>
                            <span class="slider round"></span>
                        </label>
                      </p></li>
                <li><p><span></span><button type="submit" name="save-settings" value="save-settings">Save</button><button type="button" name="delete-blog" value="delete-blog">Delete Account</button></p></li>

            </ul>
            </form>
        </div>
        <div id="messages-content" class="content">
            <ul>

            </ul>
        </div>
    </div><!-- .entry-content -->
</article><!-- #post-<?php the_ID(); ?> -->

<script>
    jQuery(document).ready(function($) {
        var form=$('#settings-form');
       form.submit(function(){

           $.ajax({
               url:form.attr('action'),
               data:form.serialize(),
               type:form.attr('method'), // POST
               dataType: "json",
               beforeSend:function(){
                   $('body').beginProcess();
               },
               error: function(xhr, status, error) {
                   console.log(xhr.responseText);
               },
               success:function(res){
                    $('body').endProcess();
                    $.dialog({content:res.message,bottons:{OK:false}});

               }
           });
           return false;

       });
    });
</script>

<script>
    jQuery(document).ready(function($){
        $('#about').click();
        $('.header-member .tags a').click(function(){
            var ID=$(this).attr('id');
            $('.content,.tags a').removeClass('current');
            $("#"+ID+"-content").addClass('current');
            $(this).addClass('current');
            return false;
        });
    });
</script>

