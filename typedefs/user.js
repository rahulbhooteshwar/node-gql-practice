import { gql } from 'apollo-server-express';

export default gql`
  scalar DateTime
  type Query{
    profile:User!,
    publicProfile(username: String!): User!
    allUsers: [User!]
  }
  type UserCreateResponse {
    username: String!
    email: String!
  }
  type User {
    _id: ID!,
    username: String
    name: String
    email: String
    images: [Image!]
    about: String
    createdAt: DateTime
    updatedAt: DateTime
  }
  type Image {
    url: String!
    public_id: String!
  }
  input ImageInput {
    url: String!
    public_id: String!
  }
  input UserUpdateInput {
    username: String
    name: String
    about: String
    images: [ImageInput!]
  }
  type Mutation {
    userCreate: UserCreateResponse!
    userUpdate(input: UserUpdateInput!): User!
  }
`;