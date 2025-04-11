import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { uploaderDocs } from '../utils/uploader.js';
const router = Router();

router.get('/',usersController.getAllUsers);

router.get('/:uid',usersController.getUser);
router.put('/:uid',usersController.updateUser);
router.delete('/:uid',usersController.deleteUser);
router.post('/:uid/documents', uploaderDocs.single('doc'), usersController.uploadDocument);


export default router;