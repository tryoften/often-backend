import 'backbonefire';
import ClientRequestDispatcher from './Services/ClientRequestDispatcher';
import users from './Collections/Users';

var crd = new ClientRequestDispatcher();
crd.process();
