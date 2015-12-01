import {Module, Boot} from './decorators';
import Config from './config/config';
import AppPostsList from './posts/posts-list/posts-list';
import AppPostDetails from './posts/post-details/post-details';
import PageHeader from './page-header/page-header';
import PageTitle from './page-title/page-title';
import PageMetadesc from './page-metadesc/page-metadesc';
import Breadcrumb from './breadcrumb/breadcrumb';
import RouteLoadingIndicator from './route-loading-indicator/route-loading-indicator';

@Boot({ element: document })
@Module({ name: 'app', modules: [
  Config,
  AppPostsList,
  AppPostDetails,
  PageHeader,
  PageTitle,
  PageMetadesc,
  Breadcrumb,
  RouteLoadingIndicator
]})
class App{}
export default App;
