/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */

import Advertisement from '../advertisement/advertisementModel.js';
import Comment from './commentModel.js';

const commentMutation = {
  Mutation: {
    createComment: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      if (!authenticated) throw new Error('Account not authenticated');
      const cmt = await Comment.create(args.comment);
      await Advertisement.findByIdAndUpdate(
        args.ad_id,
        {
          $push: { comments: cmt },
        },
        {
          new: true,
        },
      );
      return cmt;
    },
    updateComment: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      if (!authenticated) throw new Error('Account not authenticated');
      const cmt = await Comment.findByIdAndUpdate(
        args._id,
        {
          content: args.comment.content,
        },
        {
          new: true,
        },
      );
      await Advertisement.findOneAndUpdate(
        {
          comments:
            {
              $elemMatch:
                {
                  comment:
                    {
                      _id: cmt._id,
                    },
                },
            },
        },
        {
          $set:
          {
            'comments.$.content': cmt.content,
          },
        },
      );
      return cmt;
    },
    deleteComment: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const cmt = await Comment.findByIdAndDelete(args._id);
      return cmt;
    },
  },
};

export default commentMutation;
