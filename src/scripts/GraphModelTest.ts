import { GraphModel, User } from '@often/often-core';

let usr = new User({ id: "twitter:381899610" });
usr.syncData().then((sm: User) => {
	sm.save();
}).catch((err) => {
	console.log(err);
});

