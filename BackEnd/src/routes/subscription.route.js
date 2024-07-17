import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()
router.use(verifyJWT); 

router.post('/toggleSubscription/:channelId', toggleSubscription);

// Route to get subscribers of a channel
router.get('/channelSubscribers/:channelId', getUserChannelSubscribers);

// Route to get subscribed channels of a user
router.get('/subscribedChannels/:subscriberId', getSubscribedChannels);


export default router 