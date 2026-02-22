import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../services/supabase';
import { UserQuestion } from '../../types';
import { Button } from '../Button';

export const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<UserQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('user_questions').select('*').order('submitted_at', { ascending: false });
    if (data) setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta pregunta?')) {
      await supabaseAdmin.from('user_questions').delete().eq('id', id);
      fetchQuestions();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#DFE4EA] shadow-sm">
      <h2 className="text-xl font-bold text-[#2F3542] mb-6">Preguntas Recibidas</h2>
      
      {loading ? (
        <p className="text-[#747D8C]">Cargando preguntas...</p>
      ) : questions.length === 0 ? (
        <p className="text-[#747D8C]">No hay preguntas pendientes.</p>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="p-4 border border-[#DFE4EA] rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium text-[#2F3542] text-lg">{q.question}</p>
                  <p className="text-xs text-[#747D8C] mt-2">
                    Recibido el: {new Date(q.submitted_at).toLocaleDateString()} a las {new Date(q.submitted_at).toLocaleTimeString()}
                  </p>
                </div>
                <Button variant="danger" onClick={() => handleDelete(q.id)} className="shrink-0 text-sm">
                  Borrar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};