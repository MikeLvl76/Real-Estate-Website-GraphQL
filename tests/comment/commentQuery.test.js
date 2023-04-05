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
  test('Query getAllComments should return an error if not authenticated', async () => {
    const query = await request(app).post('/graphql').send({
      query: `
            query {
              getAllComments {
                  author
              }
            }
          `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data.getAllComments).toBe(null);
  });
  test('Query getAllComments should return empty array if no comments exist', async () => {
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
    const query = await request(app).post('/graphql').send({
      query: `
          query {
            getAllComments {
                author
            }
          }
        `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getAllComments).toEqual([]);
  });

  test('Query getAdComments should return an error if not authenticated', async () => {
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
      comments: [comment],
    });
    const query = await request(app).post('/graphql').send({
      query: `
            query {
                getAdComments(ad_id: "${ad._id}") {
                  author
              }
            }
          `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data.getAdComments).toBe(null);
  });
  test('Query getAdComments should return empty array if no comments exist', async () => {
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
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
      comments: [comment],
    });
    const query = await request(app).post('/graphql').send({
      query: `
              query {
                  getAdComments(ad_id: "${ad._id}") {
                    author
                }
              }
            `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getAdComments).toStrictEqual([{ author: 'Author' }]);
  });

  test('Query getOneComment should return an error if not authenticated', async () => {
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
            query {
              getOneComment(
                _id: "${comment._id}",
                author: "${comment.author}",
                date: "${comment.date}"
              ) {
                  author
              }
            }
          `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data.getOneComment).toBe(null);
  });
  test('Query getOneComment should return a comment', async () => {
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
              query {
                getOneComment(
                  _id: "${comment._id}",
                  author: "${comment.author}",
                  date: "${comment.date}"
                ) {
                    _id,
                    author,
                    date
                }
              }
            `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getOneComment._id).toBe(comment._id.toString());
    expect(query.body.data.getOneComment.author).toBe(comment.author);
    expect(query.body.data.getOneComment.date).toBe(comment.date);
  });
  test('Query getOneComment without parameters should return a comment', async () => {
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
              query {
                getOneComment
                {
                    _id,
                    author,
                    date
                }
              }
            `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getOneComment._id).toBe(comment._id.toString());
    expect(query.body.data.getOneComment.author).toBe(comment.author);
    expect(query.body.data.getOneComment.date).toBe(comment.date);
  });
  test('Query getManyComments should return an error if not authenticated', async () => {
    const comment = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
            query {
                getManyComments(
                author: "${comment.author}",
                date: "${comment.date}"
              ) {
                  author
              }
            }
          `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data.getManyComments).toBe(null);
  });
  test('Query getManyComments should return many comments', async () => {
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
    const comment2 = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
              query {
                getManyComments(
                  author: "${comment.author}",
                  date: "${comment.date}"
                ) {
                    _id,
                    author,
                    date
                }
              }
            `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getManyComments[0]._id).toBe(comment._id.toString());
    expect(query.body.data.getManyComments[0].author).toBe(comment.author);
    expect(query.body.data.getManyComments[0].date).toBe(comment.date);
    expect(query.body.data.getManyComments[1]._id).toBe(comment2._id.toString());
    expect(query.body.data.getManyComments[1].author).toBe(comment2.author);
    expect(query.body.data.getManyComments[1].date).toBe(comment2.date);
  });
  test('Query getManyComments without parameters should return many comments', async () => {
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
    const comment2 = await Comment.create({
      author: 'Author',
      content: 'Content',
      date: '01-01-1900',
    });
    const query = await request(app).post('/graphql').send({
      query: `
              query {
                getManyComments
                {
                    _id,
                    author,
                    date
                }
              }
            `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.getManyComments[0]._id).toBe(comment._id.toString());
    expect(query.body.data.getManyComments[0].author).toBe(comment.author);
    expect(query.body.data.getManyComments[0].date).toBe(comment.date);
    expect(query.body.data.getManyComments[1]._id).toBe(comment2._id.toString());
    expect(query.body.data.getManyComments[1].author).toBe(comment2.author);
    expect(query.body.data.getManyComments[1].date).toBe(comment2.date);
  });
});
