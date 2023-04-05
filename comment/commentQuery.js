/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */

import Comment from './commentModel.js';
import Advertisement from '../advertisement/advertisementModel.js';

const commentQuery = {
  Query: {
    getAllComments: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const comments = await Comment.find({});
      return comments;
    },
    getAdComments: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const ad = await Advertisement.findOne({ _id: args.ad_id });
      return ad.comments;
    },
    getOneComment: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      /* Filters unused args */
      const filter = () => {
        const fields = {};
        if (args._id) Object.assign(fields, { _id: args._id });
        if (args.author) Object.assign(fields, { author: args.author });
        if (args.date) Object.assign(fields, { date: args.date });
        return fields;
      };
      const comment = await Comment.findOne(filter());
      return comment;
    },
    getManyComments: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      /* Filters unused args */
      const filter = () => {
        const fields = {};
        if (args.author) Object.assign(fields, { author: args.author });
        if (args.date) Object.assign(fields, { date: args.date });
        return fields;
      };
      const comments = await Comment.find(filter());
      return comments;
    },
  },
};

export default commentQuery;
