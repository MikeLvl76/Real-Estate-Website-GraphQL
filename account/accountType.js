const accountType = `
  scalar ObjectID

  type Account {
    _id: ObjectID!
    admin: Boolean!
    firstname: String!
    lastname: String!
    username: String!
    email: String!
    password: String!
  }

  type Query {
    signIn(username: String!, password: String!): String!
    getAccount(_id: ObjectID, username: String, email: String): Account
    getAllAccounts: [Account]
  }

  input AccountInput {
    admin: Boolean!
    firstname: String!
    lastname: String!
    username: String!
    email: String!
    password: String!
  }

  input EditAccountInput {
    admin: Boolean
    firstname: String
    lastname: String
    username: String
    email: String
  }

  type Mutation {
    signUp(firstname: String!, lastname: String!, username: String!, email: String!, password: String!): Account!
    createAccount(account: AccountInput): Account!
    updateAccount(_id: ObjectID!, account: EditAccountInput!): Account!
    deleteAccount(_id: ObjectID!): Account!
  }
`;

export default accountType;
