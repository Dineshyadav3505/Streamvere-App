import { Router } from "express";
import { addComment, addCommentOnShort, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT); 


router.get('/:videoId', getVideoComments);
router.post('/:videoId', addComment);
router.post('/short/:shortId', addCommentOnShort);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);


export default router 