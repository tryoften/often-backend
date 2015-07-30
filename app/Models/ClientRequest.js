import 'backbone-relational';
import { RelationalModel, HasOne, HasMany } from 'backbone';
import User from '../Models/User';

var ClientRequest = RelationalModel.extend({ 
	idAttribute : '_id',
    relations:[{
      type: HasOne,
      key: 'user',
      relatedModel: User,
      reverseRelation: {
        key: 'clientRequests',
        type: HasMany,
        includeInJSON: 'id'
      }
    }]
});

export default ClientRequest;