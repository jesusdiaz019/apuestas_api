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
                var list = {};
                var lista = [];
                var data = api_res.body.response;
                var pais = data[0].country.name;
                for(var i=0; i<data.length ;i++){
                    lista.push({
                        '_id': data[i].league.id,
                        'liga': data[i].league.name,
                        'tipo_liga': data[i].league.type,
                        'logo': data[i].league.logo,
                        'pais': data[i].country.name,
                        'fecha_inicio': data[i].seasons.start,
                        'fecha_fin': data[i].seasons.end,
                        'estado': data[i].seasons.current
                    });
                }
                list.ligas = lista;
                
                (async () => {
                    res.json(await registrarLista(list, pais))
                  })();
            }
        });
        
    } catch (error) {
        console.log(error);
    }

});

router.get('/list', cors(), async (req, res) => {

    try {
        
        let pool = await sql.connect(config);
        let result = await pool.request().execute('ListarPaisLiga');
        res.json(result.recordsets[0]);   
        
    } catch (error) {
        console.log(error);
    }

});

async function registrarLista(list, pais){
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('PaisLiga', sql.VarChar(20), pais)
            .input('Ligas', sql.VarChar(8000), JSON.stringify(list))
            .execute('GuardarPaisLiga');
        return(result.recordsets[0]);
    } catch (error) {
        console.log(error);
    }
}

module.exports = router;