/// <reference path="../underscore/underscore.d.ts" />
/// <reference path="../backbone/backbone-global.d.ts" />

declare module Backbone.Firebase {
    class Model extends Backbone.Model {
        autoSync: Boolean;
    }

    class Collection<TModel extends Backbone.Model> extends Backbone.Collection<TModel> {
        autoSync: Boolean;
        constructor(models?: TModel[] | Object[], options?: any);
    }
}

declare module "backbonefire" {
    export default Backbone.Firebase;
}

