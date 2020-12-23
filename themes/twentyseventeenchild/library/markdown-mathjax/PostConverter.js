 

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Based on the Stack Exchange's modification of the original mathjax-editing.js
 * written by Davide Cervone. SE's version is available here:
 * 
 * http://dev.stackoverflow.com/content/js/mathjax-editing.js
 * 
 * Davide's original version can be found here:
 * 
 * http://www.math.union.edu/~dpvc/transfer/mathjax/mathjax-editing.js
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 

(function(){
		var converter = new Markdown.Converter();
        var ready = false; // true after initial typeset is complete
        var pending = false; // true when MathJax has been requested
        var preview = null; // the preview container
        var inline = "$"; // the inline math delimiter
        var blocks, start, end, last, braces; // used in searching for math
        var math; // stores math until markdone is done
        var HUB = MathJax.Hub;
        //
        var SPLIT = /(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;
        //
        function processMath(i, j, preProcess) {
            var block = blocks.slice(i, j + 1).join("").replace(/&/g, "&amp;") // use HTML entity for &
            .replace(/</g, "&lt;") // use HTML entity for <
            .replace(/>/g, "&gt;") // use HTML entity for >
            ;
            if (HUB.Browser.isMSIE) {
                block = block.replace(/(%[^\n]*)\n/g, "$1<br/>\n")
            }
            while (j > i) {
                blocks[j] = "";
                j--;
            }
            blocks[i] = "@@" + math.length + "@@";
            if (preProcess)
                block = preProcess(block);
            math.push(block);
            start = end = last = null;
        }


        var capturingStringSplit;
        if ("aba".split(/(b)/).length === 3) {
            capturingStringSplit = function (str, regex) { return str.split(regex) }
        }
        else { // IE8
            capturingStringSplit = function (str, regex) {
                var result = [], match;
                if (!regex.global) {
                    var source = regex.toString(),
                        flags = "";
                    source = source.replace(/^\/(.*)\/([im]*)$/, function (wholematch, re, fl) { flags = fl; return re; });
                    regex = new RegExp(source, flags + "g");
                }
                regex.lastIndex = 0;
                var lastPos = 0;
                while (match = regex.exec(str))
                {
                    result.push(str.substring(lastPos, match.index));
                    result.push.apply(result, match.slice(1));
                    lastPos = match.index + match[0].length;
                }
                result.push(str.substring(lastPos));
                return result;
            }
        }
        //
        function removeMath(text) {
            start = end = last = null; 
            math = []; 
			//
            var hasCodeSpans = /`/.test(text),
                deTilde;
            if (hasCodeSpans) {
                text = text.replace(/~/g, "~T").replace(/(^|[^\\`])(`+)(?!`)([^\n]*?[^`\n])\2(?!`)/gm, function (wholematch) {
                    return wholematch.replace(/\$/g, "~D");
                });
                deTilde = function (text) { return text.replace(/~([TD])/g, function (wholematch, character) { return { T: "~", D: "$" }[character]; }) };
            } else {
                deTilde = function (text) { return text; };
            }
            
            
            blocks = capturingStringSplit(text.replace(/\r\n?/g, "\n"), SPLIT);
            
            for (var i = 1, m = blocks.length; i < m; i += 2) {
                var block = blocks[i];
                if (block.charAt(0) === "@") {
                    //
                    blocks[i] = "@@" + math.length + "@@";
                    math.push(block);
                }
                else if (start) {
                    //
                    if (block === end) {
                        if (braces) {
                            last = i
                        }
                        else {
                            processMath(start, i, deTilde)
                        }
                    }
                    else if (block.match(/\n.*\n/)) {
                        if (last) {
                            i = last;
                            processMath(start, i, deTilde)
                        }
                        start = end = last = null;
                        braces = 0;
                    }
                    else if (block === "{") {
                        braces++
                    }
                    else if (block === "}" && braces) {
                        braces--
                    }
                }
                else {
                    //
                    if (block === inline || block === "$$") {
                        start = i;
                        end = block;
                        braces = 0;
                    }
                    else if (block.substr(1, 5) === "begin") {
                        start = i;
                        end = "\\end" + block.substr(6);
                        braces = 0;
                    }
                }
            }
            if (last) {
                processMath(start, last, deTilde)
            }
            return deTilde(blocks.join(""));
        }
        //  
        function replaceMath(text) {
            text = text.replace(/@@(\d+)@@/g, function (match, n) {
                return math[n]
            });
            math = null;
            return text;
        }
		
		
		var txt=document.getElementById("content-<?php the_ID() ?>").textContent;
		txt=removeMath(txt);
		txt=converter.makeHtml(txt);
		document.getElementById("content-<?php the_ID() ?>").innerHTML=replaceMath(txt);
		//document.getElementById("content-<?php the_ID() ?>").innerHTML="C";
})();

