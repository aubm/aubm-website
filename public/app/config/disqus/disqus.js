import {Module} from '../../decorators';
import 'angularUtils-disqus';

@Module({name: 'app.config.disqus', modules: ['angularUtils.directives.dirDisqus']})
export default class Disqus{}
