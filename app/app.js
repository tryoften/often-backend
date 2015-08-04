import 'backbonefire';
import ClientRequestDispatcher from './Services/ClientRequestDispatcher';
import users from './Collections/Users';
import CachedResultsManager from './Models/CachedResultsManager';


var crd = new ClientRequestDispatcher();
crd.process();
