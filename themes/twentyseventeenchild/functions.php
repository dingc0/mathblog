<?php 
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );
function my_theme_enqueue_styles() {
    $parenthandle = 'parent-style'; // This is 'twentyfifteen-style' for the Twenty Fifteen theme.
    $theme = wp_get_theme();
    wp_enqueue_style( $parenthandle, get_template_directory_uri() . '/style.css', 
        array(),  // if the parent theme code has a dependency, copy it to here
        $theme->parent()->get('Version')
    );
    wp_enqueue_style( 'child-style', get_stylesheet_uri(),
        array( $parenthandle ),
        $theme->get('Version') // this only works if you have Version in the style header
    );
}

add_action( 'wp_enqueue_scripts', 'sign_scripts' );
function sign_scripts(){
    $version=wp_get_theme()->get('Version');
    $library_url=get_stylesheet_directory_uri() . '/library/';
    wp_register_script('sign',$library_url . 'sign/sign.js',array(),$version,true);
    wp_enqueue_script('my_functions');
    if($GLOBALS['pagenow'] == 'wp-signup.php'||$GLOBALS['pagenow'] == 'wp-activate.php'){
        wp_enqueue_script('sign');
        //blog_register_form();
    }
}

add_filter( 'wp_nav_menu_items', 'your_custom_menu_item', 10, 2 );

function your_custom_menu_item ( $items, $args ) {

    if ($args->menu_id == 'top-menu') {
        $loginout=my_loginout(false);
        $items .= "<li class='loginout'>$loginout</li>";
    }
    return $items;
}

function initialize_new_blog( $blog_id,$user_id ) {
    //global $switched;

    switch_to_blog($blog_id);
    switch_theme('twentyfifteenchild');
    //update option
	update_option('time_format','H:i');
	//update_option('date_format','Y-m-d');
    update_option( 'permalink_structure','/%postname%/');
    update_option( 'comment_registration', 1 );
    update_option( 'comment_moderation', 0 );
    update_option('comments_notify',0);
    update_option('default_pingback_flag',0);
    update_option('moderation_notify',0);
    update_option( 'show_comments_cookies_opt_in',1);
    update_option( 'comment_whitelist',0);
    update_option('blogdescription','by '.get_userdata($user_id)->display_name);
    get_userdata($user_id)->set_role('editor');

    $site_url=get_site_url();
    $cdn_url=preg_replace('/(functors\.net)/','cdn\.$1',$site_url);
    update_option('ossdl_off_cdn_url',$cdn_url);//wp super cache option
    rewrite_flush();
    restore_current_blog();
    //insert_member_page($user_id);
    //update_user_meta($user_id,'notification_preference',ture);
}
add_action( 'wpmu_new_blog', 'initialize_new_blog',10,2);

function add_blog($user_id,$password,$user_meta){
    $user=get_userdata($user_id);
    $user_name=$user->user_login;
    $user_display_name=$user->display_name;
    if(!current_user_has_blogs()){
        $data=array(
                'path'=>$user_name,
            'user_id'=>$user_id,
            'title'=>$user_display_name.'\'s blog',
        );
        wp_insert_site($data);
    }
}
add_action( 'wpmu_activate_user','add_blog',10,3);

/*
 * blog settings
 */
function brain1981_buddypress_tab() {
    global $bp;
    bp_core_new_subnav_item( array(
        'name' => __( 'Blog', 'buddypress_login' ),
        'slug' => 'primary-blog',
        'parent_url' => $bp->displayed_user->domain . $bp->bp_nav['settings']['slug'] . '/',
        'parent_slug' => $bp->bp_nav['settings']['slug'],
        'position' => 25,
        'screen_function' => 'brain1981_budypress_recent_posts',
        'show_for_displayed_user' => true,
        'item_css_id' => 'brain1981_budypress_recent_posts'
    ) );
}
add_action( 'bp_setup_nav', 'brain1981_buddypress_tab', 1000 );

function brain1981_budypress_recent_posts () {
    add_action( 'bp_template_title', 'brain1981_buddypress_recent_posts_title' );
    add_action( 'bp_template_content', 'brain1981_buddypress_recent_posts_content' );
    bp_core_load_template(  get_template_directory_uri().'/buddypress/members/single/settings.php'  );

}
function brain1981_buddypress_recent_posts_title() {
    _e( 'Blog Settings', 'buddypress_login' );
}
function brain1981_buddypress_recent_posts_content() {
    handle_setting_blog();
    $member_id = bp_displayed_user_id();
    $member_blog_id=get_user_blog_id(bp_displayed_user_id());
    //echo  $member_id;
    if ($member_blog_id) {
        $member = get_userdata($member_id);
        $member_name = $member->display_name;
        $member_login_name = $member->user_login;
        $member_email = $member->user_email;
        $primary_blog=get_active_blog_for_user($member_id);
        $blog_name = $primary_blog->blogname;
        $blog_url = $primary_blog->siteurl;

        switch_to_blog($member_blog_id);
        $blog_description = get_bloginfo('description');
        restore_current_blog();
        ?>
        <div id="profile-content" class="content">
            <form id="settings-form" action="<?php //echo admin_url('admin-ajax.php')
            ?>" method="post">
                <input type="hidden" name="action" value="update_settings"/>
                <input type="hidden" name="user-id" value="<?php echo $member_id; ?>"/>
                <p><label>Blog Name<input type="text" name="blog-name" value="<?php echo $blog_name; ?>"/></label></p>
                <p><label>Blog Description<input type="text" name="blog-description" value="<?php echo $blog_description; ?>"/></label></p>
                <!--<ul>
                    <li><p><span>Blog Name: </span><input type="text" name="blog-name"
                                                          value="<?php echo $blog_name; ?>"/></p></li>
                    <li><p><span>Blog Description: </span><input type="text" name="blog-description"
                                                                 value="<?php echo $blog_description; ?>"/></p></li>
                    <li id="display-name"><p><span>Nickname: </span><input type="text" name="display-name" value="<?php echo $member_name; ?>"/></p></li>
                <li><p><span>Password: </span><input type="password" name="password"  autocomplete="new-password"/></p></li>
                <li><p><span>Email: </span><input type="text" name="email" value="<?php echo $member_email; ?>"/></p></li>
                <li><p><span>Email notifications: </span>
                        <label class="switch">
                            <input  name="notificaton-preference" type="checkbox" <?php if (get_user_meta($user_id, 'notification_preference', true)) {
                    echo "checked";
                } ?>>
                            <span class="slider round"></span>
                        </label>
                    </p></li>

                </ul>-->

                <input type="submit" name="save-settings" value="Save">
                <!--<button type="button" name="delete-blog" value="delete-blog">Delete Account</button>-->
            </form>
        </div>
        <?php
    }else{
        echo "<p>You don't have a blog yet.</p><a href='".wp_registration_url()."'<button>Get One</button></a>";
    }
}

/*add_action('init',function(){insert_member_page(get_user_by('login','ceshi')->ID);});

function insert_member_page($user_id){
    $args=array('show_ui'=>true,
        //'rewrite'=>array('slug'=>'/'),
        //'has_archive'=>true,
        'public'=>true,
        'publicly_queryable'=>true,
    );
    register_post_type("member",$args);
    //register_taxonomy_for_object_type('category','reading');
    $username=get_userdata($user_id)->user_login;
    $title     ="$username";
    $content   = 'Apparently, this user prefers to keep an air of mystery about them.';
    $post_id= 0;

    $check=get_posts(array('post_name'=>$username,'post_type'=>'page','fields'=>'ids'));
    if($check){
        $post_id=$check[0];
    }
    //wp_reset_postdata();
    $member_page = array(
        'ID'=>$post_id,
        'post_type'     => 'page',
        'post_title'    => $title,
        'post_content'  => $content,
        'post_status'   => 'publish',
        'post_author'   => $user_id,
        'post_name'     => $username,
    );

    $member_page_id = wp_insert_post($member_page);
    return $member_page_id;
}

add_action('wp_ajax_update_settings', 'update_settings');
add_action('wp_ajax_nopriv_update_settings', 'update_settings');
function update_settings(){
    $messages=array(
        'email'=>"Please check the confirmation eamil at your new address to confirm the change.",
        'password'=>'',

    );
    $user_id=$_POST['user-id'];
    $blog_name=$_POST['blog-name'];
    $display_name=$_POST['display-name'];
    $password=$_POST['password'];
    $email=$_POST['email'];
    $notification_preference=$_POST['notification-preference'];
    $user_blog_id=get_user_blog_id($user_id);
    if($user_blog_id && current_user_can('edit_posts')) {
        switch_to_blog($user_blog_id);
        if(isset($blog_name)&& (get_option('blogname')!=$blog_name)) {
            update_option('blogname', $blog_name);
        }
        restore_current_blog();
        if(isset($display_name)&& (get_userdata($user_id)->display_name!=$display_name)) {
            $result = wp_update_user(array('ID' => $user_id,
                'display_name' => $display_name,
            ));
        }

        if (isset( $email)) {
            // check if user is really updating the value
            if(is_smail($email)) {
                if (get_userdata($user_id)->email != $email) {
                    // check if email is free to use
                    if (email_exists($email)) {
                        $message['email'] = 'The email already exists!';
                    } else {
                       update_user_meta($user_id,'pendding_email',true);
                    }
                }
            }else{
                $messages['email']='Please enter a valid email address.';
            }
        }

        update_user_meta($user_id,'notification_preference',$notification_preference);
    }
    $return = array(
        'message'	=>$message. $user_id.$blog_name.$user_blog_id,
    );
    echo json_encode($return);
    wp_die();
}

add_action('wp_ajax_delete_blog', 'delete_blog');
add_action('wp_ajax_nopriv_delete_blog', 'delete_blog');
function delete_blog(){
$message="Unable to delete the blog!";
$user_id=$_POST['user-id'];
$site_id=false;
        $primary_blog=get_active_blog_for_user($user_id);
        switch_to_blog($primary_blog->blog_id);
        if(current_user_can("edit_posts") && user_can($user_id,'edit_posts')) {
            $site_id = $primary_blog->site_id;
        }
        restore_current_blog();
        if($site_id){
            if ( ! function_exists( 'wpmu_delete_blog' ) ) {
                require_once ABSPATH . '/wp-admin/includes/ms.php';
            }
            $drop = false;
            wpmu_delete_blog( $site_id, $drop );

            if ( $drop ) {
                $message= "Site deleted successfully";
            } else {
                $status = get_blog_status( $site_id, 'deleted' );
                if ( $status ) {
                    $message="Site deleted successfully";
                }
            }

        }

    $return = array(
            'message'	=> $message,
    );
    echo json_encode($return);
    die();
}
*/
function get_user_blog_id($user_id){
    $has_blogs=false;
    //if(is_user_logged_in($user_id)) {
        $primary_blog_id = get_active_blog_for_user($user_id)->blog_id;

        if($primary_blog_id && $primary_blog_id!=get_main_site_id() ) {
            switch_to_blog($primary_blog_id);

            if (user_can($user_id,"edit_posts")) {
                $has_blogs=$primary_blog_id;
            }
            restore_current_blog();
        }
    //}
    return $has_blogs;
}

function handle_setting_blog(){
    $user_id = $_POST['user-id'];
    //echo $user_id;
    $blog_name = $_POST['blog-name'];
    $blog_description = $_POST['blog-description'];

    $display_name = $_POST['display-name'];
    $password = $_POST['password'];
    $email = $_POST['email'];
    $notification_preference = $_POST['notification-preference'];
    $user_blog_id = get_user_blog_id($user_id);
    if ($user_blog_id ) {

        switch_to_blog($user_blog_id);
        if(current_user_can('edit_posts')) {
            if (isset($blog_name) && (get_option('blogname') != $blog_name)) {
                update_option('blogname', $blog_name);
            }
            if (isset($blog_description) && (get_option('blogdescription') != $blog_description)) {
                update_option('blogdescription', $blog_description);
            }
        }
        restore_current_blog();
    }
}
