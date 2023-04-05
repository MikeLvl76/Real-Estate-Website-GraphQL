/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */

import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import jwt from 'jsonwebtoken';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as dotenv from 'dotenv';
import commentType from './comment/commentType.js';
import accountType from './account/accountType.js';
import { advertisementType, advertisementTypeEnum } from './advertisement/advertisementType.js';
import accountMutation from './account/accountMutation.js';
import accountQuery from './account/accountQuery.js';
import advertisementQuery from './advertisement/advertisementQuery.js';
import commentQuery from './comment/commentQuery.js';
import commentMutation from './comment/commentMutation.js';
import advertisementMutation from './advertisement/advertisementMutation.js';
import Account from './account/accountModel.js';

dotenv.config();

const schema = makeExecutableSchema({
  typeDefs: [
    accountType,
    advertisementType,
    commentType],
  resolvers: [
    accountQuery,
    accountMutation,
    advertisementTypeEnum,
    advertisementQuery,
    advertisementMutation,
    commentQuery,
    commentMutation],
});

const app = express();
const value = {
  isAuthenticated: (req) => {
    if (!req?.headers?.authorization) return false;
    const token = req.headers.authorization;
    jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1w' });
    return true;
  },
  isAdmin: async (req) => {
    if (!req?.headers?.authorization) return false;
    const token = req.headers.authorization;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const account = await Account.findById(user._id);
    return account.admin;
  },
};

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: { headerEditorEnabled: true },
  rootValue: value,
}));

export default app;
