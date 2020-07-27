import express from 'express';
import { ApolloServer, PubSub } from 'apollo-server-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { authCheckMiddleware } from './helpers/auth';
import cors from 'cors';
import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import http from 'http';
const pubsub = new PubSub();

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLUDINARY_CLOUD_NAME,
  api_key: process.env.CLUDINARY_API_KEY,
  api_secret: process.env.CLUDINARY_API_SECRET
});
const db = async () => {
  try {
    const success = mongoose.connect(process.env.DB_URL, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    console.log('DB Connected')
  } catch (err) {
    console.error(err);
  }
}
db();

const app = express();
// we don't need http specifically but to integrate apollo with subscriptions & express will need it
const httpServer = http.createServer(app);
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// typeDefs
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, '/typedefs')));
// resolvers
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, '/resolvers')));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub })
});
server.applyMiddleware({ app });
server.installSubscriptionHandlers(httpServer);


app.post('/uploadImages', authCheckMiddleware, async (req, res) => {
  await cloudinary.uploader.upload(req.body.image, result => {
    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  }, {
    public_id: `${Date.now()}`,
    resource_type: 'auto'
  })
})

app.post('/removeImage', authCheckMiddleware, (req, res) => {
  const image_id = req.body.public_id;
  cloudinary.uploader.destroy(image_id, (response) => {
    if (response.result === 'ok')
      return res.status(200).json({ success: true })
    else
    return res.status(200).json({ success: false, error: {message: response.result} })
  })
})

httpServer.listen(process.env.PORT, () => {
  console.log('Rest server started at: ', `http://localhost:${process.env.PORT}/`);
  console.log('GQL server started at: ', `http://localhost:${process.env.PORT}/graphql`)
})