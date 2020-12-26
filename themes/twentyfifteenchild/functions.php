<?php 
add_action( 'wp_enqueue_scripts', 'child_theme_enqueue_styles' );
function child_theme_enqueue_styles() {
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

/*
 * scripts
 */
add_action( 'wp_enqueue_scripts', 'child_theme_enqueue_scripts' );
function child_theme_enqueue_scripts(){
    $version=wp_get_theme()->get('Version');
    $library_url=get_stylesheet_directory_uri() . '/library/';
    wp_register_script('notifications',$library_url.'notifications/notifications.js',array('jquery'),$version,true);
    wp_register_script('categorize',$library_url.'categorize/categorize.js',array('jquery','dialog','site-wide'),$version,true);
    wp_register_script('info',$library_url.'info/info.js',array('jquery','dialog','site-wide'),$version,true);
    wp_register_script('print',$library_url.'print/print.js',array('jquery','site-wide'),$version,true);
    wp_register_script('comment-list',$library_url.'comment-list/comment-list.js',array('jquery','site-wide'),$version,true);
    if(is_user_logged_in()){
        wp_enqueue_script('notifications');
    }
    if(current_user_can('publish_posts')){
        wp_enqueue_script('categorize');
    }
    wp_enqueue_script('info');
    wp_enqueue_script('print');
}

/*
 * login url
 */
function sign_in_url_filter($login_url, $redirect, $force_reauth ) {
    switch_to_blog(get_main_site_id());
    $login_url=network_site_url('wp-login.php?redirect_to='.$redirect);
    restore_current_blog();
    return $login_url;
}
add_filter('login_url','sign_in_url_filter',10,3);

/*
 * manage categories
 */

add_filter( 'widget_categories_args', 'force_widget_cat_args' );
function force_widget_cat_args($cat_args) {
    $cat_args['hide_empty'] = 0;
    return $cat_args;
}

add_action('wp_ajax_manage_categories', 'manage_categories');
//add_action('wp_ajax_nopriv_manage_categories', 'manage_categories');
function manage_categories(){
    $name=$_POST['name'];
    $id=$_POST['id'];
    $task=$_POST['task'];
    $success=false;
    $message = "Unable to edit the category! Make sure that it exists  and is not the default category.";
    //Update a category
    if($task=='update') {
        $success = wp_insert_category(array('cat_ID'=>$id,'cat_name'=>$name));//Updates an existing Category or creates a new Category.
        $message = "Unable to update the category! Make sure that it exists  and is not the default category.";
        if ($success) {
            $message = "The category has been updated!";
        }
    }
    //Create a category
    if($task=='new') {
        $success = wp_insert_category(array('cat_ID'=>$id,'cat_name'=>$name));
        $message = "Error! Unable to create the category!";
        if ($success) {
            $message = "The category has been created!";
        }
    }
    //Delete a category
    if($task=='trash') {
        $success = wp_delete_category($id);
        $message = "Unable to delete the category! Make sure that it exists  and is not the default category.";
        if ($success) {
            $message = "The category has been deleted!";
        }
    }

    $category_list=wp_list_categories(array(
            'hide_empty'=> 0,
            'title_li'=>'',
            'hide_title_if_empty'=>true,
            'echo'=>false,
        )
    );

    $return = array(
            'success'	=> $success,
            'categoryList'	=> $category_list,
            'message'	=> $message,
    );
    echo json_encode($return);
    die();
}

//categorize post
function categorize(){
    $post_id=$_POST['post-id'];
    $category_ids_text=$_POST['category-ids'];
    $category_ids= texts_to_array($category_ids_text);
    $reload=false;
    $success=0;$message="Error!";
    if( current_user_can( 'edit_posts' ) ) {
        $success = wp_set_post_categories($post_id, $category_ids);
        if ($success) {
            $new_post_category_list = get_the_category_list(', ', '', $post_id);
            $message = "The post has been categorized to $new_post_category_list!";
        }
    }
    $return = json_encode(array(
            'success'	=> $success,
            'message' => $message,
            'reload'=>$reload,
        )
    );
    echo $return;
    die();
}
add_action('wp_ajax_categorize', 'categorize');
//add_action('wp_ajax_nopriv_categorize', 'categorize');

/*
 * entry actions
 */
function twentyfifteen_entry_meta(){
echo "<div class='entry-meta hidden'>";
    if (is_sticky() && is_home() && !is_paged()) {
        printf('<span class="sticky-post">%s</span>', __('Featured', 'twentyfifteen'));
    }

    $format = get_post_format();
    if (current_theme_supports('post-formats', $format)) {
        printf(
            '<span class="entry-format">%1$s<a href="%2$s">%3$s</a></span>',
            sprintf('<span class="screen-reader-text">%s </span>', _x('Format', 'Used before post format.', 'twentyfifteen')),
            esc_url(get_post_format_link($format)),
            get_post_format_string($format)
        );
    }

    if ('post' == get_post_type()) {

        $categories_list = get_the_category_list(_x(', ', 'Used between list items, there is a space after the comma.', 'twentyfifteen'));

        //if ($categories_list && twentyfifteen_categorized_blog()) {
        if ($categories_list) {
            printf(
                '<span class="cat-links"><i  class="fa fa-folder"></i> <span class="screen-reader-text">%1$s </span><span class="HintSubTitle">%1$s </span>%2$s</span>',
                _x('Category', 'Used before category names.', 'twentyfifteen'),
                $categories_list
            );
        }

        $time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
        $time_icon = 'fa fa-calendar';
        $time_status = _x('Posted on', 'Used before publish date.', 'twentyfifteen');
        if (get_the_time('U') !== get_the_modified_time('U')) {
            $time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
            $time_icon = 'fa fa-calendar';
            $time_status = _x('Update on', 'Used before publish date.', 'twentyfifteen');
        }

        $time_string = sprintf(
            $time_string,
            esc_attr(get_the_date('c')),
            get_the_date(),
            esc_attr(get_the_modified_date('c')),
            get_the_modified_date()
        );

        printf(
            '<span class="posted-on"><i  class="%4$s"></i> <span class="screen-reader-text">%1$s </span><span class="HintSubTitle">%1$s </span><a href="%2$s" rel="bookmark">%3$s</a></span>',
            $time_status,
            esc_url(get_permalink()),
            $time_string,
            $time_icon
        );


        if (is_singular() || is_multi_author()) {
            printf(
                '<span class="byline"><span class="author vcard"><i  class="fa fa-user"></i> <span class="screen-reader-text">%1$s </span><span class="HintSubTitle">%1$s </span><a class="url fn n" href="%2$s">%3$s</a></span></span>',
                _x('Author', 'Used before post author name.', 'twentyfifteen'),
                esc_url(get_author_posts_url(get_the_author_meta('ID'))),
                get_the_author()
            );
        }

        $tags_list = get_the_tag_list('', _x(', ', 'Used between list items, there is a space after the comma.', 'twentyfifteen'));
        if ($tags_list && !is_wp_error($tags_list)) {
            printf(
                '<span class="tags-links"><i  class="fa fa-tags"></i> <span class="screen-reader-text">%1$s </span><span class="HintSubTitle">%1$s </span>%2$s</span>',
                _x('Tags', 'Used before tag names.', 'twentyfifteen'),
                $tags_list
            );
        }
    }

    /*
            if ( is_attachment() && wp_attachment_is_image() ) {
                // Retrieve attachment metadata.
                $metadata = wp_get_attachment_metadata();

                printf(
                    '<span class="full-size-link"><span class="screen-reader-text">%1$s </span><a href="%2$s">%3$s &times; %4$s</a></span>',
                    _x( 'Full size', 'Used before full size attachment link.', 'twentyfifteen' ),
                    esc_url( wp_get_attachment_url() ),
                    $metadata['width'],
                    $metadata['height']
                );
            }
    */
echo "</div>";

    //disscuss share info print latex categorize edit
    if(comments_open()) {
        $comment_link = "#respond";
        if (!is_single()) {
            $comment_link = get_permalink() . $comment_link;
        }
        menu_item('Comment', 'fa fa-comment', 'discuss', $comment_link);
    }
    if(!post_password_required()) {
        menu_item('Share', 'fa fa-envelope', 'share', "mailto:?body=" . get_the_permalink());
    }
    menu_item('Info','fas fa-info','info');
    if(!post_password_required()) {
        if(is_single()) {
            menu_item('Print', 'fas fa-print', 'print');
        }
    }
    if(current_user_can("edit_posts")) {
        menu_item('Latex', 'fas fa-download', 'download');
        $post_category_ids = wp_get_post_categories(get_the_id(), array($field => 'ids'));
        $post_category_ids_text = implode(', ', $post_category_ids);
        menu_item('Categorize', 'fa fa-folder-open', 'categorize', $post_category_ids_text);
        menu_item('Edit', 'fa fa-edit', 'edit', get_insert_post_link(get_the_ID()));
    }
}


/*
 * site info
 */
function credit(){
    $separator='<span role="separator" aria-hidden="true"></span>';
    $feedback_url="https://functors.net/feedback";
    $privacy_url="https://functors.net/privacy";
    //echo"<span>";
    echo "<a href='$feedback_url'>Feedback</a>$separator";
    echo "<a href='$privacy_url'>Privacy</a>";
    $args=array(
        'echo'=>false,
        'style'=>'commas',
    );
    $author_list=wp_list_authors($args);
    if(!empty($author_list)){
        //echo "Written by $author_list".'<span role="separator" aria-hidden="true"></span>';
    }
  //  echo "</span>";
/*    $args=array(
        'before_widget'=>'<span class="widget_search">',
        'after_widget'=>'</span>',
    );
the_widget( 'WP_Widget_Search',null,$args);
*/
}
add_action('twentyfifteen_credits','credit');
