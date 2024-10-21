const express = require('express');
const { register, login, editUser, deleteUser, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/edit', authMiddleware, editUser);
router.delete('/delete', authMiddleware, adminMiddleware, deleteUser); // Agora precisa de um ID no corpo da requisição
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
