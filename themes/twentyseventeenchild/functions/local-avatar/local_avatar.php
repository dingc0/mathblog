<?php add_filter( 'get_avatar', 'slug_get_avatar', 10, 5 );
function slug_get_avatar( $avatar, $id_or_email, $size, $default, $alt ) {

    //If is email, try and find user ID
    if( ! is_numeric( $id_or_email ) && is_email( $id_or_email ) ){
        $user  =  get_user_by( 'email', $id_or_email );
        if( $user ){
            $id_or_email = $user->ID;
        }
    }

    //if not user ID, return
    if( ! is_numeric( $id_or_email ) ){
        return $avatar;
    }

    //Find ID of attachment saved user meta
    $saved = get_user_meta( $id_or_email, 'avatar', true );
    if($saved) {
        //if (0 < absint($saved)) {
            //return saved image
            return wp_get_attachment_image($saved, [$size, $size], false, ['alt' => $alt]);
        //}
    }
    //return normal
    return $avatar;

}


function update_local_avatar()
{

        $user_id=$_POST['user-id'];
        $success=false;
    if ( true ) {
        // These files need to be included as dependencies when on the front end.
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');

        // Let WordPress handle the upload.
        $img_id = media_handle_upload('file', 0);
        if (is_wp_error($img_id)) {
            $message = $img_id->get_error_message();
            //if(empty($_FILES)){$message="A";}
            //$MaxFileSize = wp_max_upload_size() / 1024;
            ///$message = "Error! Make sure that you are uploading correct file type and the file size is under $MaxFileSize K." .
        } else {
            update_user_meta($user_id, 'avatar', $img_id);
            $new_image = get_avatar($user_id, 128).$user_id;
            $success = true;
            $message=$new_image;

        }
    }
        $return=array(
            'image'=>$new_image,
            'success'=>$success,
            'message'=>$message,
        );
        echo  json_encode($return);
        wp_die();
}

add_action('wp_ajax_update_avatar', 'update_avatar');
add_action('wp_ajax_nopriv_update_avatar', 'update_avatar');
function update_avatar(){
    $user_id=$_POST['user-id'];
    $data=$_POST['imagebase64'];
    $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data));
  /*  $upload_dir = wp_upload_dir();

// @new
    $upload_path = str_replace( '/', DIRECTORY_SEPARATOR, $upload_dir['path'] ) . DIRECTORY_SEPARATOR;

*/
    $cropped_image = $_POST['imagebase64'];
    list($type, $cropped_image) = explode(';', $cropped_image);
    list(, $cropped_image) = explode(',', $cropped_image);
    $cropped_image = base64_decode($cropped_image);
    $image_name = date('ymdgis').'.png';

    $avatars_path='../wp-content/themes/twentyseventeenchild/avatars/';
    //$MyPath='Filesmmm';

    if(!file_exists($avatars_path)){//检查文件夹是否存在
        mkdir($avatars_path);  //没有就创建一个新文件夹

    }
    file_put_contents($avatars_path.$image_name, $cropped_image);

    /*$decoded = $_POST['imagebase64'];
    $filename = 'my-base64-image.png';

    $hashed_filename = md5( $filename . microtime() ) . '_' . $filename;

// @new
    $image_upload = file_put_contents( $upload_path . $hashed_filename, $decoded );

//HANDLE UPLOADED FILE
    if( !function_exists( 'wp_handle_sideload' ) ) {
        require_once( ABSPATH . 'wp-admin/includes/file.php' );
    }

// Without that I'm getting a debug error!?
    if( !function_exists( 'wp_get_current_user' ) ) {
        require_once( ABSPATH . 'wp-includes/pluggable.php' );
    }

// @new
    $file             = array();
    $file['error']    = '';
    $file['tmp_name'] = $upload_path . $hashed_filename;
    $file['name']     = $hashed_filename;
    $file['type']     = 'image/png';
    $file['size']     = filesize( $upload_path . $hashed_filename );

// upload file to server
// @new use $file instead of $image_upload
    $file_return = wp_handle_sideload( $file, array( 'test_form' => false ) );

    $filename = $file_return['file'];
    $attachment = array(
        'post_mime_type' => $file_return['type'],
        'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
        'post_content' => '',
        'post_status' => 'inherit',
        'guid' => $wp_upload_dir['url'] . '/' . basename($filename)
    );
    $attach_id = wp_insert_attachment( $attachment, $filename );
    update_user_meta($user_id, 'avatar', $attach_id);
    $new_image = get_avatar($user_id, 128);
    $success = true;
    $message=$new_image."A".$user_id."A".$attach_id;
*/
    $return=array(
        'image'=>$new_image,
        'success'=>$success,
        'message'=>$message,
    );
    echo  json_encode($return);
    wp_die();
}