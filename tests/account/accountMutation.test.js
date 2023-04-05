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
  test('Mutation createAccount should return an error if not authenticated', async () => {
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          createAccount(
            account: {
              admin: false,
              firstname: "Test2",
              lastname: "Test2",
              username: "Test2",
              email: "test2@test.fr",
              password: "Test2"
            }
          ) {
            username
          }
        }
      `,
    });
    expect(query.body.errors[0].message).toBe('Account not authenticated or doesn\'t have permissions');
    expect(query.body.data).toBe(null);
  });
  test('Mutation createAccount should return an error if the account already exist', async () => {
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
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          createAccount(
            account: {
              admin: false,
              firstname: "Test",
              lastname: "Test",
              username: "Test",
              email: "test@test.fr",
              password: "Test"
            }
          ) {
            username
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.errors[0].message).toBe('Account already exists!');
    expect(query.body.data).toBe(null);
  });
  test('Mutation createAccount should return an error if account doesn\'t have permissions', async () => {
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
            username: "Test",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          createAccount(
            account: {
              admin: false,
              firstname: "Test2",
              lastname: "Test2",
              username: "Test2",
              email: "test2@test.fr",
              password: "Test2"
            }
          ) {
            username
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data).toBe(null);
  });
  test('Mutation createAccount should create an account', async () => {
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
            username: "Test",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          createAccount(
            account: {
              admin: false,
              firstname: "Test2",
              lastname: "Test2",
              username: "Test2",
              email: "test2@test.fr",
              password: "Test2"
            }
          ) {
            username
          }
        }
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.createAccount.username).toBe('Test2');
  });
  test('Mutation updateAccount should return an error if not authenticated', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          updateAccount(_id: "${a._id}",
            account: {
              admin: true,
              firstname: "Test",
              lastname: "Test",
              username: "Test2",
              email: "test@test.fr"
            }
          ) {
            username
          }
        }      
      `,
    });
    expect(query.body.errors[0].message).toBe('Account not authenticated or doesn\'t have permissions');
    expect(query.body.data).toBe(null);
  });
  test('Mutation updateAccount should return an updated username', async () => {
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
            username: "Test",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          updateAccount(_id: "${a._id}",
            account: {
              admin: true,
              firstname: "Test",
              lastname: "Test",
              username: "Test2",
              email: "test@test.fr"
            }
          )
          {
            username
          }
        }`,
    }).set('Authorization', `${token}`);
    expect(query.body.data.updateAccount.username).toBe('Test2');
  });
  test('Mutation deleteAccount should return an error if not authenticated', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Test',
      lastname: 'Test',
      username: 'Test',
      email: 'test@test.fr',
      password: await bcrypt.hash('Test', 10),
    });
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          deleteAccount(_id: "${a._id}")
          {
            username
          }
        }      
      `,
    });
    expect(query.body.errors[0].message).toBe('Account not authenticated or doesn\'t have permissions');
    expect(query.body.data).toBe(null);
  });
  test('Mutation deleteAccount should return the deleted username', async () => {
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
            username: "Test",
            password: "Test"
          )
        }
      `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
          deleteAccount(_id: "${a._id}")
          {
            username
          }
        }      
      `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.deleteAccount.username).toBe('Test');
  });
  test('Mutation signUp should return the created account', async () => {
    const response = await request(app).post('/graphql').send({
      query: `
        mutation {
          signUp(
            firstname: "Test",
            lastname: "Test",
            username: "Test",
            email: "test@test.fr",
            password: "Test"
          ) {
            username
          }
        }
      `,
    });
    expect(response.body.data.signUp.username).toBe('Test');
  });
});
