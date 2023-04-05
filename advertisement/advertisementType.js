export const advertisementType = `
  scalar PositiveInt

  enum Type {
    SALE
    RENTAL
  }

  enum PublicationStatus {
    PUBLISHED
    NOT_PUBLISHED
  }

  enum PublicationProperty {
    AVAILABLE
    SOLD
    RENTED
  }
  
  type Advertisement {
    _id: ObjectID!
    title: String!
    type: Type!
    publication_status: PublicationStatus!
    publication_property: PublicationProperty!
    description: String!
    price: PositiveInt!
    date: Date!
    pictures: [String]
    comments: [Comment]
  }

  type Query {
    getAds: [Advertisement]
    getOneAd(title: String, type: String, publication_status: String, publication_property: String, price: PositiveInt): Advertisement
    getManyAds(title: String, type: String, publication_status: String, publication_property: String, price: PositiveInt): [Advertisement]
    getPublishedAds: [Advertisement]
  }

  input AdvertisementInput {
    title: String!
    type: Type!
    publication_status: PublicationStatus!
    publication_property: PublicationProperty!
    description: String!
    price: PositiveInt!
    date: Date!
    pictures: [String]
  }

  input EditAdvertisementInput {
    title: String
    type: Type
    publication_status: PublicationStatus
    publication_property: PublicationProperty
    description: String
    price: PositiveInt
    date: Date
    pictures: [String]
  }


  type Mutation {
    createAdvertisement(ad: AdvertisementInput): Advertisement!
    updateAdvertisement(_id: ObjectID!, ad: EditAdvertisementInput): Advertisement!
    deleteAdvertisement(_id: ObjectID!): Advertisement!
  }
`;

export const advertisementTypeEnum = {
  Type: {
    SALE: 'Vente',
    RENTAL: 'Location',
  },
  PublicationStatus: {
    PUBLISHED: 'Publiée',
    NOT_PUBLISHED: 'Non publiée',
  },
  PublicationProperty: {
    AVAILABLE: 'Disponible',
    SOLD: 'Vendu',
    RENTED: 'Loué',
  },
};
