/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Account from './accountModel.js';

const accountMutation = {
  Mutation: {
    createAccount: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const search = await Account.findOne({ username: args.account.username });
      if (search) {
        throw new Error('Account already exists!');
      }
      const hashed = await bcrypt.hash(args.account.password, 10);
      const account = await Account.create({
        admin: args.account.admin,
        firstname: args.account.firstname,
        lastname: args.account.lastname,
        username: args.account.username,
        email: args.account.email,
        password: hashed,
      });
      return account;
    },
    updateAccount: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const account = await Account.findByIdAndUpdate(
        args._id,
        {
          admin: args.account.admin,
          firstname: args.account.firstname,
          lastname: args.account.lastname,
          username: args.account.username,
          email: args.account.email,
        },
        {
          new: true,
        },
      );
      return account;
    },
    deleteAccount: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const account = await Account.findByIdAndDelete(args._id);
      return account;
    },
    signUp: async (parent, {
      firstname, lastname, username, email, password,
    }) => {
      const hashed = await bcrypt.hash(password, 10);
      const account = await Account.create({
        admin: false,
        firstname,
        lastname,
        username,
        email,
        password: hashed,
      });
      return account;
    },
  },
};

export default accountMutation;
