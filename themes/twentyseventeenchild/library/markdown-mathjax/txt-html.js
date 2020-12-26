
var editMathjax= new MathEdit();
var removeMath=editMathjax.removeMath;
var replaceMath=editMathjax.replaceMath;
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
function MyPreConversion(str){
    str=str.replace(/&gt;/gi,'>').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&quot;/gi,'"');
    if(str.indexOf("&fg=000000")!=-1){
        str=str.replace(/&fg=000000/gi,"");
        str=str.replace(/(<a)(\s*name=[\s\S]*?\$latex[\s\S]*?\$[\s\S]*?<\/a>)/gi,'$1 class="NoLink" $2');
    }

    return str;
}
function MyPostConversion(str){
    return str;
}
function DoMarkdownWithoutMathjax(str){
    /*var converter = new Markdown.Converter();
    var RemoveAndReplaceMath= new MathEdit();
    converter.hooks.chain("preConversion", function(text){return RemoveAndReplaceMath[0](MyPreConversion(text));});
    converter.hooks.chain("postConversion", function(text){return RemoveAndReplaceMath[1](MyPostConversion(text));});
    return converter.makeHtml(str);
    */
    var txt=removeMath(MyPreConversion(str));

    var parsed = reader.parse(txt); // parsed is a 'Node' tree
    // transform parsed if you like...
    txt = writer.render(parsed);
    //txt=converter.makeHtml(txt);
    return replaceMath(MyPreConversion(txt));

}
/*
	function DoMarkdownWithoutMathjax(str){

		if(str.indexOf("math inline")!=-1){
			return str;
		}
		if(str.indexOf("&fg=000000")!=-1){
			str=str.replace(/&fg=000000/gi,"");
			return str;
		}

		var txt = str;
		txt= txt.replace(/&gt;/gi,'>').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&quot;/gi,'"');
		txt=RemoveAndReplaceMath[0](txt);
		txt=converter.makeHtml(txt);
		txt=RemoveAndReplaceMath[1](txt);
		return txt;
	}
*/
