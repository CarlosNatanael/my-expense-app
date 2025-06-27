// Importa as bibliotecas necessárias
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para criptografar senhas
const jwt = require('jsonwebtoken'); // Para gerar tokens de autenticação
require('dotenv').config(); // Para carregar variáveis de ambiente

// --- CONFIGURAÇÃO INICIAL ---
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O BANCO DE DADOS MYSQL ---
// É ALTAMENTE RECOMENDADO colocar estas informações em um arquivo .env
const sequelize = new Sequelize(
  process.env.DB_NAME || 'u130885409_carlinhos',
  process.env.DB_USER || 'u130885409_carlinhos',
  process.env.DB_PASS || 'ELGINnota10',
  {
    host: process.env.DB_HOST || 'srv1845.hstgr.io',
    dialect: 'mysql'
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao banco de dados MySQL.'))
  .catch(err => console.error('❌ Erro ao conectar ao banco de dados:', err));


// --- DEFINIÇÃO DOS MODELS ---
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
});

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  frequency: { type: DataTypes.ENUM('once', 'monthly', 'installment'), allowNull: false },
});

// --- RELAÇÕES ---
User.hasMany(Transaction);
Transaction.belongsTo(User);

// --- ROTAS DA API ---

// ROTA DE CADASTRO DE USUÁRIO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({ email, password: hashedPassword, fullName });
    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser.id });
  } catch (error) {
    // Verifica se o erro é de e-mail duplicado
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

// ROTA DE LOGIN DE USUÁRIO
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Compara a senha enviada com a senha criptografada no banco
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        // Gera um token de autenticação
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || '%XPn$yG?wXqa',
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login bem-sucedido!',
            token,
            user: { id: user.id, email: user.email, fullName: user.fullName }
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
    }
});


// --- INICIAR O SERVIDOR ---
app.listen(PORT, async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('🔄 Tabelas sincronizadas com o banco de dados.');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar tabelas:', error);
  }
});