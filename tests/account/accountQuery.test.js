/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */

import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import Account from '../../account/accountModel.js';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`mongodb://${process.env.DBTEST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch((err) => console.log('CONNECT', err))
    .finally(console.log('Test database connected !'));
});

afterEach(async () => {
  await Account.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Testing account', () => {
  test('Query signIn should return an error if no account exist', async () => {
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "Test",
            password: "Test"
          )
        }
      `,
    });
    expect(response.body.errors[0].message).toBe('This account doesn\'t exist!');
    expect(response.body.data).toBe(null);
  });
  test('Query signIn should return an error if the password doesn\'t match', async () => {
    const a = await Account.create({
      admin: false,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "${a.username}",
            password: "No"
          )
        }
      `,
    });
    expect(response.body.errors[0].message).toBe('The password is incorrect!');
    expect(response.body.data).toBe(null);
  });
  test('Query signIn should return the JWT token if account exist', async () => {
    const a = await Account.create({
      admin: false,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "${a.username}",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: `${a._id}` }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
  });
  test('Query getAccount should return an error if not authenticated', async () => {
    const a = await Account.create({
      admin: false,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          getAccount(_id: "${a._id}", username: "${a.username}", email: "${a.email}") {
            _id
          }
        }
      `,
    });
    expect(response.body.errors[0].message).toBe('Account not authenticated or doesn\'t have permissions');
    expect(response.body.data.getAccount).toBe(null);
  });
  test('Query getAccount should return an error if not admin', async () => {
    const a = await Account.create({
      admin: false,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "${a.username}",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: `${a._id}` }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        query {
          getAccount(_id: "${a._id}", username: "${a.username}", email: "${a.email}") {
            _id
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.errors[0].message).toBe('Account not authenticated or doesn\'t have permissions');
    expect(query.body.data.getAccount).toBe(null);
  });
  test('Query getAccount should return the account', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "${a.username}",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: `${a._id}` }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        query {
          getAccount(_id: "${a._id}", username: "${a.username}", email: "${a.email}") {
            username,
            email
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getAccount.username).toBe(a.username);
    expect(query.body.data.getAccount.email).toBe(a.email);
  });
  test('Query getAccount should return the first account', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "${a.username}",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: `${a._id}` }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        query {
          getAccount {
            username,
            email
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getAccount.username).toBe(a.username);
    expect(query.body.data.getAccount.email).toBe(a.email);
  });
  test('Query getAllAccounts should return an error if not authentificated', async () => {
    const query = await request(app).post('/graphql').send({
      query: `
        query {
          getAllAccounts {
            _id
          }
        }
      `,
    });
    expect(query.body.errors[0].message).toBe('Account not authenticated or doesn\'t have permissions');
    expect(query.body.data.getAllAccounts).toBe(null);
  });
  test('Query getAllAccounts should return all users', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const a2 = await Account.create({
      admin: false,
      firstname: 'Test2',
      lastname: 'Test2',
      username: 'Test2',
      email: 'test2@test.fr',
      password: await bcrypt.hash('Test2', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
        query {
          signIn(
            username: "${a.username}",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: `${a._id}` }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        query {
          getAllAccounts {
            username
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getAllAccounts).toStrictEqual([
      {
        username: a.username,
      },
      {
        username: a2.username,
      },
    ]);
  });
});
