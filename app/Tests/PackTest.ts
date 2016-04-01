import Pack from '../Models/Pack';
import MediaItemSource from "../Models/MediaItemSource";
import MediaItemType from "../Models/MediaItemType";
import Categories from '../Collections/Categories';

var pack = new Pack({id : 'test_pack'});

var categories = new Categories();

pack.assignCategoryToItem('41_-aTqhe', categories[0]);



