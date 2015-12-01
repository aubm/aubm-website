import {Module} from '../decorators';
import Theme from './theme/theme';
import Markdown from './markdown/markdown';
import Socialshare from './socialshare/socialshare';
import Disqus from './disqus/disqus';
import LoadingBar from './loading-bar/loading-bar';
import Analytics from './analytics/analytics';
import Route from './route/route';

@Module({name: 'app.config', modules: [Theme, Markdown, Socialshare, Disqus, LoadingBar, Analytics, Route]})
export default class Config{}
