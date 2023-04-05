/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import Advertisement from '../../advertisement/advertisementModel.js';

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
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Testing advertisement', () => {
  test('Query getAds should return empty array if no ads exist', async () => {
    const query = await request(app).post('/graphql').send({
      query: `
          query {
            getAds {
                title
            }
          }
        `,
    });
    expect(query.body.data.getAds).toStrictEqual([]);
  });
  test('Query getOneAd should return first ad', async () => {
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
          query {
            getOneAd {
                title
            }
          }
        `,
    });
    expect(query.body.data.getOneAd.title).toBe(ad.title);
  });
  test('Query getOneAd should return one ad', async () => {
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
          query {
            getOneAd(
                title: "${ad.title}",
                type: "${ad.type}",
                publication_status: "${ad.publication_status}",
                publication_property: "${ad.publication_property}",
                price: ${ad.price},
            ) {
                title
            }
          }
        `,
    });
    expect(query.body.data.getOneAd.title).toBe(ad.title);
  });
  test('Query getManyAds should return array of ads but without filter', async () => {
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
    });
    const ad2 = await Advertisement.create({
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
          query {
            getManyAds {
                title
            }
          }
        `,
    });
    expect(query.body.data.getManyAds).toStrictEqual([
      { title: ad.title },
      { title: ad2.title },
    ]);
  });
  test('Query getManyAds should return array of ads', async () => {
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
    });
    const ad2 = await Advertisement.create({
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
          query {
            getManyAds(
                title: "${ad.title}",
                type: "${ad.type}",
                publication_status: "${ad.publication_status}",
                publication_property: "${ad.publication_property}",
                price: ${ad.price},
            ) {
                title
            }
          }
        `,
    });
    expect(query.body.data.getManyAds).toStrictEqual([
      { title: ad.title },
      { title: ad2.title },
    ]);
  });
  test('Query getPublishedAds should return array of published ads', async () => {
    const ad = await Advertisement.create({
      title: 'Title',
      type: 'Vente',
      publication_status: 'Publiée',
      publication_property: 'Vendu',
      description: 'Description',
      price: 1000000000,
      date: '01-01-1900',
    });
    const ad2 = await Advertisement.create({
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
          query {
            getPublishedAds {
                title
            }
          }
        `,
    });
    expect(query.body.data.getPublishedAds).toStrictEqual([
      { title: ad.title },
      { title: ad2.title },
    ]);
  });
});
