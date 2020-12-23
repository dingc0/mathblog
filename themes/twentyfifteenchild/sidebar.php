<?php
/**
 * The sidebar containing the main widget area
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */

if ( has_nav_menu( 'primary' ) || has_nav_menu( 'social' ) || is_active_sidebar( 'sidebar-1' ) ) : ?>
	<div id="secondary" class="secondary">
			<aside class="widget">
				<?php
                $args  = array(
                    'role' => "Editor",
                    'orderby' => 'display_name'
                );
                $my_user_query = new WP_User_Query($args);
                $authors = $my_user_query->get_results();
                if (!empty($authors)) {
                    //echo '<ul style="list-style: none;">';
                    foreach ($authors as $author)
                    {
                        $author_id=$author->ID;
                        $author_info = get_userdata($author->ID);
                        $author_name=$author_info->display_name;
                        $last_activity = bp_get_user_last_activity($author->ID);//timestamp
                        //var_dump($last_activity);
                        //$last_activity_date=wp_date('H:i',$last_activity);
                        $last_activity_date=$last_activity;
                        //var_dump($last_activity_date);
                        $profile_url=bp_core_get_user_domain($author->ID);
                        $avatar=get_avatar($author->ID);
                        //echo "<figure class='vcard'><a href='$profile_url' style='display:inline-block'><div style='text-align:center'>".get_avatar($author->ID)."</div><ul><li style='text-align: center;margin-top:1em;font-weight:800;'>$author_name</li><li ></li></ul></a></figure>";
                        echo "<div class=\"comment-author vcard\">$avatar					<b class=\"fn\"><a href=\"$profile_url\" rel=\"external nofollow ugc\" class=\"url\">$author_name</a></b>					</div>".
                            "<div class=\"comment-metadata\">
						<a href=\"#\">
							<time datetime=\"$last_activity\">
								 		$last_activity_date			</time>
						</a>				</div>";
                    }
                    //echo '</ul>';
                }
                ?>
			</aside>

			<aside class="widget">
				<?php
                 if(is_user_logged_in()){
                     $current_user=wp_get_current_user();
                     $current_user_id=$current_user->ID;
                     $current_user_name=$current_user->display_name;
                     echo "<p id='notification'><span class='greeting'>Howdy, $current_user_name!</span> <span class='overall'></span></p>";
                 }
                my_loginout();
				?>
			</aside>
		<?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
			<div id="widget-area" class="widget-area" role="complementary">
				<?php
                $args=array(
						'before_widget'=>'<div class="widget %s categories">',
                        'before_title'=>'<h2 class="widget-title">',
                        'after_title'=>'</h2>',
                );
                the_widget("WP_Widget_Categories",array(),$args);
                //dynamic_sidebar( 'sidebar-1' );
                ?>
			</div><!-- .widget-area -->
		<?php endif; ?>

	</div><!-- .secondary -->

<?php endif; ?>
