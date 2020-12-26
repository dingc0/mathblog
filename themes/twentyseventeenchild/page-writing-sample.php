<?php
/**
 * The template for writing sample page
 */

$post_id=$_GET['id'];
get_header(); ?>
<div class="wrap">
<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
        <?php
        // Start the loop.
        while ( have_posts() ) :
            the_post();
        endwhile;
        ?>
        <header class="page-header">
            <h1 class="page-title">Writing Sample</h1>
        </header><!-- .page-header -->
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <div class="entry-content">
                <p>Here is a writing sample, click the icon <i class="fa fa-eye"></i> in the editor toolbar for quick preview.</p>
                <form action="<?php echo admin_url('admin-ajax.php')?>" method="post" id="edit-form">
                    <p class="content-section"><label></label><textarea name="content" placeholder='Enter your content here' ></textarea></p>
                    <input type="hidden"  name="citations" value=""/>
                </form>
            </div><!-- .entry-content -->
        </article><!-- #post-<?php the_ID(); ?> -->
    </main><!-- .site-main -->
</div><!-- .content-area -->
</div>

<?php get_footer(); ?>
<script>
    jQuery(document).ready(function($) {
        var simplemde = new NewMDE();
        var writingSample=multilineText(sampleText);
        var citations=multilineText(sampleCitations);
        simplemde.value(writingSample);
        simplemde.citations(citations);
        function multilineText(fn){
                return fn.toString().split('\n').slice(1,-1).join('\n') + '\n';
        }
        function sampleCitations(){/*
@book{mac2013categories,
  title={Categories for the working mathematician},
  author={Mac Lane, Saunders},
  volume={5},
  year={2013},
  publisher={Springer Science \& Business Media}
}
        */}
        function sampleText(){/*
## This is a section

This is an inline equation: $x^2=-1$.

This is a centered equation: $$a^2+b^2=c^2.$$

This is a numbered equation: $$\begin{equation}
\lim_{n\to\infty}\frac{1}{n}=0.
\label{eq:sample}
\end{equation}$$

This is an aligned equation: $$\begin{align}
    \int_{0}^{1}2x\,dx
    &=x^2\Big|_{x=0}^1\label{eq:sample2}\\
    &=1
\end{align}$$

This is how to cite the above equation:
$\eqref{eq:sample}$ &
$\eqref{eq:sample2}$.

::: {#thm:sample .theorem}
**Theorem 1**. *This is a theorem environment.*
:::

::: {#corollary .corollary}
**Corollary 2**. *This is a theorem-like environments.*
:::

This is how to cite the above theorem:
[Theorem 1](#thm:sample) &
[Corollary 2](#corollary).

::: {.proof}
*Proof.* Here goes the proof. ◻
:::

This is how to cite references: [@mac2013categories].

## References

*/}
    });
</script>