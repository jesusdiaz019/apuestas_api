var unirest = require("unirest");
const express = require('express');
const cors = require('cors');
const router = express.Router();
const dotenv = require( "dotenv" );
const config = require('../config');
const sql = require('mssql');
dotenv.config();

const {API_FOOTBALL_LEAGUE, API_KEY, API_HOST} = process.env;

router.get('/save', cors(), async (req, res) => {

    try {
        var api_req = await unirest("GET", API_FOOTBALL_LEAGUE);
        var pais = req.query.pais;
        var temporada = req.query.temporada;
        var estado = req.query.estado;

        api_req.query({
            "country": pais,
            "season": temporada,
            "current": estado
        });
        api_req.headers({
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": API_HOST,
            "useQueryString": true
        });
        api_req.end(function (api_res) {
            if (api_res.error){
                res.json(api_res.error);
            }else{
                try {
                    let pool = await sql.connect(config);
                    let result = await pool.request()
                        .input('PaisLiga', sql.VarChar(20), api_res.body.response[0].country.name)
                        .input('Ligas', sql.VarChar(MAX), api_res.body.response)
                        .execute('GuardarPaisLiga');
                    res.json(result.recordsets);
                } catch (error) {
                    res.json(error);
                }
            }
        });
        
    } catch (error) {
        console.log(error);
    }

});

router.get('/list', cors(), async (req, res) => {

    try {
        
        let pool = await sql.connect(config);
        let result = await pool.request().execute('ListarLiga');
        res.json(result.recordsets[0]);   
        
    } catch (error) {
        console.log(error);
    }

});

module.exports = router;