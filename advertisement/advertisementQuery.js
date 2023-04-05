/* eslint-disable import/extensions */

import Advertisement from './advertisementModel.js';

const advertisementQuery = {
  Query: {
    getAds: () => Advertisement.find({}),
    getOneAd: (root, args) => {
      /* Filters unused args */
      const filter = () => {
        const fields = {};
        if (args.title) Object.assign(fields, { title: args.title });
        if (args.type) Object.assign(fields, { type: args.type });
        if (args.publication_status) {
          Object.assign(fields, { publication_status: args.publication_status });
        }
        if (args.publication_property) {
          Object.assign(fields, { publication_property: args.publication_property });
        }
        if (args.price) Object.assign(fields, { price: args.price });
        return fields;
      };
      return Advertisement.findOne(filter());
    },
    getManyAds: (root, args) => {
      /* Filters unused args */
      const filter = () => {
        const fields = {};
        if (args.title) Object.assign(fields, { title: args.title });
        if (args.type) Object.assign(fields, { type: args.type });
        if (args.publication_status) {
          Object.assign(fields, { publication_status: args.publication_status });
        }
        if (args.publication_property) {
          Object.assign(fields, { publication_property: args.publication_property });
        }
        if (args.price) Object.assign(fields, { price: args.price });
        return fields;
      };
      return Advertisement.find(filter());
    },
    getPublishedAds: () => Advertisement.find({ publication_status: 'Publiée' }),
  },
};

export default advertisementQuery;
