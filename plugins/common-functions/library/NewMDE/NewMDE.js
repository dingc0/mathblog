
/*
* Fix SimpleMDE.
*/
    function _replaceSelection(cm, active, startEnd, url) {
        if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
            return;
        var text;
        var start = startEnd[0];
        var end = startEnd[1];
        var startPoint = cm.getCursor("start");
        var endPoint = cm.getCursor("end");
        if(url) {

            start=start.replace(/#.*?#/,url);

            end = end.replace("#url#", url);
        }
        if(active) {
            text = cm.getLine(startPoint.line);
            start = text.slice(0, startPoint.ch);
            end = text.slice(startPoint.ch);
            cm.replaceRange(start + end, {
                line: startPoint.line,
                ch: 0
            });
        } else {
            text = cm.getSelection();
            cm.replaceSelection(start + text + end);

            startPoint.ch += start.length;
            if(startPoint !== endPoint) {
                endPoint.ch += start.length;
            }
        }
        cm.setSelection(startPoint, endPoint);
        cm.focus();
    }

       /* SimpleMDE.prototype.drawImage = function (editor) {
            var cm = editor.codemirror;
            var stat = this.getState(cm);
            var options = editor.options;
            var url = "http://";
            if(options.promptURLs) {
                //url = prompt(options.promptTexts.image);
                url = options.promptTexts.image;
                if(!url) {
                    return false;
                }
            }
            _replaceSelection(cm, stat.image, options.insertTexts.image, url);
        };*/

    SimpleMDE.prototype.drawCitation = function (editor) {
        var cm = editor.codemirror;
        var stat = this.getState(cm);
        var options = editor.options;
        var url = "http://";

        if(options.promptURLs) {
            url = prompt(options.promptTexts.citation);
            //url = options.promptTexts.image;
            /*options.insertTexts.citation=options.insertTexts.citation.map(function(entry){
                return entry.replace('#id#',url);
            });*/

            if(!url) {
                return false;
            }
        }
        _replaceSelection(cm, stat.citation, options.insertTexts.citation, url);
    };

    SimpleMDE.prototype.drawTex = function (editor) {
        var cm = editor.codemirror;
        var stat = this.getState(cm);
        var options = editor.options;
        var url = "http://";

        if (options.promptURLs) {
            url = prompt(options.promptTexts.tex);
            //console.log(url);
            if (!url) {
                return false;
            }
        }
        cm.replaceSelection(url,'around');
        //_replaceSelection(cm, stat.tex, options.insertTexts.tex, url);
    };
const Cite = require('citation-js');
var CitationPlugin=function(){
        /*function getIDs(content){
            var IDs=content.match(/\[@(.*?)\]/g);
            return IDs;
        }*/
        function render(md,citations){
            var regexp=/\[(@.*?)\]/g;

            var matches=md.matchAll(regexp);
            var matchesArray=Array.from(matches);
            var IDsString=matchesArray.map(function(x){return x[1];});
            var AllIDs=[];
            IDsString.forEach(function(string){
                AllIDs=AllIDs.concat(getIDsFromString(string));
            });
            var bibliography=citations.format('bibliography', {
                format: 'html',
                template: 'apa',
                prepend (entry) {
                    if(AllIDs.indexOf(entry.id)==-1) {
                        return '<p style="display:none">';//`[jQuery{entry.id}]: `
                    }else {
                        return '<p>';
                    }
                },
                append(entry){
                    if(AllIDs.indexOf(entry.id)==-1) {
                        return '</p>';//`[jQuery{entry.id}]: `
                    }else {
                        return '</p>';
                    }
                }

            });

            var citationIDs=citations.getIds();
            var HTML=md.replace(regexp,replacer);
            function replacer(match, p1, offset, string){
                IDs=getIDsFromString(p1);
                var validIDs=[];

                IDs.forEach(function(ID,index) {

                    if (citationIDs.indexOf(ID) != -1) {
                        validIDs=validIDs.concat([ID]);
                    } else {
                        //return '???';
                    }
                });
                return citations.format('citation', {entry: validIDs});
               // return html;

            }

            function getIDsFromString(string){
                var IDs=string.split(';');
                IDs=IDs.map(function(ID){
                    ID=ID.trim();
                    ID=ID.replace(/@(\S*)/,'$1');
                    return ID;
                });
                return IDs;
            }

            return HTML+bibliography;
        }
        this.render=render;
    }

    function NewMDE(options) {
        var progressbar = jQuery('<div><i class="fa fa-spinner fa-spin"></i></div>');
        //var buffer=jQuery('<div/>').appendTo('body').addClass("hidden");
        var citations = new Cite();
        var markdownIt=window.markdownit();
        var citationPlugin=new CitationPlugin();
        var escapeMath=new MathjaxEditing();
        var md2html=function(md,citations){
            md=md.replace(/(\[.*?\]\(.*?\))\{\s*?reference-type="(.*?)"[\s\S]*?reference="(.*?)"\s*?\}/g,'$1');
            md=escapeMath.removeMath(md);
            html=markdownIt.render(md);
            html=escapeMath.replaceMath(html);
            html=html.replace(/:::\s*?\{.*?#(\S+).*?\.(\S+).*?\}([\s\S]*?):::/g,'<div id="$1" class="$2">$3</div>');
            html=html.replace(/:::\s*?\{.*?\.(\S+).*?#(\S+).*?\}([\s\S]*?):::/g,'<div id="$2" class="$1">$3</div>');
            html=html.replace(/:::\s*?\{.*?\.(\S+).*?\}([\s\S]*?):::/g,'<div class="$1">$2</div>');
            html=html.replace(/:::\s*?\{.*?#(\S+).*?\}([\s\S]*?):::/g,'<div id="$1">$2</div>');
            html=citationPlugin.render(html,citations);
            return html;
        }

        var defaults = {
            status:false,
            autoDownloadFontAwesome: false,
            promptURLs: true,
            insertTexts: {
                image: ["![", "](#url#)"],
                citation:["[@#id#]",""],
                tex:["#md#",""],
            },
            toolbar: ['bold','italic','quote',
                '|',
                {
                    name: 'link',
                    action: function (editor) {
                        var linkPrompt = jQuery('<div/>', {
                            html:
                                '<h2 class="widget-title">Insert Link</h2>' +
                                '<div>Paste the URL of link in the following blank, e.g., http://example.com/link<input name="url"  type="text" value="http://" autofocus onfocus="this.select();"/></div>',
                        });
                        linkPrompt.dialog({
                            buttons: [
                                {
                                    html: "OK",
                                    click: function () {
                                        var url = jQuery("input[name='url']").val();
                                        linkPrompt.remove();
                                        drawLinkCallback(url, editor);
                                    },
                                },
                                {
                                    html: "Cancel",
                                    click: function () {
                                        jQuery(this).remove();
                                    },
                                },
                            ]
                        });

                    },
                    className: "fa fa-link",
                    title: "link",
                },
                {
                    name: "image",
                    action: function (editor) {
                        var imagePrompt = jQuery('<div/>', {
                            html:
                                '<div style="display:flex;justify-content: space-between;align-items: center;"><h2 class="widget-title">Insert Image</h2><ul><li><a href="#image-url">Paste URL</a></li><li><a href="#image-file">Upload Image</a></li></ul></div>' +
                                '<div id="image-url">Paste the URL of your image on the web in the following blank, e.g., http://example.com/image.jpg <input name="image-url"  type="text" value="http://" autofocus onfocus="this.select();"/></div>' +
                                '<div id="image-file">' +
                                'Upload an your image file from your computer.' +
                                '<input type="file"/>' +
                                '</div>',
                        });
                        imagePrompt.dialog({
                            open: function () {
                                imagePrompt.tabs();
                            },
                            buttons: [
                                {
                                    html: "OK",
                                    click: function () {
                                        var activeTabIdx = imagePrompt.tabs('option', 'active');
                                        if (activeTabIdx == 0) {
                                            var imageURL = jQuery("input[name='image-url']").val();
                                            imagePrompt.remove();
                                            drawImageCallback(imageURL, editor);
                                        }
                                        if (activeTabIdx == 1) {
                                            progressbar.appendTo(this).progressbar({value: false});
                                            var formData = new FormData();
                                            formData.append('updoc', jQuery('input[type=file]')[0].files[0]);
                                            formData.append('action', "upload_file");
                                            jQuery.ajax({
                                                url: ajaxurl,
                                                type: "POST",
                                                data: formData, cache: false,
                                                processData: false, // Don't process the files
                                                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                                                dataType: "json",
                                                beforeSend: function () {
                                                },
                                                success: function (data) {
                                                    imagePrompt.remove();
                                                    if (!data.message) {
                                                        drawImageCallback(data.imageURL, editor);
                                                    } else {
                                                        alert(data.message);
                                                    }

                                                },

                                            });
                                            return false;
                                        }

                                    },
                                },
                                {
                                    html: "Cancel",
                                    click: function () {
                                        jQuery(this).remove();
                                    },
                                },
                            ]
                        });

                    },
                    //className: "fa fa-picture-o",
                    className:"far fa-image",
                    title: "image",
                },
                {
                    name: 'citation',
                    action: function (editor) {
                        var citationPrompt = jQuery('<div/>', {
                            html:
                                '<h2 class="widget-title">Insert Citation <span style="font-weight: normal;font-size: small"> beta</span></h2>' +
                                '<div>Paste citations in the following textarea.' +
                                '<textarea name="citation-data" autofocus onfocus="this.select();" rows="8">' +
                                '@book{mac2013categories,\n' +
                                '  title={Categories for the working mathematician},\n' +
                                '  author={Mac Lane, Saunders},\n' +
                                '  volume={5},\n' +
                                '  year={2013},\n' +
                                '  publisher={Springer Science \\& Business Media}\n' +
                                '}' +
                                '</textarea>' +
                                '</div>',
                        });
                        citationPrompt.dialog({
                            buttons: [
                                {
                                    html: "OK",
                                    click: function () {
                                        progressbar.appendTo(this).progressbar({value: false});
                                        var data = jQuery('textarea[name="citation-data"]').val();
                                        citations.add(data);
                                        //var newCitations=  new Cite(data);
                                        var newIDs=new Cite(data).getIds();
                                        //asynchronousCallback();
                                        jQuery.each(newIDs,function(index,value){
                                            //console.log(value);
                                            drawCitationCallback(value,editor);
                                        });
                                        jQuery(this).remove();
                                    },
                                },
                                {
                                    html: "Cancel",
                                    click: function () {
                                        jQuery(this).remove();
                                    },
                                },
                            ]
                        });

                    },
                    className: "fa fa-paperclip",
                    title: "citation",
                },
                {
                    name: "tex",
                    action: function (editor) {
                        var sampleURL='https://functors.net/wp-content/plugins/common-functions/library/NewMDE/sample/sample.zip';
                        var texPrompt = jQuery('<div/>', {
                            class:'tex',
                            html:
                                '<h2 class="widget-title">Upload $\\LaTeX$ Document <span style="font-size:small;font-weight: normal"> beta</span></h2>' +
                                '<div id="tex-file">' +
                                '<p>Upload a .zip file that contains all the files of your latex document, we\'ll try to convert it.</p>' +
                                '<p>Have a look at <a href="'+ sampleURL +'" download>this sample</a> if your document is not converted correctly.</p>' +
                                '<input type="file"/>' +
                                '</div>',
                        });
                        texPrompt.dialog({
                            open: function(){
                                MathJax.typeset([".tex"]);
                            },
                            buttons: [
                                {
                                    html: "OK",
                                    click: function () {
                                            progressbar.appendTo(this).progressbar({value: false});
                                            var formData = new FormData();
                                            formData.append('updoc', jQuery('.tex input[type=file]')[0].files[0]);
                                            formData.append('action', "upload_tex");
                                            jQuery.ajax({
                                                url: ajaxurl,
                                                type: "POST",
                                                data: formData, cache: false,
                                                processData: false, // Don't process the files
                                                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                                                dataType: "json",
                                                beforeSend: function () {
                                                },
                                                success: function (data) {
                                                    texPrompt.remove();
                                                    if (!data.message) {
                                                        //console.log(data.md);
                                                        citations.add(data.citations);
                                                        /*var newIDs=new Cite(data.bib).getIds();
                                                        jQuery.each(newIDs,function(index,value){
                                                            //alert(index);  alert(value);
                                                            //drawCitationCallback(value,editor);
                                                        });
                                                         */
                                                        var text=data.md;
                                                        //text=text.replace(/\$\$([^\$]*?\\label\{.+?\}[^\$]*?)\$\$/g,'\\begin{equation}$1\\end{equation}');
                                                        //text=text.replace(/\\begin\{aligned\}([\s\S]*?\\label\{.+?\}[\s\S]*?)\\end\{aligned\}/g,'\\begin{align}$1\\end{align}');

                                                        //text=text.replace(/\$\$([^\$]*?label[^\$]*?)\$\$/g,'\\begin{equation}$1\\end{equation}');
                                                        text=text.replace(/\[\\\[.*?\\\]\]\(.*?\)\{reference-type="(.*?)"[\s\S]*?reference="(.*?)"\}/g,'\$\\$1\{$2\}\$');
                                                        text=text.replace(/(\[.*?\]\(.*?\))\{\s*?reference-type="(.*?)"[\s\S]*?reference="(.*?)"\s*?\}/g,'$1');
                                                        //text=text.replace(/:::\s*?\{.*?#(\S+).*?\.(\S+).*?\}([\s\S]*?):::/g,':::\{#$1\}$3:::');
                                                        //text=text.replace(/:::\s*?\{.*?\.(\S+).*?\}([\s\S]*?):::/g,'$2');
                                                        //text=text.replace(/:::\s*?\{.*?#(\S+).*?\}([\s\S]*?):::/g,':::\{#$1\}$2:::');
                                                        drawTexCallback(text, editor);
                                                    } else {
                                                        var messageBox=jQuery('<div/>',{html:data.message});
                                                        messageBox.dialog({
                                                            buttons:{
                                                                OK:function(){jQuery(this).remove();}
                                                                },
                                                        });
                                                    }

                                                },

                                            });
                                            return false;
                                        },
                                },
                                {
                                    html: "Cancel",
                                    click: function () {
                                        jQuery(this).remove();
                                    },
                                },
                            ]
                        });

                    },
                    className: "fa iconfont icon-tex3-copy",
                    title: "tex",
                },
                '|',
                'ordered-list',
                'unordered-list',
                'heading',
                '|',
                'fullscreen',
                'side-by-side',
                'preview',
                '|',
                {
                    name:'help',
                    action:function(){
                        window.location="//functors.net/writing-sample"
                    },
                    className: 'fa fa-question-circle sample',
                    title:'guide',

                }
            ],
            //forceSync: false,
            showIcons: true,
            //initialValue: '',
            spellChecker: false,
            //tabSize: 2,
            parsingConfig: {
                allowAtxHeaderWithoutSpace: true,
            },
            placeholder: "Type here...",
            //element: jQuery("textarea[name='content']")[0],
            previewRender: function (plainText,preview) {
                //setTimeout(function() {
                    preview.innerHTML = md2html(plainText,citations);
                //MathJax.startup.document.state(0);
                MathJax.texReset();
                    MathJax.typesetPromise([preview]);
                //},0);
                return   preview.innerHTML
            }/*
            previewRender: function (plainText, preview) {
                //alert(plainText);
                jQuery.ajax({
                    url: ajaxurl,
                    data: {md: plainText, bib:citations, action: 'ajax_render'},
                    type: 'post',
                    dataType: "json",
                    error: function (xhr, status, error) {
                        console.log(xhr.responseText);
                    },
                    success: function (res) {
                        //console.log(res.post_category_ids);
                        //console.log(res.md);
                        preview.innerHTML = res.html;
                        MathJax.texReset();
                        MathJax.typesetPromise([preview]);
                        //loading.hide();
                    }
                });
                return preview.innerHTML;
            }

             */
        };


        options = jQuery.extend(defaults, options);
        var newMDE = new SimpleMDE(options);
        //jQuery('.CodeMirror').css('background-color','transparent');
        newMDE.codemirror.setOption("mode", 'LaTex');
        newMDE.citations=function(parameter){
            if(parameter){
                //alert("DD");
                citations=new Cite(parameter);
            }else {
                var bibtex=citations.format('bibtex');
                var fixCitationsArray = {
                    '|': '\{\\textbar\}',
                    '<': '\{\\textless\}',
                    '>': '\{\\textgreater\}',
                    '~': '\{\\textasciitilde\}',
                    '^': '\{\\textasciicircum\}',
                    '\\': '\{\\textbackslash\}',
                    //'{': '\\{\\vphantom{\\}}',
                    //'}': '\\vphantom{\\{}\\}'
                };
                bibtex=bibtex.replace(/\{\\textasciitilde\}/g,'\\~');
                for (var key in fixCitationsArray){
                    var substr=fixCitationsArray[key];
                    bibtex=bibtex.replaceAll(substr,key);
                }
                /*bibtex=bibtex.replace(/\{\\textless\}/g,'jjjjjjj');
                bibtex=bibtex.replace(/\{\\textbackslash\}/g,'\\');
                bibtex=bibtex.replace(/\{\\textasciitilde\}/g,'\\~');*/
                return bibtex;
            }
        }
        //newMDE.prototype.citations=newMDE.citations;
        function drawLinkCallback(url, editor) {
            url = url.trim();
            if (url.indexOf('http://') != 0 && url.indexOf('https://') != 0) {
                url = 'http://' + url;
            }
            /*editor.options.promptTexts={
                link:url,
                image:url,
            };*/
            var temp = window.prompt;
            window.prompt = function () {
                return url;
            };
            newMDE.drawLink(editor);
            window.prompt = temp;
        }

        function drawImageCallback(url, editor) {
            url = url.trim();
            if (url.indexOf('http://') != 0 && url.indexOf('https://') != 0) {
                url = 'http://' + url;
            }
            /*editor.options.promptTexts={
                link:url,
                image:url,
            };*/
            var temp = window.prompt;
            window.prompt = function () {
                return url;
            };
            newMDE.drawImage(editor);
            window.prompt = temp;
        }

        function drawCitationCallback(url, editor) {
            var temp = window.prompt;
            window.prompt = function () {
                return url;
            };
            //console.log(url);
            newMDE.drawCitation(editor);
            //var content=newMDE.value();
            //newMDE.value(content.replace(/\[@temp_id.*?\]/,''));
            window.prompt = temp;
        }

        function drawTexCallback(md, editor) {

            /*editor.options.promptTexts={
                link:url,
                image:url,
            };*/
            var temp = window.prompt;
            window.prompt = function () {
                return md;
            };
            newMDE.drawTex(editor);
            //newMDE.value(newMDE.value()+md);
            window.prompt = temp;
        }

        return newMDE;
    }
