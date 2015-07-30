import 'backbone-relational';
import 'backbonefire';
import { RelationalModel, HasOne, HasMany } from 'backbone';
import User from '../Models/User';

var Response = RelationalModel.extend({
/*
	idAttribute : '_id',
    relations:[{
      type: HasOne,
      key: 'user',
      relatedModel: User,
      reverseRelation: {
        key: 'response',
        type: HasMany,
        includeInJSON: 'id'
      }
    }] 
*/ 
});

export default Response;