import {Module,Config} from '../../decorators';
import 'angular-loading-bar/build/loading-bar.css!';
import './loading-bar.css!';
import angularLoadingBar from 'angular-loading-bar';

@Module({name: 'app.config.loadingBar', modules: [angularLoadingBar]})
@Config(cfpLoadingBarProvider => { "ngInject"; cfpLoadingBarProvider.includeSpinner = false; })
export default class LoadingBar{}
