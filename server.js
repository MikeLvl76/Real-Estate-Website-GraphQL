/* eslint-disable no-console */
/* eslint-disable import/extensions */

import mongoose from 'mongoose';
import app from './app.js';

mongoose.connect(`mongodb://${process.env.DBNAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((err) => console.log('CONNECT', err))
  .finally(console.log('Database connected !'));

app.listen(process.env.PORT, () => console.log(`Now browsing to http://localhost:${process.env.PORT}/graphql`));
