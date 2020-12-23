function MyWMDEditor (Fix) {
	var converter = new Markdown.Converter();
	var RemoveAndReplaceMath= new MathEdit();
	/*function MyPreConversion(str){
		if(str.indexOf("&fg=000000")!=-1){  
			str=str.replace(/&fg=000000/gi,"");
			str=str.replace(/(<a)(\s*name=[\s\S]*?\$latex[\s\S]*?\$[\s\S]*?<\/a>)/gi,'$1 class="NoLink" $2');
			//return str;
		}
		return str;
	}*/
	converter.hooks.chain("preConversion", function (text) {
			//text=MyPreConversion(text);
			//var txt=text;		
			//txt= txt.replace(/&gt;/gi,'>').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&quot;/gi,'"');		
			return '';
	});
	/*converter.hooks.chain("postConversion", function (text) {
		return '';
	});	*/

	var options = {
		helpButton: { 
			//handler: help 
		},
		strings: { 
		quoteexample: "Highlight",
		quote: "Highlight <blockquote> Ctrl+Q",
		heading: "Section <h1>/<h2> Ctrl+H",
		headingexample: "Section",
		help:"Editing Help",
		}
	};

	var editor = new Markdown.Editor(converter, Fix, options);

	var InsertImageDialogHTML = function () {
		/*<div style="padding: 5px;">
				      <div class="ImageURL" >
                            <p>Paste the URL of your image on the web in the following blank, e.g., http://example.com/image.jpg</p>
                                <form style="padding: 0px; margin: 0px; float: left; width: 100%; text-align: center; position: relative;">
                                    <input name="URL" style="display: block; width: 80%; margin-right: auto; margin-left: auto;" type="text" value='http://'/>
                                    <button name="OKButton" value="OK" style="margin: 10px; display: inline; width: 7em;" type="button">OK</button>
                                    <button name="CancelButton" value="Cancel" style="margin: 10px; display: inline; width: 7em;" type="button">Cancel</button>
                                </form>
                        </div>
                </div>
                <div class="ImageFile" >
                <p>Upload an your image file from your computer.</p>
                    <form method="post" style="padding: 0px; margin: 0px; float: left; width: 100%; text-align: center; position: relative;">
                    <div style="position:relative;display:flex">
                       <!-- <input type='text' name='FileText'  class='FileText' style=""/>
						<input type='button' name='FileButton' class='FileButton' value='Browse' style=""/>
					   <input type="file"  class="FileInput" style="filter:alpha(opacity:0);opacity: 0; width:100%;position:absolute;top:0;right:0%;display:block;" onchange="document.getElementsByClassName('FileText')[0].value=this.value;">
                         -->
                          <input type="file"  class="FileInput" onchange="document.getElementsByClassName('FileText')[0].value=this.value;">
					</div style="display:flex">
                        <button name="OKButton" value="OK" style="margin: 10px; display: inline; width: 7em;" type="button">Upload</button>
                        <button name="CancelButton" value="Cancel" style="margin: 10px; display: inline; width: 7em;" type="button">Cancel</button>
                   </form>

                </div>
            <script>
            //jQuery('.FileButton').outerHeight(jQuery('.FileText').outerHeight());
            //jQuery('.FileInput').outerHeight(jQuery('.FileButton').outerHeight());
            </script>*/
	};
	var lines = new String(InsertImageDialogHTML);
	lines = lines.substring(lines.indexOf("/*") + 2, lines.lastIndexOf("*/"));
	//alert(lines);

	editor.hooks.set("insertImageDialog", function (callback) {

//Note 用到了header中的函数。
		//Processing(lines,"wmd-prompt-dialog");
		var DialogID='dialog-wmd-'+Fix;
		CreateDialog(lines,'<ul class="InsertImageTab">\n' +
			'<li class="ImageTab"><b>Insert Image</b></li><li class="ImageURLTab">URL</li><li class="ImageFileTab">Upload</li>\n' +
			'</ul>',DialogID,'');
		jQuery('#'+DialogID).addClass('wmd-prompt-dialog');
		jQuery('#'+DialogID+'-background').removeClass('dialog-background');
		//jQuery(".dialog-content").addClass("wmd-prompt-dialog");
		//

			jQuery(document).on('click','.ImageURLTab',function(){
				jQuery('.ImageFileTab').removeClass('CurrentTab');
				jQuery('.ImageURLTab').addClass('CurrentTab');
				jQuery('.ImageFile').hide();
				jQuery('.ImageURL').show();
				setTimeout(function () { jQuery('.ImageURL input[type="text"]').focus().select(); }, 1);

			});
			jQuery(document).on('click','.ImageFileTab',function(){
				jQuery('.ImageURLTab').removeClass('CurrentTab');
				jQuery('.ImageFileTab').addClass('CurrentTab');
				jQuery('.ImageURL').hide();
				jQuery('.ImageFile').show();

			});
			jQuery('.ImageURLTab').click();
			//jQuery(document).on('click',".ImageURL button[name='CancelButton']",function(){
			var ImageURLCancelButton = document.querySelector(".ImageURL button[name='CancelButton']");//A strange thing is that when using jQuery, the dialog shows only once.
				ImageURLCancelButton.onclick=function() {
					setTimeout(function () {
						callback(null);
					}, 0);

					RemoveDialog(DialogID);
				};
			//});
			//jQuery(document).on('click',".ImageURL input[name='OKButton']",function(){
		var ImageURLOKButton = document.querySelector(".ImageURL button[name='OKButton']");//A strange thing is that when using jQuery, the dialog shows only once.
		ImageURLOKButton.onclick=function() {

			var ImageURLValue = jQuery(".ImageURL input[name='URL']").val();
			ImageURLValue=ImageURLValue.trim();
			if (ImageURLValue.indexOf('http://') != 0 && ImageURLValue.indexOf('https://') != 0) {
				ImageURLValue = 'http://'+ ImageURLValue;
			}
			setTimeout(function () {
				callback(ImageURLValue);
			}, 0);

			RemoveDialog(DialogID);
		};
			//});
		//jQuery(document).on('click',".ImageURL button[name='CancelButton']",function(){
		var ImageFileCancelButton = document.querySelector(".ImageFile button[name='CancelButton']");//A strange thing is that when using jQuery, the dialog shows only once.
		ImageFileCancelButton.onclick=function() {
			setTimeout(function () {
				callback(null);
			}, 0);

			RemoveDialog(DialogID);
		};
		//});
		var ImageFileOKButton = document.querySelector(".ImageFile button[name='OKButton']");//A strange thing is that when using jQuery, the dialog shows only once.
		var ImageFileForm = document.querySelector(".ImageFile form");//A strange thing is that when using jQuery, the dialog shows only once.
		ImageFileOKButton.onclick=function() {

			jQuery('.ImageFile form').submit();

			};
jQuery('.ImageFile form').submit(function(){
	//Note:该部分用到了外部变量和函数, 在header中
	var ajaxurl = AdminAjaxURL;
	var formData = new FormData();

	formData.append('updoc', jQuery('.ImageFile input[type=file]')[0].files[0]);
	formData.append('action', "upload_image_file");
	jQuery.ajax({
		url: ajaxurl,
		type: "POST",
		data:formData,cache: false,
		processData: false, // Don't process the files
		contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		dataType: "json",
		beforeSend:function() {
			BeginProcess('TempID');
			},
		success:function(data) {
			EndProcess('TempID');
			RemoveDialog(DialogID);
			setTimeout(function () {
				if (data.Success) {
					callback(data.ImageURL);
					Preview.Update();
				}else {
					callback(null);
					alert(data.Message);
				};
			}, 0);
		},

	});
	return false;
});

		//alert("Please click okay to start scanning your brain...");
/*		setTimeout(function () {
			var prompt = "We have detected that you like cats. Do you want to insert an image of a cat?";
			if (confirm(prompt))
				callback("http://icanhascheezburger.files.wordpress.com/2007/06/schrodingers-lolcat1.jpg")
			else
				callback(null);
		}, 2000);

 */
		return true; // tell the editor that we'll take care of getting the image url
	});



	//editor.hooks.chain("onPreviewRefresh", function () { 			MathJax.Hub.Queue(["Typeset",MathJax.Hub,"wmd-preview"+Fix]); 
	//});        
	editor.run();

	var MyButtonBar = document.getElementById("wmd-button-bar" + Fix).getElementsByTagName("span");

	function MyMakeIcon(name) {
		return 	'<svg class="icon" aria-hidden="true"><use xlink:href="#'+name+'"></use></svg>';
	}

	var MyIcons=["icon-bold","icon-italic","icon-link","icon-highlight","icon-code","icon-image","icon-orderedlist","icon-unorderedlist","icon-format-section","icon-line","icon-undo","icon-redo","icon-question"];

	for (var i=0,len=MyButtonBar.length; i<len; i++)
	{

		MyButtonBar[i].innerHTML=MyMakeIcon(MyIcons[i]);
		
	}
	MyButtonBar[MyButtonBar.length-1].innerHTML="<a href='https://math.liveadvances.com/editing-help' target='_blank' style='border:none!important'>"+MyMakeIcon("icon-question")+"</a>";
	//var help = function () { MyButtonBar[MyButtonBar.length].getElementsByTagName('a')[0].click();}
	Preview.Init("wmd-input" + Fix,"MathPreview" + Fix,"MathBuffer" +Fix);
	Preview.Update();
	jQuery(document).on('input propertychange',"#wmd-input" + Fix,function(){Preview.Update();});
	jQuery(document).on('click',"#wmd-button-bar" + Fix,function(){Preview.Update();});
	jQuery(document).on('click',"input[value='OK']",function(){Preview.Update();});
	jQuery(document).on('click',"button[value='OK']",function(){Preview.Update();});

}