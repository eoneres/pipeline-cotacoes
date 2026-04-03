const axios = require('axios');
const logger = require('../config/logger');

class ApiService {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || 'https://economia.awesomeapi.com.br/json';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Pipeline-Cotacoes/1.0'
            }
        });

        this.client.interceptors.request.use(
            (config) => {
                logger.debug(`🌐 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
                return config;
            },
            (error) => {
                logger.error('❌ API Request Error:', error.message);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                logger.debug(`✅ API Response: ${response.status} - ${response.config.url}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    logger.error(`❌ API Response Error: ${error.response.status} - ${error.message}`);
                } else {
                    logger.error(`❌ API Error: ${error.message}`);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Busca cotações atuais - formato correto é com hífen (ex: USD-BRL)
     */
    async getCotacoesAtuais(moedas) {
        try {
            // Manter o formato original com hífen (ex: USD-BRL)
            const moedasStr = Array.isArray(moedas) ? moedas.join(',') : moedas;
            const url = `/last/${moedasStr}`;
            logger.debug(`Chamando API: ${url}`);

            const response = await this.client.get(url);
            logger.debug(`Resposta recebida:`, Object.keys(response.data));

            return response.data;
        } catch (error) {
            logger.error(`Erro ao buscar cotações atuais: ${error.message}`);
            throw error;
        }
    }

    /**
     * Busca histórico de cotações
     */
    async getHistoricoCotacoes(moeda, dias = 30) {
        try {
            // Formato correto com hífen
            const response = await this.client.get(`/daily/${moeda}/${dias}`);
            return response.data;
        } catch (error) {
            logger.error(`Erro ao buscar histórico: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ApiService();