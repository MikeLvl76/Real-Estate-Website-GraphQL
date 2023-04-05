/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */

import { unlinkSync, readdirSync } from 'fs';
import * as fs from 'fs-extra';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import Advertisement from '../../advertisement/advertisementModel.js';
import Account from '../../account/accountModel.js';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`mongodb://${process.env.DBTEST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch((err) => console.log('CONNECT', err))
    .finally(console.log('Test database connected !'));

  await fs.copy(`pictures`, `pictures_test`)
  .then(() => console.log('success!'))
  .catch(err => console.error(err));
});

afterEach(async () => {
  await Advertisement.deleteMany();
  await Account.deleteMany();

  readdirSync('pictures_test').forEach(f => unlinkSync(`pictures_test/${f}`));
  await fs.copy(`pictures`, `pictures_test`)
  .then(() => console.log('success!'))
  .catch(err => console.error(err));
});

afterAll(async () => {
  await mongoose.connection.close();
  readdirSync('pictures_test').forEach(f => unlinkSync(`pictures_test/${f}`));
});

describe('Testing advertisement', () => {
  test('Mutation createAdvertisement should return an error if not authenticated', async () => {
    const query = await request(app).post('/graphql').send({
      query: `
          mutation {
            createAdvertisement(
                ad: {
                    title: "Title"
                    type: RENTAL
                    publication_status: NOT_PUBLISHED
                    publication_property: RENTED
                    description: "Description"
                    price: 1000000000
                    date: "01-01-1900"
                }
            ) {
                title
            }
          }
        `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data).toBe(null);
  });
  test('Mutation createAdvertisement should return an advertisement', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Ad',
      lastname: 'Ad',
      username: 'Ad',
      email: 'ad@ad.fr',
      password: await bcrypt.hash('Ad', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Ad"
            )
          }
        `,
    });
    const token = jwt.sign({ _id: a._id }, process.env.JWT_SECRET);
    expect(response.body.data.signIn).toBe(token);
    const query = await request(app).post('/graphql').send({
      query: `
          mutation {
            createAdvertisement(
                ad: {
                    title: "Title"
                    type: RENTAL
                    publication_status: NOT_PUBLISHED
                    publication_property: RENTED
                    description: "Description"
                    price: 1000000000
                    date: "01-01-1900"
                }
            ) {
                title
            }
          }
        `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.createAdvertisement.title).toBe('Title');
  });
  test('Mutation updateAdvertisement should return an error if not authenticated', async () => {
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
      pictures: ['./pictures_test/house.png']
    });
    const query = await request(app).post('/graphql').send({
      query: `
          mutation {
            updateAdvertisement(
                _id: "${ad._id}",
                ad: {
                  title: "Update",
                }
            ) {
                title
            }
          }
        `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data).toBe(null);
  });
  test('Mutation updateAdvertisement should update an advertisement', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Ad',
      lastname: 'Ad',
      username: 'Ad',
      email: 'ad@ad.fr',
      password: await bcrypt.hash('Ad', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Ad"
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
      pictures: ['./pictures_test/ElyseePalace.jpeg', './pictures_test/house.png']
    });
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
            updateAdvertisement(
                _id: "${ad._id}",
                ad: {
                    title: "Update",
                    pictures: ["./pictures_test/ElyseePalace.jpeg"]
                }
            ) {
                title
            }
        }
        `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.updateAdvertisement.title).toBe('Update');
  });
  test('Mutation updateAdvertisement should update an advertisement without updating image', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Ad',
      lastname: 'Ad',
      username: 'Ad',
      email: 'ad@ad.fr',
      password: await bcrypt.hash('Ad', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Ad"
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
            updateAdvertisement(
                _id: "${ad._id}",
                ad: {
                    title: "Update",
                }
            ) {
                title
            }
        }
        `,
    }).set('Authorization', `${token}`);
    expect(query.body.data.updateAdvertisement.title).toBe('Update');
  });
  test('Mutation deleteAdvertisement should return an error if not authenticated', async () => {
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
            deleteAdvertisement(
                _id: "${ad._id}"
            ) {
                title
            }
          }
        `,
    });
    expect(query.body.errors[0].message).toBe("Account not authenticated or doesn't have permissions");
    expect(query.body.data).toBe(null);
  });
  test('Mutation deleteAdvertisement should delete an advertisement', async () => {
    const a = await Account.create({
      admin: true,
      firstname: 'Ad',
      lastname: 'Ad',
      username: 'Ad',
      email: 'ad@ad.fr',
      password: await bcrypt.hash('Ad', 10),
    });
    const response = await request(app).post('/graphql').send({
      query: `
          query {
            signIn(
              username: "${a.username}",
              password: "Ad"
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
      pictures: ['./pictures_test/house.png']
    });
    const query = await request(app).post('/graphql').send({
      query: `
        mutation {
            deleteAdvertisement(
                _id: "${ad._id}",
            ) {
                title
            }
        }
        `,
    }).set('Authorization', `${token}`);
    console.log(query.body)
    expect(query.body.data.deleteAdvertisement.title).toBe('Title');
  });
});
