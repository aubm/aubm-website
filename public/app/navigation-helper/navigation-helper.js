import {Module,Service} from '../decorators';

let moduleName = 'app.navigationHelper';

@Module({name: moduleName})
export default class NavigationHelper{}

@Module({inject: moduleName})
@Service('CurrentPostService')
export class CurrentPostService {
    constructor() {
        this.currentPost = null;
    }

    use(deferer) {
        return deferer.then((post) => {
            this.currentPost = post;
            return post;
        });
    }
}
