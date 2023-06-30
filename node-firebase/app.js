const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./nodef-a90c5-firebase-adminsdk-in7wz-c0926fca73.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", function(req, res){
    var result = db.collection('agendamentos').get().then((snapShot)=>{
        const doc = [];
        snapShot.forEach((docs)=>{
            doc.push({id: docs.id});
            doc.push(docs.data());
        })
        res.render("consulta", {doc})
        console.log(doc)
    }).catch((error)=>{
        console.log(error);
    })
})


app.get("/editar/:id", function(req, res){
    const id = req.params.id
    const doc = db.collection('agendamentos').doc(`${id}`).get()
    const post = []
    try {
        post.push(id)
        post.push(doc.data())
        console.log(post)
        res.redirect('editar',{post})
    }catch (error){
        console.log(error)
    }
})

app.get("/excluir/:id", function(req, res){
    const id = req.body.id;
    var result = db.collection('agendamentos').doc(`${id}`).delete().then(()=>{
        res.redirect("/")
    }).catch((error)=>{
        console.log(error)
    });
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
    var result = db.collection('agendamentos').doc(req.body.id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('updated document')
        res.redirect('/')
    })
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})