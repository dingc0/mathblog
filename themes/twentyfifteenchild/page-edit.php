<?php
/**
 * The template for displaying edit page
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */

$post_id=$_GET['id'];
get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">
            <?php
            // Start the loop.
            while ( have_posts() ) :
                the_post();
            endwhile;
            ?>
            <header class="page-header">
                <h1 class="page-title">Edit</h1>
            </header><!-- .page-header -->
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <div class="entry-content">
                <form action="<?php echo admin_url('admin-ajax.php')?>" method="post" id="edit-form">
                    <p><label>Title</label><input name="title" type="text" placeholder='Enter your title here'  value="" /></p>
                    <p class="content-section"><label>Content</label><textarea name="content" placeholder='Enter your content here' ></textarea></p>
                    <p><label>Key Words</label><input name="tags" type="text" placeholder='Enter key words here, separated with commas'  value="" /></p>

                    <p class="actions-section" style="display:flex;justify-content: space-between">
                        <a href="#" class="post-settings" style="border-bottom: none"><i class="fa fa-cog"></i>Post Setting</a>
                        <span>
                            <button  type="button" value="publish">Publish</button>
                            <button  type="button" value="trash" style="display:none">Delete</button>
                        </span>
                    </p>

                    <div id="settings-dialog" style="display:none;">
                        <p>Post Visibility</p>
                        <div>
                            <label><input type="radio" name="visibility" value="publish">Public</label>
                            <p>Visible to everyone.</p>
                        </div>
                        <div><label><input type="radio" name="visibility" value="private">Private</label>
                            <p>Only visible to youself.</p>
                        </div>
                        <div><label><input type="radio" name="visibility" value="password">Password Protected</label>
                            <p>Protected with a password you choose. Only those with the password can view this post.</p>
                            <input type="password" name="password" value="" autocomplete="new-password" style="display:none"/>

                        </div>
                    </div>

                <input type="hidden" name="action" value="ajax_edit_post"/>
                <input type="hidden" name="task" value=""/>
                <input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
                <input type="hidden" name="category-ids" value=""/>
                    <input type="hidden"  name="citations" value=""/>
                </form>
                </div><!-- .entry-content -->
            </article><!-- #post-<?php the_ID(); ?> -->
		</main><!-- .site-main -->
	</div><!-- .content-area -->

<?php get_footer(); ?>
<script>
    jQuery(document).ready(function($) {
        $('#settings-dialog>div>p').css('font-size','smaller').css('color','grey');
        $('.content-section').css('position','relative');
        var loading=$('<div><i class="fa fa-spinner fa-spin"></i></div>').appendTo('.content-section');
        loading.progressbar({value:false});

        /*
        * loading post
        */
        var simplemde = new NewMDE();
            $.ajax({
                url:ajaxurl,
                data:{id:$('input[name="id"]').val(),action:'ajax_get_post'},
                type:'post',
                dataType: "json",
                beforeSend: function () {
                },
                error: function(xhr, status, error) {
                    console.log(xhr.responseText);
                },
                success: function (res) {
                    //console.log(res.post_category_ids);
                    updateEditForm(res);
                    loading.hide();
                }
            });

        function updateEditForm(res) {
            //console.log(res.post);
            if(res.post  && res.post.post_status != 'trash'){
                var post=res.post,
                    tags=res.tags,
                    categoryIDs=res.categoryIDs,
                    citations= res.citations;
                console.log(citations);
                //if (post.post_status != 'trash') {
                    $('input[name="title"]').val(post.post_title);
                    $('textarea[name="content"]').val(post.post_content);
                    $('input[name="citations"]').val(citations);
                    simplemde.value($('textarea[name="content"]').val());
                    simplemde.citations($('input[name="citations"]').val());
                    //simplemde.citations(citations);
                    //console.log(simplemde.citations());
                    $('input[name="tags"]').val(tags.join(', '));
                    $('input[name="id"]').val(post.ID);
                    $('input[name="category-ids"]').val(categoryIDs.join(', '));
                    $('input[name="password"]').val(post.post_password);
                    $('button[value="publish"]').html('update');
                    $('button[value="trash"]').show();
                    $('input[value="publish"]').prop("checked",true);
                    if(post.post_status=='private'){
                        $('input[value="private"]').prop("checked",true);
                    }else{
                        if(post.post_password){
                            $('input[name="visibility"][value="password"]').prop("checked",true);
                        }
                    }

                //}
            }else{
                $('input[name="title"]').val('');
                $('textarea[name="content"]').val('');
                simplemde.value($('textarea[name="content"]').val());
                $('input[name="tags"]').val('');
                $('input[name="id"]').val(0);
                $('input[name="category-ids"]').val('');
                $('input[name="password"]').val('');
                $('button[value="publish"]').html('publish');
                $('button[value="trash"]').hide();
                $('input[value="publish"]').prop("checked",true);
            }
        }
/*
settings dialog
 */
        $(".post-settings").click(function() {
            var settingsDialog=$('#settings-dialog');
            settingsDialog.dialog({
                appendTo:"#edit-form",
                buttons:{
                    OK:function(){
                        $(this).dialog("close");
                    }
                }
            });
            return false;
        });
        var showPasswordInput=function(value){
            if(value=='password'){ $('input[name="password"]').show();}else{
                $('input[name="password"]').hide();
            }
        }
        showPasswordInput(  $('input:checked').val());
        $('input[name="visibility"]').on("change",function(){
            showPasswordInput($(this).val());
        });

        /*
        actions
         */
        var  form=$('#edit-form');
        $(document).on('click','.actions-section button',function(){
            var  action=$(this).val();

                if(action=='trash'){
                    if(!confirm('You are about to delete the post. Are you sure?')){
                        return false;
                    }else{
                        $('input[name="task"]').val('trash');
                        form.submit();
                    }
                }
                else {
                    if($("input[name='title']").val()==''){
                        alert("Please enter your title!");
                        return false;
                    }else{
                        $('input[name="task"]').val('publish');
                        if (action=='publish' && $("input[name='id']").val()==0){
                            var dialogContent=selectCategoriesForm();
                            var categorizeDialog=$('<div/>',{html:dialogContent,});
                            categorizeDialog.dialog({title:'Select Categories',
                                buttons:{
                                    Done:function(){
                                        var categorySelector = '#dialog-select-categories li ';
                                        var categoryIDs = jQuery(categorySelector + ' input[type="checkbox"]:checked').map(function () {
                                            return jQuery(this).getItemID();
                                        });//https://stackoverflow.com/questions/21307137/using-jquery-to-get-data-attribute-values-with-each
                                        //alert(categoryIDs.get())
                                        categoryIDs=categoryIDs.get();
                                        $('#edit-form input[name="category-ids"]').val(categoryIDs);
                                        form.submit();
                                        $(this).remove();
                                    },
                                    Cancel:function(){$(this).remove();},
                                }
                            });
                        }
                        else{
                            //insert_save_post
                            form.submit();
                        }
                    }
                }
            });

        form.off("submit").on("submit",function(){
            $('textarea[name="content"]').val(simplemde.value());
            console.log(simplemde.citations());
            $('input[name="citations"]').val(simplemde.citations());
            loading.show();
            $.ajax({
                url:form.attr('action'),
                data:form.serialize(), // form data
                type:form.attr('method'), // POST
                dataType: "json",
                beforeSend:function(){
                },
                success:function(res){
                    loading.hide();
                    if(!res.post){
                        return false;
                    }
                    updateEditForm(res);
                    var messageBox=$('<div/>',{html:res.message});
                    messageBox.dialog(
                        {
                            buttons:[
                            {
                                html: res.view,//link
                                click: function () {
                                    window.location=res.redirect;
                                }
                            },
                            {
                                html: 'Stay',
                                click:function(){
                                    $(this).remove();
                                    history.pushState(null, null, "?id="+res.post.ID);
                                }
                            }
                            ],
                        }
                    );

                }
            });
            return false;
        });
    });
</script>