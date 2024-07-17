import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import { PublicAShort, getShortById, updateShort, deleteShort, getAllShort } from '../controllers/short.controller.js';

const router = Router();
router.use(verifyJWT); 

router
    .route("/")
    .get(getAllShort)
    .post(
        upload.fields([
            {
                name: "shortFile",
                maxCount: 1,
            },

        ]),
        PublicAShort
);
router
    .route("/:videoId")
    .get(getShortById)
    .delete(deleteShort)
    .patch(updateShort);



export default router
