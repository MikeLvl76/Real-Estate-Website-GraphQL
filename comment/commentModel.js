import mongoose from 'mongoose';

const { Schema } = mongoose;

const Comments = new Schema({
  author: {
    type: String,
  },
  content: {
    type: String,
  },
  date: {
    type: String,
  },
});

export default mongoose.model('Comments', Comments);
