const express = require('express');
const app = express();
const router = express.Router();
const { verifySimplesAuth, revokeToken } = require('./authMiddleware');
// Rota para fazer logout e revogar o token
router.post('/', verifySimplesAuth, (req, res) => {
    const token = req.query.token;

    // Revoga o token atual adicionando-o à lista de tokens inválidos
    revokeToken(token);

    res.json({ message: 'Logout bem-sucedido' });
});

module.exports = router;