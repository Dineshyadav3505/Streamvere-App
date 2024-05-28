import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleShortLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT); 


router.post('/video/:videoId', toggleVideoLike);
router.post('/short/:shortId', toggleShortLike);
router.post('/comment/:commentId', toggleCommentLike);
router.post('/tweet/:tweetId', toggleTweetLike);
router.get('/videos', getLikedVideos);


export default router 