/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */

import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import Advertisement from '../../advertisement/advertisementModel.js';
import Account from '../../account/accountModel.js';
import Comment from '../../comment/commentModel.js';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`mongodb://${process.env.DBTEST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch((err) => console.log('CONNECT', err))
    .finally(console.log('Test database connected !'));
});

afterEach(async () => {
  await Advertisement.deleteMany();
  await Account.deleteMany();
  await Comment.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Testing comment', () => {
  test('Mutation createComment should return an error if not authenticated', async () => {
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
          mutation {
            createComment(
                ad_id: "${ad._id}",
                comment: {
                    author: "Author",
                    content: "Content",
                    date: "01-01-1900"
                }
            ) {
                author
            }
          }
        `,
    });
    expect(query.body.errors[0].message).toBe('Account not authenticated');
    expect(query.body.data).toBe(null);
  });
  test('Mutation createComment should return a comment', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Author',
      lastname: 'Author',
      username: 'Author',
      email: 'Author@Author.fr',
      password: await bcrypt.hash('Author', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Author"
            )
          }
        `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
            mutation {
              createComment(
                  ad_id: "${ad._id}",
                  comment: {
                      author: "Author",
                      content: "Content",
                      date: "01-01-1900"
                  }
              ) {
                  author
              }
            }
          `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.createComment.author).toBe('Author');
  });
  test('Mutation updateComment should return an error if not authenticated', async () => {
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
          mutation {
            updateComment(
                _id: "${comment._id}",
                comment: {
                    content: "Update"
                }
            ) {
                content
            }
          }
        `,
    });
    expect(query.body.errors[0].message).toBe('Account not authenticated');
    expect(query.body.data).toBe(null);
  });
  test('Mutation updateComment should update a comment', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Author',
      lastname: 'Author',
      username: 'Author',
      email: 'Author@Author.fr',
      password: await bcrypt.hash('Author', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Author"
            )
          }
        `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
            updateComment(
                _id: "${comment._id}",
                comment: {
                    content: "Update"
                }
            ) {
                content
            }
        }
        `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.updateComment.content).toBe('Update');
  });
  test('Mutation deleteComment should return an error if not authenticated', async () => {
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
          mutation {
            deleteComment(
                _id: "${comment._id}"
            ) {
                author
            }
          }
        `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data).toBe(null);
  });
  test('Mutation deleteAdvertisement should update an advertisement', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Author',
      lastname: 'Author',
      username: 'Author',
      email: 'Author@Author.fr',
      password: await bcrypt.hash('Author', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Author"
            )
          }
        `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
            deleteComment(
                _id: "${comment._id}",
            ) {
                author
            }
        }
        `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.deleteComment.author).toBe('Author');
  });
});
