const API_URL = "https://SEU-PROJETO.onrender.com";

async function cadastrar(){

const cliente = {

nome: document.getElementById("nome").value,
telefone: document.getElementById("telefone").value,
email: document.getElementById("email").value,
servico: document.getElementById("servico").value

};

const resposta = await fetch(`${API_URL}/api/clientes`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(cliente)

});

const dados = await resposta.json();

if(dados.sucesso){

document.getElementById("msg").innerHTML =
"Cliente cadastrado com sucesso!";

}

}