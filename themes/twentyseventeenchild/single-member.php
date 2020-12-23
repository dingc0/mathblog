<?php
/*
Template Name: Full-width layout
Template Post Type: member
*/


get_header(); ?>

<div class="wrap">
	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

			<?php
			while ( have_posts() ) :
				the_post();
                if( get_post()->post_author==get_current_user_id()||is_super_admin()){$format='member-self';}else{$format='member';}
				get_template_part( 'template-parts/member/content', $format );
			endwhile; // End the loop.
			?>

		</main><!-- #main -->
	</div><!-- #primary -->
</div><!-- .wrap -->

<?php
get_footer();
