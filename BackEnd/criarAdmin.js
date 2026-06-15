const bcrypt = require("bcrypt");
const db = require("./db");

async function criarAdmin() {

    try {

        const usuario = "bruno";
        const senha = "Apex@2026";

        const senhaHash = await bcrypt.hash(
            senha,
            10
        );

        await db.query(
            `INSERT INTO administradores
            (usuario, senha)
            VALUES ($1, $2)`,
            [usuario, senhaHash]
        );

        console.log("Administrador criado com sucesso!");

    } catch (erro) {

        console.error("ERRO COMPLETO:");
        console.error(erro);

    }

}

criarAdmin();
