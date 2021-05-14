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
        var api_req = unirest("GET", API_FOOTBALL_LEAGUE);
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
                var data_length = api_res.body.response.length;
                for (i=0;i<data_length;i++){
                    registrarLista(api_res.body.response[i]);
                }
                res.json(api_res.body.response);
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

async function registrarLista(data){
    try {
        var liga_id = parseInt(data.league.id);
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('CodigoLiga', sql.Int, liga_id)
            .input('Liga', sql.VarChar(35), data.league.name)
            .input('TipoLiga', sql.VarChar(15), data.league.type)
            .input('Logo', sql.VarChar(60), data.league.logo)
            .input('Pais', sql.VarChar(15), data.country.name)
            .input('FechaInicio', sql.Date, data.seasons[0].start)
            .input('FechaFin', sql.Date, data.seasons[0].end)
            .input('Estado', sql.Bit, data.seasons[0].current)
            .execute('GuardarLiga');
    } catch (error) {
        console.log(error);
    }
}

module.exports = router;