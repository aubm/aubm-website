import angular from 'angular';
import angularMarked from 'angular-marked';
import hljs from 'highlightjs';
import 'highlightjs/styles/solarized_light.css!';
import './markdown.css!';

export default angular
    .module('app.config.markdown', [
        angularMarked
    ])
    .config((markedProvider) => {
        "ngInject";

        markedProvider.setOptions({
            gfm: true, // enable github flavored markdown
            highlight: function (code, lang) {
                try {
                    if (lang) {
                        return hljs.highlight(lang, code, true).value;
                    } else {
                        return hljs.highlightAuto(code).value;
                    }
                } catch(err) {'Unknown langage';}
            }
        });
    });
