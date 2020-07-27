import { authCheck } from '../helpers/auth';
import Post from '../models/post.model';
import User from '../models/user.model';
import { PubSub } from 'apollo-server-express';

const allPosts = async (_parent, { page, pageSize }) => {
  page = page || 1
  pageSize = pageSize || 10
  const posts = await Post.find({})
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate({ path: 'postedBy', select: 'name username' })
  return posts
};
const postsByCurrentUser = async (_parent, { page, pageSize }, { req }) => {
  page = page || 1
  pageSize = pageSize || 10
  const currentUser = await authCheck(req)
  const user = await User.findOne({ email: currentUser.email }).exec();
  const posts = await Post.find({ postedBy: user._id })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate({ path: 'postedBy', select: 'name username' })
  return posts
};
const postCreate = async (_parent, { input }, { req, pubsub }) => {
  const currentUser = await authCheck(req)
  const user = await User.findOne({ email: currentUser.email }).exec();
  const newPost = await new Post({
    ...input,
    postedBy: user._id
  }).save()
  await newPost.populate({ path: 'postedBy', select: 'name username' }).execPopulate()
  pubsub.publish('POST_ADDED', { postAdded: newPost })
  return newPost
}
const postUpdate = async (_parent, { _id, input }, { req }) => {
  const currentUser = await authCheck(req)
  const user = await User.findOne({ email: currentUser.email }).exec();
  try {
    if (!input.image) {
      input.image = { url: "https://via.placeholder.com/300x200?text=Post", public_id: new Date().getTime() }
    }
    const updatedPost = await Post.findOneAndUpdate({ _id: _id, postedBy: user._id }, { ...input }, { new: true }).exec()
    await updatedPost.populate({ path: 'postedBy', select: '_id username name' }).execPopulate()
    return updatedPost;
  } catch (_error) {
    throw new Error("Post doesn't exist or you are not authorized to delete it!")
  }
}
const postDelete = async (_parent, { _id }, { req }) => {
  const currentUser = await authCheck(req)
  const user = await User.findOne({ email: currentUser.email }).exec();
  const post = await Post.findOne({ _id: _id, postedBy: user._id }).exec();
  if (!post) throw new Error("Post doesn't exist or you are not authorized to delete it!")
  const deletedPost = await post.deleteOne()
  return deletedPost
}

const singlePost = async (_parent, { _id }, { req }) => {
  const post = await Post.findOne({ _id: _id }).exec();
  if (!post) throw new Error("Post doesn't exist!")
  await post.populate({ path: 'postedBy', select: '_id username name' }).execPopulate()
  return post
}
const totalPosts = async () => {
  const count = await Post.countDocuments({})
  return count
}
const totalPostsByUser = async (_parent, _args, { req }) => {
  const currentUser = await authCheck(req)
  const user = await User.findOne({ email: currentUser.email }).exec();
  const count = await Post.countDocuments({ postedBy: user._id });
  return count
}
const searchPosts = async (_parent, { keyword }) => {
  const posts = await Post.find({ $text: { $search: keyword } })
    .sort({ createdAt: -1 })
    .populate({ path: 'postedBy', select: 'name username' })
  return posts
}
export default {
  Query: {
    allPosts,
    postsByCurrentUser,
    singlePost,
    totalPosts,
    totalPostsByUser,
    searchPosts
  },
  Mutation: {
    postCreate,
    postDelete,
    postUpdate
  },
  Subscription: {
    postAdded: {
      subscribe: (_parent, _args, {pubsub}) => pubsub.asyncIterator(['POST_ADDED'])
    }
  }

}