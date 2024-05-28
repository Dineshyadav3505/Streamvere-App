import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlish.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT); 

router.post('/:userId', createPlaylist);
router.get('/:userId', getUserPlaylists);
router.get('/:playlistId', getPlaylistById);
router.post('/:playlistId/videos/:videoId', addVideoToPlaylist);
router.delete('/:playlistId/videos/:videoId', removeVideoFromPlaylist);
router.delete('/:playlistId', deletePlaylist);
router.put('/:playlistId', updatePlaylist);


export default router 