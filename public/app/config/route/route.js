import {Module,Config} from '../../decorators';
import angularRoute from 'angular-route';

@Module({name: 'app.config.route', modules: [angularRoute]})
@Config($routeProvider => { "ngInject"; $routeProvider.otherwise({redirectTo: '/'}); })
@Config($locationProvider => { "ngInject"; $locationProvider.html5Mode(true); })
export default class Route{}
