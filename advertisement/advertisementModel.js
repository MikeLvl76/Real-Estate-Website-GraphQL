/* eslint-disable import/extensions */

import mongoose from 'mongoose';
import Comment from '../comment/commentModel.js';

const { Schema } = mongoose;

const Advertisement = new Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  publication_status: {
    type: String,
    required: true,
  },
  publication_property: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  pictures: [String],
  comments: [Comment.schema],
});

export default mongoose.model('Advertisement', Advertisement);
