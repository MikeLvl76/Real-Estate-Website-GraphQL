/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */

import { unlinkSync } from 'fs';
import Advertisement from './advertisementModel.js';

const advertisementMutation = {
  Mutation: {
    createAdvertisement: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const advertisement = args.ad;
      Advertisement.create(advertisement);
      return advertisement;
    },
    updateAdvertisement: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const old = await Advertisement.findById(args._id);
      console.log('PICS: ', old.pictures)
      if (args.ad.pictures) {
        if (old.pictures.length > 0) {
          old.pictures.filter(p => !args.ad.pictures.includes(p)).forEach((p) => unlinkSync(`${p}`));
        }
      }
      const ad = await Advertisement.findByIdAndUpdate(old._id, args.ad, { new: true });
      return ad;
    },
    deleteAdvertisement: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const ad = await Advertisement.findById(args._id);
      if (ad.pictures.length > 0) {
        ad.pictures.forEach((p) => unlinkSync(`${p}`));
      }
      await Advertisement.deleteOne({ _id: ad._id });
      return ad;
    },
  },
};

export default advertisementMutation;
