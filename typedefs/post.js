import { gql } from 'apollo-server-express';
export default gql`
type Post {
  _id: ID!
  title: String!
  content: String!
  image: Image
  postedBy: User
}
input PostCreateUpdateInput {
  title: String!
  content: String!
  image: ImageInput
}
# queries
type Query{
  totalPosts: Int!
  totalPostsByUser: Int!
  allPosts(page: Int, pageSize: Int): [Post!]!
  postsByCurrentUser(page: Int, pageSize: Int):  [Post!]!
  singlePost(_id: String!): Post!
  searchPosts(keyword: String!): [Post!]!
}
# mutations
type Mutation {
  postCreate(input: PostCreateUpdateInput!): Post!
  postDelete(_id: String!): Post!
  postUpdate(_id:String!, input: PostCreateUpdateInput!): Post!
}
# subscriptions
type Subscription {
  postAdded: Post!
}
`;