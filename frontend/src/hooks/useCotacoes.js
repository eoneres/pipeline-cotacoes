import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

// Buscar cotações atuais
export const useCotacoesAtuais = (moeda) => {
    return useQuery(
        ['cotacao', moeda],
        async () => {
            const { data } = await api.get(`/cotacoes/atuais/${moeda}`);
            return data.data;
        },
        {
            enabled: !!moeda,
            refetchInterval: 60000, // Atualiza a cada 1 minuto
        }
    );
};

// Buscar histórico
export const useHistorico = (moeda, dias = 30) => {
    return useQuery(
        ['historico', moeda, dias],
        async () => {
            const { data } = await api.get(`/cotacoes/historico/${moeda}?dias=${dias}`);
            return data.data;
        },
        {
            enabled: !!moeda,
        }
    );
};

// Buscar estatísticas
export const useEstatisticas = (moeda, dias = 30) => {
    return useQuery(
        ['estatisticas', moeda, dias],
        async () => {
            const { data } = await api.get(`/cotacoes/estatisticas/${moeda}?dias=${dias}`);
            return data.data;
        },
        {
            enabled: !!moeda,
        }
    );
};

// Buscar moedas disponíveis
export const useMoedas = () => {
    return useQuery(
        'moedas',
        async () => {
            const { data } = await api.get('/cotacoes/moedas');
            return data.data;
        }
    );
};

// Buscar resumo do dashboard
export const useDashboardResumo = () => {
    return useQuery(
        'dashboard-resumo',
        async () => {
            const { data } = await api.get('/dashboard/resumo');
            return data.data;
        },
        {
            refetchInterval: 300000, // Atualiza a cada 5 minutos
        }
    );
};

// Buscar evolução
export const useEvolucao = (moeda, dias = 7) => {
    return useQuery(
        ['evolucao', moeda, dias],
        async () => {
            const { data } = await api.get(`/dashboard/evolucao?moeda=${moeda}&dias=${dias}`);
            return data.data;
        },
        {
            enabled: !!moeda,
        }
    );
};

// Disparar coleta manual
export const useColetaManual = () => {
    const queryClient = useQueryClient();

    return useMutation(
        async (moedas) => {
            const { data } = await api.post('/coletas/manual', { moedas });
            return data;
        },
        {
            onSuccess: () => {
                toast.success('Coleta manual disparada com sucesso!');
                queryClient.invalidateQueries('dashboard-resumo');
                queryClient.invalidateQueries('moedas');
            },
            onError: (error) => {
                toast.error('Erro ao disparar coleta manual');
            },
        }
    );
};