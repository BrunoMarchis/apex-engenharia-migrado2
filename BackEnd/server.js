require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// ======================================
// ROTA PRINCIPAL
// ======================================

app.get("/", (req, res) => {
    res.json({
        status: "online",
        sistema: "Apex Engenharia"
    });
});

// ======================================
// LOGIN ADMINISTRADOR
// ======================================

app.post("/api/admin/login", async (req, res) => {

    try {

        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Usuário e senha são obrigatórios"
            });
        }

        const result = await db.query(
            "SELECT * FROM administradores WHERE usuario = $1",
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não encontrado"
            });
        }

        const admin = result.rows[0];

        const senhaValida = await bcrypt.compare(
            senha,
            admin.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Senha incorreta"
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                usuario: admin.usuario
            },
            JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.json({
            sucesso: true,
            token,
            usuario: admin.usuario
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            sucesso: false,
            erro: err.message
        });

    }

});

// ======================================
// MIDDLEWARE JWT
// ======================================

function verificarToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token não informado"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Token inválido"
        });

    }

}

// ======================================
// CADASTRO DE CLIENTES
// ======================================

app.post("/api/clientes", async (req, res) => {

    try {

        const {
            nome,
            telefone,
            email,
            servico
        } = req.body;

        const result = await db.query(
            `INSERT INTO clientes
            (nome, telefone, email, servico)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [
                nome,
                telefone,
                email,
                servico
            ]
        );

        res.json({
            sucesso: true,
            mensagem: "Cliente cadastrado com sucesso",
            id: result.rows[0].id
        });

    } catch (err) {

        res.status(500).json({
            sucesso: false,
            erro: err.message
        });

    }

});

// ======================================
// LISTAR CLIENTES
// SOMENTE ADMIN LOGADO
// ======================================

app.get(
    "/api/clientes",
    verificarToken,
    async (req, res) => {

        try {

            const result = await db.query(
                "SELECT * FROM clientes ORDER BY id DESC"
            );

            res.json(result.rows);

        } catch (err) {

            res.status(500).json({
                sucesso: false,
                erro: err.message
            });

        }

    }
);

// ======================================
// DADOS DO ADMIN LOGADO
// ======================================

app.get(
    "/api/admin/me",
    verificarToken,
    async (req, res) => {

        res.json({
            sucesso: true,
            usuario: req.usuario.usuario,
            id: req.usuario.id
        });

    }
);

// ======================================
// INICIAR SERVIDOR
// ======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("APEX ENGENHARIA ONLINE");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("=================================");
    console.log("");

});
