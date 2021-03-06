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

"use strict";

function MathjaxEditing(){

        var ready = false; // true after initial typeset is complete
        var pending = false; // true when MathJax has been requested
        var preview = null; // the preview container
        var inline = "$"; // the inline math delimiter
        var blocks, start, end, last, braces; // used in searching for math
        var math; // stores math until markdone is done
        //var HUB = MathJax.Hub;

        //
        //  Runs after initial typeset
        // 

        //
        //  The pattern for math delimiters and special symbols
        //    needed for searching for math in the page.
        //
        var SPLIT = /(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;

        //
        //  The math is in blocks i through j, so 
        //    collect it into one block and clear the others.
        //  Replace &, <, and > by named entities.
        //  For IE, put <br> at the ends of comments since IE removes \n.
        //  Clear the current math positions and store the index of the
        //    math, then push the math string onto the storage array.
        //
        function processMath(i, j, preProcess) {
            var block = blocks.slice(i, j + 1).join("").replace(/&/g, "&amp;") // use HTML entity for &
            .replace(/</g, "&lt;") // use HTML entity for <
            .replace(/>/g, "&gt;") // use HTML entity for >
            ;
            /*if (HUB.Browser.isMSIE) {
                block = block.replace(/(%[^\n]*)\n/g, "$1<br/>\n")
            }*/
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
        //  Break up the text into its component parts and search
        //    through them for math delimiters, braces, linebreaks, etc.
        //  Math delimiters must match and braces must balance.
        //  Don't allow math to pass through a double linebreak
        //    (which will be a paragraph).
        //
        function removeMath(text) {
            start = end = last = null; // for tracking math delimiters
            math = []; // stores math strings for latter
            
            // Except for extreme edge cases, this should catch precisely those pieces of the markdown
            // source that will later be turned into code spans. While MathJax will not TeXify code spans,
            // we still have to consider them at this point; the following issue has happened several times:
            //
            //     `$foo` and `$bar` are varibales.  -->  <code>$foo ` and `$bar</code> are variables.

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
                    //  Things that look like our math markers will get
                    //  stored and then retrieved along with the math.
                    //
                    blocks[i] = "@@" + math.length + "@@";
                    math.push(block);
                }
                else if (start) {
                    //
                    //  If we are in math, look for the end delimiter,
                    //    but don't go past double line breaks, and
                    //    and balance braces within the math.
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
                    //  Look for math start delimiters and when
                    //    found, set up the end delimiter.
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
        //  Put back the math strings that were saved,
        //    and clear the math array (no need to keep it around).
        //  
        function replaceMath(text) {
            text = text.replace(/@@(\d+)@@/g, function (match, n) {
                return math[n]
            });
            math = null;
            return text;
        }


        //
        //  Save the preview ID and the inline math delimiter.
        //  Create a converter for the editor and register a preConversion hook
        //   to handle escaping the math.
        //  Create a preview refresh hook to handle starting MathJax.
        //
 /*       function prepareWmdForMathJax(editorObject, wmdId, delimiters) {
            preview = document.getElementById("wmd-preview" + wmdId);
            inline = delimiters[0][0];

            var converterObject = editorObject.getConverter();
            converterObject.hooks.chain("preConversion", removeMath);
            converterObject.hooks.chain("postConversion", replaceMath);
            editorObject.hooks.chain("onPreviewRefresh", UpdateMJ);
        }

        return {
            prepareWmdForMathJax: prepareWmdForMathJax
        }
    
*/
    MathjaxEditing.removeMath=removeMath;
    MathjaxEditing.replaceMath=replaceMath;
    this.removeMath=removeMath;
    this.replaceMath=replaceMath;
}