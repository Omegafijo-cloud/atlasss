
import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/supabase';
import { DashboardStats } from '../../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4757]"></div></div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DFE4EA] shadow-sm">
          <p className="text-[#747D8C] text-sm font-medium">Búsquedas Totales</p>
          <p className="text-3xl font-bold text-[#2F3542] mt-1">{stats.totalSearches}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DFE4EA] shadow-sm">
          <p className="text-[#747D8C] text-sm font-medium">Búsquedas Sin Éxito</p>
          <p className="text-3xl font-bold text-[#FF4757] mt-1">{stats.failedSearches}</p>
          <p className="text-xs text-[#747D8C] mt-1">Usuarios que no encontraron info</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DFE4EA] shadow-sm">
          <p className="text-[#747D8C] text-sm font-medium">Preguntas Pendientes</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{stats.pendingQuestions}</p>
          <p className="text-xs text-[#747D8C] mt-1">Sugerencias de usuarios</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DFE4EA] shadow-sm">
          <p className="text-[#747D8C] text-sm font-medium">Artículos Publicados</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalContent}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Content Opportunities - CRITICAL FOR ADMIN */}
        <div className="bg-white p-6 rounded-xl border border-[#DFE4EA] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#2F3542]">Oportunidades de Contenido</h3>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">Atención Requerida</span>
          </div>
          <p className="text-sm text-[#747D8C] mb-4">Lo que los usuarios buscan pero no encuentran en la base de datos.</p>
          
          {stats.missingContentOpportunities.length > 0 ? (
            <div className="space-y-3">
              {stats.missingContentOpportunities.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="font-medium text-[#2F3542]">"{item.query}"</span>
                  <span className="font-bold text-[#FF4757]">{item.count} búsquedas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 bg-green-50 p-3 rounded-lg text-sm text-center">¡Excelente! No hay búsquedas fallidas recientes.</p>
          )}
        </div>

        {/* Top Searches */}
        <div className="bg-white p-6 rounded-xl border border-[#DFE4EA] shadow-sm">
          <h3 className="text-lg font-bold text-[#2F3542] mb-4">Lo Más Buscado</h3>
          <div className="space-y-3">
             {stats.topSearches.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-b border-[#DFE4EA] last:border-0">
                  <span className="text-[#2F3542]">{item.query}</span>
                  <span className="text-[#747D8C] text-sm">{item.count} veces</span>
                </div>
              ))}
              {stats.topSearches.length === 0 && <p className="text-sm text-[#747D8C]">No hay datos suficientes aún.</p>}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-xl border border-[#DFE4EA] shadow-sm">
        <h3 className="text-lg font-bold text-[#2F3542] mb-4">Distribución de Categorías</h3>
        <div className="flex flex-wrap gap-4">
          {stats.categoryDistribution.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg min-w-[120px]">
              <span className="text-2xl font-bold text-[#2F3542]">{cat.count}</span>
              <span className="text-xs text-[#747D8C] uppercase tracking-wider mt-1">{cat.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Logs History */}
      <div className="bg-white rounded-xl border border-[#DFE4EA] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#DFE4EA]">
          <h3 className="text-lg font-bold text-[#2F3542]">Historial de Búsquedas Recientes</h3>
          <p className="text-sm text-[#747D8C]">Registro cronológico de las consultas realizadas por los usuarios.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[#747D8C] text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Fecha y Hora</th>
                <th className="px-6 py-3">Consulta</th>
                <th className="px-6 py-3 text-center">Resultados</th>
                <th className="px-6 py-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE4EA]">
              {stats.searchLogs.length > 0 ? (
                stats.searchLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#747D8C] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#2F3542]">
                      {log.query}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-[#747D8C]">
                      {log.results_count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.results_count > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          Éxito
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          Fallido
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#747D8C] italic">
                    No hay registros de búsqueda disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};