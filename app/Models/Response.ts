import 'backbonefire';
import { Firebase, Model } from 'backbone';
import config from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import * as _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses.
 */
class Response extends Firebase.Model {

    /**
     * Initializes the elastic search config model.
     *
     * @return {void}
     */
    initialize () {
        this.urlRoot = `${config.firebase.BaseURL}/responses`;
        this.autoSync = true;
        this.idAttribute = 'id';
    }

    updateResults (data: any) {
        this.set({
            id: 'id',
            time_modified: Date.now(),
            doneUpdating: false,
            results: JSON.parse(JSON.stringify(data))
        });
    }

    complete () {
        this.set({
            id: 'id',
            doneUpdating: true
        });
    }
}

export default Response;
