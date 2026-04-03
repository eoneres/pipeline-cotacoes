#!/usr/bin/env python3
import sys
import json
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

def main():
    try:
        # Receber dados do Node.js
        input_data = json.loads(sys.argv[1])
        moeda = input_data['moeda']
        dados = input_data['dados']
        dias_previsao = input_data.get('dias_previsao', 30)
        
        # Preparar DataFrame para o Prophet
        df = pd.DataFrame(dados)
        df = df.rename(columns={'timestamp': 'ds', 'bid': 'y'})
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Criar e treinar modelo
        modelo = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            holidays_prior_scale=10.0,
            interval_width=0.95
        )
        
        # Adicionar feriados brasileiros e americanos
        feriados_br = [
            {'holiday': 'Carnaval', 'ds': '2024-02-13', 'lower_window': -2, 'upper_window': 1},
            {'holiday': 'Tiradentes', 'ds': '2024-04-21', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Dia do Trabalho', 'ds': '2024-05-01', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Independência', 'ds': '2024-09-07', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Nossa Senhora', 'ds': '2024-10-12', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Finados', 'ds': '2024-11-02', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Proclamação', 'ds': '2024-11-15', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Natal', 'ds': '2024-12-25', 'lower_window': 0, 'upper_window': 1},
            {'holiday': 'Ano Novo', 'ds': '2024-01-01', 'lower_window': 0, 'upper_window': 1},
            {'holiday': 'Réveillon', 'ds': '2024-12-31', 'lower_window': 0, 'upper_window': 0}
        ]
        
        feriados_us = [
            {'holiday': 'Ano Novo', 'ds': '2024-01-01', 'lower_window': 0, 'upper_window': 1},
            {'holiday': 'Dia de MLK', 'ds': '2024-01-15', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Dia do Presidente', 'ds': '2024-02-19', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Memorial Day', 'ds': '2024-05-27', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Independência US', 'ds': '2024-07-04', 'lower_window': 0, 'upper_window': 1},
            {'holiday': 'Trabalho US', 'ds': '2024-09-02', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'Ação de Graças', 'ds': '2024-11-28', 'lower_window': 0, 'upper_window': 1},
            {'holiday': 'Natal US', 'ds': '2024-12-25', 'lower_window': 0, 'upper_window': 1}
        ]
        
        # Adicionar feriados ao modelo
        for feriado in feriados_br + feriados_us:
            feriado['ds'] = pd.to_datetime(feriado['ds'])
        
        df_feriados = pd.DataFrame(feriados_br + feriados_us)
        modelo.add_country_holidays(country_name='BR')
        modelo.add_country_holidays(country_name='US')
        
        # Treinar modelo
        modelo.fit(df)
        
        # Criar DataFrame para previsões futuras
        futuro = modelo.make_future_dataframe(periods=dias_previsao, include_history=True)
        previsao = modelo.predict(futuro)
        
        # Extrair componentes da previsão
        componentes = {
            'tendencia': previsao[['ds', 'trend']].tail(dias_previsao).to_dict('records'),
            'sazonalidade_semanal': previsao[['ds', 'weekly']].tail(dias_previsao).to_dict('records'),
            'sazonalidade_anual': previsao[['ds', 'yearly']].tail(dias_previsao).to_dict('records'),
            'feriados': previsao[['ds', 'holidays']].tail(dias_previsao).to_dict('records')
        }
        
        # Preparar resultado
        resultado = {
            'success': True,
            'moeda': moeda,
            'dias_previsao': dias_previsao,
            'previsoes': [],
            'componentes': componentes,
            'metricas': {
                'mse': ((previsao['yhat'].values[:len(df)] - df['y'].values) ** 2).mean(),
                'mae': abs(previsao['yhat'].values[:len(df)] - df['y'].values).mean(),
                'mape': (abs((previsao['yhat'].values[:len(df)] - df['y'].values) / df['y'].values) * 100).mean()
            }
        }
        
        # Adicionar previsões
        for i, row in previsao.tail(dias_previsao).iterrows():
            resultado['previsoes'].append({
                'data': row['ds'].isoformat(),
                'valor_previsto': round(row['yhat'], 4),
                'intervalo_inferior': round(row['yhat_lower'], 4),
                'intervalo_superior': round(row['yhat_upper'], 4),
                'tendencia': round(row['trend'], 4),
                'sazonalidade_semanal': round(row['weekly'], 4),
                'sazonalidade_anual': round(row['yearly'], 4),
                'impacto_feriados': round(row['holidays'], 4)
            })
        
        # Adicionar análise de componentes
        tendencia_atual = previsao['trend'].iloc[-1]
        tendencia_anterior = previsao['trend'].iloc[-dias_previsao-1] if len(previsao) > dias_previsao else previsao['trend'].iloc[0]
        inclinacao_tendencia = (tendencia_atual - tendencia_anterior) / dias_previsao
        
        resultado['analise'] = {
            'tendencia': 'alta' if inclinacao_tendencia > 0.001 else 'baixa' if inclinacao_tendencia < -0.001 else 'estavel',
            'inclinacao_tendencia': round(inclinacao_tendencia, 6),
            'sazonalidade_dominante': 'semanal' if abs(previsao['weekly'].iloc[-1]) > abs(previsao['yearly'].iloc[-1]) else 'anual',
            'impacto_feriados_proximo': round(previsao['holidays'].iloc[-1], 4),
            'confianca_modelo': round(100 - resultado['metricas']['mape'], 1) if resultado['metricas']['mape'] < 100 else 50
        }
        
        print(json.dumps(resultado))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    main()