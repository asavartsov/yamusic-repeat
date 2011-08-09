/**
 * insert_script.js
 * Script running as a content script
 * Copyright (c) 2011 Alexey Savartsov <asavartsov@gmail.com>
 * Licensed under the MIT license
 */


var head= document.getElementsByTagName('head')[0];
var script = document.createElement('script');

script.type = 'text/javascript';
script.src = chrome.extension.getURL("albumize.js");

head.appendChild(script);
