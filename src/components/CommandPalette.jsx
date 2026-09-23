import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  User,
  Activity,
  LineChart,
  FlaskConical,
  FileText,
  Info,
  Radio,
  Volume2,
  VolumeX,
  Droplets,
  Printer,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { useHealthBand, SIMULATOR_PRESETS } from '../context/HealthBandContext.jsx';
import { audioService } from '../services/audioService.js';

export default function CommandPalette({ isOpen, setIsOpen, setActiveTab }) {
  const {
    patients,
    setSelectedPatientId,
    mode,
    setMode,
    applyPreset,
    syncNow,
    liveState,
    isSoundEnabled,
    toggleSound
  } = useHealthBand();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Global keyboard listener for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Build items array
  const patientItems = patients.map((p) => ({
    id: `patient-${p.id}`,
    category: 'Пациенты & Койки',
    title: `${p.name}`,
    subtitle: `${p.ward}, ${p.bed} • ${p.diagnosis} • Т: ${p.tempWound}°C`,
    icon: User,
    badge: p.status === 'alert' ? 'ТРЕВОГА' : p.status === 'warning' ? 'КОНТРОЛЬ' : 'НОРМА',
    badgeType: p.status,
    action: () => {
      setSelectedPatientId(p.id);
      setActiveTab('ward');
      setIsOpen(false);
    }
  }));

  const navigationItems = [
    {
      id: 'nav-ward',
      category: 'Навигация',
      title: 'Клинический пост (Матрица коек)',
      subtitle: 'Общий мониторинг пациентов отделения',
      icon: Activity,
      shortcut: 'G W',
      action: () => {
        setActiveTab('ward');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-telemetry',
      category: 'Навигация',
      title: 'Интерактивная телеметрия',
      subtitle: 'Детальные графики датчиков и 3-точечная верификация',
      icon: LineChart,
      shortcut: 'G T',
      action: () => {
        setActiveTab('telemetry');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-simulator',
      category: 'Навигация',
      title: 'Demo Lab (Симулятор для жюри)',
      subtitle: 'Стресс-тестирование алгоритмов и калибровка параметров',
      icon: FlaskConical,
      shortcut: 'G S',
      action: () => {
        setActiveTab('simulator');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-report',
      category: 'Навигация',
      title: 'Клинический протокол (Форма 004/у)',
      subtitle: 'Лист динамического наблюдения за раневым процессом для печати',
      icon: FileText,
      shortcut: 'G P',
      action: () => {
        setActiveTab('report');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-about',
      category: 'Навигация',
      title: 'Досье комплекса & FAQ',
      subtitle: 'Научно-клиническое обоснование, датчики и сравнение со Стэнфордом',
      icon: Info,
      shortcut: 'G A',
      action: () => {
        setActiveTab('about');
        setIsOpen(false);
      }
    }
  ];

  const actionItems = [
    {
      id: 'act-sim-infection',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: 'Включить сценарий: Бактериальное воспаление',
      subtitle: 'Т раны 38.6°C, ΔT +1.6°C, 3 цикла роста -> тревога',
      icon: Flame,
      badge: 'Сценарий 1',
      action: () => {
        setMode('simulator');
        applyPreset('infection');
        setActiveTab('ward');
        audioService.unlock();
        audioService.playAlarm();
        setIsOpen(false);
      }
    },
    {
      id: 'act-sim-normal',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: 'Включить сценарий: Нормальное заживление',
      subtitle: 'Т раны 36.7°C, чистая повязка, нормальный статус',
      icon: CheckCircle2,
      badge: 'Сценарий 2',
      action: () => {
        setMode('simulator');
        applyPreset('normal');
        setActiveTab('ward');
        audioService.unlock();
        audioService.playConfirmBlip();
        setIsOpen(false);
      }
    },
    {
      id: 'act-sim-exudate',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: 'Включить сценарий: Критическое промокание повязки',
      subtitle: 'Влажность 92% > 80% порога -> сигнал о замене повязки',
      icon: Droplets,
      badge: 'Сценарий 3',
      action: () => {
        setMode('simulator');
        applyPreset('exudate');
        setActiveTab('ward');
        audioService.unlock();
        audioService.playAlarm();
        setIsOpen(false);
      }
    },
    {
      id: 'act-sim-blanket',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: 'Включить сценарий: Фильтрация одеяла (Ложная тревога)',
      subtitle: 'Т тела и раны растут синфазно (ΔT 0.2°C) -> тревога блокируется',
      icon: ShieldAlert,
      badge: 'Сценарий 4',
      action: () => {
        setMode('simulator');
        applyPreset('blanket');
        setActiveTab('ward');
        audioService.unlock();
        audioService.playConfirmBlip();
        setIsOpen(false);
      }
    },
    {
      id: 'act-sync-sheets',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: 'Принудительная синхронизация Google Sheets',
      subtitle: 'Загрузить свежие телеметрические пакеты из облачной таблицы',
      icon: Radio,
      badge: liveState.totalRows > 0 ? `${liveState.totalRows} строк` : 'CSV Шлюз',
      action: () => {
        setMode('live');
        syncNow();
        audioService.unlock();
        audioService.playConfirmBlip();
        setIsOpen(false);
      }
    },
    {
      id: 'act-print-report',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: 'Печать клинического протокола A4',
      subtitle: 'Сформировать официальный врачебный лист Form 004/y',
      icon: Printer,
      shortcut: '⌘ P',
      action: () => {
        setActiveTab('report');
        setIsOpen(false);
        setTimeout(() => window.print(), 300);
      }
    },
    {
      id: 'act-toggle-sound',
      category: 'Быстрые действия & Сценарии Demo Lab',
      title: isSoundEnabled ? 'Отключить звуковые оповещения' : 'Включить звуковые оповещения',
      subtitle: isSoundEnabled ? 'Перевести зуммер в беззвучный режим' : 'Включить акустический монитор Web Audio',
      icon: isSoundEnabled ? VolumeX : Volume2,
      badge: isSoundEnabled ? 'ВКЛ' : 'ВЫКЛ',
      action: () => {
        toggleSound();
        setIsOpen(false);
      }
    }
  ];

  const allItems = [...patientItems, ...navigationItems, ...actionItems];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Handle arrow navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  // Group filtered items by category
  const categories = Array.from(new Set(filteredItems.map((item) => item.category)));

  if (!isOpen) return null;

  let flatCounter = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#0d1017] border border-[#1c212d] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1c212d] bg-[#090a0f]">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по пациентам, палатам, сценариям или действиям..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-mono px-1.5 py-0.5 rounded bg-zinc-800"
            >
              Очистить
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] text-zinc-500 font-mono bg-zinc-850 px-1.5 py-0.5 rounded border border-zinc-800">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 divide-y divide-zinc-900/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            categories.map((category) => {
              const catItems = filteredItems.filter((i) => i.category === category);
              return (
                <div key={category} className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {catItems.map((item) => {
                      flatCounter++;
                      const isSelected = flatCounter === selectedIndex;
                      const Icon = item.icon;
                      const thisIndex = flatCounter;

                      return (
                        <div
                          key={item.id}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(thisIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-zinc-800/80 text-white'
                              : 'text-zinc-300 hover:bg-zinc-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                                isSelected
                                  ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-medium text-zinc-100 flex items-center gap-2">
                                <span>{item.title}</span>
                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                      item.badgeType === 'alert'
                                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                        : item.badgeType === 'warning'
                                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                        : item.badgeType === 'normal'
                                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                        : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 truncate">{item.subtitle}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {item.shortcut && (
                              <kbd className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-[#1c212d] bg-[#090a0f] flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-zinc-850 px-1 rounded border border-zinc-800">↑↓</kbd> Навигация
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-zinc-850 px-1 rounded border border-zinc-800">↵</kbd> Выбрать
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-zinc-850 px-1 rounded border border-zinc-800">esc</kbd> Закрыть
            </span>
          </div>
          <div className="font-mono text-[10px] text-zinc-600">
            HealthBand Telemetry Command Bar
          </div>
        </div>
      </div>
    </div>
  );
}
