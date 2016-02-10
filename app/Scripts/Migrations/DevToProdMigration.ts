import * as Firebase from 'firebase';
import { firebase as FirebaseConfig } from '../../config';

var devRef = new Firebase(`${FirebaseConfig.BaseURL}/artists`);
