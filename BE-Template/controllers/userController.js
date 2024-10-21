const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign({ user: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Registro de usuário
exports.register = async (req, res) => {
  const { username, password, email, admin } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const user = await User.create({ username, password, email, admin });
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso',
      token: generateToken(user) 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({ 
        message: 'Login bem-sucedido',
        token: generateToken(user) 
      });
    } else {
      res.status(400).json({ message: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// Editar usuário (apenas usuário autenticado pode editar suas próprias informações)
exports.editUser = async (req, res) => {
  const { username, email, admin } = req.body;
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Somente um administrador pode alterar o status `admin`
    if (typeof admin !== 'undefined' && !user.admin) {
      return res.status(403).json({ message: 'Acesso negado. Somente administradores podem alterar privilégios de administrador.' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    if (user.admin) user.admin = admin; // Se o usuário autenticado for admin, ele pode editar o status `admin`

    await user.save();
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// Apagar usuário (apenas administradores podem deletar usuários)
exports.deleteUser = async (req, res) => {
    const { userId } = req.body; // Recebendo o ID do usuário a ser deletado
    try {
      const adminUser = await User.findById(req.user);
      
      // Verifica se o usuário autenticado é administrador
      if (!adminUser || !adminUser.admin) {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem deletar usuários.' });
      }
  
      // Verifica se o usuário a ser deletado existe
      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      // Exclui o usuário especificado
      await User.findByIdAndDelete(userId);
  
      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
  };

// Listar todos os usuários (opcional - apenas administradores podem ver)
exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user || !user.admin) {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem ver todos os usuários.' });
    }

    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};
