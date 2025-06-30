import React, { useState, useRef, useEffect } from 'react';

const MANTRAS = [
  {
    id: 1,
    name: 'Ом',
    sanskrit: 'ॐ',
    audio: '/audio/om.mp3'
  },
  {
    id: 2,
    name: 'Ом Дум Дургайе Намаха',
    sanskrit: 'ॐ दुं दुर्गायै नमः',
    audio: '/audio/om-dum-durgaye-namaha.mp3'
  }
];

export default function Japa() {
  const [isActive, setIsActive] = useState(false);
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' или 'exhale'
  const [count, setCount] = useState(0);
  const [recognizedCount, setRecognizedCount] = useState(0); // Счетчик распознанных мантр
  const [circleScale, setCircleScale] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState(null); // null, 'granted', 'denied'
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  // Запрос разрешения микрофона при загрузке компонента
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
        // Останавливаем поток, он нам пока не нужен
        stream.getTracks().forEach(track => track.stop());
        console.log('🎤 Разрешение микрофона получено');
      } catch (error) {
        setMicPermission('denied');
        console.error('❌ Разрешение микрофона отклонено:', error);
      }
    };

    requestMicPermission();
  }, []);

  // Инициализация распознавания речи
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; // Включаем промежуточные результаты
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log('🎤 Распознавание речи начато');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log('🎤 Распознавание речи завершено');
        
        // Автоматически перезапускаем распознавание пока практика активна
        if (isActive) {
          setTimeout(() => {
            if (recognitionRef.current && isActive) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Не удалось перезапустить распознавание:', e);
              }
            }
          }, 100);
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          console.log('🎤 Распознано:', transcript, 'Final:', event.results[i].isFinal);
          
          // Проверяем любые результаты (не только финальные)
          if (transcript.length > 0) {
            // Улучшенное распознавание мантр
            const mantraKeywords = ['ом', 'ум', 'аум', 'дум', 'дурга', 'намаха', 'намах'];
            const hasMantraWord = mantraKeywords.some(keyword => transcript.includes(keyword));
            
            if (hasMantraWord && event.results[i].isFinal) {
              setRecognizedCount(prev => prev + 1);
              console.log('✅ Мантра засчитана! Распознано:', transcript);
            }
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Ошибка распознавания речи:', event.error);
        setIsListening(false);
        
        // Перезапускаем при некритичных ошибках
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setTimeout(() => {
            if (recognitionRef.current && isActive && breathPhase === 'exhale') {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Не удалось перезапустить после ошибки:', e);
              }
            }
          }, 500);
        }
      };
    }
  };

  const breatheCycle = () => {
    // Вдох - 4 секунды
    setBreathPhase('inhale');
    setCircleScale(1.5);
    
    setTimeout(() => {
      // Выдох - 10 секунд + воспроизведение мантры
      setBreathPhase('exhale');
      setCircleScale(1);
      
      // Воспроизводим мантру на выдохе
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      setCount(prev => prev + 1);
    }, 4000);
  };

  const startPractice = () => {
    if (isActive) return;
    
    setIsActive(true);
    setCount(0);
    setRecognizedCount(0);
    
    // Инициализируем и запускаем распознавание речи
    initSpeechRecognition();
    
    // Запускаем микрофон сразу при старте практики
    if (recognitionRef.current && micPermission === 'granted') {
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          console.log('🎤 Микрофон запущен в начале практики');
        } catch (e) {
          console.log('Не удалось запустить микрофон:', e);
        }
      }, 500);
    }
    
    breatheCycle(); // Первый цикл
    
    intervalRef.current = setInterval(() => {
      breatheCycle();
    }, 14000); // 14 секунд на полный цикл (4 вдох + 10 выдох)
  };

  const stopPractice = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setCircleScale(1);
    setBreathPhase('inhale');
    
    // Останавливаем распознавание речи
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    const payload = { 
      type: 'japa', 
      totalCycles: count,
      recognizedMantras: recognizedCount,
      mantra: selectedMantra.name,
      time: Date.now() 
    };
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(payload));
    }
    
    console.log('📊 Результаты практики:', payload);
  };

  const playMantra = (mantra) => {
    if (audioRef.current) {
      audioRef.current.src = mantra.audio;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }
    };
  }, []);

  return (
    <div className="p-6 min-h-screen bg-amber-50 text-gray-800">
      <h2 className="text-3xl font-bold text-center mb-8 text-amber-700">Джапа-медитация</h2>
      
      {/* Уведомление о микрофоне */}
      {micPermission === 'denied' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">❌</div>
            <div className="text-sm text-red-700">
              <strong>Ошибка:</strong> Доступ к микрофону запрещен. 
              Разрешите доступ в настройках браузера для подсчета мантр.
            </div>
          </div>
        </div>
      )}
      
      {micPermission === 'granted' && !isActive && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-500 mr-3">✅</div>
            <div className="text-sm text-green-700">
              <strong>Готово:</strong> Микрофон подключен! 
              Мы будем засчитывать произнесенные вами мантры.
            </div>
          </div>
        </div>
      )}
      
      {micPermission === null && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-500 mr-3">🎤</div>
            <div className="text-sm text-blue-700">
              <strong>Запрос:</strong> Разрешите доступ к микрофону для подсчета мантр...
            </div>
          </div>
        </div>
      )}
      
      {/* Выбор мантры */}
      <div className="mb-8">
        <div 
          className="bg-amber-25 shadow-lg border border-amber-200 rounded-lg p-4 cursor-pointer hover:shadow-xl transition-all"
          style={{ backgroundColor: '#fffbeb' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-700">{selectedMantra.name}</div>
              <div className="text-2xl text-amber-700 mt-1">{selectedMantra.sanskrit}</div>
            </div>
            <svg 
              className={`w-6 h-6 transform transition-transform text-amber-400 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-2 shadow-lg border border-amber-200 rounded-lg overflow-hidden" style={{ backgroundColor: '#fffbeb' }}>
            {MANTRAS.map((mantra) => (
              <div 
                key={mantra.id}
                className={`p-4 cursor-pointer hover:bg-amber-100 flex justify-between items-center border-b border-amber-100 last:border-b-0 ${
                  selectedMantra.id === mantra.id ? 'bg-amber-100' : ''
                }`}
                onClick={() => {
                  setSelectedMantra(mantra);
                  setIsExpanded(false);
                }}
              >
                <div>
                  <div className="font-semibold text-gray-700">{mantra.name}</div>
                  <div className="text-xl text-amber-700 mt-1">{mantra.sanskrit}</div>
                </div>
                <button
                  className="p-2 bg-amber-200 hover:bg-amber-300 rounded-full transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    playMantra(mantra);
                  }}
                >
                  <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Дыхательный круг */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div 
            className={`w-48 h-48 rounded-full border-4 border-amber-500 flex items-center justify-center cursor-pointer transition-all ease-in-out ${
              isActive ? 'bg-amber-200 shadow-2xl' : 'shadow-lg'
            } ${breathPhase === 'inhale' ? 'duration-[4000ms]' : 'duration-[10000ms]'}`}
            style={{ 
              transform: `scale(${circleScale})`,
              backgroundColor: isActive ? '#fde68a' : '#fffbeb',
              boxShadow: isActive ? '0 0 40px rgba(245, 158, 11, 0.4)' : '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
            onClick={isActive ? stopPractice : startPractice}
          >
            <div className="text-center">
              {isActive ? (
                <div>
                  <div className="text-3xl font-bold mb-1 text-amber-700">{count}</div>
                  <div className="text-sm text-gray-500 mb-2">циклов</div>
                  <div className="text-2xl font-bold mb-1 text-green-600">{recognizedCount}</div>
                  <div className="text-sm text-gray-500 mb-2">мантр</div>
                  <div className="text-lg text-gray-600">
                    {breathPhase === 'inhale' ? 'Вдох' : 'Выдох'}
                  </div>
                  {isListening && (
                    <div className="text-xs text-red-500 mt-1">🎤 Слушаю...</div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-gray-700">Начать</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600 max-w-xs">
          {isActive ? (
            <p>
              Следуйте ритму дыхания. На выдохе произнесите мантру в микрофон 
              <br />
              <span className="text-green-600 font-semibold">
                Засчитано: {recognizedCount} из {count}
              </span>
            </p>
          ) : (
            <p>Нажмите на круг, чтобы начать дыхательную практику с мантрой. Мы будем засчитывать ваши повторения через микрофон!</p>
          )}
        </div>
      </div>

      {/* Статистика */}
      {(count > 0 || recognizedCount > 0) && (
        <div className="text-center shadow-lg border border-amber-200 rounded-lg p-4" style={{ backgroundColor: '#fffbeb' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-amber-700 mb-1">{count}</div>
              <div className="text-sm text-gray-600">Дыхательных циклов</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">{recognizedCount}</div>
              <div className="text-sm text-gray-600">Распознанных мантр</div>
            </div>
          </div>
          {recognizedCount > 0 && (
            <div className="mt-3 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-full">
              🎉 Эффективность: {Math.round((recognizedCount / count) * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Скрытый аудио элемент */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
}
