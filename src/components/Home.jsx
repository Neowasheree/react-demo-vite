import { useState, useEffect } from 'react';
import allowedStops from '../allowedStops';
import DepartureLog from './DepartureLog';
import { motion } from 'framer-motion';

const BASE_URL = 'https://www.mvg.de/api/bgw-pt/v3';

export default function Home() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState('INIT'); // 初始值设为特殊标识
  const [lines, setLines] = useState([]);
  const [recentStops, setRecentStops] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [lang, setLang] = useState('zh'); // 'zh' or 'en'

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    setRecentStops(JSON.parse(localStorage.getItem('recentStops') || '[]'));
    setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'));
  }, []);

  const t = (zh, en) => (lang === 'zh' ? zh : en);

  const saveStop = (name) => {
    const updated = [name, ...recentStops.filter((s) => s !== name)].slice(0, 5);
    setRecentStops(updated);
    localStorage.setItem('recentStops', JSON.stringify(updated));
  };

  const toggleFavorite = (name) => {
    const updated = favorites.includes(name)
      ? favorites.filter((s) => s !== name)
      : [name, ...favorites.filter((s) => s !== name)].slice(0, 10);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const removeFavorite = (name) => {
    const updated = favorites.filter((s) => s !== name);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const clearRecentStops = () => {
    setRecentStops([]);
    localStorage.removeItem('recentStops');
  };

  const queryDepartures = async (customTerm) => {
    const termRaw = customTerm ?? input;
    const term = typeof termRaw === 'string' ? termRaw.trim() : '';
    if (!term) {
      alert(t('请输入站点名称', 'Please enter a stop name'));
      return;
    }

    setLogs(t('查询中…', 'Loading…'));
    setLines([]);

    const candidates = Object.keys(allowedStops).filter((name) =>
      name.toLowerCase().includes(term.toLowerCase())
    );

    if (candidates.length === 0) {
      setLogs(t(`未在列表中找到“${term}”`, `No match found for "${term}"`));
      return;
    }

    let stopName = candidates[0];
    if (candidates.length > 1) {
      const choice = prompt(
        t('匹配到多个站点，请从下面复制完整名称粘贴：', 'Multiple matches found. Please choose:') +
          '\n' +
          candidates.join('\n')
      );
      if (!choice || !allowedStops[choice]) {
        setLogs(t('未选择有效站点', 'Invalid selection'));
        return;
      }
      stopName = choice;
    }

    const stopId = allowedStops[stopName];
    const url = `${BASE_URL}/departures?globalId=${encodeURIComponent(
      stopId
    )}&limit=10&transportTypes=TRAM,BUS`;

    let data;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      data = await res.json();
    } catch (e) {
      console.error(e);
      setLogs(t('网络请求失败', 'Network error'));
      return;
    }

    const now = Date.now();
    if (!Array.isArray(data) || data.length === 0) {
      setLogs(`${stopName} ${t('暂无未来班次', 'No future departures')}`);
      return;
    }

    const formattedLines = data.map((d) => {
      const departMs = d.realtimeDepartureTime;
      const mins = Math.round((departMs - now) / 60000);
      const timeStr = new Date(departMs).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const status = d.cancelled
        ? t('❌ 已取消', '❌ Cancelled')
        : d.delayInMinutes > 0
        ? t(`🚨 延误 +${d.delayInMinutes}min`, `🚨 Delayed +${d.delayInMinutes}min`)
        : t('✅ 准点', '✅ On time');

      return {
        line: `${d.transportType}${d.label}`,
        destination: d.destination,
        time: timeStr,
        mins,
        status,
      };
    });

    setLines(formattedLines);
    setLogs('');
    setInput('');
    saveStop(stopName);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${stopName} ${t('班次', 'Departures')}`, {
        body: formattedLines.map((l) => `${l.line} → ${l.destination}: ${l.time} (${l.status})`).join('\n'),
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-700">🚋 Tram Departures</h1>
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          {lang === 'zh' ? '🌐 English' : '🌐 中文'}
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {t('实时查看慕尼黑轻轨 & 公交车次', 'Live departures for Munich Tram & Bus')}
      </p>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('输入站点（如 Borstei）', 'Enter stop (e.g., Borstei)')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => queryDepartures()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg shadow"
        >
          🔍 {t('查询', 'Search')}
        </button>
      </div>

      {(favorites.length > 0 || recentStops.length > 0) && (
        <div className="mb-6">
          {favorites.length > 0 && (
            <div className="mb-3">
              <h2 className="font-semibold mb-2">⭐ {t('常用站点', 'Favorites')}</h2>
              <div className="flex flex-wrap gap-2">
                {favorites.map((name) => (
                  <div key={name} className="flex gap-1 items-center">
                    <button
                      className="px-3 py-1 bg-yellow-100 rounded-full shadow-sm"
                      onClick={() => {
                        setInput(name);
                        queryDepartures(name);
                      }}
                    >
                      {name}
                    </button>
                    <button
                      onClick={() => removeFavorite(name)}
                      className="text-red-400 text-sm"
                      title={t('移除收藏', 'Remove')}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {recentStops.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">🕘 {t('最近使用', 'Recent')}</h2>
                <button
                  onClick={clearRecentStops}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  {t('清空', 'Clear')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentStops.map((name) => (
                  <div key={name} className="flex gap-1 items-center">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded-full shadow-sm"
                      onClick={() => {
                        setInput(name);
                        queryDepartures(name);
                      }}
                    >
                      {name}
                    </button>
                    <button
                      onClick={() => toggleFavorite(name)}
                      className="text-yellow-500"
                    >
                      {favorites.includes(name) ? '★' : '☆'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {logs && (
        <div className="mb-6 text-center text-blue-600 whitespace-pre-line">
          {logs === 'INIT'
            ? lang === 'zh' ? '请搜索站点' : 'Please search a stop'
            : logs}
        </div>
      )}

      <DepartureLog lines={lines} lang={lang} />
    </div>
  );
}
