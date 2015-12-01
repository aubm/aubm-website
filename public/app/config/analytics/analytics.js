import {Module} from '../../decorators';
import 'angulartics';
import AngularticsGoogleAnalytics from 'angulartics-google-analytics';

@Module({name: 'app.config.analytics', modules: ['angulartics', AngularticsGoogleAnalytics]})
export default class Analytics{}
