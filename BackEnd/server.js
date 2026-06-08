const express = require("express");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const cors = require("cors");

app.get("/", (req,res)=>{
 res.json({status:"online"});
});

app.post("/api/clientes", async (req, res) => {
 try{
  const { nome, telefone, email, servico } = req.body;

  const result = await db.query(
   `INSERT INTO clientes(nome, telefone, email, servico)
    VALUES ($1,$2,$3,$4)
    RETURNING id`,
   [nome, telefone, email, servico]
  );

  res.json({sucesso:true,id:result.rows[0].id});
 }catch(err){
  res.status(500).json({erro:err.message});
 }
});

app.get("/api/clientes", async (req,res)=>{
 try{
  const rows = await db.query(
   "SELECT * FROM clientes ORDER BY id DESC"
  );
  res.json(rows.rows);
 }catch(err){
  res.status(500).json({erro:err.message});
 }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Servidor rodando"));

