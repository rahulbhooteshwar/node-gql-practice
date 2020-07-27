import { authCheck } from "../helpers/auth"
import User from '../models/user.model'
import shortid from 'shortid'
import { DateTimeResolver } from 'graphql-scalars';

const profile = async (_parent, _args, { req }) => {
  const currentUser = await authCheck(req);
  const user = await User.findOne({ email: currentUser.email });
  return user;
}
const publicProfile = async (_parent, {username}) => {
  const user = await User.findOne({ username: username });
  return user;
}
const userCreate = async (_parent, _args, {req}) => {
  const currentUser = await authCheck(req);
  const user = await User.findOne({ email: currentUser.email });
  return user ? user : await new User({email: currentUser.email, username: shortid.generate()}).save()
}
const userUpdate = async (_parent, {input}, { req }) => {
  const currentUser = await authCheck(req);
  const updatedUser = await User.findOneAndUpdate({ email: currentUser.email }, { ...input }, { new: true }).exec()
  return updatedUser;
}
const allUsers = async () => {
  return await User.find({});
}
export default {
  Query: {
    profile,
    publicProfile,
    allUsers
  },
  Mutation: {
    userCreate,
    userUpdate
  }
}