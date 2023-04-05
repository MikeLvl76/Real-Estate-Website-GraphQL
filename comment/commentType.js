const commentType = `
  scalar Date
  
  type Comment {
    _id: ObjectID!
    author: String!
    content: String!
    date: Date!
  }

  input CommentInput {
    author: String!
    content: String!
    date: Date!
  }

  input EditCommentInput {
    content: String!
  }

  type Query {
    getAllComments: [Comment]
    getAdComments(ad_id: ObjectID!): [Comment]
    getOneComment(_id: ObjectID, author: String, date: Date): Comment
    getManyComments(author: String, date: Date): [Comment]
  }

  type Mutation {
    createComment(ad_id: ObjectID!, comment: CommentInput!): Comment!
    updateComment(_id: ObjectID!, comment: EditCommentInput!): Comment!
    deleteComment(_id: ObjectID): Comment!
  }
`;

export default commentType;
