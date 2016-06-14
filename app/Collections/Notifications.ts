import { Firebase } from 'backbone';
import Notification from '../Models/Notification';

class Notifications extends Firebase.Collection<Notification> {
	constructor (models = [], opts = { model: Notification, autoSync: false}) {
		super(models, opts);
	}
}

export default Notifications;
