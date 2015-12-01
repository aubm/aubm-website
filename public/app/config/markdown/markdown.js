import {Module,Config} from '../../decorators';
import angularMarked from 'angular-marked';
import hljs from 'highlightjs';
import 'highlightjs/styles/solarized_light.css!';
import './markdown.css!';

@Module({name: 'app.config.markdown', modules: [angularMarked]})
@Config((markedProvider) => {
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
})
export default class Markdown{}
