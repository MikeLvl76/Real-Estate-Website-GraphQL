/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Account from './accountModel.js';

const accountQuery = {
  Query: {
    signIn: async (parent, { username, password }) => {
      const account = await Account.findOne({ username });
      if (!account) throw new Error('This account doesn\'t exist!');
      const valid = await bcrypt.compare(password, account.password);
      if (!valid) throw new Error('The password is incorrect!');
      return jwt.sign({ _id: account._id }, process.env.JWT_SECRET);
    },
    getAccount: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      /* Filters unused args */
      const filter = () => {
        const fields = {};
        if (args._id) Object.assign(fields, { _id: args._id });
        if (args.username) Object.assign(fields, { username: args.username });
        if (args.email) Object.assign(fields, { email: args.email });
        return fields;
      };
      const account = await Account.findOne(filter());
      return account;
    },
    getAllAccounts: async (root, args, context, { rootValue }) => {
      const authenticated = rootValue.isAuthenticated(context);
      const admin = await rootValue.isAdmin(context);
      if (!authenticated || !admin) throw new Error('Account not authenticated or doesn\'t have permissions');
      const users = await Account.find({});
      return users;
    },
  },
};

export default accountQuery;
